# [`Substreams`](https://substreams.streamingfast.io/) [`RabbitMQ`](https://www.rabbitmq.com/) CLI `Node.js`

<!-- [<img alt="github" src="" height="20">](https://github.com/pinax-network/substreams-sink-rabbitmq) -->
<!-- [<img alt="npm" src="" height="20">](https://www.npmjs.com/package/substreams-sink-rabbitmq) -->
<!-- [<img alt="GitHub Workflow Status" src="" height="20">](https://github.com/pinax-network/substreams-sink-rabbitmq/actions?query=branch%3Amain) -->

> `substreams-sink-rabbitmq` is a tool that allows developers to pipe data extracted from a blockchain to a RabbitMQ instance.

## 📖 Documentation

<!-- ### https://www.npmjs.com/package/substreams-sink-rabbitmq -->

### Further resources

- [**Substreams** documentation](https://substreams.streamingfast.io)
- [**RabbitMQ** documentation](https://www.rabbitmq.com/documentation.html)

## CLI
[**Use pre-built binaries**](https://github.com/pinax-network/substreams-sink-rabbitmq/releases)
- [x] MacOS
- [x] Linux
- [x] Windows

**Install** globally via npm
```
$ npm install -g substreams-sink-rabbitmq
```

**Run**
```
$ substreams-sink-rabbitmq run [options] <spkg>
```

## Features

### Substreams

- Consume `*.spkg` from:
  - [x] Load URL or IPFS
  - [ ] Read from `*.spkg` local filesystem
  - [ ] Read from `substreams.yaml` local filesystem
- [x] Handle `cursor` restart

### RabbitMQ

- [X] Handle `direct` exchange type
- [X] Handle `fanout` exchange type
- [X] Handle `topic` exchange type with routing key
- [X] Handle `headers` exchange type
- [X] Handle `durable` exchange flag