package com.example.moodbite.domain.executed

import com.example.moodbite.domain.executed.enums.Gender
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import java.time.LocalDateTime

@Entity
class TestExecuted(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    var joyRate: Int,
    var nervousRate: Int,
    var angerRate: Int,
    var tirednessRate: Int,

    @Enumerated(EnumType.STRING)
    var gender: Gender,

    var mealTime: String, // lunch, dinner ...
    var mealType: String, // snack, meal...
    var lastMeal: String,

    @CreatedDate
    var createdAt: LocalDateTime? = null
) {
    // 필요한 경우 생성자나 메서드를 추가
    protected constructor() : this(
        id = null,
        joyRate = 0,
        nervousRate = 0,
        angerRate = 0,
        tirednessRate = 0,
        gender = Gender.NONE,  // Gender enum에 NONE 값이 있다고 가정
        mealTime = "",
        mealType = "",
        lastMeal = "",
        createdAt = null
    )
}