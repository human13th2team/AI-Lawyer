package com.ailawyer.backend.dashboard.repository;

import com.ailawyer.backend.dashboard.entity.ContractEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractRepository extends JpaRepository<ContractEntity, Integer> {
}
