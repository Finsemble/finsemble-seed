/**
 * This file is a copy of the default localStorage adapter, the default storage model used by finsemble-seed.
 * It's provided as an example. Feel free to modify, add to, or erase parts of it.
 *
 * Core Finsemble calls are written with key-value pair databases in mind. If you want to use a different database type, you will need to translate the key/value pairs passed in from finsemble so that you can successfully retrieve them at a later time.
 */

/**
 * We have a baseStorage model that provides some methods, such as `getCombinedKey`, which will return a nice key to save our value under. Example: `Finsemble:defaultUser:finsemble:activeWorkspace`. That key would hold the value of our activeWorkspace.
 */
var BaseStorage = require("@chartiq/finsemble").models.baseStorage;
var Logger = require("@chartiq/finsemble").Clients.Logger;
//Because calls to this storage adapter will likely come from many different windows, we will log successes and failures in the central logger.
Logger.start();

var LocalStorage2 = function (uuid) {
	BaseStorage.call(this, arguments);
	FSBL.Clients.StorageClient.save({ topic: "finsemble", key: "chatWindows", value: chatWindows }, function (err, response) { Logger.system.log("save....", err, response); });
	/**
	 * Save method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {any} params.value The value being saved.
	 * @param {function} cb callback to be invoked upon save completion
	 */
	this.save = function (params, cb) {
		Logger.system.debug("savingggg", params);
		var combinedKey = this.getCombinedKey(this, params);
		try {
			localStorage.setItem(combinedKey, JSON.stringify(params.value));
		} catch (err) {
			Logger.system.error("Storage.saving Error", err, "key=" + combinedKey, "value=", params.value);
		}
		Logger.system.debug("Storage.save for key=" + combinedKey + " with data=" + params.value);
		return cb(null, { status: "success" });
	};

	/**
	 * Get method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {function} cb callback to be invoked upon completion
	 */
	this.get = function (params, cb) {
		var combinedKey = this.getCombinedKey(this, params);
		try {
			var data = JSON.parse(localStorage.getItem(combinedKey));
		} catch (err) {
			Logger.system.error("Storage.getItem Error", err, "key=" + combinedKey);
		}
		Logger.system.debug("Storage.getItem for key=" + combinedKey + " with data=" + data);
		return cb(null, data);
	};

	/**
	 * Get method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being deleted.
	 * @param {function} cb callback to be invoked upon completion
	 */
	this.delete = function (params, cb) {
		var combinedKey = this.getCombinedKey(this, params);
		localStorage.removeItem(combinedKey);
		Logger.system.debug("Storage.delete for key=" + combinedKey);
		return cb(null, { status: "success" });
	};

	/**
	 * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a particular user.
	 */
	this.clearCache = function (params, cb) {
		console.log("clear local cache");
		var arr = []; // Array to hold the keys
		// Iterate over localStorage and insert data related to the user into an array.
		for (var i = 0; i < localStorage.length; i++) {
			console.log("localStorage.key(i):::", localStorage.key(i).substring(0, (this.baseName + ":" + this.userName).length));
			if (localStorage.key(i).substring(0, (this.baseName + ":" + this.userName).length) === this.baseName + ":" + this.userName) {
				arr.push(localStorage.key(i));
			}
		}

		// Iterate over arr and remove the items by key
		for (var i = 0; i < arr.length; i++) {
			console.log("remove Iem", arr[i]);
			localStorage.removeItem(arr[i]);
		}
		return cb();
	};

	/**
	 * Wipes the storage container.
	 * @param {function} cb
	 */
	this.empty = function (cb) {
		localStorage.clear();
		Logger.system.debug("Storage.empty");
		return cb(null, { status: "success" });
	};

};


LocalStorage2.prototype = new BaseStorage();
new LocalStorage2("LocalStorage2");
module.exports = LocalStorage2;//Allows us to get access to the unintialized object