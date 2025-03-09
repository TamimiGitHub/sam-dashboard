// Constants for the visualizer
export const MESSAGE_COLORS = {
  'Registration Message': '#3b82f6',
  'Gateway Message': 'rgba(59, 246, 96, 0.93)',
  'Orchestrator Response': 'rgba(59, 246, 96, 0.93)',
  'Orchestrator Request': 'rgb(246, 59, 59)',
  'Agent Response': 'rgb(246, 59, 59)'
} as const;

export const STORAGE_KEYS = {
  AGENT: 'agent_positions',
  BROKER: 'broker_position',
  ORCHESTRATOR: 'orchestrator_position',
  GATEWAY: 'gateway_positions'
} as const;

export const ICON_BOX_SIZE = 64;
export const ANIMATION_DURATION = 800;