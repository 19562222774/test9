'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { useAppState } from '@/lib/store'
import { AppHeader } from '@/components/app-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { wordDatabase } from '@/lib/word-data'
import { getMasteryLabel } from '@/lib/ebbinghaus'
import type { Word } from '@/lib/types'
import {
  Search,
  BookMarked,
  Volume2,
  Filter,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'

const difficultyLabels = ['', '\u57FA\u7840', '\u8FDB\u9636', '\u4E2D\u7EA7', '\u9AD8\u7EA7', '\u6838\u5FC3']

export default function DictionaryPage() {
  const router = useRouter()
  const { state, dispatch } = useAppState()
  const [query, setQuery] = useState('')
  const [diffFilter, setDiffFilter] = useState<number>(0) // 0 = all
  const [showFilters, setShowFilters] = useState(false)
  const [expandedWord, setExpandedWord] = useState<string | null>(null)

  useEffect(() => {
    if (!state.user) {
      router.replace('/login')
    }
  }, [state.user, router])

  const filteredWords = useMemo(() => {
    let results = wordDatabase
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      results = results.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.meaning.includes(q) ||
          w.phonetic.toLowerCase().includes(q)
      )
    }
    if (diffFilter > 0) {
      results = results.filter((w) => w.difficulty === diffFilter)
    }
    return results
  }, [query, diffFilter])

  if (!state.user) return null

  const isInNotebook = (id: string) => state.notebook.includes(id)
  const record = (id: string) => state.learningRecords[id]

  const handleToggleNotebook = (wordId: string) => {
    if (isInNotebook(wordId)) {
      dispatch({ type: 'REMOVE_FROM_NOTEBOOK', payload: wordId })
      toast.success('\u5DF2\u4ECE\u751F\u8BCD\u672C\u79FB\u9664')
    } else {
      dispatch({ type: 'ADD_TO_NOTEBOOK', payload: wordId })
      toast.success('\u5DF2\u52A0\u5165\u751F\u8BCD\u672C')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">{'\u8BCD\u5178\u67E5\u8BE2'}</h1>

        {/* Search Bar */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={'\u641C\u7D22\u5355\u8BCD\u6216\u4E2D\u6587\u91CA\u4E49...'}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'border-primary text-primary' : ''}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-4 rounded-lg border border-border bg-card p-4">
            <p className="mb-2 text-sm font-medium text-foreground">{'\u96BE\u5EA6\u7B5B\u9009'}</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDiffFilter(0)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  diffFilter === 0
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {'\u5168\u90E8'}
              </button>
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setDiffFilter(d)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    diffFilter === d
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {difficultyLabels[d]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="mb-3 text-sm text-muted-foreground">
          {'\u627E\u5230 '}{filteredWords.length}{' \u4E2A\u5355\u8BCD'}
        </p>

        {/* Word List */}
        <div className="flex flex-col gap-2">
          {filteredWords.slice(0, 50).map((word) => {
            const rec = record(word.id)
            const expanded = expandedWord === word.id
            return (
              <Card key={word.id} className="border-border transition-shadow hover:shadow-sm">
                <CardContent className="p-0">
                  <button
                    className="flex w-full items-center gap-3 p-4 text-left"
                    onClick={() => setExpandedWord(expanded ? null : word.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-foreground">{word.word}</span>
                        <span className="text-xs text-muted-foreground">{word.phonetic}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {word.partOfSpeech}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{word.meaning}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {rec && (
                        <span className="text-xs text-primary">
                          {getMasteryLabel(rec.masteryLevel)}
                        </span>
                      )}
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          expanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {expanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3">
                      <div className="mb-3 rounded-lg bg-muted/50 p-3">
                        <p className="text-sm italic text-foreground">{word.example}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {word.exampleTranslation}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {'\u96BE\u5EA6 '}{word.difficulty}
                        </span>
                        {word.rootAffix && (
                          <span className="rounded bg-info/10 px-2 py-0.5 text-xs text-info">
                            {word.rootAffix}
                          </span>
                        )}
                        <div className="flex-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`gap-1 ${
                            isInNotebook(word.id) ? 'text-chart-3' : 'text-muted-foreground'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleNotebook(word.id)
                          }}
                        >
                          <BookMarked className="h-4 w-4" />
                          {isInNotebook(word.id) ? '\u5DF2\u6536\u85CF' : '\u52A0\u5165\u751F\u8BCD\u672C'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredWords.length > 50 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {'\u4EC5\u663E\u793A\u524D 50 \u4E2A\u7ED3\u679C\uFF0C\u8BF7\u7F29\u5C0F\u641C\u7D22\u8303\u56F4'}
          </p>
        )}
      </main>
    </div>
  )
}
