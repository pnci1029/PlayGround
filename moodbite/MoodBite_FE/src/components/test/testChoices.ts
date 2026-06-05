// 컨디션 / 배고픔 / 예산 단계의 카드 선택지
// 각 선택은 백엔드가 먹는 점수(0~100, 예산은 원) 값을 그대로 들고 있다.

export interface Choice<T> {
    value: T;
    emoji: string;
    label: string;
    description: string;
}

// 컨디션 → tired (0~100)
export const CONDITION_CHOICES: Choice<number>[] = [
    { value: 85, emoji: '😩', label: '지침', description: '기운 없어요' },
    { value: 50, emoji: '😐', label: '보통', description: '그럭저럭' },
    { value: 15, emoji: '💪', label: '쌩쌩', description: '에너지 넘쳐요' },
];

// 배고픔 → appetite (0~100)
export const HUNGER_CHOICES: Choice<number>[] = [
    { value: 25, emoji: '🤏', label: '조금', description: '살짝 출출' },
    { value: 50, emoji: '🍚', label: '보통', description: '적당히' },
    { value: 88, emoji: '🤤', label: '많이', description: '엄청 배고파요' },
];

// 예산 → budget (원)
export const BUDGET_CHOICES: Choice<number>[] = [
    { value: 8000, emoji: '💸', label: '가성비', description: '~1만원' },
    { value: 15000, emoji: '💵', label: '적당히', description: '1~2만원' },
    { value: 30000, emoji: '💳', label: '플렉스', description: '2만원+' },
];
