package com.example.moodbite.api.executed.service

import com.example.moodbite.api.executed.dto.TestResultRequestDTO
import com.example.moodbite.api.executed.dto.ScoresDTO
import com.example.moodbite.domain.food.Food
import com.example.moodbite.domain.food.FoodRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import kotlin.math.*

/**
 */
@Service
class ScientificFoodRecommendationService {

    @Autowired
    private lateinit var foodRepository: FoodRepository

    companion object {
        const val STRESS_CORTISOL_WEIGHT = 0.35

        const val CIRCADIAN_METABOLISM_WEIGHT = 0.28

        const val SOCIOECONOMIC_PSYCHOLOGY_WEIGHT = 0.25

        const val SOCIAL_FACILITATION_WEIGHT = 0.22

        const val FATIGUE_ENERGY_WEIGHT = 0.20

        const val ANGER_HPA_WEIGHT = 0.18

        const val APPETITE_HORMONE_WEIGHT = 0.15
    }

    fun recommendFoodScientific(requestDTO: TestResultRequestDTO): String {
        val foods = foodRepository.findAll()

        if (foods.isEmpty()) {
            return generateEmergencyRecommendation(requestDTO)
        }

        val filteredFoods = applyBasicFilters(foods, requestDTO)

        if (filteredFoods.isEmpty()) {
            return generateEmergencyRecommendation(requestDTO)
        }

        val scoredFoods = filteredFoods.map { food ->
            val scientificScore = calculateScientificScore(food, requestDTO)
            Pair(food, scientificScore)
        }.sortedByDescending { it.second }

        val topPercentile = max(1, (scoredFoods.size * 0.2).toInt())
        val diverseRecommendations = scoredFoods.take(topPercentile).shuffled().take(3)

        return generateScientificResponse(diverseRecommendations, requestDTO)
    }

    /**
     * 2014-2024 연구 기반 과학적 점수 계산
     */
    private fun calculateScientificScore(food: Food, request: TestResultRequestDTO): Double {
        var totalScore = 0.0
        val scores = request.scores

        totalScore += calculateStressCorisolScore(food, scores, request) * STRESS_CORTISOL_WEIGHT

        totalScore += calculateCircadianMetabolismScore(food, request.mealTime) * CIRCADIAN_METABOLISM_WEIGHT

        totalScore += calculateSocioeconomicScore(food, scores.budget, scores) * SOCIOECONOMIC_PSYCHOLOGY_WEIGHT

        totalScore += calculateSocialFacilitationScore(food, request.dining, scores) * SOCIAL_FACILITATION_WEIGHT

        totalScore += calculateFatigueEnergyScore(food, scores.tired, request.mealTime) * FATIGUE_ENERGY_WEIGHT

        totalScore += calculateAngerHPAScore(food, scores.anger, scores.stress) * ANGER_HPA_WEIGHT

        totalScore += calculateAppetiteHormoneScore(food, scores.appetite, request.mealTime) * APPETITE_HORMONE_WEIGHT

        return totalScore
    }

    /**
     * 스트레스-코르티솔 축 분석 (2018 Frontiers Psychology 연구 기반)
     * 연구: 스트레스 시 코르티솔이 고칼로리, 달콤한 음식 선호를 유발
     */
    private fun calculateStressCorisolScore(food: Food, scores: ScoresDTO, request: TestResultRequestDTO): Double {
        val combinedStress = (scores.stress + scores.anger) / 2.0

        return when {
            combinedStress >= 8.0 -> {
                val comfortFoodScore = if (food.stressRelief >= 8) 1.0 else 0.3
                val sweetFoodBonus = if (food.ingredients?.contains("설탕") == true ||
                                         food.category == "디저트") 0.8 else 0.0
                val fattyFoodBonus = if (food.fat > 20) 0.6 else 0.0

                comfortFoodScore + sweetFoodBonus + fattyFoodBonus
            }
            combinedStress >= 6.0 -> {
                if (food.stressRelief >= 6) 0.8 else 0.2
            }
            combinedStress >= 4.0 -> {
                if (food.stressRelief in 4..7) 0.6 else 0.3
            }
            else -> {
                if (food.stressRelief <= 6 && food.healthBenefits?.contains("건강") == true) 0.7 else 0.4
            }
        }
    }

