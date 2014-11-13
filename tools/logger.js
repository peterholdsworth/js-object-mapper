var config = {debugLevel: process.env.MAPPER_LOG_LEVEL || 1};

module.exports = {
  debug: function() {
    if (config.debugLevel > 2) {
      console.info.apply(console, arguments);
    }
  },
  log:  function() {
    if (config.debugLevel > 1) {
      console.log.apply(console, arguments);
    }
  },
  error:  function() {
    if (config.debugLevel > 0) {
      console.error.apply(console, arguments);
    }
  }
};