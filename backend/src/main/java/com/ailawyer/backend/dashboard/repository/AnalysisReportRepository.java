package com.ailawyer.backend.dashboard.repository;

import com.ailawyer.backend.dashboard.dto.CategoryContractDto;
import com.ailawyer.backend.dashboard.entity.AnalysisReportEntity;
import com.ailawyer.backend.dashboard.projection.DailyTrendProjection;
import com.ailawyer.backend.dashboard.projection.RiskAvgProjection;
import com.ailawyer.backend.dashboard.projection.TopCategoryProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

// DB에 접근하는 통로
// DB는 Entity에 저장되어 있으니까 > Repository에서 호출

public interface AnalysisReportRepository extends JpaRepository<AnalysisReportEntity, Integer> {
    // risk_score, disadvantagepercent 평균
    @Query("SELECT AVG(ar.score) AS avgRiskScore, " +
            "AVG(ar.penaltyScore) AS avgDisadvantagePercent " +
            "FROM AnalysisReportEntity ar")
    RiskAvgProjection findRiskAverages(); // Projection 호출하면 avgRiskScore/avgDisadvantagePercent 값 반환

    // count(contractId), 현재 계약서가 몇개 분석되었는지
    @Query("SELECT COUNT(ar.contract.contractId) " +
            "FROM AnalysisReportEntity ar")
    Integer findCountContractId();

    // 카테고리별(텍스트) 분석된 계약서 수
    @Query("SELECT new com.ailawyer.backend.dashboard.dto.CategoryContractDto(" +
            "ar.contract.category.categoryName, COUNT(ar.contract.contractId)) " +
            "From AnalysisReportEntity ar " +
            "Group BY ar.contract.category.categoryId, ar.contract.category.categoryName")
    List<CategoryContractDto> findContractCountByCategory();

    // 가장 위험도가 높은 top-k개  카테고리 정보
    @Query(value =
            "SELECT cat.category_name AS categoryName, " +
            "AVG(ar.score) AS avgRiskScore, " +
            "AVG(ar.penalty_score) AS avgDisadvantagePercent, " +
            "COUNT(rc.risk_clause_id) AS riskClauseCount " +
            "FROM analysis_report ar " +
            "JOIN Contracts c ON ar.contract_id = c.contract_id " +
            "JOIN category cat ON c.category_id = cat.category_id " +
            "JOIN risk_clause rc ON c.contract_id = rc.contract_id " +
            "GROUP BY cat.category_id, cat.category_name " +
            "ORDER BY AVG(ar.score) DESC " +
            "LIMIT :limit",
            nativeQuery = true)
    List<TopCategoryProjection> findTopCategories(@Param("limit") int limit);

    // 날짜별/카테고리별 분석된 계약서 수 (최근 14일)
    @Query(value =
            "SELECT TO_CHAR(c.created_at, 'MM.DD') AS date, " +
            "cat.category_name AS categoryName, " +
            "COUNT(ar.contract_id) AS docCount " +
            "FROM analysis_report ar " +
            "JOIN Contracts c ON ar.contract_id = c.contract_id " +
            "JOIN category cat ON c.category_id = cat.category_id " +
            "WHERE c.created_at >= CURRENT_DATE - INTERVAL '14 days' " +
            "GROUP BY TO_CHAR(c.created_at, 'MM.DD'), cat.category_name " +
            "ORDER BY date ASC",
            nativeQuery = true)
    List<DailyTrendProjection> findDailyTrends();
}
