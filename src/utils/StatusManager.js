const axios = require('axios');

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

  async submit() {
    const apiBase = 'https://api.instatus.com/v1';
    const url = `${apiBase}/${pageId}/metrics/${metricId}`;
    const authHeader = { Authorization: `Bearer ${apiKey}` };

    const currentTimestamp = Date.now();

    const valueToSend = this.client.ws.ping < 0 ? 50 : this.client.ws.ping;

    const data = {
      timestamp: currentTimestamp,
      value: valueToSend,
    };

    await axios({
      method: 'post',
      url,
      headers: authHeader,
      data,
    });
    setTimeout(() => this.submit(), 15000);
  }
}

module.exports = { StatusPage };
