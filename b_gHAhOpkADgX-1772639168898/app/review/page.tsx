'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useAppState } from '@/lib/store'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { wordDatabase } from '@/lib/word-data'
import { getTodayReviewWords } from '@/lib/ebbinghaus'
import {
  ArrowLeft,
  Check,
  X,
  Trophy,
  Clock,
  Target,
  Keyboard,
  MousePointer,
} from 'lucide-react'
import { toast } from 'sonner'

type ReviewMode = 'spelling' | 'choice'

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function ReviewPage() {
  const router = useRouter()
  const { state, dispatch } = useAppState()
  const [mode, setMode] = useState<ReviewMode>('choice')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [spellingInput, setSpellingInput] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const startTimeRef = useRef(Date.now())
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!state.user) {
      router.replace('/login')
    }
  }, [state.user, router])

  // 获取需要复习的单词
  const reviewWordIds = useMemo(() => {
    const todayReview = getTodayReviewWords(state.learningRecords)
    if (todayReview.length > 0) return todayReview
    // 如果没有待复习的，取最近学过的
    return Object.entries(state.learningRecords)
      .filter(([, r]) => r.masteryLevel !== 'mastered')
      .sort((a, b) => a[1].strength - b[1].strength)
      .slice(0, 20)
      .map(([id]) => id)
  }, [state.learningRecords])

  const reviewWords = useMemo(() => {
    return shuffleArray(
      reviewWordIds
        .map((id) => wordDatabase.find((w) => w.id === id))
        .filter(Boolean) as typeof wordDatabase
    )
  }, [reviewWordIds])

  const currentWord = reviewWords[currentIndex]

  // 生成选择题选项
  const choices = useMemo(() => {
    if (!currentWord || mode !== 'choice') return []
    const others = wordDatabase
      .filter((w) => w.id !== currentWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const all = shuffleArray([currentWord, ...others])
    return all.map((w) => w.meaning)
  }, [currentWord, mode, currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentWord) return
      setIsCorrect(correct)
      setShowResult(true)
      setTotalCount((p) => p + 1)
      if (correct) setCorrectCount((p) => p + 1)

      dispatch({
        type: 'REVIEW_WORD',
        payload: { wordId: currentWord.id, correct },
      })

      setTimeout(() => {
        if (currentIndex + 1 < reviewWords.length) {
          setCurrentIndex((p) => p + 1)
          setShowResult(false)
          setSelectedAnswer(null)
          setSpellingInput('')
        } else {
          const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000)
          dispatch({
            type: 'ADD_DAILY_STATS',
            payload: {
              date: new Date().toISOString().split('T')[0],
              newWordsLearned: 0,
              wordsReviewed: totalCount + 1,
              correctRate: (correctCount + (correct ? 1 : 0)) / (totalCount + 1),
              studyMinutes: Math.max(elapsed, 1),
            },
          })
          dispatch({ type: 'UPDATE_STREAK' })
          dispatch({ type: 'ADD_STUDY_TIME', payload: Math.max(elapsed, 1) })
          setFinished(true)
        }
      }, 1200)
    },
    [currentWord, currentIndex, reviewWords.length, correctCount, totalCount, dispatch]
  )

  const handleSpellingSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!currentWord || showResult) return
      const correct = spellingInput.trim().toLowerCase() === currentWord.word.toLowerCase()
      handleAnswer(correct)
    },
    [currentWord, spellingInput, showResult, handleAnswer]
  )

  const handleChoiceSelect = useCallback(
    (index: number) => {
      if (!currentWord || showResult) return
      setSelectedAnswer(index)
      const correct = choices[index] === currentWord.meaning
      handleAnswer(correct)
    },
    [currentWord, showResult, choices, handleAnswer]
  )

  if (!state.user) return null

  // 没有可复习的单词
  if (reviewWords.length === 0 && !finished) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{'暂无待复习单词'}</h2>
          <p className="mt-2 text-muted-foreground">
            {'先去学习一些新单词吧！'}
          </p>
          <Button className="mt-6" onClick={() => router.push('/learn')}>
            {'去学习'}
          </Button>
        </main>
      </div>
    )
  }

  // 完成页
  if (finished) {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000)
    const rate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{'复习完成！'}</h2>

          <Card className="mt-8 w-full border-border">
            <CardContent className="grid grid-cols-3 gap-4 p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-xs">{'复习'}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-foreground">{totalCount}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Check className="h-4 w-4" />
                  <span className="text-xs">{'正确率'}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-primary">{rate}%</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{'用时'}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {elapsed < 1 ? '<1' : elapsed}{'分'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex w-full gap-3">
            <Button className="flex-1" onClick={() => router.push('/dashboard')}>
              {'返回首页'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setCurrentIndex(0)
                setFinished(false)
                setCorrectCount(0)
                setTotalCount(0)
                setShowResult(false)
                setSelectedAnswer(null)
                setSpellingInput('')
                startTimeRef.current = Date.now()
                setStarted(false)
              }}
            >
              {'再来一轮'}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // 开始选择模式页面
  if (!started) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground">{'单词复习'}</h2>
          <p className="mt-2 text-muted-foreground">
            {'共 '}{reviewWords.length}{' 个单词待复习'}
          </p>

          <div className="mt-8 w-full">
            <p className="mb-3 text-sm font-medium text-foreground">{'选择复习模式'}</p>
            <Tabs value={mode} onValueChange={(v) => setMode(v as ReviewMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="choice" className="gap-2">
                  <MousePointer className="h-4 w-4" />
                  {'选择模式'}
                </TabsTrigger>
                <TabsTrigger value="spelling" className="gap-2">
                  <Keyboard className="h-4 w-4" />
                  {'拼写模式'}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-4 rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                {mode === 'choice'
                  ? '看到单词，从四个选项中选出正确的中文释义。'
                  : '看到中文释义，拼写出对应的英文单词。'}
              </p>
            </div>
          </div>

          <Button
            className="mt-8 w-full"
            size="lg"
            onClick={() => {
              setStarted(true)
              startTimeRef.current = Date.now()
            }}
          >
            {'开始复习'}
          </Button>
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
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <Progress value={((currentIndex + 1) / reviewWords.length) * 100} className="h-2" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {currentIndex + 1}/{reviewWords.length}
          </span>
        </div>

        {currentWord && (
          <>
            {mode === 'choice' ? (
              // 选择模式
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
                    if (showResult) {
                      if (choice === currentWord.meaning) {
                        className =
                          'w-full rounded-xl border-2 border-primary bg-primary/5 p-4 text-left text-sm font-medium text-primary'
                      } else if (selectedAnswer === index && !isCorrect) {
                        className =
                          'w-full rounded-xl border-2 border-destructive bg-destructive/5 p-4 text-left text-sm font-medium text-destructive animate-shake'
                      }
                    } else if (selectedAnswer === index) {
                      className =
                        'w-full rounded-xl border-2 border-primary bg-primary/5 p-4 text-left text-sm font-medium'
                    }

                    return (
                      <button
                        key={index}
                        className={className}
                        onClick={() => handleChoiceSelect(index)}
                        disabled={showResult}
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
            ) : (
              // 拼写模式
              <div className="flex flex-col items-center">
                <Card className="mb-8 w-full border-border">
                  <CardContent className="flex flex-col items-center p-8">
                    <span className="text-sm text-muted-foreground">
                      {currentWord.partOfSpeech}
                    </span>
                    <span className="mt-2 text-xl font-bold text-foreground">
                      {currentWord.meaning}
                    </span>
                  </CardContent>
                </Card>

                <form onSubmit={handleSpellingSubmit} className="w-full">
                  <div className="relative">
                    <Input
                      value={spellingInput}
                      onChange={(e) => setSpellingInput(e.target.value)}
                      placeholder="请输入英文单词..."
                      className={`text-center text-lg ${
                        showResult
                          ? isCorrect
                            ? 'border-primary bg-primary/5'
                            : 'border-destructive bg-destructive/5'
                          : ''
                      }`}
                      disabled={showResult}
                      autoFocus
                    />
                  </div>
                  {showResult && !isCorrect && (
                    <p className="mt-3 text-center text-sm text-foreground">
                      {'正确答案：'}
                      <span className="font-bold text-primary">{currentWord.word}</span>
                    </p>
                  )}
                  {!showResult && (
                    <Button type="submit" className="mt-4 w-full">
                      {'确认'}
                    </Button>
                  )}
                </form>
              </div>
            )}

            {/* Result feedback */}
            {showResult && (
              <div className="mt-6 text-center">
                {isCorrect ? (
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">{'回答正确！'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <X className="h-5 w-5" />
                    <span className="font-medium">{'回答错误'}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