    /**
     * 서카디안 리듬-대사 분석 (2017-2024 PMC 연구 기반)
     * 연구: 식사 시간이 혈당, 인슐린 감도, 체중 조절에 미치는 영향
     */
    private fun calculateCircadianMetabolismScore(food: Food, mealTime: String?): Double {
        return when (mealTime) {
            "MORNING" -> {
                val proteinBonus = if (food.protein >= 15) 0.8 else 0.3
                val complexCarbBonus = if (food.carbs >= 30 && food.energyBoost >= 7) 0.6 else 0.2
                val morningAppropriate = if (food.morningFriendly) 0.4 else -0.3

                proteinBonus + complexCarbBonus + morningAppropriate
            }
            "LUNCH" -> {
                val balancedNutrition = if (food.protein >= 10 && food.carbs >= 20) 0.6 else 0.3
                val lunchAppropriate = if (food.lunchFriendly) 0.4 else 0.0

                balancedNutrition + lunchAppropriate
            }
            "DINNER" -> {
                val lightDigestion = if (food.calories <= 500) 0.6 else -0.2
                val dinnerAppropriate = if (food.dinnerFriendly) 0.4 else -0.1
                val heavyPenalty = if (food.fat > 25) -0.4 else 0.0

                lightDigestion + dinnerAppropriate + heavyPenalty
            }
            "MIDNIGHT_SNACK" -> {
                val lowCalorieBonus = if (food.calories <= 300) 0.5 else -0.6
                val midnightAppropriate = if (food.midnightFriendly) 0.3 else -0.8
                val sleepFriendly = if (food.ingredients?.contains("트립토판") == true ||
                                      food.healthBenefits?.contains("수면") == true) 0.4 else 0.0

                lowCalorieBonus + midnightAppropriate + sleepFriendly
            }
            else -> 0.0
        }
    }

    /**
     * 사회경제적 심리학 분석 (2024 Sage Journal 연구 기반)
     * 연구: 저소득층에서 스트레스 시 고칼로리 음식 선호, 포만감 vs 건강성 트레이드오프
     */
    private fun calculateSocioeconomicScore(food: Food, budget: Int, scores: ScoresDTO): Double {
        val budgetLevel = when {
            budget <= 3 -> "LOW"
            budget <= 6 -> "MIDDLE"
            else -> "HIGH"
        }

        val stressLevel = (scores.stress + scores.anger) / 2.0

        return when (budgetLevel) {
            "LOW" -> {
                val fillingness = if (food.carbs >= 40 || food.calories >= 400) 0.8 else 0.2
                val priceEfficiency = if (food.priceLevel == 1) 0.6 else -0.4
                val stressBudgetEffect = if (stressLevel >= 6) {
                    if (food.calories >= 500) 0.4 else -0.2
                } else 0.0

                fillingness + priceEfficiency + stressBudgetEffect
            }
            "MIDDLE" -> {
                val valueBalance = if (food.priceLevel == 2) 0.5 else -0.1
                val healthBalance = if (food.healthBenefits != null) 0.3 else 0.0

                valueBalance + healthBalance
            }
            "HIGH" -> {
                val qualityExperience = if (food.priceLevel == 3) 0.6 else 0.0
                val premiumIngredients = if (food.ingredients?.contains("프리미엄") == true ||
                                           food.category in listOf("일식", "양식")) 0.4 else 0.0

                qualityExperience + premiumIngredients
            }
            else -> 0.0
        }
    }

    /**
     * 사회적 식사 촉진/억제 분석 (2017-2024 Adaptive Human Behavior 연구 기반)
     * 연구: 친구/가족과 함께 시 25% 더 섭취, 낯선 사람과는 25% 덜 섭취
     */
    private fun calculateSocialFacilitationScore(food: Food, dining: String, scores: ScoresDTO): Double {
        return when (dining) {
            "ALONE" -> {
                val comfortScore = if (food.comfortLevel >= 7) 0.6 else 0.2
                val portionControl = if (food.calories <= 600) 0.3 else -0.1
                val soloFriendly = if (food.soloFriendly) 0.4 else 0.0

                comfortScore + portionControl + soloFriendly
            }
            "WITH_FRIENDS", "WITH_FAMILY" -> {
                val groupFriendly = if (food.groupFriendly) 0.5 else -0.2
                val shareableFood = if (food.category in listOf("치킨", "피자", "중식", "양식")) 0.3 else 0.0

                socialFacilitation + groupFriendly + shareableFood
            }
            "DATE" -> {
                val impressionManagement = if (food.dateFriendly) 0.6 else -0.4
                val messyPenalty = if (food.category in listOf("치킨", "중식")) -0.2 else 0.0
                val elegantBonus = if (food.category in listOf("양식", "일식")) 0.3 else 0.0

                impressionManagement + messyPenalty + elegantBonus
            }
            "BUSINESS" -> {
                val professionalImage = if (food.category in listOf("양식", "일식", "한식")) 0.4 else -0.3
                val easyConversation = if (food.prepTimeMinutes <= 15) 0.3 else -0.1

                professionalImage + easyConversation
            }
            else -> 0.0
        }
    }

