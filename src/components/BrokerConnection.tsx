import { useState, useEffect } from 'react';
import { useSolace } from '../context/SolaceContext';
import { ChevronDown } from 'lucide-react';
import type { 
  BrokerConfig, 
  StimulusGateway, 
  StimulusOrchestrator,
  StreamingResponse,
  ResponseComplete,
  ActionRequest,
  ActionResponse,
  LLMServiceRequest,
  LLMServiceResponse
} from '../types/solace';
import solace from 'solclientjs';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  Collapse,
  Stack,
} from '@mui/material';

const factoryProps = new solace.SolclientFactoryProperties();
factoryProps.profile = solace.SolclientFactoryProfiles.version10;
solace.SolclientFactory.init(factoryProps);
solace.SolclientFactory.setLogLevel(solace.LogLevel.WARN);

const defaultConfig: BrokerConfig = {
  url: 'ws://localhost:8008',
  vpn: 'default',
  username: 'default',
  password: 'default',
  namespace: 'demo'
};

const formatWsUrl = (url: string) => {
  if (url.startsWith('ws://localhost')) {
    return url.replace('ws://localhost', 'ws://localhost');
  }
  return url;
};

const STORAGE_KEY = 'broker_config';

const loadStoredConfig = (): BrokerConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading stored config:', err);
  }
  return defaultConfig;
};

const saveConfig = (config: BrokerConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving config:', err);
  }
};

