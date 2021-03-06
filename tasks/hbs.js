const gulp        = require('gulp'),
      runSequence = require('run-sequence'),
      fs          = require('fs'),
      rename      = require('gulp-rename'),
      browserSync = require('browser-sync'),
      gutil       = require('gulp-util'),
      zeroFill    = require('zero-fill'),
      stringWidth = require('string-width'),
      handlebars  = require('gulp-compile-handlebars'),
      hbs         = [],
      slugify = text => text.toString().toLowerCase()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, ''),      // Trim - from end of text
      options     = {
        ignorePartials: true,
        batch:          ['app/templates/components'],
        helpers:        {
          ifEq (a, b, opts) {
            if (a === b) {
              return opts.fn(this);
            }
            return opts.inverse(this);
          },
          ifNotEq (a, b, opts) {
            if (a !== b) {
              return opts.fn(this);
            }
            return opts.inverse(this);
          },
          limit (a, limit) {
            return a.slice(0, limit);
          }
        }
      };


gulp.task('hbs', callback => runSequence(
  'hbs:read',
  'hbs:generate',
  callback));

gulp.task('hbs:read', () => {
  hbs[0] = JSON.parse(fs.readFileSync('tmp/pages/index.json'));
  hbs[1] = JSON.parse(fs.readFileSync('tmp/pages/posts.json'));
});

gulp.task('hbs:generate', () => {
  gulp.src('app/templates/index.hbs')
    .pipe(handlebars(hbs[0], options))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({ stream: true }));

  gulp.src('app/templates/archive.hbs')
    .pipe(handlebars(hbs[1], options))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('dist/archive'))
    .pipe(browserSync.reload({ stream: true }));

  Object.values(hbs[1]).forEach((post) => {
    const date = post.date.slice(0, 10);
    gulp.src('app/templates/post.hbs')
      .pipe(handlebars(post, options))
      .pipe(rename(`${date}-${slugify(post.title)}/index.html`))
      .pipe(gulp.dest('dist'))
      .pipe(browserSync.reload({ stream: true }));
  });
});
