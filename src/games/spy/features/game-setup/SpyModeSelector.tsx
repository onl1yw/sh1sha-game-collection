import { ChoiceGroup } from "../../../../shared/ui/ChoiceGroup";

export type SpyModeValue = "classic" | "decoy";

export interface SpyModeSelectorProps {
  value: SpyModeValue;
  disabled?: boolean;
  onChange: (mode: SpyModeValue) => void;
}

const modes: ReadonlyArray<{
  value: SpyModeValue;
  title: string;
  description: string;
}> = [
  {
    value: "classic",
    title: "Шпион знает свою роль",
    description: "Шпион увидит только сообщение о своей роли и не получит объект.",
  },
  {
    value: "decoy",
    title: "Шпион получает другое слово",
    description: "Все увидят слово. Шпион не узнает, что его объект отличается.",
  },
];

export function SpyModeSelector({
  value,
  disabled = false,
  onChange,
}: SpyModeSelectorProps) {
  return (
    <ChoiceGroup
      legend="Режим шпиона"
      value={value}
      options={modes}
      disabled={disabled}
      onChange={onChange}
    />
  );
}
