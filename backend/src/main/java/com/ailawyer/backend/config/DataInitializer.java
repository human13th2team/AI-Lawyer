package com.ailawyer.backend.config;

import com.ailawyer.backend.ai.domain.Category;
import com.ailawyer.backend.ai.repository.AiCategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    // @Bean
    // public CommandLineRunner initData(AiCategoryRepository categoryRepository) {
    // return args -> {
    // String[] initialCategories = {"근로계약서", "부동산계약서", "용역계약서", "비밀유지계약서"};
    // for (String catName : initialCategories) {
    // if (categoryRepository.findByCategoryName(catName).isEmpty()) {
    // categoryRepository.save(new Category(catName));
    // System.out.println("✅ 카테고리 [" + catName + "] 생성 완료");
    // }
    // }
    // };
    // }
}
