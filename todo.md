# Features
- Add an LLM icon for 

# Minor updates
- Render Registration Messages in useMessageBalls after the position of the agents is set

# Bugs

- If the messageBall topic contains 'stimulus/gateway/gateway_input', then message type is "Gateway Message" and animate the ball from the gateway to Sam to orchestrator and set the color of the ball to rgba(59, 246, 96, 0.93)
- If the messageBall topic contains 'streamingResponse/orchestrator', then message type is "Orchestrator Response" and animate the ball from the orchestrator to sam to gateway name and set the color of the ball to rgba(59, 246, 96, 0.93). Note that gateway name is found after splitting the topic by '/' and the gateway name is the element in the array after element 'orchestrator'
