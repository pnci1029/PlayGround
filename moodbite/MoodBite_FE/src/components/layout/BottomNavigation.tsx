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
            onClick: onNearbyRestaurants || (() => {})
        },
        {
            icon: <Heart size={24} />,
            label: '찜목록',
            onClick: onFavorites || (() => {})
        },
        {
            icon: <User size={24} />,
            label: '마이',
            onClick: onProfile || (() => {})
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