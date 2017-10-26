var gulp = require('gulp-4.0.build');
var path = require("path");
var gulpWebpack = require('webpack-stream-fixed');
var webpack = require("webpack");
var watch = require("gulp-watch");
var del = require('del');
var sass = require('gulp-sass');
var openfinLauncher = require('openfin-launcher');
var configPath = path.join(__dirname, '/configs/finConfig.json');
//new
var StartupConfig = require("./configs/other/server-environment-startup");
var chalk = require('chalk');
chalk.enabled = true;
var serverOutColor = chalk.yellow;
var errorOutColor = chalk.red;
var webpackOutColor = chalk.cyan;
var initialBuildFinished = false;

function copyStaticComponentsFiles() {
	return gulp.src([
		path.join(__dirname, '/src/components/**/*'),
		path.join('!' + __dirname, '/src/components/**/*.js*')
	])
		.pipe(gulp.dest(path.join(__dirname, '/dist/components/')));
}

function copyStaticFiles() {
	gulp.src([path.join(__dirname, '/configs/**/*')])
		.pipe(gulp.dest(path.join(__dirname, '/dist/configs/')));
	return gulp.src([path.join(__dirname, '/src/services/**/*.html'),
	//ignores the js files in service, but copies over the html files.
	path.join('!' + __dirname, '/src/services/**/*.js')])
		.pipe(gulp.dest(path.join(__dirname, '/dist/services')));
}

function wipeDist(done) {
	var dir = path.join(__dirname, '/dist/');
	console.log('dir', dir);
	wipe(dir, done);
}


function wipe(dir, cb) {
	del(dir, { force: true }).then(function () {
		if (cb) {
			cb();
		}
	}).catch(function (err) {
		console.error(err);
	});
}

function buildSass(done) {
	done();
	return gulp.src([
		path.join(__dirname, '/src/components/**/**/*.scss'),
		//compiles sass down to finsemble.css
		path.join(__dirname, '/src/components/assets/*.scss')
	])
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(path.join(__dirname, '/dist/components/')));
}

function watchSass(done) {
	watch(path.join(__dirname, '/src/components/assets/**/*'), {}, gulp.series(buildSass));
	done();
}

function wipedist(done) {
	if (directoryExists(path.join(__dirname, "/dist/"))) {
		wipe(path.join(__dirname, '/dist/'), done);
	} else {
		done();
	}

}

function handleWebpackStdOut(data, done) {
	let notAnError = !data.includes('build failed');
	if (notAnError) {
		console.log(webpackOutColor(data));
	}

	if (data.includes('webpack is watching')) {

		if (initialBuildFinished && notAnError) {
			// buildComplete();
		} else if (!initialBuildFinished) {
			done();
		}
	}
}

function webpackComponents(done) {
	const exec = require('child_process').exec;
	const instance = exec('node ./build/child_processes/componentBuildProcess.js');
	instance.stdout.on('data', function (data) {
		handleWebpackStdOut(data, done);
		var filesToBuild = require('./build/webpack/webpack.files.entries.json');
		if (Object.keys(filesToBuild).length === 0) {
			done();
		}
	});
}

function launchOpenfin(env) {
	return openfinLauncher.launchOpenFin({
		//new
		configPath: StartupConfig[env].serverConfig
	});
};

gulp.task('wipeDist', gulp.series(wipeDist));

gulp.task('copy', gulp.series(
	copyStaticFiles,
	copyStaticComponentsFiles
));

gulp.task('wp', gulp.series(webpackComponents))
gulp.task('build', gulp.series(
	'wipeDist',
	'copy',
	// webpackClients,
	// webpackServices,
	webpackComponents,
	// webpackReactComponents,
	buildSass
));

gulp.task('devServer', gulp.series(
	'wipeDist',
	'copy',
	buildSass,
	watchSass,
	function (done) {
		initialBuildFinished = true;
		var exec = require('child_process').spawn;
		//This runs essentially runs 'PORT=80 node server/server.js'
		var serverPath = path.join(__dirname, '/server/server.js');
		//allows for spaces in paths.
		var serverExec = exec('node', ['--debug', serverPath, { stdio: 'inherit' }], { env: { 'PORT': StartupConfig["dev"].serverPort, NODE_ENV: "dev" }, stdio: [process.stdin, process.stdout, 'pipe', "ipc"] });

		serverExec.on("message", function (data) {
			if (data === "serverStarted") {
				launchOpenfin("dev");
				done();
			}
		});
		serverExec.on('exit', code => console.log('final exit code is', code));
		//Prints server errors to your terminal.
		serverExec.stderr.on("data", function (data) {
			console.log(errorOutColor('ERROR:' + data));
		});
	})
);
gulp.task('default', gulp.series('devServer'));
