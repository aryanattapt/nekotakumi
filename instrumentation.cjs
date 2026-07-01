// OpenTelemetry Auto-Instrumentation — CJS
const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { resourceFromAttributes } = require("@opentelemetry/resources");
const { SEMRESATTRS_SERVICE_NAME } = require("@opentelemetry/semantic-conventions");
const { NodeSDK } = require("@opentelemetry/sdk-node");

if (process.env.OTEL_DEBUG) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318";
const serviceName = process.env.OTEL_SERVICE_NAME || "nekotakumi";

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [SEMRESATTRS_SERVICE_NAME]: serviceName,
  }),
  traceExporter: new OTLPTraceExporter({
    url: otelEndpoint + "/v1/traces",
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": { enabled: false },
      "@opentelemetry/instrumentation-dns": { enabled: false },
      "@opentelemetry/instrumentation-net": { enabled: false },
    }),
  ],
});

try {
  sdk.start();
  console.log("[otel] started, service=" + serviceName + ", endpoint=" + otelEndpoint);
} catch (err) {
  console.error("[otel] start error:", err);
}

process.on("SIGTERM", () => {
  sdk.shutdown().then(() => process.exit(0)).catch(() => process.exit(1));
});
process.on("SIGINT", () => {
  sdk.shutdown().then(() => process.exit(0)).catch(() => process.exit(1));
});
