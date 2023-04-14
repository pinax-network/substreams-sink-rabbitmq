import { createHash, download } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";

import pkg from "./package.json";

import { RabbitMq } from "./src/rabbitmq";

logger.defaultMeta = { service: pkg.name };
export { logger };

// default user options
export const DEFAULT_USERNAME = 'guest';
export const DEFAULT_PASSWORD = 'guest';
export const DEFAULT_ADDRESS = 'localhost';
export const DEFAULT_PORT = 5672;
export const DEFAULT_EXCHANGE_NAME = 'exchange'; // TODO Replace with hash
export const DEFAULT_EXCHANGE_TYPE = 'direct';

// Custom user options interface
interface ActionOptions extends RunOptions {
    address: string;
    port: number;
    username: string;
    password: string;
    exchangeType: string;
    routingKey: string;
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams and create hash
    const spkg = await download(manifest);
    const hash = createHash(spkg);

    // Get command options
    const { address, port, username, password, exchangeType, routingKey } = options;

    // Initialize RabbitMQ
    const rabbitMq = new RabbitMq(username, password, address, port);
    await rabbitMq.init(options.substreamsEndpoint!, exchangeType);
    console.log(`Connecting to RabbitMQ: ${address}:${port}`);

    // Run substreams
    const substreams = run(spkg, moduleName, options);

    substreams.on("anyMessage", async (message) => {
        let opts: any | undefined;

        switch (exchangeType) {
            case "headers": {
                opts = { headers: { hash, moduleName } };
                break;
            }
            case "topic": {
                opts = { routingKey };
                break;
            }
            default: {
                break;
            }
        }

        rabbitMq.sendToQueue(message, opts);
        logger.info(JSON.stringify({ message: message }));

    });

    substreams.start(options.delayBeforeStart);
}
