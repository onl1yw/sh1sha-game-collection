import { useEffect, useRef, useState } from "react";
import { HatGlasses } from "lucide-react";

import { AppShell } from "../../../../shared/ui/AppShell";
import { Button } from "../../../../shared/ui/Button";
import { GameExitAction } from "../../../../shared/ui/GameExitAction";
import { ScreenHeader } from "../../../../shared/ui/ScreenHeader";
import { SettingsButton } from "../../../../shared/ui/SettingsButton";
import styles from "./RoleRevealScreen.module.css";

export type RevealedRole =
  | { kind: "spy" }
  | { kind: "word"; word: string };

interface CommonProps {
  playerName: string;
  themeName: string;
  onReveal: () => void;
  onHide: () => void;
  onCancel: () => void;
  onOpenSettings: () => void;
}

export type RoleRevealScreenProps = CommonProps & (
  | { isRevealed: false; role?: never }
  | { isRevealed: true; role: RevealedRole }
);

const FLIP_LOCK_MS = 460;
type FocusTarget = "card" | "next";

export function RoleRevealScreen(props: RoleRevealScreenProps) {
  const cardButtonRef = useRef<HTMLButtonElement>(null);
  const flipLock = useRef(false);
  const focusTarget = useRef<FocusTarget | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const unlockTimer = useRef<number | null>(null);
  const [isFlipLocked, setIsFlipLocked] = useState(false);
  const isSpy = props.isRevealed && props.role.kind === "spy";
  const wordClassName = props.isRevealed && props.role.kind === "word"
    ? getWordClassName(props.role.word)
    : styles.word;

  useEffect(() => () => {
    if (unlockTimer.current !== null) {
      window.clearTimeout(unlockTimer.current);
    }
  }, []);

  useEffect(() => {
    if (isFlipLocked || focusTarget.current === null) return;
    const target = focusTarget.current;
    focusTarget.current = null;
    if (target === "next") nextButtonRef.current?.focus();
    else cardButtonRef.current?.focus();
  }, [isFlipLocked, props.isRevealed]);

  const lockFlip = (target: FocusTarget): boolean => {
    if (flipLock.current) return false;
    flipLock.current = true;
    focusTarget.current = target;
    setIsFlipLocked(true);
    unlockTimer.current = window.setTimeout(() => {
      flipLock.current = false;
      setIsFlipLocked(false);
      unlockTimer.current = null;
    }, getFlipLockMs());
    return true;
  };

  const handleCardClick = () => {
    if (props.isRevealed || !lockFlip("next")) return;
    props.onReveal();
  };

  const handleNext = () => {
    if (!props.isRevealed || !lockFlip("card")) return;
    props.onHide();
  };

  return (
    <AppShell
      ariaLabel="Раздача ролей"
      actions={
        <Button
          ref={nextButtonRef}
          fullWidth
          data-testid="role-primary-action"
          disabled={!props.isRevealed || isFlipLocked}
          onClick={handleNext}
        >
          Следующий игрок
        </Button>
      }
    >
      <ScreenHeader
        eyebrow={props.themeName}
        title={props.playerName}
        leadingAction={(
          <GameExitAction stage="deal" onConfirm={props.onCancel} />
        )}
        trailingAction={<SettingsButton onClick={props.onOpenSettings} />}
      />

      <div className={styles.scene}>
        <div className={styles.card}>
          <div
            className={styles.flipper}
            data-revealed={props.isRevealed}
            data-testid="role-card-flipper"
          >
            <button
              ref={cardButtonRef}
              className={`${styles.face} ${styles.front}`}
              aria-hidden={props.isRevealed}
              data-testid="role-card-action"
              disabled={props.isRevealed || isFlipLocked}
              onClick={handleCardClick}
              tabIndex={props.isRevealed ? -1 : 0}
              type="button"
            >
              <span className={styles.label}>Нажмите на карточку</span>
              <span className={styles.frontTitle}>Посмотрите свою роль</span>
            </button>

            <div
              className={`${styles.face} ${styles.back} ${isSpy ? styles.spyBack : ""}`}
              aria-hidden={!props.isRevealed}
              aria-atomic="true"
              aria-live="polite"
              role="status"
            >
              {props.isRevealed ? (
                <>
                  {isSpy ? (
                    <HatGlasses
                      aria-hidden="true"
                      className={styles.spyIcon}
                      data-testid="spy-role-icon"
                      focusable="false"
                      size={48}
                      strokeWidth={1.8}
                    />
                  ) : null}
                  <span className={styles.label}>
                    {isSpy ? "Ваша роль" : "Ваш объект"}
                  </span>
                  <span
                    className={isSpy ? styles.spy : wordClassName}
                    lang="ru"
                  >
                    {props.role.kind === "spy" ? "Вы — шпион" : props.role.word}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function getFlipLockMs(): number {
  const reducesMotion = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reducesMotion ? 0 : FLIP_LOCK_MS;
}

function getWordClassName(word: string): string {
  const longestPart = Math.max(
    ...word.trim().split(/\s+/u).map((part) => part.length),
  );
  const densityClass = longestPart > 14 || word.length > 34
    ? styles.wordDense
    : longestPart > 9 || word.length > 20
      ? styles.wordCompact
      : undefined;

  return [styles.word, densityClass].filter(Boolean).join(" ");
}
