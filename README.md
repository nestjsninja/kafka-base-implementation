# Kafka Base Implementation

Base Nx monorepo with two NestJS applications that communicate through Kafka using shared infrastructure code.

The goal of this repository is to provide a small but complete example that can be reused when adding more NestJS apps that need Kafka messaging.

## What Is Included

- `apps/producer-api`: NestJS HTTP API that publishes messages to Kafka and receives processed responses.
- `apps/consumer-api`: NestJS app that consumes messages from Kafka, processes them, and publishes a response event.
- `apps/dashboard`: Next.js dashboard that calls the APIs and lets you trigger the Kafka flow from a browser.
- `libs/core/env`: environment helper used by config factories.
- `libs/core/kafka`: shared Kafka module, Kafka service, Kafka admin service, and Kafka bootstrap helpers.
- `libs/components/example-messaging`: demo topic names, topic creation config, event contracts, and startup module used by both apps.
- `docker-compose.yml`: local Kafka broker plus Kafbat Kafka UI.
- `.env.example`: documented local environment defaults.

## Requirements

Install these before running the project:

- Node.js
- npm
- Docker Desktop, or another Docker runtime with Docker Compose support

Check your local tools:

```sh
node --version
npm --version
docker --version
docker compose version
```

Docker must be running before starting Kafka.

## First Setup

Install dependencies:

```sh
npm install
```

Create your local env file:

```sh
cp .env.example .env
```

The default `.env` values are ready for local development:

```env
KAFKA_BROKERS=localhost:9094
KAFKA_EXTERNAL_PORT=9094
KAFKA_UI_PORT=8080

PRODUCER_API_PORT=3000
PRODUCER_KAFKA_CLIENT_ID=producer-api-client
PRODUCER_KAFKA_GROUP_ID=producer-api-group

CONSUMER_API_PORT=3001
CONSUMER_KAFKA_CLIENT_ID=consumer-api-client
CONSUMER_KAFKA_GROUP_ID=consumer-api-group

DASHBOARD_PORT=4200
NEXT_PUBLIC_PRODUCER_API_URL=http://localhost:3000/api
NEXT_PUBLIC_CONSUMER_API_URL=http://localhost:3001/api
NEXT_PUBLIC_KAFKA_UI_URL=http://localhost:8080
```

## Ports

| Service                    | URL / Address               | Purpose                                                      |
| -------------------------- | --------------------------- | ------------------------------------------------------------ |
| Producer API               | `http://localhost:3000/api` | Publishes messages and shows processed responses             |
| Consumer API               | `http://localhost:3001/api` | Shows messages received from Kafka                           |
| Dashboard                  | `http://localhost:4200`     | Browser UI for sending messages and checking results         |
| Kafka broker for host apps | `localhost:9094`            | Used by the NestJS apps running on your machine              |
| Kafka broker inside Docker | `kafka:9092`                | Used by Kafbat UI inside Docker                              |
| Kafbat Kafka UI            | `http://localhost:8080`     | Browser UI for topics, messages, consumers, and broker state |

Kafka uses two listeners because the NestJS apps run on the host machine while Kafbat UI runs inside Docker.

## Run Everything

Start Kafka, Kafbat UI, the producer API, the consumer API, and the dashboard:

```sh
npm run dev
```

Open the dashboard:

```sh
http://localhost:4200
```

From there you can publish messages, refresh consumed/processed messages, and open Kafka UI.

To run services manually instead, start Kafka and Kafbat UI:

```sh
npm run kafka:up
```

Open Kafka UI:

```sh
http://localhost:8080
```

Start the producer app in one terminal:

```sh
npm run serve:producer
```

Start the consumer app in another terminal:

```sh
npm run serve:consumer
```

Start the dashboard in another terminal:

```sh
npm run serve:dashboard
```

Or start both NestJS APIs together:

```sh
npm run serve:apis
```

Both apps must be running to see the full round trip.

