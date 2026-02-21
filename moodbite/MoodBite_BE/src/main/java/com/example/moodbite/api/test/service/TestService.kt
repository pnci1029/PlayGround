package com.example.moodbite.api.test.service

import com.example.moodbite.api.executed.LocationBasedRecommendationService
import com.example.moodbite.api.executed.dto.LocationBasedTestResultRequestDTO
import com.example.moodbite.api.executed.dto.LocationDTO as ExecutedLocationDTO
import com.example.moodbite.api.executed.dto.ScoresDTO
import com.example.moodbite.api.test.dto.request.TestRequestDTO
import com.example.moodbite.api.food.service.DatabaseFoodService
import com.fasterxml.jackson.databind.ObjectMapper
import mu.KotlinLogging
import org.springframework.stereotype.Service

@Service
class TestService(
    private val locationBasedRecommendationService: LocationBasedRecommendationService,
    private val databaseFoodService: DatabaseFoodService
    ) {
    
    private val logger = KotlinLogging.logger {}
    private val objectMapper = ObjectMapper()

    fun getResult(dto: TestRequestDTO): String {
        logger.info { "Getting database-based recommendation for: $dto" }
        
        val recommendations = databaseFoodService.getRecommendations(dto)
        
        val result = mapOf(
            "primaryFood" to recommendations.firstOrNull()?.name,
            "alternativefoods" to recommendations.drop(1).map { it.name },
            "reason" to (recommendations.firstOrNull()?.reason ?: "현재 상황에 적합한 추천을 찾지 못했습니다")
        )
        
        return objectMapper.writeValueAsString(result)
    }

    fun getLocationBasedResult(dto: TestRequestDTO): String {
        logger.info { "Getting location-based recommendation for: $dto" }
        
        val foodRecommendations = databaseFoodService.getRecommendations(dto)
        
        val locationDto = LocationBasedTestResultRequestDTO(
            scores = ScoresDTO(
                dto.scores.tired,
                dto.scores.anger, 
                dto.scores.stress,
                dto.scores.appetite,
                dto.scores.budget
            ),
            dining = dto.dining.name,
            mealTime = dto.mealTime.name,
            location = dto.location?.let { ExecutedLocationDTO(it.latitude, it.longitude) }
        )
        
        val nearbyRestaurants = try {
            locationBasedRecommendationService.getLocationBasedRecommendation(locationDto)
        } catch (e: Exception) {
            logger.warn { "Failed to get nearby restaurants: ${e.message}" }
            null
        }
        
        val result = mapOf(
            "id" to 1,
            "message" to "데이터베이스 기반 맞춤 추천입니다",
            "foodRecommendation" to mapOf(
                "primaryFood" to (foodRecommendations.firstOrNull()?.name ?: "추천 음식 없음"),
                "alternativefoods" to foodRecommendations.drop(1).map { it.name },
                "reason" to (foodRecommendations.firstOrNull()?.reason ?: "현재 조건에 맞는 음식을 찾지 못했습니다")
            ),
            "nearbyRestaurants" to (nearbyRestaurants?.nearbyRestaurants?.map { restaurant ->
                mapOf(
                    "name" to restaurant.name,
                    "category" to restaurant.category,
                    "address" to restaurant.address,
                    "latitude" to restaurant.latitude,
                    "longitude" to restaurant.longitude,
                    "rating" to restaurant.rating,
                    "distance" to restaurant.distance,
                    "priceLevel" to restaurant.priceLevel,
                    "phone" to (restaurant.phone ?: ""),
                    "isOpen" to restaurant.isOpen,
                    "matchScore" to restaurant.matchScore,
                    "estimatedWalkTime" to restaurant.estimatedWalkTime
                )
            } ?: emptyList())
        )
        
        return objectMapper.writeValueAsString(result)
    }

}