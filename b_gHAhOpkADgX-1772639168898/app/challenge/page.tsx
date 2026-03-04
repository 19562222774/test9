'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useAppState } from '@/lib/store'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { wordDatabase } from '@/lib/word-data'
import type { ChallengeLevel } from '@/lib/types'
import {
  Star,
  Lock,
  Swords,
  ArrowLeft,
  Check,
  X,
  Trophy,
  Clock,
  Target,
  Zap,
} from 'lucide-react'

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

type GamePhase = 'select' | 'playing' | 'result'

export default function ChallengePage() {
  const router = useRouter()
  const { state, dispatch } = useAppState()
  const [phase, setPhase] = useState<GamePhase>('select')
  const [activeLevel, setActiveLevel] = useState<ChallengeLevel | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [combo, setCombo] = useState(0)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    if (!state.user) {
      router.replace('/login')
    }
  }, [state.user, router])

  // Generate words for the challenge based on level
  const challengeWords = useMemo(() => {
    if (!activeLevel) return []
    // Pick words based on level difficulty
    const levelIndex = state.challengeLevels.findIndex((l) => l.id === activeLevel.id)
    const minDiff = Math.min(Math.floor(levelIndex / 2) + 1, 5)
    const maxDiff = Math.min(minDiff + 1, 5)
    const pool = wordDatabase.filter((w) => w.difficulty >= minDiff && w.difficulty <= maxDiff)
    return shuffleArray(pool).slice(0, activeLevel.wordCount)
  }, [activeLevel, state.challengeLevels])

  const currentWord = challengeWords[currentIndex]

  const choices = useMemo(() => {
    if (!currentWord) return []
    const others = wordDatabase
      .filter((w) => w.id !== currentWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    return shuffleArray([currentWord, ...others]).map((w) => w.meaning)
  }, [currentWord])

  const handleChoiceSelect = useCallback(
    (index: number) => {
      if (!currentWord || showFeedback) return
      setSelectedAnswer(index)
      const correct = choices[index] === currentWord.meaning
      setIsCorrect(correct)
      setShowFeedback(true)

      if (correct) {
        const newCombo = combo + 1
        setCombo(newCombo)
        const comboBonus = Math.min(newCombo, 5) * 2
        setScore((p) => p + 10 + comboBonus)
        setCorrectCount((p) => p + 1)
      } else {
        setCombo(0)
      }

      setTimeout(() => {
        if (currentIndex + 1 < challengeWords.length) {
          setCurrentIndex((p) => p + 1)
          setShowFeedback(false)
          setSelectedAnswer(null)
        } else {
          // Challenge complete
          const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
          const total = challengeWords.length
          const finalCorrect = correctCount + (correct ? 1 : 0)
          const rate = finalCorrect / total

          dispatch({
            type: 'COMPLETE_CHALLENGE',
            payload: {
              levelId: activeLevel!.id,
              score: score + (correct ? 10 + Math.min((combo + 1), 5) * 2 : 0),
              correctRate: rate,
              timeSeconds: elapsed,
              completedAt: new Date().toISOString(),
            },
          })

          setPhase('result')
        }
      }, 1000)
    },
    [currentWord, showFeedback, choices, combo, currentIndex, challengeWords.length, correctCount, score, dispatch, activeLevel]
  )

  if (!state.user) return null

  // Level select
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-6">
          <div className="mb-6 flex items-center gap-3">
            <Swords className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{'\u95EF\u5173\u6311\u6218'}</h1>
          </div>
          <p className="mb-8 text-muted-foreground">
            {'\u9010\u5173\u631A\u6218\uFF0C\u6BCF\u5173\u9700\u8FBE\u5230\u8FC7\u5173\u6B63\u786E\u7387\u624D\u80FD\u89E3\u9501\u4E0B\u4E00\u5173'}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {state.challengeLevels.map((level, idx) => {
              const passed = level.stars > 0
              return (
                <button
                  key={level.id}
                  disabled={!level.unlocked}
                  onClick={() => {
                    setActiveLevel(level)
                    setPhase('playing')
                    setCurrentIndex(0)
                    setScore(0)
                    setCorrectCount(0)
                    setCombo(0)
                    setShowFeedback(false)
                    setSelectedAnswer(null)
                    startTimeRef.current = Date.now()
                  }}
                  className={`relative flex items-center gap-4 rounded-xl border p-5 text-left transition-all ${
                    level.unlocked
                      ? passed
                        ? 'border-primary/30 bg-primary/5 hover:shadow-md'
                        : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
                      : 'cursor-not-allowed border-border bg-muted/30 opacity-60'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                      level.unlocked
                        ? passed
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {level.unlocked ? idx + 1 : <Lock className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{level.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {level.wordCount}{' \u4E2A\u5355\u8BCD \u00B7 \u8FC7\u5173\u7387 '}{Math.round(level.requiredPassRate * 100)}{'%'}
                    </p>
                    {/* Stars */}
                    <div className="mt-1 flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= level.stars
                              ? 'fill-chart-3 text-chart-3'
                              : 'text-border'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {level.bestScore !== undefined && level.bestScore > 0 && (
                    <span className="text-sm font-bold text-primary">{level.bestScore}</span>
                  )}
                </button>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  // Result screen
  if (phase === 'result' && activeLevel) {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    const total = challengeWords.length
    const rate = total > 0 ? correctCount / total : 0
    const passed = rate >= activeLevel.requiredPassRate
    const stars = rate >= 0.95 ? 3 : rate >= 0.9 ? 2 : passed ? 1 : 0

    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
          <div
            className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              passed ? 'bg-primary/10' : 'bg-destructive/10'
            }`}
          >
            {passed ? (
              <Trophy className="h-10 w-10 text-primary" />
            ) : (
              <X className="h-10 w-10 text-destructive" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-foreground">
            {passed ? '\u95EF\u5173\u6210\u529F\uFF01' : '\u672A\u80FD\u8FC7\u5173'}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {passed ? '\u592A\u68D2\u4E86\uFF0C\u7EE7\u7EED\u52A0\u6CB9\uFF01' : '\u518D\u7EC3\u7EC3\u5427\uFF0C\u4F60\u53EF\u4EE5\u7684\uFF01'}
          </p>

          {/* Stars */}
          {passed && (
            <div className="mt-4 flex gap-2">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`h-8 w-8 ${
                    s <= stars ? 'fill-chart-3 text-chart-3' : 'text-border'
                  }`}
                />
              ))}
            </div>
          )}

          <Card className="mt-8 w-full border-border">
            <CardContent className="grid grid-cols-3 gap-4 p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs">{'\u5F97\u5206'}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-foreground">{score}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-xs">{'\u6B63\u786E\u7387'}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {Math.round(rate * 100)}{'%'}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{'\u7528\u65F6'}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {elapsed}{'s'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex w-full gap-3">
            <Button className="flex-1" onClick={() => setPhase('select')}>
              {'\u8FD4\u56DE\u5173\u5361'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setPhase('playing')
                setCurrentIndex(0)
                setScore(0)
                setCorrectCount(0)
                setCombo(0)
                setShowFeedback(false)
                setSelectedAnswer(null)
                startTimeRef.current = Date.now()
              }}
            >
              {'\u518D\u6765\u4E00\u6B21'}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Playing screen
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Top bar */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setPhase('select')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <Progress
              value={((currentIndex + 1) / challengeWords.length) * 100}
              className="h-2"
            />
          </div>
          <div className="flex items-center gap-2">
            {combo > 1 && (
              <span className="rounded-full bg-chart-3/10 px-2 py-0.5 text-xs font-bold text-chart-3">
                {combo}x
              </span>
            )}
            <span className="text-sm font-bold text-primary">{score}</span>
          </div>
        </div>

        {currentWord && (
          <div className="flex flex-col items-center">
            <Card className="mb-8 w-full border-border">
              <CardContent className="flex flex-col items-center p-8">
                <span className="text-3xl font-bold text-foreground">{currentWord.word}</span>
                <span className="mt-2 text-sm text-muted-foreground">
                  {currentWord.phonetic}
                </span>
              </CardContent>
            </Card>

            <div className="grid w-full gap-3">
              {choices.map((choice, index) => {
                let className =
                  'w-full rounded-xl border border-border bg-card p-4 text-left text-sm font-medium transition-all hover:border-primary/30'
                if (showFeedback) {
                  if (choice === currentWord.meaning) {
                    className =
                      'w-full rounded-xl border-2 border-primary bg-primary/5 p-4 text-left text-sm font-medium text-primary'
                  } else if (selectedAnswer === index && !isCorrect) {
                    className =
                      'w-full rounded-xl border-2 border-destructive bg-destructive/5 p-4 text-left text-sm font-medium text-destructive animate-shake'
                  }
                }

                return (
                  <button
                    key={index}
                    className={className}
                    onClick={() => handleChoiceSelect(index)}
                    disabled={showFeedback}
                  >
                    <span className="mr-2 text-muted-foreground">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {choice}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
