import React, { useState, useEffect } from 'react';
import { MapPin, Phone, ExternalLink, Navigation, Loader } from 'lucide-react';
import style from '../../style/location/restaurantRecommendations.module.scss';

interface Restaurant {
    place_name: string;
    distance: string;
    road_address_name: string;
    phone: string;
    place_url: string;
    category_name: string;
    x: string;
    y: string;
}

interface RestaurantRecommendationsProps {
    location: GeolocationPosition;
    primaryFood: string;
    onClose: () => void;
}

export function RestaurantRecommendations({ location, primaryFood, onClose }: RestaurantRecommendationsProps) {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchNearbyRestaurants();
    }, [location, primaryFood, fetchNearbyRestaurants]);

    const fetchNearbyRestaurants = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/location/nearby-restaurants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    foodName: primaryFood,
                    radius: 2000 // 2km
                })
            });

            if (!response.ok) {
                throw new Error('음식점 정보를 가져오는데 실패했습니다.');
            }

            const data = await response.json();
            setRestaurants(data.documents || []);
        } catch (err) {
            console.error('Error fetching restaurants:', err);
            setError('주변 음식점 정보를 불러올 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const openInMap = (restaurant: Restaurant) => {
        const kakaoMapUrl = `https://map.kakao.com/link/map/${restaurant.place_name},${restaurant.y},${restaurant.x}`;
        window.open(kakaoMapUrl, '_blank');
    };

    const openDirections = (restaurant: Restaurant) => {
        const directionsUrl = `https://map.kakao.com/link/to/${restaurant.place_name},${restaurant.y},${restaurant.x}`;
        window.open(directionsUrl, '_blank');
    };

    if (isLoading) {
        return (
            <section className={style.container}>
                <div className={style.loadingCard}>
                    <div className={style.loadingIcon}>
                        <Loader size={32} className={style.spinner} />
                    </div>
                    <h3 className={style.loadingTitle}>맛집을 찾고 있어요</h3>
                    <p className={style.loadingDescription}>
                        {primaryFood}을(를) 파는 근처 음식점을 검색 중입니다...
                    </p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className={style.container}>
                <div className={style.errorCard}>
                    <h3 className={style.errorTitle}>오류가 발생했습니다</h3>
                    <p className={style.errorDescription}>{error}</p>
                    <div className={style.errorActions}>
                        <button className={style.retryButton} onClick={fetchNearbyRestaurants}>
                            다시 시도
                        </button>
                        <button className={style.closeButton} onClick={onClose}>
                            닫기
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={style.container}>
            <div className={style.header}>
                <div className={style.titleContainer}>
                    <MapPin size={24} className={style.headerIcon} />
                    <div>
                        <h3 className={style.title}>주변 {primaryFood} 맛집</h3>
                        <p className={style.subtitle}>
                            {restaurants.length}곳의 음식점을 찾았어요
                        </p>
                    </div>
                </div>
                <button className={style.closeButton} onClick={onClose}>
                    ✕
                </button>
            </div>

            {restaurants.length === 0 ? (
                <div className={style.noResultsCard}>
                    <h4 className={style.noResultsTitle}>주변에 음식점이 없어요</h4>
                    <p className={style.noResultsDescription}>
                        검색 범위를 넓혀서 다시 찾아볼까요?
                    </p>
                    <button className={style.expandSearchButton} onClick={() => {
                        // 검색 범위를 5km로 확장하여 재검색
                        fetchNearbyRestaurants();
                    }}>
                        검색 범위 확장하기
                    </button>
                </div>
            ) : (
                <div className={style.restaurantsList}>
                    {restaurants.slice(0, 5).map((restaurant, index) => (
                        <div key={index} className={style.restaurantCard}>
                            <div className={style.restaurantHeader}>
                                <h4 className={style.restaurantName}>{restaurant.place_name}</h4>
                                <div className={style.distance}>
                                    <Navigation size={14} />
                                    <span>{restaurant.distance}m</span>
                                </div>
                            </div>

                            <div className={style.restaurantInfo}>
                                <div className={style.address}>
                                    <MapPin size={14} />
                                    <span>{restaurant.road_address_name || restaurant.place_name}</span>
                                </div>
                                
                                {restaurant.phone && (
                                    <div className={style.phone}>
                                        <Phone size={14} />
                                        <span>{restaurant.phone}</span>
                                    </div>
                                )}
                                
                                <div className={style.category}>
                                    <span>{restaurant.category_name}</span>
                                </div>
                            </div>

                            <div className={style.restaurantActions}>
                                <button 
                                    className={style.mapButton}
                                    onClick={() => openInMap(restaurant)}
                                >
                                    <MapPin size={16} />
                                    지도보기
                                </button>
                                <button 
                                    className={style.directionsButton}
                                    onClick={() => openDirections(restaurant)}
                                >
                                    <Navigation size={16} />
                                    길찾기
                                </button>
                                {restaurant.place_url && (
                                    <button 
                                        className={style.detailButton}
                                        onClick={() => window.open(restaurant.place_url, '_blank')}
                                    >
                                        <ExternalLink size={16} />
                                        상세보기
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={style.footer}>
                <p className={style.footerNote}>
                    📍 카카오맵 기반 실시간 정보입니다
                </p>
            </div>
        </section>
    );
}