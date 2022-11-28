(() => {
	"use strict";

	// #region Imports
	// NPM
	const async = require("async");
	const fs = require("fs");
	const gulp = require("gulp");
	const shell = require("shelljs");
	const path = require("path");
	const parseArgs = require("minimist");
	const treeKill = require("tree-kill");
	let FEA;
	// Internal Cosaic development: exports doesn't exist when running yarn clean

	try {
		FEA = require("@finsemble/finsemble-electron-adapter/exports");
	} catch (e) {
		console.error(`Error in require fea exports: ${e}`);
	}
	const FEA_PATH = path.resolve("./node_modules/@finsemble/finsemble-electron-adapter");
	const FEAPackager = FEA ? FEA.packager : undefined;
	const startupConfig = require("./public/configs/other/server-environment-startup");
	const { envOrArg, runWebpackAndCallback, logToTerminal, runWebpackInParallel } = require("./webpack/buildHelpers");
	const INSTALLER_CERT_PASS = "INSTALLER_CERTIFICATE_PASSPHRASE";

	// local
	const extensions = fs.existsSync("./gulpfile-extensions.js") ? require("./gulpfile-extensions.js") : undefined;
	const isMacOrNix = process.platform !== "win32";

	let angularComponents;
	try {
		angularComponents = require("./webpack/angular-components.json");
	} catch (ex) {
		angularComponents = null;
	}
	// If you specify environment variables to child_process, it overwrites all environment variables, including
	// PATH. So, copy based on our existing env variables.
	const { env } = process;

	// "environment" is used within this gulp file to reference environment configs. Default to development if not set
	// on the command line or the NODE_ENV variable
	let environment = envOrArg("environment") || env.NODE_ENV || "development";

	// webpack build processes require NODE_ENV to be set
	env.NODE_ENV = environment;

	if (!env.PORT) {
		env.PORT = startupConfig[environment].serverPort;
	}

	// This variable controls whether the build should watch files for changes. This `startsWith` catches all of the
	// tasks that are dev * (dev, dev: fresh, dev: nolaunch), but excludes build:dev because it is intended to only
	// build for a development environment and not watch for changes.
	const isRunningDevTask = process.argv[2].startsWith("dev");

	let launchTimestamp = 0;

	/**
	 * Returns an object containing the absolute paths of the socket certificate files used to secure Finsemble Transport
	 * If both a key and certificate path are not configured nothing is returned.
	 */
	const deriveSocketCertificatePaths = () => {
		const cfg = taskMethods.startupConfig[environment];
		let socketCertificatePath;
		if (cfg.socketCertificateKey && cfg.socketCertificateCert) {
			socketCertificatePath = {
				key: path.resolve(path.join(__dirname, cfg.socketCertificateKey)),
				cert: path.resolve(path.join(__dirname, cfg.socketCertificateCert)),
			};
		}
		return socketCertificatePath;
	};

	/**
	 * Object containing all of the methods used by the gulp tasks.
	 */
	const taskMethods = {
		/**
		 * Attach some variables to the taskMethods so that they are available to gulp-extensions.
		 */
		distPath: path.join(__dirname, "common"),
		srcPath: path.join(__dirname, "src"),
		startupConfig: startupConfig,

		/**
		 * Builds the application in the distribution directory. Internal only, don't use because no environment is set!!!!
		 */
		build: (done) => {
			async.series([taskMethods.buildWebpack, taskMethods.buildAngular], done);
		},
		buildAngular: (done) => {
			if (!angularComponents) return done();
			let processRow = (row) => {
				const compName = row.source.split("/").pop();
				const cwd = path.join(__dirname, row.source);
				const outputPath = path.join(__dirname, row.source, row["output-directory"]);
				const command = `ng build --base-href "/angular-components/${compName}/" --output-path "${outputPath}"`;

				// switch to components folder
				const dir = shell.pwd();
				shell.cd(cwd);
				logToTerminal(`Executing: ${command}\nin directory: ${cwd}`);

				const output = shell.exec(command);
				logToTerminal(`Built Angular Component, exit code = ${output.code}`, "green");
				shell.cd(dir);
			};

			if (angularComponents) {
				angularComponents.forEach((comp) => {
					processRow(comp);
				});
			} else {
				logToTerminal("No Angular components found to build", "yellow");
			}

			done();
		},
		"build:dev": (done) => {
			async.series([taskMethods.setDevEnvironment, taskMethods.build], done);
		},
		"build:prod": (done) => {
			async.series([taskMethods.setProdEnvironment, taskMethods.build], done);
		},
		/**
		 * Builds files using webpack.
		 */
		buildWebpack: (done) => {
			const watchFiles = isRunningDevTask;
			logToTerminal(`Starting webpack. Environment:"${environment}"`);
			// when we're running our dev tasks, we want to leave the parallel workers up,
			// working away. When we're building, we want those guys to tear themselves down
			// so the build doesn't hang indefinitely. If we aren't watching, exit the processes
			// after building.
			const exitOnCompletion = !watchFiles;
			async.series(
				[
					// Build the vendor bundle first, as other webpack instances will use it to speed
					// up their compilation time.
					(done) => {
						const configPath = require.resolve("./webpack/webpack.vendor.js");
						const bundleName = "Vendor";
						runWebpackAndCallback(configPath, watchFiles, bundleName, done);
					},
					(done) => {
						const webpackConfigs = [
							{
								configPath: require.resolve("./webpack/webpack.adapters"),
								prettyName: "Adapters",
								watch: watchFiles,
							},
							{
								configPath: require.resolve("./webpack/webpack.preloads.js"),
								prettyName: "Preloads",
								watch: watchFiles,
							},
							{
								configPath: require.resolve("./webpack/webpack.titleBar.js"),
								prettyName: "Titlebar",
								watch: watchFiles,
							},
							{
								configPath: require.resolve("./webpack/webpack.services.js"),
								prettyName: "Custom Services",
								watch: watchFiles,
							},
							{
								configPath: require.resolve("./webpack/webpack.components.js"),
								prettyName: "Components",
								watch: watchFiles,
							},
						];
						runWebpackInParallel(webpackConfigs, exitOnCompletion, done);
					},
				],
				done
			);
		},

		/**
		 * Cleans the project folder of generated files.
		 */
		clean: (done) => {
			shell.rm("-rf", path.join(__dirname, "webpack/vendor-manifest.json"));
			shell.rm("-rf", path.join(__dirname, ".webpack-file-cache"));
			shell.rm("-rf", path.join(__dirname, "installer-tmp"));
			shell.rm("-rf", path.join(__dirname, "public/build"));
			shell.rm("-rf", path.join(__dirname, "pkg"));
			done();
		},
		checkSymbolicLinks: (done) => {
			const FINSEMBLE_PATH = path.join(__dirname, "node_modules", "@finsemble", "finsemble-core");
			const FINSEMBLE_UI_PATH = path.join(__dirname, "node_modules", "@finsemble", "finsemble-ui");
			const FINSEMBLE_VERSION = require(path.join(FINSEMBLE_PATH, "package.json")).version;
			const FINSEMBLE_UI_VERSION = require(path.join(FINSEMBLE_UI_PATH, "package.json")).version;
			const CLI_PATH = path.join(__dirname, "node_modules", "@finsemble", "finsemble-cli");
			const CLI_VERSION = require(path.join(CLI_PATH, "package.json")).version;

			// Check version before require so optionalDependency can stay optional
			const FEA_VERSION = require(path.join(FEA_PATH, "package.json")).version;

			function checkLink(params, cb) {
				let { path, name, version } = params;
				if (fs.existsSync(path)) {
					fs.readlink(path, (err, str) => {
						if (str) {
							logToTerminal(`LINK DETECTED: ${name}. @Version ${version} Path: ${str}.`, "yellow");
						} else {
							logToTerminal(`Using: @finsemble/${name} @Version ${version}`, "magenta");
						}
						cb();
					});
				} else {
					logToTerminal(`MISSING FINSEMBLE DEPENDENCY!: ${name}.\nPath: ${path}`, "red");
					process.exit(1);
				}
			}
			async.parallel(
				[
					(cb) => {
						checkLink(
							{
								path: FINSEMBLE_PATH,
								name: "finsemble",
								version: FINSEMBLE_VERSION,
							},
							cb
						);
					},
					(cb) => {
						checkLink(
							{
								path: CLI_PATH,
								name: "finsemble-cli",
								version: CLI_VERSION,
							},
							cb
						);
					},
					(cb) => {
						checkLink(
							{
								path: FINSEMBLE_UI_PATH,
								name: "finsemble-ui",
								version: FINSEMBLE_UI_VERSION,
							},
							cb
						);
					},
					(cb) => {
						if (!FEA_VERSION) {
							// electron not found so skip check
							return cb();
						}

						checkLink(
							{
								path: FEA_PATH,
								name: "finsemble-electron-adapter",
								version: FEA_VERSION,
							},
							cb
						);
					},
				],
				done
			);
		},

		/**
		 * Builds the application, starts the server, launches the Finsemble application and watches for file changes.
		 */
		dev: (done) => {
			async.series([taskMethods["build:dev"], taskMethods.startServer, taskMethods.launchApplication], done);
		},
		/**
		 * Wipes the babel cache and webpack cache, clears dist, rebuilds the application, and starts the server.
		 */
		"dev:fresh": (done) => {
			async.series(
				[taskMethods.setDevEnvironment, taskMethods.rebuild, taskMethods.startServer, taskMethods.launchApplication],
				done
			);
		},
		/**
		 * Builds the application and runs the server *without* launching.
		 */
		"dev:noLaunch": (done) => {
			async.series([taskMethods["build:dev"], taskMethods.startServer], done);
		},
		/**
		 * Builds the application and then launches FEA in jumpstart mode. In the future
		 * the launching should be directly from the electron-adapter directory but that
		 * would currently be complex due to the need to catch webpack compile events from
		 * another process.
		 */
		jumpstart: (done) => {
			const startFEA = (doneFEA) => {
				const handleElectronClose = () => {
					if (isMacOrNix) treeKill(process.pid);
					else process.exit(0);
				};

				let installerConfig = require("./public/configs/other/installer.json");
				const name = (installerConfig && installerConfig.name) || "Finsemble";
				let config = {
					onElectronClose: handleElectronClose,
					args: ["--name", name, "--smartDesktopDevMode"],
				};

				// Use `yarn jumpstart --reset` to copy the seed over the current default project
				const args = parseArgs(process.argv);
				if (args["reset"]) config.args.push("--reset-default-project");
				if (args["update"]) config.args.push("--update-project-from-template");
				const envargs = taskMethods.startupConfig[environment]["args"];
				if (envargs) config.args = config.args.concat(envargs);

				FEA.e2oLauncher(config, doneFEA);
			};
			async.series([taskMethods.setDevEnvironment, taskMethods.build], startFEA, done);
		},
		launchElectron: (done) => {
			const cfg = taskMethods.startupConfig[environment];
			let installerConfig = require("./public/configs/other/installer.json");
			const name = (installerConfig && installerConfig.name) || "Finsemble";

			/**
			 * handleElectronClose() gets called when Electron is closed, in other words when the user quits Finsemble from the file menu or some other way.
			 * When Electron is closed, we will want to terminate this gulp process, and also make certain that any other child
			 * processes that we've spun up are closed (such as server.js or watch processes).
			 *
			 * On Unix (Mac) child processes are not automatically killed when the current process exits, so we use "treeKill"
			 * to ensure that all child processes are killed off. Otherwise, those processes would show up as stray "node" processes in ActivityMonitor/ps
			 * and eventually eat up memory.
			 *
			 * treeKill makes use of shell commands (taskkill and pgrep) because Node doesn't currently support the concept of process groups.
			 * The result is that this gulp process will terminate with an error that _isn't really_ an error, which yarn/npm will pick up and print out "Command failed with exit code 1".
			 * Orchestrating a graceful exit to avoid that error would involve rearchitecting the entire gulp process or forking treeKill, so on Unix/Mac we allow the spurious error.
			 */
			const handleElectronClose = () => {
				if (isMacOrNix) treeKill(process.pid);
				else process.exit(0);
			};

			const socketCertificatePath = deriveSocketCertificatePaths();
			let config = {
				manifest: cfg.serverConfig,
				onElectronClose: handleElectronClose,
				chromiumFlags: JSON.stringify(cfg.chromiumFlags),
				socketCertificatePath,
				breakpointOnStart: cfg.breakpointOnStart,
			};

			// Copy any command line args from server-environment-startup.json
			config.args = taskMethods.startupConfig[environment]["args"];
			config.args = ["--name", name].concat(config.args);

			if (!FEA) {
				console.error("Could not launch ");
				process.exit(1);
			}

			return FEA.e2oLauncher(config, done);
		},
		makeInstaller: async (done) => {
			function resolveRelativePaths(obj, properties, rootPath) {
				properties.forEach((prop) => {
					if (obj[prop]) {
						obj[prop] = path.resolve(rootPath, obj[prop]);
					} else {
						console.warn(
							`Path for property '${prop}' was not resolved as it did not exist in the installer configuration.\nInstaller configuration: ${JSON.stringify(
								obj,
								null,
								2
							)}`
						);
					}
				});
				return obj;
			}

			// This method adds the required sign and notarization objects
			function maybeAddOSXNotarizationConfigs(installerConfig) {
				// Skip if we're not on OSX or don't have the required configs
				if (
					process.platform !== "darwin" ||
					((!installerConfig.osxSign || !process.env.osxSign) &&
						(!installerConfig.osxNotarize || !process.env.osxNotarize))
				) {
					return installerConfig;
				}

				const { osxSign, osxNotarize } = installerConfig;
				const entitlementsFile =
					process.env.osxSignEntitlementsFile ||
					path.resolve("./", osxSign.entitlementsFile) ||
					path.resolve("./", "./public/configs/other/entitlements.plist");

				return {
					...installerConfig,
					osxSign: {
						identity: process.env.osxSignIdentity || osxSign.identity,
						entitlementsFile,
					},
					osxNotarize: {
						appleId: process.env.osxNotarizeAppleId || osxNotarize.appleId,
						appleIdPassword: process.env.osxNotarizationApplePassword || osxNotarize.appleIdPassword,
					},
				};
			}

			// Inline require because this file is so large, it reduces the amount of scrolling the user has to do.
			let installerConfig = require("./public/configs/other/installer.json");
			let seedpackagejson = require("./package.json");
			// Command line overrides

			installerConfig.name = process.env.installername || installerConfig.name;
			installerConfig.version = process.env.installerversion || installerConfig.version || seedpackagejson.version;
			installerConfig.authors = process.env.installerauthors || installerConfig.authors;
			installerConfig.description = process.env.installerdescription || installerConfig.description;

			//check if we have an installer config matching the environment name, if not assume we just have a single config for all environments
			if (installerConfig[environment]) {
				installerConfig = installerConfig[environment];
			}

			if (installerConfig.certificateFile && !installerConfig.certificatePassword) {
				const certPassphraseFromEnv = process.env[INSTALLER_CERT_PASS];

				//If a certificate file is provided and a plain text password is not, look for environment variable
				if (certPassphraseFromEnv) {
					installerConfig.certificatePassword = certPassphraseFromEnv.trim();
				} else {
					// If a certificate file was provided and a password can't be found, show error and exit
					throw new Error(
						`A certificate file was provided but a password cannot be found. Please provide one in the config or as an environment variable: INSTALLER_CERTIFICATE_PASSPHRASE`
					);
				}
			}

			// need absolute paths for certain installer configs
			installerConfig = resolveRelativePaths(installerConfig, ["icon", "macIcon", "background"], "./");

			installerConfig = maybeAddOSXNotarizationConfigs(installerConfig);

			const manifestUrl = process.env.manifesturl || taskMethods.startupConfig[environment].serverConfig;
			console.log("The manifest location is: ", manifestUrl);
			let { updateUrl } = taskMethods.startupConfig[environment];
			const { chromiumFlags } = taskMethods.startupConfig[environment];

			// Installer won't work without a proper manifest. Throw a helpful error.
			if (!manifestUrl) {
				throw new Error(
					`Installer misconfigured. No property in 'serverConfig' in configs/other/server-environment-startup.json under ${environment}. This is required in order to generate the proper config.`
				);
			}

			// If an installer is pointing to localhost, it's likely an error. Let the dev know with a helpful error.
			if (manifestUrl.includes("localhost")) {
				logToTerminal(
					`>>>> WARNING: Installer is pointing to a manifest hosted at ${manifestUrl}. Was this accidental?
				environment (e.g. NODE_ENV) == ${environment}`,
					"yellow"
				);
			}

			// UpdateURL isn't required, but we let them know in case they're expecting it to work.
			if (!updateUrl) {
				logToTerminal(
					`[Info] Did not find 'updateUrl' in configs/other/server-environment-startup.json under ${environment}. The application will still work, but it will not update itself with new versions of the finsemble-electron-adapter.`,
					"white"
				);
				updateUrl = null;
			}

			if (!FEAPackager) {
				console.error("Cannot create installer because Finsemble Electron Adapter is not installed");
				process.exit(1);
			}
			const socketCertificatePath = deriveSocketCertificatePaths();

			FEAPackager.setFeaPath(FEA_PATH);
			await FEAPackager.setApplicationFolderName(installerConfig.name);
			await FEAPackager.setManifestURL(manifestUrl);
			await FEAPackager.setUpdateURL(updateUrl);
			await FEAPackager.setChromiumFlags(chromiumFlags || {});
			await FEAPackager.copySocketCertificates(socketCertificatePath);
			await FEAPackager.createFullInstaller(installerConfig);
			done();
		},
		launchApplication: (done) => {
			logToTerminal("Launching Finsemble", "black", "bgCyan");

			launchTimestamp = Date.now();
			taskMethods.launchElectron(done);
		},
		logToTerminal: (...args) => logToTerminal.apply(this, args),
		envOrArg: (...args) => envOrArg.apply(this, args),
		/**
		 * Starts the server, launches the Finsemble application. Use this for a quick launch, for instance when working on finsemble-electron-adapter.
		 */
		"nobuild:dev": (done) => {
			async.series([taskMethods.setDevEnvironment, taskMethods.startServer, taskMethods.launchApplication], done);
		},

		/**
		 * Method called after tasks are defined.
		 * @param done Callback function used to signal function completion to support asynchronous execution. Can
		 * optionally return an error, if one occurs.
		 */
		post: (done) => {
			done();
		},

		/**
		 * Method called before tasks are defined.
		 * @param done Callback function used to signal function completion to support asynchronous execution. Can
		 * optionally return an error, if one occurs.
		 */
		pre: (done) => {
			// taskMethods.checkSymbolicLinks();
			done();
		},
		launch: (done) => {
			async.series([taskMethods.launchApplication], done);
		},
		/**
		 * Builds the application, starts the server and launches the application. Use this to test production mode on your local machine.
		 */
		prod: (done) => {
			async.series([taskMethods["build:prod"], taskMethods.startServer, taskMethods.launchApplication], done);
		},
		/**
		 * Builds the application in production mode and starts the server without launching the application.
		 */
		"prod:nolaunch": (done) => {
			async.series([taskMethods["build:prod"], taskMethods.startServer], done);
		},
		rebuild: (done) => {
			async.series([taskMethods.clean, taskMethods.build], done);
		},
		/**
		 * Launches the server in dev environment. No build, no application launch.
		 */
		server: (done) => {
			async.series([taskMethods.setDevEnvironment, taskMethods.startServer], done);
		},
		/**
		 * Launches the server in prod environment. No build, no application launch.
		 */
		"server:prod": (done) => {
			async.series([taskMethods.setProdEnvironment, taskMethods.startServer], done);
		},
		startServer: async (done) => {
			// @deprecated server-extensions are deprecated and will be removed in a future version
			const extensions = fs.existsSync(path.join(__dirname, "server-extensions.js"))
				? require("./server-extensions")
				: {
						pre: (done) => done(),
						post: (done) => done(),
						updateServer: (app, cb) => cb(),
				  };

			const root = path.join(__dirname, "public");
			const port = process.env.PORT ? parseInt(process.env.PORT) : 3375;
			logToTerminal(`Serving files from directory ${root}`, "white");
			extensions.pre(async (err) => {
				if (err) {
					console.error(err);
					return;
				}
				const { server, app } = await FEA.Server.start({ root, port });
				extensions.updateServer(app, (err) => {
					logToTerminal(`Listening on port ${port}`, "white");
					server.on("error", (err) => {
						console.error(err.message);
					});
					extensions.post((err) => {
						if (err) {
							console.error(err);
						}
						if (done) done();
					});
				});
			});
		},

		setDevEnvironment: (done) => {
			process.env.NODE_ENV = environment = "development";
			done();
		},

		setProdEnvironment: (done) => {
			process.env.NODE_ENV = environment = "production";
			done();
		},
	};
	// #endregion

	// Update task methods with extensions
	if (extensions) {
		extensions(taskMethods);
	}

	// #region Task definitions
	const defineTasks = (err) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}

		// Convert every taskMethod into a gulp task that can be run
		for (var taskName in taskMethods) {
			var task = taskMethods[taskName];
			if (typeof task === "function") gulp.task(taskName, taskMethods[taskName]);
		}

		// By default run dev
		gulp.task("default", taskMethods["dev"]);

		taskMethods.post((err) => {
			if (err) {
				console.error(err);
				process.exit(1);
			}
		});
	};
	// #endregion

	// Run anything that we need to do before the gulp task is run
	taskMethods.pre(defineTasks);
})();
