package com.example.moodbite.api.executed;

import com.example.moodbite.api.executed.dto.TestResultRequestDTO;
import com.example.moodbite.api.executed.dto.TestResultResponseDTO;
import com.example.moodbite.api.executed.service.FoodRecommendationService;
import com.example.moodbite.domain.executed.TestExecuted;
import com.example.moodbite.domain.executed.TestExecutedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service 
public class TestExecutedService {
    
    @Autowired
    private TestExecutedRepository testExecutedRepository;
    
    @Autowired
    private FoodRecommendationService foodRecommendationService;
    
    public TestResultResponseDTO saveTestResult(TestResultRequestDTO requestDTO) {
        // DTO를 Entity로 변환
        TestExecuted testExecuted = new TestExecuted(
            null,
            requestDTO.getScores().getTired(),
            requestDTO.getScores().getAnger(),
            requestDTO.getScores().getStress(),
            requestDTO.getScores().getAppetite(),
            requestDTO.getScores().getBudget(),
            requestDTO.getDining(),
            requestDTO.getMealTime(),
            null
        );
        
        // 데이터베이스에 저장
        TestExecuted saved = testExecutedRepository.save(testExecuted);
        
        // AI 추천 로직 사용
        String aiRecommendation = foodRecommendationService.recommendFood(requestDTO);
        
        return new TestResultResponseDTO(
            saved.getId(),
            "테스트 결과가 성공적으로 저장되었습니다.",
            aiRecommendation
        );
    }
}
