import { Puzzle } from "lucide-react";

import {
  GAME_MODULE_API_VERSION,
  defineGame,
} from "../../app/gameModule";

export const gameModule = defineGame({
  apiVersion: GAME_MODULE_API_VERSION,
  id: __GAME_ID_JSON__,
  title: __GAME_TITLE_JSON__,
  description: __GAME_DESCRIPTION_JSON__,
  Icon: Puzzle,
  load: () => import("./__GAME_COMPONENT__Game"),
});
