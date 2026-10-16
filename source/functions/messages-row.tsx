import { Box, useApp, useInput, Text } from 'ink';
import type { ChatMessage } from '../types/chat-message.js'

export const MessagesRow = ({ messages }: { messages: ChatMessage }) => {

    if (messages.role === 'assistant') {
        return (
            <Box borderStyle="round" borderColor="green">
                <Text>
                    · {messages.content}
                </Text>
            </Box>
        )
    }

    const label = messages.role === 'user' ? '' : '';
    const color = messages.role === 'user' ? 'green' : 'magenta';

    return (
        <Box flexDirection="column" marginBottom={0}>
            <Text>
                <Text>{messages.content}</Text>
            </Text>
        </Box>
    )
}
