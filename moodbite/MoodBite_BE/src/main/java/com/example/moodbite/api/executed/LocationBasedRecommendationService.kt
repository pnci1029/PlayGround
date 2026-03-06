package com.example.moodbite.api.executed

import com.example.moodbite.api.executed.dto.*
import com.example.moodbite.api.executed.service.ScientificFoodRecommendationService
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
    private lateinit var scientificFoodRecommendationService: ScientificFoodRecommendationService

    @Autowired
    private lateinit var locationService: LocationService

    private val objectMapper = ObjectMapper()

    fun getLocationBasedRecommendation(requestDTO: LocationBasedTestResultRequestDTO): LocationBasedRecommendationResponseDTO {

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

        val aiRecommendation = scientificFoodRecommendationService.recommendFoodScientific(testRequestDTO)

        val foodRecommendation = parseAIRecommendation(aiRecommendation)

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
                FoodRecommendationDTO(
                    primaryFood = extractPrimaryFoodFromText(aiResponse),
                    alternativefoods = extractAlternativeFoodsFromText(aiResponse),
                    reason = aiResponse
                )
            }
        } catch (e: Exception) {
            FoodRecommendationDTO(
                primaryFood = extractPrimaryFoodFromText(aiResponse),
                alternativefoods = listOf("김치찌개", "된장찌개", "비빔밥"),
                reason = aiResponse
            )
        }
    }

    /**
     * 텍스트에서 주요 추천 음식 추출 - 다양한 국제 요리 포함
     */
    private fun extractPrimaryFoodFromText(text: String): String {
        val foodKeywords = listOf(
            // 한식
            "김치찌개", "된장찌개", "순두부찌개", "갈비탕", "비빔밥", "삼겹살구이", "김치볶음밥", "닭죽", "미역국", "불고기",
            // 이탈리아
            "마르게리타 피자", "치즈 리조또", "페스토 파스타", "파스타", "피자",
            // 일식
            "연어 사시미", "연어 아보카도 롤", "스시 세트", "테리야키 치킨 덮밥", "우동", "라멘", "사시미", "스시",
            // 중식
            "마파두부",
            // 멕시코
            "타코", "부리또",
            // 태국
            "팟타이", "코코넛 새우 카레", "카레",
            // 베트남
            "쌀국수",
            // 인도
            "치킨 티카 마살라",
            // 터키
            "터키 케밥", "케밥",
            // 모로코
            "모로코 타진",
            // 중동
            "팔라펠",
            // 그리스
            "그릭 요거트", "견과류", "요거트",
            // 유럽
            "훈제 연어 베이글", "베이글",
            // 서양식
            "그린 샐러드", "버거 스테이크", "등심스테이크", "샐러드", "스테이크", "버거", "샌드위치", "햄버거",
            // 기타
            "후라이드치킨", "치킨", "떡볶이", "라면"
        )
        return foodKeywords.find { text.contains(it) } ?: "연어 사시미"
    }

    /**
     * 텍스트에서 대안 음식들 추출 - 다양한 국제 요리 포함
     */
    private fun extractAlternativeFoodsFromText(text: String): List<String> {
        val foodKeywords = listOf(
            // 한식
            "김치찌개", "된장찌개", "순두부찌개", "갈비탕", "비빔밥", "삼겹살구이", "김치볶음밥", "닭죽", "미역국", "불고기",
            // 이탈리아
            "마르게리타 피자", "치즈 리조또", "페스토 파스타", "파스타", "피자",
            // 일식
            "연어 사시미", "연어 아보카도 롤", "스시 세트", "테리야키 치킨 덮밥", "우동", "라멘", "사시미", "스시",
            // 중식
            "마파두부",
            // 멕시코
            "타코", "부리또",
            // 태국
            "팟타이", "코코넛 새우 카레", "카레",
            // 베트남
            "쌀국수",
            // 인도
            "치킨 티카 마살라",
            // 터키
            "터키 케밥", "케밥",
            // 모로코
            "모로코 타진",
            // 중동
            "팔라펠",
            // 그리스
            "그릭 요거트", "견과류", "요거트",
            // 유럽
            "훈제 연어 베이글", "베이글",
            // 서양식
            "그린 샐러드", "버거 스테이크", "등심스테이크", "샐러드", "스테이크", "버거", "샌드위치", "햄버거",
            // 기타
            "후라이드치킨", "치킨", "떡볶이", "라면"
        )
        return foodKeywords.filter { text.contains(it) }.take(3).ifEmpty {
            listOf("연어 사시미", "치킨 티카 마살라", "마르게리타 피자")
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

        val primaryResults = locationService.searchNearbyRestaurants(
            latitude = latitude,
            longitude = longitude,
            radius = 1000,
            foodCategory = primaryFood
        )

        val generalResults = locationService.searchNearbyRestaurants(
            latitude = latitude,
            longitude = longitude,
            radius = 1000,
            foodCategory = null
        )

        val allResults = (primaryResults + generalResults)
            .distinctBy { it.name }

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

        if (restaurant.category.contains(getCategoryFromFood(primaryFood))) {
            score += 0.4
        }

        if (restaurant.name.contains(primaryFood)) {
            score += 0.3
        }

        score += when (restaurant.distance) {
            in 0..200 -> 0.2
            in 201..500 -> 0.15
            in 501..1000 -> 0.1
            else -> 0.0
        }

        score += (restaurant.rating - 3.0) * 0.1

        return minOf(1.0, maxOf(0.0, score))
    }

    /**
     * 음식으로부터 카테고리 추출 - 다양한 국제 요리 포함
     */
    private fun getCategoryFromFood(food: String): String {
        return when {
            // 한식
            food.contains("찌개") || food.contains("국") || food.contains("탕") || food.contains("비빔밥") || food.contains("불고기") || food.contains("삼겹살") -> "한식"
            
            // 이탈리아
            food.contains("피자") || food.contains("파스타") || food.contains("리조또") || food.contains("페스토") -> "이탈리아음식"
            
            // 일식
            food.contains("우동") || food.contains("라멘") || food.contains("사시미") || food.contains("스시") || food.contains("테리야키") -> "일식"
            
            // 중식
            food.contains("마파두부") -> "중식"
            
            // 멕시코
            food.contains("타코") || food.contains("부리또") -> "멕시코음식"
            
            // 태국
            food.contains("팟타이") || food.contains("카레") -> "태국음식"
            
            // 베트남
            food.contains("쌀국수") -> "베트남음식"
            
            // 인도
            food.contains("치킨 티카") || food.contains("마살라") -> "인도음식"
            
            // 터키
            food.contains("케밥") -> "터키음식"
            
            // 중동
            food.contains("팔라펠") -> "중동음식"
            
            // 서양식
            food.contains("스테이크") || food.contains("샐러드") || food.contains("버거") || food.contains("베이글") || food.contains("샌드위치") || food.contains("햄버거") -> "서양음식"
            
            // 치킨
            food.contains("치킨") -> "치킨"
            
            // 분식
            food.contains("떡볶이") || food.contains("라면") -> "분식"
            
            else -> "음식점"
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
