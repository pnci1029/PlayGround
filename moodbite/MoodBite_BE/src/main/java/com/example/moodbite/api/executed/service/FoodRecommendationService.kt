package com.example.moodbite.api.executed.service

import com.example.moodbite.api.executed.dto.TestResultRequestDTO
import com.example.moodbite.api.executed.dto.ScoresDTO
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


        totalScore += when {
            scores.tired > 8 -> {
                food.comfortLevel * 0.25 + food.energyBoost * 0.15
            }
            scores.tired > 6 -> {
                food.comfortLevel * 0.2 + food.energyBoost * 0.12
            }
            scores.tired < 3 -> {
                food.energyBoost * 0.18
            }
            else -> (food.comfortLevel + food.energyBoost) * 0.08
        }

        totalScore += when {
            scores.stress > 8 -> {
                food.stressRelief * 0.25
            }
            scores.stress > 6 -> {
                food.stressRelief * 0.2
            }
            else -> food.stressRelief * 0.08
        }

        totalScore += when {
            scores.appetite < 3 -> {
                food.appetiteMatch * 0.22
            }
            scores.appetite > 8 -> {
                food.energyBoost * 0.18
            }
            else -> food.appetiteMatch * 0.12
        }

        totalScore += when {
            scores.anger > 7 -> {
                (food.stressRelief + food.comfortLevel) * 0.15
            }
            scores.anger > 4 -> {
                food.stressRelief * 0.08
            }
            else -> food.stressRelief * 0.04
        }

        val timeBonus = getCircadianBonus(food, request.mealTime)
        totalScore += timeBonus

        val budgetScore = calculateBudgetEfficiency(food, scores.budget)
        totalScore += budgetScore

        val socialBonus = getSocialContextBonus(food, request.dining)
        totalScore += socialBonus

        val diversityBonus = getDiversityBonus(food)
        totalScore += diversityBonus

        val randomFactor = kotlin.random.Random.nextDouble(-2.0, 2.0)
        totalScore += randomFactor

        return totalScore
    }

    private fun getDiversityBonus(food: Food): Double {
        return when {
            food.comfortLevel >= 9 && food.stressRelief >= 9 -> -0.5
            food.comfortLevel >= 8 && food.stressRelief >= 8 -> -0.3

            food.comfortLevel in 5..7 && food.stressRelief in 5..7 -> 0.4
            food.comfortLevel in 6..8 || food.stressRelief in 6..8 -> 0.2

            else -> 0.0
        }
    }

    private fun getCircadianBonus(food: Food, mealTime: String?): Double {
        return when (mealTime) {
            "MORNING" -> {
                if (food.energyBoost >= 7 && food.morningFriendly) 0.5 else 0.0
            }
            "LUNCH" -> {
                if (food.lunchFriendly) 0.3 else 0.0
            }
            "DINNER" -> {
                if (food.comfortLevel >= 6 && food.dinnerFriendly) 0.4 else 0.0
            }
            "MIDNIGHT_SNACK" -> {
                if (food.comfortLevel >= 7 && food.midnightFriendly) 0.6 else -0.2
            }
            else -> 0.0
        }
    }

    private fun calculateBudgetEfficiency(food: Food, budget: Int): Double {
        val actualBudget = budget * 1000 // 슬라이더 값을 실제 금액으로 변환
        return when {
            actualBudget <= 5000 -> {
                if (food.priceLevel == 1 && (food.comfortLevel + food.appetiteMatch) >= 12) 2.0
                else if (food.priceLevel == 1) 1.5
                else -1.0
            }
            actualBudget <= 15000 -> {
                if (food.priceLevel == 2) 1.5
                else if (food.priceLevel == 1) 1.0
                else 0.0
            }
            else -> {
                if (food.priceLevel == 3) 1.0
                else if (food.priceLevel == 2) 0.5
                else 0.0
            }
        }
    }

    private fun getSocialContextBonus(food: Food, dining: String): Double {
        return when (dining) {
            "ALONE" -> {
                if (food.soloFriendly && food.comfortLevel >= 6) 0.4 else 0.0
            }
            "DATE" -> {
                if (food.dateFriendly) 0.5 else -0.2
            }
            "FRIENDS", "FAMILY", "COWORKERS" -> {
                if (food.groupFriendly) 0.3 else 0.0
            }
            else -> 0.0
        }
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
        val foodDiningTypes = food.diningTypes?.split(",")?.map { it.trim() } ?: emptyList()

        return when (dining) {
            "ALONE" -> foodDiningTypes.contains("ALONE")
            "FRIENDS" -> foodDiningTypes.contains("WITH_FRIENDS")
            "FAMILY" -> foodDiningTypes.contains("WITH_FAMILY")
            "DATE" -> foodDiningTypes.contains("DATE")
            "COWORKERS" -> foodDiningTypes.contains("BUSINESS") || foodDiningTypes.contains("WITH_COWORKERS")
            "ETC" -> true // 기타의 경우 모든 음식 허용
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
        val scores = request.scores

        val reason = generateScientificReason(topFood, scores, request)

        val result = mapOf(
            "primaryFood" to topFood.name,
            "alternativefoods" to if (recommendations.size > 1) {
                recommendations.drop(1).take(2).map { it.first.name }
            } else {
                emptyList<String>()
            },
            "reason" to reason
        )

        return result.toString()
            .replace("=", ":")
            .replace("[", "[")
            .replace("]", "]")
            .let {
                "{\n" +
                "\"primaryFood\":\"${topFood.name}\",\n" +
                "\"alternativefoods\":[${
                    if (recommendations.size > 1) {
                        recommendations.drop(1).take(2).map { "\"${it.first.name}\"" }.joinToString(",")
                    } else ""
                }],\n" +
                "\"reason\":\"${reason}\"\n" +
                "}"
            }
    }

    private fun generateScientificReason(food: Food, scores: ScoresDTO, request: TestResultRequestDTO): String {
        val reasons = mutableListOf<String>()

        when {
            scores.tired > 7 && scores.stress > 6 -> {
                reasons.add("피로와 스트레스가 높아 코르티솔 수치 조절이 필요한 상태입니다")
                if (food.healthBenefits?.contains("마그네슘") == true) {
                    reasons.add("마그네슘이 근육 이완과 신경 안정에 도움을 줍니다")
                }
            }
            scores.tired > 7 -> {
                reasons.add("에너지 대사가 저하된 상태로 복합탄수화물이 도움됩니다")
            }
            scores.stress > 7 -> {
                reasons.add("스트레스 호르몬 조절을 위해 오메가-3나 항산화 성분이 필요합니다")
                if (food.healthBenefits?.contains("오메가-3") == true) {
                    reasons.add("오메가-3가 스트레스 반응을 완화합니다")
                }
            }
            scores.appetite < 4 -> {
                reasons.add("식욕 조절 호르몬의 균형이 필요한 상태입니다")
            }
        }

        when (request.mealTime) {
            "MORNING" -> {
                if (food.morningFriendly) {
                    reasons.add("아침 시간대는 인슐린 감도가 높아 탄수화물 대사에 최적입니다")
                }
            }
            "DINNER" -> {
                if (food.dinnerFriendly && food.comfortLevel >= 6) {
                    reasons.add("저녁에는 소화가 용이하고 수면에 방해되지 않는 음식이 좋습니다")
                }
            }
            "MIDNIGHT_SNACK" -> {
                if (food.midnightFriendly) {
                    reasons.add("야식은 트립토판과 마그네슘이 수면 호르몬 분비를 돕습니다")
                }
            }
        }

        food.healthBenefits?.let { benefits ->
            when {
                benefits.contains("프로바이오틱스") -> reasons.add("장뇌축을 통한 뇌 건강에 도움됩니다")
                benefits.contains("항산화") -> reasons.add("산화 스트레스를 줄여 세포 건강을 개선합니다")
                benefits.contains("세로토닌") -> reasons.add("행복 호르몬 분비를 촉진합니다")
                benefits.contains("혈당") -> reasons.add("혈당 안정화로 에너지 균형을 유지합니다")
                else -> {} // Do nothing for other benefits
            }
        }

        if (reasons.isEmpty()) {
            reasons.add("현재 상황에 적합한 맛있는 음식입니다")
        }

        return reasons.joinToString(". ") + "."
    }

    private fun generateBasicRecommendation(request: TestResultRequestDTO): String {
        val scores = request.scores

        val (primaryFood, reason) = when {
            scores.tired > 7 && scores.stress > 7 ->
                Pair("김치찌개", "피로와 스트레스가 높아 수분과 전해질 보충이 필요하며, 따뜻한 음식이 교감신경을 진정시킵니다")
            scores.appetite > 8 && scores.budget > 7 ->
                Pair("삼겹살구이", "높은 식욕과 충분한 예산으로 양질의 단백질 섭취가 가능하며, 도파민 분비를 통한 만족감을 제공합니다")
            scores.budget < 4 ->
                Pair("김치볶음밥", "제한된 예산 내에서 탄수화물과 단백질을 동시에 섭취할 수 있습니다")
            scores.stress > 7 ->
                Pair("떡볶이", "캡사이신이 엔돌핀 분비를 촉진하여 스트레스 해소에 도움됩니다")
            scores.appetite < 4 ->
                Pair("미역국", "식욕부진 시 소화 부담을 줄이면서도 필수 영양소 공급이 가능합니다")
            else ->
                Pair("비빔밥", "현재 상태에서는 다양한 영양소의 조화로운 섭취가 최적입니다")
        }

        return "{\n" +
                "\"primaryFood\":\"${primaryFood}\",\n" +
                "\"alternativefoods\":[],\n" +
                "\"reason\":\"${reason}\"\n" +
                "}"
    }
}
