module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    simplemocha: {
      options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: false,
          grep: '*-test',
          ui: 'bdd',
          reporter: 'tap'
      },
      all: ['test/**/*.js']
    },
    jshint: {
     // files: ['gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      files: ['gruntfile.js', 'src/**/*.js', '!src/webServer/public/lib/**/*'],
      options: {
        // options here to override JSHint defaults
        curly: true,
        undef: true,
        node: true,
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true,
          global: true,
          logger: true,
          wpilog: true,
          stats: true,
          deviceState: true,
          // Ember globals
          Ember: true,
          DS: true,
          App: true,
          // lib globals
          moment: true,
          Showdown: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);

};
