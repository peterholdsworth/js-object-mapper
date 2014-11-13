var config = {debugLevel: 0};

module.exports = {
  debug: function() {
    if (config.debugLevel > 1) {
      console.log.apply(console, arguments);
    }
  },
  log:  function() {
    if (config.debugLevel > 2) {
      console.log.apply(console, arguments);
    }
  }
};