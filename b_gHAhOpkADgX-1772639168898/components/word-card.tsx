'use client'

import { cn } from '@/lib/utils'
import type { Word } from '@/lib/types'

interface WordCardProps {
  word: Word
  flipped: boolean
  onFlip: () => void
  className?: string
}

export function WordCard({ word, flipped, onFlip, className }: WordCardProps) {
  return (
    <div
      className={cn('perspective cursor-pointer', className)}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onFlip()
        }
      }}
      aria-label={flipped ? '点击翻转到单词面' : '点击翻转查看释义'}
    >
      <div className={cn('flip-card-inner relative h-full w-full', flipped && 'flipped')}>
        {/* 正面：单词 */}
        <div className="flip-card-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-lg">
          <span className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            {word.word}
          </span>
          <span className="mb-1 text-base text-muted-foreground">{word.phonetic}</span>
          <span className="text-sm text-muted-foreground">{word.partOfSpeech}</span>
          <p className="mt-6 text-xs text-muted-foreground/60">
            {'点击卡片查看释义'}
          </p>
        </div>

        {/* 背面：释义 */}
        <div className="flip-card-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-card p-6 shadow-lg">
          <span className="mb-1 text-xl font-semibold text-foreground">{word.word}</span>
          <span className="mb-4 text-sm text-muted-foreground">{word.phonetic}</span>
          <div className="mb-4 rounded-lg bg-primary/5 px-4 py-3 text-center">
            <span className="text-sm text-muted-foreground">{word.partOfSpeech}</span>
            <p className="mt-1 text-lg font-medium text-foreground">{word.meaning}</p>
          </div>
          {word.rootAffix && (
            <p className="mb-2 text-xs text-muted-foreground">
              {'词根词缀: '}{word.rootAffix}
            </p>
          )}
          <div className="w-full rounded-lg bg-muted/50 px-4 py-3">
            <p className="text-sm text-foreground italic">{word.example}</p>
            <p className="mt-1 text-xs text-muted-foreground">{word.exampleTranslation}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
