import { fetchSubstream, createHash } from "@substreams/core";
import { run, logger, cli } from "substreams-sink";

import pkg from "./package.json" assert { type: "json" };

import { RabbitMq } from "./src/rabbitmq.js";

logger.setName(pkg.name);
export { logger };

// default user options
export const DEFAULT_USERNAME = 'guest';
export const DEFAULT_PASSWORD = 'guest';
export const DEFAULT_ADDRESS = 'localhost';
export const DEFAULT_PORT = 5672;
export const DEFAULT_EXCHANGE_TYPE = 'direct';
export const DEFAULT_EXCHANGE_DURABLE = false;

// Custom user options interface
interface ActionOptions extends cli.RunOptions {
    address: string;
    port: number;
    username: string;
    password: string;
    exchangeType: string;
    exchangeDurable: boolean;
    routingKey: string;
}

export async function action(options: ActionOptions) {
    // Download substreams and create hash
    const spkg = await fetchSubstream(options.manifest!);
    const hash = await createHash(spkg.toBinary());

    // Get command options
    const { address, port, username, password, exchangeType, exchangeDurable, routingKey } = options;

    // Initialize RabbitMQ
    const rabbitMq = new RabbitMq(username, password, address, port);
    await rabbitMq.init(options.substreamsEndpoint!, exchangeType, { durable: exchangeDurable });
    logger.info(`Connecting to RabbitMQ: ${address}:${port}`);

    // Run substreams
    const substreams = run(spkg, options);

    substreams.on("anyMessage", async (message) => {
        let opts: any | undefined;

        switch (exchangeType) {
            case "headers": {
                opts = { headers: { hash, moduleName: options.moduleName } };
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
    });

    substreams.start(options.delayBeforeStart);
}
