package com.ailawyer.backend.repository;

import com.ailawyer.backend.model.entity.ContractCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ContractConditionRepository extends JpaRepository<ContractCondition, Long> {
    List<ContractCondition> findByDeadlineDateBeforeAndStatus(LocalDate date, ContractCondition.Status status);
}
