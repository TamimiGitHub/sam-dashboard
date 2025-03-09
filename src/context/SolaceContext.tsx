import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import type { 
  SolaceSession, 
  Agent, 
  RegistrationMessage, 
  StimulusGateway,
  StimulusOrchestrator,
  StreamingResponse,
  ResponseComplete,
  ActionRequest,
  ActionResponse,
  LLMServiceRequest,
  LLMServiceResponse,
  Gateway
} from '../types/solace';

interface SolaceContextType {
  session: any;
  setSession: (session: any) => void;
  namespace: string;
  setNamespace: (namespace: string) => void;
  agents: Agent[];
  setAgents: Dispatch<SetStateAction<Agent[]>>;
  registrationMessages: RegistrationMessage[];
  addAgentRegistrationMessage: (message: RegistrationMessage) => void;
  stimuli: (StimulusGateway | StimulusOrchestrator)[];
  setStimuli: Dispatch<SetStateAction<(StimulusGateway | StimulusOrchestrator)[]>>;
  gateways: Gateway[];
  setGateways: Dispatch<SetStateAction<Gateway[]>>;
  streamingResponses: StreamingResponse[];
  setStreamingResponses: Dispatch<SetStateAction<StreamingResponse[]>>;
  responseCompletes: ResponseComplete[];
  setResponseCompletes: Dispatch<SetStateAction<ResponseComplete[]>>;
  actionRequests: ActionRequest[];
  setActionRequests: Dispatch<SetStateAction<ActionRequest[]>>;
  actionResponses: ActionResponse[];
  setActionResponses: Dispatch<SetStateAction<ActionResponse[]>>;
  llmRequests: LLMServiceRequest[];
  setLLMRequests: Dispatch<SetStateAction<LLMServiceRequest[]>>;
  llmResponses: LLMServiceResponse[];
  setLLMResponses: Dispatch<SetStateAction<LLMServiceResponse[]>>;
}

const SolaceContext = createContext<SolaceContextType | undefined>(undefined);

export function SolaceProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [namespace, setNamespace] = useState<string>('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [registrationMessages, setRegistrationMessages] = useState<RegistrationMessage[]>([]);
  const [stimuli, setStimuli] = useState<(StimulusGateway | StimulusOrchestrator)[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [streamingResponses, setStreamingResponses] = useState<StreamingResponse[]>([]);
  const [responseCompletes, setResponseCompletes] = useState<ResponseComplete[]>([]);
  const [actionRequests, setActionRequests] = useState<ActionRequest[]>([]);
  const [actionResponses, setActionResponses] = useState<ActionResponse[]>([]);
  const [llmRequests, setLLMRequests] = useState<LLMServiceRequest[]>([]);
  const [llmResponses, setLLMResponses] = useState<LLMServiceResponse[]>([]);

  const addAgentRegistrationMessage = (message: RegistrationMessage) => {
    setRegistrationMessages(prev => [...prev, { ...message, timestamp: Date.now() }]);
  };

  const value: SolaceContextType = {
    session,
    setSession,
    namespace,
    setNamespace,
    agents,
    setAgents,
    registrationMessages,
    addAgentRegistrationMessage,
    stimuli,
    setStimuli,
    gateways,
    setGateways,
    streamingResponses,
    setStreamingResponses,
    responseCompletes,
    setResponseCompletes,
    actionRequests,
    setActionRequests,
    actionResponses,
    setActionResponses,
    llmRequests,
    setLLMRequests,
    llmResponses,
    setLLMResponses
  };

  return (
    <SolaceContext.Provider value={value}>
      {children}
    </SolaceContext.Provider>
  );
}

export function useSolace() {
  const context = useContext(SolaceContext);
  if (context === undefined) {
    throw new Error('useSolace must be used within a SolaceProvider');
  }
  return context;
}