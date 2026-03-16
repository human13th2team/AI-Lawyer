package com.ailawyer.backend.dashboard.entity;

import jakarta.persistence.*;

import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "risk_clause")
public class RiskClauseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "risk_clause_id")
    private Integer riskClauseId; // PK
    @Column(name = "contract_id")
    private Integer contractId; //FK
    @Column(name = "risk_title")
    private String riskTitle;
    @Column(name = "legal_base")
    private String legalBase;
}
