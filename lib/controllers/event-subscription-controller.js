const wfhHandler = require('../event-handlers/wfh-handler');

//-- Module Constants
const EVENT_HANDLERS = [ wfhHandler ];

//-- Module Functions
async function handleEvent(evt) {
  const matchingHandlers = EVENT_HANDLERS.filter(handler => handler.match(evt));

  const promises = matchingHandlers.map(handler => await handler.handle(evt));

  await Promise.all(promises);

  return true;
}

module.exports = {
  handleEvent
};
