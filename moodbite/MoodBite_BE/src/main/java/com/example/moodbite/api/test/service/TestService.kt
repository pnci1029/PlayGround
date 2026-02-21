package com.example.moodbite.api.test.service

import com.example.moodbite.api.executed.dto.ChatRequest
import com.example.moodbite.api.executed.dto.ChatResponse
import com.example.moodbite.api.executed.LocationBasedRecommendationService
import com.example.moodbite.api.executed.dto.LocationBasedTestResultRequestDTO
import com.example.moodbite.api.executed.dto.LocationDTO as ExecutedLocationDTO
import com.example.moodbite.api.executed.dto.ScoresDTO
import com.example.moodbite.api.test.dto.request.TestRequestDTO
import com.example.moodbite.config.OpenRouterConfig
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class TestService(
    private val openRouterConfig: OpenRouterConfig,
    private val locationBasedRecommendationService: LocationBasedRecommendationService,
    ) {
    @Value("\${openRouter.model}")
    private lateinit var openRouterModel: String

    @Value("\${openRouter.api.url}")
    private lateinit var url: String

    @Value("\${prompt.script}")
    private lateinit var script: String

    private val logger = KotlinLogging.logger {}

    fun getResult(dto: TestRequestDTO): String {
        val headers = openRouterConfig.httpHeaders()
        val prompt = generateScript(script, dto)

        logger.warn { "dto: $dto" }
        val chatRequest = ChatRequest(openRouterModel, prompt)

//         통신을 위한 RestTemplate 구성하기
        val requestEntity = HttpEntity(chatRequest, headers)

        val restTemplate = RestTemplate()
        val response = restTemplate.postForObject(url, requestEntity, ChatResponse::class.java)

        return response?.choices?.firstOrNull()?.message?.content
            ?: throw RuntimeException("Failed to get response from OpenAI")
    }

    fun getLocationBasedResult(dto: TestRequestDTO): String {
        val locationDto = LocationBasedTestResultRequestDTO(
            scores = ScoresDTO(
                dto.scores.tired,
                dto.scores.anger, 
                dto.scores.stress,
                dto.scores.appetite,
                dto.scores.budget
            ),
            dining = dto.dining.name,
            mealTime = dto.mealTime.name,
            location = dto.location?.let { ExecutedLocationDTO(it.latitude, it.longitude) }
        )
        
        val result = locationBasedRecommendationService.getLocationBasedRecommendation(locationDto)
        
        return """
        {
            "id": ${result.id},
            "message": "${result.message}",
            "foodRecommendation": {
                "primaryFood": "${result.foodRecommendation.primaryFood}",
                "alternativefoods": [${result.foodRecommendation.alternativefoods.joinToString { "\"$it\"" }}],
                "reason": "${result.foodRecommendation.reason.replace("\"", "\\\"")}"
            },
            "nearbyRestaurants": [
                ${result.nearbyRestaurants.joinToString { restaurant ->
                    """{
                        "name": "${restaurant.name}",
                        "category": "${restaurant.category}",
                        "address": "${restaurant.address}",
                        "latitude": ${restaurant.latitude},
                        "longitude": ${restaurant.longitude},
                        "rating": ${restaurant.rating},
                        "distance": ${restaurant.distance},
                        "priceLevel": ${restaurant.priceLevel},
                        "phone": "${restaurant.phone ?: ""}",
                        "isOpen": ${restaurant.isOpen},
                        "matchScore": ${restaurant.matchScore},
                        "estimatedWalkTime": "${restaurant.estimatedWalkTime}"
                    }"""
                }}
            ]
        }
        """.trimIndent()
    }

    private fun generateScript(
        script: String, dto: TestRequestDTO) = script
        .replace("$\\{dto.tiredScore}", dto.scores.tired.toString())
        .replace("$\\{dto.angerScore}", dto.scores.anger.toString())
        .replace("$\\{dto.stressScore}", dto.scores.stress.toString())
        .replace("$\\{dto.appetiteScore}", dto.scores.appetite.toString())
        .replace("$\\{dto.dining.description}", dto.dining.description)
        .replace("$\\{dto.budget}", dto.scores.budget.toString())
        .replace("$\\{dto.mealTime}", dto.mealTime.toString())
}