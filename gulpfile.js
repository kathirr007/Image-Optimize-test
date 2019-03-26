/* eslint-disable */
 // Include gulp and plugins
 var
  gulp = require('gulp'),
  chokidar = require('chokidar'),
  del = require('del'),
  pkg = require('./package.json'),
  $ = require('gulp-load-plugins')({ lazy: true }),
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload;
  var compress_images = require('compress-images');
 
    

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

  css = {
    in: [source + 'lbd/sass/fo-style.scss'],
    watch: ['lbd/sass/**/*.scss'],
    out: dest + 'lbd/css/',
    pluginCSS: {
      in: [source + 'lbd/css/**/*', './node_modules/bootstrap-sass/assets/stylesheets/*_bootstrap.scss'],
      liveIn: [source + 'lbd/css/bootstrap.css', source + 'lbd/css/font-awesome.min.css',
                source + 'lbd/css/jquery.ui.theme.min.css', source + 'lbd/css/jquery.mCustomScrollbar.min.css',
                source + 'lbd/css/material-icons.css', source + 'lbd/css/jquery-ui-1.8.20.custom.css', source + 'lbd/css/cookieconsent.css' , source + 'lbd/css/*images/**/*'],
      watch: ['lbd/css/**/*.css'],
      out: dest + 'lbd/css/'
    },
    sassOpts: {
      outputStyle: devBuild ? 'compressed' : 'compressed',
      imagePath: '../img',
      precision: 3,
      errLogToConsole: true
    }
  },

  fonts = {
    in: source + 'lbd/fonts/*.*',
    out: dest + 'lbd/fonts/'
  },

  js = {
    in: source + 'lbd/js/**/*',
    liveIn: [source + 'lbd/js/jquery.min.js',
          // source + 'lbd/js/jquery-1.12.4.min.js',
          // source + 'lbd/js/jquery-ui.min.js',
          source + 'lbd/js/jquery-ui-1.10.0.custom.min.js',
          source + 'lbd/js/jquery-ui-slider.min.js',
          source + 'lbd/js/jquery.validate.min.js',
          source + 'lbd/js/underscore-min.js',
          source + 'lbd/js/moment.min.js',
          source + 'lbd/js/bootstrap.min.js',
          source + 'lbd/js/bootstrap-datetimepicker.js',
          source + 'lbd/js/bootstrap-selectpicker.js',
          source + 'lbd/js/bootstrap-checkbox-radio-switch-tags.js',
          source + 'lbd/js/chartist.min.js',
          source + 'lbd/js/bootstrap-notify.js',
          source + 'lbd/js/jquery.bootstrap.wizard.min.js',
          source + 'lbd/js/bootstrap-table.js',
          source + 'lbd/js/fullcalendar.min.js',
          source + 'lbd/js/light-bootstrap-dashboard.js',
          source + 'lbd/js/jquery.mCustomScrollbar.concat.min.js',
          source + 'lbd/js/jquery-ns-autogrow.min.js',
          source + 'lbd/js/countdown.js',
          source + 'lbd/js/ggdrive.js',
          source + 'lbd/js/jquery.MultiFileQuote.js',
          source + 'lbd/js/bootstrap-show-password.min.js',
          source + 'lbd/js/push.min.js',
          source + 'lbd/js/cookieconsent.min.js',
          source + 'lbd/js/custom.js'],
    out: dest + 'lbd/js/'
    // filename: 'main.js'
  },

  jsLibs = {
    in: source + 'lbd/lib/**/*',
    out: dest + 'lbd/lib/'
    // filename: 'main.js'
  },

  bootstrapFilter = $.filter(['**/bootstrap-custom.scss'], {restore: true}),
  cssFilter = $.filter(['**/*.css'], {restore: true}),
  htmlFilter = $.filter(['**/*.html', '**/*.md'], {restore: true}),
  imageFilter = $.filter(['**/*.+(jpg|png|gif|svg)'], {restore: true}),
  imageFilter2 = $.filter(['**/*.+(jpg|png|tiff|webp)'], {restore: true}),
  jsFilter = $.filter(['**/*.js'], {restore: true}),
  jsFilter2 = $.filter(['**/*.js', '!**/*custom.js'], {restore: true}),
  jsFilter3 = $.filter(['**/*.js', '!lbd/lib/sweetalert2/src/**/*'], {restore: true}),
  jsonFilter = $.filter(['**/*.json'], {restore: true}),
  // filesFilters = {
  // },

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

