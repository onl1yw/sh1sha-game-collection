import { Cylinder } from "lucide-react";

import {
  GAME_MODULE_API_VERSION,
  defineGame,
} from "../../app/gameModule";
import { HAT_GAME_ID } from "./identity";

export const gameModule = defineGame({
  apiVersion: GAME_MODULE_API_VERSION,
  id: HAT_GAME_ID,
  title: "Шляпа",
  description: "Объясняйте один набор слов тремя способами",
  Icon: Cylinder,
  order: 40,
  load: () => import("./HatGame"),
});
