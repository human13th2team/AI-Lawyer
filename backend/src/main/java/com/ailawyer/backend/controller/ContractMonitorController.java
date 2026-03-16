package com.ailawyer.backend.controller;

import com.ailawyer.backend.model.entity.ContractCondition;
import com.ailawyer.backend.service.ContractMonitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/monitoring")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContractMonitorController {

    private final ContractMonitorService monitorService;

    public record AddConditionRequest(
            String contractName,
            String triggerCondition,
            LocalDate deadlineDate,
            String actionRequired
    ) {}

    @PostMapping
    public ResponseEntity<ContractCondition> addCondition(@RequestBody AddConditionRequest request) {
        ContractCondition condition = monitorService.addCondition(
                request.contractName(),
                request.triggerCondition(),
                request.deadlineDate(),
                request.actionRequired()
        );
        return ResponseEntity.ok(condition);
    }

    @GetMapping
    public ResponseEntity<List<ContractCondition>> getAllConditions() {
        return ResponseEntity.ok(monitorService.getAllConditions());
    }

    @PostMapping("/run-check-now")
    public ResponseEntity<String> forceCheckDeadlines() {
        monitorService.checkAndNotifyUpcomingDeadlines();
        return ResponseEntity.ok("가디언 알림 검사 강제 실행 완료");
    }
}
