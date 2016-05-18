import xs from 'xstream'
import { p, a, ul, li, section, h1 } from '@cycle/dom'

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

function main({DOM, History}) {

  // get location pathname from History
  const pathValue$ = History.map(location => location.pathname)

  // map url
  const click$ = DOM.select('.link').events('click')
  const preventedEvent$ = click$;
  const action$ = click$.map(ev => ev.currentTarget.attributes.href.value)

  // combine both streams and return the latest path
  const route$ = xs.merge(action$, pathValue$)

  return {
    DOM: route$.map(route => {
      // push the route into browser history stack
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', route)
      }
      switch (route) {
        case '/':
          return renderHomePage()
        case '/about':
          return renderAboutPage()
        default:
          return renderNoPage()
      }
    }),
    History: pathValue$.map(path => path),
    PreventDefault: preventedEvent$
  }
}

export default main