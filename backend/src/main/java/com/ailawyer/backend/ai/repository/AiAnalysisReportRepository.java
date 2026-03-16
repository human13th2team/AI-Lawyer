package com.ailawyer.backend.ai.repository;

import com.ailawyer.backend.ai.domain.AnalysisReport;
import com.ailawyer.backend.ai.domain.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiAnalysisReportRepository extends JpaRepository<AnalysisReport, Long> {
    Optional<AnalysisReport> findByContract(Contract contract);
}
