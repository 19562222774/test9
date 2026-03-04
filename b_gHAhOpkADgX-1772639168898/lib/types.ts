// === 全局类型定义 ===

export interface User {
  id: string
  email: string
  username: string
  createdAt: string
}

export interface Word {
  id: string
  word: string
  phonetic: string
  partOfSpeech: string
  meaning: string
  example: string
  exampleTranslation: string
  difficulty: 1 | 2 | 3 | 4 | 5
  rootAffix?: string
}

export interface StudyPlan {
  dailyNewWords: number
  targetDate?: string
  reviewSchedule: number[] // [1,2,4,7,15]
}

export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered'

export interface LearningRecord {
  wordId: string
  learnedAt: string
  masteryLevel: MasteryLevel
  strength: number // 0-5
  nextReviewAt: string
  reviewCount: number
}

export interface DailyStats {
  date: string
  newWordsLearned: number
  wordsReviewed: number
  correctRate: number
  studyMinutes: number
}

export interface ChallengeLevel {
  id: string
  name: string
  wordCount: number
  requiredPassRate: number
  unlocked: boolean
  bestScore?: number
  stars: number // 0-3
}

export interface ChallengeResult {
  levelId: string
  score: number
  correctRate: number
  timeSeconds: number
  completedAt: string
}

export interface AppState {
  user: User | null
  studyPlan: StudyPlan | null
  learningRecords: Record<string, LearningRecord>
  notebook: string[] // word ids
  dailyStats: DailyStats[]
  challengeLevels: ChallengeLevel[]
  streakDays: number
  lastStudyDate: string | null
  totalStudyMinutes: number
}
