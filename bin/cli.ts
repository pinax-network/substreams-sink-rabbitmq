#!/usr/bin/env node

import { cli } from "substreams-sink";
import { action, DEFAULT_USERNAME, DEFAULT_PASSWORD, DEFAULT_ADDRESS, DEFAULT_PORT } from "../index.js"
import pkg from "../package.json";

const program = cli.program(pkg);
const command = cli.run(program, pkg);
command.option('-U --username <string>', 'RabbitMQ username.', DEFAULT_USERNAME)
command.option('-P --password <string>', 'RabbitMQ password.', DEFAULT_PASSWORD)
command.option('-p --port <int>', 'Listens on port number.', String(DEFAULT_PORT))
command.option('-a --address <string>', 'Address to use', DEFAULT_ADDRESS)
command.action(action);
program.parse();