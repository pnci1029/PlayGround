import React from 'react';
import style from '../../style/ui/noRecommendations.module.scss';

interface NoRecommendationsProps {
  onRetry: () => void;
}

const NoRecommendations: React.FC<NoRecommendationsProps> = ({ onRetry }) => {
  return (
    <div className={style.container}>
      <div className={style.card}>
        <div className={style.emoji}>🍽️</div>

        <h3 className={style.title}>추천 음식을 찾지 못했습니다</h3>

        <p className={style.description}>
          현재 선택한 조건에 맞는 음식이 없습니다.<br/>
          다른 조건으로 다시 시도해보세요.
        </p>

        <div className={style.actions}>
          <button className={style.retryButton} onClick={onRetry}>
            다시 검사하기
          </button>

          <button className={style.homeButton} onClick={() => window.location.href = '/'}>
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoRecommendations;
