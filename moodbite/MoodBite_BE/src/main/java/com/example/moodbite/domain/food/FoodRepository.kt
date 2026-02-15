package com.example.moodbite.domain.food

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface FoodRepository : JpaRepository<Food, Long> {
    
    @Query("SELECT f FROM Food f WHERE f.category = :category")
    fun findByCategory(@Param("category") category: String): List<Food>
    
    @Query("""
        SELECT f FROM Food f WHERE 
        (:priceLevel = 1 AND f.priceLevel <= 1) OR
        (:priceLevel = 2 AND f.priceLevel <= 2) OR
        (:priceLevel >= 3 AND f.priceLevel <= 3)
    """)
    fun findByPriceLevel(@Param("priceLevel") priceLevel: Int): List<Food>
    
    @Query("""
        SELECT f FROM Food f WHERE 
        (:mealTime = 'MORNING' AND f.morningFriendly = true) OR
        (:mealTime = 'LUNCH' AND f.lunchFriendly = true) OR
        (:mealTime = 'DINNER' AND f.dinnerFriendly = true) OR
        (:mealTime = 'MIDNIGHT_SNACK' AND f.midnightFriendly = true)
    """)
    fun findByMealTime(@Param("mealTime") mealTime: String): List<Food>
    
    @Query("""
        SELECT f FROM Food f WHERE 
        (:dining = 'ALONE' AND f.soloFriendly = true) OR
        (:dining = 'DATE' AND f.dateFriendly = true) OR
        (:dining IN ('FRIENDS', 'FAMILY', 'COWORKERS', 'ETC') AND f.groupFriendly = true)
    """)
    fun findByDiningType(@Param("dining") dining: String): List<Food>
}