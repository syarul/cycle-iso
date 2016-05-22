import { run } from '@cycle/xstream-run'
import { makeDOMDriver } from '@cycle/dom'
import { makeHistoryDriver } from '@cycle/history'
import { createHistory } from 'history'
import main from './main'

const history = createHistory()

function preventDefaultDriver(ev$) {
  ev$.addListener({
    next: ev => ev.preventDefault(),
    error: () => {},
    complete: () => {}
  });
}

run(main, {
  DOM: makeDOMDriver('#application'),
  History: makeHistoryDriver(history),
  PreventDefault: preventDefaultDriver
})