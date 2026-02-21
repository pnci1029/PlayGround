package com.example.moodbite.api.food.entity

import jakarta.persistence.*

@Entity
@Table(name = "food_recommendations")
data class FoodRecommendation(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,
    
    @Column(nullable = false)
    val name: String,
    
    @Column(length = 1000)
    val description: String,
    
    @Column(nullable = false)
    val category: String,
    
    val calories: Int,
    val protein: Float,
    val carbs: Float,
    val fat: Float,
    
    val minPrice: Int,
    val maxPrice: Int,
    val prepTimeMinutes: Int,
    
    val energyBoostScore: Int,
    val stressReliefScore: Int,
    val appetiteStimulationScore: Int,
    val comfortScore: Int,
    
    val suitableForMorning: Boolean = false,
    val suitableForLunch: Boolean = false,
    val suitableForDinner: Boolean = false,
    val suitableForMidnight: Boolean = false,
    
    val suitableForAlone: Boolean = false,
    val suitableForFriends: Boolean = false,
    val suitableForFamily: Boolean = false,
    val suitableForDate: Boolean = false,
    val suitableForBusiness: Boolean = false,
    
    @Column(length = 500)
    val ingredients: String,
    
    @Column(length = 1000)
    val healthBenefits: String
)