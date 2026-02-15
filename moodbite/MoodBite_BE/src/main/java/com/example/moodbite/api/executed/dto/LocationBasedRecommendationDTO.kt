package com.example.moodbite.api.executed.dto

import com.example.moodbite.api.location.RestaurantSearchResult

// 요청 DTO
data class LocationBasedTestResultRequestDTO(
    val scores: ScoresDTO,
    val dining: String,
    val mealTime: String?,
    val location: LocationDTO? = null
)

data class LocationDTO(
    val latitude: Double,
    val longitude: Double
)

// 응답 DTO
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
    val rating: Double,
    val distance: Int,
    val priceLevel: Int,
    val phone: String?,
    val isOpen: Boolean,
    val matchScore: Double, // 추천 음식과의 매칭 점수
    val estimatedWalkTime: String // "도보 3분"
)