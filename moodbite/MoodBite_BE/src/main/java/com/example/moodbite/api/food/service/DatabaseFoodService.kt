package com.example.moodbite.api.food.service

import com.example.moodbite.api.food.entity.FoodRecommendation
import com.example.moodbite.api.food.repository.FoodRecommendationRepository
import com.example.moodbite.api.test.dto.request.TestRequestDTO
import org.springframework.stereotype.Service
import kotlin.math.min

@Service
class DatabaseFoodService(
    private val foodRepository: FoodRecommendationRepository
) {
    
    fun getRecommendations(dto: TestRequestDTO): List<FoodRecommendationResult> {
        val candidates = foodRepository.findRecommendationsByFilters(
            minBudget = dto.scores.budget / 3,
            maxBudget = dto.scores.budget,
            mealTime = dto.mealTime.name,
            diningType = dto.dining.name
        )
        
        return candidates
            .map { food -> calculateScore(food, dto) to food }
            .sortedByDescending { it.first }
            .take(3)
            .map { (score, food) ->
                FoodRecommendationResult(
                    name = food.name,
                    description = food.description,
                    reason = generateReason(food, dto),
                    score = score,
                    price = "${food.minPrice}원 - ${food.maxPrice}원",
                    ingredients = food.ingredients,
                    healthBenefits = food.healthBenefits
                )
            }
    }
    
    private fun calculateScore(food: FoodRecommendation, dto: TestRequestDTO): Double {
        var score = 0.0
        
        val fatigueWeight = dto.scores.tired / 100.0
        val stressWeight = dto.scores.stress / 100.0
        val angerWeight = dto.scores.anger / 100.0
        val appetiteWeight = dto.scores.appetite / 100.0
        
        score += food.energyBoostScore * fatigueWeight * 0.3
        score += food.stressReliefScore * stressWeight * 0.25
        score += food.comfortScore * angerWeight * 0.25
        score += food.appetiteStimulationScore * appetiteWeight * 0.2
        
        val budgetFit = when {
            food.maxPrice <= dto.scores.budget * 0.7 -> 1.0
            food.maxPrice <= dto.scores.budget -> 0.8
            else -> 0.5
        }
        score *= budgetFit
        
        return score
    }
    
    private fun generateReason(food: FoodRecommendation, dto: TestRequestDTO): String {
        val reasons = mutableListOf<String>()
        
        if (dto.scores.tired > 60 && food.energyBoostScore > 70) {
            reasons.add("피로 회복에 효과적인 ${food.ingredients}이 포함되어 있습니다")
        }
        
        if (dto.scores.stress > 60 && food.stressReliefScore > 70) {
            reasons.add("스트레스 완화에 도움되는 영양소가 풍부합니다")
        }
        
        if (dto.scores.anger > 60 && food.comfortScore > 70) {
            reasons.add("마음을 진정시키는 효과가 있는 음식입니다")
        }
        
        if (dto.scores.appetite < 40 && food.appetiteStimulationScore > 60) {
            reasons.add("식욕을 자극하여 영양 섭취를 도와줍니다")
        }
        
        return if (reasons.isNotEmpty()) {
            reasons.joinToString(", ")
        } else {
            "현재 상황에 적합한 균형잡힌 영양을 제공합니다"
        }
    }
}

data class FoodRecommendationResult(
    val name: String,
    val description: String,
    val reason: String,
    val score: Double,
    val price: String,
    val ingredients: String,
    val healthBenefits: String
)