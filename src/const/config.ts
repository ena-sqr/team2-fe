/** @TODO via Env */
export const API_URL = "https://8131ef2085ef.ngrok-free.app";

export const DEFAULT_DETECTOR = "retinaface";
export const DEFAULT_MODEL = "VGG-Face";
export const DEFAULT_METRIC = "cosine";
export const DEFAULT_THRESHOLD = "0.68";

export const MODELS = [
  "VGG-Face",
  "Facenet",
  "Facenet512",
  "OpenFace",
  "DeepFace",
  "DeepID",
  "ArcFace",
  "Dlib",
  "SFace",
  "GhostFaceNet",
  "Buffalo_L",
];

export const TABS = [
  { key: "match", label: "FACE MATCHING" },
  { key: "liveness", label: "LIVENESS" },
  { key: "analyze", label: "ANALYZE" },
] as const;
