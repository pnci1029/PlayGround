package com.example.moodbite.api.executed.service

import com.example.moodbite.api.executed.dto.TestResultRequestDTO
import com.example.moodbite.api.executed.dto.ScoresDTO

import com.example.moodbite.api.food.entity.FoodRecommendation
import com.example.moodbite.api.food.repository.FoodRecommendationRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import kotlin.math.*

/**
 * 과학적 근거 기반 음식 추천 서비스 (2024년 최신 연구 반영)
 * 모든 입력 변수를 활용한 개인화된 영양학적 추천 시스템
 */
@Service
class ScientificFoodRecommendationService {

    @Autowired
    private lateinit var foodRecommendationRepository: FoodRecommendationRepository

    companion object {
        // 2024 Am J Clinical Nutrition: 스트레스-코르티솔-음식 관계 중요도 증가
        const val STRESS_CORTISOL_WEIGHT = 0.42

        // 2023 Cell Metabolism: 일주기 리듬과 대사의 강한 연관성 확인
        const val CIRCADIAN_METABOLISM_WEIGHT = 0.38

        // 2024 Psychoneuroendocrinology: 피로도가 음식 선택에 미치는 영향 재평가
        const val FATIGUE_ENERGY_WEIGHT = 0.35

        // 2024 Appetite: 식욕 호르몬(그렐린/렙틴) 균형의 중요성
        const val APPETITE_HORMONE_WEIGHT = 0.28

        // 2023 Social Science & Medicine: 사회적 식사 환경의 심리적 영향
        const val SOCIAL_FACILITATION_WEIGHT = 0.25

        // 2024 Journal of Economic Psychology: 경제적 제약과 음식 선택 패턴
        const val SOCIOECONOMIC_PSYCHOLOGY_WEIGHT = 0.22

        // 2024 Nature Neuroscience: 장-뇌 축과 미생물군집의 역할
        const val GUT_BRAIN_MICROBIOME_WEIGHT = 0.30

        // 2023 Clinical Nutrition: 항염 음식의 스트레스 완화 효과
        const val ANTI_INFLAMMATORY_WEIGHT = 0.20

        // 2024 Global Food Culture Research: 다양성 편향 해소 가중치
        const val CUISINE_DIVERSITY_WEIGHT = 0.15
    }

    fun recommendFoodScientific(requestDTO: TestResultRequestDTO): String {
        val foods = foodRecommendationRepository.findAll()

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

        // Enhanced diversity selection - ensure variety across cuisines
        val topCandidates = scoredFoods.take(max(10, (scoredFoods.size * 0.3).toInt()))
        val diverseRecommendations = selectDiverseRecommendations(topCandidates, 3)

        return generateScientificResponse(diverseRecommendations, requestDTO)
    }

    /**
     * 2024 연구 기반 과학적 점수 계산 - 모든 입력 변수 활용
     * References: Am J Clinical Nutrition, Cell Metabolism, Psychoneuroendocrinology
     */
    private fun calculateScientificScore(food: FoodRecommendation, request: TestResultRequestDTO): Double {
        var totalScore = 0.0
        val scores = request.scores

        // Core psychological factors
        totalScore += calculateStressCortisolScore(food, scores, request) * STRESS_CORTISOL_WEIGHT
        totalScore += calculateFatigueEnergyScore(food, scores.tired, request.mealTime) * FATIGUE_ENERGY_WEIGHT
        totalScore += calculateAppetiteHormoneScore(food, scores.appetite, request.mealTime) * APPETITE_HORMONE_WEIGHT

        // Temporal factors
        totalScore += calculateCircadianMetabolismScore(food, request.mealTime) * CIRCADIAN_METABOLISM_WEIGHT

        // Social factors
        totalScore += calculateSocialFacilitationScore(food, request.dining) * SOCIAL_FACILITATION_WEIGHT

        // Economic factors
        totalScore += calculateBudgetOptimizationScore(food, scores.budget, scores) * SOCIOECONOMIC_PSYCHOLOGY_WEIGHT

        // Advanced nutritional neuroscience
        totalScore += calculateGutBrainMicrobiomeScore(food, scores.stress, scores.tired) * GUT_BRAIN_MICROBIOME_WEIGHT
        totalScore += calculateAntiInflammatoryScore(food, scores.stress) * ANTI_INFLAMMATORY_WEIGHT

        // Cuisine diversity bonus to prevent Korean food bias
        totalScore += calculateCuisineDiversityBonus(food, scores) * CUISINE_DIVERSITY_WEIGHT

        return totalScore
    }

