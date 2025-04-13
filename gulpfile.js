import gulp from 'gulp';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import imagemin from 'gulp-imagemin';
import purgecss from 'gulp-purgecss';
import mozjpeg from 'imagemin-mozjpeg';
import optipng from 'imagemin-optipng';
import svgo from 'imagemin-svgo';
gulp.task('minify-html-en', () => {
  return gulp.src('source/en/*.html')
    .pipe(htmlmin({ collapseWhitespace: true,removeComments: true,
      ignoreCustomFragments: [ /<script type="application\/ld\+json">[\s\S]*?<\/script>/ ]
     }))
    .pipe(gulp.dest('dist/en'));
});

gulp.task('minify-html-service', () => {
  return gulp.src('source/service/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist/service'));
});

gulp.task('js-service', () => {
  return gulp.src('source/service/*.js')
    .pipe(terser())
    .pipe(gulp.dest('dist/service'));
});

gulp.task('css-service', () => {
  return gulp.src('source/service/*.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/service'));
});

gulp.task('minify-html-bg', () => {
  return gulp.src('source/bg/*.html')
    .pipe(htmlmin({ collapseWhitespace: true,removeComments: true,
      ignoreCustomFragments: [ /<script type="application\/ld\+json">[\s\S]*?<\/script>/ ]
     }))
    .pipe(gulp.dest('dist/bg'));
});

gulp.task('scripts', () => {
  return gulp.src('source/js/*.js')
    .pipe(terser({
      mangle: true,
      compress: true,
      output: {
        comments: false
      }
    }))
    .pipe(gulp.dest('dist/js'));
});


gulp.task('images', () => {
  return gulp.src('source/images/**/*')
    .pipe(imagemin([
      // JPEG compression (0–100, lower = more compression)
      mozjpeg({ quality: 75, progressive: true }),

      // PNG compression (0–7, higher = more compression)
      optipng({ optimizationLevel: 5 }),

      // SVG optimization
      svgo({
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'cleanupIDs', active: false }
        ]
      }),
    ]))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('styles', () => {
  return gulp.src('source/css/*.css')
    .pipe(purgecss({
      content: ['source/en/*.html','source/en/*.html', 'source/js/*.js'] // paths to your HTML/JS
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('default', gulp.series(
  'minify-html-en',
  'minify-html-service',
  'minify-html-bg',
  'js-service',
  'css-service',
  'scripts',
  'images',
  'styles'
));

gulp.task('base', gulp.series(
  'minify-html-en',
  'minify-html-service',
  'minify-html-bg',
  'css-service',
  'styles',
));
