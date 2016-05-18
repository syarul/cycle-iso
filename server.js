import Cycle from '@cycle/xstream-run'
import xs from 'xstream'
import express from 'express'
import { html, head, title, body, div, script, makeHTMLDriver } from '@cycle/dom'
import main from './driver/main'
import path from 'path'

function wrapVTreeWithHTMLBoilerplate(vtree) {
  return (
    html([
      head([
        title('Cycle Isomorphic')
      ]),
      body([
        div('#application', [vtree]),
        script({attrs:{src: '/static/bundle.js'}})
      ])
    ])
  )
}

function prependHTML5Doctype(html) {
  return `<!doctype html>${html}`
}

function wrapAppResultWithBoilerplate(appFn) {
  return function wrappedAppFn(sources) {
    let vtree$ = appFn(sources).DOM
    let wrappedVTree$ = xs.combine(wrapVTreeWithHTMLBoilerplate, vtree$).take(1)
    return {
      DOM: wrappedVTree$,
      History: appFn(sources).History.take(1)
    }
  }
}

const server = express()

server.use('/static', express.static(path.join(__dirname, '/static')))

server.use((req, res) => {
  // Ignore favicon requests
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'})
    res.end()
    return
  }
  console.log(`req: ${req.method} ${req.url}`)

  const wrappedAppFn = wrapAppResultWithBoilerplate(main)

  const context$ = xs.of({pathname: req.url});
  const {sources, run} = Cycle(wrappedAppFn, { 
    DOM: makeHTMLDriver(), 
    History: () => context$,
    PreventDefault: () => {}
  })
  const html$ = sources.DOM.elements.map(prependHTML5Doctype)
  html$.addListener({
    next: html => res.send(html),
    error: err => res.sendStatus(500),
    complete: () => {}
  });
  run()
})

const port = process.env.PORT || 8080
server.listen(port)
console.log(`Listening on port ${port}`)