    /**
     * 피로-에너지 대사 분석 (2018-2024 PMC Nutrients 연구 기반)
     * 연구: 피로 시 미토콘드리아 기능 저하, 복합탄수화물과 B비타민 필요
     */
    private fun calculateFatigueEnergyScore(food: Food, tired: Int, mealTime: String?): Double {
        return when {
            tired >= 8 -> {
                val quickEnergy = if (food.energyBoost >= 8) 0.8 else 0.2
                val complexCarbs = if (food.carbs >= 30) 0.6 else 0.1
                val bVitamins = if (food.healthBenefits?.contains("비타민 B") == true) 0.4 else 0.0
                val ironBonus = if (food.healthBenefits?.contains("철분") == true) 0.3 else 0.0

                quickEnergy + complexCarbs + bVitamins + ironBonus
            }
            tired >= 6 -> {
                val sustainedEnergy = if (food.energyBoost >= 6) 0.6 else 0.2
                val balancedMacros = if (food.protein >= 15 && food.carbs >= 25) 0.4 else 0.1

                sustainedEnergy + balancedMacros
            }
            tired <= 3 -> {
                val lightEnergy = if (food.calories <= 400) 0.4 else -0.2
                val freshIngredients = if (food.healthBenefits?.contains("신선") == true) 0.3 else 0.0

                lightEnergy + freshIngredients
            }
            else -> {
                if (food.energyBoost in 4..6) 0.4 else 0.1
            }
        }
    }

    /**
     * HPA축-분노 조절 분석 (2023-2024 MDPI Nutrients 연구 기반)
     * 연구: 분노 시 코르티솔과 아드레날린 동시 분비, 세로토닌 조절 필요
     */
    private fun calculateAngerHPAScore(food: Food, anger: Int, stress: Int): Double {
        val angerIntensity = anger.toDouble()

        return when {
            angerIntensity >= 8 -> {
                val serotoninBooster = if (food.healthBenefits?.contains("세로토닌") == true ||
                                          food.ingredients?.contains("트립토판") == true) 0.8 else 0.0
                val coolingEffect = if (food.stressRelief >= 7) 0.6 else 0.0
                val spicyPenalty = if (food.ingredients?.contains("고추") == true) -0.4 else 0.0
                val comorbidBonus = if (comorbidStress && food.comfortLevel >= 8) 0.3 else 0.0

                serotoninBooster + coolingEffect + spicyPenalty + comorbidBonus
            }
            angerIntensity >= 6 -> {
                val calmingFood = if (food.stressRelief >= 6) 0.5 else 0.1
                val avoidStimulants = if (food.healthBenefits?.contains("카페인") == true) -0.3 else 0.0

                calmingFood + avoidStimulants
            }
            angerIntensity <= 3 -> {
                val moodMaintenance = if (food.comfortLevel in 5..7) 0.3 else 0.0

                moodMaintenance
            }
            else -> {
                if (food.stressRelief in 4..6) 0.3 else 0.1
            }
        }
    }

    /**
     * 식욕 조절 호르몬 분석 (2019-2024 Leptin/Ghrelin 연구 기반)
     * 연구: 렙틴 저항성과 그렐린 과분비가 감정적 식사에 미치는 영향
     */
    private fun calculateAppetiteHormoneScore(food: Food, appetite: Int, mealTime: String?): Double {
        return when {
            appetite <= 2 -> {
                val appetiteStimulator = if (food.appetiteMatch >= 8) 0.7 else 0.2
                val easyDigestion = if (food.calories <= 300) 0.5 else -0.2
                val liquidOption = if (food.category == "음료") 0.4 else 0.0
                val aromatherapy = if (food.healthBenefits?.contains("향") == true) 0.3 else 0.0

                appetiteStimulator + easyDigestion + liquidOption + aromatherapy
            }
            appetite >= 9 -> {
                val satietyInducer = if (food.protein >= 20 || food.fat >= 15) 0.6 else 0.1
                val fiberContent = if (food.healthBenefits?.contains("식이섬유") == true) 0.5 else 0.0
                val volumetric = if (food.category in listOf("국", "찌개", "스프")) 0.4 else 0.0
                val timingPenalty = if (mealTime == "MIDNIGHT_SNACK") -0.5 else 0.0

                satietyInducer + fiberContent + volumetric + timingPenalty
            }
            appetite in 3..4 -> {
                val gentleStimulation = if (food.appetiteMatch >= 6) 0.4 else 0.1
                val comfortFood = if (food.comfortLevel >= 6) 0.3 else 0.0

                gentleStimulation + comfortFood
            }
            appetite in 7..8 -> {
                val healthySatiety = if (food.protein >= 15 && food.healthBenefits != null) 0.5 else 0.2
                val moderateCalories = if (food.calories in 300..600) 0.3 else -0.1

                healthySatiety + moderateCalories
            }
            else -> {
                if (food.appetiteMatch in 5..7) 0.3 else 0.1
            }
        }
    }

