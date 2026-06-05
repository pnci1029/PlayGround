// 감정 카드 → 백엔드 점수(stress, anger) 매핑
//
// 백엔드는 stress·anger 를 (대부분 합쳐서) 가중치 계산에 쓴다.
// '기분' 카드는 감정축(stress, anger)만 담당하고,
// tired(피로)는 '컨디션' 단계, appetite·budget 은 각자 단계에서 받는다.

export type MoodId =
    | 'STRESSED'   // 스트레스
    | 'IRRITATED'  // 짜증
    | 'DOWN'       // 울적
    | 'NEUTRAL'    // 무던
    | 'GOOD'       // 좋음
    | 'EXCITED';   // 신남

export interface EmotionScores {
    anger: number;
    stress: number;
}

export interface Mood {
    id: MoodId;
    emoji: string;
    label: string;
    description: string;
    /** 기분에 따라 UI 를 물들일 색 */
    color: string;
    /** intensity=1.0(많이) 기준의 감정 점수. 살짝일 땐 50(중립)쪽으로 보간한다. */
    base: EmotionScores;
}

export const MOODS: Mood[] = [
    {
        id: 'STRESSED',
        emoji: '🤯',
        label: '스트레스',
        description: '머리가 터질 것 같아요',
        color: '#ef4444',
        base: { stress: 85, anger: 50 },
    },
    {
        id: 'IRRITATED',
        emoji: '😤',
        label: '짜증',
        description: '다 거슬려요',
        color: '#f97316',
        base: { stress: 50, anger: 85 },
    },
    {
        id: 'DOWN',
        emoji: '😔',
        label: '울적',
        description: '기분이 가라앉아요',
        color: '#3b82f6',
        base: { stress: 60, anger: 20 },
    },
    {
        id: 'NEUTRAL',
        emoji: '😐',
        label: '무던',
        description: '그냥 평범해요',
        color: '#14b8a6',
        base: { stress: 45, anger: 45 },
    },
    {
        id: 'GOOD',
        emoji: '🙂',
        label: '좋음',
        description: '꽤 괜찮은 하루',
        color: '#22c55e',
        base: { stress: 25, anger: 18 },
    },
    {
        id: 'EXCITED',
        emoji: '😍',
        label: '신남',
        description: '오늘 기분 최고예요',
        color: '#f59e0b',
        base: { stress: 12, anger: 12 },
    },
];

export const MOOD_BY_ID: Record<MoodId, Mood> = MOODS.reduce((acc, m) => {
    acc[m.id] = m;
    return acc;
}, {} as Record<MoodId, Mood>);

const NEUTRAL_BASELINE = 50;
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * 감정 + 강도(0~1)를 백엔드용 감정 점수(stress, anger)로 변환.
 * 강도가 낮으면 각 축을 중립(50)쪽으로 끌어당긴다.
 */
export function moodToScores(moodId: MoodId, intensity: number): EmotionScores {
    const mood = MOOD_BY_ID[moodId];
    const lerp = (base: number) =>
        clamp(NEUTRAL_BASELINE + (base - NEUTRAL_BASELINE) * intensity);
    return {
        stress: lerp(mood.base.stress),
        anger: lerp(mood.base.anger),
    };
}

// 강도 선택지 (살짝 / 많이)
export const INTENSITY_OPTIONS = [
    { label: '살짝', value: 0.55 },
    { label: '많이', value: 1.0 },
] as const;
