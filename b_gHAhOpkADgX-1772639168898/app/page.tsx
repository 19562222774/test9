'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppState } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Brain,
  BarChart3,
  Swords,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'

const stats = [
  { value: '200+', label: '\u7CBE\u9009\u5355\u8BCD' },
  { value: '10', label: '\u6311\u6218\u5173\u5361' },
  { value: '5', label: '\u96BE\u5EA6\u7B49\u7EA7' },
]

const features = [
  {
    icon: Brain,
    title: '科学记忆',
    description: '基于艾宾浩斯遗忘曲线，在最佳时间点提醒你复习，让记忆更持久。',
  },
  {
    icon: BookOpen,
    title: '卡片学习',
    description: '翻转卡片交互，正面单词背面释义，沉浸式学习体验。',
  },
  {
    icon: Swords,
    title: '闯关挑战',
    description: '10大关卡逐步解锁，拼写、选择多种题型，趣味闯关。',
  },
  {
    icon: BarChart3,
    title: '数据统计',
    description: '详细的学习数据图表，追踪进度，量化每一天的成长。',
  },
  {
    icon: Target,
    title: '个性计划',
    description: '自定义每日学习量和目标日期，按自己的节奏学习。',
  },
  {
    icon: TrendingUp,
    title: '连续打卡',
    description: '每日学习打卡，积累连续天数，养成学习好习惯。',
  },
]

export default function HomePage() {
  const router = useRouter()
  const { state } = useAppState()

  useEffect(() => {
    if (state.user) {
      router.replace('/dashboard')
    }
  }, [state.user, router])

  if (state.user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.62_0.17_155/0.12),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pb-16 pt-20 text-center sm:pb-24 sm:pt-32">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {'AI '}{'时代的科学背单词工具'}
            </span>
          </div>

          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {'让每一个单词'}
            <br />
            <span className="text-primary">{'牢记于心'}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {'WordMaster 基于艾宾浩斯遗忘曲线科学算法，智能规划你的复习计划，'}
            {'通过卡片翻转学习、闯关挑战等多种模式，让背单词变得高效又有趣。'}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Button asChild size="lg" className="gap-2 rounded-xl px-6 text-base">
              <Link href="/register">
                {'立即开始'}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl px-6 text-base"
            >
              <Link href="/login">{'已有账号？登录'}</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 sm:gap-16">
            {stats.map((stat) => (
              <div key={stat.value} className="text-center">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-balance text-center text-2xl font-bold text-foreground sm:text-3xl">
            {'为什么选择 WordMaster？'}
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            {'科学方法 + 有趣体验 = 高效学习'}
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-balance text-2xl font-bold text-foreground sm:text-3xl">
            {'准备好开始你的词汇之旅了吗？'}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {'免费注册，立即体验科学背单词的乐趣'}
          </p>
          <Button asChild size="lg" className="mt-8 gap-2 rounded-xl px-8 text-base">
            <Link href="/register">
              {'免费注册'}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">
            {'WordMaster - 智能背单词平台'}
          </p>
        </div>
      </footer>
    </div>
  )
}
