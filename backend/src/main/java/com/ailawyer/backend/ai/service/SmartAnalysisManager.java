package com.ailawyer.backend.ai.service;

import com.ailawyer.backend.ai.dto.AnalysisResponseDto;
import com.ailawyer.backend.ai.repository.AiAnalysisReportRepository;
import com.ailawyer.backend.ai.repository.AiCategoryRepository;
import com.ailawyer.backend.ai.repository.AiContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

/**
 * [CORE] 지능형 분석 오케스트레이터
 * 데이터 추출, AI 분석 요청, DB 저장 및 결과 후처리를 총괄합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmartAnalysisManager {

    private final DocumentParser documentParser;
    private final AiAnalysisService aiAnalysisService;

    // DB 저장을 위한 레포지토리 주입 (AI 전용)
    private final AiAnalysisReportRepository reportRepository;
    private final AiContractRepository contractRepository;
    private final AiCategoryRepository categoryRepository;

    /**
     * 전체 분석 프로세스를 관리합니다. (PDF 텍스트 추출 혹은 이미지 직접 분석)
     */
    public AnalysisResponseDto processAnalysis(MultipartFile file) throws IOException {
        log.info("파일 분석 시작: {}", file.getOriginalFilename());
        String contentType = Objects.requireNonNull(file.getContentType());

        // 0. DB에서 현재 등록된 카테고리 목록 가져오기 (AI에게 힌트로 제공)
        String categoryList = categoryRepository.findAll().stream()
                .map(com.ailawyer.backend.ai.domain.Category::getCategoryName)
                .reduce((a, b) -> a + ", " + b)
                .orElse("근로계약서, 임대차계약서, 위임계약서, 용역계약서");

        AnalysisResponseDto result;
        if (contentType.equals("application/pdf")) {
            // 1. PDF인 경우 텍스트 추출 후 분석
            String rawText = documentParser.extractText(file);
            result = aiAnalysisService.analyze(rawText, categoryList);
        } else if (contentType.startsWith("image/")) {
            // 2. 이미지인 경우 Gemini Vision으로 직접 분석
            result = aiAnalysisService.analyzeImage(file.getBytes(), contentType, categoryList);
        } else {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다: " + contentType);
        }

        // 3. 분석 결과가 계약서인 경우 DB에 저장 (대표님 요청 사항)
        if (result != null && result.isContract()) {
            saveAnalysisToDb(result);
        }

        return result;
    }

    private void saveAnalysisToDb(AnalysisResponseDto result) {
        try {
            log.info("분석 결과를 Analysis_Report 테이블에 저장 중...");

            // 1) 카테고리 매핑 (없으면 생성)
            String docType = result.getDocumentType() != null ? result.getDocumentType() : "기타 계약서";
            com.ailawyer.backend.ai.domain.Category category = categoryRepository.findByCategoryName(docType)
                    .orElseGet(() -> categoryRepository.save(new com.ailawyer.backend.ai.domain.Category(docType)));

            // 2) 계약(Contract) 레코드 생성
            com.ailawyer.backend.ai.domain.Contract contract = new com.ailawyer.backend.ai.domain.Contract();
            contract.setCategory(category);
            contract.setUserId(1L); // 테스트용 기본 User ID
            contract.setImgUrl("uploaded_file"); // 실제 경로 혹은 S3 URL이 들어갈 자리
            contractRepository.save(contract);

            // 3) 분석 리포트(AnalysisReport) 저장
            com.ailawyer.backend.ai.domain.AnalysisReport report = new com.ailawyer.backend.ai.domain.AnalysisReport();
            report.setContract(contract);
            report.setUserId(1L);
            report.setScore(result.getRiskScore());
            report.setPenaltyScore(result.getDisadvantagePercentage());

            reportRepository.save(report);
            log.info("Analysis_Report 저장 완료. ID: {}", report.getReportId());

        } catch (Exception e) {
            log.error("DB 저장 중 오류 발생 (분석은 계속 진행): {}", e.getMessage());
            // 분석 흐름을 방해하지 않기 위해 로그만 남김
        }
    }

    /**
     * 분석 리포트 기반 대화형 질의응답 (RAG)
     */
    public String askQuestion(String question) {
        return aiAnalysisService.ask(question);
    }
}
