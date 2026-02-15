import React from 'react';
import { Heart, MapPin, User } from 'lucide-react';
import style from "../../style/main.module.scss";

interface NavigationItem {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

interface BottomNavigationProps {
    onNearbyRestaurants?: () => void;
    onFavorites?: () => void;
    onProfile?: () => void;
}

export function BottomNavigation({ 
    onNearbyRestaurants, 
    onFavorites, 
    onProfile 
}: BottomNavigationProps) {
    const navigationItems: NavigationItem[] = [
        {
            icon: <MapPin size={24} />,
            label: '주변맛집',
            onClick: onNearbyRestaurants || (() => console.log('주변맛집 기능 준비중'))
        },
        {
            icon: <Heart size={24} />,
            label: '찜목록',
            onClick: onFavorites || (() => console.log('찜목록 기능 준비중'))
        },
        {
            icon: <User size={24} />,
            label: '마이',
            onClick: onProfile || (() => console.log('마이페이지 기능 준비중'))
        }
    ];

    return (
        <nav className={style.bottomNav}>
            {navigationItems.map((item, index) => (
                <button key={index} className={style.navButton} onClick={item.onClick}>
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
}