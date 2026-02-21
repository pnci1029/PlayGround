package com.example.moodbite.api.test.dto.request

import com.example.moodbite.api.test.domain.enums.Dining
import com.example.moodbite.api.test.domain.enums.MealTime

data class LocationDTO(
    val latitude: Double,
    val longitude: Double
)

data class TestRequestDTO(
    val scores:Scores,
    val dining: Dining,
    val mealTime: MealTime,
    val location: LocationDTO? = null
)