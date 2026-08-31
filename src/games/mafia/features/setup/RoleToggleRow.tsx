import type { LucideIcon } from "lucide-react";

import { Switch } from "../../../../shared/ui/Switch";
import styles from "./RoleToggleRow.module.css";

export interface RoleToggleRowProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  tone?: "accent" | "danger" | "neutral";
  onChange: (enabled: boolean) => void;
}

export function RoleToggleRow({
  Icon,
  title,
  description,
  enabled,
  disabled = false,
  tone = "accent",
  onChange,
}: RoleToggleRowProps) {
  return (
    <div className={styles.row} data-disabled={disabled}>
      <Icon
        aria-hidden="true"
        className={styles.icon}
        data-tone={tone}
        focusable="false"
        size={26}
        strokeWidth={1.8}
      />
      <span className={styles.copy}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
      </span>
      <Switch
        checked={enabled}
        disabled={disabled}
        label={`${enabled ? "Выключить" : "Включить"}: ${title}`}
        onCheckedChange={onChange}
      />
    </div>
  );
}
