package com.example.moodbite.api.executed.service

import com.example.moodbite.api.executed.dto.ScoresDTO
import com.example.moodbite.api.executed.dto.TestResultRequestDTO
import com.example.moodbite.api.food.entity.FoodRecommendation
import com.example.moodbite.api.food.repository.FoodRecommendationRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.Mockito

class ScientificFoodRecommendationServiceTest {

    private val repository: FoodRecommendationRepository = Mockito.mock(FoodRecommendationRepository::class.java)
    private val service = ScientificFoodRecommendationService(repository)
    private val mapper = ObjectMapper()

    private fun food(
        name: String,
        category: String = "한식",
        minPrice: Int = 8000,
        maxPrice: Int = 12000,
        calories: Int = 400,
        stressReliefScore: Int = 70,
    ) = FoodRecommendation(
        name = name,
        description = "테스트 음식",
        category = category,
        calories = calories,
        protein = 18.0f,
        carbs = 40.0f,
        fat = 12.0f,
        minPrice = minPrice,
        maxPrice = maxPrice,
        prepTimeMinutes = 15,
        energyBoostScore = 70,
        stressReliefScore = stressReliefScore,
        appetiteStimulationScore = 70,
        comfortScore = 75,
        suitableForMorning = true,
        suitableForLunch = true,
        suitableForDinner = true,
        suitableForMidnight = true,
        suitableForAlone = true,
        suitableForFriends = true,
        suitableForFamily = true,
        suitableForDate = true,
        suitableForBusiness = true,
        ingredients = "테스트 재료",
        healthBenefits = "테스트 효능",
    )

    private fun request(
        tired: Int = 50, anger: Int = 50, stress: Int = 50, appetite: Int = 50, budget: Int = 15000,
        dining: String = "ALONE", mealTime: String? = "LUNCH",
    ) = TestResultRequestDTO(
        scores = ScoresDTO(tired = tired, anger = anger, stress = stress, appetite = appetite, budget = budget),
        dining = dining,
        mealTime = mealTime,
    )

    @Test
    fun `음식 데이터가 비어 있으면 비상 추천을 반환한다`() {
        Mockito.`when`(repository.findAll()).thenReturn(emptyList())

        val json = mapper.readTree(service.recommendFoodScientific(request()))

        assertThat(json.get("primaryFood").asText()).isNotBlank()
        assertThat(json.get("confidence").asText()).isEqualTo("기본")
    }

    @Test
    fun `조건에 맞는 음식이 있으면 DB의 음식 중에서 추천한다`() {
        val names = listOf("테스트김밥", "테스트라멘", "테스트비빔밥")
        Mockito.`when`(repository.findAll()).thenReturn(names.map { food(it) })

        val json = mapper.readTree(service.recommendFoodScientific(request()))

        assertThat(json.get("primaryFood").asText()).isIn(names)
        assertThat(json.get("confidence").asText()).isNotEqualTo("기본")
    }

    @Test
    fun `예산을 초과하는 음식만 있으면 필터링되어 비상 추천으로 폴백한다`() {
        // 평균가 20,000원짜리 음식만 존재, 예산은 1,000원 → 가격 필터에서 모두 제외
        Mockito.`when`(repository.findAll())
            .thenReturn(listOf(food("비싼스테이크", minPrice = 18000, maxPrice = 22000)))

        val json = mapper.readTree(service.recommendFoodScientific(request(budget = 1000)))

        // 비상 추천 경로(예산 <= 5000)는 마파두부를 반환한다
        assertThat(json.get("confidence").asText()).isEqualTo("기본")
        assertThat(json.get("primaryFood").asText()).isEqualTo("마파두부")
    }

    @Test
    fun `여러 카테고리가 있으면 대안 추천은 주 추천과 다른 음식으로 채운다`() {
        val foods = listOf(
            food("한식메뉴", category = "한식"),
            food("일식메뉴", category = "일식"),
            food("이탈리아메뉴", category = "이탈리아"),
        )
        Mockito.`when`(repository.findAll()).thenReturn(foods)

        val json = mapper.readTree(service.recommendFoodScientific(request(stress = 20, anger = 10)))
        val primary = json.get("primaryFood").asText()
        val alternatives = json.get("alternativefoods").map { it.asText() }

        assertThat(alternatives).doesNotContain(primary)
    }
}
