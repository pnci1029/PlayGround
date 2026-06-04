package com.example.moodbite.api.location

import io.swagger.v3.oas.annotations.Operation
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class NearbyRestaurantsRequest(
    val latitude: Double,
    val longitude: Double,
    val foodName: String? = null,
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
    fun nearbyRestaurants(@RequestBody request: NearbyRestaurantsRequest): List<RestaurantSearchResult> {
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
