package com.ailawyer.backend.service;

import com.ailawyer.backend.model.entity.ContractCondition;
import com.ailawyer.backend.repository.ContractConditionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractMonitorService {

    private final ContractConditionRepository repository;

    @Transactional
    public ContractCondition addCondition(String contractName, String triggerCondition, LocalDate deadlineDate, String actionRequired) {
        ContractCondition condition = ContractCondition.builder()
                .contractName(contractName)
                .triggerCondition(triggerCondition)
                .deadlineDate(deadlineDate)
                .actionRequired(actionRequired)
                .status(ContractCondition.Status.PENDING)
                .build();
        return repository.save(condition);
    }

    public List<ContractCondition> getAllConditions() {
        return repository.findAll();
    }
    
    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional
    public void checkAndNotifyUpcomingDeadlines() {
        LocalDate notifyDate = LocalDate.now().plusDays(30); // 갱신/종료 30일 전 알림
        log.info("🔍 [계약 갱신 모니터링] {} 부근에 갱신/종료되는 계약을 확인합니다.", notifyDate);
        
        List<ContractCondition> upcoming = repository.findByDeadlineDateBeforeAndStatus(notifyDate.plusDays(1), ContractCondition.Status.PENDING);

        if (upcoming.isEmpty()) {
            log.info("✅ 현재 기간 만료 사전 알림 대상이 없습니다.");
            return;
        }

        for (ContractCondition cond : upcoming) {
            // [가정] 독소조항이 포함된 계약 조건이라고 판단되는 경우
            // (실제 실무에서는 Contract와 ToxicClauseAlert를 Join하여 판단하지만, 현재는 데모를 위해 조건에 특정 키워드가 있는지 확인)
            boolean hasToxicRisk = cond.getActionRequired() != null && 
                (cond.getActionRequired().contains("위약금") || cond.getActionRequired().contains("독소조항") || cond.getActionRequired().contains("저작권"));

            if (hasToxicRisk) {
                log.warn("🚨 [독소조항 갱신 알림] 계약명: {}, 기한: {}", cond.getContractName(), cond.getDeadlineDate());
                log.warn("   💬 경고 시스템: 해당 계약에는 독소조항 리스크가 존재합니다! 자동 갱신되기 전에 반드시 [조건 변경 필요] 협상을 진행하세요.");
                
                // 알림 내용 업데이트
                cond.setActionRequired("[조건 변경 필요] 기존 독소조항 무효화 및 새로운 조건으로 재협상 요망. (사유: " + cond.getActionRequired() + ")");
            } else {
                log.info("⏰ [일반 계약 갱신 알림] 계약명: {}, 기한: {}", cond.getContractName(), cond.getDeadlineDate());
            }
            
            // 알림 발송 완료 처리 상태 변경
            cond.setStatus(ContractCondition.Status.NOTIFIED);
            repository.save(cond);
        }
    }
}
