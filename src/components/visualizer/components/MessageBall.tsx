import { Box } from '@mui/material';
import { ANIMATION_DURATION } from '../constants';
import type { MessageBall as MessageBallType } from '../../../types/solace';

interface MessageBallProps {
  ball: MessageBallType;
}

export const MessageBall = ({ ball }: MessageBallProps) => {
  const elapsed = (performance.now() - ball.startTime) / ANIMATION_DURATION;
  if (elapsed < 0) return null;
  
  const progress = Math.min(elapsed, 1);
  const easeProgress = 1 - Math.pow(1 - progress, 2);
  
  const x = ball.startPos.x + (ball.endPos.x - ball.startPos.x) * easeProgress;
  const y = ball.startPos.y + (ball.endPos.y - ball.startPos.y) * easeProgress;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: x,
        top: y,
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: ball.color,
        transform: 'translate(-50%, -50%)',
        opacity: 1 - easeProgress,
        transition: 'opacity 0.2s ease',
      }}
    />
  );
};