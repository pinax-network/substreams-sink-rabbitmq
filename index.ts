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
    await rabbitMq.init();
    console.log(`Connecting to RabbitMQ: ${address}:${port}`);

    // Run substreams
    const substreams = run(spkg, moduleName, options);

    substreams.on("anyMessage", async (message, _: Clock, typeName: string) => {
        const opts: client.Options.Publish = { headers: { hash, typeName } };

        // console.log({ hash, outputModule: substreams.outputModule, typeName, message: message });

        rabbitMq.sendToQueue(message, opts);
        // logger.info(JSON.stringify({ headers: opts.headers, message: message }));

    });

    // await rabbitMq.consumeTest();

    substreams.start(options.delayBeforeStart);
}
