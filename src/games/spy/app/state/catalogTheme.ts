import type { Theme } from "../../domain/theme/types";
import type { CatalogTheme } from "../ports/themeRepository";

export function toGameTheme(catalogTheme: CatalogTheme): Theme {
  return {
    schemaVersion: catalogTheme.schemaVersion,
    id: catalogTheme.id,
    name: catalogTheme.name,
    description: catalogTheme.description,
    groups: catalogTheme.groups,
  };
}
