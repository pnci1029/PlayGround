package com.example.moodbite.api.food.service

import com.example.moodbite.api.food.entity.FoodRecommendation
import com.example.moodbite.api.food.repository.FoodRecommendationRepository
import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Service

@Service
class DataInitService(
    private val foodRepository: FoodRecommendationRepository
) {
    
    @PostConstruct
    fun initData() {
        if (foodRepository.count() == 0L) {
            val foods = listOf(
                FoodRecommendation(
                    name = "김치찌개",
                    description = "신김치와 돼지고기로 끓인 얼큰한 찌개",
                    category = "찌개류",
                    calories = 350,
                    protein = 18.5f,
                    carbs = 12.3f,
                    fat = 22.1f,
                    minPrice = 8000,
                    maxPrice = 12000,
                    prepTimeMinutes = 20,
                    energyBoostScore = 85,
                    stressReliefScore = 70,
                    appetiteStimulationScore = 90,
                    comfortScore = 95,
                    suitableForMorning = false,
                    suitableForLunch = true,
                    suitableForDinner = true,
                    suitableForMidnight = false,
                    suitableForAlone = true,
                    suitableForFriends = true,
                    suitableForFamily = true,
                    suitableForDate = false,
                    suitableForBusiness = false,
                    ingredients = "신김치, 돼지고기, 두부, 대파, 마늘",
                    healthBenefits = "유산균이 풍부한 김치로 장 건강 증진"
                ),
                FoodRecommendation(
                    name = "삼계탕",
                    description = "닭 한 마리에 인삼과 찹쌀을 넣고 끓인 보양식",
                    category = "탕류",
                    calories = 600,
                    protein = 28.7f,
                    carbs = 35.2f,
                    fat = 18.9f,
                    minPrice = 15000,
                    maxPrice = 25000,
                    prepTimeMinutes = 60,
                    energyBoostScore = 95,
                    stressReliefScore = 60,
                    appetiteStimulationScore = 85,
                    comfortScore = 80,
                    suitableForMorning = true,
                    suitableForLunch = true,
                    suitableForDinner = true,
                    suitableForMidnight = false,
                    suitableForAlone = true,
                    suitableForFriends = false,
                    suitableForFamily = true,
                    suitableForDate = true,
                    suitableForBusiness = true,
                    ingredients = "닭, 인삼, 찹쌀, 대추, 마늘",
                    healthBenefits = "단백질과 인삼 성분으로 체력 회복"
                ),
                FoodRecommendation(
                    name = "된장찌개",
                    description = "된장을 우린 국물에 각종 채소를 넣은 찌개",
                    category = "찌개류",
                    calories = 180,
                    protein = 12.3f,
                    carbs = 15.8f,
                    fat = 8.2f,
                    minPrice = 6000,
                    maxPrice = 10000,
                    prepTimeMinutes = 15,
                    energyBoostScore = 60,
                    stressReliefScore = 85,
                    appetiteStimulationScore = 75,
                    comfortScore = 90,
                    suitableForMorning = true,
                    suitableForLunch = true,
                    suitableForDinner = true,
                    suitableForMidnight = false,
                    suitableForAlone = true,
                    suitableForFriends = true,
                    suitableForFamily = true,
                    suitableForDate = false,
                    suitableForBusiness = true,
                    ingredients = "된장, 두부, 양파, 애호박, 감자",
                    healthBenefits = "발효식품으로 장 건강 개선"
                ),
                FoodRecommendation(
                    name = "비빔밥",
                    description = "각종 나물과 고추장을 넣고 비빈 영양 균형 밥",
                    category = "밥류",
                    calories = 420,
                    protein = 15.2f,
                    carbs = 68.5f,
                    fat = 12.8f,
                    minPrice = 8000,
                    maxPrice = 15000,
                    prepTimeMinutes = 25,
                    energyBoostScore = 70,
                    stressReliefScore = 75,
                    appetiteStimulationScore = 85,
                    comfortScore = 70,
                    suitableForMorning = false,
                    suitableForLunch = true,
                    suitableForDinner = true,
                    suitableForMidnight = false,
                    suitableForAlone = true,
                    suitableForFriends = false,
                    suitableForFamily = true,
                    suitableForDate = true,
                    suitableForBusiness = true,
                    ingredients = "밥, 나물, 계란, 고추장, 참기름",
                    healthBenefits = "다양한 채소로 비타민과 미네랄 공급"
                ),

                // ===== 한식 추가 =====
                FoodRecommendation(
                    name = "소고기 미역국", description = "철분이 풍부한 미역과 소고기로 끓인 맑은 국",
                    category = "한식", calories = 220, protein = 16.0f, carbs = 10.0f, fat = 9.0f,
                    minPrice = 7000, maxPrice = 11000, prepTimeMinutes = 25,
                    energyBoostScore = 75, stressReliefScore = 70, appetiteStimulationScore = 65, comfortScore = 88,
                    suitableForMorning = true, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = false, suitableForFamily = true, suitableForDate = false, suitableForBusiness = true,
                    ingredients = "미역, 소고기, 마늘, 참기름", healthBenefits = "철분과 요오드가 풍부하여 피로 회복과 혈액 건강에 도움"
                ),
                FoodRecommendation(
                    name = "제육볶음", description = "고추장 양념에 돼지고기를 매콤하게 볶은 백반",
                    category = "한식", calories = 520, protein = 26.0f, carbs = 38.0f, fat = 24.0f,
                    minPrice = 8000, maxPrice = 13000, prepTimeMinutes = 20,
                    energyBoostScore = 88, stressReliefScore = 80, appetiteStimulationScore = 92, comfortScore = 80,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = true, suitableForDate = false, suitableForBusiness = true,
                    ingredients = "돼지고기, 고추장, 양파, 마늘, 대파", healthBenefits = "캡사이신이 엔돌핀 분비를 촉진해 스트레스 해소에 도움"
                ),

                // ===== 일식 =====
                FoodRecommendation(
                    name = "연어 초밥 모둠", description = "신선한 연어와 제철 생선을 올린 모둠 초밥",
                    category = "일식", calories = 380, protein = 24.0f, carbs = 52.0f, fat = 8.0f,
                    minPrice = 15000, maxPrice = 28000, prepTimeMinutes = 20,
                    energyBoostScore = 65, stressReliefScore = 72, appetiteStimulationScore = 80, comfortScore = 70,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = true, suitableForDate = true, suitableForBusiness = true,
                    ingredients = "연어, 밥, 와사비, 간장", healthBenefits = "오메가3가 풍부해 항염과 뇌 건강에 도움"
                ),
                FoodRecommendation(
                    name = "돈코츠 라멘", description = "진한 돼지뼈 육수에 차슈를 올린 일본식 라멘",
                    category = "일식", calories = 540, protein = 22.0f, carbs = 60.0f, fat = 22.0f,
                    minPrice = 9000, maxPrice = 14000, prepTimeMinutes = 15,
                    energyBoostScore = 82, stressReliefScore = 85, appetiteStimulationScore = 85, comfortScore = 90,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = true,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = false, suitableForDate = false, suitableForBusiness = false,
                    ingredients = "면, 돼지뼈 육수, 차슈, 대파, 마늘", healthBenefits = "따뜻한 국물이 심리적 안정과 포만감을 제공"
                ),
                FoodRecommendation(
                    name = "규동", description = "달짝지근하게 졸인 소고기를 밥 위에 올린 덮밥",
                    category = "일식", calories = 600, protein = 24.0f, carbs = 78.0f, fat = 18.0f,
                    minPrice = 7000, maxPrice = 11000, prepTimeMinutes = 12,
                    energyBoostScore = 85, stressReliefScore = 60, appetiteStimulationScore = 80, comfortScore = 75,
                    suitableForMorning = true, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = false, suitableForFamily = true, suitableForDate = false, suitableForBusiness = true,
                    ingredients = "소고기, 양파, 밥, 간장", healthBenefits = "소고기의 철분과 단백질로 에너지 보충"
                ),

                // ===== 중식 =====
                FoodRecommendation(
                    name = "마파두부", description = "두부와 다진 고기를 매콤한 두반장 소스로 볶은 사천 요리",
                    category = "중식", calories = 420, protein = 22.0f, carbs = 30.0f, fat = 24.0f,
                    minPrice = 8000, maxPrice = 13000, prepTimeMinutes = 18,
                    energyBoostScore = 78, stressReliefScore = 82, appetiteStimulationScore = 88, comfortScore = 78,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = true, suitableForDate = false, suitableForBusiness = true,
                    ingredients = "두부, 다진 돼지고기, 두반장, 마늘, 생강", healthBenefits = "식물성 단백질이 풍부하고 생강이 소화를 돕는다"
                ),
                FoodRecommendation(
                    name = "탕수육", description = "바삭하게 튀긴 돼지고기에 새콤달콤한 소스를 곁들인 요리",
                    category = "중식", calories = 680, protein = 28.0f, carbs = 70.0f, fat = 30.0f,
                    minPrice = 15000, maxPrice = 25000, prepTimeMinutes = 30,
                    energyBoostScore = 80, stressReliefScore = 78, appetiteStimulationScore = 90, comfortScore = 82,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = false, suitableForFriends = true, suitableForFamily = true, suitableForDate = false, suitableForBusiness = true,
                    ingredients = "돼지고기, 설탕, 식초, 당근, 양파", healthBenefits = "함께 나누기 좋아 사회적 식사 만족도가 높다"
                ),

                // ===== 이탈리아 =====
                FoodRecommendation(
                    name = "마르게리타 피자", description = "토마토 소스와 모짜렐라, 바질의 클래식 나폴리 피자",
                    category = "이탈리아", calories = 700, protein = 28.0f, carbs = 80.0f, fat = 26.0f,
                    minPrice = 13000, maxPrice = 22000, prepTimeMinutes = 20,
                    energyBoostScore = 75, stressReliefScore = 82, appetiteStimulationScore = 85, comfortScore = 85,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = true,
                    suitableForAlone = false, suitableForFriends = true, suitableForFamily = true, suitableForDate = true, suitableForBusiness = false,
                    ingredients = "도우, 토마토, 모짜렐라, 바질", healthBenefits = "토마토의 라이코펜이 항산화 작용을 한다"
                ),
                FoodRecommendation(
                    name = "트러플 까르보나라", description = "크림과 트러플 향을 더한 진한 파스타",
                    category = "이탈리아", calories = 620, protein = 20.0f, carbs = 68.0f, fat = 28.0f,
                    minPrice = 14000, maxPrice = 24000, prepTimeMinutes = 18,
                    energyBoostScore = 72, stressReliefScore = 80, appetiteStimulationScore = 82, comfortScore = 88,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = false, suitableForDate = true, suitableForBusiness = true,
                    ingredients = "파스타, 계란, 베이컨, 트러플, 파르메산", healthBenefits = "고소한 풍미가 컴포트 푸드로서 심리적 위안을 준다"
                ),

                // ===== 서양식 =====
                FoodRecommendation(
                    name = "연어 스테이크 샐러드", description = "구운 연어와 아보카도를 올린 든든한 샐러드 플레이트",
                    category = "서양식", calories = 480, protein = 32.0f, carbs = 18.0f, fat = 28.0f,
                    minPrice = 16000, maxPrice = 26000, prepTimeMinutes = 25,
                    energyBoostScore = 78, stressReliefScore = 80, appetiteStimulationScore = 70, comfortScore = 72,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = false, suitableForFamily = true, suitableForDate = true, suitableForBusiness = true,
                    ingredients = "연어, 아보카도, 토마토, 채소, 올리브유", healthBenefits = "오메가3와 신선한 채소로 항산화와 항염 효과"
                ),
                FoodRecommendation(
                    name = "시저 샐러드", description = "로메인과 파르메산, 크루통의 가벼운 샐러드",
                    category = "서양식", calories = 320, protein = 14.0f, carbs = 20.0f, fat = 18.0f,
                    minPrice = 9000, maxPrice = 15000, prepTimeMinutes = 10,
                    energyBoostScore = 55, stressReliefScore = 60, appetiteStimulationScore = 60, comfortScore = 55,
                    suitableForMorning = true, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = false, suitableForFamily = false, suitableForDate = true, suitableForBusiness = true,
                    ingredients = "로메인, 파르메산, 크루통, 토마토", healthBenefits = "신선한 채소로 가볍고 항산화 영양소가 풍부"
                ),
                FoodRecommendation(
                    name = "아보카도 토스트", description = "통곡물 빵에 으깬 아보카도와 계란을 올린 브런치",
                    category = "서양식", calories = 340, protein = 14.0f, carbs = 32.0f, fat = 18.0f,
                    minPrice = 8000, maxPrice = 14000, prepTimeMinutes = 10,
                    energyBoostScore = 72, stressReliefScore = 58, appetiteStimulationScore = 60, comfortScore = 60,
                    suitableForMorning = true, suitableForLunch = true, suitableForDinner = false, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = false, suitableForFamily = false, suitableForDate = true, suitableForBusiness = false,
                    ingredients = "통곡물 빵, 아보카도, 계란, 토마토", healthBenefits = "마그네슘과 불포화지방이 풍부해 아침 에너지에 좋다"
                ),
                FoodRecommendation(
                    name = "수제 치즈버거", description = "두툼한 패티와 신선한 채소를 넣은 수제 버거",
                    category = "미국", calories = 720, protein = 34.0f, carbs = 58.0f, fat = 38.0f,
                    minPrice = 9000, maxPrice = 16000, prepTimeMinutes = 15,
                    energyBoostScore = 85, stressReliefScore = 78, appetiteStimulationScore = 90, comfortScore = 85,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = true,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = true, suitableForDate = false, suitableForBusiness = false,
                    ingredients = "소고기 패티, 번, 치즈, 양상추, 토마토", healthBenefits = "고단백 고칼로리로 강한 포만감과 만족감을 준다"
                ),

                // ===== 멕시코 =====
                FoodRecommendation(
                    name = "치킨 타코", description = "토르티야에 닭고기와 살사를 채운 멕시코 타코",
                    category = "멕시코", calories = 450, protein = 26.0f, carbs = 40.0f, fat = 20.0f,
                    minPrice = 9000, maxPrice = 15000, prepTimeMinutes = 15,
                    energyBoostScore = 78, stressReliefScore = 72, appetiteStimulationScore = 85, comfortScore = 70,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = true,
                    suitableForAlone = false, suitableForFriends = true, suitableForFamily = true, suitableForDate = false, suitableForBusiness = false,
                    ingredients = "토르티야, 닭고기, 양파, 토마토, 라임", healthBenefits = "여럿이 나눠 먹기 좋아 사회적 즐거움을 더한다"
                ),
                FoodRecommendation(
                    name = "부리또 볼", description = "밥과 콩, 고기, 과카몰리를 담은 든든한 멕시코 볼",
                    category = "멕시코", calories = 620, protein = 28.0f, carbs = 70.0f, fat = 22.0f,
                    minPrice = 10000, maxPrice = 16000, prepTimeMinutes = 15,
                    energyBoostScore = 82, stressReliefScore = 68, appetiteStimulationScore = 82, comfortScore = 72,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = false, suitableForDate = false, suitableForBusiness = true,
                    ingredients = "밥, 콩, 닭고기, 아보카도, 토마토", healthBenefits = "콩의 식이섬유와 아보카도의 건강한 지방이 풍부"
                ),

                // ===== 태국 =====
                FoodRecommendation(
                    name = "팟타이", description = "쌀국수를 새콤달콤하게 볶은 태국 대표 면 요리",
                    category = "태국", calories = 520, protein = 18.0f, carbs = 72.0f, fat = 16.0f,
                    minPrice = 10000, maxPrice = 16000, prepTimeMinutes = 18,
                    energyBoostScore = 76, stressReliefScore = 70, appetiteStimulationScore = 88, comfortScore = 68,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = true, suitableForDate = true, suitableForBusiness = true,
                    ingredients = "쌀국수, 새우, 숙주, 땅콩, 라임", healthBenefits = "다채로운 향신료가 식욕을 돋우고 기분을 전환시킨다"
                ),
                FoodRecommendation(
                    name = "그린 카레", description = "코코넛밀크와 향신료로 끓인 부드러운 태국 카레",
                    category = "태국", calories = 480, protein = 20.0f, carbs = 38.0f, fat = 26.0f,
                    minPrice = 11000, maxPrice = 17000, prepTimeMinutes = 20,
                    energyBoostScore = 72, stressReliefScore = 78, appetiteStimulationScore = 86, comfortScore = 75,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = true, suitableForDate = true, suitableForBusiness = false,
                    ingredients = "코코넛밀크, 닭고기, 강황, 생강, 바질", healthBenefits = "강황과 생강의 항염 성분이 스트레스 완화에 도움"
                ),

                // ===== 베트남 =====
                FoodRecommendation(
                    name = "소고기 쌀국수", description = "맑은 사골 육수에 쌀국수를 말아낸 베트남 포",
                    category = "베트남", calories = 380, protein = 22.0f, carbs = 56.0f, fat = 8.0f,
                    minPrice = 9000, maxPrice = 14000, prepTimeMinutes = 15,
                    energyBoostScore = 70, stressReliefScore = 80, appetiteStimulationScore = 78, comfortScore = 85,
                    suitableForMorning = true, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = true,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = true, suitableForDate = false, suitableForBusiness = true,
                    ingredients = "쌀국수, 소고기, 숙주, 양파, 생강", healthBenefits = "기름기 적은 맑은 국물로 소화가 편하고 속을 달랜다"
                ),

                // ===== 인도 =====
                FoodRecommendation(
                    name = "치킨 티카 마살라", description = "토마토 크림 소스에 향신료로 익힌 인도식 닭 커리",
                    category = "인도", calories = 560, protein = 30.0f, carbs = 40.0f, fat = 28.0f,
                    minPrice = 12000, maxPrice = 19000, prepTimeMinutes = 30,
                    energyBoostScore = 78, stressReliefScore = 82, appetiteStimulationScore = 90, comfortScore = 80,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = true, suitableForDate = true, suitableForBusiness = true,
                    ingredients = "닭고기, 토마토, 강황, 생강, 마늘", healthBenefits = "강황의 커큐민이 항염과 항산화 작용을 한다"
                ),

                // ===== 터키 =====
                FoodRecommendation(
                    name = "치킨 케밥", description = "향신료에 재운 닭고기를 구워 채소와 함께 싼 케밥",
                    category = "터키", calories = 540, protein = 32.0f, carbs = 48.0f, fat = 22.0f,
                    minPrice = 8000, maxPrice = 14000, prepTimeMinutes = 15,
                    energyBoostScore = 80, stressReliefScore = 68, appetiteStimulationScore = 85, comfortScore = 70,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = true,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = false, suitableForDate = false, suitableForBusiness = false,
                    ingredients = "닭고기, 또띠야, 양파, 토마토, 요거트 소스", healthBenefits = "고단백 한 끼로 빠르게 에너지를 보충"
                ),

                // ===== 중동 =====
                FoodRecommendation(
                    name = "후무스 플레이트", description = "병아리콩 후무스와 따뜻한 피타빵의 중동식 플레이트",
                    category = "중동", calories = 360, protein = 16.0f, carbs = 44.0f, fat = 14.0f,
                    minPrice = 10000, maxPrice = 16000, prepTimeMinutes = 12,
                    energyBoostScore = 60, stressReliefScore = 72, appetiteStimulationScore = 62, comfortScore = 65,
                    suitableForMorning = true, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = false, suitableForDate = true, suitableForBusiness = true,
                    ingredients = "병아리콩, 마늘, 올리브유, 피타빵", healthBenefits = "콩의 식이섬유와 식물성 단백질이 풍부"
                ),

                // ===== 디저트 / 음료 =====
                FoodRecommendation(
                    name = "그릭 요거트 베리볼", description = "그릭 요거트에 견과류와 베리를 곁들인 가벼운 볼",
                    category = "디저트", calories = 260, protein = 18.0f, carbs = 28.0f, fat = 9.0f,
                    minPrice = 6000, maxPrice = 11000, prepTimeMinutes = 5,
                    energyBoostScore = 55, stressReliefScore = 70, appetiteStimulationScore = 55, comfortScore = 72,
                    suitableForMorning = true, suitableForLunch = false, suitableForDinner = false, suitableForMidnight = true,
                    suitableForAlone = true, suitableForFriends = false, suitableForFamily = false, suitableForDate = false, suitableForBusiness = false,
                    ingredients = "요거트, 견과, 베리, 꿀", healthBenefits = "프로바이오틱스와 항산화 성분으로 장-뇌 건강에 도움"
                ),
                FoodRecommendation(
                    name = "그린 디톡스 스무디", description = "시금치와 바나나, 베리를 갈아 만든 건강 스무디",
                    category = "음료", calories = 210, protein = 8.0f, carbs = 38.0f, fat = 4.0f,
                    minPrice = 5000, maxPrice = 9000, prepTimeMinutes = 5,
                    energyBoostScore = 65, stressReliefScore = 60, appetiteStimulationScore = 50, comfortScore = 50,
                    suitableForMorning = true, suitableForLunch = false, suitableForDinner = false, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = false, suitableForFamily = false, suitableForDate = false, suitableForBusiness = false,
                    ingredients = "시금치, 바나나, 베리, 요거트", healthBenefits = "철분과 항산화 성분이 풍부한 신선한 한 잔"
                ),

                // ===== 분식 =====
                FoodRecommendation(
                    name = "떡볶이", description = "쫄깃한 떡을 매콤달콤한 고추장 양념에 볶은 분식",
                    category = "분식", calories = 480, protein = 10.0f, carbs = 90.0f, fat = 10.0f,
                    minPrice = 4000, maxPrice = 8000, prepTimeMinutes = 15,
                    energyBoostScore = 70, stressReliefScore = 85, appetiteStimulationScore = 88, comfortScore = 88,
                    suitableForMorning = false, suitableForLunch = true, suitableForDinner = true, suitableForMidnight = true,
                    suitableForAlone = true, suitableForFriends = true, suitableForFamily = false, suitableForDate = false, suitableForBusiness = false,
                    ingredients = "떡, 고추장, 어묵, 대파, 설탕", healthBenefits = "캡사이신이 엔돌핀을 분비시켜 기분 전환에 좋다"
                ),
                FoodRecommendation(
                    name = "김밥", description = "밥과 채소, 계란을 김에 말아낸 간편한 한 끼",
                    category = "분식", calories = 350, protein = 12.0f, carbs = 58.0f, fat = 9.0f,
                    minPrice = 3000, maxPrice = 6000, prepTimeMinutes = 10,
                    energyBoostScore = 65, stressReliefScore = 55, appetiteStimulationScore = 60, comfortScore = 62,
                    suitableForMorning = true, suitableForLunch = true, suitableForDinner = false, suitableForMidnight = false,
                    suitableForAlone = true, suitableForFriends = false, suitableForFamily = true, suitableForDate = false, suitableForBusiness = true,
                    ingredients = "밥, 김, 단무지, 계란, 시금치", healthBenefits = "간편하면서 탄수화물과 채소를 균형 있게 섭취"
                ),

                // ===== 치킨 =====
                FoodRecommendation(
                    name = "후라이드 치킨", description = "겉은 바삭하고 속은 촉촉한 한국식 후라이드 치킨",
                    category = "치킨", calories = 760, protein = 38.0f, carbs = 40.0f, fat = 44.0f,
                    minPrice = 16000, maxPrice = 22000, prepTimeMinutes = 25,
                    energyBoostScore = 85, stressReliefScore = 88, appetiteStimulationScore = 92, comfortScore = 90,
                    suitableForMorning = false, suitableForLunch = false, suitableForDinner = true, suitableForMidnight = true,
                    suitableForAlone = false, suitableForFriends = true, suitableForFamily = true, suitableForDate = false, suitableForBusiness = false,
                    ingredients = "닭고기, 튀김옷, 마늘", healthBenefits = "함께 나누는 즐거움이 큰 대표적 컴포트 푸드"
                )
            )

            foodRepository.saveAll(foods)
        }
    }
}