"use strict";

module.exports = function(ms) {
	return new Promise(function(resolve) {
		setTimeout(function() {
			resolve();
		}, ms);
	});
};

module.exports.timeout = function(ms) {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			reject(new Error('TIMED OUT'));
		}, ms);
	});
};