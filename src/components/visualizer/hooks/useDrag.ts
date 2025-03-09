import { useState } from 'react';
import { STORAGE_KEYS } from '../constants';
import type { DragState } from '../types';
import type { Position } from '../types';

export const useDrag = (
  updatePosition: (key: string, position: Position | { agents: Record<string, Position>, broker: Position, orchestrator: Position, gateways: Record<string, Position> }, id?: string) => void
) => {
  const [dragState, setDragState] = useState<DragState | null>(null);

  const handleDragStart = (
    e: React.MouseEvent,
    type: 'agent' | 'broker' | 'orchestrator' | 'gateway',
    agentName?: string,
    gatewayId?: string
  ) => {
    e.preventDefault();
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const container = element.closest('[data-visualizer-container]');
    
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate the element's center position relative to the container
    const elementCenterX = rect.left - containerRect.left + rect.width / 2;
    const elementCenterY = rect.top - containerRect.top + rect.height / 2;

    // Calculate the mouse offset from the element's center
    const mouseOffsetX = e.clientX - (rect.left + rect.width / 2);
    const mouseOffsetY = e.clientY - (rect.top + rect.height / 2);

    setDragState({
      type,
      agentName,
      gatewayId,
      initialX: elementCenterX,
      initialY: elementCenterY,
      currentX: elementCenterX,
      currentY: elementCenterY,
      mouseOffsetX,
      mouseOffsetY
    });
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!dragState) return;

    const container = (e.target as HTMLElement).closest('[data-visualizer-container]');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    // Calculate new position relative to container, accounting for mouse offset
    const newX = e.clientX - containerRect.left - dragState.mouseOffsetX;
    const newY = e.clientY - containerRect.top - dragState.mouseOffsetY;

    // Update the drag state with the new position
    setDragState(prev => prev ? {
      ...prev,
      currentX: newX,
      currentY: newY
    } : null);

    // Update position based on the type
    const newPosition = { x: newX, y: newY };

    switch (dragState.type) {
      case 'agent':
        if (dragState.agentName) {
          updatePosition(STORAGE_KEYS.AGENT, newPosition, dragState.agentName);
        }
        break;
      case 'broker':
        updatePosition(STORAGE_KEYS.BROKER, newPosition);
        break;
      case 'orchestrator':
        updatePosition(STORAGE_KEYS.ORCHESTRATOR, newPosition);
        break;
      case 'gateway':
        if (dragState.gatewayId) {
          updatePosition(STORAGE_KEYS.GATEWAY, newPosition, dragState.gatewayId);
        }
        break;
    }
  };

  const handleDragEnd = () => {
    setDragState(null);
  };

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd
  };
};