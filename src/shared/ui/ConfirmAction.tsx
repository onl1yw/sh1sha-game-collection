import {
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { Button, type ButtonVariant } from "./Button";
import styles from "./ConfirmAction.module.css";

export interface ConfirmActionProps {
  triggerLabel: ReactNode;
  prompt: string;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  successMessage?: string;
  triggerFullWidth?: boolean;
  triggerVariant?: ButtonVariant;
}

export function ConfirmAction({
  triggerLabel,
  prompt,
  confirmLabel,
  onConfirm,
  cancelLabel = "Отмена",
  successMessage,
  triggerFullWidth = true,
  triggerVariant = "danger",
}: ConfirmActionProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const restoreTriggerFocus = useRef(false);
  const confirmationId = useId();
  const promptId = `${confirmationId}-prompt`;

  useEffect(() => {
    if (isConfirming) {
      confirmRef.current?.focus();
    } else if (restoreTriggerFocus.current) {
      triggerRef.current?.focus();
      restoreTriggerFocus.current = false;
    }
  }, [isConfirming]);

  const openConfirmation = () => {
    setStatusMessage(null);
    setIsConfirming(true);
  };

  const cancelConfirmation = () => {
    restoreTriggerFocus.current = true;
    setIsConfirming(false);
  };

  const confirm = () => {
    onConfirm();
    restoreTriggerFocus.current = true;
    setIsConfirming(false);
    setStatusMessage(successMessage ?? null);
  };

  return (
    <div
      className={`${styles.root} ${triggerFullWidth ? "" : styles.compact}`}
    >
      <Button
        ref={triggerRef}
        fullWidth={triggerFullWidth}
        variant={triggerVariant}
        aria-controls={isConfirming ? confirmationId : undefined}
        aria-expanded={isConfirming}
        onClick={openConfirmation}
      >
        {triggerLabel}
      </Button>

      {isConfirming ? (
        <section
          className={styles.confirmation}
          id={confirmationId}
          aria-labelledby={promptId}
          aria-modal="true"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              cancelConfirmation();
            }
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cancelConfirmation();
          }}
          role="dialog"
        >
          <div className={styles.dialog}>
            <p className={styles.prompt} id={promptId}>
              {prompt}
            </p>
            <div className={styles.controls}>
              <Button
                ref={confirmRef}
                fullWidth
                variant="danger"
                aria-describedby={promptId}
                onClick={confirm}
              >
                {confirmLabel}
              </Button>
              <Button
                fullWidth
                variant="secondary"
                aria-describedby={promptId}
                onClick={cancelConfirmation}
              >
                {cancelLabel}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {statusMessage ? (
        <p className={styles.status} role="status">
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}
