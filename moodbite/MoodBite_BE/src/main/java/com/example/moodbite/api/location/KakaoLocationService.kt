package com.example.moodbite.api.location

import com.example.moodbite.config.KakaoApiConfig
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import mu.KotlinLogging
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import kotlin.math.*

@Service
class KakaoLocationService(
    private val kakaoApiConfig: KakaoApiConfig,
    private val webClient: WebClient = WebClient.builder().build(),
    private val objectMapper: ObjectMapper = ObjectMapper()
) {
    
    private val logger = KotlinLogging.logger {}
    
    /**
     * 카카오맵 키워드 검색 API를 사용한 주변 음식점 검색
     */
    fun searchNearbyRestaurants(
        latitude: Double,
        longitude: Double,
        radius: Int = 1000,
        foodCategory: String? = null
    ): List<RestaurantSearchResult> {
        
        val keyword = mapFoodCategoryToKeyword(foodCategory)
        
        return try {
            val response = webClient.get()
                .uri { uriBuilder ->
                    uriBuilder.path(kakaoApiConfig.url)
                        .queryParam("query", "$keyword 맛집")
                        .queryParam("x", longitude)
                        .queryParam("y", latitude)
                        .queryParam("radius", radius)
                        .queryParam("category_group_code", "FD6") // 음식점 카테고리
                        .queryParam("size", 15)
                        .queryParam("sort", "distance")
                        .build()
                }
                .header(HttpHeaders.AUTHORIZATION, "KakaoAK ${kakaoApiConfig.key}")
                .retrieve()
                .bodyToMono(String::class.java)
                .block()
            
            parseKakaoResponse(response ?: "", latitude, longitude)
            
        } catch (e: Exception) {
            logger.error("카카오맵 API 호출 실패: ${e.message}", e)
            // API 실패 시 빈 리스트 반환
            emptyList()
        }
    }
    
    /**
     * 카카오맵 응답 JSON 파싱
     */
    private fun parseKakaoResponse(response: String, userLat: Double, userLng: Double): List<RestaurantSearchResult> {
        return try {
            val jsonNode = objectMapper.readTree(response)
            val documents = jsonNode.get("documents") ?: return emptyList()
            
            documents.map { place ->
                val lat = place.get("y").asDouble()
                val lng = place.get("x").asDouble()
                val distance = calculateDistance(userLat, userLng, lat, lng)
                
                RestaurantSearchResult(
                    name = place.get("place_name").asText(),
                    category = place.get("category_name").asText().split(" > ").lastOrNull() ?: "음식점",
                    address = place.get("road_address_name").asText().ifEmpty { 
                        place.get("address_name").asText() 
                    },
                    latitude = lat,
                    longitude = lng,
                    rating = 4.0 + (0..10).random() * 0.1, // 카카오맵은 평점이 없어서 임시 생성
                    distance = distance.toInt(),
                    priceLevel = (1..3).random(),
                    phone = place.get("phone").asText().ifEmpty { null },
                    isOpen = true, // 카카오맵은 영업시간 정보가 제한적
                    placeId = place.get("id").asText()
                )
            }.filter { it.distance <= 1000 } // 1km 이내만 필터링
             .sortedBy { it.distance }
            
        } catch (e: Exception) {
            logger.error("카카오맵 응답 파싱 실패: ${e.message}", e)
            emptyList()
        }
    }
    
    /**
     * 음식 카테고리를 카카오맵 키워드로 매핑
     */
    private fun mapFoodCategoryToKeyword(foodCategory: String?): String {
        return when (foodCategory) {
            "한식" -> "한식당"
            "양식" -> "양식당"
            "중식" -> "중식당"
            "일식" -> "일식당"
            "분식" -> "분식"
            "김치찌개" -> "김치찌개"
            "치킨" -> "치킨"
            "파스타" -> "파스타"
            "우동" -> "우동"
            "스테이크" -> "스테이크"
            "갈비탕" -> "갈비탕"
            "떡볶이" -> "떡볶이"
            "라면" -> "라면"
            else -> "맛집"
        }
    }
    
    /**
     * 두 좌표 간 거리 계산 (미터 단위)
     * Haversine formula 사용
     */
    private fun calculateDistance(lat1: Double, lng1: Double, lat2: Double, lng2: Double): Double {
        val R = 6371000.0 // 지구 반지름 (미터)
        val dLat = Math.toRadians(lat2 - lat1)
        val dLng = Math.toRadians(lng2 - lng1)
        
        val a = sin(dLat / 2).pow(2) + cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLng / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        return R * c
    }
}