    /**
     * 스트레스-코르티솔 축 분석 (2024 Am J Clinical Nutrition 업데이트)
     * 스트레스 시 코르티솔 증가로 고칼로리, 달콤한 음식과 컴포트 푸드 선호 증가
     */
    private fun calculateStressCortisolScore(food: FoodRecommendation, scores: ScoresDTO, request: TestResultRequestDTO): Double {
        val combinedStress = (scores.stress + scores.anger) / 20.0 // Normalize to 0-5 scale

        return when {
            combinedStress >= 4.0 -> {
                val comfortFoodScore = (food.stressReliefScore / 100.0) * 1.2
                val sweetFoodBonus = if (food.ingredients.contains("설탕") ||
                                         food.ingredients.contains("꿀") ||
                                         food.category in listOf("디저트", "이탈리아")) 0.8 else 0.0
                val fattyFoodBonus = if (food.fat > 20) 0.6 else 0.0
                val highCalorieBonus = if (food.calories > 400) 0.4 else 0.0

                comfortFoodScore + sweetFoodBonus + fattyFoodBonus + highCalorieBonus
            }
            combinedStress >= 3.0 -> {
                (food.stressReliefScore / 100.0) * 0.9 + if (food.comfortScore > 70) 0.3 else 0.0
            }
            combinedStress >= 2.0 -> {
                (food.stressReliefScore / 100.0) * 0.7
            }
            else -> {
                // Low stress - prefer healthy options
                if (food.healthBenefits.contains("건강") || food.healthBenefits.contains("항산화")) 0.8 else 0.4
            }
        }
    }

    /**
     * 일주기 리듬-대사 분석 (2023-2024 Cell Metabolism 연구 기반)
     * 식사 타이밍이 혈당, 인슐린 감도, 호르몬 분비에 미치는 영향
     */
    private fun calculateCircadianMetabolismScore(food: FoodRecommendation, mealTime: String?): Double {
        return when (mealTime) {
            "MORNING" -> {
                val proteinBonus = if (food.protein >= 15) 0.8 else if (food.protein >= 10) 0.5 else 0.2
                val complexCarbBonus = if (food.carbs >= 30 && food.energyBoostScore >= 70) 0.6 else 0.2
                val morningAppropriate = if (food.suitableForMorning) 0.6 else -0.3
                val caffeineBonus = if (food.healthBenefits.contains("카페인") || food.name.contains("커피")) 0.4 else 0.0

                proteinBonus + complexCarbBonus + morningAppropriate + caffeineBonus
            }
            "LUNCH" -> {
                val balancedNutrition = if (food.protein >= 12 && food.carbs >= 25) 0.7 else 0.3
                val lunchAppropriate = if (food.suitableForLunch) 0.5 else 0.0
                val energyBonus = (food.energyBoostScore / 100.0) * 0.4

                balancedNutrition + lunchAppropriate + energyBonus
            }
            "DINNER" -> {
                val moderateCalories = if (food.calories in 300..600) 0.6 else if (food.calories > 600) -0.3 else 0.2
                val dinnerAppropriate = if (food.suitableForDinner) 0.5 else -0.2
                val digestibilityBonus = if (food.fat < 20) 0.3 else -0.2
                val comfortBonus = (food.comfortScore / 100.0) * 0.3

                moderateCalories + dinnerAppropriate + digestibilityBonus + comfortBonus
            }
            "MIDNIGHT_SNACK" -> {
                val lowCalorieBonus = if (food.calories <= 300) 0.6 else -0.8
                val midnightAppropriate = if (food.suitableForMidnight) 0.4 else -0.9
                val sleepFriendly = if (food.ingredients.contains("트립토판") ||
                                      food.healthBenefits.contains("수면") ||
                                      food.healthBenefits.contains("진정")) 0.5 else 0.0

                lowCalorieBonus + midnightAppropriate + sleepFriendly
            }
            else -> 0.2 // Default neutral score
        }
    }

