## gulp-rollbar-sourcemaps   
Deploy source maps from Gulp.js tasks to Rollbar for detailed JavaScript stack traces

### Install

```sh
$ npm install gulp-rollbar-sourcemaps --save-dev
```

### Usage

```javascript
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rollbar = require('gulp-rollbar');

gulp.task('javascript:minify', function() {
  gulp.src('*.js')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(rollbar({
      token: 'foo', // rollbar client access token
      baseuri: 'http://example.com', // the domain your javascript is deployed on
      version: '12345',  // this build revision (usually git commit #)
    }))
    .pipe(gulp.dest('dist'));
});
```
