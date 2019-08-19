// Include gulp and plugins
const gulp = require('gulp');

const del = require('del');

// pkg = require('./package.json'),

const $ = require('gulp-load-plugins')({
    lazy: true
});

const browserSync = require('browser-sync').create();

const reload = browserSync.reload;

// file locations
let devBuild =
    (process.env.NODE_ENV || 'development').trim().toLowerCase() !==
    'production';

let source = './';

let dest = devBuild ? 'builds/development/' : 'builds/production/';

let images = {
    in: [source + 'lbd/img/**/*', source + 'lbd/lib/tag_editmaster/img/**/*'],
    out: dest + 'lbd/img/'
};


// Clean tasks
gulp.task('clean', cb => {
    del([dest + '**/*'], cb());
});

gulp.task('clean-images', cb => {
    del([dest + 'lbd/img/**/*'], cb());
});

// reload task
gulp.task('reload', done => {
    browserSync.reload();
    done();
});

// manage images
gulp.task('images', () => {
    var imageFilter2 = $.filter(['**/*.+(jpg|png|tiff|webp)'], {
        restore: true
    });
    return (
        gulp
        .src(images.in)
        .pipe($.size({
            title: 'images in '
        }))
        .pipe($.newer(images.out))
        .pipe($.plumber())
        .pipe($.image({
            jpegRecompress: ['--strip', '--quality', 'medium', '--loops', 10, '--min', 40, '--max', 80],
            mozjpeg: ['-quality', 50, '-optimize', '-progressive'],
            guetzli: ['--quality', 84],
            quiet: true
        }))
        /* .pipe($.image({
            jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
            mozjpeg: ['-optimize', '-progressive'],
            guetzli: ['--quality', 84],
            quiet: true
        })) */
        // .pipe($.imagemin())
        .pipe($.size({
            title: 'images out '
        }))
        .pipe(gulp.dest(images.out))
    );
});

gulp.task('optim-images', function () {
    return gulp.src(images.in)
        .pipe($.size({
            title: 'Total images in '
        }))
        .pipe($.newer(images.out))
        .pipe($.plumber())
        .pipe($.image({
            jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
            // mozjpeg: ['-optimize', '-progressive'],
            // guetzli: ['--quality', 85],
            quiet: true
        }))
        .pipe($.size({
            title: 'Total images out '
        }))
        .pipe(gulp.dest(images.out));
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

gulp.task(
    'watch',
    gulp.parallel('serve', () => {
        // image changes
        gulp.watch(images.in, gulp.series('images'));

    })
);

// default task
gulp.task(
    'default',
    gulp.parallel(
        'images',
        gulp.series('watch')
    )
);
