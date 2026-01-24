/**
 * ⚙️ SpeedDialActions.tsx
 * Bouton d’action flottant (MUI SpeedDial) pour recalculer, réinitialiser ou enregistrer un parcours.
 */

import { SpeedDial, SpeedDialAction } from "@mui/material";
import RouteIcon from "@mui/icons-material/AltRoute";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveIcon from "@mui/icons-material/Save";

interface Props {
  sendCreate: () => void;
  onReset?: () => void;
  onRecalc?: () => void;
}

export default function SpeedDialActions({ sendCreate, onReset, onRecalc }: Props) {
  const actions = [
    {
      icon: <RouteIcon />,
      name: "Recalculer",
      onClick: onRecalc,
    },
    {
      icon: <ReplayIcon />,
      name: "Réinitialiser",
      onClick: onReset,
    },
    {
      icon: <SaveIcon />,
      name: "Enregistrer",
      onClick: sendCreate,
    },
  ];

  return (
    <SpeedDial
      ariaLabel="Actions de carte"
      icon={<RouteIcon />}
      direction="up"
      sx={{
        position: "absolute",
        bottom: 8,
        right: 8,
      }}
    >
      {actions.map(
        (action) =>
          action.onClick && (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
            />
          )
      )}
    </SpeedDial>
  );
}
