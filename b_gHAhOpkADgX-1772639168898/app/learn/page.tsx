'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useAppState } from '@/lib/store'
import { AppHeader } from '@/components/app-header'
import { WordCard } from '@/components/word-card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { wordDatabase } from '@/lib/word-data'
import {
  ArrowLeft,
  Check,
  HelpCircle,
  X,
  Trophy,
  Clock,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'

type LearnResult = 'known' | 'vague' | 'unknown'

export default function LearnPage() {
  const router = useRouter()
  const { state, dispatch } = useAppState()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<LearnResult[]>([])
  const [finished, setFinished] = useState(false)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    if (!state.user) {
      router.replace('/login')
    }
  }, [state.user, router])

  // 获取今天要学习的新词
  const dailyGoal = state.studyPlan?.dailyNewWords || 20
  const learnedWordIds = new Set(Object.keys(state.learningRecords))
  const wordsToLearn = wordDatabase
    .filter((w) => !learnedWordIds.has(w.id))
    .slice(0, dailyGoal)

  const currentWord = wordsToLearn[currentIndex]
  const totalWords = wordsToLearn.length

  const handleResult = useCallback(
    (result: LearnResult) => {
      if (!currentWord) return

      // 记录学习结果
      setResults((prev) => [...prev, result])
      dispatch({ type: 'LEARN_WORD', payload: { wordId: currentWord.id } })

      if (result === 'unknown' || result === 'vague') {
        // 加入生词本
        dispatch({ type: 'ADD_TO_NOTEBOOK', payload: currentWord.id })
      }

      // 下一个词
      if (currentIndex + 1 < totalWords) {
        setCurrentIndex((prev) => prev + 1)
        setFlipped(false)
      } else {
        // 学习完成
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000)
        const knownCount = [...results, result].filter((r) => r === 'known').length
        const total = [...results, result].length

        dispatch({ type: 'UPDATE_STREAK' })
        dispatch({ type: 'ADD_STUDY_TIME', payload: Math.max(elapsed, 1) })
        dispatch({
          type: 'ADD_DAILY_STATS',
          payload: {
            date: new Date().toISOString().split('T')[0],
            newWordsLearned: total,
            wordsReviewed: 0,
            correctRate: total > 0 ? knownCount / total : 0,
            studyMinutes: Math.max(elapsed, 1),
          },
        })

        setFinished(true)
      }
    },
    [currentWord, currentIndex, totalWords, results, dispatch]
  )

  if (!state.user) return null

  // 没有新词可学
  if (wordsToLearn.length === 0 && !finished) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{'太棒了！'}</h2>
          <p className="mt-2 text-muted-foreground">
            {'所有单词都已学习完毕，去复习巩固一下吧！'}
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => router.push('/review')}>{'去复习'}</Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              {'返回首页'}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // 学习完成小结
  if (finished) {
    const knownCount = results.filter((r) => r === 'known').length
    const vagueCount = results.filter((r) => r === 'vague').length
    const unknownCount = results.filter((r) => r === 'unknown').length
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000)
    const knownRate = results.length > 0 ? Math.round((knownCount / results.length) * 100) : 0

    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{'学习完成！'}</h2>
          <p className="mt-1 text-muted-foreground">
            {'今天又进步了一点'}
          </p>

          <Card className="mt-8 w-full border-border">
            <CardContent className="grid grid-cols-2 gap-4 p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-xs">{'学习单词'}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-foreground">{results.length}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Check className="h-4 w-4" />
                  <span className="text-xs">{'认识率'}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-primary">{knownRate}%</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{'用时'}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {elapsed < 1 ? '<1' : elapsed}{'分钟'}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-xs">{'不认识'}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-chart-4">{vagueCount + unknownCount}</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex w-full gap-3">
            <Button className="flex-1" onClick={() => router.push('/review')}>
              {'去复习'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/dashboard')}
            >
              {'返回首页'}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Top bar */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <Progress value={((currentIndex + 1) / totalWords) * 100} className="h-2" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {currentIndex + 1}/{totalWords}
          </span>
        </div>

        {/* Word Card */}
        {currentWord && (
          <WordCard
            word={currentWord}
            flipped={flipped}
            onFlip={() => setFlipped(!flipped)}
            className="mx-auto h-80 w-full max-w-sm"
          />
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {flipped ? (
            <>
              <button
                onClick={() => handleResult('unknown')}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-destructive/30 bg-destructive/5 transition-colors hover:bg-destructive/10">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <span className="text-xs text-muted-foreground">{'不认识'}</span>
              </button>

              <button
                onClick={() => handleResult('vague')}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-warning/30 bg-warning/5 transition-colors hover:bg-warning/10">
                  <HelpCircle className="h-6 w-6 text-warning" />
                </div>
                <span className="text-xs text-muted-foreground">{'模糊'}</span>
              </button>

              <button
                onClick={() => handleResult('known')}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/5 transition-colors hover:bg-primary/10">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{'认识'}</span>
              </button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {'点击卡片翻转查看释义，然后标记掌握程度'}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
