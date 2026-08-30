export const SPY_GAME_ID = "spy" as const;
export const SPY_STORAGE_NAMESPACE = "spy-game" as const;
export const SPY_STORAGE_SCHEMA_VERSION = 1 as const;
export const SPY_SESSION_STORAGE_KEY =
  `${SPY_STORAGE_NAMESPACE}:session:v${SPY_STORAGE_SCHEMA_VERSION}`;
export const SPY_FAIRNESS_STORAGE_KEY =
  `${SPY_STORAGE_NAMESPACE}:fairness:v${SPY_STORAGE_SCHEMA_VERSION}`;
