import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  openIndex: number | null;
  photos: string[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function MapModal({
  openIndex,
  photos,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const isOpen = openIndex !== null && photos.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          open
          onClose={onClose}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Box
              sx={{
                position: "relative",
                maxWidth: "90vw",
                maxHeight: "90vh",
                outline: "none",
              }}
            >
              {/* ❌ Fermer */}
              <IconButton
                onClick={onClose}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "white",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                  zIndex: 2,
                }}
              >
                <CloseIcon />
              </IconButton>

              {/* ⬅️ Précédente */}
              <IconButton
                onClick={onPrev}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 10,
                  transform: "translateY(-50%)",
                  color: "white",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                  zIndex: 2,
                }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>

              {/* 🖼️ Image affichée */}
              <motion.img
                key={photos[openIndex!]}
                src={photos[openIndex!]}
                alt={`Photo ${openIndex! + 1}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  borderRadius: "10px",
                  boxShadow: "0 4px 30px rgba(0,0,0,0.6)",
                }}
              />

              {/* ➡️ Suivante */}
              <IconButton
                onClick={onNext}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 10,
                  transform: "translateY(-50%)",
                  color: "white",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                  zIndex: 2,
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
