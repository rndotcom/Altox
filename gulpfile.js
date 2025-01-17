const { series, parallel, watch, src, dest } = require("gulp");
const pump = require("pump");
const argv = require("yargs").argv;
const exec = require("child_process").exec;
const path = require("path");
const log = require("fancy-log");

// gulp plugins and utils
const livereload = require("gulp-livereload");
const postcss = require("gulp-postcss");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const beeper = require("beeper");
const zip = require("gulp-zip");

// postcss plugins
const easyimport = require("postcss-easy-import");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

function serve(done) {
  livereload.listen();
  done();
}

function handleError(done) {
  return function (err) {
    if (err) {
      beeper();
    }
    return done(err);
  };
}

function hbs(done) {
  pump([src(["*.hbs", "partials/**/*.hbs"]), livereload()], handleError(done));
}

function css(done) {
  pump(
    [
      src("assets/css/screen.css", { sourcemaps: true }),
      postcss([easyimport, autoprefixer(), cssnano()]),
      dest("assets/built/", { sourcemaps: "." }),
      livereload(),
    ],
    handleError(done)
  );
}

function js(done) {
  pump(
    [
      src(
        [
          "node_modules/@tryghost/shared-theme-assets/assets/js/lib/**/*.js",
          "node_modules/@tryghost/shared-theme-assets/assets/js/main.js",
          "assets/js/lib/*.js",
          "assets/js/main.js",
        ],
        { sourcemaps: true }
      ),
      concat("main.min.js"),
      uglify(),
      dest("assets/built/", { sourcemaps: "." }),
      livereload(),
    ],
    handleError(done)
  );
}

function zipper(done) {
  const package = require("./package.json");
  const filename = package.name + "-v" + package.version + ".zip";

  pump(
    [
      src([
        "**",
        "!node_modules",
        "!node_modules/**",
        "!dist",
        "!dist/**",
        "!yarn-error.log",
      ]),
      zip(filename),
      dest("dist/"),
    ],
    handleError(done)
  );
}

function symlink(done) {
  if (!argv.site) {
    handleError(done("Required parameter --site is missing"));
  }
  const themeName = require("./package.json").name;
  const targetDir = path.join(argv.site, "content", "themes", themeName);

  exec(`ln -sfn ${__dirname}/ ${targetDir}`);
  log(`Symlinked to ${path.resolve(targetDir)}`);
  done();
}

const hbsWatcher = () => watch(["*.hbs", "partials/**/*.hbs"], hbs);
const cssWatcher = () => watch("assets/css/**/*.css", css);
const jsWatcher = () => watch("assets/js/**/*.js", js);
const watcher = parallel(hbsWatcher, cssWatcher, jsWatcher);
const build = series(css, js);

exports.build = build;
exports.symlink = symlink;
exports.zip = series(build, zipper);
exports.default = series(build, serve, watcher);
