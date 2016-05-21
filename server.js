import Cycle from '@cycle/xstream-run'
import xs from 'xstream'
import express from 'express'
import { html, head, title, body, div, script, makeHTMLDriver } from '@cycle/dom'
import main from './driver/main'
import path from 'path'
import falcorExpress from 'falcor-express'
import falcorRouter from 'falcor-router'

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
    let wrappedVTree$ = xs.combine(wrapVTreeWithHTMLBoilerplate, vtree$)
    return {
      DOM: wrappedVTree$,
      History: appFn(sources).History
    }
  }
}

const server = express()

let data = [
  {
    index: 'home',
    data: {
      title: 'The homepage[Server]',
      desc: 'Welcome to our spectacular web page with nothing special here.',
      link: 'Contact us'
    }
  },
  {
    index: 'about',
    data: {
      title: 'Read more about us[Server]',
      desc: 'This is the page where we describe ourselves.',
      link: 'Contact us'
    }
  },
  {
    index: 'noroute',
    data: {
      title: '404 Page does not exist[Server]',
      desc: 'This is the landing page when route is not found.',
      link: 'Contact us'
    }
  }
]

server.use('/model.json', falcorExpress.dataSourceRoute((req, res) => {
    return new falcorRouter([
      {
        route: data[0].index,
        get: (pathSet) => {
            let _path = data[0].index
            return {
                path: [_path],
                value: data[0].data
            }
        }
      },
      {
        route: 'data.byIndex[{keys}]["title", "desc", "link"]',
        get: (pathSet) => {
            var res = []
            pathSet[2].forEach((index) => {
                data.forEach((e) => {
                  if(e.index == index){
                    pathSet[3].forEach((info) => {
                      res.push({
                        path: ['data', 'byIndex', index, info],
                        value: e.data[info]
                      })
                    })
                  }
                })
            })
            return res
        }
      },
    ])
}))

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
