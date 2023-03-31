import { logger } from "substreams-sink";
import client, { Connection, Channel } from "amqplib";

const EXCHANGE_NAME: string = 'headers-exchange';

export class RabbitMq {
    private readonly username: string;
    private readonly password: string;
    private readonly address: string;
    private readonly port: number;

    private connection?: Connection;
    private channel?: Channel;
    private isInit: boolean = false;

    constructor(username: string, password: string, address: string, port: number) {
        this.username = username;
        this.password = password;
        this.address = address;
        this.port = port;
    }

    public async init() {
        this.connection = await client.connect(`amqp://${this.username}:${this.password}@${this.address}:${this.port}`);
        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange(EXCHANGE_NAME, 'headers', { durable: false });

        this.isInit = true;
    }

    public sendToQueue(message: any, opts: client.Options.Publish) {
        if (!this.isInit) {
            logger.error(JSON.stringify({ message: 'RabbitMQ not initialized. You need to run RabbitMq.init() first.' }));
        }

        this.channel!.publish(EXCHANGE_NAME, '', Buffer.from(JSON.stringify(message)), opts);
    }

    public async consumeTest() {
        await this.channel!.assertExchange(EXCHANGE_NAME, 'headers', {
            durable: false
        });

        const q = await this.channel!.assertQueue('', { exclusive: true });

        await this.channel!.bindQueue(q.queue, EXCHANGE_NAME, '');

        await this.channel!.consume(q.queue, (msg: any) => {
            if (msg !== null) {
                console.log(msg.content.toString());
            }
        });
    }
}