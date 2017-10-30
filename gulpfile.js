const
$               = require('gulp-load-plugins')(),
autoprefixer    = require('gulp-autoprefixer'),
browserSync     = require('browser-sync').create(),
cache           = require('gulp-cached'),
changed         = require('gulp-changed'),
debug           = require('gulp-debug');
gulp            = require('gulp'),
gutil           = require('gulp-util'),
injectPartials  = require('gulp-inject-partials'),
inlinesource    = require('gulp-inline-source'),
inlineCss       = require('gulp-inline-css'),
mobilizer       = require("gulp-mobilizer"),
newer           = require('gulp-newer');
plumber         = require('gulp-plumber'),
rename          = require("gulp-rename"),
sass            = require('gulp-sass');


// Error handler
function handleError(err) {
  log(err.toString());
  notify(err.toString());
  this.emit('end');
}

// log to console using
function log(msg) {
  $.util.log( $.util.colors.blue( msg ) );
}



// Default Serve - Processes SCSS and refresh page
gulp.task('serve', function() {

  browserSync.init({
    server: "./",
    port: 3010
  });

  // gulp.watch(["**/*.html"]).on('change', browserSync.reload);
  gulp.watch(['**/*.scss'],['scss']).on('error', handleError);
  gulp.watch(['**/*.scss'],['scss:campaign-backend']);
  gulp.watch(['**/*.scss'],['scss:campaign-wysiwyg-frontend']);
  gulp.watch(['**/email.html'], {debounceDelay: 200}, ['inline-css:email']);
  gulp.watch(['email-signature/**/*.html', "!**/*-export.html"],['inline-css:signature'], {debounceDelay: 200}, {debounceDelay: 200});
  // gulp.watch(["**/email.html", "**/signature-*.html", "!**/*-export.html", '**/*.css'], {debounceDelay: 1000}, ['inline']).on('error', handleError);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('scss', function() {
  return gulp.src('./scss/style.scss')
  .pipe(plumber())
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(gulp.dest('./css'))

  // Mobilizer task. Split css into mobile, desktop (all queries), hover
  .pipe(mobilizer('style.css', {
    'style-mobile.css': {
      hover: 'exclude',
      media: 'exclude'
    },
    'style-desktop.css': {
      media: 'only'
    },
    'style-hover.css': {
      hover: 'only',
      media: 'exclude'
    }
  }))
  .pipe(gulp.dest('./css'))
  .pipe(browserSync.stream());
});

gulp.task('scss:campaign-backend', function () {
  return gulp.src('scss/campaign-backend.scss')
  .pipe(plumber())
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(gulp.dest('css'));
});

gulp.task('scss:campaign-wysiwyg-frontend', function () {
  return gulp.src('scss/campaign-wysiwyg-frontend.scss')
  .pipe(plumber())
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(gulp.dest('css'));
});

const SRC = '**/email.html';
const DEST = function(file) {
  return file.base;
};

var emailSrc = '**/email.html';

gulp.task('inline-css:email', function () {
  return gulp.src(emailSrc)
  .pipe(newer(signatureDest))
  .pipe(plumber())
  .pipe(injectPartials({
    removeTags: true,
    quiet: true
  }))
  // Insert style-media.css and style-mobile.css into email-inline head
  .pipe(inlinesource({compress: true}))
  // Inline CSS in HTML body
  .pipe(inlineCss({
    applyStyleTags: false,
    applyLinkTags: true,
    removeStyleTags: false,
    preserveMediaQueries: true,
    removeLinkTags: true
  }))
  // Save with different file name
  .pipe(rename(function (file) {
    file.basename += "-export";
  }))
  .pipe(gulp.dest(DEST));
});


var signatureSrc = ['email-signature/signature-*.html'];
var signatureDest = 'email-signature/inlined/';

gulp.task('inline-css:signature', function () {
  return gulp.src(signatureSrc)
  .pipe(newer(signatureDest))
  .pipe(plumber())
  .pipe(injectPartials({
    removeTags: true,
    quiet: true
  }))
  // Insert style-media.css and style-mobile.css into email-inline head
  .pipe(inlinesource({
    compress: true
  }))
  // Inline CSS in HTML body
  .pipe(inlineCss({
    applyStyleTags: false,
    applyLinkTags: true,
    removeStyleTags: false,
    preserveMediaQueries: true,
    removeLinkTags: true
  }))
  .pipe(browserSync.reload({stream:true}))
  .pipe(gulp.dest(signatureDest));
});

// gulp.task('inline', function () {
//   return gulp.src(['**/*.html', '!node_modules/**/*.*', '!**/*-export.html', '!partials/**/*.html', '!index.html'])
//   .pipe(plumber())
//   .pipe(injectPartials({
//     removeTags: true,
//     quiet: true
//   }))
//
//   // Insert style-media.css and style-mobile.css into email-inline head
//   .pipe(inlinesource({compress: true}))
//
//   // Inline CSS in HTML body
//   .pipe(inlineCss({
//     applyStyleTags: false,
//     applyLinkTags: true,
//     removeStyleTags: false,
//     preserveMediaQueries: true,
//     removeLinkTags: true
//   }))
//
//   // Save with different file name
//   .pipe(rename(function (file) {
//     file.basename += "-export";
//   }))
//   .pipe(gulp.dest(function(file) {
//     return file.base;
//   }));
// });

gulp.task('default', ['serve']);
