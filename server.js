import { run } from '@cycle/core';
import express from 'express';
import {makeServerHistoryDriver} from 'cycle-history';
import {Observable} from 'rx';
import {html, head, title, body, div, script, makeHTMLDriver } from'@cycle/dom';
import main from './driver/main';
import path from 'path'

function wrapVTreeWithHTMLBoilerplate(vtree) {
  return (
    html([
      head([
        title('Cycle Isomorphic')
      ]),
      body([
        div('#application', [vtree]),
        script({src: '/static/bundle.js'})
      ])
    ])
  );
}

function prependHTML5Doctype(html) {
  return `<!doctype html>${html}`;
}

function wrapAppResultWithBoilerplate(appFn) {
  return function wrappedAppFn(sources) {
    let vtree$ = appFn(sources).DOM.take(1);
    let wrappedVTree$ = Observable.combineLatest(vtree$, wrapVTreeWithHTMLBoilerplate);
    return {
      DOM: wrappedVTree$,
      History: appFn(sources).History.take(1)
    };
  };
}

let server = express();

server.use('/static', express.static(path.join(__dirname, '/static')))

server.use(function (req, res) {
  // Ignore favicon requests
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
    return;
  }
  console.log(`req: ${req.method} ${req.url}`);

  let wrappedAppFn = wrapAppResultWithBoilerplate(main);

  let {sources} = run( wrappedAppFn, { 
    DOM: makeHTMLDriver(), 
    History: makeServerHistoryDriver({
      pathname: req.url
    })
  });
  let html$ = sources.DOM.map(prependHTML5Doctype);
  html$.subscribe(html => res.send(html));
});

let port = process.env.PORT || 8080;
server.listen(port);
console.log(`Listening on port ${port}`);