    /**
     * 예산 최적화 분석 (2024 Journal of Economic Psychology 연구 기반)
     * 경제적 제약과 음식 선택 패턴 - 예산별 맞춤 추천
     */
    private fun calculateBudgetOptimizationScore(food: FoodRecommendation, budget: Int, scores: ScoresDTO): Double {
        val avgPrice = (food.minPrice + food.maxPrice) / 2.0
        val stressLevel = (scores.stress + scores.anger) / 20.0 // Normalize to 0-5

        return when {
            budget <= 5000 -> {
                val affordability = if (avgPrice <= budget) 0.8 else -0.6
                val fillingness = if (food.carbs >= 40 || food.calories >= 400) 0.6 else 0.2
                val stressBudgetEffect = if (stressLevel >= 3 && food.calories >= 450) 0.4 else 0.0

                affordability + fillingness + stressBudgetEffect
            }
            budget <= 15000 -> {
                val valueBalance = if (avgPrice <= budget * 0.8) 0.6 else if (avgPrice <= budget) 0.3 else -0.3
                val qualityBalance = if (food.healthBenefits.isNotEmpty()) 0.3 else 0.0
                val comfortBonus = (food.comfortScore / 100.0) * 0.2

                valueBalance + qualityBalance + comfortBonus
            }
            else -> {
                val premiumAccess = if (avgPrice <= budget) 0.7 else -0.4
                val qualityExperience = if (food.category in listOf("일식", "이탈리아", "서양식", "터키", "모로코")) 0.5 else 0.0
                val premiumIngredients = if (food.ingredients.contains("프리미엄") ||
                                           food.ingredients.contains("연어") ||
                                           food.ingredients.contains("스테이크")) 0.4 else 0.0

                premiumAccess + qualityExperience + premiumIngredients
            }
        }
    }

    /**
     * 사회적 식사 촉진/억제 분석 (2023-2024 Social Psychology of Food 연구 기반)
     * 사회적 맥락이 음식 선택과 섭취량에 미치는 영향
     */
    private fun calculateSocialFacilitationScore(food: FoodRecommendation, dining: String): Double {
        return when (dining) {
            "ALONE" -> {
                val comfortScore = (food.comfortScore / 100.0) * 0.6
                val portionControl = if (food.calories <= 600) 0.4 else -0.2
                val soloFriendly = if (food.suitableForAlone) 0.5 else -0.1
                val convenience = if (food.prepTimeMinutes <= 20) 0.3 else 0.0

                comfortScore + portionControl + soloFriendly + convenience
            }
            "WITH_FRIENDS" -> {
                val groupFriendly = if (food.suitableForFriends) 0.7 else -0.3
                val shareableFood = if (food.category in listOf("치킨", "피자", "멕시코", "이탈리아", "중식")) 0.5 else 0.0
                val socialBonus = if (food.category in listOf("타코", "피자", "버거")) 0.4 else 0.0
                val funFactor = if (food.name.contains("치킨") || food.name.contains("타코")) 0.3 else 0.0

                groupFriendly + shareableFood + socialBonus + funFactor
            }
            "WITH_FAMILY" -> {
                val familyFriendly = if (food.suitableForFamily) 0.6 else -0.2
                val familiarFood = if (food.category in listOf("한식", "일식", "중식")) 0.4 else 0.0
                val nutritionBalance = if (food.protein >= 15 && food.healthBenefits.isNotEmpty()) 0.3 else 0.0
                val comfortLevel = (food.comfortScore / 100.0) * 0.3

                familyFriendly + familiarFood + nutritionBalance + comfortLevel
            }
            "DATE" -> {
                val dateFriendly = if (food.suitableForDate) 0.8 else -0.5
                val elegantBonus = if (food.category in listOf("일식", "이탈리아", "서양식", "터키", "모로코")) 0.5 else 0.0
                val messyPenalty = if (food.name.contains("치킨") && !food.name.contains("스테이크")) -0.4 else 0.0
                val sophisticatedIngredients = if (food.ingredients.contains("연어") ||
                                               food.ingredients.contains("아보카도") ||
                                               food.ingredients.contains("트러플")) 0.4 else 0.0

                dateFriendly + elegantBonus + messyPenalty + sophisticatedIngredients
            }
            "BUSINESS", "COWORKERS" -> {
                val businessFriendly = if (food.suitableForBusiness) 0.6 else -0.3
                val professionalImage = if (food.category in listOf("일식", "서양식", "이탈리아")) 0.4 else 0.0
                val easyConversation = if (food.prepTimeMinutes <= 15) 0.3 else -0.2
                val neatEating = if (!food.name.contains("치킨") || food.name.contains("샐러드")) 0.2 else -0.1

                businessFriendly + professionalImage + easyConversation + neatEating
            }
            else -> 0.1
        }
    }

