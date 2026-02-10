package com.example.moodbite.api.executed.dto;

data class ChatResponse(
    val id: String,
    val choices: List<Choice>
)