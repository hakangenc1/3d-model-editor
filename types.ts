
export const ToolMode = {
  SELECT: 'select',
  PLACE_TEXT: 'place_text',
  PLACE_LOGO: 'place_logo',
} as const;

export type ToolMode = typeof ToolMode[keyof typeof ToolMode];

export interface DecalData {
  id: string;
  type: 'text' | 'logo';
  content: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  meshName?: string;
  color?: string;
  visible: boolean;
  mirror: boolean;
  opacity?: number;
  roughness?: number;
  metalness?: number;
}

export interface AppState {
  modelUrl: string | null;
  decals: DecalData[];
  history: { decals: DecalData[], selectedId: string | null }[];
  historyIndex: number;
  selectedDecalId: string | null;
  toolMode: ToolMode;
  currentText: string;
  currentLogoUrl: string;
  isSidebarOpen: boolean;
  isSidebarVisible: boolean;
  isReviewMode: boolean;
  modelScale: number;
  isLoading: boolean;
  environment: 'studio' | 'sunset' | 'warehouse';
  gridVisible: boolean;
  isRotating: boolean;
  wireframeMode: boolean;
}
