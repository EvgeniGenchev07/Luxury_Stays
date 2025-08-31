import gulp from 'gulp';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import imagemin from 'gulp-imagemin';
import purgecss from 'gulp-purgecss';
import mozjpeg from 'imagemin-mozjpeg';
import optipng from 'imagemin-optipng';
import svgo from 'imagemin-svgo';
import rev from 'gulp-rev';
import revDel from 'gulp-rev-delete-original';
import revReplace from 'gulp-rev-replace';
import through2 from 'through2';
import path from 'path';
import fs from 'fs';
// ---------- Helper functions ----------
function minifyHtml(src, dest, ldJson = false) {
  return function htmlTask() {
    return gulp.src(src)
      .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        ignoreCustomFragments: ldJson
          ? [/<script type="application\/ld\+json">[\s\S]*?<\/script>/]
          : []
      }))
      .pipe(gulp.dest(dest));
  };
}

function minifyJs(src, dest) {
  return function jsTask() {
    return gulp.src(src)
      .pipe(terser({
        mangle: true,
        compress: true,
        output: { comments: false }
      }))
      .pipe(gulp.dest(dest));
  };
}

function minifyCss(src, dest, purge = false, purgeContent = []) {
  return function cssTask() {
    let stream = gulp.src(src);
    if (purge) {
      stream = stream.pipe(purgecss({ content: purgeContent }));
    }
    return stream
      .pipe(cleanCSS())
      .pipe(gulp.dest(dest));
  };
}

// ---------- HTML tasks ----------
export const minifyHtmlEn = minifyHtml('source/en/*.html', 'dist/en', true);
export const minifyHtmlBg = minifyHtml('source/bg/*.html', 'dist/bg', true);
export const minifyHtmlService = minifyHtml('source/service/*.html', 'dist/service');
export const minifyHtmlAdmin = minifyHtml('source/admin/*.html', 'dist/admin');

// ---------- JS tasks ----------
export const jsService = minifyJs('source/service/*.js', 'dist/service');
export const jsAdmin = minifyJs('source/admin/*.js', 'dist/admin');
export const scripts = minifyJs('source/js/*.js', 'dist/js');

// ---------- CSS tasks ----------
export const cssService = minifyCss('source/service/*.css', 'dist/service');
export const cssAdmin = minifyCss('source/admin/*.css', 'dist/admin');
export const styles = minifyCss('source/css/*.css', 'dist/css', true, ['source/en/*.html', 'source/js/*.js']);

// ---------- Images ----------
export function images() {
  return gulp.src('source/images/**/*')
    .pipe(imagemin([
      mozjpeg({ quality: 75, progressive: true }),
      optipng({ optimizationLevel: 5 }),
      svgo({
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'cleanupIDs', active: false }
        ]
      })
    ]))
    .pipe(gulp.dest('dist/images'));
}

// ---------- Hash & update HTML references ----------
function hashAssets() {
  return gulp.src(['dist/**/*.{css,js}'], { base: 'source' })
    .pipe(rev())
    .pipe(revDel())
    .pipe(gulp.dest('dist'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist'));
}

function updateHtmlReferences() {
// Load manifest
  const manifestRaw = fs.readFileSync('source/rev-manifest.json', 'utf8');
  const manifest = JSON.parse(manifestRaw);

  return gulp.src('dist/**/*.html')
    .pipe(through2.obj(function (file, _, cb) {
      if (file.isBuffer()) {
        let contents = file.contents.toString();

        for (const [originalPath, hashedPath] of Object.entries(manifest)) {
          const originalFilename = path.basename(originalPath);
          const hashedFilename = path.basename(hashedPath);

          // Escape for regex
          const escapedOriginal = originalFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

          // Replace all occurrences of the original filename with hashed filename only (no folder)
          const regex = new RegExp(escapedOriginal, 'g');

          contents = contents.replace(regex, hashedFilename);
        }

        file.contents = Buffer.from(contents);
      }
      cb(null, file);
    }))
    .pipe(gulp.dest('dist'));
}

// ---------- Pipelines ----------
export const base = gulp.series(
  minifyHtmlEn,
  minifyHtmlService,
  minifyHtmlBg,
  cssService,
  styles
);

export const js = gulp.series(jsService, scripts);

export const service = gulp.series(jsService, cssService, minifyHtmlService);

export const admin = gulp.series(minifyHtmlAdmin, jsAdmin, cssAdmin);

export const build = gulp.series(
  minifyHtmlEn,
  minifyHtmlService,
  minifyHtmlBg,
  minifyHtmlAdmin,
  jsService,
  jsAdmin,
  cssService,
  cssAdmin,
  scripts,
  images,
  styles,
  hashAssets,
  updateHtmlReferences
);
export const hash = gulp.series(hashAssets, updateHtmlReferences);
export default build;