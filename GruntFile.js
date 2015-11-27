module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: './'
                }
            }
        },
        typescript: {
            base: {
                src: ['scripts/*.ts'],
                dest: 'scripts',
                options: {
                    module: 'amd',
                    target: 'es5',
                }
            }
        },
        concat: {
            options: {
                separator: ';',
            },
            build: {
                files: [{
                    src: ['scripts/*.js', '!scripts/3rdparty/*', '!scripts/app.js', 'scripts/app.js'],
                    dest: 'scripts/src/app.js'
                }]
            }
        },
        uglify: {
            options: {
                compress: true,
            },
            build: {
                src: 'scripts/src/app.js',
                dest: 'scripts/src/app.min.js'
            }
        },
        watch: {
            js: {
                files: ['scripts/*.ts'],
                tasks: ['typescript', 'concat:build', 'uglify:build']
            },
            
        },
        open: {
            dev: {
                path: 'http://localhost:8080/index.html'    
            }
        }
    });
 
    grunt.registerTask('default', ['connect', 'open', 'watch']);
 
}