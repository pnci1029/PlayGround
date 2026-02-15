import { useState, useEffect } from 'react';

interface LocationData {
    latitude: number;
    longitude: number;
    accuracy?: number;
}

interface LocationState {
    location: LocationData | null;
    loading: boolean;
    error: string | null;
}

export function useLocation() {
    const [state, setState] = useState<LocationState>({
        location: null,
        loading: false,
        error: null
    });

    const getCurrentLocation = (): Promise<LocationData> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation이 지원되지 않는 브라우저입니다.'));
                return;
            }

            setState(prev => ({ ...prev, loading: true, error: null }));

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationData: LocationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    
                    setState({
                        location: locationData,
                        loading: false,
                        error: null
                    });
                    
                    resolve(locationData);
                },
                (error) => {
                    let errorMessage = '위치를 가져오는데 실패했습니다.';
                    
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = '위치 정보를 사용할 수 없습니다.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = '위치 요청이 시간 초과되었습니다.';
                            break;
                    }
                    
                    setState({
                        location: null,
                        loading: false,
                        error: errorMessage
                    });
                    
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5분간 캐시
                }
            );
        });
    };

    return {
        ...state,
        getCurrentLocation,
        clearError: () => setState(prev => ({ ...prev, error: null }))
    };
}