import { z } from 'zod';
import { insertTestResultSchema, testResults } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  speedtest: {
    ping: {
      method: 'GET' as const,
      path: '/api/speedtest/ping',
      responses: {
        200: z.object({ timestamp: z.number() }),
      },
    },
    download: {
      method: 'GET' as const,
      path: '/api/speedtest/download',
      // Query param for size in bytes (optional, default to reasonable chunk)
      input: z.object({ size: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.any(), // Returns binary data
      },
    },
    upload: {
      method: 'POST' as const,
      path: '/api/speedtest/upload',
      input: z.any(), // Accepts binary blob
      responses: {
        200: z.object({ received: z.number() }),
      },
    },
  },
  results: {
    list: {
      method: 'GET' as const,
      path: '/api/results',
      responses: {
        200: z.array(z.custom<typeof testResults.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/results',
      input: insertTestResultSchema,
      responses: {
        201: z.custom<typeof testResults.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type TestResultResponse = z.infer<typeof api.results.create.responses[201]>;
