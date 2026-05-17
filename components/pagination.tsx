"use client"

import { Button } from "@/components/ui/button"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "hugeicons-react"

interface PaginationProps {
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
  onPageChange: (page: number) => void
  totalResults?: number
}

export function Pagination({
  currentPage,
  hasNext,
  hasPrev,
  onPageChange,
  totalResults,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between py-8">
      <p className="text-sm text-muted-foreground">
        {totalResults !== undefined && (
          <>{totalResults.toLocaleString()} books found</>
        )}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
        >
          <ArrowLeft01Icon className="size-4" />
          Previous
        </Button>
        <span className="px-3 text-sm text-muted-foreground">
          Page {currentPage}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
        >
          Next
          <ArrowRight01Icon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
