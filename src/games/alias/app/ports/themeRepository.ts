import type { AliasThemeLoadResult } from "../../domain/theme";

export interface AliasThemeRepository {
  loadThemes(signal?: AbortSignal): Promise<AliasThemeLoadResult>;
}
