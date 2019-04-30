'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const plumber = require('gulp-plumber');
const jetpack = require('fs-jetpack');
const path = require('path');

const ts = require('gulp-typescript');
const clean = require('gulp-clean');

const sourcemaps = require('gulp-sourcemaps');

const bundle = require('./bundle');
const utils = require('./utils');

const projectDir = jetpack;



const srcDir = jetpack.cwd('./src');
const destDir = jetpack.cwd('./out');

gulp.task('bundle', function () {
    return Promise.all([
        //bundle(srcDir.path('background.js'), destDir.path('background.js')),
        //bundle(srcDir.path('main.ts'), destDir.path('app.js'))
        //bundle(srcDir.path('i18n/index.js'), destDir.path('i18n/index.js')),
        gulp.src(srcDir.path('../view')+'/**/*').pipe(gulp.dest(destDir.path('./')+"/view")),
        gulp.src(srcDir.path('../resources')+'/**/*').pipe(gulp.dest(destDir.path('./')+"/resources"))
        //gulp.src(srcDir.path('i18n/lang')+'/**/*').pipe(gulp.dest(destDir.path('i18n/lang')))
    ]);
});



gulp.task('sass', function () {
    var scPath=srcDir.path('./'); 
    return gulp.src(path.join(scPath, '**/*.scss'))           
               .pipe(sass().on('error', function(err){                                   
                    console.log(err);
               }))               
               .pipe(gulp.dest(destDir.path('./')));
 
    // return gulp.src(srcDir.path('stylesheets') + '/**/*.scss')    
    //       .pipe(sass().on('error', sass.logError))
    //       .pipe(gulp.dest('d:\\'));

    // return gulp.src(srcDir.path('stylesheets'))
    //     .pipe(plumber())
    //     .pipe(sass())
    //     .pipe(gulp.dest(destDir.path('stylesheets')));
});

 
//编译选项
var tsProject = ts.createProject(srcDir.path('./')+'tsconfig.json');
//ts 编译
gulp.task('scripts', function() {
    
    var scPath=srcDir.path('./'); 
    console.log('task scripts src path:'+scPath);
    var tsResult  = gulp.src(path.join(scPath, '**/*.ts'))
                    .pipe(tsProject());               
     return tsResult.js.pipe(gulp.dest(destDir.path('./')));
});


 
// 编译目录清理
gulp.task('out-clean', function() {  
    var outPath=destDir.path('./');
    return gulp.src([outPath], {read: false})
      .pipe(clean());
  });


// gulp.task('environment', function () {
//     const configFile = 'config/env_' + utils.getEnvName() + '.json';
//     projectDir.copy(configFile, destDir.path('env.json'), { overwrite: true });
// });

gulp.task('watch',['scripts'], function () {
    const beepOnError = function (done) {
        return function (err) {
            if (err) {
                utils.beepSound();
            }
            done(err);
        };
    };
 
    var scPath=srcDir.path('./'); 
    watch(scPath+"**/*.ts",['scripts']);

    var scPath=srcDir.path('./'); 
    watch(scPath+"**/*.sass",['sass']);
  
});


//编译脚本
gulp.task('build', ['out-clean'],function(){
    gulp.start(['sass','scripts','watch','bundle']);
} );
