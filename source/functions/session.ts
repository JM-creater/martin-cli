import { createHuman, supportedModels } from "@mozaik-ai/core";
import { createTerminalAgent } from "../terminal/agent.js";
import type { AgentListeners } from "../types/agent-listener.js";
import type { AgentSession } from "../types/agent-session.js";
import { EnvironmentState, initializeRuntime, sendMessage, join } from "./runtime.js";
import { createUIUpdater } from "./ui-updater.js";

const patchGeminiThoughtSignatures = () => {
    for (const model of supportedModels) {
        if (model.specification.provider === 'google') {
            const endpoint = (model as any).endpoint;
            const mapper = endpoint?.endpointMapper;
            if (!mapper || mapper._thoughtSignaturePatched) continue;
            mapper._thoughtSignaturePatched = true;

            const originalToResponse = mapper.toResponse.bind(mapper);
            const originalToRequest = mapper.toRequest.bind(mapper);

            mapper.toResponse = function (response: any) {
                const result = originalToResponse(response);
                const parts: any[] = response.candidates?.[0]?.content?.parts ?? [];

                let lastSig: string | undefined;
                let fnIndex = 0;
                const fnItems = result.items.filter((i: any) => i.type === 'function_call');

                for (const part of parts) {
                    const sig = part.thoughtSignature ?? part.thought_signature;
                    if (sig) {
                        lastSig = sig;
                    }
                    if (part.functionCall) {
                        const item = fnItems[fnIndex++];
                        if (item) {
                            (item as any).thoughtSignature = sig ?? lastSig;
                        }
                    }
                }

                return result;
            };

            mapper.toRequest = function (inferenceInput: any) {
                const request = originalToRequest(inferenceInput);
                const fnItems = (inferenceInput.context.getItems() as any[])
                    .filter((item: any) => item.type === 'function_call');

                let reqFnIndex = 0;
                const contents: any[] = request.contents ?? [];

                for (const content of contents) {
                    if (content.role === 'model') {
                        for (const part of content.parts ?? []) {
                            if (part.functionCall) {
                                const matchedItem = (part.functionCall.id && fnItems.find((i:
                                    any) => i.callId === part.functionCall.id))
                                    ?? fnItems[reqFnIndex];
                                reqFnIndex++;

                                const sig = (matchedItem as any)?.thoughtSignature;
                                if (sig) {
                                    part.thoughtSignature = sig;
                                    part.thought_signature = sig;
                                }
                            }
                        }
                    }
                }

                return request;
            };
        }
    }
}

patchGeminiThoughtSignatures();

initializeRuntime({ state: new EnvironmentState() });

export function createAgentSession(listeners: AgentListeners): AgentSession {
    const agent = createTerminalAgent();
    const uiUpdater = createUIUpdater(listeners);
    const user = createHuman({
        name: 'User',
        capabilities: [],
        handlers: []
    });

    join(user);
    join(agent);
    join(uiUpdater);

    return {
        send: (message: string) => sendMessage(message, user.getId()),
    };
}
