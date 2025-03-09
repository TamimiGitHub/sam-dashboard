import { useState } from 'react';
import { useSolace } from '../context/SolaceContext';
import { Users, Bot, ChevronDown } from 'lucide-react';
import type { Agent } from '../types/solace';
import AgentDetails from './AgentDetails';
import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Grid, 
  Box, 
  Typography, 
  Chip, 
  Stack,
  IconButton,
  Collapse
} from '@mui/material';

export default function AgentList() {
  const { agents } = useSolace();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper function to format names
  const formatName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <Box
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="h2">Connected Agents</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Users className="w-5 h-5 text-blue-500" />
              <Typography variant="h6">{agents.length}</Typography>
              <IconButton
                size="small"
                sx={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  ml: 1,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                <ChevronDown size={20} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <Collapse in={isExpanded}>
          <Box sx={{ maxHeight: 'calc(100vh - 24rem)', overflow: 'auto', p: 3 }}>
            <Grid container spacing={3}>
              {agents.map((agent) => (
                <Grid item xs={12} sm={6} md={4} key={agent.agent_name}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' },
                      ...(selectedAgent?.agent_name === agent.agent_name && {
                        bgcolor: 'rgba(34, 37, 201, 0.16)',
                        boxShadow: 6
                      })
                    }}
                  >
                    <CardActionArea 
                      onClick={() => setSelectedAgent(currentAgent => 
                        currentAgent?.agent_name === agent.agent_name ? null : agent
                      )}
                      sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Bot className="w-5 h-5 text-blue-500" />
                          <Typography variant="h6" component="h3" noWrap>
                            {formatName(agent.agent_name)}
                          </Typography>
                        </Stack>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {Array.isArray(agent.description) ? agent.description.join(' ') : agent.description}
                        </Typography>

                        <Stack 
                          direction="row" 
                          justifyContent="space-between" 
                          alignItems="center"
                          mt="auto"
                        >
                          <Chip
                            label={`${agent.actions.length} actions`}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(37, 99, 235, 0.1)',
                              color: 'rgb(30, 64, 175)',
                              '& .MuiChip-label': {
                                px: 1,
                              },
                            }}
                          />
                          {agent.always_open && (
                            <Chip
                              label="Always Open"
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                                color: 'rgb(21, 128, 61)',
                                '& .MuiChip-label': {
                                  px: 1,
                                },
                              }}
                            />
                          )}
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {agents.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No agents connected
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Card>

      {selectedAgent && (
        <AgentDetails
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}