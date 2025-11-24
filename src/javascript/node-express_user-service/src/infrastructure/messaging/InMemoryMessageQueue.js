'use strict';
const { EventEmitter } = require('events');

class InMemoryMessageQueue {
  constructor() {
    this.emitter = new EventEmitter();
  }

  publish(event, payload) {
    process.nextTick(() => this.emitter.emit(event, payload));
  }

  subscribe(event, handler) {
    this.emitter.on(event, handler);
    return () => this.emitter.off(event, handler);
  }
}

module.exports = InMemoryMessageQueue;
