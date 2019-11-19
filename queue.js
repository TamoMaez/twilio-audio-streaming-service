module.exports = {
  listeners: [],
  post: function(msg) {
    this.listeners.forEach(listener => listener.send(msg));
  }
};