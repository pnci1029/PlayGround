package com.example.moodbite.api.food.repository

import com.example.moodbite.api.food.entity.FoodRecommendation
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface FoodRecommendationRepository : JpaRepository<FoodRecommendation, Long> {
    
    @Query("""
        SELECT f FROM FoodRecommendation f 
        WHERE f.minPrice <= :maxBudget 
        AND f.maxPrice >= :minBudget
        AND (
            (:mealTime = 'MORNING' AND f.suitableForMorning = true) OR
            (:mealTime = 'LUNCH' AND f.suitableForLunch = true) OR
            (:mealTime = 'DINNER' AND f.suitableForDinner = true) OR
            (:mealTime = 'MIDNIGHT_SNACK' AND f.suitableForMidnight = true)
        )
        AND (
            (:diningType = 'ALONE' AND f.suitableForAlone = true) OR
            (:diningType = 'WITH_FRIENDS' AND f.suitableForFriends = true) OR
            (:diningType = 'WITH_FAMILY' AND f.suitableForFamily = true) OR
            (:diningType = 'DATE' AND f.suitableForDate = true) OR
            (:diningType = 'BUSINESS' AND f.suitableForBusiness = true)
        )
    """)
    fun findRecommendationsByFilters(
        @Param("minBudget") minBudget: Int,
        @Param("maxBudget") maxBudget: Int,
        @Param("mealTime") mealTime: String,
        @Param("diningType") diningType: String
    ): List<FoodRecommendation>
    
    // 시간대만 매칭하는 fallback 쿼리
    @Query("""
        SELECT f FROM FoodRecommendation f 
        WHERE f.minPrice <= :maxBudget 
        AND f.maxPrice >= :minBudget
        AND (
            (:mealTime = 'MORNING' AND f.suitableForMorning = true) OR
            (:mealTime = 'LUNCH' AND f.suitableForLunch = true) OR
            (:mealTime = 'DINNER' AND f.suitableForDinner = true) OR
            (:mealTime = 'MIDNIGHT_SNACK' AND f.suitableForMidnight = true)
        )
    """)
    fun findRecommendationsByMealTimeAndBudget(
        @Param("minBudget") minBudget: Int,
        @Param("maxBudget") maxBudget: Int,
        @Param("mealTime") mealTime: String
    ): List<FoodRecommendation>
    
    // 예산만 매칭하는 최종 fallback 쿼리
    @Query("""
        SELECT f FROM FoodRecommendation f 
        WHERE f.minPrice <= :maxBudget 
        AND f.maxPrice >= :minBudget
    """)
    fun findRecommendationsByBudgetOnly(
        @Param("minBudget") minBudget: Int,
        @Param("maxBudget") maxBudget: Int
    ): List<FoodRecommendation>
    
    // 예산도 무시하는 최후의 수단 쿼리
    @Query("""
        SELECT f FROM FoodRecommendation f 
        WHERE (
            (:mealTime = 'MORNING' AND f.suitableForMorning = true) OR
            (:mealTime = 'LUNCH' AND f.suitableForLunch = true) OR
            (:mealTime = 'DINNER' AND f.suitableForDinner = true) OR
            (:mealTime = 'MIDNIGHT_SNACK' AND f.suitableForMidnight = true)
        )
    """)
    fun findRecommendationsByMealTimeOnly(
        @Param("mealTime") mealTime: String
    ): List<FoodRecommendation>
}