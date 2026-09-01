import { TeamNamesFieldset } from "../../../../shared/ui/TeamNamesFieldset";
import type { AliasTeam } from "../../domain/types";

export interface TeamEditorProps {
  teams: readonly AliasTeam[];
  onRename: (teamId: string, name: string) => void;
}

export function TeamEditor(props: TeamEditorProps) {
  return (
    <TeamNamesFieldset
      teams={props.teams}
      onRename={props.onRename}
    />
  );
}
