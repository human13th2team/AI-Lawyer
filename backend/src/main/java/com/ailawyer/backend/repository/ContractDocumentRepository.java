package com.ailawyer.backend.repository;

import com.ailawyer.backend.model.entity.ContractDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractDocumentRepository extends JpaRepository<ContractDocument, Long> {
}
