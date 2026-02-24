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
        var candidates = findCandidatesWithFallback(dto)
        
        // 만약 여전히 비어있다면 모든 음식을 대상으로 함
        if (candidates.isEmpty()) {
            candidates = foodRepository.findAll()
        }
        
        return candidates
            .map { food -> calculateScore(food, dto) to food }
            .sortedByDescending { it.first }
            .take(5)
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
    
    private fun findCandidatesWithFallback(dto: TestRequestDTO): List<FoodRecommendation> {
        // DTO의 dining 필드를 시스템이 기대하는 형식으로 변환
        val diningType = when (dto.dining.name) {
            "FRIENDS" -> "WITH_FRIENDS"
            "FAMILY" -> "WITH_FAMILY"
            "COWORKERS" -> "BUSINESS"
            else -> dto.dining.name
        }
        
        // 1단계: 모든 조건 매칭 (예산 + 시간대 + 식사동반자)
        var candidates = foodRepository.findRecommendationsByFilters(
            minBudget = dto.scores.budget / 3,
            maxBudget = dto.scores.budget,
            mealTime = dto.mealTime.name,
            diningType = diningType
        )
        
        if (candidates.isNotEmpty()) return candidates
        
        // 2단계: 예산 + 시간대만 매칭 (식사동반자 조건 완화)
        candidates = foodRepository.findRecommendationsByMealTimeAndBudget(
            minBudget = dto.scores.budget / 3,
            maxBudget = dto.scores.budget,
            mealTime = dto.mealTime.name
        )
        
        if (candidates.isNotEmpty()) return candidates
        
        // 3단계: 예산만 매칭 (시간대 조건도 완화)
        candidates = foodRepository.findRecommendationsByBudgetOnly(
            minBudget = dto.scores.budget / 4, // 예산 범위도 더 넓게
            maxBudget = (dto.scores.budget * 1.5).toInt()
        )
        
        if (candidates.isNotEmpty()) return candidates
        
        // 4단계: 시간대만 매칭 (예산 조건 완화)
        candidates = foodRepository.findRecommendationsByMealTimeOnly(
            mealTime = dto.mealTime.name
        )
        
        return candidates
    }
    
    private fun calculateScore(food: FoodRecommendation, dto: TestRequestDTO): Double {
        var score = 0.0
        
        val fatigueWeight = dto.scores.tired / 100.0
        val stressWeight = dto.scores.stress / 100.0
        val angerWeight = dto.scores.anger / 100.0
        val appetiteWeight = dto.scores.appetite / 100.0
        
        val primaryWeight = when {
            fatigueWeight >= 0.7 -> 0.4
            stressWeight >= 0.7 -> 0.35
            angerWeight >= 0.7 -> 0.35
            appetiteWeight <= 0.3 -> 0.4
            else -> 0.3
        }
        
        val energyScore = food.energyBoostScore * fatigueWeight
        val stressScore = food.stressReliefScore * stressWeight
        val comfortScore = food.comfortScore * angerWeight
        val appetiteScore = food.appetiteStimulationScore * appetiteWeight
        
        val maxIndividualScore = maxOf(energyScore, stressScore, comfortScore, appetiteScore)
        score += maxIndividualScore * primaryWeight
        
        val secondaryScores = listOf(energyScore, stressScore, comfortScore, appetiteScore)
            .filter { it != maxIndividualScore }
        score += secondaryScores.sum() * (1 - primaryWeight) / secondaryScores.size
        
        val synergisticBonus = when {
            fatigueWeight > 0.6 && stressWeight > 0.6 -> 0.15
            stressWeight > 0.6 && angerWeight > 0.6 -> 0.12
            fatigueWeight > 0.6 && appetiteWeight < 0.4 -> 0.1
            else -> 0.0
        }
        score *= (1.0 + synergisticBonus)
        
        val mealTimeBonus = when (dto.mealTime.name) {
            "MORNING" -> if (food.energyBoostScore > 70) 1.2 else 1.0
            "LUNCH" -> if (food.stressReliefScore > 60 || food.energyBoostScore > 60) 1.15 else 1.0
            "DINNER" -> if (food.comfortScore > 70 || food.stressReliefScore > 70) 1.2 else 1.0
            "MIDNIGHT_SNACK" -> if (food.comfortScore > 80) 1.25 else 0.8
            else -> 1.0
        }
        score *= mealTimeBonus
        
        val diningBonus = when (dto.dining.name) {
            "ALONE" -> if (food.comfortScore > 70) 1.1 else 1.0
            "FRIENDS", "FAMILY" -> if (food.category in listOf("한식", "중식", "양식")) 1.15 else 1.0
            "DATE" -> if (food.category in listOf("양식", "이탈리안", "일식")) 1.2 else 1.0
            "COWORKERS" -> if (food.category in listOf("한식", "일식", "아시안")) 1.1 else 1.0
            else -> 1.0
        }
        score *= diningBonus
        
        val budgetFit = when {
            food.maxPrice <= dto.scores.budget * 0.6 -> 1.2
            food.maxPrice <= dto.scores.budget * 0.8 -> 1.1
            food.maxPrice <= dto.scores.budget -> 1.0
            food.maxPrice <= dto.scores.budget * 1.2 -> 0.7
            else -> 0.3
        }
        score *= budgetFit
        
        return score
    }
    
    private fun generateReason(food: FoodRecommendation, dto: TestRequestDTO): String {
        val reasons = mutableListOf<String>()
        
        // 감정 상태별 추천 이유
        if (dto.scores.tired > 60 && food.energyBoostScore > 70) {
            reasons.add("피로 회복에 효과적인 ${food.ingredients}이 포함되어 있습니다")
        } else if (dto.scores.tired > 60 && food.energyBoostScore > 50) {
            reasons.add("적당한 에너지 공급으로 피로감을 덜어줄 수 있습니다")
        }
        
        if (dto.scores.stress > 60 && food.stressReliefScore > 70) {
            reasons.add("스트레스 완화에 도움되는 영양소가 풍부합니다")
        } else if (dto.scores.stress > 60 && food.stressReliefScore > 50) {
            reasons.add("마음의 안정을 찾는데 도움이 됩니다")
        }
        
        if (dto.scores.anger > 60 && food.comfortScore > 70) {
            reasons.add("마음을 진정시키는 효과가 있는 음식입니다")
        } else if (dto.scores.anger > 60 && food.comfortScore > 50) {
            reasons.add("기분 전환에 도움이 되는 음식입니다")
        }
        
        if (dto.scores.appetite < 40 && food.appetiteStimulationScore > 60) {
            reasons.add("식욕을 자극하여 영양 섭취를 도와줍니다")
        } else if (dto.scores.appetite < 40 && food.appetiteStimulationScore > 40) {
            reasons.add("부담 없이 섭취할 수 있어 영양 보충에 좋습니다")
        }
        
        // 시간대별 추천 이유 추가
        val mealTimeReason = when (dto.mealTime.name) {
            "MORNING" -> if (food.energyBoostScore > 60) "아침 식사로 하루를 활기차게 시작할 수 있습니다" else null
            "LUNCH" -> if (food.energyBoostScore > 50 || food.stressReliefScore > 50) "점심 시간 에너지 보충에 적합합니다" else null
            "DINNER" -> if (food.comfortScore > 60) "저녁 식사로 하루의 피로를 달래주는 음식입니다" else null
            "MIDNIGHT_SNACK" -> if (food.comfortScore > 50) "야식으로 즐기기에 좋은 음식입니다" else null
            else -> null
        }
        
        mealTimeReason?.let { reasons.add(it) }
        
        return if (reasons.isNotEmpty()) {
            reasons.take(2).joinToString(", ") // 최대 2개의 이유만 표시
        } else {
            // 마지막 대안 메시지들
            when {
                food.category == "한식" -> "한국인의 입맛에 친숙한 영양 만점 음식입니다"
                food.category == "서양식" -> "다양한 영양소를 균형있게 섭취할 수 있습니다"
                food.category == "중식" -> "든든하고 만족스러운 식사가 될 것입니다"
                food.category == "일식" -> "깔끔하고 건강한 식사 옵션입니다"
                food.category == "분식" -> "간편하면서도 맛있는 선택입니다"
                else -> "현재 상황에 적합한 균형잡힌 영양을 제공합니다"
            }
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