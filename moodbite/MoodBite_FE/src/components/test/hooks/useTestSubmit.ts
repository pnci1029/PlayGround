import {useCallback, useState} from "react";
import { useNavigate } from "react-router-dom";
import {TestResultPostDTO, FoodRecommendationDTO} from "../../../types/test";
import {TestApi} from "../../api/TestApi";
import {executePromise} from "../../api/executePromise";

const isFoodRecommendationDTO = (payload: any): payload is FoodRecommendationDTO => {
    return payload && typeof payload === 'object' && 'primaryFood' in payload && 'alternativefoods' in payload && 'reason' in payload;
};

export function useTestSubmit() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitTestResult = useCallback(
        async (dto: TestResultPostDTO): Promise<void> => {
            setIsSubmitting(true);
            setError(null);
            try {
                const result = await executePromise<FoodRecommendationDTO>(TestApi.submitTestResult(dto));

                // router state 로 결과를 전달한다. (URL 쿼리스트링 방식은 길이 한계·인코딩 취약 문제가 있었다)
                const recommendation = isFoodRecommendationDTO(result) ? JSON.stringify(result) : '';
                navigate('/test/result', {
                    state: { testResult: dto, recommendation },
                });
            } catch (e) {
                console.error('Error submitting test result:', e);
                setError('추천 결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
            } finally {
                setIsSubmitting(false);
            }
        }, [navigate]);

    return {
        submitTestResult,
        isSubmitting,
        error
    }
}
