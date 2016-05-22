import xs from 'xstream'
import delay from 'xstream/extra/delay'
import { p, a, ul, li, section, h1 } from '@cycle/dom'
import falcor  from 'falcor'
import httpDataSource from 'falcor-http-datasource'

const request = new falcor.Model({
    source: new httpDataSource('./model.json')
});

// *** debug request ***
/*
let request_1$ = xs.fromPromise(request.get(['home', ['title', 'desc', 'link']]))
  // .compose(delay(500))
request_1$.addListener({
  next: (res) => console.log(JSON.stringify(res, null, ' ')),
  error: (err) => console.error(err),
  complete: () => console.log('request 1 completed'),
})

let request_2$ = xs.fromPromise(request.get(['data', 'byIndex', ['home'], ['title', 'desc', 'link']]))
  // .compose(delay(500))
request_2$.addListener({
  next: (res) => console.log(JSON.stringify(res, null, ' ')),
  error: (err) => console.error(err),
  complete: () => console.log('request 2 completed'),
})
*/

// *** uncomment for webpack-dev-server ***
/*const model = new falcor.Model({
  cache: {
    home: {
      title: 'The homepage',
      desc: 'Welcome to our spectacular web page with nothing special here.',
      link: 'Contact us'
    },
    about: {
      title: 'Read more about us',
      desc: 'This is the page where we describe ourselves.',
      link: 'Contact us'
    },
    noroute: {
      title: '404 Page does not exist',
      desc: 'This is the landing page when route is not found.',
      link: 'Contact us'
    }
  }
})*/

const href = href => ({attrs: {href: href}})

const renderMenu = () =>
  ul([
    li([a('.link', href('/'), 'Home')]),
    li([a('.link', href('/about'), 'About')])
  ])

const routes = {
  '/': 'home',
  '/about': 'about'
}

const switchCase = (sources, defaultSource) => selector =>
  sources[selector] || defaultSource

function main({DOM, History}) {

  // get location pathname from History
  const pathValue$ = History.map(location => location.pathname)

  // map url
  const click$ = DOM.select('.link').events('click')
  const preventedEvent$ = click$;
  const action$ = click$.map(ev => ev.currentTarget.attributes.href.value)

  // combine both streams and return the latest path
  const route$ = xs.merge(action$, pathValue$)
  
  // fallback stream for error
  // you can use this to show loading events
  const fallback$ = xs.of({
    title: '',
    desc: '',
    link: ''
  })

  // request data from server/cache model
  const falcor$ = route$
    .map(switchCase(routes, 'noroute'))
    .map(path => {

      // --> client model ***use with webpack-dev-server***
      /*let data = model.get([path, ['title', 'desc', 'link']])
      return xs.fromPromise(data)
        .map(data => ({path, data}))
        .map(({path, data}) => data.json[path])*/

      // --> server request
      let data = request.get(['data', 'byIndex', [path], ['title', 'desc', 'link']])
      return xs.fromPromise(data)
        .map(data => ({path, data}))
        .map(({path, data}) => data.json.data.byIndex[path])
    })
    .flatten()
    .replaceError(err => fallback$)

  return {
    DOM: falcor$.map(data => {
      return (
        section('.main', [
          renderMenu(), 
          h1(data.title), 
          p(data.desc), 
          p(data.link)
        ])
      )
    }),
    History: action$,
    PreventDefault: preventedEvent$
  }
}

export default main