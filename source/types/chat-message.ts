export type ChatMessage = {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
}