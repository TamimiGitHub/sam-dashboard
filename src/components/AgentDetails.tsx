import type { Agent } from '../types/solace';
import { Code, ChevronDown, X } from 'lucide-react';
import { 
  Box,
  Card,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

interface AgentDetailsProps {
  agent: Agent;
  onClose: () => void;
}

// Helper function to format names
const formatName = (name: string) => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to format description with newlines
const formatDescription = (description: string | string[]) => {
  if (Array.isArray(description)) {
    return description.join('\n');
  }
  return description;
};

export default function AgentDetails({ agent, onClose }: AgentDetailsProps) {
  return (
    <Card sx={{ mt: 3 }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography variant="h4" gutterBottom>
              {formatName(agent.agent_name)}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: '800px',
                whiteSpace: 'pre-line'  // This ensures newlines are respected
              }}
            >
              {formatDescription(agent.description)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ mt: -1, mr: -1 }}>
            <X />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Actions</Typography>
        {agent.actions.map((action, index) => {
          const [actionName, actionDetails] = Object.entries(action)[0];
          return (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ChevronDown />}
                sx={{ 
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Code className="w-5 h-5 text-blue-500" />
                  <Typography variant="subtitle1" fontWeight="medium">
                    {formatName(actionName)}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  {/* Description */}
                  <Box>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ whiteSpace: 'pre-line' }}  // Also handle newlines in action descriptions
                    >
                      {actionDetails.desc}
                    </Typography>
                  </Box>

                  {/* Parameters */}
                  {actionDetails.params && actionDetails.params.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Parameters
                      </Typography>
                      <List dense disablePadding>
                        {actionDetails.params.map((param: string, paramIndex: number) => (
                          <ListItem key={paramIndex} sx={{ pl: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Box
                                sx={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%',
                                  bgcolor: 'primary.main',
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={param}
                              sx={{ 
                                '& .MuiListItemText-primary': { 
                                  fontFamily: 'monospace',
                                  fontSize: '0.9rem'
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Examples */}
                  {actionDetails.examples && actionDetails.examples.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Examples
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: 'grey.50',
                          p: 2,
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}
                      >
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          {actionDetails.examples.join('\n')}
                        </pre>
                      </Box>
                    </Box>
                  )}

                  {/* Required Scopes */}
                  {actionDetails.required_scopes && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Required Scopes
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {actionDetails.required_scopes.map((scope: string, scopeIndex: number) => (
                          <Chip
                            key={scopeIndex}
                            label={scope}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(25, 118, 210, 0.08)',
                              color: 'primary.main',
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              my: 0.5
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Card>
  );
}