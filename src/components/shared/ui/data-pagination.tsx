"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import { useT, useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");

  pages.push(total);
  return pages;
}

export function DataPagination({
  page,
  totalPages,
  total,
  from,
  to,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
}: Props) {
  const t = useT();
  const { isRTL } = useLanguage();
  const isRtl = isRTL;

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const FirstIcon = isRtl ? ChevronsRight : ChevronsLeft;
  const LastIcon = isRtl ? ChevronsLeft : ChevronsRight;

  const pages = getPageNumbers(page, totalPages);

  if (total === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border bg-card/50 text-sm",
        className,
      )}
    >
      {/* count */}
      <p className="text-muted-foreground text-xs shrink-0">
        {t("pagination.showing")}{" "}
        <span className="font-semibold text-foreground">{from}–{to}</span>{" "}
        {t("pagination.of")}{" "}
        <span className="font-semibold text-foreground">{total}</span>{" "}
        {t("pagination.results")}
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        {/* rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
            {t("pagination.rowsPerPage")}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-7 w-[64px] text-xs bg-secondary/50 border-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((s) => (
                <SelectItem key={s} value={String(s)} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* page buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            aria-label="first page"
          >
            <FirstIcon className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label={t("pagination.previous")}
          >
            <PrevIcon className="size-3.5" />
          </Button>

          {pages.map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="w-7 text-center text-muted-foreground text-xs select-none"
              >
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon-sm"
                onClick={() => onPageChange(p)}
                className={cn(
                  "text-xs min-w-7",
                  p === page && "pointer-events-none",
                )}
              >
                {p}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label={t("pagination.next")}
          >
            <NextIcon className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            aria-label="last page"
          >
            <LastIcon className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
