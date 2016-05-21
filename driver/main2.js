import xs from 'xstream';
import Cycle from '@cycle/xstream-run';
import {div, h1, p, makeDOMDriver} from '@cycle/dom';
import falcor  from 'falcor'

var model = new falcor.Model({
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

function main(sources) {
  let action$ = xs.merge(
    sources.DOM.select('.decrement').events('click').map(ev => -1),
    sources.DOM.select('.increment').events('click').map(ev => +1)
  );
  let count$ = action$.fold((x,y) => x + y, 0);
  let falcor$ = xs.fromPromise(model.get(['about', ['title', 'desc', 'link']]))
  // .then(res => {
  //   console.log(res.json['about'])
  // });
  return {
    // DOM: count$.map(count =>
    //     div([
    //       button('.decrement', 'Decrement'),
    //       button('.increment', 'Increment'),
    //       p('Counter: ' + count)
    //     ])
    //   )
    DOM: falcor$.map(res => 
      // console.log(x)
        div([
          h1(res.json.about.title),
          p(res.json.about.desc),
          p(res.json.about.link)
        ])
    )
  };
}

export default main