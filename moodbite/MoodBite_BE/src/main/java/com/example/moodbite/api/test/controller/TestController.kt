package com.example.moodbite.api.test.controller

import com.example.moodbite.api.test.dto.request.TestRequestDTO
import com.example.moodbite.api.test.service.TestService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

// CORS 는 전역 WebConfig 의 허용 오리진 목록을 따른다.
// (이전의 @CrossOrigin(origins=["*"]) 는 전역 화이트리스트를 무력화해서 제거했다.)
@RestController
@RequestMapping("/api")
class TestController(
    private val testService: TestService,
) {

    @PostMapping("/test")
    fun test(@Valid @RequestBody dto: TestRequestDTO): String {
        return testService.getResult(dto)
    }

    @PostMapping("/test/location-based")
    fun locationBasedTest(@Valid @RequestBody dto: TestRequestDTO): String {
        return testService.getLocationBasedResult(dto)
    }
}