#!/usr/bin/env node

import { cli } from "substreams-sink";

import { Option } from "commander";
import { action, DEFAULT_USERNAME, DEFAULT_PASSWORD, DEFAULT_ADDRESS, DEFAULT_PORT, DEFAULT_EXCHANGE_TYPE, DEFAULT_EXCHANGE_DURABLE } from "../index.js"

import pkg from "../package.json" assert { type: "json" };

const program = cli.program(pkg);
const command = cli.option(program, pkg);

command.option('-U --username <string>', 'RabbitMQ username.', DEFAULT_USERNAME)
command.option('-X --password <string>', 'RabbitMQ password.', DEFAULT_PASSWORD)
command.option('-a --address <string>', 'Address to use.', DEFAULT_ADDRESS)
command.option('-P --port <int>', 'Listens on port number.', String(DEFAULT_PORT))
command.addOption(new Option('-x --exchange-type <string>', 'Exchange type.').choices(['direct', 'topic', 'headers', 'fanout']).default(DEFAULT_EXCHANGE_TYPE))
command.option('-d --exchange-durable', 'Enable exchange durable flag.', DEFAULT_EXCHANGE_DURABLE)

// For 'topic' exchange type
command.option('-r --routing-key <string>', 'Routing key for "topic" exchange type.', '*')

command.action(action);
program.parse();
