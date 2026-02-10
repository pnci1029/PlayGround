package com.example.moodbite.api.executed.dto

data class ChatRequest(
    var model: String,
    private val prompt: String,
    var n: Int = 1
) {
    var messages: List<ChatMessage> = listOf(ChatMessage("user", prompt))
}