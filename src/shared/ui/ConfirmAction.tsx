import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

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
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmationRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreTriggerFocus = useRef(false);
  const confirmationId = useId();
  const promptId = `${confirmationId}-prompt`;

  useLayoutEffect(() => {
    if (isConfirming) {
      cancelRef.current?.focus();
      const confirmation = confirmationRef.current;
      return confirmation
        ? lockDocumentInteraction(confirmation)
        : undefined;
    } else if (restoreTriggerFocus.current) {
      if (triggerRef.current?.isConnected) {
        triggerRef.current.focus({ preventScroll: true });
      }
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
    restoreTriggerFocus.current = true;
    setIsConfirming(false);
    setStatusMessage(successMessage ?? null);
    onConfirm();
  };

  const confirmation = isConfirming ? (
    <section
      ref={confirmationRef}
      className={styles.confirmation}
      id={confirmationId}
      aria-labelledby={promptId}
      aria-modal="true"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) cancelConfirmation();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          cancelConfirmation();
        } else if (event.key === "Tab") {
          trapDialogFocus(event, dialogRef.current);
        }
      }}
      onKeyUp={(event) => event.stopPropagation()}
      role="dialog"
    >
      <div ref={dialogRef} className={styles.dialog}>
        <p className={styles.prompt} id={promptId}>
          {prompt}
        </p>
        <div className={styles.controls}>
          <Button
            fullWidth
            variant="danger"
            aria-describedby={promptId}
            onClick={confirm}
          >
            {confirmLabel}
          </Button>
          <Button
            ref={cancelRef}
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
  ) : null;

  const confirmationLayer = confirmation && typeof document !== "undefined"
    ? createPortal(confirmation, document.body)
    : confirmation;

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

      {confirmationLayer}

      {statusMessage ? (
        <p className={styles.status} role="status">
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function trapDialogFocus(
  event: KeyboardEvent<HTMLElement>,
  dialog: HTMLElement | null,
): void {
  if (!dialog) return;
  const focusable = Array.from(
    dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) {
    event.preventDefault();
    dialog.focus();
    return;
  }

  const active = document.activeElement;
  if (event.shiftKey && (active === first || !dialog.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
    event.preventDefault();
    first.focus();
  }
}

function lockDocumentInteraction(confirmation: HTMLElement): () => void {
  const lockedSiblings = Array.from(document.body.children)
    .filter((element): element is HTMLElement => (
      element instanceof HTMLElement && element !== confirmation
    ))
    .map((element) => ({
      element,
      hadInert: element.hasAttribute("inert"),
      ariaHidden: element.getAttribute("aria-hidden"),
    }));
  for (const { element } of lockedSiblings) {
    element.setAttribute("inert", "");
    element.setAttribute("aria-hidden", "true");
  }

  const rootStyle = document.documentElement.style;
  const bodyStyle = document.body.style;
  const previousStyles = {
    rootOverflow: rootStyle.overflow,
    bodyOverflow: bodyStyle.overflow,
    bodyPosition: bodyStyle.position,
    bodyTop: bodyStyle.top,
    bodyLeft: bodyStyle.left,
    bodyWidth: bodyStyle.width,
  };
  const scroll = { x: window.scrollX, y: window.scrollY };
  rootStyle.overflow = "hidden";
  bodyStyle.overflow = "hidden";
  bodyStyle.position = "fixed";
  bodyStyle.top = `-${scroll.y}px`;
  bodyStyle.left = `-${scroll.x}px`;
  bodyStyle.width = "100%";

  return () => {
    for (const { element, hadInert, ariaHidden } of lockedSiblings) {
      element.toggleAttribute("inert", hadInert);
      if (ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", ariaHidden);
    }
    rootStyle.overflow = previousStyles.rootOverflow;
    bodyStyle.overflow = previousStyles.bodyOverflow;
    bodyStyle.position = previousStyles.bodyPosition;
    bodyStyle.top = previousStyles.bodyTop;
    bodyStyle.left = previousStyles.bodyLeft;
    bodyStyle.width = previousStyles.bodyWidth;
    if (window.scrollX !== scroll.x || window.scrollY !== scroll.y) {
      window.scrollTo(scroll.x, scroll.y);
    }
  };
}
