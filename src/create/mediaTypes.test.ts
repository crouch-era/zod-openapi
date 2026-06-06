import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { createDocument } from '../index.js';

describe('components.mediaTypes', () => {
  it('emits a reusable media type and resolves its itemSchema into components.schemas', () => {
    const AgentEvent = z
      .object({ event: z.string(), data: z.unknown() })
      .meta({ id: 'AgentEvent' });

    const document = createDocument({
      openapi: '3.2.0',
      info: { title: 'test', version: '1.0.0' },
      components: {
        mediaTypes: {
          AgentEventStream: {
            itemSchema: AgentEvent,
            examples: {
              step: { summary: 'Step', dataValue: { event: 'step_start' } },
            },
          },
        },
      },
    });

    expect(document.components?.mediaTypes?.AgentEventStream).toEqual({
      itemSchema: { $ref: '#/components/schemas/AgentEvent' },
      schema: undefined,
      examples: {
        step: { summary: 'Step', dataValue: { event: 'step_start' } },
      },
    });
    expect(document.components?.schemas?.AgentEvent).toBeDefined();
  });

  it('passes a $ref media type in content straight through', () => {
    const document = createDocument({
      openapi: '3.2.0',
      info: { title: 'test', version: '1.0.0' },
      components: {
        mediaTypes: {
          AgentEventStream: { itemSchema: z.object({ event: z.string() }) },
        },
      },
      paths: {
        '/events': {
          get: {
            responses: {
              '200': {
                description: 'stream',
                content: {
                  'text/event-stream': {
                    $ref: '#/components/mediaTypes/AgentEventStream',
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(
      document.paths?.['/events']?.get?.responses?.['200'],
    ).toEqual({
      description: 'stream',
      content: {
        'text/event-stream': {
          $ref: '#/components/mediaTypes/AgentEventStream',
        },
      },
    });
  });
});
