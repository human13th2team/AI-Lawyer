package com.ailawyer.backend.dashboard.repository;

import com.ailawyer.backend.dashboard.dto.CategoryLatestRiskDto;
import com.ailawyer.backend.dashboard.entity.RiskClauseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RiskClauseRepository extends JpaRepository<RiskClauseEntity, Integer> {
    @Query("""
        SELECT new com.ailawyer.backend.dashboard.dto.CategoryLatestRiskDto(
            r.riskTitle,
            r.legalBase
        )
        FROM RiskClauseEntity r
        JOIN ContractsEntity c ON r.contractId = c.contractId
        WHERE c.category.categoryId = :categoryId
        ORDER BY r.riskClauseId DESC
        LIMIT 3
    """)
    List<CategoryLatestRiskDto> findLatestRisksByCategoryId(@Param("categoryId") Integer categoryId);
}
