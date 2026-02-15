package com.example.moodbite.domain.restaurant

import jakarta.persistence.*

@Entity
class Restaurant(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    var name: String,
    var category: String, // 한식, 양식, 중식, 일식, 분식, 카페 등
    var address: String,
    var phone: String? = null,
    
    // 위치 정보
    var latitude: Double,
    var longitude: Double,
    
    // 외부 서비스 ID (Google Places, 카카오맵 등)
    var placeId: String? = null,
    var kakaoPlaceId: String? = null,
    
    // 평점 및 리뷰 정보
    var rating: Double? = null,
    var reviewCount: Int = 0,
    
    // 운영 정보
    var isOpen: Boolean = true,
    var openingHours: String? = null,
    
    // 가격대 (1: 저렴, 2: 보통, 3: 비싼, 4: 고급)
    var priceLevel: Int = 2,
    
    // 대표 메뉴들
    @ElementCollection
    var menuItems: MutableList<String> = mutableListOf(),
    
    // 음식 카테고리 매칭을 위한 태그들
    @ElementCollection 
    var foodTags: MutableList<String> = mutableListOf() // ["김치찌개", "한식", "국물요리", "매운음식"]
    
) {
    protected constructor() : this(
        id = null,
        name = "",
        category = "",
        address = "",
        phone = null,
        latitude = 0.0,
        longitude = 0.0,
        placeId = null,
        kakaoPlaceId = null,
        rating = null,
        reviewCount = 0,
        isOpen = true,
        openingHours = null,
        priceLevel = 2,
        menuItems = mutableListOf(),
        foodTags = mutableListOf()
    )
}