#!/usr/bin/env node

import { cli, logger } from "substreams-sink";
import { Option } from "commander";
import { action, DEFAULT_USERNAME, DEFAULT_PASSWORD, DEFAULT_ADDRESS, DEFAULT_PORT, DEFAULT_EXCHANGE_TYPE } from "../index.js"
import pkg from "../package.json";

const program = cli.program(pkg);
const command = cli.run(program, pkg);

command.option('-U --username <string>', 'RabbitMQ username.', DEFAULT_USERNAME)
command.option('-P --password <string>', 'RabbitMQ password.', DEFAULT_PASSWORD)
command.option('-a --address <string>', 'Address to use.', DEFAULT_ADDRESS)
command.option('-p --port <int>', 'Listens on port number.', String(DEFAULT_PORT))
command.addOption(new Option('-x --exchange-type <string>', 'Exchange type.').choices(['direct', 'topic', 'headers', 'fanout']).default(DEFAULT_EXCHANGE_TYPE))

// For 'topic' exchange type
command.option('-r --routing-key <string>', 'Routing key for "topic" exchange type.', '*')

command.action(action);
program.parse();

const options = command.opts();
if (options.exchangeType === 'topic') {
    if (!options.routingKey) logger.warn('No routing key specified for "topic" exchange type. (use -r --routing-key <string>)');
}