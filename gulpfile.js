//  
//                                  _oo8oo_
//                                 o8888888o
//                                 88" . "88
//                                 (| -_- |)
//                                 0\  =  /0
//                               ___/'==='\___
//                             .' \\|     |// '.
//                            / \\|||  :  |||// \
//                           / _||||| -:- |||||_ \
//                          |   | \\\  -  /// |   |
//                          | \_|  ''\---/''  |_/ |
//                          \  .-\__  '-'  __/-.  /
//                        ___'. .'  /--.--\  '. .'___
//                     ."" '<  '.___\_<|>_/___.'  >' "".
//                    | | :  `- \`.:`\ _ /`:.`/ -`  : | |
//                    \  \ `-.   \_ __\ /__ _/   .-` /  /
//                =====`-.____`.___ \_____/ ___.`____.-`=====
//                                  `=---=`
//  
//  
//               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 
//                          佛祖保佑         永无bug
//                          
﻿
/**
 * @author myqianlan
 * @update 2014年12月9日14:54:53
 */
// 包含gulp   
var gulp = require('gulp');

// 包含插件   
// sass 编译
var sass = require('gulp-sass');
// js检查
var jshint = require('gulp-jshint');
// 压缩JS
var uglify = require('gulp-uglify');
// 压缩CSS
var minifycss = require('gulp-minify-css');
// 重命名
var rename = require('gulp-rename');
// 自动加CSS浏览器前缀
var autoprefixer = require('gulp-autoprefixer');
// 图片压缩
var imagemin = require('gulp-imagemin');
// 清除
var rimraf = require('gulp-rimraf');
// 输出美化
var chalk = require('chalk');
// 自动生成雪碧图及其CSS
var spritesmith = require('gulp.spritesmith');


// Server
var http = require('http');
var connect = require('connect');
var open = require('open');

// Server Settings
var root = './app';
var port = 3000;
var host = 'localhost';
var protocol = 'http';

// Build Settings
var build = './dist';


gulp.task('server', function() {
    var app = connect().use(connect.static(root));
    http.createServer(app).listen(port);
    open(protocol + '://' + host + ':' + port + '/index.html');
});

// 自动生成雪碧图及其CSS
gulp.task('sprite', function() {
    var spriteData = gulp.src(root + '/sprite/img/*.png').pipe(spritesmith({
        imgName: 'sprites.png',
        cssName: 'sprite.css',
        // algorithm: 'diagonal'
    }));
    spriteData.pipe(gulp.dest(root + '/sprite'));
});

// clean css files
gulp.task('cleancss', function() {
    return gulp.src(root + '/css', {
            read: false
        }) // much faster
        .pipe(rimraf());
});

// Compile SASS 
gulp.task('css', ['cleancss'], function() {
    return gulp.src(root + '/scss/**/*.scss')
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(autoprefixer()) // By default, Autoprefixer uses > 1%, last 2 versions, Firefox ESR, Opera 12.1
        .pipe(gulp.dest(root + '/css'));
});


// 压缩JS文件 
gulp.task('minifyjs', function() {
    return gulp.src(root + '/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(root + '/_temp/js'));
});

// JS语法检查
gulp.task('jshint', function() {
    return gulp.src(root + '/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 压缩CSS文件   
gulp.task('minifycss', ['css'], function() {
    return gulp.src(root + '/css/**/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest(root + '/_temp/css'));
});

// 压缩 static images
gulp.task('imagemin', function() {
    return gulp.src(root + '/img/**/*')
        // Pass in options to the task
        .pipe(imagemin({
            optimizationLevel: 3, //png
            progressive: true, //jpg
            interlaced: true //gif
        }))
        .pipe(gulp.dest(root + '/_temp/img'));
});

// 生成debug文件
gulp.task('debugfile', ['debugcss', 'debugjs']);
gulp.task('debugcss', function() {
    return gulp.src(root + '/css/**/*.css')
        .pipe(rename({
            suffix: "-debug"
        }))
        .pipe(gulp.dest(root + '/_temp/css'));
});
gulp.task('debugjs', function() {
    return gulp.src(root + '/js/**/*.js')
        .pipe(rename({
            suffix: "-debug"
        }))
        .pipe(gulp.dest(root + '/_temp/js'));
});
// 复制文件
gulp.task('copy', ['minifyjs', 'minifycss', 'debugfile','imagemin', 'copyvendor'], function() {
    return gulp.src(root + '/_temp/**/*')
        .pipe(gulp.dest(build));
});

gulp.task('copyvendor', function() {
    return gulp.src(root + '/vendor/**/*')
        .pipe(gulp.dest(root + '/_temp/vendor'));
});

// 使用说明
gulp.task('help', function() {
    console.log(chalk.white.bgCyan.bold('\n\nF2E-workflow使用说明：\n\n gulp && gulp help：帮助信息\n gulp dev：不带本地服务器的开发\n gulp sdev：带本地服务器的开发\n gulp build：压缩JS CSS代码,压缩图片\n gulp cleanbuild：删除dist文件夹\n\n更多详细的请配置gulpfile.js文件\n\n'));
});



// 默认任务   
gulp.task('default', ['help']);

// 开发任务
gulp.task('sdev', ['css', 'server'], function() {

    // 监视scss文件的变化,并且执行sass && autoprefixer
    gulp.watch(root + '/scss/**/*.scss', ['css']);
});
// 不带本地服务器
gulp.task('dev', ['css'], function() {
    // 监视scss文件的变化,并且执行sass && autoprefixer
    gulp.watch(root + '/scss/**/*.scss', ['css']);
});

// 构建任务
gulp.task('build', ['copy'], function() {
    return gulp.src(root + '/_temp', {
            read: false
        }) // much faster
        .pipe(rimraf());
});
// clean build
gulp.task('cleanbuild', function() {
    return gulp.src(build, {
            read: false
        }) // much faster
        .pipe(rimraf());
});