import { defineRuntime, RuntimeState } from "@mozaik-ai/core";

export class EnvironmentState extends RuntimeState {};

export const {
    initializeRuntime,
    join,
    leave,
    resolveParticipant,
    resolveRuntime,
    runLoop,
    sendEvent,
    sendMessage
} = defineRuntime<EnvironmentState>();