import { Cigarette } from "lucide-react";

import {
  GAME_MODULE_API_VERSION,
  defineGame,
} from "../../app/gameModule";
import { MAFIA_GAME_ID } from "./identity";

export const gameModule = defineGame({
  apiVersion: GAME_MODULE_API_VERSION,
  id: MAFIA_GAME_ID,
  title: "Мафия",
  description: "Найдите мафию, пока город ещё не уснул",
  Icon: Cigarette,
  iconTone: "danger",
  order: 20,
  load: () => import("./MafiaGame"),
});
