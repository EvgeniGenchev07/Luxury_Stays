import gulp from 'gulp';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import imagemin from 'gulp-imagemin';
import purgecss from 'gulp-purgecss';
import mozjpeg from 'imagemin-mozjpeg';
import optipng from 'imagemin-optipng';
import webp from 'imagemin-webp';
import svgo from 'imagemin-svgo';
import rev from 'gulp-rev';
import revDel from 'gulp-rev-delete-original';
import revReplace from 'gulp-rev-replace';
import through2 from 'through2';
import path from 'path';
import fs from 'fs';
import nunjucksRender from 'gulp-nunjucks-render';
import data from 'gulp-data';
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

// ---------- Image optimization ---------
export function images() {
  return gulp.src('source/images/**/*.{jpg,jpeg,png,svg,webp}', { base: 'source/images' })
    .pipe(gulp.dest('dist/images'));
}

// ---------- Hash & update HTML references ----------
function hashAssets() {
  return gulp.src(['dist/**/*.{css,js}'], { base: 'source' })
    .pipe(rev())
    .pipe(revDel())
    .pipe(gulp.dest('source'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('source'));
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

function seoFilesTransfer() {
  return gulp.src(['source/seoOptimization/*.txt', 'source/seoOptimization/*.xml'])
    .pipe(gulp.dest('dist'));
}

// ---------- Template rendering (Nunjucks) ----------
function renderTemplates(lang) {
  return function renderTask() {
    return gulp.src('source/templates/pages/*.njk')
      .pipe(data(function(file) {
        const dictPath = `source/templates/data/${lang}.json`;
        const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
        // Page id from filename
        const pageId = path.basename(file.path, '.njk');
        // Build meta defaults; specific pages can be enhanced later
        const baseUrl = 'https://luxurystays.bg';
        const langPath = lang === 'en' ? 'en' : 'bg';
        const altEn = `${baseUrl}/en/${pageId === 'index' ? '' : pageId + '.html'}`.replace(/\/\/$/, '/');
        const altBg = `${baseUrl}/bg/${pageId === 'index' ? '' : pageId + '.html'}`.replace(/\/\/$/, '/');
        const canonical = lang === 'en' ? altEn : altBg;
        const ogUrl = canonical;
        const titles = {
          index: { en: 'Luxury Stays', bg: 'Luxury Stays' },
          about: { en: 'About – Luxury Stays Kapana Plovdiv', bg: 'За нас – Luxury Stays Kapana Пловдив' },
          posts: { en: 'Posts – Luxury Stays', bg: 'Публикации – Luxury Stays' },
          post: { en: 'Post – Luxury Stays', bg: 'Публикация – Luxury Stays' },
          contact: { en: 'Contact – Luxury Stays', bg: 'Контакти – Luxury Stays' },
          reservation: { en: 'Reservation – Luxury Stays', bg: 'Резервация – Luxury Stays' }
        };
        const descriptions = {
          index: {
            en: "Experience the charm of Plovdiv's Kapana district with our luxurious apartments.",
            bg: "Изживейте чарът на Пловдив с нашите луксозни апартаменти в квартал Капана."
          },
          about: {
            en: "Learn more about Luxury Stays Kapana and our mission.",
            bg: "Научете повече за Luxury Stays Kapana и нашата мисия."
          }
        };
        const meta = {
          title: (titles[pageId] && titles[pageId][lang]) || 'Luxury Stays',
          keywords: lang === 'en' ? "luxury stays, luxury apartments in Kapana, Plovdiv vacation rentals, short-term rental Bulgaria" : "луксозни апартаменти, апартаменти в Капана, наеми в Пловдив, краткосрочен наем България",
          description: (descriptions[pageId] && descriptions[pageId][lang]) || (lang === 'en' ? "Discover luxurious accommodations in Plovdiv's Kapana." : "Открийте луксозни настанявания в квартал Капана."),
          ogTitle: (titles[pageId] && titles[pageId][lang]) || 'Luxury Stays',
          ogDescription: (descriptions[pageId] && descriptions[pageId][lang]) || (lang === 'en' ? "Discover luxurious accommodations in Plovdiv's Kapana." : "Открийте луксозни настанявания в квартал Капана."),
          ogImage: `${baseUrl}/images/bedroom_3.webp`,
          ogUrl: ogUrl,
          altEn: altEn,
          altBg: altBg,
          canonical: canonical
        };
        return { ...dict, pageId, meta };
      }))
      .pipe(nunjucksRender({ path: ['source/templates'] }))
      .pipe(gulp.dest(`source/${lang}`));
  };
}

export const renderEn = renderTemplates('en');
export const renderBg = renderTemplates('bg');

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
export const styles = minifyCss('source/css/*.css', 'dist/css', true, ['source/en/*.html', 'source/bg/*.html', 'source/js/*.js']);

// ---------- Pipelines ----------
export const base = gulp.series(
  renderEn,
  renderBg,
  minifyHtmlEn,
  minifyHtmlService,
  minifyHtmlBg,
  cssService,
  styles
);

export const js = gulp.series(jsService, scripts);

export const service = gulp.series(jsService, cssService, minifyHtmlService);

export const admin = gulp.series(minifyHtmlAdmin, jsAdmin, cssAdmin);

export const seo = gulp.series(seoFilesTransfer);

export const build = gulp.series(
  renderEn,
  renderBg,
  minifyHtmlEn,
  minifyHtmlService,
  minifyHtmlBg,
  minifyHtmlAdmin,
  jsService,
  jsAdmin,
  cssService,
  cssAdmin,
  scripts,
  styles,
  hashAssets,
  updateHtmlReferences,
  seo
);
export const hash = gulp.series(hashAssets, updateHtmlReferences);
export default build;