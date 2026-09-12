"use client";

import { useMemo, useState } from "react";
import { LiquidButton } from "../apple-clear/LiquidButton";
import { LiquidGlassCard } from "../apple-clear/LiquidGlassCard";
import { LiquidPagination, useLiquidPagination } from "../apple-clear/LiquidPagination";
import { LiquidPill, statusTone } from "../apple-clear/LiquidPill";
import { LiquidSheet } from "../apple-clear/LiquidSheet";
import { LiquidTable } from "../apple-clear/LiquidTable";
import { LiquidToolbar } from "../apple-clear/LiquidToolbar";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage, StageWash, useOverlayPortal } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

interface RegionRow {
  id: string;
  name: string;
  code: string;
  status: "ENABLED" | "DISABLED" | "PRE_ONLINE";
}

const ROWS: RegionRow[] = [
  { id: "1", name: "亚太", code: "APAC", status: "ENABLED" },
  { id: "2", name: "欧洲", code: "EU", status: "ENABLED" },
  { id: "3", name: "北美", code: "NA", status: "PRE_ONLINE" },
  { id: "4", name: "南美", code: "SA", status: "DISABLED" },
  { id: "5", name: "中东", code: "ME", status: "ENABLED" },
  { id: "6", name: "非洲", code: "AF", status: "DISABLED" },
  { id: "7", name: "大洋洲", code: "OC", status: "PRE_ONLINE" },
  { id: "8", name: "东南亚", code: "SEA", status: "ENABLED" },
];

export function LiquidTablePreview() {
  return (
    <OverlayPreviewStage>
      <LiquidTablePreviewBody />
    </OverlayPreviewStage>
  );
}

function LiquidTablePreviewBody() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const portal = useOverlayPortal();
  const copy = PREVIEW_COPY.table;
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [detail, setDetail] = useState<RegionRow | null>(null);
  const [action, setAction] = useState("idle");
  const filtered = useMemo(
    () =>
      ROWS.filter((row) => {
        const hay = `${row.id} ${row.name} ${row.code}`.toLowerCase();
        return hay.includes(applied.toLowerCase());
      }),
    [applied],
  );
  const pagination = useLiquidPagination(filtered, 4);

  return (
    <>
      <div className="liquid-table-host">
        <LiquidGlassCard
          key={`${theme}-${locale}`}
          theme={theme}
          title={previewText(locale, copy.title)}
          scene={StageWash}
        >
          <LiquidToolbar
            theme={theme}
            query={query}
            setQuery={setQuery}
            placeholder={previewText(locale, copy.search)}
            searchLabel={previewText(locale, copy.query)}
            resetLabel={previewText(locale, copy.reset)}
            onSearch={() => {
              pagination.reset();
              setApplied(query.trim());
            }}
            onReset={() => {
              setQuery("");
              pagination.reset();
              setApplied("");
            }}
          />
          <LiquidTable
            theme={theme}
            rows={pagination.items}
            empty={previewText(locale, copy.empty)}
            getRowKey={(row) => row.id}
            columns={[
              { key: "id", header: "ID" },
              {
                key: "name",
                header: previewText(locale, copy.region),
                render: (row) => (
                  <button type="button" className="liquid-table-link" onClick={() => setDetail(row)}>
                    {row.name}
                  </button>
                ),
              },
              {
                key: "code",
                header: previewText(locale, copy.code),
                render: (row) => <code>{row.code}</code>,
              },
              {
                key: "status",
                header: previewText(locale, copy.status),
                render: (row) => (
                  <LiquidPill theme={theme} tone={statusTone(row.status)}>
                    {row.status}
                  </LiquidPill>
                ),
              },
              {
                key: "actions",
                header: previewText(locale, copy.actions),
                render: (row) => (
                  <div className="liquid-table-actions">
                    <LiquidButton
                      theme={theme}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAction(`edit:${row.code}`);
                        setDetail(row);
                      }}
                    >
                      {previewText(locale, copy.edit)}
                    </LiquidButton>
                    <LiquidButton
                      theme={theme}
                      size="sm"
                      variant="destructive"
                      onClick={() => setAction(`delete:${row.code}`)}
                    >
                      {previewText(locale, copy.remove)}
                    </LiquidButton>
                  </div>
                ),
              },
            ]}
          />
          <LiquidPagination
            pagination={pagination}
            theme={theme}
            previousLabel={previewText(locale, copy.prev)}
            nextLabel={previewText(locale, copy.next)}
            summary={
              locale === "en"
                ? `${pagination.totalItems} rows · ${pagination.pageSize} / page`
                : `共 ${pagination.totalItems} 条，每页 ${pagination.pageSize} 条`
            }
          />
        </LiquidGlassCard>
      </div>
      <LiquidSheet
        theme={theme}
        scene={StageWash}
        container={portal}
        title={detail?.name ?? previewText(locale, copy.title)}
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
        trigger={null}
      >
        {detail ? (
          <>
            <h3 className="liquid-sheet-heading">{detail.name}</h3>
            <dl className="liquid-detail-list">
              <div>
                <dt>ID</dt>
                <dd>{detail.id}</dd>
              </div>
              <div>
                <dt>{previewText(locale, copy.code)}</dt>
                <dd>
                  <code>{detail.code}</code>
                </dd>
              </div>
              <div>
                <dt>{previewText(locale, copy.status)}</dt>
                <dd>
                  <LiquidPill theme={theme} tone={statusTone(detail.status)}>
                    {detail.status}
                  </LiquidPill>
                </dd>
              </div>
            </dl>
          </>
        ) : null}
      </LiquidSheet>
      <p className="ui-studio__value">{action}</p>
    </>
  );
}
