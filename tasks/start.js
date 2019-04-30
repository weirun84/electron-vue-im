'use strict';

const childProcess = require('child_process');
const electron = require('electron');
const gulp = require('gulp');
const jetpack = require('fs-jetpack');



gulp.task('start', ['build', 'watch'], function () {
    //console.log('start app');


    childProcess.spawn(electron, ['.'], {
        stdio: 'inherit'
    })
    .on('close', function () {
    // User closed the app. Kill the host process.
        process.exit();
    });
});

//gulp.task('start',['sass','build']);