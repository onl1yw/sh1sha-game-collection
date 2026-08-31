import { MessagesSquare } from "lucide-react";

import {
  GAME_MODULE_API_VERSION,
  defineGame,
} from "../../app/gameModule";
import { ALIAS_GAME_ID } from "./identity";

export const gameModule = defineGame({
  apiVersion: GAME_MODULE_API_VERSION,
  id: ALIAS_GAME_ID,
  title: "Alias",
  description: "Объясняйте слова своей команде",
  Icon: MessagesSquare,
  iconTone: "danger",
  order: 30,
  load: () => import("./AliasGame"),
});
