package com.example.moodbite.api.executed

import com.example.moodbite.api.executed.dto.*
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/mood-test/location-based")
@CrossOrigin(origins = ["http://localhost:3000"])
class LocationBasedRecommendationController {
    
    @Autowired
    private lateinit var locationBasedRecommendationService: LocationBasedRecommendationService
    
    @PostMapping("")
    @Operation(
        summary = "위치 기반 감정 테스트 결과 저장 및 음식점 추천",
        description = "사용자의 감정 상태, 상황 및 위치를 분석하여 맞춤형 음식과 주변 음식점을 추천합니다."
    )
    @ApiResponses(value = [
        ApiResponse(
            responseCode = "200", 
            description = "테스트 결과 저장 및 추천 성공",
            content = [Content(schema = Schema(implementation = LocationBasedRecommendationResponseDTO::class))]
        ),
        ApiResponse(responseCode = "400", description = "잘못된 요청", content = [Content()]),
        ApiResponse(responseCode = "500", description = "서버 오류", content = [Content()])
    ])
    fun submitLocationBasedTestResult(
        @RequestBody requestDTO: LocationBasedTestResultRequestDTO
    ): ResponseEntity<LocationBasedRecommendationResponseDTO> {
        return try {
            val response = locationBasedRecommendationService.getLocationBasedRecommendation(requestDTO)
            ResponseEntity.ok(response)
        } catch (e: Exception) {
            println("위치 기반 추천 실패: ${e.message}")
            ResponseEntity.internalServerError().build()
        }
    }
    
    @GetMapping("/health")
    @Operation(summary = "위치 기반 추천 API 상태 확인", description = "위치 기반 추천 API 서버 상태를 확인합니다.")
    fun healthCheck(): ResponseEntity<String> {
        return ResponseEntity.ok("Location-based MoodBite API is running!")
    }
}