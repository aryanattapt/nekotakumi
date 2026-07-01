import pino from "pino";

const level = process.env["LOG_LEVEL"] || "info";

export const logger = pino({
  level,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
});
