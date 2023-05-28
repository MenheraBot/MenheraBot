import { PrometheusResponse } from './server/routes/prometheus';

const splitResults = (metrics: string) => {
  const lineByLine = metrics.split('\n').filter((a) => !a.startsWith('#') && a.length > 2);

  return lineByLine.map((line) => line.split(' '));
};

const appendClientCounts = (metricBody: string, connectedClients: number): string =>
  metricBody.concat(`

# HELP connected_clients Amount of event clients connected to the orchestrator
# TYPE connected_clients gauge
connected_clients{app="menhera-bot-events"} ${connectedClients}
`);

const mergeMetrics = (
  validMetrics: PrometheusResponse[],
  connectedClients: number,
): PrometheusResponse => {
  const firstMetric = validMetrics[0];

  if (validMetrics.length === 1) {
    return {
      contentType: firstMetric.contentType,
      data: appendClientCounts(firstMetric.data, connectedClients),
    };
  }

  const mergedResults = validMetrics.reduce<Record<string, number>>((p, c) => {
    const results = splitResults(c.data);

    results.forEach((metric) => {
      const [key, value] = metric;

      if (typeof p[key] === 'undefined') p[key] = 0;

      p[key] += Number(value);
    });

    return p;
  }, {});

  const updatedMetricsBody = firstMetric.data
    .split('\n')
    .map((line) => {
      if (line.startsWith('#') || line.length < 5) return line;

      const key = line.split(' ')[0];

      return `${key} ${mergedResults[key] ?? 0}`;
    })
    .join('\n');

  return {
    contentType: firstMetric.contentType,
    data: appendClientCounts(updatedMetricsBody, connectedClients),
  };
};

export { mergeMetrics };
