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
        
        // 2025-2026 연구 기반 감정-영양 매칭 (강화된 가중치)
        
        // 1. 피로도 분석 (서카디안 리듬 & 에너지 대사 고려)
        totalScore += when {
            scores.tired > 8 -> {
                // 극도 피로: 복합탄수화물 + 마그네슘 (연구: 근육 이완, 신경 안정)
                food.comfortLevel * 0.4 + food.energyBoost * 0.2
            }
            scores.tired > 6 -> {
                // 높은 피로: 편안한 음식 우선
                food.comfortLevel * 0.3 + food.energyBoost * 0.15
            }
            scores.tired < 3 -> {
                // 활력 상태: 에너지 부스터 음식
                food.energyBoost * 0.25
            }
            else -> (food.comfortLevel + food.energyBoost) * 0.1
        }
        
        // 2. 스트레스 분석 (HPA축 & 코르티솔 조절)
        totalScore += when {
            scores.stress > 8 -> {
                // 극심한 스트레스: 오메가-3 + 프로바이오틱스 (장뇌축 연구)
                food.stressRelief * 0.4
            }
            scores.stress > 6 -> {
                // 높은 스트레스: 스트레스 해소 음식
                food.stressRelief * 0.3
            }
            else -> food.stressRelief * 0.1
        }
        
        // 3. 식욕 분석 (렙틴/그렐린 호르몬 고려)
        totalScore += when {
            scores.appetite < 3 -> {
                // 식욕 부진: 위에 부담 적고 영양가 높은 음식
                food.appetiteMatch * 0.35
            }
            scores.appetite > 8 -> {
                // 과식 경향: 포만감 주는 단백질/섬유질
                food.energyBoost * 0.25
            }
            else -> food.appetiteMatch * 0.15
        }
        
        // 4. 분노 상태 분석 (도파민/세로토닌 균형)
        totalScore += when {
            scores.anger > 7 -> {
                // 높은 분노: 스트레스 해소 + 세로토닌 부스터
                (food.stressRelief + food.comfortLevel) * 0.2
            }
            scores.anger > 4 -> {
                food.stressRelief * 0.1
            }
            else -> food.stressRelief * 0.05
        }
        
        // 5. 시간생물학 기반 추가 점수 (2025 서카디안 연구)
        val timeBonus = getCircadianBonus(food, request.mealTime)
        totalScore += timeBonus
        
        // 6. 예산 효율성 점수 (2025 경제성 연구 반영)
        val budgetScore = calculateBudgetEfficiency(food, scores.budget)
        totalScore += budgetScore
        
        // 7. 사회적 맥락 보너스 (사회적 식사 연구)
        val socialBonus = getSocialContextBonus(food, request.dining)
        totalScore += socialBonus
        
        return totalScore
    }
    
    // 2025 서카디안 리듬 연구 기반 시간별 보너스
    private fun getCircadianBonus(food: Food, mealTime: String?): Double {
        return when (mealTime) {
            "MORNING" -> {
                // 아침: 단백질 + 복합탄수화물 (에너지 대사 최적화)
                if (food.energyBoost >= 7 && food.morningFriendly) 0.5 else 0.0
            }
            "LUNCH" -> {
                // 점심: 균형잡힌 영양 (인슐린 감도 최고점)
                if (food.lunchFriendly) 0.3 else 0.0
            }
            "DINNER" -> {
                // 저녁: 소화 용이, 수면 방해 없는 음식
                if (food.comfortLevel >= 6 && food.dinnerFriendly) 0.4 else 0.0
            }
            "MIDNIGHT_SNACK" -> {
                // 야식: 트립토판, 마그네슘 (수면 유도)
                if (food.comfortLevel >= 7 && food.midnightFriendly) 0.6 else -0.2
            }
            else -> 0.0
        }
    }
    
    // 예산 효율성 계산 (영양가 대비 비용)
    private fun calculateBudgetEfficiency(food: Food, budget: Int): Double {
        val actualBudget = budget * 1000 // 슬라이더 값을 실제 금액으로 변환
        return when {
            actualBudget <= 5000 -> {
                // 저예산: 영양가 높은 저가 음식 우대
                if (food.priceLevel == 1 && (food.comfortLevel + food.appetiteMatch) >= 12) 2.0
                else if (food.priceLevel == 1) 1.5
                else -1.0
            }
            actualBudget <= 15000 -> {
                // 중간예산: 가성비 최우선
                if (food.priceLevel == 2) 1.5
                else if (food.priceLevel == 1) 1.0
                else 0.0
            }
            else -> {
                // 고예산: 품질과 경험 중시
                if (food.priceLevel == 3) 1.0
                else if (food.priceLevel == 2) 0.5
                else 0.0
            }
        }
    }
    
    // 사회적 맥락 보너스 (사회적 식사 연구 기반)
    private fun getSocialContextBonus(food: Food, dining: String): Double {
        return when (dining) {
            "ALONE" -> {
                // 혼밥: 개인적 위로와 편안함 중시
                if (food.soloFriendly && food.comfortLevel >= 6) 0.4 else 0.0
            }
            "DATE" -> {
                // 데이트: 분위기와 경험 중시
                if (food.dateFriendly) 0.5 else -0.2
            }
            "FRIENDS", "FAMILY", "COWORKERS" -> {
                // 그룹: 공유와 소통 중시
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
        val scores = request.scores
        
        // 2025-2026 연구 기반 개인화된 추천 이유 생성
        val reason = generateScientificReason(topFood, scores, request)
        
        // JSON 형태로 반환 (프론트엔드와 일치)
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
                // Kotlin Map toString을 JSON 형식으로 변환
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
        
        // 감정 상태 기반 과학적 설명
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
        
        // 시간대별 과학적 근거
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
        
        // 영양학적 이점
        food.healthBenefits?.let { benefits ->
            when {
                benefits.contains("프로바이오틱스") -> reasons.add("장뇌축을 통한 뇌 건강에 도움됩니다")
                benefits.contains("항산화") -> reasons.add("산화 스트레스를 줄여 세포 건강을 개선합니다")
                benefits.contains("세로토닌") -> reasons.add("행복 호르몬 분비를 촉진합니다")
                benefits.contains("혈당") -> reasons.add("혈당 안정화로 에너지 균형을 유지합니다")
                else -> {} // Do nothing for other benefits
            }
        }
        
        // 기본 메시지
        if (reasons.isEmpty()) {
            reasons.add("현재 상황에 적합한 균형잡힌 영양을 제공합니다")
        }
        
        return reasons.joinToString(". ") + "."
    }
    
    private fun generateBasicRecommendation(request: TestResultRequestDTO): String {
        val scores = request.scores
        
        val (primaryFood, reason) = when {
            scores.tired > 7 && scores.stress > 7 -> 
                Pair("따뜻한 국물요리", "피로와 스트레스가 높아 수분과 전해질 보충이 필요하며, 따뜻한 음식이 교감신경을 진정시킵니다")
            scores.appetite > 8 && scores.budget > 7 -> 
                Pair("고기류", "높은 식욕과 충분한 예산으로 양질의 단백질 섭취가 가능하며, 도파민 분비를 통한 만족감을 제공합니다")
            scores.budget < 4 -> 
                Pair("덮밥", "제한된 예산 내에서 탄수화물과 단백질의 균형잡힌 섭취가 가능합니다")
            scores.stress > 7 ->
                Pair("매콤한 음식", "캡사이신이 엔돌핀 분비를 촉진하여 스트레스 해소에 도움됩니다")
            scores.appetite < 4 ->
                Pair("가벼운 스프", "식욕부진 시 소화 부담을 줄이면서도 필수 영양소 공급이 가능합니다")
            else -> 
                Pair("균형잡힌 한식", "현재 상태에서는 다양한 영양소의 조화로운 섭취가 최적입니다")
        }
        
        return "{\n" +
                "\"primaryFood\":\"${primaryFood}\",\n" +
                "\"alternativefoods\":[],\n" +
                "\"reason\":\"${reason}\"\n" +
                "}"
    }
}