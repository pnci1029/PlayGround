package com.example.moodbite.domain.executed

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import java.time.LocalDateTime

@Entity
class TestExecuted(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    var tired: Int,
    var anger: Int,
    var stress: Int,
    var appetite: Int,
    var budget: Int,

    var dining: String, // ALONE, FRIENDS, FAMILY, DATE, COWORKERS, ETC
    var mealTime: String?, // MORNING, LUNCH, DINNER, MIDNIGHT_SNACK

    @CreatedDate
    var createdAt: LocalDateTime? = LocalDateTime.now()
) {
    protected constructor() : this(
        id = null,
        tired = 0,
        anger = 0,
        stress = 0,
        appetite = 0,
        budget = 0,
        dining = "",
        mealTime = null,
        createdAt = LocalDateTime.now()
    )
}