# cycle-iso
A simple isomorphic cycle app starter

This is isomorphic [Cycle.js](http://cycle.js.org/) framework with [falcor.js](https://github.com/Netflix/falcor) JSON Graph at heart, it does not encompass the [MVI](http://cycle.js.org/model-view-intent.html) (Model, View, Intent) as to keep it as basic, cleaner, declarative and has bare minimum setting to run.

This app use webpack and babel as part of the build process.

Thanks to
- [TylorS](https://github.com/TylorS) - for helping with routing
- [laszlokorte](https://github.com/laszlokorte) - for helping out with mapping object in streams.

## New Stuff

- Added JSON Graph, rely on ```xstream.fromPromise()```
- Update to use Cycle.js/xstream from diversity branch

## How to extend this?

- For complex routing you can start looking into [switchPath](https://github.com/staltz/switch-path), 
- For drivers you can start [here](http://cycle.js.org/drivers.html)
- For everything awesome about cycle.js go [here](https://github.com/vic/awesome-cyclejs)

## Install

```
npm install
```

to run bundler
```
npm run build
```

to run isomorphic server
```
npm start
```

optionally to run webpack-dev-server
> please check `driver/main.js` file before doing this
```
npm run webpack
```

## PR is most welcome
