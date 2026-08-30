import { Settings } from "lucide-react";

import type { GameHostProps } from "../../app/gameModule";
import { AppShell } from "../../shared/ui/AppShell";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ScreenHeader } from "../../shared/ui/ScreenHeader";
import styles from "./__GAME_COMPONENT__Game.module.css";

export default function __GAME_COMPONENT__Game({
  onExit,
  onOpenSettings,
}: GameHostProps) {
  return (
    <AppShell ariaLabel={__GAME_TITLE_JSON__}>
      <ScreenHeader
        title={__GAME_TITLE_JSON__}
        description="Replace this scaffold with the first playable screen."
        backLabel="All games"
        onBack={onExit}
        trailingAction={(
          <Button
            aria-label="Open collection settings"
            variant="quiet"
            onClick={onOpenSettings}
          >
            <Settings aria-hidden="true" size={22} />
          </Button>
        )}
      />
      <Card className={styles.placeholder}>
        <p className={styles.lead}>Your game module is connected.</p>
        <p className={styles.note}>
          Add rules, state, screens, and tests inside this game's folder.
        </p>
      </Card>
    </AppShell>
  );
}
