import type { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

import styles from "./RoleRevealCard.module.css";

export interface RoleRevealCardProps {
  revealed: boolean;
  disabled?: boolean;
  frontLabel: string;
  frontTitle: string;
  backLabel: string;
  backTitle: string;
  backDescription?: string | undefined;
  backTone: "accent" | "danger" | "neutral";
  Icon: LucideIcon;
  onReveal: () => void;
}

export const RoleRevealCard = forwardRef<HTMLButtonElement, RoleRevealCardProps>(
  function RoleRevealCard(props, ref) {
    return (
      <div className={styles.scene}>
        <div className={styles.card}>
          <div className={styles.flipper} data-revealed={props.revealed}>
            <button
              ref={ref}
              className={`${styles.face} ${styles.front}`}
              aria-hidden={props.revealed}
              disabled={props.revealed || props.disabled}
              tabIndex={props.revealed ? -1 : 0}
              type="button"
              onClick={props.onReveal}
            >
              <span className={styles.label}>{props.frontLabel}</span>
              <span className={styles.title}>{props.frontTitle}</span>
            </button>
            <div
              className={`${styles.face} ${styles.back}`}
              data-tone={props.backTone}
              aria-hidden={!props.revealed}
              aria-live="polite"
              role="status"
            >
              {props.revealed ? (
                <>
                  <props.Icon aria-hidden="true" focusable="false" size={48} strokeWidth={1.8} />
                  <span className={styles.label}>{props.backLabel}</span>
                  <strong className={styles.title}>{props.backTitle}</strong>
                  {props.backDescription ? <p>{props.backDescription}</p> : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
