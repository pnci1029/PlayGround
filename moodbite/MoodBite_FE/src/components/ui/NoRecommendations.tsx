import React from 'react';
import styles from '../test/questionOption.module.scss';

interface NoRecommendationsProps {
  onRetry: () => void;
}

const NoRecommendations: React.FC<NoRecommendationsProps> = ({ onRetry }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      padding: '40px 20px',
      textAlign: 'center',
      backgroundColor: '#ffffff'
    }}>
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
          color: '#6c757d'
        }}>
          🍽️
        </div>
        
        <h3 style={{
          color: '#1a1a2e',
          marginBottom: '16px',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          추천 음식을 찾지 못했습니다
        </h3>
        
        <p style={{
          color: '#6c757d',
          marginBottom: '32px',
          lineHeight: '1.6',
          fontSize: '14px'
        }}>
          현재 선택한 조건에 맞는 음식이 없습니다.<br/>
          다른 조건으로 다시 시도해보세요.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onRetry}
            style={{
              backgroundColor: '#2bb5ac',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#259c94';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2bb5ac';
            }}
          >
            다시 검사하기
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: 'transparent',
              color: '#6c757d',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#adb5bd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#dee2e6';
            }}
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoRecommendations;