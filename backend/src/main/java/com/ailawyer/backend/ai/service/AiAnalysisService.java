package com.ailawyer.backend.ai.service;

import com.ailawyer.backend.ai.dto.AnalysisResponseDto;
import dev.langchain4j.data.image.Image;
import dev.langchain4j.service.AiServices;
import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

@Slf4j
@Service
public class AiAnalysisService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    private final AnalysisContextManager contextManager;
    private AiLegalAssistant groqAssistant;
    private AiLegalAssistant groqVisionAssistant;

    public AiAnalysisService(AnalysisContextManager contextManager) {
        this.contextManager = contextManager;
    }

    @PostConstruct
    public void init() {
        if (groqApiKey != null && !groqApiKey.isEmpty()) {
            initGroq();
        }
    }

    private void initGroq() {
        try {
            log.info("Groq 모델 초기화 중... URL: {}", groqApiUrl);
            
            // 1. 텍스트 분석용 고성능 모델 (Llama 3.3 70B)
            dev.langchain4j.model.openai.OpenAiChatModel textModel = dev.langchain4j.model.openai.OpenAiChatModel.builder()
                    .apiKey(groqApiKey)
                    .baseUrl(groqApiUrl)
                    .modelName("llama-3.3-70b-versatile")
                    .logRequests(true)
                    .logResponses(true)
                    .maxTokens(2048)
                    .build();

            this.groqAssistant = AiServices.builder(AiLegalAssistant.class)
                    .chatLanguageModel(textModel)
                    .build();

            // 2. 이미지(Vision) 분석 전용 모델 (Llama 4 Scout)
            dev.langchain4j.model.openai.OpenAiChatModel visionModel = dev.langchain4j.model.openai.OpenAiChatModel.builder()
                    .apiKey(groqApiKey)
                    .baseUrl(groqApiUrl)
                    .modelName("meta-llama/llama-4-scout-17b-16e-instruct") 
                    .logRequests(true)
                    .logResponses(true)
                    .maxTokens(800) // 토큰 한도 대폭 하향 (안정성 최우선)
                    .build();

            this.groqVisionAssistant = AiServices.builder(AiLegalAssistant.class)
                    .chatLanguageModel(visionModel)
                    .build();

            log.info("Groq 메인 및 Vision 모델 초기화 완료");
        } catch (Exception e) {
            log.error("Groq 모델 초기화 실패: {}", e.getMessage());
        }
    }

    public AnalysisResponseDto analyze(String extractedText, String categoryList) {
        log.info("Groq(텍스트 전문 모델) 분석 시작... 카테고리 후보: {}", categoryList);
        try {
            if (groqAssistant == null) {
                log.error("Groq Assistant가 초기화되지 않았습니다.");
                throw new IllegalStateException("Groq 서비스 초기화 실패");
            }
            AnalysisResponseDto response = groqAssistant.analyzeContract(extractedText, categoryList);
            log.info("Groq 분석 완료");
            return response;
        } catch (Exception e) {
            log.error("Groq 분석 중 오류: {}", e.getMessage());
            throw new RuntimeException("AI 분석 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    public AnalysisResponseDto analyzeImage(byte[] imageBytes, String mimeType, String categoryList) {
        log.info("Groq(Vision 모델) 이미지 분석 시작... 카테고리 후보: {}", categoryList);
        try {
            if (groqVisionAssistant == null) {
                log.error("Groq Vision Assistant가 초기화되지 않았습니다.");
                throw new IllegalStateException("Groq Vision 서비스 초기화 실패");
            }

            // 고해상도 이미지는 Groq 페이로드 제한(4MB)을 넘을 수 있어 압축 수행
            byte[] compressedBytes = compressImage(imageBytes);
            log.info("이미지 압축 완료");

            Image image = Image.builder()
                    .base64Data(Base64.getEncoder().encodeToString(compressedBytes))
                    .mimeType(mimeType)
                    .build();

            AnalysisResponseDto response = groqVisionAssistant.analyzeContractImage(image, categoryList);
            log.info("Groq Vision 분석 완료");
            return response;
        } catch (Exception e) {
            log.error("Groq 이미지 분석 중 오류: {}", e.getMessage());
            throw new RuntimeException("이미지 분석 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    private byte[] compressImage(byte[] imageBytes) {
        // 모든 이미지에 대해 가독성을 해치지 않는 선에서 최대 압축 수행
        try {
            ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes);
            BufferedImage originalImage = ImageIO.read(bais);
            
            if (originalImage == null) return imageBytes;

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Thumbnails.of(originalImage)
                    .size(1024, 1024) // 해상도 1024로 제한 (Groq 토큰 소모량 감소)
                    .outputFormat("jpg")
                    .outputQuality(0.6) // 품질 60% (용량 대폭 감소)
                    .toOutputStream(baos);
            
            byte[] result = baos.toByteArray();
            // 압축 결과가 더 크면 원본 반환 (드문 경우)
            return result.length < imageBytes.length ? result : imageBytes;
        } catch (IOException e) {
            log.warn("이미지 압축 중 오류 발생, 원본 사용: {}", e.getMessage());
            return imageBytes;
        }
    }

    public String ask(String question) {
        String context = contextManager.getContext("default");
        log.info("Groq Q&A 시작... 질문: {}", question);
        try {
            if (groqAssistant == null) {
                return "Groq 모델이 준비되지 않았습니다.";
            }
            return groqAssistant.answerLegalQuestion(context, question);
        } catch (Exception e) {
            log.error("Groq 답변 생성 중 오류 발생: {}", e.getMessage(), e);
            return "답변 생성 중 오류가 발생했습니다: " + e.getMessage();
        }
    }
}
