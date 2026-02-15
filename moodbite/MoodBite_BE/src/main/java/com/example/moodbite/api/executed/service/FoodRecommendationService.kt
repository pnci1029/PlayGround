package com.example.moodbite.api.executed.service

import com.example.moodbite.api.executed.dto.TestResultRequestDTO
import com.example.moodbite.domain.food.Food
import com.example.moodbite.domain.food.FoodRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import kotlin.math.abs

@Service
class FoodRecommendationService {
    
    @Autowired
    private lateinit var foodRepository: FoodRepository
    
    fun recommendFood(requestDTO: TestResultRequestDTO): String {
        val foods = foodRepository.findAll()
        
        if (foods.isEmpty()) {
            return generateBasicRecommendation(requestDTO)
        }
        
        // 필터링: 시간대와 동반자 상황에 맞는 음식들
        val timeFilteredFoods = if (requestDTO.mealTime != null) {
            foods.filter { isTimeAppropriate(it, requestDTO.mealTime!!) }
        } else {
            foods
        }
        
        val situationFilteredFoods = timeFilteredFoods.filter { 
            isSituationAppropriate(it, requestDTO.dining) 
        }
        
        val budgetFilteredFoods = situationFilteredFoods.filter {
            isPriceAppropriate(it, requestDTO.scores.budget)
        }
        
        if (budgetFilteredFoods.isEmpty()) {
            return generateBasicRecommendation(requestDTO)
        }
        
        // AI 점수 계산
        val scoredFoods = budgetFilteredFoods.map { food ->
            val score = calculateAIScore(food, requestDTO)
            Pair(food, score)
        }.sortedByDescending { it.second }
        
        val topRecommendations = scoredFoods.take(3)
        
        return generateRecommendationMessage(topRecommendations, requestDTO)
    }
    
    private fun calculateAIScore(food: Food, request: TestResultRequestDTO): Double {
        val scores = request.scores
        var totalScore = 0.0
        
        // 감정 상태와 음식의 특성 매칭
        // 피로도가 높을 때는 편안한 음식 선호
        totalScore += if (scores.tired > 7) {
            food.comfortLevel * 0.3
        } else if (scores.tired < 4) {
            food.energyBoost * 0.2
        } else {
            (food.comfortLevel + food.energyBoost) * 0.1
        }
        
        // 스트레스가 높을 때는 스트레스 해소에 좋은 음식
        totalScore += if (scores.stress > 7) {
            food.stressRelief * 0.25
        } else {
            food.stressRelief * 0.1
        }
        
        // 식욕이 낮을 때는 식욕 자극 음식
        totalScore += if (scores.appetite < 4) {
            food.appetiteMatch * 0.3
        } else if (scores.appetite > 8) {
            food.energyBoost * 0.2
        } else {
            food.appetiteMatch * 0.15
        }
        
        // 화가 났을 때는 스트레스 해소 + 편안함
        totalScore += if (scores.anger > 6) {
            (food.stressRelief + food.comfortLevel) * 0.15
        } else {
            food.stressRelief * 0.05
        }
        
        // 예산 점수 (예산에 맞을수록 높은 점수)
        val budgetScore = when {
            scores.budget <= 3 && food.priceLevel == 1 -> 2.0
            scores.budget in 4..7 && food.priceLevel == 2 -> 1.5
            scores.budget >= 8 && food.priceLevel == 3 -> 1.0
            abs(scores.budget - food.priceLevel * 3) <= 2 -> 0.5
            else -> 0.0
        }
        totalScore += budgetScore
        
        return totalScore
    }
    
    private fun isTimeAppropriate(food: Food, mealTime: String): Boolean {
        return when (mealTime) {
            "MORNING" -> food.morningFriendly
            "LUNCH" -> food.lunchFriendly
            "DINNER" -> food.dinnerFriendly
            "MIDNIGHT_SNACK" -> food.midnightFriendly
            else -> true
        }
    }
    
    private fun isSituationAppropriate(food: Food, dining: String): Boolean {
        return when (dining) {
            "ALONE" -> food.soloFriendly
            "DATE" -> food.dateFriendly
            "FRIENDS", "FAMILY", "COWORKERS", "ETC" -> food.groupFriendly
            else -> true
        }
    }
    
    private fun isPriceAppropriate(food: Food, budget: Int): Boolean {
        return when {
            budget <= 3 -> food.priceLevel <= 1
            budget in 4..6 -> food.priceLevel <= 2
            budget >= 7 -> true
            else -> true
        }
    }
    
    private fun generateRecommendationMessage(
        recommendations: List<Pair<Food, Double>>, 
        request: TestResultRequestDTO
    ): String {
        if (recommendations.isEmpty()) {
            return generateBasicRecommendation(request)
        }
        
        val topFood = recommendations[0].first
        val message = StringBuilder()
        
        // 감정 분석 메시지
        val scores = request.scores
        when {
            scores.tired > 7 && scores.stress > 6 -> {
                message.append("피곤하고 스트레스가 많으시네요. ")
            }
            scores.tired > 7 -> {
                message.append("많이 피곤하신 것 같아요. ")
            }
            scores.stress > 7 -> {
                message.append("스트레스가 많으신 것 같아요. ")
            }
            scores.appetite < 4 -> {
                message.append("식욕이 없으신 것 같아요. ")
            }
            scores.appetite > 8 -> {
                message.append("식욕이 왕성하시네요! ")
            }
        }
        
        // 추천 음식 메시지
        message.append("${topFood.name}")
        if (topFood.description != null) {
            message.append(" (${topFood.description})")
        }
        message.append("를 추천드려요!")
        
        // 추가 옵션들
        if (recommendations.size > 1) {
            message.append(" 다른 옵션으로는 ")
            val otherFoods = recommendations.drop(1).take(2).map { it.first.name }
            message.append(otherFoods.joinToString(", "))
            message.append("도 좋을 것 같아요.")
        }
        
        return message.toString()
    }
    
    private fun generateBasicRecommendation(request: TestResultRequestDTO): String {
        val scores = request.scores
        
        return when {
            scores.tired > 7 && scores.stress > 7 -> 
                "피곤하고 스트레스가 많으신 것 같네요. 따뜻한 국물 요리나 죽을 추천합니다!"
            scores.appetite > 8 && scores.budget > 7 -> 
                "식욕이 왕성하고 예산도 충분하시네요! 고기류나 맛있는 한정식은 어떠세요?"
            scores.budget < 4 -> 
                "가성비 좋은 분식이나 간단한 덮밥을 추천합니다!"
            scores.stress > 7 ->
                "스트레스 해소에 좋은 매콤한 음식이나 치킨은 어떠세요?"
            scores.appetite < 4 ->
                "식욕 없을 때는 가벼운 샐러드나 스프를 추천해요!"
            else -> 
                "균형잡힌 한식이나 가벼운 양식을 추천합니다!"
        }
    }
}