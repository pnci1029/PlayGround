package com.example.moodbite.api.executed.dto

import com.example.moodbite.api.location.RestaurantSearchResult
import jakarta.validation.Valid
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin

data class LocationBasedTestResultRequestDTO(
    val scores: ScoresDTO,
    val dining: String,
    val mealTime: String?,
    @field:Valid
    val location: LocationDTO? = null
)

data class LocationDTO(
    @field:DecimalMin("-90.0") @field:DecimalMax("90.0")
    val latitude: Double,
    @field:DecimalMin("-180.0") @field:DecimalMax("180.0")
    val longitude: Double
)

data class LocationBasedRecommendationResponseDTO(
    val id: Long,
    val message: String,
    val foodRecommendation: FoodRecommendationDTO,
    val nearbyRestaurants: List<RestaurantRecommendationDTO>
)

data class FoodRecommendationDTO(
    val primaryFood: String,
    val alternativefoods: List<String>,
    val reason: String
)

data class RestaurantRecommendationDTO(
    val name: String,
    val category: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val rating: Double?,
    val distance: Int,
    val priceLevel: Int?,
    val phone: String?,
    val isOpen: Boolean,
    val matchScore: Double, // 추천 음식과의 매칭 점수
    val estimatedWalkTime: String // "도보 3분"
)
