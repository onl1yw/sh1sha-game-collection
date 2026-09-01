import type { HatThemeLoadResult } from "../../domain/theme";

export interface HatThemeRepository {
  loadThemes(signal?: AbortSignal): Promise<HatThemeLoadResult>;
}
