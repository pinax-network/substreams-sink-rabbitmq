import { download, createHash, Clock } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";
import client from "amqplib";

import pkg from "./package.json";

import { RabbitMq } from "./src/rabbitmq";

logger.defaultMeta = { service: pkg.name };
export { logger };

// default user options
export const DEFAULT_USERNAME = 'guest';
export const DEFAULT_PASSWORD = 'guest';
export const DEFAULT_ADDRESS = 'localhost';
export const DEFAULT_PORT = 5672;
export const DEFAULT_EXCHANGE_NAME = '';
export const DEFAULT_EXCHANGE_TYPE = 'direct';

// Custom user options interface
interface ActionOptions extends RunOptions {
    address: string;
    port: number;
    username: string;
    password: string;
    exchangeName: string;
    exchangeType: string;
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams and create hash
    const spkg = await download(manifest);
    const hash = createHash(spkg);

    // Get command options
    const { address, port, username, password, exchangeName, exchangeType } = options;

    // Initialize RabbitMQ
    const rabbitMq = new RabbitMq(username, password, address, port);
    await rabbitMq.init(exchangeName, exchangeType);
    console.log(`Connecting to RabbitMQ: ${address}:${port}`);

    // Run substreams
    const substreams = run(spkg, moduleName, options);

    substreams.on("anyMessage", async (message, _: Clock, typeName: string) => {
        const opts: client.Options.Publish = { headers: { hash, typeName } };

        rabbitMq.sendToQueue(message, opts);
        logger.info(JSON.stringify({ headers: opts.headers, message: message }));

    });

    await rabbitMq.consumeExample(exchangeName, exchangeType);

    substreams.start(options.delayBeforeStart);
}
