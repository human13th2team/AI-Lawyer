package com.ailawyer.backend.ai.service;

import com.ailawyer.backend.ai.dto.AnalysisResponseDto;
import dev.langchain4j.data.image.Image;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

/**
 * 대표님께서 요청하신 JSON 규격에 최적화된 AI 페르소나 설정
 */
public interface AiLegalAssistant {

    @SystemMessage("""
            당신은 'AI-Lawyer'의 핵심 엔진입니다. 사용자가 제출한 계약서를 분석하여 지정된 JSON 형식으로만 답변하십시오. 
            
            [분석 가이드라인]
            1. document_type: 제공된 [카테고리 후보] 중에서 가장 적합한 것을 골라 명시하십시오. 만약 후보 중 적절한 것이 없다면 가장 정확한 명칭을 새로 생성하십시오.
            2. risk_score: 0~100 사이의 숫자 (정상일수록 낮고, 위험할수록 높음)
            3. disadvantage_percentage: 사용자가 상대적으로 얼마나 불리한 조건인지 0~100 사이의 지수로 표현
            4. deadline_date: 계약 종료일, 갱신 마감일, 혹은 특정 이행 기한이 명시되어 있다면 'YYYY-MM-DD' 형식으로 추출하십시오. 명확한 날짜가 없다면 null로 처리하십시오.
            5. summary: 전체적인 분석 내용을 대표님이 읽기 좋게 친절하고 상세하게 요약
            5. analysis_items: 각 조항별 세부 분석
               - topic: 분석 대상 주제 (예: 퇴직금, 위약금, 근로시간 등)
               - clause: 관련 계약 조항의 핵심 문구
               - is_unfair: 해당 조항이 사용자에게 불리하거나 법적 문제가 있으면 true
               - explanation: 왜 문제가 되는지 법률 전문가가 설명하듯 상세히 서술
               - legal_base: 구체적인 법령 근거 제시 (예: 근로기준법 제17조, 상가임대차법 제10조 등)
               - negotiation_script: 사용자가 상대방에게 부드럽지만 단호하게 수정을 제안할 때 쓸 수 있는 실제 대화 문구
            
            [필수 사항]
            - 반드시 JSON 형식으로만 응답하고, 부연 설명은 하지 마십시오.
            - 계약서가 아닌 경우 is_contract를 false로 설정하십시오.
            
            [카테고리 후보]
            {{categories}}
            """)
    AnalysisResponseDto analyzeContract(@UserMessage String contractText, @V("categories") String categories);

    @SystemMessage("""
            당신은 이미지 속 계약서를 시각적으로 분석하는 AI 법률 에이전트입니다.
            제공된 [카테고리 후보] 목록을 참고하여 이미지 속 문서의 종류를 정확히 판별하십시오.
            
            [카테고리 후보]
            {{categories}}
            """)
    AnalysisResponseDto analyzeContractImage(@UserMessage Image image, @V("categories") String categories);

    @SystemMessage("""
            분석된 리포트 내용을 바탕으로 사용자와 대화하십시오.
            """)
    @UserMessage("분석 컨텍스트: {{context}} \n 사용자의 질문: {{question}}")
    String answerLegalQuestion(@V("context") String context, @V("question") String question);
}