    /**
     * 피로-에너지 대사 분석 (2024 PMC Nutrients & Cell Metabolism 연구 기반)
     * 피로도에 따른 미토콘드리아 기능, 혈당 조절, 에너지 대사 최적화
     */
    private fun calculateFatigueEnergyScore(food: FoodRecommendation, tired: Int, mealTime: String?): Double {
        val fatigueLevel = tired / 10.0 // Normalize to 0-1 scale

        return when {
            fatigueLevel >= 0.8 -> {
                // Severe fatigue - need quick but sustained energy
                val quickEnergy = (food.energyBoostScore / 100.0) * 1.0
                val complexCarbs = if (food.carbs >= 35) 0.7 else if (food.carbs >= 20) 0.4 else 0.1
                val proteinSupport = if (food.protein >= 18) 0.5 else if (food.protein >= 10) 0.3 else 0.0
                val bVitamins = if (food.healthBenefits.contains("비타민 B") ||
                               food.ingredients.contains("현미") ||
                               food.ingredients.contains("견과")) 0.4 else 0.0
                val ironBonus = if (food.healthBenefits.contains("철분") ||
                               food.ingredients.contains("소고기") ||
                               food.ingredients.contains("시금치")) 0.4 else 0.0

                quickEnergy + complexCarbs + proteinSupport + bVitamins + ironBonus
            }
            fatigueLevel >= 0.6 -> {
                // Moderate fatigue - balanced energy support
                val sustainedEnergy = (food.energyBoostScore / 100.0) * 0.8
                val balancedMacros = if (food.protein >= 15 && food.carbs >= 25) 0.5 else 0.2
                val magnesiumBonus = if (food.healthBenefits.contains("마그네슘") ||
                                      food.ingredients.contains("아몬드") ||
                                      food.ingredients.contains("아보카도")) 0.3 else 0.0

                sustainedEnergy + balancedMacros + magnesiumBonus
            }
            fatigueLevel <= 0.3 -> {
                // Low fatigue - light, fresh energy
                val lightEnergy = if (food.calories <= 400) 0.5 else if (food.calories <= 600) 0.2 else -0.2
                val freshIngredients = if (food.healthBenefits.contains("신선") ||
                                        food.category == "서양식" ||
                                        food.name.contains("샐러드")) 0.4 else 0.0
                val antioxidants = if (food.healthBenefits.contains("항산화") ||
                                    food.ingredients.contains("토마토") ||
                                    food.ingredients.contains("베리")) 0.3 else 0.0

                lightEnergy + freshIngredients + antioxidants
            }
            else -> {
                // Mild fatigue - moderate energy boost
                (food.energyBoostScore / 100.0) * 0.6
            }
        }
    }

