import { Box, useApp, useInput, Text } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChatMessage } from './types/chat-message.js';
import { MessagesRow } from './functions/messages-row.js';
import TextInput from 'ink-text-input';
import { createAgentSession } from './functions/session.js';

export default function app() {
    const { exit } = useApp();
    const [input, setInput] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const nextId = useRef(0);

    const appendMessage = (role: ChatMessage['role'], content: string) => {
        setMessages(prev => [...prev, { id: nextId.current++, role, content }]);
    };

    const session = useMemo(
        () =>
            createAgentSession({
                onAssistantText: (text: string) => {
                    setIsThinking(false);
                    appendMessage('assistant', text);
                },
                onFunctionCall: (name: string) => {
                    appendMessage('system', `calling tool: ${name}`);
                },
            }),
        [],
    );

    useEffect(() => {
        appendMessage('system', 'Type a message and press Enter. Use /exit or Ctrl+C to quit.')
    }, []);

    useInput((_input, key) => {
        if (key.escape) return exit();
    });

    const handleSubmit = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (trimmed === '/exit' || trimmed === '/quit') {
            exit();
            return;
        }
        setInput('');
        appendMessage('user', trimmed);
        setIsThinking(true);
        session.send(trimmed);
    };

    return (
        <Box flexDirection='column' padding={1}>
            <Box
                flexDirection='column'
                borderStyle='round'
                borderColor='cyan'
                paddingX={0}
                paddingY={0}
            >
                <Gradient name='pastel'>
                    <BigText text="Martin CLI" font="block" />
                </Gradient>
                <Text dimColor>Welcome! Chat with your agent. /exit to quit.</Text>
            </Box>

            <Box
                flexDirection='column'
                marginTop={1}
            >
                {messages.map(message => (
                    <MessagesRow key={message.id} messages={message} />
                ))}
                {isThinking && (
                    <Text color="yellow">
                        <Text bold>Agent</Text> is thinking…
                    </Text>
                )}
            </Box>

            <Box marginTop={1}>
                <Text color="cyan">{'> '}</Text>
                <TextInput
					value={input}
					onChange={setInput}
					onSubmit={handleSubmit}
					placeholder="ask me anything…"
				/>
            </Box>
        </Box>
    )
}
