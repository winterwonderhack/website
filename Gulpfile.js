var gulp        = require("gulp"),
    plugins     = require("gulp-load-plugins")(),
    server      = require("browser-sync").create(),
    lazypipe    = require("lazypipe"),
    runSequence = require("run-sequence"),
    pkg         = require("./package.json"),
    // want the string except for the ".git" suffix
    repository = pkg.repository.url.substring(0, pkg.repository.url.length - 4),
    // flag for production builds (vs development)
    production = (plugins.util.env.prod || plugins.util.env.production) ? true : false,
    paths = {
      src: "src",
      dist: "build",
      tmp: ".tmp"
    },
    config = {
      autoprefixer: {
        browsers: ["last 2 versions", "> 1%"]
      },
      banners: {
        html: [
          "<!--",
          "",
          "  __        ___       _             __        __              _           _   _            _    ",
          "  \\ \\      / (_)_ __ | |_ ___ _ __  \\ \\      / /__  _ __   __| | ___ _ __| | | | __ _  ___| | __",
          "   \\ \\ /\\ / /| | '_ \\| __/ _ \\ '__|  \\ \\ /\\ / / _ \\| '_ \\ / _` |/ _ \\ '__| |_| |/ _` |/ __| |/ /",
          "    \\ V  V / | | | | | ||  __/ |      \\ V  V / (_) | | | | (_| |  __/ |  |  _  | (_| | (__|   < ",
          "     \\_/\\_/  |_|_| |_|\\__\\___|_|       \\_/\\_/ \\___/|_| |_|\\__,_|\\___|_|  |_| |_|\\__,_|\\___|_|\\_\\",
          "",
          "  Spectral by HTML5 UP (html5up.net | @ajlkn)",
          "  Licensed under CCA 3.0 (html5up.net/license)",
          "",
          "  Modified by Winter Wonderhack",
          "  View the source online: " + repository,
          "",
          "-->"
        ].join("\n"),
        css: [
          "/*",
          " * Hi there, hacker!",
          " * This CSS has been minified and optimized.",
          " * You can view the source code online: " + repository,
          " */",
          ""
        ].join("\n"),
        js: [
          "/*",
          " * Hey there, hacker!",
          " * This JavaScript has been minified.",
          " * You can view the source code online: " + repository,
          " */",
          ""
        ].join("\n")
      },
      browserSync: {
        server: {
          baseDir: (production) ? paths.dist : paths.src,
          serveStaticOptions: {
            extensions: ["html"]
          }
        },
        notify: false,
        // Create a tunnel (if using `--tunnel`) with a subdomain of:
        // 1. the first "chunk" of the package.json `name`
        // 2. a random 6-character string appended to it
        // Note: needs to be lowercased alphanumerics
        tunnel: plugins.util.env.tunnel ?
          (pkg.name.trim().toLowerCase().split(/[^a-zA-Z0-9]/g)[0] + // [1]
            Math.random().toString(36).substr(2, 6)) :                 // [2]
          false,
      },
      csso: {
        comments: false
      },
      htmlmin: {
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
        removeComments: true
      },
      sass: {
        outputStyle: "expanded"
      }
    };

// `useref` all the HTML files, optimizing HTML, CSS, and JS in the process
gulp.task("build:useref", function () {
  return gulp
    .src(paths.src + "/*.html")
    .pipe(plugins.useref())
    // Minify CSS, add comment banner
    .pipe(plugins.if("*.css", lazypipe()
      .pipe(plugins.csso, config.csso)
      .pipe(plugins.header, config.banners.css)()
    ))
    // Minify JS, add comment banner
    .pipe(plugins.if("*.js", lazypipe()
      .pipe(plugins.uglify)
      .pipe(plugins.header, config.banners.js)()
    ))
    // Minify HTML, add comment banner
    .pipe(plugins.if("*.html", lazypipe()
      .pipe(plugins.htmlmin, config.htmlmin)
      .pipe(plugins.replace, /^(<!doctype html>)/i, "$1" + config.banners.html)()
    ))
    .pipe(gulp.dest(paths.tmp));
});

