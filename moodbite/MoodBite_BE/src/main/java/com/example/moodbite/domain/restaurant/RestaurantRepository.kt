package com.example.moodbite.domain.restaurant

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface RestaurantRepository : JpaRepository<Restaurant, Long> {
    
    /**
     * 위치 기반으로 특정 반경 내의 음식점 검색
     */
    @Query("""
        SELECT r FROM Restaurant r 
        WHERE (
            6371000 * ACOS(
                COS(RADIANS(:latitude)) * COS(RADIANS(r.latitude)) * 
                COS(RADIANS(r.longitude) - RADIANS(:longitude)) + 
                SIN(RADIANS(:latitude)) * SIN(RADIANS(r.latitude))
            )
        ) <= :radiusMeters
        ORDER BY (
            6371000 * ACOS(
                COS(RADIANS(:latitude)) * COS(RADIANS(r.latitude)) * 
                COS(RADIANS(r.longitude) - RADIANS(:longitude)) + 
                SIN(RADIANS(:latitude)) * SIN(RADIANS(r.latitude))
            )
        ) ASC
    """)
    fun findRestaurantsWithinRadius(
        @Param("latitude") latitude: Double,
        @Param("longitude") longitude: Double,
        @Param("radiusMeters") radiusMeters: Double
    ): List<Restaurant>
    
    /**
     * 카테고리별 음식점 검색
     */
    fun findByCategoryContaining(category: String): List<Restaurant>
    
    /**
     * 음식 태그로 음식점 검색
     */
    @Query("SELECT r FROM Restaurant r WHERE :foodTag MEMBER OF r.foodTags")
    fun findByFoodTagsContaining(@Param("foodTag") foodTag: String): List<Restaurant>
    
    /**
     * 가격대별 음식점 검색
     */
    fun findByPriceLevelLessThanEqual(priceLevel: Int): List<Restaurant>
    
    /**
     * 영업 중인 음식점만 검색
     */
    fun findByIsOpenTrue(): List<Restaurant>
    
    /**
     * 평점 이상 음식점 검색
     */
    fun findByRatingGreaterThanEqual(rating: Double): List<Restaurant>
}