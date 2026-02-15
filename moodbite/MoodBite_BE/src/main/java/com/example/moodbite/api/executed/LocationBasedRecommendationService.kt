package com.example.moodbite.api.executed

import com.example.moodbite.api.executed.dto.*
import com.example.moodbite.api.executed.service.FoodRecommendationService
import com.example.moodbite.api.location.LocationService
import com.example.moodbite.api.location.RestaurantSearchResult
import com.example.moodbite.domain.executed.TestExecuted
import com.example.moodbite.domain.executed.TestExecutedRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class LocationBasedRecommendationService {
    
    @Autowired
    private lateinit var testExecutedRepository: TestExecutedRepository
    
    @Autowired
    private lateinit var foodRecommendationService: FoodRecommendationService
    
    @Autowired
    private lateinit var locationService: LocationService
    
    private val objectMapper = ObjectMapper()
    
    fun getLocationBasedRecommendation(requestDTO: LocationBasedTestResultRequestDTO): LocationBasedRecommendationResponseDTO {
        
        // 1. 기존 감정 테스트 결과 저장
        val testExecuted = TestExecuted(
            null,
            requestDTO.scores.tired,
            requestDTO.scores.anger,
            requestDTO.scores.stress,
            requestDTO.scores.appetite,
            requestDTO.scores.budget,
            requestDTO.dining,
            requestDTO.mealTime,
            null
        )
        
        val saved = testExecutedRepository.save(testExecuted)
        
        // 2. AI 음식 추천 받기
        val testRequestDTO = TestResultRequestDTO(
            scores = ScoresDTO(
                requestDTO.scores.tired,
                requestDTO.scores.anger,
                requestDTO.scores.stress,
                requestDTO.scores.appetite,
                requestDTO.scores.budget
            ),
            dining = requestDTO.dining,
            mealTime = requestDTO.mealTime
        )
        
        val aiRecommendation = foodRecommendationService.recommendFood(testRequestDTO)
        
        // 3. AI 추천 결과 파싱
        val foodRecommendation = parseAIRecommendation(aiRecommendation)
        
        // 4. 위치 기반 음식점 검색 (위치 정보가 있는 경우)
        val nearbyRestaurants = if (requestDTO.location != null) {
            searchAndMatchRestaurants(
                requestDTO.location.latitude,
                requestDTO.location.longitude,
                foodRecommendation.primaryFood
            )
        } else {
            emptyList()
        }
        
        return LocationBasedRecommendationResponseDTO(
            id = saved.id!!,
            message = "감정 기반 음식 추천 및 위치 기반 음식점 검색이 완료되었습니다.",
            foodRecommendation = foodRecommendation,
            nearbyRestaurants = nearbyRestaurants
        )
    }
    
    /**
     * AI 추천 결과를 파싱하여 구조화된 데이터로 변환
     */
    private fun parseAIRecommendation(aiResponse: String): FoodRecommendationDTO {
        return try {
            // AI 응답이 JSON 형태인지 확인하고 파싱
            if (aiResponse.trim().startsWith("{")) {
                val jsonNode = objectMapper.readTree(aiResponse)
                FoodRecommendationDTO(
                    primaryFood = jsonNode.get("primaryFood")?.asText() ?: extractPrimaryFoodFromText(aiResponse),
                    alternativefoods = jsonNode.get("alternativefoods")?.let { node ->
                        node.map { it.asText() }
                    } ?: extractAlternativeFoodsFromText(aiResponse),
                    reason = jsonNode.get("reason")?.asText() ?: aiResponse
                )
            } else {
                // 일반 텍스트 응답 파싱
                FoodRecommendationDTO(
                    primaryFood = extractPrimaryFoodFromText(aiResponse),
                    alternativefoods = extractAlternativeFoodsFromText(aiResponse),
                    reason = aiResponse
                )
            }
        } catch (e: Exception) {
            // 파싱 실패 시 기본값 반환
            FoodRecommendationDTO(
                primaryFood = extractPrimaryFoodFromText(aiResponse),
                alternativefoods = listOf("김치찌개", "된장찌개", "비빔밥"),
                reason = aiResponse
            )
        }
    }
    
    /**
     * 텍스트에서 주요 추천 음식 추출
     */
    private fun extractPrimaryFoodFromText(text: String): String {
        val foodKeywords = listOf("김치찌개", "된장찌개", "순두부찌개", "파스타", "치킨", "우동", "갈비탕", "떡볶이", "라면", "스테이크")
        return foodKeywords.find { text.contains(it) } ?: "김치찌개"
    }
    
    /**
     * 텍스트에서 대안 음식들 추출
     */
    private fun extractAlternativeFoodsFromText(text: String): List<String> {
        val foodKeywords = listOf("김치찌개", "된장찌개", "순두부찌개", "파스타", "치킨", "우동", "갈비탕", "떡볶이", "라면", "스테이크")
        return foodKeywords.filter { text.contains(it) }.take(3).ifEmpty { 
            listOf("김치찌개", "된장찌개", "비빔밥") 
        }
    }
    
    /**
     * 추천된 음식과 매칭되는 주변 음식점 검색
     */
    private fun searchAndMatchRestaurants(
        latitude: Double,
        longitude: Double,
        primaryFood: String
    ): List<RestaurantRecommendationDTO> {
        
        // 주요 음식으로 검색
        val primaryResults = locationService.searchNearbyRestaurants(
            latitude = latitude,
            longitude = longitude,
            radius = 1000,
            foodCategory = primaryFood
        )
        
        // 일반 맛집으로도 검색하여 다양성 확보
        val generalResults = locationService.searchNearbyRestaurants(
            latitude = latitude,
            longitude = longitude,
            radius = 1000,
            foodCategory = null
        )
        
        // 결과 합치기 및 중복 제거
        val allResults = (primaryResults + generalResults)
            .distinctBy { it.name }
            .take(10) // 최대 10개
        
        return allResults.map { restaurant ->
            RestaurantRecommendationDTO(
                name = restaurant.name,
                category = restaurant.category,
                address = restaurant.address,
                latitude = restaurant.latitude,
                longitude = restaurant.longitude,
                rating = restaurant.rating,
                distance = restaurant.distance,
                priceLevel = restaurant.priceLevel,
                phone = restaurant.phone,
                isOpen = restaurant.isOpen,
                matchScore = calculateMatchScore(restaurant, primaryFood),
                estimatedWalkTime = calculateWalkTime(restaurant.distance)
            )
        }.sortedByDescending { it.matchScore }
    }
    
    /**
     * 음식점과 추천 음식의 매칭 점수 계산
     */
    private fun calculateMatchScore(restaurant: RestaurantSearchResult, primaryFood: String): Double {
        var score = 0.0
        
        // 카테고리 매칭
        if (restaurant.category.contains(getCategoryFromFood(primaryFood))) {
            score += 0.4
        }
        
        // 음식점 이름 매칭
        if (restaurant.name.contains(primaryFood)) {
            score += 0.3
        }
        
        // 거리 점수 (가까울수록 높은 점수)
        score += when (restaurant.distance) {
            in 0..200 -> 0.2
            in 201..500 -> 0.15
            in 501..1000 -> 0.1
            else -> 0.0
        }
        
        // 평점 점수
        score += (restaurant.rating - 3.0) * 0.1
        
        return minOf(1.0, maxOf(0.0, score))
    }
    
    /**
     * 음식으로부터 카테고리 추출
     */
    private fun getCategoryFromFood(food: String): String {
        return when {
            food.contains("찌개") || food.contains("국") || food.contains("탕") -> "한식"
            food.contains("파스타") || food.contains("스테이크") -> "양식"
            food.contains("우동") || food.contains("라멘") -> "일식"
            food.contains("치킨") -> "치킨"
            food.contains("떡볶이") || food.contains("라면") -> "분식"
            else -> "한식"
        }
    }
    
    /**
     * 거리에 따른 도보 시간 계산
     */
    private fun calculateWalkTime(distanceInMeters: Int): String {
        val walkingSpeedMeterPerMinute = 80 // 평균 도보 속도: 80m/분
        val minutes = (distanceInMeters / walkingSpeedMeterPerMinute).coerceAtLeast(1)
        return "도보 ${minutes}분"
    }
}