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
import org.springframework.jdbc.core.JdbcTemplate

@Component
class DataInitializer {
    
    @Autowired
    private lateinit var foodRecommendationRepository: FoodRecommendationRepository
    
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate
    
    private val logger = KotlinLogging.logger {}
    private val objectMapper = ObjectMapper().registerModule(KotlinModule.Builder().build())
    
    @PostConstruct
    fun initData() {
        // 1. 스키마 생성 (최우선)
        createSchemaIfNotExists()
        
        // 2. JSON 데이터 로드 (Hibernate 테이블 생성 이후)
        try {
            if (foodRecommendationRepository.count() < 50L) {
                initFoodDataFromJson()
            }
        } catch (e: Exception) {
            logger.warn(e) { "테이블이 아직 생성되지 않았습니다. 잠시 후 JSON 데이터를 로드합니다." }
            // 테이블이 생성될 때까지 잠시 대기 후 재시도
            Thread.sleep(1000)
            initFoodDataFromJson()
        }
    }
    
    private fun createSchemaIfNotExists() {
        try {
            val sql = "CREATE SCHEMA IF NOT EXISTS moodbite"
            jdbcTemplate.execute(sql)
            logger.info { "✅ Schema 'moodbite' ready" }
        } catch (e: Exception) {
            logger.error(e) { "❌ Failed to create moodbite schema" }
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