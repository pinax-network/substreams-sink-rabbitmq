import { logger } from "substreams-sink";
import client, { Connection, Channel } from "amqplib";

export class RabbitMq {
    private readonly username: string;
    private readonly password: string;
    private readonly address: string;
    private readonly port: number;

    private connection?: Connection;
    private channel?: Channel;
    private exchangeName?: string;
    private isInit: boolean = false;

    constructor(username: string, password: string, address: string, port: number) {
        this.username = username;
        this.password = password;
        this.address = address;
        this.port = port;
    }

    public async init(exchangeName: string, exchangeType: string) {
        this.connection = await client.connect(`amqp://${this.username}:${this.password}@${this.address}:${this.port}`);
        this.channel = await this.connection.createChannel();
        this.exchangeName = exchangeName;

        await this.channel.assertExchange(this.exchangeName, exchangeType, { durable: false });

        this.isInit = true;
    }

    public sendToQueue(message: any, opts: client.Options.Publish) {
        if (!this.isInit) {
            logger.error(JSON.stringify({ message: 'RabbitMQ not initialized. You need to run RabbitMq.init() first.' }));
        }

        this.channel!.publish(this.exchangeName!, '', Buffer.from(JSON.stringify(message)), opts);
    }

    public async consumeExample(exchangeName: string, exchangeType: string) {
        await this.channel!.assertExchange(exchangeName, exchangeType, {
            durable: false
        });

        const q = await this.channel!.assertQueue('', { exclusive: false });

        // Only keeps messages from substream with corresponding 'hash' and of type 'LoggerOperations'
        await this.channel!.bindQueue(q.queue, exchangeName, '', {
            'hash': '3bce202508f8120728564d7d8265e3317fbbdf1ec623896865bbd6584e203f01',
            'typeName': 'pinax.substreams.sink.winston.v1.LoggerOperations'
        });

        await this.channel!.consume(q.queue, (msg: any) => {
            if (msg !== null) {
                console.log(msg.content.toString());
            }
        });
    }
}