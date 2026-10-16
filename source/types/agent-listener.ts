export type AgentListeners = {
    onAssistantText: (text: string) => void;
    onFunctionCall?: (name: string) => void;
}