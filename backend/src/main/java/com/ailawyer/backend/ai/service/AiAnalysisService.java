package com.ailawyer.backend.ai.service;

import com.ailawyer.backend.ai.dto.AnalysisResponseDto;
import dev.langchain4j.data.image.Image;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.service.AiServices;
import jakarta.annotation.PostConstruct;
import java.util.Base64;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AiAnalysisService {

    @Value("${google.ai.api.key}")
    private String geminiApiKey;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1}")
    private String groqApiUrl;

    private final AnalysisContextManager contextManager;
    private AiLegalAssistant geminiAssistant;
    private AiLegalAssistant geminiVisionAssistant;
    private AiLegalAssistant groqAssistant;

    public AiAnalysisService(AnalysisContextManager contextManager) {
        this.contextManager = contextManager;
    }

    @PostConstruct
    public void init() {
        if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
            initGemini();
        }
        if (groqApiKey != null && !groqApiKey.isEmpty()) {
            initGroq();
        }
    }

    private void initGemini() {
        try {
            log.info("Google Gemini 모델 초기화 중...");
            
            // 상세 분석용 (Gemini 1.5 Pro)
            this.geminiAssistant = AiServices.builder(AiLegalAssistant.class)
                    .chatLanguageModel(GoogleAiGeminiChatModel.builder()
                            .apiKey(geminiApiKey)
                            .modelName("gemini-2.5-pro")
                            .build())
                    .build();

            // 비전 분석용 (Gemini 1.5 Flash)
            this.geminiVisionAssistant = AiServices.builder(AiLegalAssistant.class)
                    .chatLanguageModel(GoogleAiGeminiChatModel.builder()
                            .apiKey(geminiApiKey)
                            .modelName("gemini-2.5-flash")
                            .build())
                    .build();

            log.info("Gemini 모델 초기화 완료 (상세 분석용)");
        } catch (Exception e) {
            log.error("Gemini 초기화 실패: {}", e.getMessage());
        }
    }

    private void initGroq() {
        try {
            log.info("Groq 모델 초기화 중...");
            
            dev.langchain4j.model.openai.OpenAiChatModel groqModel = dev.langchain4j.model.openai.OpenAiChatModel.builder()
                    .apiKey(groqApiKey)
                    .baseUrl(groqApiUrl)
                    .modelName("llama-3.3-70b-versatile")
                    .maxTokens(1024)
                    .build();

            this.groqAssistant = AiServices.builder(AiLegalAssistant.class)
                    .chatLanguageModel(groqModel)
                    .build();

            log.info("Groq 모델 초기화 완료 (심플 분석용)");
        } catch (Exception e) {
            log.error("Groq 초기화 실패: {}", e.getMessage());
        }
    }

    public AnalysisResponseDto analyze(String extractedText, String categoryList, String mode) {
        boolean isDetailed = "detailed".equalsIgnoreCase(mode);
        log.info("AI 분석 시작 | 모드: {} | 엔진: {}", mode, isDetailed ? "Gemini" : "Groq");
        
        try {
            AiLegalAssistant assistant = (isDetailed) ? geminiAssistant : groqAssistant;
            if (assistant == null) assistant = (geminiAssistant != null) ? geminiAssistant : groqAssistant;
            
            if (assistant == null) throw new IllegalStateException("사용 가능한 AI 서비스가 없습니다.");
            
            AnalysisResponseDto response = assistant.analyzeContract(extractedText, categoryList);
            log.info("AI 텍스트 분석 완료");
            return response;
        } catch (Exception e) {
            log.error("AI 분석 중 오류: {}", e.getMessage());
            throw new RuntimeException("AI 분석 중 오류가 발생했습니다.", e);
        }
    }

    public AnalysisResponseDto analyzeImage(byte[] imageBytes, String mimeType, String categoryList, String mode) {
        boolean isDetailed = "detailed".equalsIgnoreCase(mode);
        log.info("AI 이미지 분석 시작 | 모드: {} | 엔진: {}", mode, isDetailed ? "Gemini Vision" : "Groq");
        
        try {
            // Groq는 비전 성능이 낮으므로 이미지는 가급적 Gemini(상세)로 유도하나, 모드에 따라 선택
            AiLegalAssistant assistant = (isDetailed) ? geminiVisionAssistant : groqAssistant;
            if (assistant == null) assistant = geminiVisionAssistant;

            if (assistant == null) throw new IllegalStateException("사용 가능한 비전 서비스가 없습니다.");

            Image image = Image.builder()
                    .base64Data(Base64.getEncoder().encodeToString(imageBytes))
                    .mimeType(mimeType)
                    .build();

            AnalysisResponseDto response = assistant.analyzeContractImage(image, categoryList);
            log.info("AI 이미지 분석 완료");
            return response;
        } catch (Exception e) {
            log.error("AI 이미지 분석 중 오류: {}", e.getMessage());
            throw new RuntimeException("이미지 분석 중 오류가 발생했습니다.", e);
        }
    }

    public String ask(String question) {
        String context = contextManager.getContext("default");
        log.info("AI 질의응답 시작... 질문: {}", question);
        try {
            if (geminiAssistant == null) {
                return "AI 모델이 준비되지 않았습니다.";
            }
            return geminiAssistant.answerLegalQuestion(context, question);
        } catch (Exception e) {
            log.error("AI 답변 생성 중 오류 발생: {}", e.getMessage(), e);
            return "답변 생성 중 오류가 발생했습니다: " + e.getMessage();
        }
    }
}

