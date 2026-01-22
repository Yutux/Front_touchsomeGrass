import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  files: File[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function FileList({ files, onRemove, disabled }: Props) {
  if (files.length === 0) return null;

  return (
    <Box sx={{ mt: 1 }}>
      {files.map((file, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 0.5,
            backgroundColor: "#f0f0f0",
            borderRadius: 1,
            mb: 0.5,
          }}
        >
          <Typography variant="caption" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
            📎 {file.name}
          </Typography>
          <IconButton size="small" onClick={() => onRemove(idx)} disabled={disabled}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}
