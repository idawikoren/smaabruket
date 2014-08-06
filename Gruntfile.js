module.exports = function(grunt)
{
	// js-files to use
	// we store an array here because it is used by both 'concat' and 'watch'
	var js_files = [
		// libraries we use
		"./assets/bower_components/jquery/dist/jquery.min.js",
		//"./assets/bower_components/handlebars/handlebars.js",
		//"./assets/bower_components/underscore/underscore.js",
		//"./assets/bower_components/backbone/backbone.js",
		"./assets/bower_components/modernizr/modernizr.js",
		"./assets/bower_components/foundation/js/foundation.js",
		//"./assets/bower_components/foundation/js/foundation/foundation.reveal.js",
		//"./assets/bower_components/foundation/js/foundation/foundation.abide.js",
		//"./assets/bower_components/typeahead.js/dist/typeahead.bundle.js",
		//"./assets/bower_components/moment/min/moment-with-langs.js",

		// our own files
		
	];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// 'concat' merges javascript-files to one file
		concat: {
			options: {
				separator: ";\n",
				sourceMap: true
			},
			dist: {
				src: js_files,
				dest: "public/smaabruket.js"
			}
		},

		// 'uglify' makes a minified verson of our js-file
		//
		// 'concat' must be run before
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'public/smaabruket.min.js': 'public/smaabruket.js'
				}
			}
		},

		// 'sass' generates css from scss-files
		sass: {
			dev: {
				options: {
					style: 'expanded'
				},
				files: {
					"public/smaabruket.css": "assets/scss/smaabruket.scss"
				}
			},
			dist: {
				options: {
					style: 'compressed'
				},
				files: {
					"public/smaabruket.css": "assets/scss/smaabruket.scss"
				}
			}
		},

		// 'watch' runs 'concat', 'uglify' and 'sass' on changes
		watch: {
			js: {
				files: js_files,
				tasks: [
					'concat'//,
					//'uglify'
				]
			},
			sass: {
				files: './assets/scss/**/*.scss',
				tasks: ["sass:dev"]
			}
		}
	});

	// load plugins
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	// default task (run with 'grunt')
	grunt.registerTask('default', [
		'sass:dev',
		'concat',
		//'uglify',
		'watch'
	]);
};
