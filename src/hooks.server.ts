import type { Handle, HandleServerError } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import * as Sentry from "@sentry/node";
import { building, version } from "$app/environment";
import { logger } from "$lib/logger";

if (!building) {
  Sentry.init({
    dsn: process.env["SENTRY_DSN"] || "http://049fe3e6a0f38953f511f626c4f01ee7@localhost:8000/1",
    transport: Sentry.makeFetchTransport,
    debug: !!process.env["SENTRY_DEBUG"],
    environment: process.env["NODE_ENV"] || "production",
    release: version,
    tracesSampleRate: 0.1,
  });
}

const requestLogger: Handle = async ({ event, resolve }) => {
  const start = Date.now();
  const method = event.request.method;
  const url = event.url.pathname;
  logger.info({ method, url }, "--> %s %s", method, url);
  const response = await resolve(event);
  const ms = Date.now() - start;
  logger.info({ method, url, status: response.status, ms }, "<-- %s %s %s %sms", method, url, response.status, ms);
  return response;
};

export const handle: Handle = sequence(requestLogger);

export const handleError: HandleServerError = ({ error, event }) => {
  const err = error as Error;
  logger.error({ err, url: event.url.pathname }, "Unhandled error: %s", err.message);
  if (!building) {
    Sentry.captureException(error, {
      contexts: { request: { url: event.url.pathname, method: event.request.method } },
    });
  }
  return { message: "Internal Server Error", code: "INTERNAL_ERROR" };
};
