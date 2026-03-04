// 艾宾浩斯遗忘曲线算法
// 复习间隔：第1天、第2天、第4天、第7天、第15天

import type { LearningRecord, MasteryLevel } from './types'

export const REVIEW_INTERVALS = [1, 2, 4, 7, 15]

/**
 * 计算下一次复习日期
 */
export function getNextReviewDate(learnedAt: string, reviewCount: number): string {
  const date = new Date(learnedAt)
  const interval = REVIEW_INTERVALS[Math.min(reviewCount, REVIEW_INTERVALS.length - 1)]
  date.setDate(date.getDate() + interval)
  return date.toISOString().split('T')[0]
}

/**
 * 根据答对/答错更新学习记录
 */
export function updateLearningRecord(
  record: LearningRecord,
  correct: boolean
): LearningRecord {
  const newStrength = correct
    ? Math.min(record.strength + 1, 5)
    : Math.max(record.strength - 1, 0)

  const newReviewCount = correct ? record.reviewCount + 1 : Math.max(record.reviewCount - 1, 0)
  const newMastery = getMasteryLevel(newStrength, newReviewCount)

  return {
    ...record,
    strength: newStrength,
    reviewCount: newReviewCount,
    masteryLevel: newMastery,
    nextReviewAt: getNextReviewDate(new Date().toISOString(), newReviewCount),
  }
}

/**
 * 根据强度和复习次数确定掌握程度
 */
export function getMasteryLevel(strength: number, reviewCount: number): MasteryLevel {
  if (strength >= 4 && reviewCount >= 4) return 'mastered'
  if (strength >= 3 && reviewCount >= 2) return 'familiar'
  if (reviewCount >= 1) return 'learning'
  return 'new'
}

/**
 * 获取今天需要复习的单词ID列表
 */
export function getTodayReviewWords(records: Record<string, LearningRecord>): string[] {
  const today = new Date().toISOString().split('T')[0]
  return Object.entries(records)
    .filter(([, record]) => {
      return record.nextReviewAt <= today && record.masteryLevel !== 'mastered'
    })
    .sort((a, b) => a[1].strength - b[1].strength) // 优先复习强度低的
    .map(([wordId]) => wordId)
}

/**
 * 创建新的学习记录
 */
export function createLearningRecord(wordId: string): LearningRecord {
  const today = new Date().toISOString().split('T')[0]
  return {
    wordId,
    learnedAt: today,
    masteryLevel: 'new',
    strength: 0,
    nextReviewAt: getNextReviewDate(today, 0),
    reviewCount: 0,
  }
}

/**
 * 计算记忆保持率（基于艾宾浩斯曲线的近似）
 */
export function getRetentionRate(daysSinceLearn: number, strength: number): number {
  // R = e^(-t/S) 的简化版本，其中 S 是基于复习强度的稳定性因子
  const stabilityFactor = 1 + strength * 2
  const retention = Math.exp(-daysSinceLearn / stabilityFactor) * 100
  return Math.max(Math.round(retention), 5)
}

/**
 * 获取掌握程度的中文标签
 */
export function getMasteryLabel(level: MasteryLevel): string {
  const labels: Record<MasteryLevel, string> = {
    new: '未学习',
    learning: '学习中',
    familiar: '较熟悉',
    mastered: '已掌握',
  }
  return labels[level]
}

/**
 * 获取掌握程度对应的颜色类名
 */
export function getMasteryColor(level: MasteryLevel): string {
  const colors: Record<MasteryLevel, string> = {
    new: 'text-muted-foreground',
    learning: 'text-warning-foreground',
    familiar: 'text-info-foreground',
    mastered: 'text-success-foreground',
  }
  return colors[level]
}
