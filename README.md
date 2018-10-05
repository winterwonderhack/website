# website

The winterwonderhack.com website.

Based on [Spectral][spectral] by HTML5 UP.

## Usage/Developing

First, install [EditorConfig][editorconfig] for your text editor/IDE.

Assumes [Node.js][node], [Gulp][gulp], and [Yarn][yarn] are installed.

1. Grab a copy of the repository and `cd` to the root of it
2. Run `yarn` to grab dependencies
3. Run `gulp` to spin up a local server with live-reloading
4. Code away!
5. Commit your changes

## Gulp Tasks

There are several `gulp` tasks (e.g. `$ gulp <task>`) that can be useful when developing:

  - `serve` spins up a local server (is the `default` task)
    - `--prod/--production` to serve the production assets (mimics production site)
    - `--tunnel` to create a temporary URL via localtunnel.me (to share with someone)
  - `build` builds the assets
    - `--prod/--production` builds for production (minify, optimize, etc.)
  - `clean` wipes the build directory


[spectral]: https://html5up.net/spectral
[node]: https://nodejs.org/
[gulp]: http://gulpjs.com/
[yarn]: https://yarnpkg.com/
[editorconfig]: http://editorconfig.org/#download
