export const XP_REWARDS = {
  easy: 50,
  medium: 100,
  hard: 200,
};

export type Difficulty = keyof typeof XP_REWARDS;
