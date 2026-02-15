package com.example.moodbite.api.location

import org.springframework.stereotype.Service

@Service
class LocationService(
    private val kakaoLocationService: KakaoLocationService
) {
    
    /**
     * 카카오맵 API를 사용한 주변 음식점 검색
     */
    fun searchNearbyRestaurants(
        latitude: Double, 
        longitude: Double, 
        radius: Int = 1000,
        foodCategory: String? = null
    ): List<RestaurantSearchResult> {
        
        return try {
            // 실제 카카오맵 API 호출
            kakaoLocationService.searchNearbyRestaurants(
                latitude = latitude,
                longitude = longitude,
                radius = radius,
                foodCategory = foodCategory
            )
        } catch (e: Exception) {
            println("위치 기반 음식점 검색 실패: ${e.message}")
            // API 실패 시 빈 리스트 반환
            emptyList()
        }
    }
}

data class RestaurantSearchResult(
    val name: String,
    val category: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val rating: Double,
    val distance: Int, // 미터 단위
    val priceLevel: Int,
    val phone: String? = null,
    val isOpen: Boolean = true,
    val placeId: String? = null
)