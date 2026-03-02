package com.example.moodbite.domain.food

import jakarta.persistence.*

@Entity
class Food(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    var name: String,
    var description: String? = null,
    var imageUrl: String? = null,
    
    
    var priceLevel: Int = 2,
    
    
    
    
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
        ingredients = null,
        healthBenefits = null,
        mealTimes = null,
        diningTypes = null,
        minPrice = 0,
        maxPrice = 0,
        calories = 0,
        protein = 0.0,
        carbs = 0.0,
        fat = 0.0,
        prepTimeMinutes = 0,
        soloFriendly = true,
        groupFriendly = true,
        dateFriendly = false,
        morningFriendly = false,
        lunchFriendly = true,
        dinnerFriendly = true,
        midnightFriendly = false
    )
}