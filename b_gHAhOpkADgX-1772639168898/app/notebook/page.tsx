'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { useAppState } from '@/lib/store'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { wordDatabase } from '@/lib/word-data'
import { getMasteryLabel, getMasteryColor } from '@/lib/ebbinghaus'
import {
  BookMarked,
  Trash2,
  GraduationCap,
  BookOpen,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function NotebookPage() {
  const router = useRouter()
  const { state, dispatch } = useAppState()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)

  useEffect(() => {
    if (!state.user) {
      router.replace('/login')
    }
  }, [state.user, router])

  const notebookWords = useMemo(() => {
    return state.notebook
      .map((id) => wordDatabase.find((w) => w.id === id))
      .filter(Boolean) as typeof wordDatabase
  }, [state.notebook])

  if (!state.user) return null

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBatchRemove = () => {
    if (selectedIds.size === 0) return
    dispatch({ type: 'BATCH_REMOVE_FROM_NOTEBOOK', payload: Array.from(selectedIds) })
    setSelectedIds(new Set())
    setSelectMode(false)
    toast.success(`\u5DF2\u79FB\u9664 ${selectedIds.size} \u4E2A\u5355\u8BCD`)
  }

  const handleRemoveOne = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_NOTEBOOK', payload: id })
    toast.success('\u5DF2\u4ECE\u751F\u8BCD\u672C\u79FB\u9664')
  }

  // Empty state
  if (notebookWords.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BookMarked className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{'\u751F\u8BCD\u672C\u8FD8\u662F\u7A7A\u7684'}</h2>
          <p className="mt-2 text-muted-foreground">
            {'\u5728\u5B66\u4E60\u6216\u8BCD\u5178\u4E2D\u9047\u5230\u4E0D\u719F\u7684\u5355\u8BCD\u65F6\uFF0C\u5B83\u4EEC\u4F1A\u81EA\u52A8\u52A0\u5165\u751F\u8BCD\u672C'}
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => router.push('/learn')} className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              {'\u53BB\u5B66\u4E60'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/dictionary')} className="gap-1.5">
              <GraduationCap className="h-4 w-4" />
              {'\u67E5\u8BCD\u5178'}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{'\u751F\u8BCD\u672C'}</h1>
            <p className="text-sm text-muted-foreground">
              {'\u5171 '}{notebookWords.length}{' \u4E2A\u5355\u8BCD'}
            </p>
          </div>
          <div className="flex gap-2">
            {selectMode ? (
              <>
                <Button variant="outline" size="sm" onClick={() => {
                  setSelectMode(false)
                  setSelectedIds(new Set())
                }}>
                  {'\u53D6\u6D88'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedIds.size === notebookWords.length) {
                      setSelectedIds(new Set())
                    } else {
                      setSelectedIds(new Set(notebookWords.map((w) => w.id)))
                    }
                  }}
                >
                  {selectedIds.size === notebookWords.length ? '\u53D6\u6D88\u5168\u9009' : '\u5168\u9009'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1"
                  onClick={handleBatchRemove}
                  disabled={selectedIds.size === 0}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {'\u79FB\u9664 ('}{selectedIds.size}{')'}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setSelectMode(true)}>
                {'\u7BA1\u7406'}
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {notebookWords.map((word) => {
            const rec = state.learningRecords[word.id]
            return (
              <Card key={word.id} className="border-border">
                <CardContent className="flex items-center gap-3 p-4">
                  {selectMode && (
                    <button
                      onClick={() => toggleSelect(word.id)}
                      className="shrink-0"
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          selectedIds.has(word.id)
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}
                      >
                        {selectedIds.has(word.id) && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                        )}
                      </div>
                    </button>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{word.word}</span>
                      <span className="text-xs text-muted-foreground">{word.phonetic}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{word.meaning}</p>
                  </div>
                  {rec && (
                    <span className={`shrink-0 text-xs ${getMasteryColor(rec.masteryLevel)}`}>
                      {getMasteryLabel(rec.masteryLevel)}
                    </span>
                  )}
                  {!selectMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveOne(word.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
