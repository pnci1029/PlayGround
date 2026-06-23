package com.example.moodbite.api.location

import io.swagger.v3.oas.annotations.Operation
import jakarta.validation.Valid
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class NearbyRestaurantsRequest(
    @field:DecimalMin("-90.0") @field:DecimalMax("90.0")
    val latitude: Double,
    @field:DecimalMin("-180.0") @field:DecimalMax("180.0")
    val longitude: Double,
    val foodName: String? = null,
    // 카카오 로컬 API 가 허용하는 반경 범위(0~20000m). 외부 API 로 그대로 전달되므로 제한한다.
    @field:Min(0) @field:Max(20000)
    val radius: Int = 1000
)

@RestController
@RequestMapping("/api/location")
class LocationController(
    private val locationService: LocationService
) {

    @PostMapping("/nearby-restaurants")
    @Operation(
        summary = "주변 음식점 검색",
        description = "현재 위치와(선택적으로) 음식 이름을 받아 카카오맵 기반 주변 음식점 목록을 반환합니다."
    )
    fun nearbyRestaurants(@Valid @RequestBody request: NearbyRestaurantsRequest): List<RestaurantSearchResult> {
        return locationService.searchNearbyRestaurants(
            latitude = request.latitude,
            longitude = request.longitude,
            radius = request.radius,
            foodCategory = request.foodName
        )
    }

    @GetMapping("/health")
    @Operation(summary = "위치 API 상태 확인", description = "주변 맛집 API 서버 상태/배포 확인용")
    fun health(): String = "Location API is running!!"
}
