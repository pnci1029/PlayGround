package com.example.moodbite.api.food.service

import com.example.moodbite.api.food.entity.FoodRecommendation
import com.example.moodbite.api.food.repository.FoodRecommendationRepository
import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Service

@Service
class DataInitService(
    private val foodRepository: FoodRecommendationRepository
) {
    
    @PostConstruct
    fun initData() {
        if (foodRepository.count() == 0L) {
            val foods = listOf(
                FoodRecommendation(
                    name = "김치찌개",
                    description = "신김치와 돼지고기로 끓인 얼큰한 찌개",
                    category = "찌개류",
                    calories = 350,
                    protein = 18.5f,
                    carbs = 12.3f,
                    fat = 22.1f,
                    minPrice = 8000,
                    maxPrice = 12000,
                    prepTimeMinutes = 20,
                    energyBoostScore = 85,
                    stressReliefScore = 70,
                    appetiteStimulationScore = 90,
                    comfortScore = 95,
                    suitableForMorning = false,
                    suitableForLunch = true,
                    suitableForDinner = true,
                    suitableForMidnight = false,
                    suitableForAlone = true,
                    suitableForFriends = true,
                    suitableForFamily = true,
                    suitableForDate = false,
                    suitableForBusiness = false,
                    ingredients = "신김치, 돼지고기, 두부, 대파, 마늘",
                    healthBenefits = "유산균이 풍부한 김치로 장 건강 증진"
                ),
                FoodRecommendation(
                    name = "삼계탕",
                    description = "닭 한 마리에 인삼과 찹쌀을 넣고 끓인 보양식",
                    category = "탕류",
                    calories = 600,
                    protein = 28.7f,
                    carbs = 35.2f,
                    fat = 18.9f,
                    minPrice = 15000,
                    maxPrice = 25000,
                    prepTimeMinutes = 60,
                    energyBoostScore = 95,
                    stressReliefScore = 60,
                    appetiteStimulationScore = 85,
                    comfortScore = 80,
                    suitableForMorning = true,
                    suitableForLunch = true,
                    suitableForDinner = true,
                    suitableForMidnight = false,
                    suitableForAlone = true,
                    suitableForFriends = false,
                    suitableForFamily = true,
                    suitableForDate = true,
                    suitableForBusiness = true,
                    ingredients = "닭, 인삼, 찹쌀, 대추, 마늘",
                    healthBenefits = "단백질과 인삼 성분으로 체력 회복"
                ),
                FoodRecommendation(
                    name = "된장찌개",
                    description = "된장을 우린 국물에 각종 채소를 넣은 찌개",
                    category = "찌개류",
                    calories = 180,
                    protein = 12.3f,
                    carbs = 15.8f,
                    fat = 8.2f,
                    minPrice = 6000,
                    maxPrice = 10000,
                    prepTimeMinutes = 15,
                    energyBoostScore = 60,
                    stressReliefScore = 85,
                    appetiteStimulationScore = 75,
                    comfortScore = 90,
                    suitableForMorning = true,
                    suitableForLunch = true,
                    suitableForDinner = true,
                    suitableForMidnight = false,
                    suitableForAlone = true,
                    suitableForFriends = true,
                    suitableForFamily = true,
                    suitableForDate = false,
                    suitableForBusiness = true,
                    ingredients = "된장, 두부, 양파, 애호박, 감자",
                    healthBenefits = "발효식품으로 장 건강 개선"
                ),
                FoodRecommendation(
                    name = "비빔밥",
                    description = "각종 나물과 고추장을 넣고 비빈 영양 균형 밥",
                    category = "밥류",
                    calories = 420,
                    protein = 15.2f,
                    carbs = 68.5f,
                    fat = 12.8f,
                    minPrice = 8000,
                    maxPrice = 15000,
                    prepTimeMinutes = 25,
                    energyBoostScore = 70,
                    stressReliefScore = 75,
                    appetiteStimulationScore = 85,
                    comfortScore = 70,
                    suitableForMorning = false,
                    suitableForLunch = true,
                    suitableForDinner = true,
                    suitableForMidnight = false,
                    suitableForAlone = true,
                    suitableForFriends = false,
                    suitableForFamily = true,
                    suitableForDate = true,
                    suitableForBusiness = true,
                    ingredients = "밥, 나물, 계란, 고추장, 참기름",
                    healthBenefits = "다양한 채소로 비타민과 미네랄 공급"
                )
            )
            
            foodRepository.saveAll(foods)
        }
    }
}