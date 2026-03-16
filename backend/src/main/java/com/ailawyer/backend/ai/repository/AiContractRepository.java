package com.ailawyer.backend.ai.repository;

import com.ailawyer.backend.ai.domain.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByUserId(Long userId);
}
