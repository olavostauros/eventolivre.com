/* One message with a status tone and an optional action. Colour is never
   the only signal: the text says what happened. */

import type { ReactNode } from "react";
import { Button, Text } from "../dsx.ts";

export type NoticeTone = "info" | "warning" | "danger";

export interface NoticeProps {
  readonly tone: NoticeTone;
  readonly children: ReactNode;
  readonly action?: string;
  readonly onAction?: () => void;
}

const toneClasses: Readonly<Record<NoticeTone, string>> = {
  info: "border-status-info-border bg-status-info-bg",
  warning: "border-status-warning-border bg-status-warning-bg",
  danger: "border-status-danger-border bg-status-danger-bg",
};

export function Notice({ tone, children, action, onAction }: NoticeProps) {
  return (
    <div
      role={tone === "info" ? "status" : "alert"}
      className={`flex flex-col gap-stack-md rounded-container border p-inset-md ${toneClasses[tone]}`}
    >
      <Text variant="body" tone={tone}>
        {children}
      </Text>
      {action && onAction && (
        <div>
          <Button variant="secondary" size="sm" onClick={onAction}>
            {action}
          </Button>
        </div>
      )}
    </div>
  );
}
