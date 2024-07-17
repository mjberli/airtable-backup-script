const axios = require('axios');
const axiosRetry = require('axios-retry').default;

// Configure axios to retry requests up to 6 times with an exponential delay
axiosRetry(axios, { 
  retries: 6, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
  },
});

module.exports = axios;