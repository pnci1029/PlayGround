import React from 'react';
import { RestaurantRecommendationDTO } from '../../types/test';

interface RestaurantListProps {
  restaurants: RestaurantRecommendationDTO[];
}

export const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants }) => {
  if (!restaurants || restaurants.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        background: '#f8f9fa',
        borderRadius: '12px',
        color: '#6c757d'
      }}>
        <p>🗺️ 주변 맛집 정보를 찾을 수 없습니다.</p>
        <p>위치 권한을 허용하시면 더 정확한 맛집 정보를 제공받을 수 있습니다.</p>
      </div>
    );
  }

  const getPriceLevelText = (priceLevel: number): string => {
    switch (priceLevel) {
      case 1: return '💰';
      case 2: return '💰💰';
      case 3: return '💰💰💰';
      case 4: return '💰💰💰💰';
      default: return '💰💰';
    }
  };

  const getMatchScoreColor = (score: number): string => {
    if (score >= 0.8) return '#28a745'; // 초록
    if (score >= 0.6) return '#ffc107'; // 노랑
    if (score >= 0.4) return '#fd7e14'; // 주황
    return '#dc3545'; // 빨강
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${distance}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const styles = {
    restaurantList: {
      marginTop: '20px',
      maxWidth: '800px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    title: {
      color: '#2c5aa0',
      marginBottom: '20px',
      fontWeight: '600',
      textAlign: 'center' as const
    },
    restaurantCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e9ecef',
      transition: 'all 0.2s ease'
    },
    restaurantHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      paddingBottom: '10px',
      borderBottom: '1px solid #eee'
    },
    restaurantName: {
      margin: '0',
      color: '#2c5aa0',
      fontSize: '1.2em',
      fontWeight: '600'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.8em',
      fontWeight: '500'
    },
    statusOpen: {
      background: '#d4edda',
      color: '#155724'
    },
    statusClosed: {
      background: '#f8d7da',
      color: '#721c24'
    },
    restaurantInfo: {
      marginBottom: '15px'
    },
    infoRow: {
      display: 'flex',
      marginBottom: '8px',
      alignItems: 'center'
    },
    infoLabel: {
      minWidth: '70px',
      fontWeight: '500',
      color: '#495057',
      marginRight: '10px'
    },
    infoValue: {
      color: '#6c757d',
      flex: 1
    },
    link: {
      color: '#2c5aa0',
      textDecoration: 'none'
    },
    matchScore: {
      fontWeight: '600'
    },
    restaurantActions: {
      display: 'flex',
      gap: '10px'
    },
    btnBase: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.9em',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '500',
      flex: 1
    },
    btnDirections: {
      background: '#28a745',
      color: 'white'
    },
    btnCall: {
      background: '#17a2b8',
      color: 'white'
    }
  };

  return (
    <div style={styles.restaurantList}>
      <h3 style={styles.title}>🍽️ 추천 맛집 ({restaurants.length}곳)</h3>
      
      {restaurants.map((restaurant, index) => (
        <div key={index} style={styles.restaurantCard}>
          <div style={styles.restaurantHeader}>
            <h4 style={styles.restaurantName}>{restaurant.name}</h4>
            <div>
              <span style={{
                ...styles.statusBadge,
                ...(restaurant.isOpen ? styles.statusOpen : styles.statusClosed)
              }}>
                {restaurant.isOpen ? '영업중' : '영업종료'}
              </span>
            </div>
          </div>
          
          <div style={styles.restaurantInfo}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>📍 위치:</span>
              <span style={styles.infoValue}>{restaurant.address}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>🏷️ 분류:</span>
              <span style={styles.infoValue}>{restaurant.category}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>⭐ 평점:</span>
              <span style={styles.infoValue}>{restaurant.rating.toFixed(1)}/5.0</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>💰 가격대:</span>
              <span style={styles.infoValue}>{getPriceLevelText(restaurant.priceLevel)}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>🚶 거리:</span>
              <span style={styles.infoValue}>
                {formatDistance(restaurant.distance)} ({restaurant.estimatedWalkTime})
              </span>
            </div>
            
            {restaurant.phone && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>📞 전화:</span>
                <span style={styles.infoValue}>
                  <a href={`tel:${restaurant.phone}`} style={styles.link}>{restaurant.phone}</a>
                </span>
              </div>
            )}
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>🎯 추천도:</span>
              <span 
                style={{
                  ...styles.infoValue,
                  ...styles.matchScore,
                  color: getMatchScoreColor(restaurant.matchScore)
                }}
              >
                {Math.round(restaurant.matchScore * 100)}%
              </span>
            </div>
          </div>
          
          <div style={styles.restaurantActions}>
            <button 
              style={{...styles.btnBase, ...styles.btnDirections}}
              onClick={() => {
                const url = `https://map.kakao.com/link/to/${restaurant.name},${restaurant.latitude},${restaurant.longitude}`;
                window.open(url, '_blank');
              }}
            >
              🗺️ 길찾기
            </button>
            
            {restaurant.phone && (
              <button 
                style={{...styles.btnBase, ...styles.btnCall}}
                onClick={() => window.open(`tel:${restaurant.phone}`)}
              >
                📞 전화
              </button>
            )}
          </div>
        </div>
      ))}
      
    </div>
  );
};