package com.example.moodbite.config

import com.example.moodbite.domain.restaurant.Restaurant
import com.example.moodbite.domain.restaurant.RestaurantRepository
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class RestaurantDataInitializer {
    
    @Autowired
    private lateinit var restaurantRepository: RestaurantRepository
    
    @PostConstruct
    fun initRestaurantData() {
        if (restaurantRepository.count() == 0L) {
            initSampleRestaurants()
        }
    }
    
    private fun initSampleRestaurants() {
        val restaurants = listOf(
            // 강남 지역
            Restaurant(
                name = "할머니 김치찌개",
                category = "한식",
                address = "서울시 강남구 테헤란로 123",
                latitude = 37.5665,
                longitude = 126.9780,
                rating = 4.8,
                reviewCount = 250,
                priceLevel = 1,
                isOpen = true,
                openingHours = "09:00-22:00",
                phone = "02-1234-5678",
                menuItems = mutableListOf("김치찌개", "된장찌개", "순두부찌개", "공기밥"),
                foodTags = mutableListOf("김치찌개", "한식", "국물요리", "매운음식", "집밥")
            ),
            Restaurant(
                name = "이탈리아 파스타 전문점",
                category = "양식",
                address = "서울시 강남구 역삼동 456",
                latitude = 37.5670,
                longitude = 126.9785,
                rating = 4.5,
                reviewCount = 180,
                priceLevel = 2,
                isOpen = true,
                openingHours = "11:30-21:30",
                phone = "02-2345-6789",
                menuItems = mutableListOf("까르보나라", "로제파스타", "알리오올리오", "피자"),
                foodTags = mutableListOf("파스타", "양식", "이탈리아음식", "면요리")
            ),
            Restaurant(
                name = "우동 명가",
                category = "일식",
                address = "서울시 강남구 삼성동 789",
                latitude = 37.5675,
                longitude = 126.9775,
                rating = 4.3,
                reviewCount = 120,
                priceLevel = 2,
                isOpen = true,
                openingHours = "10:00-20:00",
                phone = "02-3456-7890",
                menuItems = mutableListOf("가츠우동", "새우튀김우동", "가락우동", "돈가스"),
                foodTags = mutableListOf("우동", "일식", "국물요리", "면요리")
            ),
            
            // 홍대 지역
            Restaurant(
                name = "홍대 치킨 맛집",
                category = "치킨",
                address = "서울시 마포구 홍익로 101",
                latitude = 37.5563,
                longitude = 126.9233,
                rating = 4.6,
                reviewCount = 300,
                priceLevel = 2,
                isOpen = true,
                openingHours = "17:00-02:00",
                phone = "02-4567-8901",
                menuItems = mutableListOf("후라이드치킨", "양념치킨", "간장치킨", "맥주"),
                foodTags = mutableListOf("치킨", "야식", "술안주", "매운음식")
            ),
            Restaurant(
                name = "분식 천국",
                category = "분식",
                address = "서울시 마포구 와우산로 202",
                latitude = 37.5568,
                longitude = 126.9238,
                rating = 4.2,
                reviewCount = 95,
                priceLevel = 1,
                isOpen = true,
                openingHours = "08:00-23:00",
                phone = "02-5678-9012",
                menuItems = mutableListOf("떡볶이", "김밥", "순대", "라면"),
                foodTags = mutableListOf("떡볶이", "분식", "김밥", "매운음식", "간식")
            ),
            
            // 명동 지역
            Restaurant(
                name = "프리미엄 스테이크 하우스",
                category = "양식",
                address = "서울시 중구 명동길 303",
                latitude = 37.5636,
                longitude = 126.9834,
                rating = 4.9,
                reviewCount = 150,
                priceLevel = 4,
                isOpen = true,
                openingHours = "17:30-23:00",
                phone = "02-6789-0123",
                menuItems = mutableListOf("등심스테이크", "안심스테이크", "립아이스테이크", "와인"),
                foodTags = mutableListOf("스테이크", "양식", "고급요리", "고기")
            ),
            Restaurant(
                name = "전통 갈비탕집",
                category = "한식",
                address = "서울시 중구 을지로 404",
                latitude = 37.5640,
                longitude = 126.9830,
                rating = 4.7,
                reviewCount = 200,
                priceLevel = 3,
                isOpen = true,
                openingHours = "10:00-22:00", 
                phone = "02-7890-1234",
                menuItems = mutableListOf("갈비탕", "설렁탕", "도가니탕", "공기밥"),
                foodTags = mutableListOf("갈비탕", "한식", "국물요리", "보양식")
            ),
            
            // 건대 지역
            Restaurant(
                name = "대학로 라면 거리",
                category = "분식",
                address = "서울시 광진구 능동로 505",
                latitude = 37.5407,
                longitude = 127.0696,
                rating = 4.1,
                reviewCount = 80,
                priceLevel = 1,
                isOpen = true,
                openingHours = "24시간",
                phone = "02-8901-2345",
                menuItems = mutableListOf("라면", "볶음면", "짜장면", "계란말이"),
                foodTags = mutableListOf("라면", "분식", "야식", "면요리")
            )
        )
        
        restaurantRepository.saveAll(restaurants)
        println("샘플 음식점 데이터 ${restaurants.size}개가 추가되었습니다.")
    }
}