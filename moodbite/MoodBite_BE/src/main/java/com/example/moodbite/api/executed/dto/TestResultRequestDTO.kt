package com.example.moodbite.api.executed.dto

data class TestResultRequestDTO(
    val scores: ScoresDTO,
    val dining: String, // ALONE, FRIENDS, FAMILY, DATE, COWORKERS, ETC
    val mealTime: String? // MORNING, LUNCH, DINNER, MIDNIGHT_SNACK
)

data class ScoresDTO(
    val tired: Int,
    val anger: Int,
    val stress: Int,
    val appetite: Int,
    val budget: Int
)

data class TestResultResponseDTO(
    val id: Long,
    val message: String,
    val aiRecommendation: String? = null
)