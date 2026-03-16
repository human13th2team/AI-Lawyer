package com.ailawyer.backend.dashboard.repository;

import com.ailawyer.backend.dashboard.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Integer> {
    Optional<CategoryEntity> findByCategoryName(String categoryName);
}
