import {useCallback, useState} from "react";
import {useDispatch} from "react-redux";
import {submitTestResultAsync, submitLocationBasedTestResultAsync} from "../../../slice/testSlice";
import {TestResultPostDTO, LocationBasedTestResultRequestDTO, LocationBasedRecommendationResponseDTO} from "../../../types/test";
import {LocationService} from "../../api/LocationService";

export function useTestSubmit() {
    const dispatch = useDispatch<any>();
    const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);

    const submitTestResult = useCallback(
        async (dto: TestResultPostDTO): Promise<string | undefined> => {
            if (window.confirm("결과를 확인하시겠습니까?")) {
                try {
                    const result = await dispatch(submitTestResultAsync(dto));
                    if (result.meta.requestStatus === 'fulfilled') {
                        return result.payload.aiRecommendation;
                    } else {
                        throw new Error('API 호출 실패');
                    }
                } catch (e) {
                    console.error('Error submitting test result:', e);
                    throw e;
                }
            }
            return undefined;
        }, [dispatch]);

    const submitLocationBasedTestResult = useCallback(
        async (dto: TestResultPostDTO): Promise<LocationBasedRecommendationResponseDTO | undefined> => {
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
                        return result.payload;
                    } else {
                        throw new Error('위치 기반 추천 API 호출 실패');
                    }
                } catch (e) {
                    console.error('Error submitting location-based test result:', e);
                    throw e;
                } finally {
                    setIsLoadingLocation(false);
                }
            }
            return undefined;
        }, [dispatch, isLocationEnabled]);

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