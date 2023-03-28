import { logger } from "./logger";
import client, { Connection, Channel } from "amqplib";

const QUEUE_NAME: string = 'messages'; // Replace with map module hash (needs update from 'substreams-js' lib)

type ConsumeFunction = {
    (message: string): Promise<void>;
};

export class RabbitMq {
    private readonly username: string;
    private readonly password: string;
    private readonly address: string;
    private readonly port: number;

    private connection?: Connection;
    private channel?: Channel;

    constructor(username: string, password: string, address: string, port: number) {
        this.username = username;
        this.password = password;
        this.address = address;
        this.port = port;
    }

    public async initQueue() {
        this.connection = await client.connect(`amqp://${this.username}:${this.password}@${this.address}:${this.port}`);

        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(QUEUE_NAME);
    }

    public sendToQueue(message: any) {
        if (!this.channel) {
            // err
        } else {
            this.channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
        }
    }

    public async consumeQueue(fn: ConsumeFunction) {
        if (!this.channel) {
            // err
        } else {
            await this.channel.consume(QUEUE_NAME, async (msg) => {
                if (msg !== null) {
                    await fn(msg.content.toString());

                    // Handle rate limiting here

                    this.channel!.ack(msg);
                } else {
                    console.log('Consumer cancelled by server'); // Change with proper error message
                }
            });
        }
    }
}