package com.ailawyer.backend.dashboard.controller;

import com.ailawyer.backend.dashboard.dto.CategoryLatestRiskDto;
import com.ailawyer.backend.dashboard.service.RiskClauseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
public class RiskClauseController {

    private final RiskClauseService riskClauseService;

    @GetMapping("{categoryId}/risks-clauses")
    public ResponseEntity<List<CategoryLatestRiskDto>> getLatestRisks(
            @PathVariable Integer categoryId) {
        return ResponseEntity.ok(riskClauseService.getLatestRisks(categoryId));
    }
}
