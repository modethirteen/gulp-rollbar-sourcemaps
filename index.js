/*
 * Gulp Rollbar Source Maps
 * Copyright (C) 2006-2014 MindTouch, Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
var through = require('through2');
var urljoin = require('url-join');
var fs = require('fs');
var needle = require('needle');
var util = require('gulp-util');
var retry = require('retry');

var PLUGIN_NAME = 'gulp-rollbar-sourcemaps';

module.exports = function(options) {
    var token = options.token || '';
    if(token === '') {
        throw new Error(PLUGIN_NAME + ': options parameter "token" (Rollbar post_server_item access token) is not set.');
    }
    var baseuri = options.baseuri || '';
    if(options.baseuri === '') {
        throw new Error(PLUGIN_NAME + ': options parameter "baseuri" (Scheme, hostname, and path relative to static file paths) is not set.');
    }
    var version = options.version || '';
    if(version === '') {
        throw new Error(PLUGIN_NAME + ': options parameter "version" (Source code version) is not set.');
    }
    return through.obj(function(file, encoding, done) {
        if(file.sourceMap) {
            var filename = file.relative + '.map';
            util.log(filename + ': Sending to Rollbar...');

            // setup retries
            var op = retry.operation({
                retries: 5
            });
            op.attempt(function() {
                needle.post('https://api.rollbar.com/api/1/sourcemap', {
                    access_token: token,
                    version: version,
                    minified_url: urljoin(baseuri, file.relative),
                    source_map: {
                        buffer: new Buffer(JSON.stringify(file.sourceMap)),
                        filename: filename,
                        content_type: 'application/octet-stream'
                    }
                }, {
                    multipart: true
                },
                function(error, response, body) {
                    if(error) {
                        var msg = filename + ': ' + error.message;
                        if(op.retry(error)) {
                            msg += ', retrying...';
                        }
                        util.log(msg);
                        return;
                    }
                    util.log(filename + ': Rollbar returned ' + (body.result ? body.result : body));
                });
            });
        }
        this.push(file);
        return done();
    });
};
