import React, { useState } from 'react';
import style from '../../style/test.module.scss';
import { HeaderWithBack } from '../common/HeaderWithBack';
import { LocationPermission } from './LocationPermission';
import { RestaurantRecommendations } from './RestaurantRecommendations';

interface NearbyRestaurantsProps {
    onBack: () => void;
}

// 하단 네비 '주변맛집' 진입점: 위치 권한 → 주변 음식점 목록
export function NearbyRestaurants({ onBack }: NearbyRestaurantsProps) {
    const [location, setLocation] = useState<GeolocationPosition | null>(null);

    return (
        <div className={style.container}>
            <HeaderWithBack onBack={onBack} title="주변 맛집" />

            <main className={style.mainContent}>
                {!location ? (
                    <LocationPermission
                        onLocationGranted={setLocation}
                        onLocationDenied={onBack}
                    />
                ) : (
                    <RestaurantRecommendations
                        location={location}
                        onClose={onBack}
                    />
                )}
            </main>
        </div>
    );
}