// Build the SCSS (Autoprefixer, Sourcemaps)
gulp.task("build:css", function () {
  return gulp
    .src(paths.src + "/sass/*.scss")
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    // Have to use sass.sync (https://github.com/dlmanning/gulp-sass/issues/90)
    .pipe(plugins.sass.sync(config.sass))
    .pipe(plugins.autoprefixer(config.autoprefixer))
    .pipe(plugins.sourcemaps.write("."))
    .pipe(gulp.dest(paths.src + "/css"))
    .pipe(server.stream({ match: "**/*.css" }));
});

// Build (optimize) images
gulp.task("build:img", function () {
  return gulp
    .src(paths.src + "/img/**")
    .pipe(plugins.imagemin([
      plugins.imagemin.optipng({ optimizationLevel: 1 })
    ]))
    .pipe(gulp.dest(paths.tmp + "/img"));
});

// Copy documents
gulp.task("build:docs", function () {
  return gulp
    .src(paths.src + "/docs/**")
    .pipe(gulp.dest(paths.dist + "/docs"));
})

// Combine SVG icons
gulp.task("build:icons", function () {
  return gulp
    .src(paths.src + "/icons/**/*.svg", { base: paths.src + "/icons" })
    .pipe(plugins.rename({ prefix: "icon-" }))
    .pipe(plugins.svgstore())
    .pipe(plugins.if(production, gulp.dest(paths.tmp + "/img"), gulp.dest(paths.src + "/img")));
});

// Copy humans.txt
gulp.task("build:humans.txt", function () {
  return gulp
    .src(paths.src + "/humans.txt")
    .pipe(plugins.updateHumanstxtDate())
    .pipe(gulp.dest(paths.dist));
});

// Copy particles.json
gulp.task("build:particles.json", function () {
  return gulp
    .src(paths.src + "/particles.json")
    .pipe(gulp.dest(paths.dist));
});

// Copy Netlify files
gulp.task("build:netlify", function () {
  return gulp
    .src(paths.src + "/_redirects")
    .pipe(gulp.dest(paths.dist));
});

// Copy favicons
gulp.task("build:favicons", function () {
  return gulp
    .src(paths.src + "/favicons/*")
    .pipe(gulp.dest(paths.tmp));
});

// Copy fonts
gulp.task("build:fonts", function () {
  return gulp
    .src(paths.src + "/fonts/*")
    .pipe(gulp.dest(paths.tmp + "/fonts"));
})

// Revision assets
gulp.task("build:rev", function () {
  return gulp
    .src(paths.tmp + "/**")
    .pipe(plugins.revAll.revision({
      dontRenameFile: [
        /\.html/g,
        /favicon.ico/g,
        /social.jpg/g,
        /\.pdf/g,
        // /\/sponsors\/.*?/g
      ]
    }))
    .pipe(gulp.dest(paths.dist));
});

// Build assets depending on if `production` is set
gulp.task("build", function (done) {
  if (production) {
    runSequence(
      "clean",
      "build:css",
      [
        "build:useref",
        "build:img",
        "build:fonts",
        "build:docs",
        "build:humans.txt",
        "build:particles.json",
        "build:netlify",
        "build:favicons",
        // "build:icons",
      ],
      "build:rev",
      done
    );
  } else {
    runSequence(
      [
        "build:css",
        "build:icons"
      ],
      done
    );
  }
});

// Clean directories
gulp.task("clean", function () {
  return gulp
    .src([
      paths.dist,
      paths.tmp
    ], { read: false })
    .pipe(plugins.clean({ force: true }));
});

// Serve the app via `browser-sync` and watch for changes and reload
gulp.task("serve", ["build"], function () {
  server.init(config.browserSync);
  gulp.watch(paths.src + "/sass/**/*.+(scss|css)", ["build:css"]);
  gulp.watch(paths.src + "/js/**/*.js",            server.reload);
  gulp.watch(paths.src + "/icons/**/*.svg",        ["build:icons"]);
  gulp.watch(paths.src + "/*.html",                server.reload);
});

// Default to `serve`
gulp.task("default", ["serve"]);