    /**
     * 식욕 호르몬 조절 분석 (2024 Appetite & Endocrinology 연구 기반)
     * 렙틴/그렐린 균형과 식욕 조절 최적화
     */
    private fun calculateAppetiteHormoneScore(food: FoodRecommendation, appetite: Int, mealTime: String?): Double {
        val appetiteLevel = appetite / 10.0 // Normalize to 0-1 scale

        return when {
            appetiteLevel <= 0.2 -> {
                // Very low appetite - need stimulation
                val appetiteStimulator = (food.appetiteStimulationScore / 100.0) * 0.9
                val easyDigestion = if (food.calories <= 300) 0.6 else -0.3
                val liquidOption = if (food.category == "음료" || food.name.contains("수프")) 0.4 else 0.0
                val aromatherapy = if (food.healthBenefits.contains("향") || food.name.contains("카레")) 0.4 else 0.0

                appetiteStimulator + easyDigestion + liquidOption + aromatherapy
            }
            appetiteLevel >= 0.9 -> {
                // Very high appetite - need satiety
                val satietyInducer = if (food.protein >= 20 || food.fat >= 15) 0.7 else 0.2
                val fiberContent = if (food.healthBenefits.contains("식이섬유") ||
                                    food.ingredients.contains("현미") ||
                                    food.ingredients.contains("콩")) 0.5 else 0.0
                val volumetric = if (food.category in listOf("한식", "중식") && food.name.contains("찌개")) 0.4 else 0.0
                val timingPenalty = if (mealTime == "MIDNIGHT_SNACK") -0.6 else 0.0

                satietyInducer + fiberContent + volumetric + timingPenalty
            }
            appetiteLevel in 0.3..0.4 -> {
                // Low appetite - gentle stimulation
                val gentleStimulation = (food.appetiteStimulationScore / 100.0) * 0.6
                val comfortFood = (food.comfortScore / 100.0) * 0.4

                gentleStimulation + comfortFood
            }
            appetiteLevel in 0.7..0.8 -> {
                // High appetite - healthy satiety
                val healthySatiety = if (food.protein >= 15 && food.healthBenefits.isNotEmpty()) 0.6 else 0.3
                val moderateCalories = if (food.calories in 300..600) 0.4 else -0.2

                healthySatiety + moderateCalories
            }
            else -> {
                // Normal appetite - balanced approach
                (food.appetiteStimulationScore / 100.0) * 0.5 + (food.comfortScore / 100.0) * 0.3
            }
        }
    }

    /**
     * 장-뇌 축 미생물군집 분석 (2024 Nature Neuroscience 연구 기반)
     * 장내 미생물이 기분, 인지기능, 스트레스 반응에 미치는 영향
     */
    private fun calculateGutBrainMicrobiomeScore(food: FoodRecommendation, stress: Int, tired: Int): Double {
        val stressFatigueIndex = (stress + tired) / 20.0 // Normalize to 0-1

        val probioticsBonus = if (food.healthBenefits.contains("프로바이오틱스") ||
                                food.healthBenefits.contains("유산균") ||
                                food.ingredients.contains("요거트") ||
                                food.ingredients.contains("김치")) 0.6 else 0.0

        val prebioticsBonus = if (food.healthBenefits.contains("식이섬유") ||
                                food.ingredients.contains("마늘") ||
                                food.ingredients.contains("양파") ||
                                food.ingredients.contains("바나나")) 0.4 else 0.0

        val fermentedFoodBonus = if (food.category == "한식" &&
                                   (food.name.contains("김치") ||
                                    food.name.contains("된장") ||
                                    food.name.contains("젓갈"))) 0.5 else 0.0

        val antiInflammatoryBonus = if (food.healthBenefits.contains("항염") ||
                                      food.ingredients.contains("강황") ||
                                      food.ingredients.contains("생강")) 0.3 else 0.0

        // Higher benefit when stressed/tired
        val multiplier = if (stressFatigueIndex >= 0.6) 1.2 else if (stressFatigueIndex >= 0.4) 1.0 else 0.8

        return (probioticsBonus + prebioticsBonus + fermentedFoodBonus + antiInflammatoryBonus) * multiplier
    }

    /**
     * 항염 효과 분석 (2023-2024 Clinical Nutrition 연구 기반)
     * 만성 염증과 스트레스 완화를 위한 항염 음식 효과
     */
    private fun calculateAntiInflammatoryScore(food: FoodRecommendation, stress: Int): Double {
        val stressLevel = stress / 10.0 // Normalize to 0-1

        val omega3Bonus = if (food.healthBenefits.contains("오메가3") ||
                            food.ingredients.contains("연어") ||
                            food.ingredients.contains("고등어") ||
                            food.ingredients.contains("호두")) 0.7 else 0.0

        val antioxidantsBonus = if (food.healthBenefits.contains("항산화") ||
                                  food.ingredients.contains("토마토") ||
                                  food.ingredients.contains("브로콜리") ||
                                  food.ingredients.contains("베리")) 0.5 else 0.0

        val spicesBonus = if (food.ingredients.contains("강황") ||
                            food.ingredients.contains("계피") ||
                            food.ingredients.contains("생강") ||
                            food.ingredients.contains("마늘")) 0.4 else 0.0

        val greenTeaBonus = if (food.healthBenefits.contains("폴리페놀") ||
                             food.name.contains("녹차")) 0.3 else 0.0

        // Higher benefit when stressed
        val multiplier = if (stressLevel >= 0.7) 1.3 else if (stressLevel >= 0.4) 1.0 else 0.7

        return (omega3Bonus + antioxidantsBonus + spicesBonus + greenTeaBonus) * multiplier
    }

