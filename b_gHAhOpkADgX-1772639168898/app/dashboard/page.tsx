'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAppState } from '@/lib/store'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { wordDatabase } from '@/lib/word-data'
import { getTodayReviewWords } from '@/lib/ebbinghaus'
import {
  BookOpen,
  GraduationCap,
  Swords,
  Flame,
  Target,
  TrendingUp,
  Settings,
  ChevronRight,
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { state, dispatch } = useAppState()
  const [showPlanSetup, setShowPlanSetup] = useState(false)
  const [planForm, setPlanForm] = useState({ dailyWords: 20, targetDate: '' })

  useEffect(() => {
    if (!state.user) {
      router.replace('/login')
    }
  }, [state.user, router])

  useEffect(() => {
    if (state.user && !state.studyPlan) {
      setShowPlanSetup(true)
    }
  }, [state.user, state.studyPlan])

  if (!state.user) return null

  const learnedCount = Object.keys(state.learningRecords).length
  const todayReviewWords = getTodayReviewWords(state.learningRecords)
  const totalWords = wordDatabase.length

  // 计算今天已学新词数量
  const today = new Date().toISOString().split('T')[0]
  const todayNewWords = Object.values(state.learningRecords).filter(
    (r) => r.learnedAt === today
  ).length
  const dailyGoal = state.studyPlan?.dailyNewWords || 20
  const todayProgress = Math.min((todayNewWords / dailyGoal) * 100, 100)

  // 掌握程度分布
  const masteryStats = {
    mastered: Object.values(state.learningRecords).filter((r) => r.masteryLevel === 'mastered').length,
    familiar: Object.values(state.learningRecords).filter((r) => r.masteryLevel === 'familiar').length,
    learning: Object.values(state.learningRecords).filter((r) => r.masteryLevel === 'learning').length,
  }

  const handleSavePlan = () => {
    dispatch({
      type: 'SET_STUDY_PLAN',
      payload: {
        dailyNewWords: planForm.dailyWords,
        targetDate: planForm.targetDate || undefined,
        reviewSchedule: [1, 2, 4, 7, 15],
      },
    })
    setShowPlanSetup(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Plan Setup Modal */}
        {showPlanSetup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm">
            <Card className="w-full max-w-md border-border shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{'制定学习计划'}</CardTitle>
                <CardDescription>{'设置每日学习量，开始你的词汇之旅'}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div>
                  <p className="mb-3 text-sm font-medium text-foreground">{'每日新词数量'}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 30, 50].map((n) => (
                      <button
                        key={n}
                        onClick={() => setPlanForm({ ...planForm, dailyWords: n })}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                          planForm.dailyWords === n
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card text-foreground hover:bg-accent'
                        }`}
                      >
                        {n}{'个/天'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="target-date">
                    {'目标日期（可选）'}
                  </label>
                  <input
                    id="target-date"
                    type="date"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    value={planForm.targetDate}
                    onChange={(e) => setPlanForm({ ...planForm, targetDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    {'复习策略：基于艾宾浩斯遗忘曲线，在学习后第1、2、4、7、15天自动安排复习。'}
                  </p>
                </div>
                <Button onClick={handleSavePlan} className="w-full">
                  {'开始学习'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Welcome & Streak */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {'你好，'}{state.user.username}
            </h1>
            <p className="text-muted-foreground">{'今天也要加油学习哦'}</p>
          </div>
          <div className="flex items-center gap-4">
            {state.streakDays > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-chart-3/10 px-3 py-1.5">
                <Flame className="h-4 w-4 text-chart-3" />
                <span className="text-sm font-bold text-chart-3">
                  {'连续 '}{state.streakDays}{' 天'}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPlanSetup(true)}
              className="gap-1"
            >
              <Settings className="h-4 w-4" />
              {'调整计划'}
            </Button>
          </div>
        </div>

        {/* Today's Progress */}
        <Card className="mb-6 border-border">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{'今日学习进度'}</h3>
              <span className="text-sm text-muted-foreground">
                {todayNewWords}/{dailyGoal} {'个新词'}
              </span>
            </div>
            <Progress value={todayProgress} className="h-2.5" />
            <div className="mt-3 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-foreground">{todayNewWords}</p>
                <p className="text-xs text-muted-foreground">{'今日新学'}</p>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{todayReviewWords.length}</p>
                <p className="text-xs text-muted-foreground">{'待复习'}</p>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{learnedCount}</p>
                <p className="text-xs text-muted-foreground">{'累计词汇'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => router.push('/learn')}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{'开始学习'}</h3>
              <p className="text-sm text-muted-foreground">
                {'还需学习 '}{Math.max(dailyGoal - todayNewWords, 0)}{' 个新词'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => router.push('/review')}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-info/10 transition-colors group-hover:bg-info/20">
              <GraduationCap className="h-6 w-6 text-info" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{'单词复习'}</h3>
              <p className="text-sm text-muted-foreground">
                {todayReviewWords.length}{' 个单词待复习'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => router.push('/challenge')}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-chart-3/10 transition-colors group-hover:bg-chart-3/20">
              <Swords className="h-6 w-6 text-chart-3" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{'闯关挑战'}</h3>
              <p className="text-sm text-muted-foreground">
                {'已通过 '}{state.challengeLevels.filter((l) => l.stars > 0).length}{'/10 关'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Learning Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{'总词汇量'}</p>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {learnedCount}
                <span className="text-sm font-normal text-muted-foreground">/{totalWords}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{'已掌握'}</p>
                <div className="h-4 w-4 rounded-full bg-primary" />
              </div>
              <p className="mt-1 text-2xl font-bold text-foreground">{masteryStats.mastered}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{'较熟悉'}</p>
                <div className="h-4 w-4 rounded-full bg-info" />
              </div>
              <p className="mt-1 text-2xl font-bold text-foreground">{masteryStats.familiar}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{'学习中'}</p>
                <div className="h-4 w-4 rounded-full bg-warning" />
              </div>
              <p className="mt-1 text-2xl font-bold text-foreground">{masteryStats.learning}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
