const http = require('https');

// The following 4 are the actual values that pertain to your account and this specific metric.
const {
  apiKey,
  pageId,
  metricId,
} = require('../../config.json');

class StatusPage {
  constructor(client) {
    this.client = client;
  }

  submit() {
    const apiBase = 'https://api.statuspage.io/v1';
    const url = `${apiBase}/pages/${pageId}/metrics/${metricId}/data.json`;
    const authHeader = { Authorization: `OAuth ${apiKey}` };
    const options = { method: 'POST', headers: authHeader };

    const epochInSeconds = Math.floor(new Date() / 1000);

    // eslint-disable-next-line no-param-reassign

    const currentTimestamp = epochInSeconds;
    const valueToSend = this.client.ws.ping < 0 ? 50 : this.client.ws.ping;

    const data = {
      timestamp: currentTimestamp,
      value: valueToSend,
    };

    const request = http.request(url, options, (res) => {
      if (res.statusMessage === 'Unauthorized') {
        const genericError = 'Error encountered. Please ensure that your page code and authorization key are correct.';
        return console.error(genericError);
      }
      res.on('end', () => {
        setTimeout(() => {
          this.submit();
        }, 10000);
      });
      res.on('error', (error) => {
        console.error(`Error caught: ${error.message}`);
      });
    });

    request.end(JSON.stringify({ data }));
  }
}

module.exports = { StatusPage };
