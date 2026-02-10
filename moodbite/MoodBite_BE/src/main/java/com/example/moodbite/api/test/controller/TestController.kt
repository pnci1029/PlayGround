package com.example.moodbite.api.test.controller

import com.example.moodbite.api.test.dto.request.TestRequestDTO
import com.example.moodbite.api.test.service.TestService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class TestController(
    private val testService: TestService,
) {

    @PostMapping("/test")
    fun test(@RequestBody dto: TestRequestDTO): String {
        return testService.getResult(dto)

    }
}