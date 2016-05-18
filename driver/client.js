import { run } from '@cycle/xstream-run'
import { makeDOMDriver } from '@cycle/dom'
import { makeHistoryDriver } from '@cycle/history'
import { createHistory } from 'history'
import main from './main'

const history = createHistory()

function clientSideApp(responses) {
  let sinks = main(responses)
  sinks.DOM = sinks.DOM.drop(1)
  return sinks
}

function preventDefaultDriver(ev$) {
  ev$.addListener({
    next: ev => ev.preventDefault(),
    error: () => {},
    complete: () => {}
  });
}

run(clientSideApp, {
  DOM: makeDOMDriver('#application'),
  History: makeHistoryDriver(history),
  PreventDefault: preventDefaultDriver
})