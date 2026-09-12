"use client";

import { LiquidPagination, useLiquidPagination } from "../apple-clear/LiquidPagination";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

const ITEMS = Array.from({ length: 42 }, (_, index) => index + 1);

export function LiquidPaginationPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const copy = PREVIEW_COPY.pagination;
  const pagination = useLiquidPagination(ITEMS, 5);

  return (
    <OverlayPreviewStage>
      <LiquidPagination
        pagination={pagination}
        theme={theme}
        previousLabel={previewText(locale, copy.prev)}
        nextLabel={previewText(locale, copy.next)}
        summary={
          locale === "en"
            ? `${pagination.totalItems} rows · page ${pagination.currentPage}/${pagination.totalPages}`
            : `共 ${pagination.totalItems} 条 · 第 ${pagination.currentPage}/${pagination.totalPages} 页`
        }
      />
      <p className="ui-studio__value">
        {pagination.items[0]}–{pagination.items[pagination.items.length - 1]}
      </p>
    </OverlayPreviewStage>
  );
}
