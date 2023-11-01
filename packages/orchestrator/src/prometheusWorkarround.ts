import { PrometheusResponse } from './server/routes/prometheus';

const splitResults = (metrics: string) => {
  const lineByLine = metrics.split('\n').filter((a) => !a.startsWith('#') && a.length > 2);

  return lineByLine.map((line) => line.split(' '));
};

const appendClientCounts = (
  metricBody: string,
  connectedClients: number,
  missedInteractions: number,
): string =>
  metricBody.concat(`
# HELP connected_clients Amount of event clients connected to the orchestrator
# TYPE connected_clients gauge
connected_clients{app="menhera-bot-events"} ${connectedClients}

# HELP missed_interactions Amount of interactions missed due to lack of clients connected
# TYPE missed_interactions gauge
missed_interactions{app="menhera-bot-events"} ${missedInteractions}
`);

const mergeMetrics = (
  validMetrics: PrometheusResponse[],
  connectedClients: number,
  missedInteractions: number,
): PrometheusResponse => {
  if (validMetrics.length === 0)
    return {
      contentType: 'text/plain; version=0.0.4; charset=utf-8',
      data: appendClientCounts('', connectedClients, missedInteractions),
    };

  const firstMetric = validMetrics[0];

  if (validMetrics.length === 1) {
    return {
      contentType: firstMetric.contentType,
      data: appendClientCounts(firstMetric.data, connectedClients, missedInteractions),
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
    data: appendClientCounts(updatedMetricsBody, connectedClients, missedInteractions),
  };
};

export { mergeMetrics };
