export interface ExampleMessageCreatedEvent {
  id: string;
  text: string;
  source: string;
  createdAt: string;
}

export interface ExampleMessageProcessedEvent
  extends ExampleMessageCreatedEvent {
  processedBy: string;
  processedAt: string;
  result: string;
}
