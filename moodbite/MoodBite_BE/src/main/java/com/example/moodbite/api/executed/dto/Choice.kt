package com.example.moodbite.api.executed.dto

data class Choice(   // Choice 클래스 추가
    val index: Int,
    val message: ChatMessage,
    val finish_reason: String
)