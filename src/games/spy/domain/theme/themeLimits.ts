export const THEME_LIMITS = {
  idLength: 64,
  themeNameLength: 80,
  descriptionLength: 200,
  groupCount: 20,
  groupNameLength: 80,
  itemsPerGroup: 15,
  itemLength: 80,
} as const;

export const MAX_THEME_ITEM_COUNT =
  THEME_LIMITS.groupCount * THEME_LIMITS.itemsPerGroup;
