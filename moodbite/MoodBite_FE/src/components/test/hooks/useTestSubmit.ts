import {useCallback, useState} from "react";
import {useDispatch} from "react-redux";
import { useNavigate } from "react-router-dom";
import {submitTestResultAsync} from "../../../slice/testSlice";
import {TestResultPostDTO, FoodRecommendationDTO} from "../../../types/test";

const isFoodRecommendationDTO = (payload: any): payload is FoodRecommendationDTO => {
    return payload && typeof payload === 'object' && 'primaryFood' in payload && 'alternativefoods' in payload && 'reason' in payload;
};

export function useTestSubmit() {
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitTestResult = useCallback(
        async (dto: TestResultPostDTO): Promise<void> => {
            setIsSubmitting(true);
            setError(null);
            try {
                const result = await dispatch(submitTestResultAsync(dto));
                if (result.meta.requestStatus === 'fulfilled') {
                    // URL 파라미터로 데이터 전달하여 결과 페이지로 네비게이션
                    const testData = encodeURIComponent(JSON.stringify(dto));

                    let recommendation = '';
                    if (isFoodRecommendationDTO(result.payload)) {
                        recommendation = JSON.stringify(result.payload);
                    }

                    const encodedRecommendation = encodeURIComponent(recommendation);
                    navigate(`/test/result?data=${testData}&recommendation=${encodedRecommendation}`);
                } else {
                    throw new Error(result.error?.message || '추천 결과를 불러오지 못했습니다.');
                }
            } catch (e) {
                console.error('Error submitting test result:', e);
                setError('추천 결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
            } finally {
                setIsSubmitting(false);
            }
        }, [dispatch, navigate]);

    return {
        submitTestResult,
        isSubmitting,
        error
    }
}
