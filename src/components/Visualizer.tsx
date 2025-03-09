import { useRef, useEffect, useCallback } from 'react';
import { Bot, LayoutGrid, BrainCog, DoorOpen } from 'lucide-react';
import { useSolace } from '../context/SolaceContext';
import { Box, Typography, useTheme, Button } from '@mui/material';
import { SamIcon } from './Samicon';
import {
  ICON_BOX_SIZE,
  usePositions,
  useDrag,
  useMessageBalls,
  Legend,
  MessageBall,
  ConnectionLines
} from './visualizer/index';

export default function Visualizer() {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    agents, 
    registrationMessages,
    gateways,
    stimuli,
    streamingResponses,
    actionRequests,
    actionResponses,
    responseCompletes
  } = useSolace();

  const {
    savedAgentPositions,
    brokerPosition,
    orchestratorPosition,
    gatewayPositions,
    updatePosition,
    initializePositions
  } = usePositions();

  const {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd
  } = useDrag(updatePosition);

  const getDefaultBrokerPosition = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const width = containerRef.current.offsetWidth;
    return { x: width / 2, y: 120 };
  }, []);

  const getDefaultOrchestratorPosition = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const width = containerRef.current.offsetWidth;
    return { x: width / 2 + 200, y: 120 };
  }, []);

  const getDefaultGatewayPosition = useCallback((index: number, total: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const width = containerRef.current.offsetWidth;
    const spacing = Math.min(width / (total + 1), 120);
    const startX = width / 2 - 200;
    return {
      x: startX - (index * spacing),
      y: 120
    };
  }, []);

  const getDefaultAgentPosition = useCallback((index: number, total: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const width = containerRef.current.offsetWidth;
    const spacing = Math.min(width / (total + 1), 120);
    const startX = (width - (spacing * (total - 1))) / 2;
    return {
      x: startX + (index * spacing),
      y: 280
    };
  }, []);

  const {
    messageBalls,
    samHighlight
  } = useMessageBalls(
    registrationMessages,
    stimuli,
    streamingResponses,
    actionRequests,
    actionResponses,
    responseCompletes,
    savedAgentPositions,
    gatewayPositions,
    () => brokerPosition,
    () => orchestratorPosition
  );

  const handleReset = useCallback(() => {
    if (!containerRef.current) return;

    const defaultPositions: Record<string, { x: number; y: number }> = {};
    agents.forEach((agent, index) => {
      defaultPositions[agent.agent_name] = getDefaultAgentPosition(index, agents.length);
    });
    
    const defaultBrokerPos = getDefaultBrokerPosition();
    const defaultOrchestratorPos = getDefaultOrchestratorPosition();
    
    const defaultGatewayPositions: Record<string, { x: number; y: number }> = {};
    gateways.forEach((gateway, index) => {
      const gatewayId = `${gateway.type}-${gateway.name}`;
      defaultGatewayPositions[gatewayId] = getDefaultGatewayPosition(index, gateways.length);
    });

    updatePosition('all', {
      agents: defaultPositions,
      broker: defaultBrokerPos,
      orchestrator: defaultOrchestratorPos,
      gateways: defaultGatewayPositions
    });
  }, [agents, gateways, getDefaultAgentPosition, getDefaultBrokerPosition, getDefaultGatewayPosition, getDefaultOrchestratorPosition, updatePosition]);

  useEffect(() => {
    if (containerRef.current) {
      initializePositions({
        broker: getDefaultBrokerPosition(),
        orchestrator: getDefaultOrchestratorPosition(),
        agents: agents.reduce((acc, agent, index) => ({
          ...acc,
          [agent.agent_name]: getDefaultAgentPosition(index, agents.length)
        }), {}),
        gateways: gateways.reduce((acc, gateway, index) => ({
          ...acc,
          [`${gateway.type}-${gateway.name}`]: getDefaultGatewayPosition(index, gateways.length)
        }), {})
      });
    }
  }, [containerRef.current, agents.length, gateways.length]);

  return (
    <Box
      ref={containerRef}
      data-visualizer-container
      sx={{
        height: '400px',
        position: 'relative',
        my: 4,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        cursor: dragState ? 'grabbing' : 'default',
      }}
      onMouseMove={(e) => dragState && handleDragMove(e.nativeEvent)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<LayoutGrid size={16} />}
          onClick={handleReset}
          sx={{
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'background.paper',
            },
          }}
        >
          Reset Layout
        </Button>
      </Box>

      <Legend />
      
      {messageBalls.map(ball => (
        <MessageBall key={ball.id} ball={ball} />
      ))}

      <ConnectionLines
        brokerPos={brokerPosition}
        orchestratorPos={orchestratorPosition}
        gatewayPositions={gatewayPositions}
        agentPositions={savedAgentPositions}
        theme={theme}
      />

      <Box
        sx={{
          position: 'absolute',
          left: orchestratorPosition.x,
          top: orchestratorPosition.y,
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          cursor: dragState?.type === 'orchestrator' ? 'grabbing' : 'grab',
          userSelect: 'none',
          transition: dragState?.type === 'orchestrator' ? 'none' : 'all 0.2s ease',
        }}
        onMouseDown={(e) => handleDragStart(e, 'orchestrator')}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: '50%',
            bgcolor: theme.palette.grey[100],
            color: theme.palette.grey[800],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: dragState?.type === 'orchestrator' ? theme.shadows[8] : 'none',
            border: `2px solid ${theme.palette.grey[300]}`,
            width: ICON_BOX_SIZE,
            height: ICON_BOX_SIZE,
          }}
        >
          <BrainCog size={32} />
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          Orchestrator
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          left: brokerPosition.x,
          top: brokerPosition.y,
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          cursor: dragState?.type === 'broker' ? 'grabbing' : 'grab',
          userSelect: 'none',
          transition: dragState?.type === 'broker' ? 'none' : 'all 0.2s ease',
        }}
        onMouseDown={(e) => handleDragStart(e, 'broker')}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: '50%',
            bgcolor: samHighlight ? 'rgba(59, 246, 96, 0.93)' : theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: samHighlight 
              ? `0 0 20px rgba(59, 246, 96, 0.5), 0 0 40px rgba(59, 246, 96, 0.3)`
              : dragState?.type === 'broker' ? theme.shadows[8] : 'none',
            width: ICON_BOX_SIZE,
            height: ICON_BOX_SIZE,
            transition: 'all 0.3s ease',
          }}
        >
          <SamIcon size={48} />
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          Event Mesh
        </Typography>
      </Box>

      {gateways.map((gateway, index) => {
        const gatewayId = `${gateway.type}-${gateway.name}`;
        const pos = gatewayPositions[gatewayId] || getDefaultGatewayPosition(index, gateways.length);
        const isDragging = dragState?.type === 'gateway' && dragState.gatewayId === gatewayId;

        return (
          <Box
            key={gatewayId}
            sx={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              transition: isDragging ? 'none' : 'all 0.2s ease',
            }}
            onMouseDown={(e) => handleDragStart(e, 'gateway', undefined, gatewayId)}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: theme.palette.grey[100],
                color: theme.palette.grey[800],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDragging ? theme.shadows[8] : 'none',
                border: `2px solid ${theme.palette.grey[300]}`,
                width: ICON_BOX_SIZE,
                height: ICON_BOX_SIZE,
              }}
            >
              <DoorOpen size={32} />
            </Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{
                maxWidth: '120px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Gateway
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                maxWidth: '120px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              ({gateway.name})
            </Typography>
          </Box>
        );
      })}

      {agents.map((agent, index) => {
        const pos = savedAgentPositions[agent.agent_name] || getDefaultAgentPosition(index, agents.length);
        const isDragging = dragState?.type === 'agent' && dragState.agentName === agent.agent_name;

        return (
          <Box key={agent.agent_name}>
            <Box
              sx={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                transition: isDragging ? 'none' : 'all 0.2s ease',
              }}
              onMouseDown={(e) => handleDragStart(e, 'agent', agent.agent_name)}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: '50%',
                  bgcolor: 'background.default',
                  border: `2px solid ${theme.palette.divider}`,
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isDragging ? theme.shadows[8] : 'none',
                  width: ICON_BOX_SIZE,
                  height: ICON_BOX_SIZE,
                }}
              >
                <Bot size={24} />
              </Box>
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  maxWidth: '120px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {agent.agent_name}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}