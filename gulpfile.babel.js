import gulp from 'gulp';
import webpack from 'webpack-stream';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import wpConfig from './webpack.config.js';

const bSync = browserSync.create();

gulp.task('default', ['compile-js'], () => {
    bSync.init({
        server: 'src/'
    });
    gulp.watch('src/**/*', ['compile-js']).on('change', bSync.reload);
});

gulp.task('compile-js', () => {
    return gulp
        .src('src/js/app.js')
        .pipe(plumber())
        .pipe(webpack(wpConfig))
        .pipe(gulp.dest('./src/js/bin'))
        .pipe(browserSync.stream());
});
