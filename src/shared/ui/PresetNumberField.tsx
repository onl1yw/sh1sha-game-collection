import { Button } from "./Button";
import { NumberField } from "./NumberField";
import styles from "./PresetNumberField.module.css";

export interface NumberPreset {
  value: number;
  label: string;
}

export interface PresetNumberFieldProps {
  label: string;
  value: number;
  presets: readonly NumberPreset[];
  min: number;
  max: number;
  customLabel: string;
  customPlaceholder?: string;
  suffix?: string;
  onChange: (value: number) => void;
}

export function PresetNumberField({
  label,
  value,
  presets,
  min,
  max,
  customLabel,
  customPlaceholder,
  suffix,
  onChange,
}: PresetNumberFieldProps) {
  const usesPreset = presets.some((preset) => preset.value === value);
  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>{label}</legend>
      {presets.map((preset) => {
        const unavailable = preset.value < min || preset.value > max;
        return (
          <Button
            key={preset.value}
            variant="secondary"
            aria-pressed={value === preset.value}
            disabled={unavailable}
            onClick={() => onChange(preset.value)}
          >
            {preset.label}
          </Button>
        );
      })}
      <NumberField
        compact
        label={customLabel}
        value={value}
        min={min}
        max={max}
        {...(customPlaceholder === undefined ? {} : { placeholder: customPlaceholder })}
        {...(suffix === undefined ? {} : { suffix })}
        showValue={!usesPreset}
        selected={!usesPreset}
        onChange={onChange}
      />
    </fieldset>
  );
}
