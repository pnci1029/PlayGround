import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFavorites } from './useFavorites';

describe('useFavorites', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('초기 상태는 빈 목록이다', () => {
        const { result } = renderHook(() => useFavorites());
        expect(result.current.favorites).toEqual([]);
        expect(result.current.isFavorite('김치찌개')).toBe(false);
    });

    it('add로 음식을 추가하고 isFavorite로 확인한다', () => {
        const { result } = renderHook(() => useFavorites());
        act(() => result.current.add('김치찌개'));
        expect(result.current.isFavorite('김치찌개')).toBe(true);
        expect(result.current.favorites).toHaveLength(1);
    });

    it('같은 음식을 중복 추가하지 않는다', () => {
        const { result } = renderHook(() => useFavorites());
        act(() => result.current.add('라멘'));
        act(() => result.current.add('라멘'));
        expect(result.current.favorites).toHaveLength(1);
    });

    it('toggle은 추가/해제를 번갈아 수행한다', () => {
        const { result } = renderHook(() => useFavorites());
        act(() => result.current.toggle('피자'));
        expect(result.current.isFavorite('피자')).toBe(true);
        act(() => result.current.toggle('피자'));
        expect(result.current.isFavorite('피자')).toBe(false);
    });

    it('remove로 특정 음식만 제거한다', () => {
        const { result } = renderHook(() => useFavorites());
        act(() => result.current.add('피자'));
        act(() => result.current.add('타코'));
        act(() => result.current.remove('피자'));
        expect(result.current.isFavorite('피자')).toBe(false);
        expect(result.current.isFavorite('타코')).toBe(true);
    });

    it('localStorage에 영속화되어 새 훅에서도 유지된다', () => {
        const first = renderHook(() => useFavorites());
        act(() => first.result.current.add('떡볶이'));

        const second = renderHook(() => useFavorites());
        expect(second.result.current.isFavorite('떡볶이')).toBe(true);
    });
});