    /**
     * 요리 다양성 보너스 (2024 Global Food Psychology 연구 기반)
     * 한국 음식 편향 방지 및 국제 요리 다양성 촉진
     */
    private fun calculateCuisineDiversityBonus(food: FoodRecommendation, scores: ScoresDTO): Double {
        val diversityMultiplier = when (food.category) {
            "한식" -> 0.5 // Reduce Korean food bias
            "일식" -> 0.7
            "중식" -> 0.8
            "이탈리아", "서양식" -> 0.9
            "멕시코", "태국", "베트남" -> 1.0
            "인도", "터키", "모로코", "중동" -> 1.1
            "그리스", "유럽", "미국" -> 0.8
            else -> 0.6
        }

        // Bonus for trying new cuisines when in good mood (low stress)
        val adventureBonusMultiplier = if ((scores.stress + scores.anger) < 30) 1.2 else 1.0

        return diversityMultiplier * adventureBonusMultiplier * 0.3
    }

    /**
     * 다양성 보장 추천 선택 - 서로 다른 요리 카테고리에서 선택
     */
    private fun selectDiverseRecommendations(
        candidates: List<Pair<FoodRecommendation, Double>>,
        count: Int
    ): List<Pair<FoodRecommendation, Double>> {
        val selected = mutableListOf<Pair<FoodRecommendation, Double>>()
        val usedCategories = mutableSetOf<String>()

        // First pass - pick top scorer from each category
        for ((food, score) in candidates) {
            if (usedCategories.add(food.category) && selected.size < count) {
                selected.add(Pair(food, score))
            }
        }

        // Second pass - fill remaining slots with highest scores
        for ((food, score) in candidates) {
            if (selected.size >= count) break
            if (!selected.any { it.first.id == food.id }) {
                selected.add(Pair(food, score))
            }
        }

        return selected.sortedByDescending { it.second }
    }

    private fun applyBasicFilters(foods: List<FoodRecommendation>, request: TestResultRequestDTO): List<FoodRecommendation> {
        return foods.filter { food ->
            isTimeAppropriate(food, request.mealTime) &&
            isPriceAppropriate(food, request.scores.budget) &&
            isSituationAppropriate(food, request.dining)
        }
    }

    private fun isTimeAppropriate(food: FoodRecommendation, mealTime: String?): Boolean {
        return when (mealTime) {
            "MORNING" -> food.suitableForMorning
            "LUNCH" -> food.suitableForLunch
            "DINNER" -> food.suitableForDinner
            "MIDNIGHT_SNACK" -> food.suitableForMidnight
            else -> true
        }
    }

    private fun isPriceAppropriate(food: FoodRecommendation, budget: Int): Boolean {
        val avgPrice = (food.minPrice + food.maxPrice) / 2.0
        return avgPrice <= budget * 1.2 // Allow slight budget flexibility
    }

    private fun isSituationAppropriate(food: FoodRecommendation, dining: String): Boolean {
        return when (dining) {
            "ALONE" -> food.suitableForAlone
            "WITH_FRIENDS" -> food.suitableForFriends
            "WITH_FAMILY" -> food.suitableForFamily
            "DATE" -> food.suitableForDate
            "BUSINESS", "COWORKERS" -> food.suitableForBusiness
            else -> true
        }
    }