## Test The Kafka Flow

Send a message through the producer API:

```sh
curl -X POST http://localhost:3000/api/messages \
  -H 'Content-Type: application/json' \
  -d '{"text":"hello kafka"}'
```

Expected response shape:

```json
{
  "topic": "example.message.created",
  "event": {
    "id": "...",
    "text": "hello kafka",
    "source": "producer-api",
    "createdAt": "..."
  }
}
```

Check that the consumer received the Kafka message:

```sh
curl http://localhost:3001/api/received
```

Expected result includes the original message:

```json
[
  {
    "id": "...",
    "text": "hello kafka",
    "source": "producer-api",
    "createdAt": "..."
  }
]
```

Check that the producer received the processed response from the consumer:

```sh
curl http://localhost:3000/api/processed
```

Expected result includes the processed message:

```json
[
  {
    "id": "...",
    "text": "hello kafka",
    "source": "producer-api",
    "createdAt": "...",
    "processedBy": "consumer-api",
    "processedAt": "...",
    "result": "HELLO KAFKA"
  }
]
```

## Message Flow

1. `producer-api` receives `POST /api/messages`.
2. `producer-api` publishes `example.message.created`.
3. `consumer-api` consumes `example.message.created`.
4. `consumer-api` stores the received event in memory.
5. `consumer-api` publishes `example.message.processed`.
6. `producer-api` consumes `example.message.processed`.
7. `producer-api` stores the processed event in memory.

The in-memory arrays are only for the demo. Restarting an app clears its displayed received/processed messages.

## Kafka UI

Kafbat UI is started by Docker Compose with the `kafka-ui` service:

```yaml
kafka-ui:
  image: ghcr.io/kafbat/kafka-ui:latest
  ports:
    - '${KAFKA_UI_PORT:-8080}:8080'
  environment:
    DYNAMIC_CONFIG_ENABLED: 'true'
    KAFKA_CLUSTERS_0_NAME: local
    KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9092
```

Use it to inspect:

- Topics: `example.message.created` and `example.message.processed`
- Messages published to each topic
- Consumer groups: `producer-api-group` and `consumer-api-group`
- Broker health and cluster metadata

Kafka topics are explicitly created by `ExampleMessagingModule` on app startup. The local broker also has `KAFKA_AUTO_CREATE_TOPICS_ENABLE` enabled as a fallback for local development.

## Backend Library Layout

This repo follows a backend library split similar to `floxgen-microservices`:

- `libs/core/*`: low-level infrastructure that can be reused by many apps and components.
- `libs/components/*`: reusable business/domain components built on top of core capabilities.

Current libraries:

- `libs/core/kafka`: Kafka transport and admin infrastructure for NestJS.
- `libs/core/env`: `Env.getValue(...)` and `Env.getIntValue(...)`, used by config factories.
- `libs/components/example-messaging`: example Kafka topics, topic creation config, module initializer, and event payload contracts.

Use `core` for things like messaging, persistence, logging, config, auth, or other infrastructure.
Use `components` for reusable business modules that model app behavior or domain workflows.

## Shared Kafka Core Library

The Kafka infrastructure library is imported with:

```ts
import { KafkaModule, KafkaService } from '@kafka-base-implementation/core/kafka';
```

Main core pieces:

- `KafkaModule.registerAsync(...)`: registers a Kafka client using Nest module config.
- `KafkaService.emit(topic, payload)`: publishes Kafka events.
- `KafkaAdminService.ensureTopics(...)`: creates required Kafka topics with explicit topic config.
- `createKafkaMicroserviceOptions(...)`: creates the Nest Kafka microservice transport options used in `main.ts`.

## Example Messaging Component

The demo message contracts are imported with:

```ts
import { EXAMPLE_TOPICS, ExampleMessageCreatedEvent, ExampleMessageProcessedEvent } from '@kafka-base-implementation/components/example-messaging';
```

Main component pieces:

