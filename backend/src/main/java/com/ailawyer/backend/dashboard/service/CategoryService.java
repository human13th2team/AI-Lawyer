package com.ailawyer.backend.dashboard.service;

import com.ailawyer.backend.dashboard.dto.CategoryScoreDto;
import com.ailawyer.backend.dashboard.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class CategoryService {
    private final CategoryRepository repository;
    // 카테고리 id별 계약서 수
    public Long getContractCountByCategoryId(Integer contractId) {
        return repository.countContractsByCategoryId(contractId);
    }

    public CategoryScoreDto getFindAvgScoreByCategoryId(Integer categoryId) {
        return repository.findAvgScoreByCategoryId(categoryId);
    }

    public Long getContractCount(Integer categoryId) {
        return repository.countContractsByCategoryId(categoryId);
    }
}
