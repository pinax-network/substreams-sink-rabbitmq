import fs from "node:fs";
import { Substreams, download, unpack } from "substreams";
import { RabbitMq } from "./src/rabbitmq";
import { timeout } from "./src/utils";
import * as EntityChanges from "./src/EntityChanges";
import { logger } from "./src/logger";

// default substreams options
export const DEFAULT_SUBSTREAMS_API_TOKEN_ENV = 'SUBSTREAMS_API_TOKEN';
export const DEFAULT_OUTPUT_MODULE = 'entity_out';
export const DEFAULT_CURSOR_FILE = 'cursor.lock'
export const DEFAULT_SUBSTREAMS_ENDPOINT = 'https://mainnet.eth.streamingfast.io:443';

// default user options
export const DEFAULT_USERNAME = 'guest';
export const DEFAULT_PASSWORD = 'guest';
export const DEFAULT_ADDRESS = 'localhost';
export const DEFAULT_PORT = 5672;

export async function run(spkg: string, options: {
    // substreams options
    outputModule?: string,
    startBlock?: string,
    stopBlock?: string,
    substreamsEndpoint?: string,
    substreamsApiTokenEnvvar?: string,
    substreamsApiToken?: string,
    delayBeforeStart?: string,
    cursorFile?: string,
    // user options
    username?: string,
    password?: string,
    address?: string,
    port?: string,
} = {}) {
    // Substreams options
    const outputModule = options.outputModule ?? DEFAULT_OUTPUT_MODULE;
    const substreamsEndpoint = options.substreamsEndpoint ?? DEFAULT_SUBSTREAMS_ENDPOINT;
    const substreams_api_token_envvar = options.substreamsApiTokenEnvvar ?? DEFAULT_SUBSTREAMS_API_TOKEN_ENV;
    const substreams_api_token = options.substreamsApiToken ?? process.env[substreams_api_token_envvar];
    const cursorFile = options.cursorFile ?? DEFAULT_CURSOR_FILE;

    // user options
    const username = options.username ?? DEFAULT_USERNAME;
    const password = options.password ?? DEFAULT_PASSWORD;
    const port = Number(options.port ?? DEFAULT_PORT);
    const address = options.address ?? DEFAULT_ADDRESS;

    // Required
    if (!outputModule) throw new Error('[output-module] is required');
    if (!substreams_api_token) throw new Error('[substreams-api-token] is required');

    // read cursor file
    let startCursor = fs.existsSync(cursorFile) ? fs.readFileSync(cursorFile, 'utf8') : "";

    // Delay before start
    if (options.delayBeforeStart) await timeout(Number(options.delayBeforeStart) * 1000);

    // Download Substream from URL or IPFS
    const binary = await download(spkg);

    // Initialize Substreams
    const substreams = new Substreams(binary, outputModule, {
        host: substreamsEndpoint,
        startBlockNum: options.startBlock,
        stopBlockNum: options.stopBlock,
        startCursor,
        authorization: substreams_api_token,
    });

    // Initialize RabbitMQ
    const rabbitMq = new RabbitMq(username, password, address, port);
    await rabbitMq.initQueue();

    // Find Protobuf message types from registry
    const message = EntityChanges.findMessage(binary);

    substreams.on("mapOutput", async output => {
        const decoded = EntityChanges.decode(message, output);
        if ( !decoded ) return; // skip if not EntityChanges

        // Send messages to queue
        for (const entityChange of decoded) {
            logger.info(JSON.stringify(entityChange));
            rabbitMq.sendToQueue(entityChange);
        }
    });

    substreams.on("cursor", cursor => {
        fs.writeFileSync(cursorFile, cursor);
    });

    // start streaming Substream
    await substreams.start();
}
