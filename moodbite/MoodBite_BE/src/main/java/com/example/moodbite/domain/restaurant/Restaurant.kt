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

    var latitude: Double,
    var longitude: Double,

    var placeId: String? = null,
    var kakaoPlaceId: String? = null,

    var rating: Double? = null,
    var reviewCount: Int = 0,

    var isOpen: Boolean = true,
    var openingHours: String? = null,

    var priceLevel: Int = 2,

    @ElementCollection
    var menuItems: MutableList<String> = mutableListOf(),

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
