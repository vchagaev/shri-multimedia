import gulp from 'gulp';
import browserSync from 'browser-sync';

const bSync = browserSync.create();

gulp.task('default', () => {
    bSync.init({
        server: 'src/'
    });
    gulp.watch('src/**/*').on('change', bSync.reload);
});
