import { useState } from 'react';
import { STORAGE_KEYS } from '../constants';
import type { Position } from '../types';

const DEFAULT_POSITION: Position = { x: 200, y: 200 };

// Helper functions to load positions from localStorage
const loadFromStorage = (key: string, defaultValue: Position | Record<string, Position>) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (err) {
    console.error(`Error loading ${key}:`, err);
    return defaultValue;
  }
};

export const usePositions = () => {
  const [savedAgentPositions, setSavedAgentPositions] = useState<Record<string, Position>>(() => 
    loadFromStorage(STORAGE_KEYS.AGENT, {}));
    
  const [brokerPosition, setBrokerPosition] = useState<Position>(() => 
    loadFromStorage(STORAGE_KEYS.BROKER, DEFAULT_POSITION));
    
  const [orchestratorPosition, setOrchestratorPosition] = useState<Position>(() => 
    loadFromStorage(STORAGE_KEYS.ORCHESTRATOR, { x: DEFAULT_POSITION.x - 200, y: DEFAULT_POSITION.y }));
    
  const [gatewayPositions, setGatewayPositions] = useState<Record<string, Position>>(() => 
    loadFromStorage(STORAGE_KEYS.GATEWAY, {}));

  const initializePositions = (positions: {
    broker: Position;
    orchestrator: Position;
    agents: Record<string, Position>;
    gateways: Record<string, Position>;
  }) => {
    setBrokerPosition(positions.broker);
    setOrchestratorPosition(positions.orchestrator);
    setSavedAgentPositions(positions.agents);
    setGatewayPositions(positions.gateways);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.BROKER, JSON.stringify(positions.broker));
    localStorage.setItem(STORAGE_KEYS.ORCHESTRATOR, JSON.stringify(positions.orchestrator));
    localStorage.setItem(STORAGE_KEYS.AGENT, JSON.stringify(positions.agents));
    localStorage.setItem(STORAGE_KEYS.GATEWAY, JSON.stringify(positions.gateways));
  };

  const updatePosition = (
    key: string,
    position: Position | { agents: Record<string, Position>, broker: Position, orchestrator: Position, gateways: Record<string, Position> },
    id?: string
  ) => {
    if (key === 'all' && !id) {
      const allPositions = position as { 
        agents: Record<string, Position>,
        broker: Position,
        orchestrator: Position,
        gateways: Record<string, Position>
      };
      
      setSavedAgentPositions(allPositions.agents);
      setBrokerPosition(allPositions.broker);
      setOrchestratorPosition(allPositions.orchestrator);
      setGatewayPositions(allPositions.gateways);
      
      localStorage.setItem(STORAGE_KEYS.AGENT, JSON.stringify(allPositions.agents));
      localStorage.setItem(STORAGE_KEYS.BROKER, JSON.stringify(allPositions.broker));
      localStorage.setItem(STORAGE_KEYS.ORCHESTRATOR, JSON.stringify(allPositions.orchestrator));
      localStorage.setItem(STORAGE_KEYS.GATEWAY, JSON.stringify(allPositions.gateways));
      return;
    }

    if (id) {
      const newPositions = {
        ...(key === STORAGE_KEYS.AGENT ? savedAgentPositions : gatewayPositions),
        [id]: position as Position
      };
      if (key === STORAGE_KEYS.AGENT) {
        setSavedAgentPositions(newPositions);
      } else {
        setGatewayPositions(newPositions);
      }
      localStorage.setItem(key, JSON.stringify(newPositions));
    } else {
      if (key === STORAGE_KEYS.BROKER) {
        setBrokerPosition(position as Position);
      } else if (key === STORAGE_KEYS.ORCHESTRATOR) {
        setOrchestratorPosition(position as Position);
      }
      localStorage.setItem(key, JSON.stringify(position));
    }
  };

  return {
    savedAgentPositions,
    setSavedAgentPositions,
    brokerPosition,
    setBrokerPosition,
    orchestratorPosition,
    setOrchestratorPosition,
    gatewayPositions,
    setGatewayPositions,
    updatePosition,
    initializePositions
  };
};