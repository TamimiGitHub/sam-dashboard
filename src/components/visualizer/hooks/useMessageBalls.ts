import { useState, useEffect, useCallback } from 'react';
import { MESSAGE_COLORS, ANIMATION_DURATION } from '../constants';
import type { Position } from '../types';
import type { MessageType, MessageBall, MessageData } from '../../../types/solace';

const MAX_BALLS = 10; // Maximum number of concurrent animations
const HIGHLIGHT_DURATION = 300; // Duration of each highlight pulse in ms
const HIGHLIGHT_COUNT = 3; // Number of highlight pulses

export const useMessageBalls = (
  registrationMessages: any[],
  stimuli: any[],
  streamingResponses: any[],
  actionRequests: any[],
  actionResponses: any[],
  responseCompletes: any[],
  savedAgentPositions: Record<string, Position>,
  gatewayPositions: Record<string, Position>,
  getBrokerPosition: () => Position,
  getOrchestratorPosition: () => Position
) => {
  const [messageBalls, setMessageBalls] = useState<MessageBall[]>([]);
  const [samHighlight, setSamHighlight] = useState(false);
  const [highlightCount, setHighlightCount] = useState(0);

  const createMessageBall = useCallback((
    type: MessageType,
    startPos: Position,
    endPos: Position,
    nextPos: Position | undefined,
    data: MessageData
  ): MessageBall => ({
    id: `${Date.now()}-${Math.random()}`,
    type,
    startTime: performance.now(),
    color: MESSAGE_COLORS[type],
    data,
    startPos,
    endPos,
    nextPos
  }), []);

  const addMessageBall = useCallback((ball: MessageBall) => {
    setMessageBalls(prev => {
      // Remove oldest balls if we exceed the maximum
      const newBalls = prev.length >= MAX_BALLS ? prev.slice(-MAX_BALLS + 1) : prev;
      return [...newBalls, ball];
    });
  }, []);

  // Registration Messages
  useEffect(() => {
    const lastMessage = registrationMessages[registrationMessages.length - 1];
    if (!lastMessage?.topic?.includes('register/agent')) return;

    const agentPos = savedAgentPositions[lastMessage.agent_name];
    if (!agentPos) return;

    const ball = createMessageBall(
      'Registration Message',
      agentPos,
      getBrokerPosition(),
      getOrchestratorPosition(),
      { agent_name: lastMessage.agent_name, topic: lastMessage.topic }
    );

    addMessageBall(ball);
  }, [registrationMessages]);

  // Gateway Messages
  useEffect(() => {
    const lastStimulus = stimuli[stimuli.length - 1];
    if (!lastStimulus?.topic?.includes('stimulus/gateway/gateway_input')) return;

    const topicParts = lastStimulus.topic.split('/');
    const gatewayType = topicParts[topicParts.length - 2];
    const gatewayName = topicParts[topicParts.length - 1];
    const gatewayId = `${gatewayType}-${gatewayName}`;
    const gatewayPos = gatewayPositions[gatewayId];

    if (!gatewayPos) return;

    const ball = createMessageBall(
      'Gateway Message',
      gatewayPos,
      getBrokerPosition(),
      getOrchestratorPosition(),
      { gateway_name: gatewayName, topic: lastStimulus.topic }
    );

    addMessageBall(ball);
  }, [stimuli]);

  // Streaming Responses
  useEffect(() => {
    const lastResponse = streamingResponses[streamingResponses.length - 1];
    if (!lastResponse?.topic?.includes('streamingResponse/orchestrator')) return;

    const topicParts = lastResponse.topic.split('/');
    const gatewayIndex = topicParts.indexOf('orchestrator') + 1;
    if (gatewayIndex === 0 || gatewayIndex >= topicParts.length) return;
    
    const gatewayName = topicParts[gatewayIndex];
    const gatewayId = `gateway-${gatewayName}`;
    const gatewayPos = gatewayPositions[gatewayId];
    if (!gatewayPos) return;

    // Create message ball from orchestrator to SAM to gateway
    const ball = createMessageBall(
      'Orchestrator Response',
      getOrchestratorPosition(), // Start at orchestrator
      getBrokerPosition(), // First go to SAM
      gatewayPos, // Then to gateway
      { gateway_name: gatewayName, topic: lastResponse.topic }
    );

    addMessageBall(ball);
  }, [streamingResponses]);

  // Action Requests
  useEffect(() => {
    const lastRequest = actionRequests[actionRequests.length - 1];
    if (!lastRequest?.topic?.includes('actionRequest/orchestrator')) return;

    const agentPos = savedAgentPositions[lastRequest.agent_name];
    if (!agentPos) return;

    const ball = createMessageBall(
      'Orchestrator Request',
      getOrchestratorPosition(),
      getBrokerPosition(),
      agentPos,
      { agent_name: lastRequest.agent_name, topic: lastRequest.topic }
    );

    addMessageBall(ball);
  }, [actionRequests]);

  // Action Responses
  useEffect(() => {
    const lastResponse = actionResponses[actionResponses.length - 1];
    if (!lastResponse?.topic?.includes('actionResponse/agent')) return;

    const topicParts = lastResponse.topic.split('/');
    const agentIndex = topicParts.indexOf('agent') + 1;
    const agentName = topicParts[agentIndex];
    const agentPos = savedAgentPositions[agentName];
    if (!agentPos) return;

    const ball = createMessageBall(
      'Agent Response',
      agentPos,
      getBrokerPosition(),
      getOrchestratorPosition(),
      { agent_name: agentName, topic: lastResponse.topic }
    );

    addMessageBall(ball);
  }, [actionResponses]);

  // Response Complete (SAM highlight)
  useEffect(() => {
    const lastComplete = responseCompletes[responseCompletes.length - 1];
    if (!lastComplete) return;

    // Reset highlight count when new complete message arrives
    setHighlightCount(0);
  }, [responseCompletes]);

  // Handle highlight animation
  useEffect(() => {
    if (highlightCount >= HIGHLIGHT_COUNT) {
      setSamHighlight(false);
      return;
    }

    if (responseCompletes.length > 0 && highlightCount < HIGHLIGHT_COUNT) {
      setSamHighlight(true);
      const timer = setTimeout(() => {
        setSamHighlight(false);
        const nextTimer = setTimeout(() => {
          setHighlightCount(count => count + 1);
        }, HIGHLIGHT_DURATION / 2);
        return () => clearTimeout(nextTimer);
      }, HIGHLIGHT_DURATION);
      return () => clearTimeout(timer);
    }
  }, [highlightCount, responseCompletes]);

  // Animation frame loop with cleanup
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      const now = performance.now();

      // Update ball positions
      setMessageBalls(prev => {
        const updatedBalls = prev.filter(ball => {
          const elapsed = now - ball.startTime;
          
          // Handle next animation segment
          if (elapsed >= ANIMATION_DURATION && ball.nextPos) {
            ball.startPos = ball.endPos;
            ball.endPos = ball.nextPos;
            ball.nextPos = undefined;
            ball.startTime = now;
            return true;
          }

          // Remove completed animations
          return elapsed < ANIMATION_DURATION || ball.nextPos !== undefined;
        });

        return updatedBalls;
      });

      // Schedule next frame
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return {
    messageBalls,
    samHighlight
  };
};