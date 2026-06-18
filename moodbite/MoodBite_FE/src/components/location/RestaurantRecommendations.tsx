import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Phone, ExternalLink, Navigation, Loader } from 'lucide-react';
import style from '../../style/location/restaurantRecommendations.module.scss';
import { MainApi } from '../api/MainApi';
import { RestaurantRecommendationDTO as Restaurant } from '../../types/test';

interface RestaurantRecommendationsProps {
    location: GeolocationPosition;
    primaryFood?: string;
    onClose: () => void;
}

export function RestaurantRecommendations({ location, primaryFood, onClose }: RestaurantRecommendationsProps) {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNearbyRestaurants = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await MainApi.api.post('/api/location/nearby-restaurants', {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                foodName: primaryFood,
                radius: 2000 // 2km
            });

            setRestaurants((response as unknown as Restaurant[]) || []);
        } catch (err) {
            console.error('Error fetching restaurants:', err);
            setError('주변 음식점 정보를 불러올 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [location, primaryFood]);

    useEffect(() => {
        fetchNearbyRestaurants();
    }, [fetchNearbyRestaurants]);

    const openInMap = (restaurant: Restaurant) => {
        const kakaoMapUrl = `https://map.kakao.com/link/map/${restaurant.name},${restaurant.latitude},${restaurant.longitude}`;
        window.open(kakaoMapUrl, '_blank');
    };

    const openDirections = (restaurant: Restaurant) => {
        const directionsUrl = `https://map.kakao.com/link/to/${restaurant.name},${restaurant.latitude},${restaurant.longitude}`;
        window.open(directionsUrl, '_blank');
    };

    const openDetail = (restaurant: Restaurant) => {
        if (!restaurant.placeId) return;
        window.open(`https://place.map.kakao.com/${restaurant.placeId}`, '_blank');
    };

    const titleFood = primaryFood ? `${primaryFood} ` : '';

    if (isLoading) {
        return (
            <section className={style.container}>
                <div className={style.loadingCard}>
                    <div className={style.loadingIcon}>
                        <Loader size={32} className={style.spinner} />
                    </div>
                    <h3 className={style.loadingTitle}>맛집을 찾고 있어요</h3>
                    <p className={style.loadingDescription}>
                        {primaryFood ? `${primaryFood}을(를) 파는 ` : ''}근처 음식점을 검색 중입니다...
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
                        <h3 className={style.title}>주변 {titleFood}맛집</h3>
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
                    <button className={style.expandSearchButton} onClick={fetchNearbyRestaurants}>
                        다시 검색하기
                    </button>
                </div>
            ) : (
                <div className={style.restaurantsList}>
                    {restaurants.slice(0, 5).map((restaurant, index) => (
                        <div key={restaurant.placeId ?? index} className={style.restaurantCard}>
                            <div className={style.restaurantHeader}>
                                <h4 className={style.restaurantName}>{restaurant.name}</h4>
                                <div className={style.distance}>
                                    <Navigation size={14} />
                                    <span>{restaurant.distance}m</span>
                                </div>
                            </div>

                            <div className={style.restaurantInfo}>
                                <div className={style.address}>
                                    <MapPin size={14} />
                                    <span>{restaurant.address || restaurant.name}</span>
                                </div>

                                {restaurant.phone && (
                                    <div className={style.phone}>
                                        <Phone size={14} />
                                        <span>{restaurant.phone}</span>
                                    </div>
                                )}

                                <div className={style.category}>
                                    <span>{restaurant.category}</span>
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
                                {restaurant.placeId && (
                                    <button
                                        className={style.detailButton}
                                        onClick={() => openDetail(restaurant)}
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