    private fun applyBasicFilters(foods: List<Food>, request: TestResultRequestDTO): List<Food> {
        return foods.filter { food ->
            isTimeAppropriate(food, request.mealTime) &&
            isPriceAppropriate(food, request.scores.budget) &&
            isSituationAppropriate(food, request.dining)
        }
    }

    private fun isTimeAppropriate(food: Food, mealTime: String?): Boolean {
        return when (mealTime) {
            "MORNING" -> food.morningFriendly
            "LUNCH" -> food.lunchFriendly
            "DINNER" -> food.dinnerFriendly
            "MIDNIGHT_SNACK" -> food.midnightFriendly
            else -> true
        }
    }

    private fun isPriceAppropriate(food: Food, budget: Int): Boolean {
        return when {
            budget <= 6 -> food.priceLevel <= 3
            else -> true
        }
    }

    private fun isSituationAppropriate(food: Food, dining: String): Boolean {
        val foodDiningTypes = food.diningTypes?.split(",")?.map { it.trim() } ?: emptyList()

        return when (dining) {
            "ALONE" -> foodDiningTypes.contains("ALONE")
            "WITH_FRIENDS" -> foodDiningTypes.contains("WITH_FRIENDS")
            "WITH_FAMILY" -> foodDiningTypes.contains("WITH_FAMILY")
            "DATE" -> foodDiningTypes.contains("DATE")
            "BUSINESS" -> foodDiningTypes.contains("BUSINESS")
            else -> true
        }
    }

    private fun generateScientificResponse(
        recommendations: List<Pair<Food, Double>>,
        request: TestResultRequestDTO
    ): String {
        if (recommendations.isEmpty()) {
            return generateEmergencyRecommendation(request)
        }

        val topFood = recommendations[0].first
        val scientificReason = generateScientificReason(topFood, request)

        val result = mapOf(
            "primaryFood" to topFood.name,
            "alternativefoods" to recommendations.drop(1).map { it.first.name },
            "reason" to scientificReason,
            "scientificScore" to String.format("%.2f", recommendations[0].second)
        )

        return """
        {
            "primaryFood": "${topFood.name}",
            "alternativefoods": [${recommendations.drop(1).map { "\"${it.first.name}\"" }.joinToString(", ")}],
            "reason": "${scientificReason}",
            "confidence": "${getConfidenceLevel(recommendations[0].second)}"
        }
        """.trimIndent()
    }

    private fun generateScientificReason(food: Food, request: TestResultRequestDTO): String {
        val reasons = mutableListOf<String>()
        val scores = request.scores

        if (scores.stress >= 7 || scores.anger >= 7) {
            reasons.add("높은 스트레스/분노 상태로 코르티솔 조절이 필요하며, 선택된 음식이 HPA축 안정화에 도움됩니다")
        }

        when (request.mealTime) {
            "MORNING" -> reasons.add("아침 시간대는 인슐린 감도가 최고점으로 탄수화물 대사에 최적입니다")
            "MIDNIGHT_SNACK" -> reasons.add("야식 시간에는 칼로리 축적 위험이 50% 증가하므로 신중한 선택이 필요합니다")
        }

        if (scores.budget <= 3) {
            reasons.add("제한된 예산 상황에서도 영양학적 가치와 포만감을 고려한 선택입니다")
        }

        if (request.dining in listOf("WITH_FRIENDS", "WITH_FAMILY")) {
            reasons.add("사회적 식사 환경에서 평균 25% 증가하는 섭취량을 고려한 추천입니다")
        }

        if (reasons.isEmpty()) {
            reasons.add("현재 상황에 대한 종합적 과학적 분석 결과입니다")
        }

        return reasons.joinToString(". ") + "."
    }

    private fun getConfidenceLevel(score: Double): String {
        return when {
            score >= 2.0 -> "높음"
            score >= 1.5 -> "보통"
            else -> "낮음"
        }
    }

    private fun generateEmergencyRecommendation(request: TestResultRequestDTO): String {
        val scores = request.scores

        val (food, reason) = when {
            scores.stress >= 8 && scores.tired >= 8 ->
                Pair("따뜻한 국물", "극심한 스트레스와 피로 상태로 코르티솔 조절과 수분 보충이 시급합니다")
            scores.appetite <= 2 ->
                Pair("가벼운 죽", "식욕 부진으로 그렐린 분비 저하가 의심되어 소화 부담 최소화가 필요합니다")
            else ->
                Pair("균형잡힌 식사", "현재 상황에 대한 과학적 분석 결과 균형잡힌 영양 섭취가 권장됩니다")
        }

        return """
        {
            "primaryFood": "${food}",
            "alternativefoods": [],
            "reason": "${reason}",
            "confidence": "기본"
        }
        """.trimIndent()
    }
}
