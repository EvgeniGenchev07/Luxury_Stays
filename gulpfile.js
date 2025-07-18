import gulp from 'gulp';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import imagemin from 'gulp-imagemin';
import purgecss from 'gulp-purgecss';
import mozjpeg from 'imagemin-mozjpeg';
import optipng from 'imagemin-optipng';
import svgo from 'imagemin-svgo';

export function minifyHtmlEn() {
  return gulp.src('source/en/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      ignoreCustomFragments: [/<script type="application\/ld\+json">[\s\S]*?<\/script>/]
    }))
    .pipe(gulp.dest('dist/en'));
}

export function minifyHtmlService() {
  return gulp.src('source/service/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist/service'));
}

export function jsService() {
  return gulp.src('source/service/*.js')
    .pipe(terser())
    .pipe(gulp.dest('dist/service'));
}

export function cssService() {
  return gulp.src('source/service/*.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/service'));
}

export function minifyHtmlBg() {
  return gulp.src('source/bg/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      ignoreCustomFragments: [/<script type="application\/ld\+json">[\s\S]*?<\/script>/]
    }))
    .pipe(gulp.dest('dist/bg'));
}

export function scripts() {
  return gulp.src('source/js/*.js')
    .pipe(terser({
      mangle: true,
      compress: true,
      output: { comments: false }
    }))
    .pipe(gulp.dest('dist/js'));
}

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

export function styles() {
  return gulp.src('source/css/*.css')
    .pipe(purgecss({
      content: ['source/en/*.html', 'source/js/*.js']
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));
}

export const base = gulp.series(
  minifyHtmlEn,
  minifyHtmlService,
  minifyHtmlBg,
  cssService,
  styles
);

export const js = gulp.series(jsService, scripts);

export const service = gulp.series(
  jsService,
  cssService,
  minifyHtmlService
);

export default gulp.series(
  minifyHtmlEn,
  minifyHtmlService,
  minifyHtmlBg,
  jsService,
  cssService,
  scripts,
  images,
  styles
);
