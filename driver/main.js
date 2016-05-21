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

// *** uncomment for webpack dev server ***
/*
let model = new falcor.Model({
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
})
*/

function href(href){
  return {
    attrs: {
      href: href
    }
  }
}

function renderMenu() {
  return (
    ul([
      li([a('.link', href('/'), 'Home')]),
      li([a('.link', href('/about'), 'About')])
    ])
  )
}

function switchRoute(route){
   switch (route) {
        case '/': return 'home'
        case '/about': return 'about'
        default: return 'noroute'
      }
}

function main({DOM, History}) {

  // get location pathname from History
  const pathValue$ = History.map(location => location.pathname)

  // map url
  const click$ = DOM.select('.link').events('click')
  const preventedEvent$ = click$;
  const action$ = click$.map(ev => ev.currentTarget.attributes.href.value)

  // combine both streams and return the latest path
  const route$ = xs.merge(action$, pathValue$)

  const switcher$ = route$
    .map(route => switchRoute(route))

  // request data from server/cache model
  const falcor$ = switcher$
    // --> client model
    // .map(path => xs.fromPromise(model.get([path, ['title', 'desc', 'link']]))
    // --> server request
    .map(path => xs.fromPromise(request.get(['data', 'byIndex', [path], ['title', 'desc', 'link']]))
    ).flatten()

  // combine streams 
  // --> client model
  // const state$ = xs.combine((x, y) => [x, y.json], route$, falcor$)
  // --> server request
  const state$ = xs.combine((x, y) => [x, y.json.data.byIndex], route$, falcor$)

  const fallback$ = xs.of(['/', {
    home: {
      title: '',
      desc: '',
      link: ''
    }
  }])

  const final$ = state$.replaceError(err => fallback$)

  return {
    DOM: final$.map(state => {
      let [route, data] = state
      for(var attr in data){
        attr = attr
      }
      // push the route into browser history stack
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', route)
      }
      return (
        section('.main', [
          renderMenu(), 
          h1(data[attr].title), 
          p(data[attr].desc), 
          p(data[attr].link)
        ])
      )
    }),
    History: pathValue$.map(path => path),
    PreventDefault: preventedEvent$
  }
}

export default main