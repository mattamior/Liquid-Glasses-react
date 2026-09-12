"use client";

import { useMemo, useState } from "react";
import { LiquidButton } from "./LiquidButton";
import "./liquid-controls.css";

export interface LiquidPaginationState<T> {
  currentPage: number;
  items: T[];
  pageSize: number;
  totalItems: number;
  totalPages: number;
  reset: () => void;
  setPage: (page: number) => void;
}

export function useLiquidPagination<T>(items: T[], pageSize = 5): LiquidPaginationState<T> {
  const [requestedPage, setRequestedPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, items, pageSize],
  );

  return {
    currentPage,
    items: pageItems,
    pageSize,
    totalItems,
    totalPages,
    reset: () => setRequestedPage(1),
    setPage: (page) => setRequestedPage(Math.min(Math.max(page, 1), totalPages)),
  };
}

export interface LiquidPaginationProps<T> {
  pagination: LiquidPaginationState<T>;
  theme?: "light" | "dark";
  summary?: string;
  previousLabel?: string;
  nextLabel?: string;
}

export function LiquidPagination<T>({
  pagination,
  theme,
  summary,
  previousLabel = "上一页",
  nextLabel = "下一页",
}: LiquidPaginationProps<T>) {
  const pageNumbers = useMemo(() => {
    if (pagination.totalPages <= 7) {
      return Array.from({ length: pagination.totalPages }, (_, index) => index + 1);
    }
    const surrounding = [pagination.currentPage - 1, pagination.currentPage, pagination.currentPage + 1].filter(
      (page) => page > 1 && page < pagination.totalPages,
    );
    const pages = [1, ...surrounding, pagination.totalPages].filter(
      (page, index, values) => values.indexOf(page) === index,
    );
    return pages.reduce<(number | "ellipsis")[]>((result, page, index) => {
      if (index > 0 && page - pages[index - 1] > 1) result.push("ellipsis");
      result.push(page);
      return result;
    }, []);
  }, [pagination.currentPage, pagination.totalPages]);

  return (
    <nav className="liquid-pagination" data-theme={theme} aria-label="列表分页">
      <p>
        {summary ??
          `共 ${pagination.totalItems} 条，每页 ${pagination.pageSize} 条`}
      </p>
      <div className="liquid-pagination__controls">
        <LiquidButton
          theme={theme}
          size="sm"
          variant="ghost"
          disabled={pagination.currentPage <= 1}
          aria-label={previousLabel}
          onClick={() => pagination.setPage(pagination.currentPage - 1)}
        >
          {previousLabel}
        </LiquidButton>
        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <span className="liquid-pagination__ellipsis" aria-hidden="true" key={`ellipsis-${index}`}>
              …
            </span>
          ) : (
            <LiquidButton
              key={page}
              theme={theme}
              size="sm"
              variant={page === pagination.currentPage ? "default" : "ghost"}
              aria-current={page === pagination.currentPage ? "page" : undefined}
              aria-label={`第 ${page} 页`}
              onClick={() => pagination.setPage(page)}
            >
              {page}
            </LiquidButton>
          ),
        )}
        <LiquidButton
          theme={theme}
          size="sm"
          variant="ghost"
          disabled={pagination.currentPage >= pagination.totalPages}
          aria-label={nextLabel}
          onClick={() => pagination.setPage(pagination.currentPage + 1)}
        >
          {nextLabel}
        </LiquidButton>
      </div>
    </nav>
  );
}
