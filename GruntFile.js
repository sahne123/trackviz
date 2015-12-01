module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        typescript: {
            base: {
                src: ['scripts/*.ts'],
                dest: 'scripts/src',
                options: {
                    module: 'amd',
                    target: 'es5',
                }
            }
        },
        concat: {
            js: {
                options: {
                    separator: ';',
                },
                files: [{
                    src: ['scripts/3rdparty/jquery-2.1.4.min.js', 'scripts/3rdparty/leaflet.js',
                        'scripts/3rdparty/*.js',  
                        'scripts/src/*.js', '!scripts/src/app.js', 'scripts/src/app.js',
                        '!scripts/src/scripts.js', '!scripts/src/scripts.min.js'],
                    dest: 'scripts/src/scripts.js'
                }]
            },
            css: {
                files: [{
                    src: ['styles/*/*.css', 'styles/*.css', '!styles/app.css', 'styles/app.css', '!styles/src/*'],
                    dest: 'styles/src/app.css'   
                }]
            }
        },
        uglify: {
            options: {
                compress: true,
            },
            js: {
                src: 'scripts/src/scripts.js',
                dest: 'scripts/src/scripts.min.js'
            }
        },
        cssmin: {
            target: {
                files: {
                    'styles/src/app.min.css': ['styles/src/app.css']
                }
            }
        },
        clean: {
            js: ['scripts/src/*', '!scripts/src/scripts.js'],
        },
        watch: {
            js: {
                files: ['scripts/*.ts', 'scripts/*/*.ts'],
                tasks: ['typescript', 'concat:js', 'clean:js', 'uglify:js']
            },
            css: {
                files: ['styles/*.css', 'styles/*/*.css', '!styles/src/*'],
                tasks: ['concat:css', 'cssmin']
            }
            
        }
    });
 
    grunt.registerTask('default', ['watch']);
 
}