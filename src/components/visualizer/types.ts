export interface DragState {
  type: 'agent' | 'broker' | 'orchestrator' | 'gateway';
  agentName?: string;
  gatewayId?: string;
  initialX: number;
  initialY: number;
  currentX: number;
  currentY: number;
  mouseOffsetX: number;
  mouseOffsetY: number;
}

export interface Position {
  x: number;
  y: number;
}