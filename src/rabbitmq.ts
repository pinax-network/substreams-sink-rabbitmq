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

    public async init(exchangeName: string, exchangeType: string, exchangeOpts: any) {

        try {
            this.connection = await client.connect(`amqp://${this.username}:${this.password}@${this.address}:${this.port}`);
            this.channel = await this.connection.createChannel();

            this.exchangeName = exchangeName;

            await this.channel.assertExchange(this.exchangeName, exchangeType, exchangeOpts);
        } catch (error) {
            logger.error(`Unable to connect to RabbitMQ instance on ${this.address}:${this.port} and create channel.`);
            process.exit(1);
        }

        this.isInit = true;
    }

    public sendToQueue(message: any, opts?: any) {
        if (!this.isInit) {
            logger.error('RabbitMQ not initialized. You need to run RabbitMq.init() first.');
            process.exit(1);
        }

        message = JSON.stringify(message);

        const published: boolean = this.channel!.publish(this.exchangeName!, opts && opts.routingKey ? opts.routingKey : '', Buffer.from(message), opts && opts.headers ? opts : undefined);
        if (!published) logger.error('Unable to send message to queue.', message);
        else logger.info(message); // TODO less logging
    }
}
