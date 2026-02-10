export enum TestStep {
  STEP1_TIREDNESS = "STEP1_TIREDNESS",
  STEP2_ANGER = "STEP2_ANGER",
  STEP3_STRESS_LEVEL = "STEP3_STRESS_LEVEL",
  STEP4_APPETITE_DEGREE = "STEP4_APPETITE_DEGREE",
  STEP5_MEAL_TIME = 'STEP5_MEAL_TIME',
  STEP6_BUDGET = "STEP6_BUDGET",
  // STEP7_ALLERGY = "STEP7_ALLERGY",

  // 상황
  STEP10_DINING_WITH = "STEP10_DINING_WITH",

  // 선호도
  // STEP20_CUISINE_TYPE = "STEP20_CUISINE_TYPE", // 선호 음식
  // STEP21_LAST_EATEN = "STEP21_LAST_EATEN", // 최근 먹은 음식 ( 이거 제외)

}

export type MealTime = 'MORNING' | 'LUNCH' | 'DINNER' | 'MIDNIGHT_SNACK';

export type DiningOption = 'ALONE' | 'FRIENDS' | 'FAMILY' | 'DATE' | 'COWORKERS' | 'ETC';

export interface TestResultPostDTO{
  scores: {
    tired: number;
    anger: number;
    stress: number;
    appetite: number;
    budget: number;
  };
  dining: DiningOption;
  mealTime: MealTime | null;
}

export interface Scores {
  tired: number;
  anger: number;
  stress: number;
  appetite: number;
  budget: number;
  // dining: DiningOption | null;
}


// 신체적 상태:
// 피로도 수준 (1-10 척도)
// 수면 시간과 질
// 신체 활동량/운동량
// 현재 체온
// 혈압/심박수
// 소화 상태
// 두통이나 근육통 여부
//
// 감정/정신적 상태:
// 스트레스 레벨
// 현재의 주된 감정 (불안, 우울, 기쁨, 짜증 등)
// 집중도
// 에너지 레벨
// 식욕 정도
//
// 식사 관련 정보:
//
// 마지막 식사 시간
// 지난 식사의 종류와 양
// 평소 선호하는 음식 타입
// 음식 알레르기/제한사항
// 현재 식단 목표 (다이어트, 영양균형 등)
//
// 환경적 요소:
//
// 현재 시간
// 계절/날씨
// 위치 (집/직장 근처 등)
// 식사 가능한 시간
// 주변 식당 정보
//
// 건강 상태:
//
// 현재 질병이나 증상
// 복용중인 약물
// 영양소 결핍 여부
// 소화기 관련 특이사항
//
// 생활패턴:
//
// 직업 특성 (좌식/육체노동 등)
// 일일 활동 계획
// 규칙적인 식사 가능 여부