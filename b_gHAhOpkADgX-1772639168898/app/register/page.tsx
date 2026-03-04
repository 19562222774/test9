'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAppState } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { dispatch } = useAppState()
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    verifyCode: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleSendCode = () => {
    if (!form.email) {
      toast.error('请输入邮箱地址')
      return
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error('请输入有效的邮箱地址')
      return
    }
    setCountdown(60)
    toast.success('验证码已发送（Demo模式：输入任意6位数字即可）')
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 表单验证
    if (!form.email || !form.username || !form.password || !form.confirmPassword) {
      toast.error('请填写所有必填项')
      setLoading(false)
      return
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error('请输入有效的邮箱地址')
      setLoading(false)
      return
    }
    if (form.username.length < 2 || form.username.length > 20) {
      toast.error('用户名长度需在2-20个字符之间')
      setLoading(false)
      return
    }
    if (form.password.length < 6 || form.password.length > 20) {
      toast.error('密码长度需在6-20个字符之间')
      setLoading(false)
      return
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) {
      toast.error('密码需包含字母和数字')
      setLoading(false)
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('两次输入的密码不一致')
      setLoading(false)
      return
    }
    if (form.verifyCode.length < 4) {
      toast.error('请输入验证码')
      setLoading(false)
      return
    }

    // 模拟注册
    setTimeout(() => {
      dispatch({
        type: 'SET_USER',
        payload: {
          id: crypto.randomUUID(),
          email: form.email,
          username: form.username,
          createdAt: new Date().toISOString(),
        },
      })
      toast.success('注册成功！')
      router.push('/dashboard')
      setLoading(false)
    }, 500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">WordMaster</span>
        </Link>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{'创建账号'}</CardTitle>
            <CardDescription>{'开始你的智能背单词之旅'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{'邮箱'}</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="shrink-0"
                  >
                    {countdown > 0 ? `${countdown}s` : '发送验证码'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="verifyCode">{'验证码'}</Label>
                <Input
                  id="verifyCode"
                  type="text"
                  placeholder="请输入验证码"
                  value={form.verifyCode}
                  onChange={(e) => setForm({ ...form, verifyCode: e.target.value })}
                  maxLength={6}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="username">{'用户名'}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="2-20个字符"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">{'密码'}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="6-20位，需包含字母和数字"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">{'确认密码'}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>

              <Button type="submit" className="mt-2 w-full" disabled={loading}>
                {loading ? '注册中...' : '注册'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {'已有账号？'}
              <Link href="/login" className="ml-1 font-medium text-primary hover:underline">
                {'立即登录'}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
