import type { Theme } from "../../domain/theme/types";

export type ThemeLoadErrorCode =
  | "network"
  | "http"
  | "invalid-json"
  | "invalid-manifest"
  | "invalid-theme";

export interface ThemeLoadError {
  code: ThemeLoadErrorCode;
  message: string;
  themeId?: string;
}

export interface CatalogTheme extends Theme {
  sensitive: boolean;
}

export interface ThemeCatalogResult {
  themes: CatalogTheme[];
  errors: ThemeLoadError[];
}

export interface ThemeRepository {
  loadThemes(signal?: AbortSignal): Promise<ThemeCatalogResult>;
}