- `ExampleMessagingModule.register({ ensureTopics: true })`: opts an app into creating the example Kafka topics on startup.
- `EXAMPLE_KAFKA_TOPICS`: topic creation config with partitions, replication factor, and retention settings.
- `EXAMPLE_TOPICS`: shared topic names.
- `ExampleMessageCreatedEvent` and `ExampleMessageProcessedEvent`: shared event contracts.

The path alias is configured in `tsconfig.base.json`.

## Configuration

Both apps load `.env` through `ConfigModule.forRoot()` in their app modules.

Environment reads should go through config factories that follow this shape:

```ts
import { registerAs } from '@nestjs/config';
import { Env } from '@kafka-base-implementation/core/env';

export const ExampleConfig = registerAs('exampleConfig', () => {
  return {
    value: Env.getValue('EXAMPLE_VALUE', 'default'),
  };
});
```

Avoid spreading direct `process.env` reads through app modules and services.

Producer config:

- `PRODUCER_API_PORT`
- `PRODUCER_KAFKA_CLIENT_ID`
- `PRODUCER_KAFKA_GROUP_ID`

Consumer config:

- `CONSUMER_API_PORT`
- `CONSUMER_KAFKA_CLIENT_ID`
- `CONSUMER_KAFKA_GROUP_ID`

Shared Kafka config:

- `KAFKA_BROKERS`: comma-separated broker list for apps running on the host
- `KAFKA_EXTERNAL_PORT`: host port exposed by Docker Compose for Kafka
- `KAFKA_UI_PORT`: host port exposed by Docker Compose for Kafbat UI

Dashboard config:

- `DASHBOARD_PORT`
- `NEXT_PUBLIC_PRODUCER_API_URL`
- `NEXT_PUBLIC_CONSUMER_API_URL`
- `NEXT_PUBLIC_KAFKA_UI_URL`

Example with multiple brokers:

```env
KAFKA_BROKERS=localhost:9094,localhost:9095
```

## Useful Commands

Start Kafka and Kafka UI:

```sh
npm run kafka:up
```

Start the full local environment:

```sh
npm run dev
```

Stop Kafka and Kafka UI:

```sh
npm run kafka:down
```

Run producer:

```sh
npm run serve:producer
```

Run consumer:

```sh
npm run serve:consumer
```

Run both NestJS APIs:

```sh
npm run serve:apis
```

Run dashboard:

```sh
npm run serve:dashboard
```

Run tests:

```sh
npm test
```

Build both apps:

```sh
npx nx run-many -t build --all
```

Lint all projects:

```sh
npx nx run-many -t lint --all
```

Open the Nx project graph:

```sh
npx nx graph
```

## Troubleshooting

If `npm run kafka:up` cannot connect to Docker:

```txt
Cannot connect to the Docker daemon
```

Start Docker Desktop and run the command again.

If the apps cannot connect to Kafka, confirm Docker is running and Kafka is listening on the expected host port:

```sh
docker compose ps
```

The NestJS apps should use:

```env
KAFKA_BROKERS=localhost:9094
```

Kafbat UI should use:

```txt
kafka:9092
```

If the dashboard shows `net::ERR_CONNECTION_REFUSED` for `http://localhost:3000/api/messages`, the producer API is not running. Start the full stack with `npm run dev`, or run `npm run serve:apis` and `npm run serve:dashboard` in separate terminals.

If ports `3000`, `3001`, `4200`, `8080`, or `9094` are already in use, change the matching values in `.env`.

If Kafka UI opens but topics are not visible yet, publish a message first. The local Kafka broker auto-creates topics when the first message is produced.

If `/api/processed` is empty, make sure both apps are running. The producer only receives the processed response while it is online and subscribed to `example.message.processed`.

## Clean Up

Stop the containers:

```sh
npm run kafka:down
```

Remove Kafka data as well:

```sh
docker compose down -v
```

Use the volume removal command only when you want to delete local Kafka topic data.
