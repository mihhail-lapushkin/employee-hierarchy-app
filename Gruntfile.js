module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt)

  grunt.initConfig({
    clean: {
      dev: 'dev',
      dist: 'dist'
    },

    copy: {
      dist: {
        files: {
          'dist/index.html': 'app/index.html'
        }
      }
    },

    watch: {
      options: {
        livereload: 36000,
        spawn: false
      },

      scripts: {
        files: 'app/scripts/**/*.js',
        tasks: [ 'browserify:dev', 'replace:dev' ]
      },
      
      styles: {
        files: 'app/styles/**/*.styl',
        tasks: [ 'stylus:dev', 'postcss:dev' ]
      }
    },
    
    connect: {
      livereload: {
        options: {
          port: 9000,
          livereload: 36000,
          middleware: (connect, options, middlewares) => {
            middlewares.unshift(require('serve-static')('app'))
            middlewares.unshift(require('serve-static')('dev'))

            return middlewares
          }
        }
      }
    },

    replace: {
      options: {
        prefix: '@'
      },

      dev: {
        options: {
          variables: {
            API: 'http://localhost:8080'
          }
        },

        files: {
          'dev/code.js': 'dev/code.js'
        }
      },

      dist: {
        options: {
          variables: {
            API: 'http://employee-service.herokuapp.com'
          }
        },

        files: {
          'dist/code.js': 'dist/code.js'
        }
      }
    },

    stylus: {
      options: {
        compress: false
      },

      dev: {
        files: {
          'dev/style.css': 'app/styles/root.styl'
        }
      },

      dist: {
        files: {
          'dist/style.css': 'app/styles/root.styl'
        }
      }
    },

    postcss: {
      options: {
        processors: [
          require('autoprefixer')({ browsers: 'last 2 versions' })
        ]
      },

      dev: {
        src: 'dev/**/*.css'
      },

      dist: {
        src: 'dist/**/*.css'
      }
    },

    browserify: {
      options: {
        transform: [
          [ 'babelify' ]
        ],

        browserifyOptions: {
          debug: true
        }
      },

      dev: {
        files: {
          'dev/code.js': 'app/scripts/root.js'
        }
      },

      dist: {
        files: {
          'dist/code.js': 'app/scripts/root.js'
        }
      }
    }
  });
  
  grunt.registerTask('dev', [
    'clean:dev',
    'browserify:dev',
    'replace:dev',
    'stylus:dev',
    'postcss:dev',
    'connect:livereload',
    'watch'
  ]);
  
  grunt.registerTask('dist', [
    'clean:dist',
    'copy:dist',
    'browserify:dist',
    'replace:dist',
    'stylus:dist',
    'postcss:dist'
  ]);
};