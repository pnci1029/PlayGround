package com.example.moodbite.config

import com.example.moodbite.api.food.entity.FoodRecommendation
import com.example.moodbite.api.food.repository.FoodRecommendationRepository
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import jakarta.annotation.PostConstruct
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Component

@Component
class DataInitializer {
    
    @Autowired
    private lateinit var foodRecommendationRepository: FoodRecommendationRepository
    
    private val logger = KotlinLogging.logger {}
    private val objectMapper = ObjectMapper().registerModule(KotlinModule.Builder().build())
    
    @PostConstruct
    fun initData() {
        if (foodRecommendationRepository.count() == 0L) {
            initFoodDataFromJson()
        }
    }
    
    private fun initFoodDataFromJson() {
        try {
            val resource = ClassPathResource("data/foods.json")
            val foodDataList: List<FoodData> = objectMapper.readValue(resource.inputStream)
            
            val foods = foodDataList.map { data ->
                FoodRecommendation(
                    name = data.name,
                    category = data.category,
                    description = data.description,
                    calories = data.calories,
                    protein = data.protein,
                    carbs = data.carbs,
                    fat = data.fat,
                    minPrice = data.minPrice,
                    maxPrice = data.maxPrice,
                    prepTimeMinutes = data.prepTimeMinutes,
                    energyBoostScore = data.energyBoostScore,
                    stressReliefScore = data.stressReliefScore,
                    appetiteStimulationScore = data.appetiteStimulationScore,
                    comfortScore = data.comfortScore,
                    suitableForMorning = data.mealTimes.contains("MORNING"),
                    suitableForLunch = data.mealTimes.contains("LUNCH"),
                    suitableForDinner = data.mealTimes.contains("DINNER"),
                    suitableForMidnight = data.mealTimes.contains("MIDNIGHT_SNACK"),
                    suitableForAlone = data.diningTypes.contains("ALONE"),
                    suitableForFriends = data.diningTypes.contains("WITH_FRIENDS"),
                    suitableForFamily = data.diningTypes.contains("WITH_FAMILY"),
                    suitableForDate = data.diningTypes.contains("DATE"),
                    suitableForBusiness = data.diningTypes.contains("BUSINESS"),
                    ingredients = data.ingredients,
                    healthBenefits = data.healthBenefits
                )
            }
            
            foodRecommendationRepository.saveAll(foods)
            logger.info { "초기 음식 데이터 ${foods.size}개가 JSON에서 로드되었습니다" }
        } catch (e: Exception) {
            logger.error(e) { "JSON에서 음식 데이터 로드 실패" }
        }
    }
}

// JSON 데이터 매핑을 위한 데이터 클래스
data class FoodData(
    val name: String,
    val category: String,
    val description: String,
    val calories: Int,
    val protein: Float,
    val carbs: Float,
    val fat: Float,
    val minPrice: Int,
    val maxPrice: Int,
    val prepTimeMinutes: Int,
    val energyBoostScore: Int,
    val stressReliefScore: Int,
    val appetiteStimulationScore: Int,
    val comfortScore: Int,
    val ingredients: String,
    val healthBenefits: String,
    val mealTimes: List<String>,
    val diningTypes: List<String>
)