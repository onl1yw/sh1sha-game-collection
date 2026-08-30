import { HatGlasses } from "lucide-react";

import {
  GAME_MODULE_API_VERSION,
  defineGame,
} from "../../app/gameModule";
import { readSpyCatalogState } from "./catalogState";
import { SPY_GAME_ID } from "./identity";

export const gameModule = defineGame({
  apiVersion: GAME_MODULE_API_VERSION,
  id: SPY_GAME_ID,
  title: "Шпион",
  description: "Найдите шпиона в компании",
  continueDescription: "Продолжить текущую игру",
  Icon: HatGlasses,
  iconTone: "danger",
  order: 10,
  getCatalogState: readSpyCatalogState,
  load: () => import("./SpyGame"),
});
