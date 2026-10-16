#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import meow from "meow";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import App from "./app.js";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
    quiet: true,
    path: [
        path.resolve(process.cwd(), ".env"),
        path.resolve(here, "..", "..", ".env"),
        path.resolve(here, "..", "..", "..", ".env")
    ],
});

meow(
    `
        Usage 
            $ martin-cli

        Starts an interactive chat with the agent.
    `,
    { importMeta: import.meta }
);

render(<App/>)