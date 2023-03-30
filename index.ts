import { download, createHash } from "substreams";
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

// Custom user options interface
interface ActionOptions extends RunOptions {
    address: string;
    port: number;
    username: string;
    password: string;
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams and create hash
    const spkg = await download(manifest);
    const hash = createHash(spkg);

    // Get command options
    const { address, port, username, password } = options;

    // Initialize RabbitMQ
    const rabbitMq = new RabbitMq(username, password, address, port);
    await rabbitMq.initQueue();
    console.log(`Connecting to RabbitMQ: ${address}:${port}`);

    // Run substreams
    const substreams = run(spkg, moduleName, options);
    substreams.on("anyMessage", message => {
        logger.info(JSON.stringify({ hash, outputModule: substreams.outputModule, message }));
        rabbitMq.sendToQueue({ hash, outputModule: substreams.outputModule, message });
    });

    substreams.start(options.delayBeforeStart);
}
