/* eslint-disable */
 // Include gulp and plugins
 var
  gulp = require('gulp'),
  chokidar = require('chokidar'),
  del = require('del'),
  imagemin = require('imagemin'),
  imageminPngquant = require('imagemin-pngquant'),
  pkg = require('./package.json'),
  $ = require('gulp-load-plugins')({ lazy: true }),
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload;
  var compress_images = require('compress-images');

//   export ABRAIA_KEY='NWE2ZTkxYjAzYzAwMDAwMDpPTHNUTEFoZzNtUkYwYWtzRXRwUDJXaFpHYmZjd3lxSQ==';

  process.env['ABRAIA_KEY'] = 'NWE2ZTkxYjAzYzAwMDAwMDpPTHNUTEFoZzNtUkYwYWtzRXRwUDJXaFpHYmZjd3lxSQ==';



// file locations
var
  devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production'),

  source = './',
  dest = devBuild ? 'builds/development/' : 'builds/production/',

  nodeModules = './node_modules/';
  bootstrapSources = nodeModules + 'bootstrap-sass/assets/stylesheets/**/*.scss';

  html = {
    partials: [source + '_partials/**/*'],
    in: [source + '*.html'],
    watch: ['*.html', '_partials/**/*'],
    out: dest,
    context: {
      devBuild: devBuild,
      author: pkg.author,
      version: pkg.version
    }
  },

  images = {
    in: source + 'lbd/img/**/*',
    out: dest + 'lbd/img/'
  },

  fonts = {
    in: source + 'lbd/fonts/*.*',
    out: dest + 'lbd/fonts/'
  },


  syncOpts = {
    server: {
      baseDir: dest,
      index: 'index.html'
    },
    open: false,
    injectChanges: true,
    reloadDelay: 0,
    notify: true
  };

// show build type
console.log(pkg.name + ' ' + pkg.version + ', ' + (devBuild ? 'development' : 'production') + ' build');


// Clean tasks
gulp.task('clean', function(done) {
  del([
    dest + '*'
  ]);
  done();
});

gulp.task('clean-images', function(done) {
  del([
    dest + 'lbd/img/**/*'
  ]);
  done();
});

gulp.task('clean-html', function() {
  del([
    dest + '**/*.html'
  ]);
});

gulp.task('clean-css', function() {
  del([
    dest + 'lbd/css/**/*'
  ]);
});

gulp.task('clean-js', function() {
  del([
    dest + 'lbd/js/**/*'
  ]);
});

gulp.task('clean-jslib', function() {
  del([
    dest + 'lbd/lib/**/*'
  ]);
});

gulp.task('clean-bundle', function(){
  del([dest + 'lbd/css/lbd-bundle.css', dest + 'lbd/js/lbd-bundle.js', dest + 'lbd/lib/plugins-bundle.*']);
});

// reload task
gulp.task('reload', done => {
    browserSync.reload();
    done();
});

// build HTML files
gulp.task('html', function() {
  var page = gulp.src(html.in)
             // .pipe($.newer(html.out))
             .pipe($.preprocess({ context: html.context }))
             /*.pipe($.replace(/.\jpg|\.png|\.tiff/g, '.webp'))*/;
  if (!devBuild) {
      page = page
      .pipe($.size({ title: 'HTML in' }))
      .pipe($.htmlclean())
      .pipe($.size({ title: 'HTML out' }));
  }
  return page
     .pipe(gulp.dest(html.out));
});

// manage images
gulp.task('images', () => {
  // var imageFilter = $.filter(['**/*.jpg', '**/*.png'], {restore: true});
  var imageFilter = $.filter(['**/*.{jpg,png,gif,bmp,tif,svg}', '!**/*.{ico}'], {restore: true});
  return gulp.src(images.in)
    .pipe($.size({title: 'Total images in '}))
    /* .pipe(imageFilter)
    .pipe($.size({title: 'Filtered images in '})) */
    .pipe($.newer(images.out))
    .pipe($.image({
        jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80, '--loops', 10],
        // mozjpeg: ['-optimize', '-progressive'],
        // guetzli: ['--quality', 85],
        quiet: true
    }))
    /*.pipe($.size({title: 'Filtered images out '}))
    .pipe(imageFilter.restore)
    .pipe(imageFilter2)
    .pipe($.webp())
    .pipe(imageFilter2.restore)*/
    .pipe($.size({title: 'Total images out '}))
    .pipe(gulp.dest(images.out));
});

gulp.task('gulp-image', () => {
    gulp.src(images.in)
        // .pipe($.newer('./builds/development/img/compressed/gulp-image'))
        .pipe($.image({
            jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80, '--loops', 10],
            // mozjpeg: ['-optimize', '-progressive'],
            // guetzli: ['--quality', 85],
            quiet: true
        }))
        .pipe(gulp.dest('./builds/development/img/compressed/gulp-image/jpegRecomp'));
  });

  gulp.task('optimize-images', () => {
    return gulp.src(images.in)
      .pipe($.cache($.abraia()))
      .pipe(gulp.dest('builds/development/img/abaria'))
  })

  gulp.task('variants', () => {
    return gulp.src(images.in)
      .pipe($.cache($.abraia([
        { width: 1920, rename: { suffix: '-1920' }},
        { width: 750, rename: { suffix: '-750' }},
        { width: 375, rename: { suffix: '-375' }}
      ])))
      .pipe(gulp.dest('builds/development/img/abaria'))
  })

// copy fonts
gulp.task('fonts', function() {
  return gulp.src(fonts.in)
    .pipe($.newer(dest+ 'lbd/fonts/'))
    .pipe($.image({
        quiet: true
    }))
    .pipe($.fontmin())
    .pipe(gulp.dest(dest + 'lbd/fonts/'));
});








gulp.task('test', function(){
  console.log('Runs the test task');
});

// browser sync
gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: dest,
      index: 'index.html'
    },
    // files: [dest + 'lbd/css/light-bootstrap-dashboard.css', dest + 'lbd/js/custom.js'],
    open: false,
    // port: 3000,
    injectChanges: true,
    notify: true

  });
});


var exec = require('child_process').exec;

gulp.task('watch', gulp.parallel('serve', () => {


  // image changes
  gulp.watch(images.in, gulp.series('images'));

}));

// default task
gulp.task('default', gulp.parallel('images', 'watch'), done => {
  done();
});

// gulp.task('default', ['serve']);
/* eslint-enable */
