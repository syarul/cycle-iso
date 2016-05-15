import {Observable } from 'rx'
import {p, a, ul, li, section, h1 } from '@cycle/dom'

function renderMenu() {
  return (
    ul([
      li([a('.link', {href: '/'}, 'Home')]),
      li([a('.link', {href: '/about'}, 'About')])
    ])
  )
}

function renderHomePage() {
  return (
    section('.home', [
      renderMenu(),
      h1('The homepage'),
      p('Welcome to our spectacular web page with nothing special here.'),
      p('Contact us')
    ])
  )
}

function renderAboutPage() {
  return (
    section('.about', [
      renderMenu(),
      h1('Read more about us'),
      p('This is the page where we describe ourselves.'),
      p('Contact us')
    ])
  )
}

function renderNoPage() {
  return (
    section('.noroute', [
      renderMenu(),
      h1('404 Page does not exist'),
      p('This is the landing page when route is not found.'),
      p('Contact us')
    ])
  )
}

function main({DOM, History }) {

  // get location pathname from History
  const pathValue$ = History.map(location => location.pathname)

  // map url
  const action$ = Observable.merge(
    DOM.select('.link').events('click')
    .doOnNext(ev => ev.preventDefault())
    .map((ev) => ev.currentTarget.attributes.href.value)
    .startWith(false)
  )

  // combine both streams and return the exact path
  const route$ = Observable.combineLatest(action$, pathValue$)
    .map(x => x = !x[0] ? x[1] : x[0])

  return {
    DOM: route$.map(route => {
      // push the route into browser history stack
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', route)
      }
      // render the route page
      switch (route) {
        case '/':
          return renderHomePage()
        case '/about':
          return renderAboutPage()
        default:
          return renderNoPage()
      }
    }),
    History: pathValue$.map(path => path)
  }
}

export default main