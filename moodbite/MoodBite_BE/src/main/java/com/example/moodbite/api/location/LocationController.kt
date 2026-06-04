package com.example.moodbite.api.location

import io.swagger.v3.oas.annotations.Operation
import org.springframework.web.bind.annotation.CrossOrigin
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
@CrossOrigin(origins = ["*"], allowedHeaders = ["*"], allowCredentials = "false")
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
}
