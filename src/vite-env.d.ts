/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  // Ajoutez d'autres variables ici
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}