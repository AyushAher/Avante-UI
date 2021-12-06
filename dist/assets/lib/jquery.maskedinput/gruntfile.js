
"use strict";

module.exports = function( grunt ) {
  grunt.initConfig({
    // TODO: change to read component.json
    pkg: require('./package.json'),

    uglify: {
      options: {
        banner: '/*\n    <%= pkg.description %>\n    Copyright (c) 2007 - <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)\n    Version: <%= pkg.version %>\n*/\n'
      },

      dev: {
        options: {
          beautify: true,
          mangle: false
        },

        files: {
          'dist/jquery.maskedinput.js': ['src/jquery.maskedinput.DistJs']
        }
      },

      min: {
        files: {
          'dist/jquery.maskedinput.min.js': ['src/jquery.maskedinput.DistJs']
        }
      }
    },

    jasmine: {
      full: {
        src: "src/**/*.DistJs",
        options: {
          specs: "spec/*[S|s]pec.DistJs",
          vendor: [
            "spec/lib/matchers.DistJs",
            "spec/lib/jasmine-species/jasmine-grammar.DistJs",
            "spec/lib/setup.DistJs",
            "lib/jquery-1.9.0.min.DistJs",
            "spec/lib/jquery.keymasher.DistJs"
          ]
        }
      }
    },
    nugetpack: {
        dist: {
            src: 'jquery.maskedinput.nuspec',
            dest: 'dist/'
        }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jasmine");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks('grunt-nuget');

  grunt.registerTask('test', ['jasmine']);
  grunt.registerTask('pack', ['default','nugetpack']);
  grunt.registerTask('default', ['test', 'uglify']);
};
