package com.example.moodbite.config

import com.example.moodbite.domain.food.Food
import com.example.moodbite.domain.food.FoodRepository
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class DataInitializer {
    
    @Autowired
    private lateinit var foodRepository: FoodRepository
    
    @PostConstruct
    fun initData() {
        if (foodRepository.count() == 0L) {
            initFoodData()
        }
    }
    
    private fun initFoodData() {
        val foods = listOf(
            // 한식
            Food(
                name = "김치찌개",
                category = "한식",
                description = "얼큰하고 시원한 김치찌개",
                comfortLevel = 9,
                energyBoost = 6,
                stressRelief = 8,
                appetiteMatch = 7,
                priceLevel = 1,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = false,
                morningFriendly = false,
                lunchFriendly = true,
                dinnerFriendly = true,
                midnightFriendly = true
            ),
            Food(
                name = "삼겹살",
                category = "한식",
                description = "고소한 삼겹살 구이",
                comfortLevel = 6,
                energyBoost = 8,
                stressRelief = 9,
                appetiteMatch = 9,
                priceLevel = 2,
                soloFriendly = false,
                groupFriendly = true,
                dateFriendly = true,
                morningFriendly = false,
                lunchFriendly = true,
                dinnerFriendly = true,
                midnightFriendly = false
            ),
            Food(
                name = "비빔밥",
                category = "한식",
                description = "영양 만점 비빔밥",
                comfortLevel = 7,
                energyBoost = 7,
                stressRelief = 5,
                appetiteMatch = 6,
                priceLevel = 2,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = true,
                morningFriendly = false,
                lunchFriendly = true,
                dinnerFriendly = true,
                midnightFriendly = false
            ),
            Food(
                name = "갈비탕",
                category = "한식",
                description = "진한 국물의 갈비탕",
                comfortLevel = 10,
                energyBoost = 8,
                stressRelief = 7,
                appetiteMatch = 8,
                priceLevel = 3,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = true,
                morningFriendly = false,
                lunchFriendly = true,
                dinnerFriendly = true,
                midnightFriendly = false
            ),
            
            // 분식
            Food(
                name = "떡볶이",
                category = "분식",
                description = "매콤달콤한 떡볶이",
                comfortLevel = 8,
                energyBoost = 5,
                stressRelief = 9,
                appetiteMatch = 6,
                priceLevel = 1,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = false,
                morningFriendly = false,
                lunchFriendly = true,
                dinnerFriendly = false,
                midnightFriendly = true
            ),
            Food(
                name = "김밥",
                category = "분식",
                description = "든든한 김밥",
                comfortLevel = 6,
                energyBoost = 6,
                stressRelief = 4,
                appetiteMatch = 5,
                priceLevel = 1,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = false,
                morningFriendly = true,
                lunchFriendly = true,
                dinnerFriendly = false,
                midnightFriendly = false
            ),
            
            // 양식
            Food(
                name = "파스타",
                category = "양식",
                description = "크림 파스타",
                comfortLevel = 7,
                energyBoost = 6,
                stressRelief = 6,
                appetiteMatch = 7,
                priceLevel = 2,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = true,
                morningFriendly = false,
                lunchFriendly = true,
                dinnerFriendly = true,
                midnightFriendly = false
            ),
            Food(
                name = "스테이크",
                category = "양식",
                description = "육즙 가득한 스테이크",
                comfortLevel = 6,
                energyBoost = 9,
                stressRelief = 8,
                appetiteMatch = 9,
                priceLevel = 3,
                soloFriendly = false,
                groupFriendly = true,
                dateFriendly = true,
                morningFriendly = false,
                lunchFriendly = true,
                dinnerFriendly = true,
                midnightFriendly = false
            ),
            
            // 일식
            Food(
                name = "우동",
                category = "일식",
                description = "따뜻한 우동",
                comfortLevel = 8,
                energyBoost = 5,
                stressRelief = 6,
                appetiteMatch = 7,
                priceLevel = 2,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = false,
                morningFriendly = false,
                lunchFriendly = true,
                dinnerFriendly = true,
                midnightFriendly = false
            ),
            Food(
                name = "초밥",
                category = "일식",
                description = "신선한 초밥",
                comfortLevel = 5,
                energyBoost = 6,
                stressRelief = 4,
                appetiteMatch = 6,
                priceLevel = 3,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = true,
                morningFriendly = false,
                lunchFriendly = true,
                dinnerFriendly = true,
                midnightFriendly = false
            ),
            
            // 치킨
            Food(
                name = "치킨",
                category = "치킨",
                description = "바삭한 후라이드 치킨",
                comfortLevel = 7,
                energyBoost = 7,
                stressRelief = 10,
                appetiteMatch = 9,
                priceLevel = 2,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = false,
                morningFriendly = false,
                lunchFriendly = false,
                dinnerFriendly = true,
                midnightFriendly = true
            ),
            
            // 죽/스프 (피곤할 때)
            Food(
                name = "전복죽",
                category = "한식",
                description = "부드러운 전복죽",
                comfortLevel = 10,
                energyBoost = 6,
                stressRelief = 8,
                appetiteMatch = 9,
                priceLevel = 2,
                soloFriendly = true,
                groupFriendly = false,
                dateFriendly = false,
                morningFriendly = true,
                lunchFriendly = true,
                dinnerFriendly = true,
                midnightFriendly = false
            ),
            
            // 국물 요리
            Food(
                name = "설렁탕",
                category = "한식",
                description = "진한 사골 국물",
                comfortLevel = 9,
                energyBoost = 7,
                stressRelief = 6,
                appetiteMatch = 8,
                priceLevel = 2,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = false,
                morningFriendly = false,
                lunchFriendly = true,
                dinnerFriendly = true,
                midnightFriendly = false
            ),
            
            // 간식류
            Food(
                name = "샐러드",
                category = "양식",
                description = "신선한 샐러드",
                comfortLevel = 4,
                energyBoost = 4,
                stressRelief = 3,
                appetiteMatch = 3,
                priceLevel = 2,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = true,
                morningFriendly = true,
                lunchFriendly = true,
                dinnerFriendly = false,
                midnightFriendly = false
            ),
            
            // 야식
            Food(
                name = "라면",
                category = "분식",
                description = "얼큰한 라면",
                comfortLevel = 8,
                energyBoost = 5,
                stressRelief = 7,
                appetiteMatch = 6,
                priceLevel = 1,
                soloFriendly = true,
                groupFriendly = true,
                dateFriendly = false,
                morningFriendly = false,
                lunchFriendly = true,
                dinnerFriendly = false,
                midnightFriendly = true
            )
        )
        
        foodRepository.saveAll(foods)
        println("초기 음식 데이터 ${foods.size}개가 추가되었습니다.")
    }
}