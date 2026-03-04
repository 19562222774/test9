'use client'

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { AppState, User, StudyPlan, LearningRecord, DailyStats, ChallengeLevel, ChallengeResult } from './types'
import { createLearningRecord, updateLearningRecord } from './ebbinghaus'

// ===== 初始挑战关卡 =====
const initialChallengeLevels: ChallengeLevel[] = [
  { id: 'lv1', name: '初入词海', wordCount: 10, requiredPassRate: 0.8, unlocked: true, stars: 0 },
  { id: 'lv2', name: '小试牛刀', wordCount: 10, requiredPassRate: 0.8, unlocked: false, stars: 0 },
  { id: 'lv3', name: '渐入佳境', wordCount: 15, requiredPassRate: 0.8, unlocked: false, stars: 0 },
  { id: 'lv4', name: '词汇达人', wordCount: 15, requiredPassRate: 0.8, unlocked: false, stars: 0 },
  { id: 'lv5', name: '融会贯通', wordCount: 20, requiredPassRate: 0.8, unlocked: false, stars: 0 },
  { id: 'lv6', name: '出口成章', wordCount: 20, requiredPassRate: 0.85, unlocked: false, stars: 0 },
  { id: 'lv7', name: '博学多才', wordCount: 25, requiredPassRate: 0.85, unlocked: false, stars: 0 },
  { id: 'lv8', name: '学富五车', wordCount: 25, requiredPassRate: 0.85, unlocked: false, stars: 0 },
  { id: 'lv9', name: '词汇宗师', wordCount: 30, requiredPassRate: 0.9, unlocked: false, stars: 0 },
  { id: 'lv10', name: '登峰造极', wordCount: 30, requiredPassRate: 0.9, unlocked: false, stars: 0 },
]

// ===== 初始状态 =====
const initialState: AppState = {
  user: null,
  studyPlan: null,
  learningRecords: {},
  notebook: [],
  dailyStats: [],
  challengeLevels: initialChallengeLevels,
  streakDays: 0,
  lastStudyDate: null,
  totalStudyMinutes: 0,
}

// ===== Actions =====
type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_STUDY_PLAN'; payload: StudyPlan }
  | { type: 'LEARN_WORD'; payload: { wordId: string } }
  | { type: 'REVIEW_WORD'; payload: { wordId: string; correct: boolean } }
  | { type: 'ADD_TO_NOTEBOOK'; payload: string }
  | { type: 'REMOVE_FROM_NOTEBOOK'; payload: string }
  | { type: 'BATCH_REMOVE_FROM_NOTEBOOK'; payload: string[] }
  | { type: 'ADD_DAILY_STATS'; payload: DailyStats }
  | { type: 'UPDATE_STREAK' }
  | { type: 'ADD_STUDY_TIME'; payload: number }
  | { type: 'COMPLETE_CHALLENGE'; payload: ChallengeResult }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'LOGOUT' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }

    case 'SET_STUDY_PLAN':
      return { ...state, studyPlan: action.payload }

    case 'LEARN_WORD': {
      const { wordId } = action.payload
      if (state.learningRecords[wordId]) return state
      return {
        ...state,
        learningRecords: {
          ...state.learningRecords,
          [wordId]: createLearningRecord(wordId),
        },
      }
    }

    case 'REVIEW_WORD': {
      const { wordId, correct } = action.payload
      const existing = state.learningRecords[wordId]
      if (!existing) return state
      return {
        ...state,
        learningRecords: {
          ...state.learningRecords,
          [wordId]: updateLearningRecord(existing, correct),
        },
      }
    }

    case 'ADD_TO_NOTEBOOK': {
      if (state.notebook.includes(action.payload)) return state
      return { ...state, notebook: [...state.notebook, action.payload] }
    }

    case 'REMOVE_FROM_NOTEBOOK':
      return {
        ...state,
        notebook: state.notebook.filter((id) => id !== action.payload),
      }

    case 'BATCH_REMOVE_FROM_NOTEBOOK':
      return {
        ...state,
        notebook: state.notebook.filter((id) => !action.payload.includes(id)),
      }

    case 'ADD_DAILY_STATS': {
      const existing = state.dailyStats.findIndex((s) => s.date === action.payload.date)
      if (existing >= 0) {
        const updated = [...state.dailyStats]
        updated[existing] = {
          ...updated[existing],
          newWordsLearned: updated[existing].newWordsLearned + action.payload.newWordsLearned,
          wordsReviewed: updated[existing].wordsReviewed + action.payload.wordsReviewed,
          correctRate: (updated[existing].correctRate + action.payload.correctRate) / 2,
          studyMinutes: updated[existing].studyMinutes + action.payload.studyMinutes,
        }
        return { ...state, dailyStats: updated }
      }
      return { ...state, dailyStats: [...state.dailyStats, action.payload] }
    }

    case 'UPDATE_STREAK': {
      const today = new Date().toISOString().split('T')[0]
      if (state.lastStudyDate === today) return state
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const newStreak = state.lastStudyDate === yesterdayStr ? state.streakDays + 1 : 1
      return { ...state, streakDays: newStreak, lastStudyDate: today }
    }

    case 'ADD_STUDY_TIME':
      return { ...state, totalStudyMinutes: state.totalStudyMinutes + action.payload }

    case 'COMPLETE_CHALLENGE': {
      const result = action.payload
      const levels = [...state.challengeLevels]
      const idx = levels.findIndex((l) => l.id === result.levelId)
      if (idx < 0) return state

      const passed = result.correctRate >= levels[idx].requiredPassRate
      const stars = result.correctRate >= 0.95 ? 3 : result.correctRate >= 0.9 ? 2 : passed ? 1 : 0

      levels[idx] = {
        ...levels[idx],
        bestScore: Math.max(levels[idx].bestScore || 0, result.score),
        stars: Math.max(levels[idx].stars, stars),
      }

      // 解锁下一关
      if (passed && idx + 1 < levels.length) {
        levels[idx + 1] = { ...levels[idx + 1], unlocked: true }
      }

      return { ...state, challengeLevels: levels }
    }

    case 'LOAD_STATE':
      return { ...action.payload }

    case 'LOGOUT':
      return { ...initialState }

    default:
      return state
  }
}

// ===== Context =====
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEY = 'wordmaster-app-state'

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // 从 localStorage 加载状态
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as AppState
        // 合并挑战关卡（防止旧版数据缺失）
        if (!parsed.challengeLevels || parsed.challengeLevels.length === 0) {
          parsed.challengeLevels = initialChallengeLevels
        }
        dispatch({ type: 'LOAD_STATE', payload: parsed })
      }
    } catch {
      // 忽略 localStorage 错误
    }
  }, [])

  // 保存状态到 localStorage
  useEffect(() => {
    if (state.user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        // 忽略 localStorage 错误
      }
    }
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState must be used within AppProvider')
  }
  return context
}
