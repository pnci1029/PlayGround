import React, { useState } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import style from '../../style/location/locationPermission.module.scss';

interface LocationPermissionProps {
    onLocationGranted: (location: GeolocationPosition) => void;
    onLocationDenied: () => void;
    primaryFood?: string;
}

export function LocationPermission({ onLocationGranted, onLocationDenied, primaryFood }: LocationPermissionProps) {
    const [isRequesting, setIsRequesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestLocation = () => {
        setIsRequesting(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('브라우저가 위치 서비스를 지원하지 않습니다.');
            setIsRequesting(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsRequesting(false);
                onLocationGranted(position);
            },
            (error) => {
                setIsRequesting(false);
                let errorMessage = '위치를 가져올 수 없습니다.';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '위치 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '위치 정보를 사용할 수 없습니다.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '위치 요청 시간이 초과되었습니다.';
                        break;
                }
                
                setError(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5분
            }
        );
    };

    return (
        <section className={style.container}>
            <div className={style.locationCard}>
                <div className={style.iconContainer}>
                    <MapPin size={32} className={style.locationIcon} />
                </div>
                
                <div className={style.content}>
                    <h3 className={style.title}>주변 맛집 추천</h3>
                    <p className={style.description}>
                        {primaryFood ? `${primaryFood}을(를) 파는` : '추천된 음식을 파는'} 근처 맛집을 찾아드릴게요!
                    </p>
                    
                    {error && (
                        <div className={style.errorMessage}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
                
                <div className={style.actions}>
                    <button 
                        className={style.allowButton}
                        onClick={requestLocation}
                        disabled={isRequesting}
                    >
                        {isRequesting ? (
                            <>
                                <Navigation size={18} className={style.spinner} />
                                위치 확인 중...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                위치 허용하고 맛집 찾기
                            </>
                        )}
                    </button>
                    
                    <button 
                        className={style.skipButton}
                        onClick={onLocationDenied}
                    >
                        건너뛰기
                    </button>
                </div>
                
                <div className={style.privacyNote}>
                    <p>🔒 위치 정보는 맛집 추천에만 사용되며 저장되지 않습니다</p>
                </div>
            </div>
        </section>
    );
}