/* eslint-disable */
import type { Position } from '../types';

interface ConnectionLinesProps {
  brokerPos: Position;
  orchestratorPos: Position;
  gatewayPositions: Record<string, Position>;
  agentPositions: Record<string, Position>;
  theme: any;
}

export const ConnectionLines = ({
  brokerPos,
  orchestratorPos,
  gatewayPositions,
  agentPositions,
  theme
}: ConnectionLinesProps) => {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 0,
      }}
    >
      {/* Orchestrator to Broker connection */}
      <line
        x1={orchestratorPos.x}
        y1={orchestratorPos.y}
        x2={brokerPos.x}
        y2={brokerPos.y}
        stroke={theme.palette.grey[300]}
        strokeWidth={2}
        strokeDasharray="5,5"
      />

      {/* Gateway to Broker connections */}
      {Object.entries(gatewayPositions).map(([id, pos]) => (
        <line
          key={id}
          x1={pos.x}
          y1={pos.y}
          x2={brokerPos.x}
          y2={brokerPos.y}
          stroke={theme.palette.grey[300]}
          strokeWidth={2}
          strokeDasharray="5,5"
        />
      ))}

      {/* Agent to Broker connections */}
      {Object.entries(agentPositions).map(([id, pos]) => (
        <line
          key={id}
          x1={pos.x}
          y1={pos.y}
          x2={brokerPos.x}
          y2={brokerPos.y}
          stroke={theme.palette.divider}
          strokeWidth={2}
          strokeDasharray="5,5"
        />
      ))}
    </svg>
  );
};