export default function BrokerConnection() {
  const { 
    setSession, 
    setNamespace, 
    setAgents, 
    addAgentRegistrationMessage, 
    setStimuli,
    setGateways,
    setStreamingResponses,
    setResponseCompletes,
    setActionRequests,
    setActionResponses,
    setLLMRequests,
    setLLMResponses
  } = useSolace();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [config, setConfig] = useState<BrokerConfig>(loadStoredConfig());

  const topics = {
    agentRegistration: `${config.namespace}/solace-agent-mesh/v1/register/agent`,
    stimulusGateway: `${config.namespace}/solace-agent-mesh/v1/stimulus/gateway`,
    stimulusOrchestrator: `${config.namespace}/solace-agent-mesh/v1/stimulus/orchestrator`,
    streamingResponse: `${config.namespace}/solace-agent-mesh/v1/streamingResponse`,
    responseComplete: `${config.namespace}/solace-agent-mesh/v1/responseComplete`,
    actionRequest: `${config.namespace}/solace-agent-mesh/v1/actionRequest`,
    actionResponse: `${config.namespace}/solace-agent-mesh/v1/actionResponse`,
    llmServiceRequest: `${config.namespace}/solace-agent-mesh/v1/llm-service/request`,
    llmServiceResponse: `${config.namespace}/solace-agent-mesh/v1/llm-service/response`
  };

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const sessionProperties = {
        url: formatWsUrl(config.url),
        vpnName: config.vpn,
        userName: config.username,
        password: config.password,
        connectRetries: 3,
        reconnectRetries: 3,
        connectTimeoutInMsecs: 5000,
        reconnectRetryWaitInMsecs: 1000,
      };

      console.log('Connecting with properties:', sessionProperties);

      const session = solace.SolclientFactory.createSession(sessionProperties);

      session.on(solace.SessionEventCode.UP_NOTICE, () => {
        console.log('Connected to Solace message router.');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        setSession(session);
        setNamespace(config.namespace);
        setIsExpanded(false);

        Object.values(topics).forEach(topic => {
          try {
            const topicWithWildcard = `${topic}/>`;
            session.subscribe(
              solace.SolclientFactory.createTopicDestination(topicWithWildcard),
              true,
              topicWithWildcard,
              10000
            );
            console.log('Subscribed to topic:', topicWithWildcard);
          } catch (err) {
            console.error('Error subscribing to topic:', err);
          }
        });
      });

      session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (event) => {
        console.error('Connection failed:', event.infoStr);
        setError(`Connection failed: ${event.infoStr}`);
        setIsConnecting(false);
        setIsConnected(false);
      });

      session.on(solace.SessionEventCode.DISCONNECTED, () => {
        console.log('Disconnected from Solace message router.');
        setIsConnected(false);
        setSession(null);
      });

      session.on(solace.SessionEventCode.SUBSCRIPTION_ERROR, (event) => {
        console.error('Subscription error:', event.infoStr);
        setError(`Subscription error: ${event.infoStr}`);
      });

      session.on(solace.SessionEventCode.MESSAGE, (message) => {
        try {
          const messageTopic = message.getDestination().getName();
          const payload = message.getBinaryAttachment();
          const data = JSON.parse(payload);

          switch (true) {
            case messageTopic.includes(topics.agentRegistration):
              handleAgentRegistration(data, messageTopic);
              break;
            case messageTopic.includes(topics.stimulusGateway):
              console.log('Received message on topic:', messageTopic);
              handleStimulusGateway(data, messageTopic);
              break;
            case messageTopic.includes(topics.stimulusOrchestrator):
              console.log('Received message on topic:', messageTopic);
              handleStimulusOrchestrator(data, messageTopic);
              break;
            case messageTopic.includes(topics.streamingResponse):
              console.log('Received message on topic:', messageTopic);
              handleStreamingResponse(data, messageTopic);
              break;
            case messageTopic.includes(topics.responseComplete):
              console.log('Received message on topic:', messageTopic);
              handleResponseComplete(data);
              break;
            case messageTopic.includes(topics.actionRequest):
              console.log('Received message on topic:', messageTopic);
              handleActionRequest(data, messageTopic);
              break;
            case messageTopic.includes(topics.actionResponse):
              console.log('Received message on topic:', messageTopic);
              // skip if topic includes change_agent_status
              if (messageTopic.includes('change_agent_status')) return;
              handleActionResponse(data, messageTopic);
              break;
            case messageTopic.includes(topics.llmServiceRequest):
              console.log('Received message on topic:', messageTopic);
              handleLLMServiceRequest(data);
              break;
            case messageTopic.includes(topics.llmServiceResponse):
              console.log('Received message on topic:', messageTopic);
              handleLLMServiceResponse(data);
              break;
            default:
              console.log('Received message on unknown topic:', messageTopic);
          }
        } catch (err) {
          console.error('Error processing message:', err);
        }
      });

      console.log('Initiating connection to Solace message router...');
      session.connect();

    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
      setIsConnected(false);
    }
  };

  const handleAgentRegistration = (agentData: any, messageTopic: string) => {
    setAgents(prevAgents => {
      const existingAgentIndex = prevAgents.findIndex(
        a => a.agent_name === agentData.agent_name
      );
      
      if (existingAgentIndex >= 0) {
        const newAgents = [...prevAgents];
        newAgents[existingAgentIndex] = agentData;
        return newAgents;
      }
      
      return [...prevAgents, agentData];
    });

    addAgentRegistrationMessage({
      agent_name: agentData.agent_name,
      topic: messageTopic
    });
  };

  const handleStimulusGateway = (data: any, messageTopic: string) => {
    const topicParts = messageTopic.split('/');
    const gatewayType = topicParts[topicParts.length - 2];
    const gatewayName = topicParts[topicParts.length - 1];

    setGateways(prev => {
      const existingGateway = prev.find(g => g.type === gatewayType && g.name === gatewayName);
      if (!existingGateway) {
        return [...prev, { type: gatewayType, name: gatewayName }];
      }
      return prev;
    });

    const stimulus: StimulusGateway = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'gateway',
      topic: messageTopic,
      timestamp: Date.now(),
      data: {
        text: data.text || '',
        files: data.files || [],
        interface_properties: {
          user_id: data.interface_properties?.user_id || 'default',
          user_email: data.interface_properties?.user_email || 'default',
          timestamp: data.interface_properties?.timestamp || Date.now()
        },
        history: data.history || [],
        user_info: {
          identity: data.user_info?.identity || 'default'
        },
        errors: data.errors || []
      }
    };

    setStimuli(prev => [stimulus, ...prev]);
  };

  const handleStimulusOrchestrator = (data: any, messageTopic: string) => {
    const stimulus: StimulusOrchestrator = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'orchestrator',
      topic: messageTopic,
      timestamp: Date.now(),
      data: {
        text: data.text || '',
        files: data.files || [],
        identity: data.identity || 'default',
        channel: data.channel,
        thread_ts: data.thread_ts,
        action_response_reinvoke: data.action_response_reinvoke || false
      }
    };

    setStimuli(prev => [stimulus, ...prev]);
  };

  const handleStreamingResponse = (data: StreamingResponse, messageTopic: string) => {
    setStreamingResponses(prev => [...prev, {
      ...data,
      topic: messageTopic
    }]);
  };

  const handleResponseComplete = (data: ResponseComplete) => {
    setResponseCompletes(prev => [...prev, {
      response_complete: data.response_complete,
      streaming: data.streaming
    }]);
  };

  const handleActionRequest = (data: ActionRequest, messageTopic: string) => {
    setActionRequests(prev => [...prev, {
      ...data,
      topic: messageTopic
    }]);
  };

  const handleActionResponse = (data: ActionResponse, messageTopic: string) => {
    setActionResponses(prev => [...prev, {
      ...data,
      topic: messageTopic
    }]);
  };

  const handleLLMServiceRequest = (data: LLMServiceRequest) => {
    setLLMRequests(prev => [...prev, {
      messages: data.messages,
      stream: data.stream
    }]);
  };

  const handleLLMServiceResponse = (data: LLMServiceResponse) => {
    setLLMResponses(prev => [...prev, {
      chunk: data.chunk,
      content: data.content,
      response_uuid: data.response_uuid,
      first_chunk: data.first_chunk,
      last_chunk: data.last_chunk,
      streaming: data.streaming
    }]);
  };

  const handleDisconnect = () => {
    try {
      const currentSession = solace.SolclientFactory.createSession({
        url: formatWsUrl(config.url),
        vpnName: config.vpn,
        userName: config.username,
        password: config.password,
      });
      
      if (currentSession) {
        currentSession.disconnect();
        setSession(null);
        setIsConnected(false);
        setAgents([]);
        setIsExpanded(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  return (
    <Card>
      <Box
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          bgcolor: 'grey.50',
          '&:hover': {
            bgcolor: 'grey.100',
          },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: isConnected ? 'success.main' : 'error.main',
              boxShadow: 1,
              transition: 'background-color 0.3s ease'
            }}
          />
          <Typography variant="subtitle1" fontWeight="medium">
            Event Mesh Connection
          </Typography>
          {isConnected && (
            <Typography variant="body2" color="text.secondary">
              Connected to {config.url}
            </Typography>
          )}
        </Stack>
        <IconButton
          size="small"
          sx={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <ChevronDown size={20} />
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="URL"
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              disabled={isConnected}
              size="small"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="VPN"
              value={config.vpn}
              onChange={(e) => setConfig({ ...config, vpn: e.target.value })}
              disabled={isConnected}
              size="small"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Username"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
              disabled={isConnected}
              size="small"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
              disabled={isConnected}
              size="small"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Namespace"
              value={config.namespace}
              onChange={(e) => setConfig({ ...config, namespace: e.target.value })}
              disabled={isConnected}
              size="small"
              variant="outlined"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleConnect}
                disabled={isConnecting || isConnected}
                color="primary"
              >
                {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Connect'}
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={handleDisconnect}
                disabled={!isConnected}
                color="error"
              >
                Disconnect
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
}