import { Dispatch, SetStateAction } from 'react';
import type { Position } from '../components/visualizer/types';

export interface Gateway {
  type: string;
  name: string;
}

export interface SolaceSession {
  session: any;
  setSession: (session: any) => void;
  namespace: string;
  setNamespace: (namespace: string) => void;
  agents: Agent[];
  setAgents: Dispatch<SetStateAction<Agent[]>>;
  stimuli: (StimulusGateway | StimulusOrchestrator)[];
  setStimuli: Dispatch<SetStateAction<(StimulusGateway | StimulusOrchestrator)[]>>;
  gateways: Gateway[];
  setGateways: Dispatch<SetStateAction<Gateway[]>>;
}

export interface Agent {
  agent_name: string;
  description: string;
  always_open: boolean;
  actions: any[];
  position?: Position;
}

export interface BrokerConfig {
  url: string;
  vpn: string;
  username: string;
  password: string;
  namespace: string;
}

export interface RegistrationMessage {
  agent_name: string;
  timestamp?: number;
  topic?: string;
}

export interface MessageData {
  agent_name?: string;
  gateway_name?: string;
  text?: string;
  topic: string;
  data?: any;
}

export type MessageType = 
  | 'Registration Message'
  | 'Gateway Message'
  | 'Orchestrator Response'
  | 'Orchestrator Request'
  | 'Agent Response';

export interface MessageBall {
  id: string;
  type: MessageType;
  startTime: number;
  color: string;
  data: MessageData;
  startPos: Position;
  endPos: Position;
  nextPos?: Position;
}

export interface StimulusHistory {
  role: 'user' | 'assistant';
  content: string;
}

export interface StimulusUserInfo {
  identity: string;
}

export interface StimulusInterfaceProperties {
  user_id: string;
  user_email: string;
  timestamp: number;
}

export interface StimulusGateway {
  id: string;
  type: 'gateway';
  topic?: string;
  timestamp: number;
  data: {
    text: string;
    files: any[];
    interface_properties: StimulusInterfaceProperties;
    history: StimulusHistory[];
    user_info: StimulusUserInfo;
    errors: string[];
  };
}

export interface StimulusOrchestrator {
  id: string;
  type: 'orchestrator';
  topic?: string;
  timestamp: number;
  data: {
    text: string;
    files: any[];
    identity: string;
    channel: string | null;
    thread_ts: string | null;
    action_response_reinvoke: boolean;
  };
}

export interface StreamingResponse {
  streaming: boolean;
  text: string;
  first_chunk: boolean;
  last_chunk: boolean;
  uuid: string;
  chunk: string;
  topic?: string;
}

export interface ResponseComplete {
  response_complete: boolean;
  streaming: boolean;
}

export interface ActionRequest {
  agent_name: string;
  action_name: string;
  action_params: Record<string, string>;
  action_idx: number;
  action_list_id: string;
  topic?: string;
}

export interface ActionResponse {
  message: string;
  files?: Array<{
    data: string;
    name: string;
    file_size: number;
    mime_type: string;
  }>;
  action_list_id: string;
  action_idx: number;
  action_name: string;
  action_params: Record<string, string>;
  topic?: string;
}

export interface LLMServiceRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  stream: boolean;
}

export interface LLMServiceResponse {
  chunk: string;
  content: string;
  response_uuid: string;
  first_chunk: boolean;
  last_chunk: boolean;
  streaming: boolean;
}