gulp.task('clean-images', function() {
  del([
    dest + 'lbd/img/**/*'
  ]);
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
  var imageFilter = $.filter(['**/*.{jpg,png,gif,bmp,tif}', '!**/*.svg'], {restore: true});
  gulp.src(images.in)
    .pipe($.size({title: 'Total images in '}))
    .pipe(imageFilter)
    .pipe($.size({title: 'Filtered images in '}))
    .pipe($.newer(images.out))
    .pipe($.smushit())
    .pipe($.size({title: 'Filtered images out '}))
    .pipe(imageFilter.restore)
    /*.pipe(imageFilter2)
    .pipe($.webp())
    .pipe(imageFilter2.restore)*/
    .pipe($.size({title: 'Total images out '}))
    .pipe(gulp.dest(images.out));
});

//gulp compress_images
gulp.task('compress_images', function() {
   
  //[jpg+gif+png+svg] ---to---> [jpg(webp)+gif(gifsicle)+png(webp)+svg(svgo)]
  compress_images('./lbd/img/**/*.{jpg,JPG,jpeg,JPEG,gif,png,svg}', 'build/img/', {compress_force: false, statistic: true, autoupdate: true}, false,
                                              {jpg: {engine: 'webp', command: false}},
                                              {png: {engine: 'webp', command: false}},
                                              {svg: {engine: 'svgo', command: false}},
                                              {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, function(){
        //-------------------------------------------------                                    
        //[jpg] ---to---> [jpg(jpegtran)] WARNING!!! autoupdate  - recommended to turn this off, it's not needed here - autoupdate: false
        compress_images('./lbd/img/**/*.{jpg,JPG,jpeg,JPEG}', './lbd/img/combine/', {compress_force: false, statistic: true, autoupdate: false}, false,
                                                        {jpg: {engine: 'jpegtran', command: ['-trim', '-progressive', '-copy', 'none', '-optimize']}},
                                                        {png: {engine: false, command: false}},
                                                        {svg: {engine: false, command: false}},
                                                        {gif: {engine: false, command: false}}, function(){
              //[jpg(jpegtran)] ---to---> [jpg(mozjpeg)] WARNING!!! autoupdate  - recommended to turn this off, it's not needed here - autoupdate: false
              compress_images('./lbd/img/combine/**/*.{jpg,JPG,jpeg,JPEG}', 'build/img/', {compress_force: false, statistic: true, autoupdate: false}, false,
                                                              {jpg: {engine: 'mozjpeg', command: ['-quality', '75']}},
                                                              {png: {engine: false, command: false}},
                                                              {svg: {engine: false, command: false}},
                                                              {gif: {engine: false, command: false}}, function(){
                    //[png] ---to---> [png(pngquant)] WARNING!!! autoupdate  - recommended to turn this off, it's not needed here - autoupdate: false
                    compress_images('./lbd/img/**/*.png', 'build/img/', {compress_force: false, statistic: true, autoupdate: false}, false,
                                                                    {jpg: {engine: false, command: false}},
                                                                    {png: {engine: 'pngquant', command: ['--quality=30-60']}},
                                                                    {svg: {engine: false, command: false}},
                                                                    {gif: {engine: false, command: false}}, function(){                                                      
                    }); 
              });                                      
        });
        //-------------------------------------------------
  });
});

// copy fonts
gulp.task('fonts', function() {
  return gulp.src(fonts.in)
    .pipe($.newer(dest+ 'lbd/fonts/'))
    .pipe(gulp.dest(dest + 'lbd/fonts/'));
});


// copy plugin css

// compile Sass

// js tasks






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
