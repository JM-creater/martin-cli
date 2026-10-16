import { Agent, createAgent, Participant, SemanticEvent, SituationSpecification, type InferenceInput, type SituationContext, type SituationHandler, type SituationProcessor } from "@mozaik-ai/core";
import { runLoop } from "../functions/runtime.js";
import { terminalTools } from "./tools.js";

class MessageSentSpecification extends SituationSpecification {
    isSatisfiedBy({ event, participant }: SituationContext): boolean {
        return event.type === 'message.sent' && event.producerId !== participant.getId();
    }
};

class InferenceProcessor implements SituationProcessor {
    apply({ event, participant }: SituationContext): void | Promise<void> {
        if (!(participant instanceof Agent)) {
            return;
        }

        const { message } = event.payload as { message: string };
        const inferenceInput: InferenceInput = {
            model: 'gemini-3.5-flash-lite',
            context: participant.getMemory().getContext(),
            tools: participant.getTools()
        };

        runLoop(participant.getId(), message, inferenceInput);
    }
}

const messageSentHandler: SituationHandler = {
    specification: new MessageSentSpecification(),
    processor: new InferenceProcessor()
}

export function createTerminalAgent() {
    return createAgent({
		name: 'Terminal Agent',
		capabilities: ['inference'],
		instruction: `You are a terminal agent. You can run commands in the terminal to help the user with their request.`,
		tools: terminalTools,
		handlers: [messageSentHandler],
	});
}