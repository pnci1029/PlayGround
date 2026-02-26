import {useCallback, useState} from "react";
import {useDispatch} from "react-redux";
import { useNavigate } from "react-router-dom";
import {submitTestResultAsync, submitLocationBasedTestResultAsync} from "../../../slice/testSlice";
import {TestResultPostDTO, LocationBasedTestResultRequestDTO, LocationBasedRecommendationResponseDTO} from "../../../types/test";
import {LocationService} from "../../api/LocationService";

export function useTestSubmit() {
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);

    const submitTestResult = useCallback(
        async (dto: TestResultPostDTO): Promise<void> => {
            if (window.confirm("결과를 확인하시겠습니까?")) {
                try {
                    const result = await dispatch(submitTestResultAsync(dto));
                    console.log('Redux result:', result);
                    console.log('Request status:', result.meta.requestStatus);
                    console.log('Payload:', result.payload);
                    if (result.meta.requestStatus === 'fulfilled') {
                        // URL 파라미터로 데이터 전달하여 결과 페이지로 네비게이션
                        const testData = encodeURIComponent(JSON.stringify(dto));
                        // 백엔드에서 직접 JSON 객체나 문자열로 응답할 수 있으므로 처리
                        let recommendation = '';
                        if (result.payload.aiRecommendation) {
                            recommendation = result.payload.aiRecommendation;
                        } else if (typeof result.payload === 'object' && (result.payload as any).primaryFood) {
                            // 백엔드가 직접 JSON 객체를 반환하는 경우
                            recommendation = JSON.stringify(result.payload);
                        } else if (typeof result.payload === 'string') {
                            recommendation = result.payload;
                        }
                        
                        const encodedRecommendation = encodeURIComponent(recommendation);
                        navigate(`/test/result?data=${testData}&recommendation=${encodedRecommendation}`);
                    } else {
                        throw new Error('API 호출 실패');
                    }
                } catch (e) {
                    console.error('Error submitting test result:', e);
                    console.error('Error details:', JSON.stringify(e, null, 2));
                    alert(`테스트 결과 제출에 실패했습니다. 다시 시도해주세요.\n에러: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
                }
            }
        }, [dispatch, navigate]);

    const submitLocationBasedTestResult = useCallback(
        async (dto: TestResultPostDTO): Promise<void> => {
            const confirmMessage = isLocationEnabled 
                ? "위치 기반 맛집 추천 결과를 확인하시겠습니까?" 
                : "결과를 확인하시겠습니까? (위치 권한을 허용하면 근처 맛집 정보도 함께 제공됩니다)";
                
            if (window.confirm(confirmMessage)) {
                setIsLoadingLocation(true);
                try {
                    let location = null;
                    
                    if (isLocationEnabled) {
                        location = await LocationService.getCurrentLocation();
                        if (!location) {
                            console.warn("위치 정보를 가져올 수 없어 일반 추천으로 진행합니다.");
                        }
                    }

                    const locationBasedDto: LocationBasedTestResultRequestDTO = {
                        scores: dto.scores,
                        dining: dto.dining,
                        mealTime: dto.mealTime,
                        location: location || undefined
                    };

                    const result = await dispatch(submitLocationBasedTestResultAsync(locationBasedDto));
                    if (result.meta.requestStatus === 'fulfilled') {
                        // URL 파라미터로 데이터 전달하여 결과 페이지로 네비게이션
                        const testData = encodeURIComponent(JSON.stringify(dto));
                        const recommendation = encodeURIComponent(JSON.stringify(result.payload.foodRecommendation) || '');
                        navigate(`/test/result?data=${testData}&recommendation=${recommendation}&location=true`);
                    } else {
                        throw new Error('위치 기반 추천 API 호출 실패');
                    }
                } catch (e) {
                    console.error('Error submitting location-based test result:', e);
                    alert('위치 기반 추천 결과 제출에 실패했습니다. 다시 시도해주세요.');
                } finally {
                    setIsLoadingLocation(false);
                }
            }
        }, [dispatch, navigate, isLocationEnabled]);

    const checkAndRequestLocationPermission = useCallback(async (): Promise<boolean> => {
        const hasPermission = await LocationService.checkLocationPermission();
        if (hasPermission) {
            setIsLocationEnabled(true);
            return true;
        }

        // 위치 권한 요청을 위해 실제로 위치를 가져와보기
        const location = await LocationService.getCurrentLocation();
        if (location) {
            setIsLocationEnabled(true);
            return true;
        } else {
            setIsLocationEnabled(false);
            return false;
        }
    }, []);

    const toggleLocationService = useCallback(async () => {
        if (isLocationEnabled) {
            setIsLocationEnabled(false);
        } else {
            const enabled = await checkAndRequestLocationPermission();
            if (!enabled) {
                alert(LocationService.getLocationPermissionMessage());
            }
        }
    }, [isLocationEnabled, checkAndRequestLocationPermission]);

    return {
        submitTestResult,
        submitLocationBasedTestResult,
        isLocationEnabled,
        isLoadingLocation,
        checkAndRequestLocationPermission,
        toggleLocationService
    }
}