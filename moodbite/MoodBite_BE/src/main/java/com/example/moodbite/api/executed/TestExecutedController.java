package com.example.moodbite.api.executed;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/test")
public class TestExecutedController {
//    private final TestExecutedService testExecutedService;
//
//
//    @GetMapping("/start")
//    @Operation(
//            summary = "게임 접근",
//            description = "이 API는 사용자가 게임을 시작할 수 있도록 제공됩니다."
//    )
//    @ApiResponses(value = {
//            @ApiResponse(responseCode = "200", description = "성공적으로 게임 시작"
////                    content = @Content(schema = @Schema(implementation = GameStartResponse.class))
//            ),
//            @ApiResponse(responseCode = "400", description = "잘못된 요청",
//                    content = @Content),
//            @ApiResponse(responseCode = "500", description = "서버 오류",
//                    content = @Content)
//    })
//    public void startTest(HttpServletRequest request) {
//        String clientIp = request.getRemoteAddr();
//        System.out.println("Client IP: " + clientIp);
//    }

}
