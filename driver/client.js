import {run } from '@cycle/core'
import {makeDOMDriver } from '@cycle/dom'
import {makeHistoryDriver } from '@cycle/history'
import {createHistory } from 'history'
import main from './main'

function clientSideApp(responses) {
  let requests = main(responses)
  requests.History = requests.History.skip(1)
  return requests
}

const history = createHistory()

run(clientSideApp, {
  DOM: makeDOMDriver('#application'),
  History: makeHistoryDriver(history, {
    hash: false,
    queries: true
  })
})