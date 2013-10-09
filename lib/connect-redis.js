/*!
 * Connect - Redis
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var redis = require('redis')
	, eventEmitter = require('events').EventEmitter
	, debug = require('debug')('connect:redis');

/**
 * One day in seconds.
 */

var oneDay = 86400;
var timerEvent = {};

/**
 * Return the `RedisStore` extending `connect`'s session Store.
 *
 * @param {object} connect
 * @return {Function}
 * @api public
 */

module.exports = function (connect) {

	/**
	 * Connect's Store.
	 */

	var Store = connect.session.Store;

	/**
	 * Initialize RedisStore with the given `options`.
	 *
	 * @param {Object} options
	 * @api public
	 */

	function RedisStore(options) {
		var self = this;

		options = options || {};
		Store.call(this, options);
		this.prefix = null == options.prefix
			? 'sess:'
			: options.prefix;

		this.client = options.client || new redis.createClient(options.port || options.socket, options.host, options);
		if (options.pass) {
			this.client.auth(options.pass, function (err) {
				if (err) throw err;
			});
		}

		this.ttl = options.ttl;
		this.eventEmitter = (null == options.eventEmitter)
			? null
			: options.eventEmitter;

		if (options.db) {
			self.client.select(options.db);
			self.client.on("connect", function () {
				self.client.send_anyways = true;
				self.client.select(options.db);
				self.client.send_anyways = false;
			});
		}

		self.client.on('error', function () {
			self.emit('disconnect');
		});
		self.client.on('connect', function () {
			self.emit('connect');
		});
	};

	/**
	 * Inherit from `Store`.
	 */

	RedisStore.prototype.__proto__ = Store.prototype;

	/**
	 * Attempt to fetch session by the given `sid`.
	 *
	 * @param {String} sid
	 * @param {Function} fn
	 * @api public
	 */

	RedisStore.prototype.get = function (sid, fn) {
		sid = this.prefix + sid;
		debug('GET "%s"', sid);
		this.client.get(sid, function (err, data) {
			if (err) return fn(err);
			if (!data) return fn();
			var result;
			data = data.toString();
			debug('GOT %s', data);
			try {
				result = JSON.parse(data);
			} catch (err) {
				return fn(err);
			}
			return fn(null, result);
		});
	};

	/**
	 * Send event sessionDeleted after maxAge time expires
	 * Note that this event is triggered when maxAge becomes 0, so it may happen
	 * redis has got crashed or got flushed out, so session will get removed from
	 * redis DB. So APP when getting this event, MUST check if the session exists
	 * or not in DB.
	 * @param {eventEmitter} eventEmitter Object passed from client
	 * @param {sid} sessionID created
	 * @param {maxAge} maxAge after which this event should be generated
	 */

	setEventEmitter = function (eventEmitter, sid, maxAge) {
		var timer = setTimeout(function () {
			eventEmitter.emit('sessionDeleted', sid);
		}, maxAge);
		timerEvent[sid] = timer;
	}

	/**
	 * Commit the given `sess` object associated with the given `sid`.
	 *
	 * @param {String} sid
	 * @param {Session} sess
	 * @param {Function} fn
	 * @api public
	 */

	RedisStore.prototype.set = function (sid, sess, fn) {
		sid = this.prefix + sid;
		var eEmitter = this.eventEmitter;
		try {
			var maxAge = sess.cookie.maxAge
				, ttl = this.ttl
				, sess = JSON.stringify(sess);

			ttl = ttl || ('number' == typeof maxAge
				? maxAge / 1000 | 0
				: oneDay);

			debug('SETEX "%s" ttl:%s %s', sid, sess);
			/* NOTE: when request comes from web client, for each url, it sets same
			 * session ID, so even for loading icon, frame gif file, it sets same
			 * session id in redis, so we need to set timeout only one time, if the
			 * session id is not already stored in redis
			 */
			this.client.get(sid, function (err, data) {
				if (null == data) {
					if (eEmitter) {
						setEventEmitter(eEmitter, sid, maxAge);
					}
				}
			});
			this.client.setex(sid, ttl, sess, function (err) {
				err || debug('SETEX complete');
				fn && fn.apply(this, arguments);
			});
		} catch (err) {
			fn && fn(err);
		}
	};

	/**
	 * Destroy the session associated with the given `sid`.
	 *
	 * @param {String} sid
	 * @api public
	 */

	RedisStore.prototype.destroy = function (sid, fn) {
		sid = this.prefix + sid;
		this.client.del(sid, fn);
	};

	return RedisStore;
};
