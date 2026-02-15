package com.example.moodbite.api.executed;

import com.example.moodbite.api.executed.dto.TestResultRequestDTO;
import com.example.moodbite.api.executed.dto.TestResultResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mood-test")
@CrossOrigin(origins = "http://localhost:3000")
public class TestExecutedController {
    
    @Autowired
    private TestExecutedService testExecutedService;

    @PostMapping("")
    @Operation(
            summary = "감정 테스트 결과 저장 및 음식 추천",
            description = "사용자의 감정 상태와 상황을 분석하여 맞춤형 음식을 추천합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(
                responseCode = "200", 
                description = "테스트 결과 저장 및 추천 성공",
                content = @Content(schema = @Schema(implementation = TestResultResponseDTO.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    public ResponseEntity<TestResultResponseDTO> submitTestResult(@RequestBody TestResultRequestDTO requestDTO) {
        try {
            TestResultResponseDTO response = testExecutedService.saveTestResult(requestDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/health")
    @Operation(summary = "API 상태 확인", description = "API 서버 상태를 확인합니다.")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("MoodBite API is running!");
    }
}
