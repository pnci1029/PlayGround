package com.example.moodbite.domain.food

import jakarta.persistence.*

@Entity
class Food(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    var name: String,
    var category: String, // 한식, 양식, 중식, 일식, 분식 등
    var description: String? = null,
    var imageUrl: String? = null,
    
    // 감정과의 매칭을 위한 점수들 (1-10)
    var comfortLevel: Int = 5, // 피로할 때 얼마나 좋은지
    var energyBoost: Int = 5, // 에너지를 얼마나 주는지
    var stressRelief: Int = 5, // 스트레스 해소에 좋은지
    var appetiteMatch: Int = 5, // 식욕이 없을 때 좋은지
    
    // 가격대 (1: 저렴, 2: 보통, 3: 비싸다)
    var priceLevel: Int = 2,
    
    // 상황별 적합도
    var soloFriendly: Boolean = true, // 혼자 먹기 좋은지
    var groupFriendly: Boolean = true, // 단체로 먹기 좋은지
    var dateFriendly: Boolean = false, // 데이트에 좋은지
    
    // 시간대별 적합도
    var morningFriendly: Boolean = false,
    var lunchFriendly: Boolean = true,
    var dinnerFriendly: Boolean = true,
    var midnightFriendly: Boolean = false
) {
    protected constructor() : this(
        id = null,
        name = "",
        category = "",
        description = null,
        imageUrl = null,
        comfortLevel = 5,
        energyBoost = 5,
        stressRelief = 5,
        appetiteMatch = 5,
        priceLevel = 2,
        soloFriendly = true,
        groupFriendly = true,
        dateFriendly = false,
        morningFriendly = false,
        lunchFriendly = true,
        dinnerFriendly = true,
        midnightFriendly = false
    )
}