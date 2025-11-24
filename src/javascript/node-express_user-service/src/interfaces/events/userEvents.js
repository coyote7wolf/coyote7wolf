'use strict';
// Example subscriber; in a real app you would inject queue and attach.
module.exports = function attachUserEventHandlers(queue, logger) {
  queue.subscribe('user.created', (payload) => logger.info({ payload }, 'user.created event'));
  queue.subscribe('user.updated', (payload) => logger.info({ payload }, 'user.updated event'));
  queue.subscribe('user.deleted', (payload) => logger.info({ payload }, 'user.deleted event'));
};
