package com.ailawyer.backend.dashboard.repository;

import com.ailawyer.backend.dashboard.dto.CategoryScoreDto;
import com.ailawyer.backend.dashboard.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Integer> {
    Optional<CategoryEntity> findByCategoryName(String categoryName);

    @Query("SELECT COUNT(c) FROM ContractsEntity c WHERE c.category.categoryId = :categoryId")
    Long countContractsByCategoryId(@Param("categoryId") Integer categoryId);

    // 여기에 추가
    @Query("""
        SELECT new com.ailawyer.backend.dashboard.dto.CategoryScoreDto(
            cat.categoryName,
            AVG(r.score),
            AVG(r.penaltyScore)
        )
        FROM CategoryEntity cat
        JOIN ContractsEntity c ON c.category.categoryId = cat.categoryId
        JOIN AnalysisReportEntity r ON r.contract.contractId = c.contractId
        WHERE cat.categoryId = :categoryId
        GROUP BY cat.categoryId, cat.categoryName
    """)
    CategoryScoreDto findAvgScoreByCategoryId(@Param("categoryId") Integer categoryId);
}