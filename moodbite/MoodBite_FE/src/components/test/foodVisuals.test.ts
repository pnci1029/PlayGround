import { describe, it, expect } from 'vitest';
import { foodEmoji } from './foodVisuals';

describe('foodEmoji', () => {
    it('이름이 비어 있으면 기본 이모지를 반환한다', () => {
        expect(foodEmoji('')).toBe('🍽️');
    });

    it('키워드에 맞는 이모지를 반환한다', () => {
        expect(foodEmoji('김치찌개')).toBe('🍲');
        expect(foodEmoji('마르게리타 피자')).toBe('🍕');
        expect(foodEmoji('후라이드 치킨')).toBe('🍗');
        expect(foodEmoji('연어 초밥 모둠')).toBe('🍣');
        expect(foodEmoji('소고기 쌀국수')).toBe('🍜');
    });

    it('파스타류는 파스타 이모지를 반환한다', () => {
        expect(foodEmoji('크림 파스타')).toBe('🍝');
        expect(foodEmoji('버섯 리조또')).toBe('🍝');
    });

    it('매칭되는 키워드가 없으면 기본 이모지를 반환한다', () => {
        expect(foodEmoji('정체불명의음식')).toBe('🍽️');
    });
});
