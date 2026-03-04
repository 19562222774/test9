'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { useAppState } from '@/lib/store'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { wordDatabase } from '@/lib/word-data'
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BookOpen,
  Flame,
  Clock,
  Target,
  TrendingUp,
  Award,
} from 'lucide-react'

// Use computed colors, NOT CSS variables (per chart skill guidelines)
const MASTERY_COLORS = {
  mastered: '#10b981',
  familiar: '#3b82f6',
  learning: '#f59e0b',
  new: '#9ca3af',
}

export default function StatisticsPage() {
  const router = useRouter()
  const { state } = useAppState()

  useEffect(() => {
    if (!state.user) {
      router.replace('/login')
    }
  }, [state.user, router])

  const records = Object.values(state.learningRecords)
  const totalWords = wordDatabase.length
  const learnedCount = records.length

  // Mastery distribution
  const masteryData = useMemo(() => {
    const counts = { mastered: 0, familiar: 0, learning: 0, new: 0 }
    records.forEach((r) => {
      counts[r.masteryLevel]++
    })
    // Add unlearned words as 'new'
    counts.new += totalWords - learnedCount
    return [
      { name: '\u5DF2\u638C\u63E1', value: counts.mastered, fill: MASTERY_COLORS.mastered },
      { name: '\u8F83\u719F\u6089', value: counts.familiar, fill: MASTERY_COLORS.familiar },
      { name: '\u5B66\u4E60\u4E2D', value: counts.learning, fill: MASTERY_COLORS.learning },
      { name: '\u672A\u5B66\u4E60', value: counts.new, fill: MASTERY_COLORS.new },
    ]
  }, [records, totalWords, learnedCount])

  // Daily stats for the last 14 days
  const dailyChartData = useMemo(() => {
    const days: { date: string; label: string; newWords: number; reviewed: number; rate: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const label = `${d.getMonth() + 1}/${d.getDate()}`
      const stat = state.dailyStats.find((s) => s.date === dateStr)
      days.push({
        date: dateStr,
        label,
        newWords: stat?.newWordsLearned || 0,
        reviewed: stat?.wordsReviewed || 0,
        rate: stat ? Math.round(stat.correctRate * 100) : 0,
      })
    }
    return days
  }, [state.dailyStats])

  // Difficulty distribution
  const difficultyData = useMemo(() => {
    const labels = ['\u57FA\u7840', '\u8FDB\u9636', '\u4E2D\u7EA7', '\u9AD8\u7EA7', '\u6838\u5FC3']
    return [1, 2, 3, 4, 5].map((d, i) => {
      const total = wordDatabase.filter((w) => w.difficulty === d).length
      const learned = records.filter((r) => {
        const word = wordDatabase.find((w) => w.id === r.wordId)
        return word?.difficulty === d
      }).length
      return { name: labels[i], total, learned }
    })
  }, [records])

  // Challenge stats
  const challengeStats = useMemo(() => {
    const passed = state.challengeLevels.filter((l) => l.stars > 0).length
    const totalStars = state.challengeLevels.reduce((s, l) => s + l.stars, 0)
    return { passed, totalStars, maxStars: state.challengeLevels.length * 3 }
  }, [state.challengeLevels])

  if (!state.user) return null

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">{'\u5B66\u4E60\u7EDF\u8BA1'}</h1>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{'\u5DF2\u5B66\u8BCD\u6C47'}</p>
                <p className="text-xl font-bold text-foreground">
                  {learnedCount}
                  <span className="text-sm font-normal text-muted-foreground">/{totalWords}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                <Flame className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{'\u8FDE\u7EED\u6253\u5361'}</p>
                <p className="text-xl font-bold text-foreground">
                  {state.streakDays}{' \u5929'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{'\u7D2F\u8BA1\u65F6\u95F4'}</p>
                <p className="text-xl font-bold text-foreground">
                  {state.totalStudyMinutes}{' \u5206\u949F'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <Award className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{'\u95EF\u5173\u8FDB\u5EA6'}</p>
                <p className="text-xl font-bold text-foreground">
                  {challengeStats.passed}{'/10'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Daily Learning Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                {'\u6BCF\u65E5\u5B66\u4E60\u91CF'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  newWords: { label: '\u65B0\u5B66', color: '#10b981' },
                  reviewed: { label: '\u590D\u4E60', color: '#3b82f6' },
                }}
                className="h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="newWords" fill="#10b981" radius={[4, 4, 0, 0]} name={'\u65B0\u5B66'} />
                    <Bar dataKey="reviewed" fill="#3b82f6" radius={[4, 4, 0, 0]} name={'\u590D\u4E60'} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Correct Rate Trend */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-primary" />
                {'\u6B63\u786E\u7387\u8D8B\u52BF'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  rate: { label: '\u6B63\u786E\u7387 (%)', color: '#10b981' },
                }}
                className="h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#10b981' }}
                      name={'\u6B63\u786E\u7387 (%)'}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Mastery Distribution Pie */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">{'\u638C\u63E1\u7A0B\u5EA6\u5206\u5E03'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="h-[200px] w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={masteryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {masteryData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} \u4E2A`, name]}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3">
                  {masteryData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="text-sm text-foreground">{entry.name}</span>
                      <span className="text-sm font-medium text-foreground">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Distribution */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">{'\u96BE\u5EA6\u5206\u5E03'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  total: { label: '\u603B\u8BCD\u6C47', color: '#e5e7eb' },
                  learned: { label: '\u5DF2\u5B66', color: '#10b981' },
                }}
                className="h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="total" fill="#e5e7eb" radius={[4, 4, 0, 0]} name={'\u603B\u8BCD\u6C47'} />
                    <Bar dataKey="learned" fill="#10b981" radius={[4, 4, 0, 0]} name={'\u5DF2\u5B66'} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
