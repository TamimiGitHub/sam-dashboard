import { useState } from 'react';
import { ChevronDown, Zap, History, User, AlertCircle, Trash2, BrainCog, MessageSquare, Check, Play, ArrowLeft, ArrowRight, Brain } from 'lucide-react';
import { useSolace } from '../context/SolaceContext';
import { 
  Card, 
  Box, 
  Typography, 
  Stack, 
  IconButton, 
  Collapse,
  List,
  ListItem,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Tab,
  Tabs
} from '@mui/material';

type MessageType = 'stimuli' | 'streaming' | 'complete' | 'action-req' | 'action-res' | 'llm-req' | 'llm-res';

export default function Stimuli() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<MessageType>('stimuli');
  const { 
    stimuli, 
    setStimuli,
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
  } = useSolace();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleClear = () => {
    setStimuli([]);
    setStreamingResponses([]);
    setResponseCompletes([]);
    setActionRequests([]);
    setActionResponses([]);
    setLLMRequests([]);
    setLLMResponses([]);
  };

  const getMessageCount = () => {
    return {
      stimuli: stimuli.length,
      streaming: streamingResponses.length,
      complete: responseCompletes.length,
      actionReq: actionRequests.length,
      actionRes: actionResponses.length,
      llmReq: llmRequests.length,
      llmRes: llmResponses.length
    };
  };

  const counts = getMessageCount();
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  // Sort stimuli by timestamp in ascending order (oldest first)
  const sortedStimuli = [...stimuli].sort((a, b) => a.timestamp - b.timestamp);
  const sortedStreamingResponses = [...streamingResponses].sort((a, b) => a.uuid.localeCompare(b.uuid));
  const sortedActionRequests = [...actionRequests].sort((a, b) => a.action_idx - b.action_idx);
  const sortedActionResponses = [...actionResponses].sort((a, b) => a.action_idx - b.action_idx);
  const sortedLLMResponses = [...llmResponses].sort((a, b) => a.response_uuid.localeCompare(b.response_uuid));

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
            <Typography variant="h5" component="h2">Events</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                startIcon={<Trash2 size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                disabled={totalCount === 0}
                sx={{ mr: 2 }}
              >
                Clear All
              </Button>
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <Typography variant="h6">{totalCount}</Typography>
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
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                icon={<Zap size={16} />} 
                iconPosition="start"
                label={`Stimuli (${counts.stimuli})`} 
                value="stimuli"
              />
              {/* <Tab 
                icon={<Play size={16} />} 
                iconPosition="start"
                label={`Streaming (${counts.streaming})`} 
                value="streaming"
              /> */}
              {/* <Tab 
                icon={<Check size={16} />} 
                iconPosition="start"
                label={`Complete (${counts.complete})`} 
                value="complete"
              /> */}
              <Tab 
                icon={<ArrowRight size={16} />} 
                iconPosition="start"
                label={`Action Req (${counts.actionReq})`} 
                value="action-req"
              />
              <Tab 
                icon={<ArrowLeft size={16} />} 
                iconPosition="start"
                label={`Action Res (${counts.actionRes})`} 
                value="action-res"
              />
              <Tab 
                icon={<Brain size={16} />} 
                iconPosition="start"
                label={`LLM Req (${counts.llmReq})`} 
                value="llm-req"
              />
              <Tab 
                icon={<BrainCog size={16} />} 
                iconPosition="start"
                label={`LLM Res (${counts.llmRes})`} 
                value="llm-res"
              />
            </Tabs>
          </Box>

          <Box sx={{ maxHeight: 'calc(100vh - 24rem)', overflow: 'auto', p: 2 }}>
            {activeTab === 'stimuli' && (
              <List>
                {sortedStimuli.map((stimulus, index) => (
                  <Box key={stimulus.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        py: 2,
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        {stimulus.type === 'gateway' ? (
                          <Zap className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <BrainCog className="w-5 h-5 text-blue-500" />
                        )}
                        <Stack direction="row" spacing={1} alignItems="center" flexGrow={1}>
                          <Chip
                            label={stimulus.type === 'gateway' ? 'Gateway' : 'Orchestrator'}
                            size="small"
                            sx={{
                              bgcolor: stimulus.type === 'gateway' 
                                ? 'rgba(37, 99, 235, 0.1)' 
                                : 'rgba(59, 130, 246, 0.1)',
                              color: stimulus.type === 'gateway'
                                ? 'rgb(30, 64, 175)'
                                : 'rgb(37, 99, 235)',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(stimulus.timestamp)}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Box sx={{ pl: 4 }}>
                        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                          {stimulus.data.text}
                        </Typography>

                        {stimulus.type === 'gateway' && (
                          <Stack spacing={2}>
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <User size={16} />
                                <Typography variant="subtitle2">User Info</Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} sx={{ pl: 2 }}>
                                <Chip
                                  label={`ID: ${stimulus.data.interface_properties.user_id}`}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  label={`Email: ${stimulus.data.interface_properties.user_email}`}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  label={`Identity: ${stimulus.data.user_info.identity}`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                            </Box>

                            {stimulus.data.history.length > 0 && (
                              <Accordion>
                                <AccordionSummary expandIcon={<ChevronDown />}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <History size={16} />
                                    <Typography>Conversation History</Typography>
                                    <Chip 
                                      label={stimulus.data.history.length} 
                                      size="small"
                                      sx={{ ml: 1 }}
                                    />
                                  </Stack>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Stack spacing={2}>
                                    {stimulus.data.history.map((entry, i) => (
                                      <Box
                                        key={i}
                                        sx={{
                                          p: 2,
                                          bgcolor: entry.role === 'user' ? 'grey.50' : 'primary.50',
                                          borderRadius: 1,
                                        }}
                                      >
                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                          {entry.role.toUpperCase()}
                                        </Typography>
                                        <Typography variant="body2">
                                          {entry.content}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Stack>
                                </AccordionDetails>
                              </Accordion>
                            )}

                            {stimulus.data.errors.length > 0 && (
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                  <AlertCircle size={16} className="text-red-500" />
                                  <Typography variant="subtitle2" color="error">Errors</Typography>
                                </Stack>
                                <Stack spacing={1} sx={{ pl: 2 }}>
                                  {stimulus.data.errors.map((error, i) => (
                                    <Typography
                                      key={i}
                                      variant="body2"
                                      color="error"
                                      sx={{ fontFamily: 'monospace' }}
                                    >
                                      {error}
                                    </Typography>
                                  ))}
                                </Stack>
                              </Box>
                            )}
                          </Stack>
                        )}

                        {stimulus.type === 'orchestrator' && (
                          <Stack spacing={2}>
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <User size={16} />
                                <Typography variant="subtitle2">Details</Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} sx={{ pl: 2 }}>
                                <Chip
                                  label={`Identity: ${stimulus.data.identity}`}
                                  size="small"
                                  variant="outlined"
                                />
                                {stimulus.data.channel && (
                                  <Chip
                                    label={`Channel: ${stimulus.data.channel}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                {stimulus.data.thread_ts && (
                                  <Chip
                                    label={`Thread: ${stimulus.data.thread_ts}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                <Chip
                                  label={`Reinvoke: ${stimulus.data.action_response_reinvoke}`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                            </Box>
                          </Stack>
                        )}
                      </Box>
                    </ListItem>
                  </Box>
                ))}
                {sortedStimuli.length === 0 && (
                  <Typography textAlign="center" color="text.secondary" py={4}>
                    No stimuli messages
                  </Typography>
                )}
              </List>
            )}

            {/* {activeTab === 'streaming' && (
              <List>
                {sortedStreamingResponses.map((response, index) => (
                  <Box key={`${response.uuid}-${index}`}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        py: 2,
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Play className="w-5 h-5 text-green-500" />
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={response.first_chunk ? 'First Chunk' : response.last_chunk ? 'Last Chunk' : 'Chunk'}
                            size="small"
                            color={response.first_chunk ? 'primary' : response.last_chunk ? 'success' : 'default'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            UUID: {response.uuid}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Box sx={{ pl: 4 }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {response.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Chunk: {response.chunk}
                        </Typography>
                      </Box>
                    </ListItem>
                  </Box>
                ))}
                {sortedStreamingResponses.length === 0 && (
                  <Typography textAlign="center" color="text.secondary" py={4}>
                    No streaming responses
                  </Typography>
                )}
              </List>
            )} */}

            {/* {activeTab === 'complete' && (
              <List>
                {responseCompletes.map((response, index) => (
                  <Box key={index}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        py: 2,
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Check className="w-5 h-5 text-green-500" />
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={response.streaming ? 'Streaming' : 'Non-Streaming'}
                            size="small"
                            color={response.streaming ? 'primary' : 'default'}
                          />
                          <Chip
                            label={response.response_complete ? 'Complete' : 'Incomplete'}
                            size="small"
                            color={response.response_complete ? 'success' : 'error'}
                          />
                        </Stack>
                      </Stack>
                    </ListItem>
                  </Box>
                ))}
                {responseCompletes.length === 0 && (
                  <Typography textAlign="center" color="text.secondary" py={4}>
                    No complete responses
                  </Typography>
                )}
              </List>
            )} */}

            {activeTab === 'action-req' && (
              <List>
                {sortedActionRequests.map((request, index) => (
                  <Box key={`${request.action_list_id}-${request.action_idx}`}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        py: 2,
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <ArrowRight className="w-5 h-5 text-purple-500" />
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`Agent: ${request.agent_name}`}
                            size="small"
                            color="primary"
                          />
                          <Chip
                            label={`Action: ${request.action_name}`}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            ID: {request.action_list_id}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Box sx={{ pl: 4 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Parameters:
                        </Typography>
                        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(request.action_params, null, 2)}
                          </pre>
                        </Box>
                      </Box>
                    </ListItem>
                  </Box>
                ))}
                {sortedActionRequests.length === 0 && (
                  <Typography textAlign="center" color="text.secondary" py={4}>
                    No action requests
                  </Typography>
                )}
              </List>
            )}

            {activeTab === 'action-res' && (
                <List>
                {sortedActionResponses.map((response, index) => (
                  <Box key={`${response.action_list_id}-${response.action_idx}`}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                    py: 2,
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <ArrowLeft className="w-5 h-5 text-blue-500" />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                      label={`Agent: ${response.topic?.split('/')[response.topic?.split('/').indexOf('agent') + 1]}`}
                      size="small"
                      color="primary"
                      />
                      <Chip
                      label={`Action: ${response.action_name}`}
                      size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                      ID: {response.action_list_id}
                      </Typography>
                    </Stack>
                    </Stack>
                    <Box sx={{ pl: 4 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Parameters:
                    </Typography>
                    <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(response.action_params, null, 2)}
                      </pre>
                    </Box>
                    </Box>
                  </ListItem>
                  </Box>
                ))}
                {sortedActionResponses.length === 0 && (
                  <Typography textAlign="center" color="text.secondary" py={4}>
                  No action responses
                  </Typography>
                )}
                </List>
            )}

            {activeTab === 'llm-req' && (
              <List>
                {llmRequests.map((request, index) => (
                  <Box key={index}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        py: 2,
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Brain className="w-5 h-5 text-purple-500" />
                        <Chip
                          label={request.stream ? 'Streaming' : 'Non-Streaming'}
                          size="small"
                          color={request.stream ? 'primary' : 'default'}
                        />
                      </Stack>
                      <Box sx={{ pl: 4 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Messages:
                        </Typography>
                        <Stack spacing={1}>
                          {request.messages.map((msg, i) => (
                            <Box
                              key={i}
                              sx={{
                                bgcolor: 'grey.50',
                                p: 2,
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                {msg.role.toUpperCase()}
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {msg.content}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </ListItem>
                  </Box>
                ))}
                {llmRequests.length === 0 && (
                  <Typography textAlign="center" color="text.secondary" py={4}>
                    No LLM requests
                  </Typography>
                )}
              </List>
            )}

            {activeTab === 'llm-res' && (
              <List>
                {sortedLLMResponses.map((response, index) => (
                  <Box key={`${response.response_uuid}-${index}`}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        py: 2,
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <BrainCog className="w-5 h-5 text-blue-500" />
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={response.first_chunk ? 'First Chunk' : response.last_chunk ? 'Last Chunk' : 'Chunk'}
                            size="small"
                            color={response.first_chunk ? 'primary' : response.last_chunk ? 'success' : 'default'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            UUID: {response.response_uuid}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Box sx={{ pl: 4 }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                          {response.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Chunk: {response.chunk}
                        </Typography>
                      </Box>
                    </ListItem>
                  </Box>
                ))}
                {sortedLLMResponses.length === 0 && (
                  <Typography textAlign="center" color="text.secondary" py={4}>
                    No LLM responses
                  </Typography>
                )}
              </List>
            )}
          </Box>
        </Collapse>
      </Card>
    </div>
  );
}