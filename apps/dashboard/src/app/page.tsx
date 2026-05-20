'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

interface MessageCreatedEvent {
  id: string;
  text: string;
  source: string;
  createdAt: string;
}

interface MessageProcessedEvent extends MessageCreatedEvent {
  processedBy: string;
  processedAt: string;
  result: string;
}

interface PublishResponse {
  topic: string;
  event: MessageCreatedEvent;
}

const producerApiUrl =
  process.env['NEXT_PUBLIC_PRODUCER_API_URL'] ?? 'http://localhost:3000/api';
const consumerApiUrl =
  process.env['NEXT_PUBLIC_CONSUMER_API_URL'] ?? 'http://localhost:3001/api';
const kafkaUiUrl =
  process.env['NEXT_PUBLIC_KAFKA_UI_URL'] ?? 'http://localhost:8080';

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export default function Index() {
  const [messageText, setMessageText] = useState('hello kafka');
  const [isLoading, setIsLoading] = useState(false);
  const [lastPublished, setLastPublished] = useState<PublishResponse | null>(
    null,
  );
  const [receivedMessages, setReceivedMessages] = useState<
    MessageCreatedEvent[]
  >([]);
  const [processedMessages, setProcessedMessages] = useState<
    MessageProcessedEvent[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const endpoints = useMemo(
    () => [
      { label: 'Producer API', value: producerApiUrl },
      { label: 'Consumer API', value: consumerApiUrl },
      { label: 'Kafka UI', value: kafkaUiUrl },
    ],
    [],
  );

  const refreshMessages = useCallback(async () => {
    const [received, processed] = await Promise.all([
      getJson<MessageCreatedEvent[]>(`${consumerApiUrl}/received`),
      getJson<MessageProcessedEvent[]>(`${producerApiUrl}/processed`),
    ]);

    setReceivedMessages(received);
    setProcessedMessages(processed);
  }, []);

  const publishMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${producerApiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: messageText }),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const published = (await response.json()) as PublishResponse;
      setLastPublished(published);

      window.setTimeout(() => {
        refreshMessages().catch((refreshError: unknown) => {
          setError(
            refreshError instanceof Error
              ? refreshError.message
              : 'Unable to refresh messages',
          );
        });
      }, 500);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to publish message',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMessages().catch((refreshError: unknown) => {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Unable to load current messages',
      );
    });
  }, [refreshMessages]);

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Kafka demo workspace</p>
          <h1>Producer, consumer, and Kafka UI</h1>
        </div>
        <a className="secondary-link" href={kafkaUiUrl} target="_blank">
          Open Kafka UI
        </a>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Send a message</h2>
            <p>
              This calls the producer API, which publishes to Kafka. The
              consumer handles the event and sends a processed response.
            </p>
          </div>
        </div>

        <form className="message-form" onSubmit={publishMessage}>
          <input
            aria-label="Message text"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Message text"
          />
          <button disabled={isLoading || !messageText.trim()} type="submit">
            {isLoading ? 'Sending...' : 'Publish message'}
          </button>
          <button
            className="ghost-button"
            onClick={() => refreshMessages()}
            type="button"
          >
            Refresh
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="grid">
        <MessageList
          emptyText="No published message in this dashboard session."
          messages={lastPublished ? [lastPublished.event] : []}
          title="Last published"
        />
        <MessageList
          emptyText="No messages consumed yet."
          messages={receivedMessages}
          title="Consumer received"
        />
        <MessageList
          emptyText="No processed messages received yet."
          messages={processedMessages}
          title="Producer processed responses"
        />
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Runtime endpoints</h2>
            <p>These values come from `NEXT_PUBLIC_*` environment variables.</p>
          </div>
        </div>
        <div className="endpoint-list">
          {endpoints.map((endpoint) => (
            <div className="endpoint-row" key={endpoint.label}>
              <span>{endpoint.label}</span>
              <code>{endpoint.value}</code>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function MessageList({
  emptyText,
  messages,
  title,
}: {
  emptyText: string;
  messages: Array<MessageCreatedEvent | MessageProcessedEvent>;
  title: string;
}) {
  return (
    <article className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        <span className="count">{messages.length}</span>
      </div>

      <div className="message-list">
        {messages.length ? (
          messages.map((message, index) => (
            <pre key={`${title}-${message.id}-${index}`}>
              {JSON.stringify(message, null, 2)}
            </pre>
          ))
        ) : (
          <p className="empty">{emptyText}</p>
        )}
      </div>
    </article>
  );
}
