"use strict";

var co = require('co'),
	wait = require('../lib'),
	timeout = wait.timeout;

require('chai').should();

describe('wait', function() {

	it('should return an instance of Promise', function() {
		(wait(1) instanceof Promise).should.be.true;
		(wait(1).then instanceof Function).should.be.true;
	});

	it('should resolve after the given time', function(done) {
		var t = 100,
			now = Date.now();

		wait(t).then(function() {
			try {
				(Date.now() - now).should.be.at.least(t).and.at.most(t * 1.1); // 10% margin
				done();
			} catch (e) { // because the error is thrown in the context of setTimeout and cannot be caught by 'it' otherwise
				done(e);
			}
		});
	});

	it('should work with co', function(done) {
		co(function *() {
			var t = 200,
				now = Date.now();

			try {
				yield wait(t);
				(Date.now() - now).should.be.at.least(t).and.at.most(t * 1.1); // 10% margin
				done();
			} catch (e) { // because the error is thrown in the context of setTimeout and cannot be caught by 'it' otherwise
				done(e);
			}
		});
	});

});


describe('timeout', function() {

	it('should return an instance of Promise', function() {
		(timeout(1) instanceof Promise).should.be.true;
		(timeout(1).then instanceof Function).should.be.true;
	});

	it('should reject after the given time', function(done) {
		var t = 100,
			now = Date.now();

		timeout(t)
			.then(function() {
				done(new Error('resolved instead of rejecting'));
			})
			.catch(function(e) {
				(Date.now() - now).should.be.at.least(t).and.at.most(t * 1.1); // 10% margin
				e.message.should.equal('TIMED OUT');
				done();
			});
	});

	it('should work with co', function(done) {
		co(function *() {
			var t = 200,
				now = Date.now();

			try {
				yield timeout(t);
				done(new Error('resolved instead of rejecting'));
			} catch (e) { // because the error is thrown in the context of setTimeout and cannot be caught by 'it' otherwise
				(Date.now() - now).should.be.at.least(t).and.at.most(t * 1.1); // 10% margin
				e.message.should.equal('TIMED OUT');
				done();
			}
		});
	});

});