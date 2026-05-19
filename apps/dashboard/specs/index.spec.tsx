import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Page from '../src/app/page';

describe('Page', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render successfully', async () => {
    const { getByText } = render(<Page />);
    expect(getByText('Producer, consumer, and Kafka UI')).toBeTruthy();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
