/*//////////////////////////////////////////////////////////////////////////////
|| Setup
//////////////////////////////////////////////////////////////////////////////*/

/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
|| Load Config
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
var config = require('./gulp.config.json');
var run_timestamp = Math.round(Date.now()/1000);

/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
|| Include Node Files
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
var gulp = require('gulp'),
    fs = require('fs'),
    del = require('del');

/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
|| Include Plugins
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
var sass = require('gulp-ruby-sass'),
    rename = require('gulp-rename'),
    cssnano = require('gulp-cssnano'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    print = require('gulp-print'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant');


/*//////////////////////////////////////////////////////////////////////////////
|| Styles
//////////////////////////////////////////////////////////////////////////////*/

    /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    || Components
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
    gulp.task('styles', function(){

        return sass(config.env.sources.app.base + '**/*.scss', {
            sourcemap: false,
            precision: 8
        })
            .pipe(plumber(function (error) {
                console.log('--------------------');
                console.log(''+error);
                console.log('--------------------');
                this.emit('end');
            }))
            .pipe(autoprefixer({
                "browsers": ["last 2 versions"]
            }))
            .pipe(cssnano({ zindex: false }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(function(file) {
                return file.base;
            }));
    });


/*//////////////////////////////////////////////////////////////////////////////
|| Fonts
//////////////////////////////////////////////////////////////////////////////*/

    /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    || Icon Font
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
    gulp.task('fonts--icon', function(){

        var icon_src_path = config.env.sources.local.base + config.env.sources.local.icons;
        var sass_src_path = config.env.sources.local.base + config.env.sources.local.sass;
        var dest_path = config.env.sources.local.base + config.env.sources.local.fonts;

        var font_name = "icon--font--" + config.project;
        return gulp.src([icon_src_path + '*.svg'])
            .pipe(iconfontCss({
                fontName: font_name,
                path: sass_src_path + 'utilities/_icons-template.scss',
                targetPath: '_icons.scss',
                fontPath: dest_path + 'icons/'
            }))
            .pipe(iconfont({
                fontName: font_name,
                appendCodepoints: true,
                normalize: true
            }))
            .on('codepoints', function(codepoints, options){
                console.log(codepoints, options);
            })
            .pipe(gulp.dest(dest_path + 'icons/'));
    });

    /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    || Font Move
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
    gulp.task('fonts--move', function(){

        var src_path = config.env.sources.local.base + config.env.sources.local.fonts;
        var dest_path = config.env.build.base + config.env.build.fonts;

        return gulp.src(src_path + "**/*.*")
            .pipe(gulp.dest(dest_path))
            .pipe(print(function(filepath){
                return "Copied " + filepath + " to " + dest_path;
            }));
    });

    /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    || Font Cleanup - LOCAL
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
    gulp.task('fonts--cleanup', ['fonts--move'], function(){

        var clean_path = config.env.build.base + config.env.build.fonts;

        del([clean_path + "**/*.scss"], { force: true }).then(paths => {
            console.log('Deleted:', paths.join('\n'));
        });
        return;
    });


/*//////////////////////////////////////////////////////////////////////////////
|| Images
//////////////////////////////////////////////////////////////////////////////*/

    /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    || Optimise
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
    gulp.task('images', function(){

        return gulp.src(config.env.sources.local.base + config.env.sources.local.images + '**/*')
            .pipe(imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            }))
            .pipe(gulp.dest(config.env.build.base + config.env.build.images));
    });


/*//////////////////////////////////////////////////////////////////////////////
|| General
//////////////////////////////////////////////////////////////////////////////*/

    /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    || Build Tasks
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
    gulp.task('build', ['images', 'styles']);


/*//////////////////////////////////////////////////////////////////////////////
|| Watches
//////////////////////////////////////////////////////////////////////////////*/
    gulp.task('watch', function(){

    /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    || Fonts
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
    if (config.requires.local_icons){
        gulp.watch(config.env.sources.local.base + config.env.sources.local.icons + '*.svg', { debounceDelay: 2000 }, ['fonts--icon']);
        gulp.watch(config.env.sources.local.base + config.env.sources.local.fonts + 'icons/*', { debounceDelay: 2000 }, ['fonts--cleanup', 'styles']);
    }

    /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    || Images
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
    if (config.requires.local_images) {
        gulp.watch(config.env.sources.local.base + config.env.sources.local.images + '**/*', {debounceDelay: 2000}, ['images']);
    }

    /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    || Styles
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        || App files
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        gulp.watch(config.env.sources.app.base + '**/*.scss', { debounceDelay: 2000 }, ['styles']);

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        || All
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        gulp.watch(config.env.sources.local.base + '**/*.scss', { debounceDelay: 2000 }, ['styles']);

});


/*//////////////////////////////////////////////////////////////////////////////
 || Default task wrapper
 //////////////////////////////////////////////////////////////////////////////*/
gulp.task('default', ['watch']);