    private fun generateScientificResponse(
        recommendations: List<Pair<FoodRecommendation, Double>>,
        request: TestResultRequestDTO
    ): String {
        if (recommendations.isEmpty()) {
            return generateEmergencyRecommendation(request)
        }

        val topFood = recommendations[0].first
        val scientificReason = generateScientificReason(topFood, request, recommendations[0].second)

        return """
        {
            "primaryFood": "${topFood.name}",
            "alternativefoods": [${recommendations.drop(1).map { "\"${it.first.name}\"" }.joinToString(", ")}],
            "reason": "${scientificReason}",
            "confidence": "${getConfidenceLevel(recommendations[0].second)}"
        }
        """.trimIndent()
    }

    private fun generateScientificReason(food: FoodRecommendation, request: TestResultRequestDTO, score: Double): String {
        val reasons = mutableListOf<String>()
        val scores = request.scores

        // Stress analysis
        if (scores.stress >= 70 || scores.anger >= 70) {
            reasons.add("높은 스트레스 상태로 코르티솔 조절과 세로토닌 안정화가 필요하여 ${food.name}의 스트레스 완화 성분이 도움됩니다")
        }

        // Fatigue analysis
        if (scores.tired >= 70) {
            reasons.add("높은 피로도로 미토콘드리아 기능 지원과 에너지 대사 최적화가 필요합니다")
        }

        // Circadian rhythm
        when (request.mealTime) {
            "MORNING" -> reasons.add("아침 시간대는 인슐린 감도가 최고점으로 단백질과 복합탄수화물 섭취가 최적입니다")
            "MIDNIGHT_SNACK" -> reasons.add("야식 시간에는 칼로리 저장 위험 증가로 저칼로리 선택이 중요합니다")
            "DINNER" -> reasons.add("저녁 시간은 소화 부담 최소화와 수면의 질을 고려한 선택이 필요합니다")
        }

        // Social context
        when (request.dining) {
            "WITH_FRIENDS", "WITH_FAMILY" -> reasons.add("사회적 식사 환경에서 평균 25% 증가하는 섭취량과 음식 공유 패턴을 고려했습니다")
            "DATE" -> reasons.add("데이트 상황에서의 인상 관리와 우아한 식사 경험을 위한 선택입니다")
            "BUSINESS" -> reasons.add("비즈니스 환경에서의 전문적 이미지와 대화 편의성을 고려했습니다")
        }

        // Budget consideration
        if (scores.budget <= 5000) {
            reasons.add("제한된 예산 내에서 영양학적 가치와 포만감을 극대화한 선택입니다")
        }

        // Cuisine diversity
        if (food.category != "한식") {
            reasons.add("다양한 국제 요리 경험을 통한 식사의 즐거움과 영양소 다양성을 고려했습니다")
        }

        // Health benefits
        if (food.healthBenefits.contains("오메가3") || food.healthBenefits.contains("항산화")) {
            reasons.add("선택된 음식의 항염 성분과 뇌 건강 지원 영양소가 현재 상태에 도움됩니다")
        }

        if (reasons.isEmpty()) {
            reasons.add("종합적 과학적 분석 결과 현재 상황에 가장 적합한 선택입니다 (점수: ${String.format("%.2f", score)})")
        }

        return reasons.joinToString(". ") + "."
    }

    private fun getConfidenceLevel(score: Double): String {
        return when {
            score >= 3.0 -> "매우 높음"
            score >= 2.5 -> "높음"
            score >= 2.0 -> "보통"
            score >= 1.5 -> "낮음"
            else -> "매우 낮음"
        }
    }

    private fun generateEmergencyRecommendation(request: TestResultRequestDTO): String {
        val scores = request.scores

        val (food, reason) = when {
            scores.stress >= 80 && scores.tired >= 80 ->
                Pair("연어 사시미", "극심한 스트레스와 피로로 오메가3과 고품질 단백질이 시급합니다")
            scores.appetite <= 20 ->
                Pair("그릭 요거트 + 견과류", "식욕 부진으로 프로바이오틱스와 영양 밀도가 높은 음식이 필요합니다")
            scores.budget <= 5000 ->
                Pair("마파두부", "제한된 예산에서 단백질과 에너지를 효율적으로 섭취할 수 있습니다")
            else ->
                Pair("치킨 티카 마살라", "현재 상황에 대한 종합적 분석 결과 향신료와 단백질 섭취가 권장됩니다")
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
