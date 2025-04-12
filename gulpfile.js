import gulp from 'gulp';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import tester from 'gulp-terser';
import imagemin from 'gulp-imagemin';

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
    .pipe(tester())
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
    .pipe(tester())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('images', () => {
  return gulp.src('source/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'));
});

gulp.task('styles', () => {
  return gulp.src('source/css/*.css')
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
