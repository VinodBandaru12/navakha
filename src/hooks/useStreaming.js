import { useRef, useCallback } from 'react';
import { streamProxy, streamOpenAI, streamAnthropic } from '../utils/streamParser';

export function useStreaming() {
  const abortRef = useRef(null);

  const stream = useCallback(async ({ provider, apiKey, accessToken, messages, onDelta }) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      // Use proxy if we have an accessToken (production path)
      if (accessToken) {
        return await streamProxy({ accessToken, provider, messages, onDelta, signal });
      }
      // Fallback: direct API call (local dev without auth)
      if (provider === 'openai') {
        return await streamOpenAI({ apiKey, messages, onDelta, signal });
      } else if (provider === 'anthropic') {
        return await streamAnthropic({ apiKey, messages, onDelta, signal });
      }
      throw new Error('Unknown provider: ' + provider);
    } finally {
      abortRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  return { stream, cancel };
}
