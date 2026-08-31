import { LogOut } from "lucide-react";

import { ConfirmAction } from "./ConfirmAction";

export interface GameExitActionProps {
  onConfirm: () => void;
  stage?: "deal" | "game";
}

export function GameExitAction({
  onConfirm,
  stage = "game",
}: GameExitActionProps) {
  const isDeal = stage === "deal";
  return (
    <ConfirmAction
      triggerLabel={(
        <>
          <LogOut aria-hidden="true" focusable="false" size={20} strokeWidth={2} />
          <span>{isDeal ? "Прервать раздачу" : "Прервать игру"}</span>
        </>
      )}
      prompt={isDeal
        ? "Текущая раздача будет отменена. Уже показанные роли нельзя будет восстановить."
        : "Текущая партия завершится. Вернуться к ней не получится."}
      confirmLabel={isDeal ? "Да, прервать раздачу" : "Да, прервать игру"}
      cancelLabel={isDeal ? "Продолжить раздачу" : "Продолжить игру"}
      triggerFullWidth={false}
      triggerVariant="quiet"
      onConfirm={onConfirm}
    />
  );
}
