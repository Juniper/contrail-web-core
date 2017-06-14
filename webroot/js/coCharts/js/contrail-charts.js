(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require(undefined), require(undefined), require(undefined), require(undefined));
	else if(typeof define === 'function' && define.amd)
		define(["d3v4", "lodashv4", "backbone", "jquery"], factory);
	else if(typeof exports === 'object')
		exports["coCharts"] = factory(require(undefined), require(undefined), require(undefined), require(undefined));
	else
		root["coCharts"] = factory(root["d3"], root["_"], root["Backbone"], root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_28__, __WEBPACK_EXTERNAL_MODULE_51__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 220);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsEvents = __webpack_require__(159);

var _contrailChartsEvents2 = _interopRequireDefault(_contrailChartsEvents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Action Manager - Singleton
 */
var Actionman = function () {
  function Actionman() {
    _classCallCheck(this, Actionman);

    this._instances = {};
  }

  _createClass(Actionman, [{
    key: 'get',
    value: function get(id) {
      return this._instances[id];
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      return this._instances;
    }
  }, {
    key: 'getActive',
    value: function getActive() {
      return _lodash2.default.filter(this._instances, function (action) {
        return action.isEnabled();
      });
    }
    /**
     * @param {Action} Action class to be instantiated
     * @return {Action} found or instantiated action
     */

  }, {
    key: 'set',
    value: function set(Action, registrar) {
      var action = new Action({ registrar: registrar });
      if (this._instances[Action.name] === action) return;

      this._instances[Action.name] = action;
      this.trigger('add', action);
      return action;
    }
    /**
     * unset Action from a registrar
     * @param Action
     * @param registrar
     */

  }, {
    key: 'unset',
    value: function unset(Action, registrar) {
      if (this._instances[Action.name]) {
        this._instances[Action.name].unRegister(registrar);
      }
    }
    /**
     * Updates all actions state
     */

  }, {
    key: 'update',
    value: function update(selection) {
      _lodash2.default.values(this._instances).forEach(function (action) {
        action.evaluate(selection);
      });
    }
    /**
    * Fire an action based on its id
    * @param actionName String The id of the action
    */

  }, {
    key: 'fire',
    value: function fire(actionName) {
      var action = this._instances[actionName];

      if (!_lodash2.default.isNil(action)) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        action.apply.apply(action, args);
      }
    }
  }]);

  return Actionman;
}();
// TODO replace with class extends syntax


_lodash2.default.extend(Actionman.prototype, _contrailChartsEvents2.default);
var actionman = new Actionman();
exports.default = actionman;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _contrailView = __webpack_require__(164);

var _contrailView2 = _interopRequireDefault(_contrailView);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * View base class
 */
var ContrailChartsView = function (_ContrailView) {
  _inherits(ContrailChartsView, _ContrailView);

  function ContrailChartsView() {
    var p = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ContrailChartsView);

    var _this = _possibleConstructorReturn(this, (ContrailChartsView.__proto__ || Object.getPrototypeOf(ContrailChartsView)).call(this, p));

    _this._id = p.id;
    _this.d3.attr('id', _this.id);
    _this.config = p.config;
    _this._order = p.order;
    _this._container = p.container;
    _this.params = {};
    return _this;
  }

  _createClass(ContrailChartsView, [{
    key: 'resetParams',

    /**
     * Save the config '_computed' parameters in the view's 'params' local object for easier reference (this.params instead of this.config._computed).
     * The view may modify the params object with calculated values.
     */
    value: function resetParams(params) {
      if (params) this.config.set(params);
      this.params = this.config.computeParams();
    }
    /**
     * Appends components element to container in the order specified in this._order
     *
     * Components which renders vector graphics should call super.render() firsthand
     * in order to initialize shared svg container if missing and append this.el to it
     * Thus this.element will be ready to animate other entering elements
     *
     * Components rendering html should call super.render() at the end to increase performance by less browser redraw
     * @param {String} content to insert into element's html
     */

  }, {
    key: 'render',
    value: function render(content) {
      if (this.isTagNameSvg(this.tagName)) {
        this._initSvg();
        if (this.svg.select('#' + this.id).empty()) {
          this.el.setAttribute('data-order', this.zIndex);
          this.svg.node().append(this.el);
          // TODO constrain selector to direct descendants ":scope > g"
          this.svg.selectAll('g[data-order]').datum(function () {
            return this.getAttribute('data-order');
          }).sort().datum(null);
        }
      } else {
        // non vector components
        if (content) this.el.innerHTML = content;
        this._insertSorted(this.el);
      }
    }
  }, {
    key: 'show',
    value: function show(container) {
      if (this._container !== container) {
        this._container = container;
        this.render();
      }
      this.d3.classed('hide', false);
      this._visible = true;
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.d3.classed('hide', true);
      this._visible = false;
    }
    /**
     * Stop listening to config and model. Remove the view from the dom.
     */

  }, {
    key: 'remove',
    value: function remove() {
      if (this.config) this.stopListening(this.config);
      if (this.model) this.stopListening(this.model);
      this.params = {};
      _get(ContrailChartsView.prototype.__proto__ || Object.getPrototypeOf(ContrailChartsView.prototype), 'remove', this).call(this);
    }
    /**
     * First component which uses shared svg container appends svg element to container
     * There is a div wrapper over svg to workaround FF bug, when svg data-order attribute is not set
     */

  }, {
    key: '_initSvg',
    value: function _initSvg() {
      var isSharedContainer = this.config.get('isSharedContainer');
      if (this.svg.empty()) {
        var wrapper = document.createElement('div');
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        wrapper.appendChild(svg);
        svg.classList.add(this.selectorClass('svg'));
        if (isSharedContainer) {
          svg.classList.add(this.selectorClass('sharedSvg'));
        } else {
          // create wrapper for this component only
          wrapper.setAttribute('id', this.id + '-svg-wrapper');
        }
        wrapper.classList.add(this.selectorClass('svgWrapper'));
        this._insertSorted(wrapper);
      }
      var wrapperPosition = this.svg.node().parentNode.dataset.order;
      if (this.params.isPrimary && wrapperPosition !== this.config.get('order')) {
        var _wrapper = this.svg.node().parentNode;
        _wrapper.remove(); // detach
        this._insertSorted(_wrapper);
      }
      this.svg.classed(this.selectorClass('sharedSvg'), isSharedContainer).attr('width', this.params.width || this.svg.attr('width')).attr('height', this.params.height || this.svg.attr('height'));
    }
    /**
     * insert own element into the DOM in the right order
     */

  }, {
    key: '_insertSorted',
    value: function _insertSorted(el) {
      if (el.parentElement === this._container) return;

      if (!this.config.get('isSharedContainer') || this.params.isPrimary) {
        el.dataset['order'] = this.config.get('order');
      }
      el.classList.add(this.selectorClass('component'));
      this._container.appendChild(el);
      if (this._container.childElementCount > 1 && this.config.has('order')) {
        this.container.selectAll('#' + this._container.id + ' > ' + this.selectors.component).datum(function () {
          return this.dataset['order'];
        }).sort().datum(null);
      }
    }

    // Event handlers

  }, {
    key: '_onResize',
    value: function _onResize() {
      if (!this._ticking) {
        window.requestAnimationFrame(this.render.bind(this));
        this._ticking = true;
      }
    }
  }, {
    key: '_onEvent',
    value: function _onEvent(d, el, e) {
      var elementName = _lodash2.default.invert(this.selectors)['.' + el.classList[0]];
      var cb = this.config.getAction(elementName, e.type);
      if (_lodash2.default.isFunction(cb)) cb(d.data);
    }
  }, {
    key: 'selectors',
    get: function get() {
      return {
        chart: '.cc-chart',
        component: '.cc-component',
        svgWrapper: '.svg-wrapper',
        svg: '.cc-svg',
        sharedSvg: '.shared-svg',
        node: '.node',
        interactive: '.interactive'
      };
    }
  }, {
    key: 'events',
    get: function get() {
      return {
        'click node': '_onEvent',
        'dblclick node': '_onEvent'
      };
    }
  }, {
    key: 'zIndex',
    get: function get() {
      return 0;
    }
    /**
     * @return {String} id provided by config or Backbone generated
     */

  }, {
    key: 'id',
    get: function get() {
      return this._id || this.cid;
    }
    /**
     * Backbone tries to set id while initialization
     */
    ,
    set: function set(id) {}
    // do nothing

    /**
     * @returns {Object} d3.selection - Looks for svg container
     */

  }, {
    key: 'svg',
    get: function get() {
      var selector = '';
      if (this.config.get('isSharedContainer')) {
        // this components uses shared svg container
        selector = '#' + this._container.id + ' > ' + this.selectors.svgWrapper + ' > svg' + this.selectors.svg + this.selectors.sharedSvg;
      } else {
        // this component is standalone
        if (this.isTagNameSvg(this.tagName)) {
          // this component is pure svg
          selector = '#' + this._container.id + ' > #' + this.id + '-svg-wrapper > svg' + this.selectors.svg;
        } else {
          // this component may have shared container inside
          selector = '#' + this._container.id + ' > #' + this.id + ' > ' + this.selectors.svgWrapper + ' > svg' + this.selectors.svg + this.selectors.sharedSvg;
        }
      }
      return this.container.select(selector);
    }
    /**
     * @return {Object} d3 selection - container to render into
     */

  }, {
    key: 'container',
    get: function get() {
      return d3Selection.select(this._container);
    }
    /**
     * One-time setter
     */
    ,
    set: function set(el) {
      if (!this._container) this._container = el;
    }
    /**
     * Calculate offset of svg relative to the container
     */

  }, {
    key: 'svgOffset',
    get: function get() {
      var left = this.svg.node().getBoundingClientRect().left - this._container.getBoundingClientRect().left;
      var top = this.svg.node().getBoundingClientRect().top - this._container.getBoundingClientRect().top;
      return { left: left, top: top };
    }
  }]);

  return ContrailChartsView;
}(_contrailView2.default);

exports.default = ContrailChartsView;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailModel = __webpack_require__(163);

var _contrailModel2 = _interopRequireDefault(_contrailModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var ContrailChartsConfigModel = function (_ContrailModel) {
  _inherits(ContrailChartsConfigModel, _ContrailModel);

  function ContrailChartsConfigModel() {
    var p = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ContrailChartsConfigModel);

    return _possibleConstructorReturn(this, (ContrailChartsConfigModel.__proto__ || Object.getPrototypeOf(ContrailChartsConfigModel)).call(this, p));
  }

  _createClass(ContrailChartsConfigModel, [{
    key: 'computeParams',

    /**
    * Initialize the computed parameters with the config parameters.
    */
    value: function computeParams() {
      this._computed = {};
      return _lodash2.default.extend(this._computed, JSON.parse(JSON.stringify(this.toJSON())));
    }
  }, {
    key: 'getValue',

    /**
     * @param {Object} data to extract value from
     * @param {Object} config on how to extract
     */
    value: function getValue(data) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var getValue = config.accessor;
      if (_lodash2.default.isNil(data)) return undefined;
      if (_lodash2.default.isFunction(getValue)) return getValue(data);
      if (_lodash2.default.isString(getValue)) return _lodash2.default.get(data, getValue);
      return data;
    }
    /**
     * @param {Object} data to extract formatted value from
     * @param {Object} config on how to extract
     */

  }, {
    key: 'getFormattedValue',
    value: function getFormattedValue(data) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var formatter = config.valueFormatter;
      var value = this.getValue(data, config);
      if (_lodash2.default.isFunction(formatter)) return formatter(value);
      return value;
    }
    /**
     * @param {Object} data to extract label from
     * @param {Object} config on how to extract label from data
     */

  }, {
    key: 'getLabel',
    value: function getLabel(data) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var getLabel = config.labelFormatter || config.label || config.accessor || config.getLabel;
      if (_lodash2.default.isString(getLabel)) return getLabel;
      if (_lodash2.default.isNil(data)) return undefined;
      if (_lodash2.default.isFunction(getLabel)) return getLabel(data);
    }
  }, {
    key: 'getAction',
    value: function getAction(selector, type) {
      return this.get('action.' + type + ' ' + selector);
    }
  }, {
    key: 'hasAction',
    value: function hasAction(selector, type) {
      var actions = _lodash2.default.filter(this.attributes.action, function (action, key) {
        return key.includes(selector);
      });
      return _lodash2.default.isFunction(actions[0]);
    }
  }, {
    key: 'defaults',
    get: function get() {
      return {
        duration: 300
      };
    }
    /**
     * @return {String} this class name without 'ConfigModel'
     */

  }, {
    key: 'type',
    get: function get() {
      return this.constructor.name.slice(0, -11);
    }
  }, {
    key: 'parent',
    set: function set(model) {
      var _this2 = this;

      model.on('change', function () {
        _this2.trigger('change');
      });
      this._parent = model;
      this.trigger('change');
    }
  }]);

  return ContrailChartsConfigModel;
}(_contrailModel2.default);

exports.default = ContrailChartsConfigModel;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ENDED = exports.ENDING = exports.RUNNING = exports.STARTED = exports.STARTING = exports.SCHEDULED = exports.CREATED = undefined;

exports.default = function (node, name, id, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};else if (id in schedules) return;
  create(node, id, {
    name: name,
    index: index, // For context during callback.
    group: group, // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
};

exports.init = init;
exports.set = set;
exports.get = get;

var _d3Dispatch = __webpack_require__(169);

var _d3Timer = __webpack_require__(47);

var emptyOn = (0, _d3Dispatch.dispatch)("start", "end", "interrupt");
var emptyTween = [];

var CREATED = exports.CREATED = 0;
var SCHEDULED = exports.SCHEDULED = 1;
var STARTING = exports.STARTING = 2;
var STARTED = exports.STARTED = 3;
var RUNNING = exports.RUNNING = 4;
var ENDING = exports.ENDING = 5;
var ENDED = exports.ENDED = 6;

function init(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id]) || schedule.state > CREATED) throw new Error("too late");
  return schedule;
}

function set(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id]) || schedule.state > STARTING) throw new Error("too late");
  return schedule;
}

function get(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id])) throw new Error("too late");
  return schedule;
}

function create(node, id, self) {
  var schedules = node.__transition,
      tween;

  // Initialize the self timer when the transition is created.
  // Note the actual delay is not known until the first callback!
  schedules[id] = self;
  self.timer = (0, _d3Timer.timer)(schedule, 0, self.time);

  function schedule(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start, self.delay, self.time);

    // If the elapsed delay is less than our first sleep, start immediately.
    if (self.delay <= elapsed) start(elapsed - self.delay);
  }

  function start(elapsed) {
    var i, j, n, o;

    // If the state is not SCHEDULED, then we previously errored on start.
    if (self.state !== SCHEDULED) return stop();

    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;

      // While this element already has a starting transition during this frame,
      // defer starting an interrupting transition until that transition has a
      // chance to tick (and possibly end); see d3/d3-transition#54!
      if (o.state === STARTED) return (0, _d3Timer.timeout)(start);

      // Interrupt the active transition, if any.
      // Dispatch the interrupt event.
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }

      // Cancel any pre-empted transitions. No interrupt event is dispatched
      // because the cancelled transitions never started. Note that this also
      // removes this transition from the pending list!
      else if (+i < id) {
          o.state = ENDED;
          o.timer.stop();
          delete schedules[i];
        }
    }

    // Defer the first tick to end of the current frame; see d3/d3#1576.
    // Note the transition may be canceled after start and before the first tick!
    // Note this must be scheduled before the start event; see d3/d3-transition#16!
    // Assuming this is successful, subsequent callbacks go straight to tick.
    (0, _d3Timer.timeout)(function () {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });

    // Dispatch the start event.
    // Note this must be done before the tween are initialized.
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return; // interrupted
    self.state = STARTED;

    // Initialize the tween, deleting null tween.
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }

  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
        i = -1,
        n = tween.length;

    while (++i < n) {
      tween[i].call(null, t);
    }

    // Dispatch the end event.
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }

  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id];
    for (var i in schedules) {
      return;
    } // eslint-disable-line no-unused-vars
    delete node.__transition;
  }
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailEvents = __webpack_require__(18);

var _contrailEvents2 = _interopRequireDefault(_contrailEvents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A "Command" object
 * @event enable
 * @event disable
 */
var instances = {};

var Action = function () {
  function Action() {
    var p = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Action);

    if (!instances[this.id]) instances[this.id] = this;
    var instance = instances[this.id];

    instance.registrars = instance.registrars || [];
    if (!_lodash2.default.includes(instance.registrars, p.registrar)) instance.registrars.push(p.registrar);

    instance._deny = true;
    return instance;
  }
  /**
   * Action is a Singleton so constructor name is effectively used as an id
   */


  _createClass(Action, [{
    key: 'apply',

    /**
     * Execute the action code
     */
    value: function apply() {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (this._deny) return undefined;

      if (this._execute) {
        _lodash2.default.each(this.registrars, function (registrar) {
          _this._registrar = registrar;
          _this._execute.apply(_this, args);
          _this._registrar = undefined;
        });
      }
      this.trigger.apply(this, ['fired'].concat(args));
    }
    /**
     * Changes enable/disable state
     * Notifies "disable" Event
     */

  }, {
    key: 'disable',
    value: function disable() {
      if (this._deny) return;
      this._deny = true;
      this.trigger('disable');
    }
    /**
     * Changes enable/disable state
     * Notifies "enable" Event
     */

  }, {
    key: 'enable',
    value: function enable() {
      if (!this._deny) return;
      this._deny = false;
      this.trigger('enable');
    }
    /**
     * @returns Boolean whether Action has undo method
     */

  }, {
    key: 'canUndo',
    value: function canUndo() {
      return !!this._undo;
    }
  }, {
    key: 'isEnabled',
    value: function isEnabled() {
      return !this._deny;
    }
    /**
     * Evaluate enabled state on selection change
     * @param selection Array
     */

  }, {
    key: 'evaluate',
    value: function evaluate(selection) {}
    /**
     * Remove registrar from action's registrars list
     * Clear all listeners if there are no registrars left
     * @param registrar
     */

  }, {
    key: 'unRegister',
    value: function unRegister(registrar) {
      var instance = instances[this.id];
      instance.registrars = _lodash2.default.without(instance.registrars, registrar);
      if (_lodash2.default.isEmpty(instances.registrars)) this.off();
    }
    /**
     * Override in Concrete Command
     */

  }, {
    key: '_execute',
    value: function _execute() {}
    /**
     * Toggle enabled state
     */

  }, {
    key: '_evaluate',
    value: function _evaluate(enable) {
      enable ? this.enable() : this.disable();
    }
  }, {
    key: 'id',
    get: function get() {
      return this.constructor.name;
    }
  }]);

  return Action;
}();
// TODO replace with class extends syntax


exports.default = Action;
_lodash2.default.extend(Action.prototype, _contrailEvents2.default);

module.exports = Action;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.extend = extend;
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.createFrame = createFrame;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

var badChars = /[&<>"'`=]/g,
    possible = /[&<>"'`=]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
exports.isFunction = isFunction;

/* eslint-enable func-style */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};

exports.isArray = isArray;
// Older IE versions do not directly support indexOf so we must implement our own, sadly.

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function createFrame(object) {
  var frame = extend({}, object);
  frame._parent = object;
  return frame;
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNLE1BQU0sR0FBRztBQUNiLEtBQUcsRUFBRSxPQUFPO0FBQ1osS0FBRyxFQUFFLE1BQU07QUFDWCxLQUFHLEVBQUUsTUFBTTtBQUNYLEtBQUcsRUFBRSxRQUFRO0FBQ2IsS0FBRyxFQUFFLFFBQVE7QUFDYixLQUFHLEVBQUUsUUFBUTtBQUNiLEtBQUcsRUFBRSxRQUFRO0NBQ2QsQ0FBQzs7QUFFRixJQUFNLFFBQVEsR0FBRyxZQUFZO0lBQ3ZCLFFBQVEsR0FBRyxXQUFXLENBQUM7O0FBRTdCLFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRTtBQUN2QixTQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNwQjs7QUFFTSxTQUFTLE1BQU0sQ0FBQyxHQUFHLG9CQUFtQjtBQUMzQyxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN6QyxTQUFLLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM1QixVQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUU7QUFDM0QsV0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUM5QjtLQUNGO0dBQ0Y7O0FBRUQsU0FBTyxHQUFHLENBQUM7Q0FDWjs7QUFFTSxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQzs7Ozs7O0FBS2hELElBQUksVUFBVSxHQUFHLG9CQUFTLEtBQUssRUFBRTtBQUMvQixTQUFPLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQztDQUNwQyxDQUFDOzs7QUFHRixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNuQixVQUlNLFVBQVUsR0FKaEIsVUFBVSxHQUFHLFVBQVMsS0FBSyxFQUFFO0FBQzNCLFdBQU8sT0FBTyxLQUFLLEtBQUssVUFBVSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssbUJBQW1CLENBQUM7R0FDcEYsQ0FBQztDQUNIO1FBQ08sVUFBVSxHQUFWLFVBQVU7Ozs7O0FBSVgsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxVQUFTLEtBQUssRUFBRTtBQUN0RCxTQUFPLEFBQUMsS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsR0FBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLGdCQUFnQixHQUFHLEtBQUssQ0FBQztDQUNqRyxDQUFDOzs7OztBQUdLLFNBQVMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDcEMsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNoRCxRQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUU7QUFDdEIsYUFBTyxDQUFDLENBQUM7S0FDVjtHQUNGO0FBQ0QsU0FBTyxDQUFDLENBQUMsQ0FBQztDQUNYOztBQUdNLFNBQVMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO0FBQ3ZDLE1BQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFOztBQUU5QixRQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQzNCLGFBQU8sTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3hCLE1BQU0sSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ3pCLGFBQU8sRUFBRSxDQUFDO0tBQ1gsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2xCLGFBQU8sTUFBTSxHQUFHLEVBQUUsQ0FBQztLQUNwQjs7Ozs7QUFLRCxVQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQztHQUN0Qjs7QUFFRCxNQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUFFLFdBQU8sTUFBTSxDQUFDO0dBQUU7QUFDOUMsU0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztDQUM3Qzs7QUFFTSxTQUFTLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDN0IsTUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLFdBQU8sSUFBSSxDQUFDO0dBQ2IsTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMvQyxXQUFPLElBQUksQ0FBQztHQUNiLE1BQU07QUFDTCxXQUFPLEtBQUssQ0FBQztHQUNkO0NBQ0Y7O0FBRU0sU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQ2xDLE1BQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0IsT0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdkIsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFTSxTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0FBQ3ZDLFFBQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRU0sU0FBUyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFO0FBQ2pELFNBQU8sQ0FBQyxXQUFXLEdBQUcsV0FBVyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUEsR0FBSSxFQUFFLENBQUM7Q0FDcEQiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBlc2NhcGUgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmI3gyNzsnLFxuICAnYCc6ICcmI3g2MDsnLFxuICAnPSc6ICcmI3gzRDsnXG59O1xuXG5jb25zdCBiYWRDaGFycyA9IC9bJjw+XCInYD1dL2csXG4gICAgICBwb3NzaWJsZSA9IC9bJjw+XCInYD1dLztcblxuZnVuY3Rpb24gZXNjYXBlQ2hhcihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKG9iai8qICwgLi4uc291cmNlICovKSB7XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yIChsZXQga2V5IGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhcmd1bWVudHNbaV0sIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5leHBvcnQgbGV0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxuLyogZXNsaW50LWRpc2FibGUgZnVuYy1zdHlsZSAqL1xubGV0IGlzRnVuY3Rpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgfTtcbn1cbmV4cG9ydCB7aXNGdW5jdGlvbn07XG4vKiBlc2xpbnQtZW5hYmxlIGZ1bmMtc3R5bGUgKi9cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmV4cG9ydCBjb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07XG5cbi8vIE9sZGVyIElFIHZlcnNpb25zIGRvIG5vdCBkaXJlY3RseSBzdXBwb3J0IGluZGV4T2Ygc28gd2UgbXVzdCBpbXBsZW1lbnQgb3VyIG93biwgc2FkbHkuXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUpIHtcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlRXhwcmVzc2lvbihzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgJiYgc3RyaW5nLnRvSFRNTCkge1xuICAgICAgcmV0dXJuIHN0cmluZy50b0hUTUwoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgJyc7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmc7XG4gIH1cblxuICBpZiAoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZyYW1lKG9iamVjdCkge1xuICBsZXQgZnJhbWUgPSBleHRlbmQoe30sIG9iamVjdCk7XG4gIGZyYW1lLl9wYXJlbnQgPSBvYmplY3Q7XG4gIHJldHVybiBmcmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrUGFyYW1zKHBhcmFtcywgaWRzKSB7XG4gIHBhcmFtcy5wYXRoID0gaWRzO1xuICByZXR1cm4gcGFyYW1zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwZW5kQ29udGV4dFBhdGgoY29udGV4dFBhdGgsIGlkKSB7XG4gIHJldHVybiAoY29udGV4dFBhdGggPyBjb250ZXh0UGF0aCArICcuJyA6ICcnKSArIGlkO1xufVxuIl19


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = __webpack_require__(203)['default'];


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transition = Transition;
exports.default = transition;
exports.newId = newId;

var _d3Selection = __webpack_require__(0);

var _attr = __webpack_require__(97);

var _attr2 = _interopRequireDefault(_attr);

var _attrTween = __webpack_require__(98);

var _attrTween2 = _interopRequireDefault(_attrTween);

var _delay = __webpack_require__(99);

var _delay2 = _interopRequireDefault(_delay);

var _duration = __webpack_require__(100);

var _duration2 = _interopRequireDefault(_duration);

var _ease = __webpack_require__(101);

var _ease2 = _interopRequireDefault(_ease);

var _filter = __webpack_require__(102);

var _filter2 = _interopRequireDefault(_filter);

var _merge = __webpack_require__(103);

var _merge2 = _interopRequireDefault(_merge);

var _on = __webpack_require__(104);

var _on2 = _interopRequireDefault(_on);

var _remove = __webpack_require__(105);

var _remove2 = _interopRequireDefault(_remove);

var _select = __webpack_require__(106);

var _select2 = _interopRequireDefault(_select);

var _selectAll = __webpack_require__(107);

var _selectAll2 = _interopRequireDefault(_selectAll);

var _selection = __webpack_require__(108);

var _selection2 = _interopRequireDefault(_selection);

var _style = __webpack_require__(109);

var _style2 = _interopRequireDefault(_style);

var _styleTween = __webpack_require__(110);

var _styleTween2 = _interopRequireDefault(_styleTween);

var _text = __webpack_require__(111);

var _text2 = _interopRequireDefault(_text);

var _transition = __webpack_require__(112);

var _transition2 = _interopRequireDefault(_transition);

var _tween = __webpack_require__(17);

var _tween2 = _interopRequireDefault(_tween);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var id = 0;

function Transition(groups, parents, name, id) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id;
}

function transition(name) {
  return (0, _d3Selection.selection)().transition(name);
}

function newId() {
  return ++id;
}

var selection_prototype = _d3Selection.selection.prototype;

Transition.prototype = transition.prototype = {
  constructor: Transition,
  select: _select2.default,
  selectAll: _selectAll2.default,
  filter: _filter2.default,
  merge: _merge2.default,
  selection: _selection2.default,
  transition: _transition2.default,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: _on2.default,
  attr: _attr2.default,
  attrTween: _attrTween2.default,
  style: _style2.default,
  styleTween: _styleTween2.default,
  text: _text2.default,
  remove: _remove2.default,
  tween: _tween2.default,
  delay: _delay2.default,
  duration: _duration2.default,
  ease: _ease2.default
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.default = {
  defaults: {
    colorScheme: d3Scale.schemeCategory20
  },

  set: function set() {
    var p = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var value = arguments[1];
    var options = arguments[2];

    // consider another set signature
    if (!_lodash2.default.isObject(p)) p = _defineProperty({}, p, value);else options = value;

    if (p.colorScheme && !p.colorScale) p.colorScale = d3Scale.scaleOrdinal(p.colorScheme);
    return p;
  },

  /**
   * @param {Object} data to extract label from
   * @param {Object} config on how to extract label from data
   * TODO should the getColor function if provided be evaluated on empty data?
   * Legend Panel needs to display a color not for particular data point but for the whole serie
   */
  getColor: function getColor(data) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var getColor = config.color;
    if (_lodash2.default.isString(getColor)) return getColor;
    if (_lodash2.default.isNil(data)) return undefined;
    if (_lodash2.default.isFunction(getColor)) return getColor(data);
  }
};

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_color__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_color___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__src_color__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "color", function() { return __WEBPACK_IMPORTED_MODULE_0__src_color___default.a; });
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_0__src_color__, "rgb")) __webpack_require__.d(__webpack_exports__, "rgb", function() { return __WEBPACK_IMPORTED_MODULE_0__src_color__["rgb"]; });
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_0__src_color__, "hsl")) __webpack_require__.d(__webpack_exports__, "hsl", function() { return __WEBPACK_IMPORTED_MODULE_0__src_color__["hsl"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_lab__ = __webpack_require__(64);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_lab___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__src_lab__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "lab", function() { return __WEBPACK_IMPORTED_MODULE_1__src_lab___default.a; });
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_1__src_lab__, "hcl")) __webpack_require__.d(__webpack_exports__, "hcl", function() { return __WEBPACK_IMPORTED_MODULE_1__src_lab__["hcl"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_cubehelix__ = __webpack_require__(63);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_cubehelix___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__src_cubehelix__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "cubehelix", function() { return __WEBPACK_IMPORTED_MODULE_2__src_cubehelix___default.a; });





/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hue = hue;
exports.gamma = gamma;
exports.default = nogamma;

var _constant = __webpack_require__(37);

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function linear(a, d) {
  return function (t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function (t) {
    return Math.pow(a + t * b, y);
  };
}

function hue(a, b) {
  var d = b - a;
  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : (0, _constant2.default)(isNaN(a) ? b : a);
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function (a, b) {
    return b - a ? exponential(a, b, y) : (0, _constant2.default)(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : (0, _constant2.default)(isNaN(a) ? b : a);
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var XYChartSubView = function (_ContrailChartsView) {
  _inherits(XYChartSubView, _ContrailChartsView);

  function XYChartSubView(p) {
    _classCallCheck(this, XYChartSubView);

    // TODO use ConfigModel as a parent
    var _this = _possibleConstructorReturn(this, (XYChartSubView.__proto__ || Object.getPrototypeOf(XYChartSubView)).call(this, p));

    _this._parent = p.parent;
    return _this;
  }
  /**
   * follow same naming convention for all charts
   */


  _createClass(XYChartSubView, [{
    key: 'getScreenX',
    value: function getScreenX(datum, xAccessor) {
      return this.xScale(datum[xAccessor]);
    }
  }, {
    key: 'getScreenY',
    value: function getScreenY(datum, yAccessor) {
      return this.yScale(datum[yAccessor]);
    }
  }, {
    key: 'render',
    value: function render() {
      _get(XYChartSubView.prototype.__proto__ || Object.getPrototypeOf(XYChartSubView.prototype), 'render', this).call(this);
      this._onMouseout();
      this.d3.attr('clip-path', 'url(#' + this._parent.clip + ')');
    }
    /**
     * Combine series domains (extents) by axis
     */

  }, {
    key: 'combineDomains',
    value: function combineDomains() {
      var _this2 = this;

      var domains = {};
      var xAxisName = this.config.get('plot.x.axis');
      var xAccessor = this.config.get('plot.x.accessor');
      var getFullRange = false;
      if (this.model.data.length < 2) getFullRange = true;
      domains[xAxisName] = this.model.getRangeFor(xAccessor, getFullRange);
      this._overrideDomain(xAxisName, domains);

      var enabledAccessors = _lodash2.default.filter(this.params.plot.y, function (a) {
        return a.enabled;
      });
      var accessorsByAxis = _lodash2.default.groupBy(enabledAccessors, 'axis');
      _lodash2.default.each(accessorsByAxis, function (accessors, axisName) {
        domains[axisName] = _this2.model.combineDomains(_lodash2.default.map(accessors, 'accessor'));
        if (domains[axisName][0] === domains[axisName][1]) {
          // TODO get maximum range of all enabled series but not of first only?
          domains[axisName] = _this2.model.getRangeFor(accessors[0].accessor, true);
        }
        _this2._overrideDomain(axisName, domains);
      });
      return domains;
    }
    // Override axis domain based on axis config

  }, {
    key: '_overrideDomain',
    value: function _overrideDomain(axisName, domains) {
      var configDomain = this.config.getDomain(axisName);
      if (!configDomain) return;
      if (!_lodash2.default.isNil(configDomain[0])) domains[axisName][0] = configDomain[0];
      if (!_lodash2.default.isNil(configDomain[1])) domains[axisName][1] = configDomain[1];
    }

    // Event handlers

  }, {
    key: '_onMouseout',
    value: function _onMouseout(d, el) {
      var tooltipId = d && d.accessor ? d.accessor.tooltip : _lodash2.default.map(this.params.activeAccessorData, function (a) {
        return a.tooltip;
      });
      if (!_lodash2.default.isEmpty(tooltipId)) {
        _Actionman2.default.fire('HideComponent', tooltipId);
      }
      var els = el ? this.d3.select(function () {
        return el;
      }) : this.d3.selectAll(this.selectors.node);
      els.classed('active', false);
    }
  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(XYChartSubView.prototype.__proto__ || Object.getPrototypeOf(XYChartSubView.prototype), 'selectors', this), {
        active: '.active'
      });
    }
  }, {
    key: 'tagName',
    get: function get() {
      return 'g';
    }
  }, {
    key: 'width',
    get: function get() {
      var delta = this.config.get('widthDelta') || 0;
      return (this.config.get('width') || this._container.getBoundingClientRect().width) + delta;
    }
  }, {
    key: 'height',
    get: function get() {
      return this.config.get('height') || Math.round(this.width / 2);
    }
  }, {
    key: 'xScale',
    get: function get() {
      return _lodash2.default.get(this.params.axis, 'x.scale');
    }
  }, {
    key: 'yScale',
    get: function get() {
      return _lodash2.default.has(this.params.axis[this.axisName], 'scale') ? this.params.axis[this.axisName].scale : d3Scale.scaleLinear();
    }
  }, {
    key: 'axisName',
    get: function get() {
      return this.config.get('axisName');
    }
  }, {
    key: 'innerWidth',
    get: function get() {
      var p = this.params;
      return this.width - p.marginRight - p.marginLeft - 2 * p.marginInner;
    }
  }, {
    key: 'outerWidth',
    get: function get() {
      var x = this.config.get('plot.x.accessor');
      if (!_lodash2.default.isFunction(this.xScale)) return this.innerWidth;
      var first = _lodash2.default.get((0, _lodash2.default)(this.model.data).first(), x);
      var last = _lodash2.default.get((0, _lodash2.default)(this.model.data).last(), x);
      return Math.abs(this.xScale(last) - this.xScale(first));
    }
  }, {
    key: 'xMarginInner',
    get: function get() {
      return 0;
    }
  }]);

  return XYChartSubView;
}(_contrailChartsView2.default);

exports.default = XYChartSubView;

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_value__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_value___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__src_value__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolate", function() { return __WEBPACK_IMPORTED_MODULE_0__src_value___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_array__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_array___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__src_array__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateArray", function() { return __WEBPACK_IMPORTED_MODULE_1__src_array___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_basis__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_basis___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__src_basis__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateBasis", function() { return __WEBPACK_IMPORTED_MODULE_2__src_basis___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__src_basisClosed__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__src_basisClosed___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__src_basisClosed__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateBasisClosed", function() { return __WEBPACK_IMPORTED_MODULE_3__src_basisClosed___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__src_date__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__src_date___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__src_date__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateDate", function() { return __WEBPACK_IMPORTED_MODULE_4__src_date___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__src_number__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__src_number___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__src_number__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateNumber", function() { return __WEBPACK_IMPORTED_MODULE_5__src_number___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__src_object__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__src_object___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__src_object__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateObject", function() { return __WEBPACK_IMPORTED_MODULE_6__src_object___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__src_round__ = __webpack_require__(71);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__src_round___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__src_round__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateRound", function() { return __WEBPACK_IMPORTED_MODULE_7__src_round___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__src_string__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__src_string___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__src_string__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateString", function() { return __WEBPACK_IMPORTED_MODULE_8__src_string___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__src_transform_index__ = __webpack_require__(73);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__src_transform_index___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__src_transform_index__);
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_9__src_transform_index__, "interpolateTransformCss")) __webpack_require__.d(__webpack_exports__, "interpolateTransformCss", function() { return __WEBPACK_IMPORTED_MODULE_9__src_transform_index__["interpolateTransformCss"]; });
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_9__src_transform_index__, "interpolateTransformSvg")) __webpack_require__.d(__webpack_exports__, "interpolateTransformSvg", function() { return __WEBPACK_IMPORTED_MODULE_9__src_transform_index__["interpolateTransformSvg"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__src_zoom__ = __webpack_require__(75);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__src_zoom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__src_zoom__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateZoom", function() { return __WEBPACK_IMPORTED_MODULE_10__src_zoom___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__src_rgb__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__src_rgb___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_11__src_rgb__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateRgb", function() { return __WEBPACK_IMPORTED_MODULE_11__src_rgb___default.a; });
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_11__src_rgb__, "rgbBasis")) __webpack_require__.d(__webpack_exports__, "interpolateRgbBasis", function() { return __WEBPACK_IMPORTED_MODULE_11__src_rgb__["rgbBasis"]; });
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_11__src_rgb__, "rgbBasisClosed")) __webpack_require__.d(__webpack_exports__, "interpolateRgbBasisClosed", function() { return __WEBPACK_IMPORTED_MODULE_11__src_rgb__["rgbBasisClosed"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__src_hsl__ = __webpack_require__(68);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__src_hsl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_12__src_hsl__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateHsl", function() { return __WEBPACK_IMPORTED_MODULE_12__src_hsl___default.a; });
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_12__src_hsl__, "hslLong")) __webpack_require__.d(__webpack_exports__, "interpolateHslLong", function() { return __WEBPACK_IMPORTED_MODULE_12__src_hsl__["hslLong"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__src_lab__ = __webpack_require__(69);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__src_lab___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_13__src_lab__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateLab", function() { return __WEBPACK_IMPORTED_MODULE_13__src_lab___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__src_hcl__ = __webpack_require__(67);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__src_hcl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_14__src_hcl__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateHcl", function() { return __WEBPACK_IMPORTED_MODULE_14__src_hcl___default.a; });
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_14__src_hcl__, "hclLong")) __webpack_require__.d(__webpack_exports__, "interpolateHclLong", function() { return __WEBPACK_IMPORTED_MODULE_14__src_hcl__["hclLong"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__src_cubehelix__ = __webpack_require__(66);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__src_cubehelix___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_15__src_cubehelix__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interpolateCubehelix", function() { return __WEBPACK_IMPORTED_MODULE_15__src_cubehelix___default.a; });
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_15__src_cubehelix__, "cubehelixLong")) __webpack_require__.d(__webpack_exports__, "interpolateCubehelixLong", function() { return __WEBPACK_IMPORTED_MODULE_15__src_cubehelix__["cubehelixLong"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__src_quantize__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__src_quantize___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_16__src_quantize__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "quantize", function() { return __WEBPACK_IMPORTED_MODULE_16__src_quantize___default.a; });



















/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  /* istanbul ignore else */
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  try {
    if (loc) {
      this.lineNumber = line;

      // Work around issue under safari where we can't directly set the column value
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(this, 'column', { value: column });
      } else {
        this.column = column;
      }
    }
  } catch (nop) {
    /* Ignore if the browser is very particular */
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQ0EsSUFBTSxVQUFVLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFbkcsU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRTtBQUNoQyxNQUFJLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUc7TUFDdEIsSUFBSSxZQUFBO01BQ0osTUFBTSxZQUFBLENBQUM7QUFDWCxNQUFJLEdBQUcsRUFBRTtBQUNQLFFBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUN0QixVQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7O0FBRTFCLFdBQU8sSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7R0FDeEM7O0FBRUQsTUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzs7O0FBRzFELE9BQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO0FBQ2hELFFBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDOUM7OztBQUdELE1BQUksS0FBSyxDQUFDLGlCQUFpQixFQUFFO0FBQzNCLFNBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7R0FDMUM7O0FBRUQsTUFBSTtBQUNGLFFBQUksR0FBRyxFQUFFO0FBQ1AsVUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7Ozs7QUFJdkIsVUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFO0FBQ3pCLGNBQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO09BQ3hELE1BQU07QUFDTCxZQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztPQUN0QjtLQUNGO0dBQ0YsQ0FBQyxPQUFPLEdBQUcsRUFBRTs7R0FFYjtDQUNGOztBQUVELFNBQVMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7cUJBRW5CLFNBQVMiLCJmaWxlIjoiZXhjZXB0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5jb25zdCBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuZnVuY3Rpb24gRXhjZXB0aW9uKG1lc3NhZ2UsIG5vZGUpIHtcbiAgbGV0IGxvYyA9IG5vZGUgJiYgbm9kZS5sb2MsXG4gICAgICBsaW5lLFxuICAgICAgY29sdW1uO1xuICBpZiAobG9jKSB7XG4gICAgbGluZSA9IGxvYy5zdGFydC5saW5lO1xuICAgIGNvbHVtbiA9IGxvYy5zdGFydC5jb2x1bW47XG5cbiAgICBtZXNzYWdlICs9ICcgLSAnICsgbGluZSArICc6JyArIGNvbHVtbjtcbiAgfVxuXG4gIGxldCB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBFeGNlcHRpb24pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBpZiAobG9jKSB7XG4gICAgICB0aGlzLmxpbmVOdW1iZXIgPSBsaW5lO1xuXG4gICAgICAvLyBXb3JrIGFyb3VuZCBpc3N1ZSB1bmRlciBzYWZhcmkgd2hlcmUgd2UgY2FuJ3QgZGlyZWN0bHkgc2V0IHRoZSBjb2x1bW4gdmFsdWVcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnY29sdW1uJywge3ZhbHVlOiBjb2x1bW59KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAobm9wKSB7XG4gICAgLyogSWdub3JlIGlmIHRoZSBicm93c2VyIGlzIHZlcnkgcGFydGljdWxhciAqL1xuICB9XG59XG5cbkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0IGRlZmF1bHQgRXhjZXB0aW9uO1xuIl19


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (a, b) {
  return a = +a, b -= a, function (t) {
    return a + b * t;
  };
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (name, value) {
  var id = this._id;

  name += "";

  if (arguments.length < 2) {
    var tween = (0, _schedule.get)(this.node(), id).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }

  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
};

exports.tweenValue = tweenValue;

var _schedule = __webpack_require__(5);

function tweenRemove(id, name) {
  var tween0, tween1;
  return function () {
    var schedule = (0, _schedule.set)(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }

    schedule.tween = tween1;
  };
}

function tweenFunction(id, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error();
  return function () {
    var schedule = (0, _schedule.set)(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name: name, value: value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }

    schedule.tween = tween1;
  };
}

function tweenValue(transition, name, value) {
  var id = transition._id;

  transition.each(function () {
    var schedule = (0, _schedule.set)(this, id);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });

  return function (node) {
    return (0, _schedule.get)(node, id).value[name];
  };
}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _backbone = __webpack_require__(28);

var _backbone2 = _interopRequireDefault(_backbone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _backbone2.default.Events; /*
                                              * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                              */

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var prefix = exports.prefix = "$";

function Map() {}

Map.prototype = map.prototype = {
  constructor: Map,
  has: function has(key) {
    return prefix + key in this;
  },
  get: function get(key) {
    return this[prefix + key];
  },
  set: function set(key, value) {
    this[prefix + key] = value;
    return this;
  },
  remove: function remove(key) {
    var property = prefix + key;
    return property in this && delete this[property];
  },
  clear: function clear() {
    for (var property in this) {
      if (property[0] === prefix) delete this[property];
    }
  },
  keys: function keys() {
    var keys = [];
    for (var property in this) {
      if (property[0] === prefix) keys.push(property.slice(1));
    }return keys;
  },
  values: function values() {
    var values = [];
    for (var property in this) {
      if (property[0] === prefix) values.push(this[property]);
    }return values;
  },
  entries: function entries() {
    var entries = [];
    for (var property in this) {
      if (property[0] === prefix) entries.push({ key: property.slice(1), value: this[property] });
    }return entries;
  },
  size: function size() {
    var size = 0;
    for (var property in this) {
      if (property[0] === prefix) ++size;
    }return size;
  },
  empty: function empty() {
    for (var property in this) {
      if (property[0] === prefix) return false;
    }return true;
  },
  each: function each(f) {
    for (var property in this) {
      if (property[0] === prefix) f(this[property], property.slice(1), this);
    }
  }
};

function map(object, f) {
  var map = new Map();

  // Copy constructor.
  if (object instanceof Map) object.each(function (value, key) {
    map.set(key, value);
  });

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
      var i = -1,
          n = object.length,
          o;

      if (f == null) while (++i < n) {
        map.set(i, object[i]);
      } else while (++i < n) {
        map.set(f(o = object[i], i, object), o);
      }
    }

    // Convert object to map.
    else if (object) for (var key in object) {
        map.set(key, object[key]);
      }return map;
}

exports.default = map;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.brighter = exports.darker = undefined;
exports.Color = Color;
exports.default = color;
exports.rgbConvert = rgbConvert;
exports.rgb = rgb;
exports.Rgb = Rgb;
exports.hslConvert = hslConvert;
exports.hsl = hsl;

var _define = __webpack_require__(21);

var _define2 = _interopRequireDefault(_define);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Color() {}

var _darker = 0.7;
exports.darker = _darker;
var _brighter = 1 / _darker;

exports.brighter = _brighter;
var reI = "\\s*([+-]?\\d+)\\s*",
    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
    reHex3 = /^#([0-9a-f]{3})$/,
    reHex6 = /^#([0-9a-f]{6})$/,
    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

(0, _define2.default)(Color, color, {
  displayable: function displayable() {
    return this.rgb().displayable();
  },
  toString: function toString() {
    return this.rgb() + "";
  }
});

function color(format) {
  var m;
  format = (format + "").trim().toLowerCase();
  return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb(m >> 8 & 0xf | m >> 4 & 0x0f0, m >> 4 & 0xf | m & 0xf0, (m & 0xf) << 4 | m & 0xf, 1) // #f00
  ) : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
  : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
  : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
  : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
  : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
  : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
  : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
  : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

(0, _define2.default)(Rgb, rgb, (0, _define.extend)(Color, {
  brighter: function brighter(k) {
    k = k == null ? _brighter : Math.pow(_brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function darker(k) {
    k = k == null ? _darker : Math.pow(_darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function rgb() {
    return this;
  },
  displayable: function displayable() {
    return 0 <= this.r && this.r <= 255 && 0 <= this.g && this.g <= 255 && 0 <= this.b && this.b <= 255 && 0 <= this.opacity && this.opacity <= 1;
  },
  toString: function toString() {
    var a = this.opacity;a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(") + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.b) || 0)) + (a === 1 ? ")" : ", " + a + ")");
  }
}));

function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;else if (l <= 0 || l >= 1) h = s = NaN;else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;else if (g === max) h = (b - r) / s + 2;else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

(0, _define2.default)(Hsl, hsl, (0, _define.extend)(Color, {
  brighter: function brighter(k) {
    k = k == null ? _brighter : Math.pow(_brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function darker(k) {
    k = k == null ? _darker : Math.pow(_darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function rgb() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
  },
  displayable: function displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  }
}));

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
};

exports.extend = extend;
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) {
    prototype[key] = definition[key];
  }return prototype;
}

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.basis = basis;

exports.default = function (values) {
  var n = values.length - 1;
  return function (t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
        v1 = values[i],
        v2 = values[i + 1],
        v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
        v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
};

function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1,
      t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
}

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (a, b) {
    var t = typeof b === "undefined" ? "undefined" : _typeof(b),
        c;
    return b == null || t === "boolean" ? (0, _constant2.default)(b) : (t === "number" ? _number2.default : t === "string" ? (c = (0, _d3Color.color)(b)) ? (b = c, _rgb2.default) : _string2.default : b instanceof _d3Color.color ? _rgb2.default : b instanceof Date ? _date2.default : Array.isArray(b) ? _array2.default : isNaN(b) ? _object2.default : _number2.default)(a, b);
};

var _d3Color = __webpack_require__(11);

var _rgb = __webpack_require__(40);

var _rgb2 = _interopRequireDefault(_rgb);

var _array = __webpack_require__(35);

var _array2 = _interopRequireDefault(_array);

var _date = __webpack_require__(38);

var _date2 = _interopRequireDefault(_date);

var _number = __webpack_require__(16);

var _number2 = _interopRequireDefault(_number);

var _object = __webpack_require__(39);

var _object2 = _interopRequireDefault(_object);

var _string = __webpack_require__(41);

var _string2 = _interopRequireDefault(_string);

var _constant = __webpack_require__(37);

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (node, x0, y0, x1, y1) {
  this.node = node;
  this.x0 = x0;
  this.y0 = y0;
  this.x1 = x1;
  this.y1 = y1;
};

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.now = now;
exports.Timer = Timer;
exports.timer = timer;
exports.timerFlush = timerFlush;
var frame = 0,
    // is an animation frame pending?
timeout = 0,
    // is a timeout pending?
interval = 0,
    // are any timers active?
pokeDelay = 1000,
    // how frequently we check for clock skew
taskHead,
    taskTail,
    clockLast = 0,
    clockNow = 0,
    clockSkew = 0,
    clock = (typeof performance === "undefined" ? "undefined" : _typeof(performance)) === "object" && performance.now ? performance : Date,
    setFrame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : function (f) {
  setTimeout(f, 17);
};

function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}

function clearNow() {
  clockNow = 0;
}

function Timer() {
  this._call = this._time = this._next = null;
}

Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function restart(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function stop() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};

function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}

function timerFlush() {
  now(); // Get the current time, if not already set.
  ++frame; // Pretend we’ve set an alarm, if we haven’t already.
  var t = taskHead,
      e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
    t = t._next;
  }
  --frame;
}

function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}

function poke() {
  var now = clock.now(),
      delay = now - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
}

function nap() {
  var t0,
      t1 = taskHead,
      t2,
      time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}

function sleep(time) {
  if (frame) return; // Soonest alarm already set, or will be.
  if (timeout) timeout = clearTimeout(timeout);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) timeout = setTimeout(wake, delay);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

var _d3Shape = __webpack_require__(0);

var d3Shape = _interopRequireWildcard(_d3Shape);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

var _ColoredChart = __webpack_require__(10);

var _ColoredChart2 = _interopRequireDefault(_ColoredChart);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */


var CompositeYChartConfigModel = function (_ContrailChartsConfig) {
  _inherits(CompositeYChartConfigModel, _ContrailChartsConfig);

  function CompositeYChartConfigModel() {
    _classCallCheck(this, CompositeYChartConfigModel);

    return _possibleConstructorReturn(this, (CompositeYChartConfigModel.__proto__ || Object.getPrototypeOf(CompositeYChartConfigModel)).apply(this, arguments));
  }

  _createClass(CompositeYChartConfigModel, [{
    key: 'set',
    value: function set() {
      _get(CompositeYChartConfigModel.prototype.__proto__ || Object.getPrototypeOf(CompositeYChartConfigModel.prototype), 'set', this).call(this, _ColoredChart2.default.set.apply(_ColoredChart2.default, arguments));
    }
    /**
     * @param {String} name of the axis
     */

  }, {
    key: 'getScale',
    value: function getScale(name) {
      var axis = this.attributes.axis[name] || {};
      if (_lodash2.default.isFunction(axis.scale)) return axis.scale;
      if (_lodash2.default.isFunction(d3Scale[axis.scale])) return d3Scale[axis.scale]();
      if (['bottom', 'top'].includes(this.getPosition(name))) return d3Scale.scaleTime();
      return d3Scale.scaleLinear();
    }
    /**
     * @param {String} name of the axis
     * @return {String} Axis position bottom / left
     */

  }, {
    key: 'getPosition',
    value: function getPosition(name) {
      var axis = this.attributes.axis[name] || {};
      if (this.attributes.axisPositions.includes(axis.position)) return axis.position;
      if (name.startsWith('x')) return 'bottom';
      if (name.startsWith('y')) return 'left';
    }
  }, {
    key: 'getColor',
    value: function getColor(data, accessor) {
      var configuredColor = _ColoredChart2.default.getColor(data, accessor);
      return configuredColor || this.attributes.colorScale(accessor.accessor);
    }
  }, {
    key: 'getAccessors',
    value: function getAccessors() {
      return this.get('plot.y');
    }
  }, {
    key: 'getDomain',
    value: function getDomain(axisName) {
      return this.get('axis.' + axisName + '.domain');
    }
  }, {
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(CompositeYChartConfigModel.prototype.__proto__ || Object.getPrototypeOf(CompositeYChartConfigModel.prototype), 'defaults', this), _ColoredChart2.default.defaults, {
        isPrimary: true,
        // by default will use common shared container under the parent
        isSharedContainer: true,

        // The component width. If not provided will be calculated by View.
        width: undefined,

        // The difference by how much we want to modify the computed width.
        widthDelta: undefined,

        // The component height. If not provided will be calculated by View.
        height: undefined,

        // Default axis ticks if not specified per axis.
        _xTicks: 10,
        _yTicks: 10,

        // Margin between label and chart
        labelMargin: 16,

        // Side margins.
        marginTop: 25,
        marginBottom: 40,
        marginLeft: 50,
        marginRight: 50,
        marginInner: 10,

        curve: d3Shape.curveCatmullRom.alpha(0.5),
        axisPositions: ['left', 'right', 'top', 'bottom'],
        plot: {},
        axis: {},
        // TODO move to the BarChartConfigModel
        // Padding between series in percents of bar width
        barPadding: 15
      });
    }
  }]);

  return CompositeYChartConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = CompositeYChartConfigModel;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(193);

module.exports = function TitleView(container, text) {
  var selector = '.cc-title';
  var el = container.querySelector(selector) || document.createElement('div');
  el.classList.add(selector.substr(1));
  el.innerHTML = text;
  container.prepend(el);
}; /*
    * Copyright (c) Juniper Networks, Inc. All rights reserved.
    */
/*
 * Simple title rendering
 */

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_28__;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ShowComponent = __webpack_require__(119);

Object.defineProperty(exports, 'ShowComponent', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ShowComponent).default;
  }
});

var _HideComponent = __webpack_require__(114);

Object.defineProperty(exports, 'HideComponent', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_HideComponent).default;
  }
});

var _SelectSerie = __webpack_require__(118);

Object.defineProperty(exports, 'SelectSerie', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SelectSerie).default;
  }
});

var _SelectColor = __webpack_require__(117);

Object.defineProperty(exports, 'SelectColor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SelectColor).default;
  }
});

var _SelectChartType = __webpack_require__(116);

Object.defineProperty(exports, 'SelectChartType', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SelectChartType).default;
  }
});

var _Zoom = __webpack_require__(121);

Object.defineProperty(exports, 'Zoom', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Zoom).default;
  }
});

var _Refresh = __webpack_require__(115);

Object.defineProperty(exports, 'Refresh', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Refresh).default;
  }
});

var _Freeze = __webpack_require__(113);

Object.defineProperty(exports, 'Freeze', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Freeze).default;
  }
});

var _Unfreeze = __webpack_require__(120);

Object.defineProperty(exports, 'Unfreeze', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Unfreeze).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ColorPickerConfigModel = __webpack_require__(122);

Object.defineProperty(exports, 'ColorPickerConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ColorPickerConfigModel).default;
  }
});

var _ColorPickerView = __webpack_require__(123);

Object.defineProperty(exports, 'ColorPickerView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ColorPickerView).default;
  }
});

var _CompositeYChartConfigModel = __webpack_require__(26);

Object.defineProperty(exports, 'CompositeYChartConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_CompositeYChartConfigModel).default;
  }
});

var _CompositeYChartView = __webpack_require__(44);

Object.defineProperty(exports, 'CompositeYChartView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_CompositeYChartView).default;
  }
});

var _ControlPanelConfigModel = __webpack_require__(129);

Object.defineProperty(exports, 'ControlPanelConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ControlPanelConfigModel).default;
  }
});

var _ControlPanelView = __webpack_require__(130);

Object.defineProperty(exports, 'ControlPanelView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ControlPanelView).default;
  }
});

var _CrosshairConfigModel = __webpack_require__(131);

Object.defineProperty(exports, 'CrosshairConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_CrosshairConfigModel).default;
  }
});

var _CrosshairView = __webpack_require__(132);

Object.defineProperty(exports, 'CrosshairView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_CrosshairView).default;
  }
});

var _FilterView = __webpack_require__(134);

Object.defineProperty(exports, 'FilterView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_FilterView).default;
  }
});

var _FilterConfigModel = __webpack_require__(133);

Object.defineProperty(exports, 'FilterConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_FilterConfigModel).default;
  }
});

var _LegendConfigModel = __webpack_require__(137);

Object.defineProperty(exports, 'LegendConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_LegendConfigModel).default;
  }
});

var _LegendView = __webpack_require__(138);

Object.defineProperty(exports, 'LegendView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_LegendView).default;
  }
});

var _LegendPanelConfigModel = __webpack_require__(135);

Object.defineProperty(exports, 'LegendPanelConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_LegendPanelConfigModel).default;
  }
});

var _LegendPanelView = __webpack_require__(136);

Object.defineProperty(exports, 'LegendPanelView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_LegendPanelView).default;
  }
});

var _MessageConfigModel = __webpack_require__(141);

Object.defineProperty(exports, 'MessageConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_MessageConfigModel).default;
  }
});

var _MessageView = __webpack_require__(142);

Object.defineProperty(exports, 'MessageView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_MessageView).default;
  }
});

var _NavigationConfigModel = __webpack_require__(145);

Object.defineProperty(exports, 'NavigationConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_NavigationConfigModel).default;
  }
});

var _NavigationView = __webpack_require__(146);

Object.defineProperty(exports, 'NavigationView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_NavigationView).default;
  }
});

var _PieChartConfigModel = __webpack_require__(147);

Object.defineProperty(exports, 'PieChartConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_PieChartConfigModel).default;
  }
});

var _PieChartView = __webpack_require__(148);

Object.defineProperty(exports, 'PieChartView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_PieChartView).default;
  }
});

var _RadialDendrogramConfigModel = __webpack_require__(149);

Object.defineProperty(exports, 'RadialDendrogramConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_RadialDendrogramConfigModel).default;
  }
});

var _RadialDendrogramView = __webpack_require__(150);

Object.defineProperty(exports, 'RadialDendrogramView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_RadialDendrogramView).default;
  }
});

var _SankeyConfigModel = __webpack_require__(151);

Object.defineProperty(exports, 'SankeyConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SankeyConfigModel).default;
  }
});

var _SankeyView = __webpack_require__(152);

Object.defineProperty(exports, 'SankeyView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SankeyView).default;
  }
});

var _StandaloneConfigModel = __webpack_require__(153);

Object.defineProperty(exports, 'StandaloneConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_StandaloneConfigModel).default;
  }
});

var _StandaloneView = __webpack_require__(154);

Object.defineProperty(exports, 'StandaloneView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_StandaloneView).default;
  }
});

var _TimelineConfigModel = __webpack_require__(155);

Object.defineProperty(exports, 'TimelineConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_TimelineConfigModel).default;
  }
});

var _TimelineView = __webpack_require__(156);

Object.defineProperty(exports, 'TimelineView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_TimelineView).default;
  }
});

var _TooltipConfigModel = __webpack_require__(157);

Object.defineProperty(exports, 'TooltipConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_TooltipConfigModel).default;
  }
});

var _TooltipView = __webpack_require__(158);

Object.defineProperty(exports, 'TooltipView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_TooltipView).default;
  }
});

var _MapView = __webpack_require__(140);

Object.defineProperty(exports, 'MapView', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_MapView).default;
  }
});

var _MapConfigModel = __webpack_require__(139);

Object.defineProperty(exports, 'MapConfigModel', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_MapConfigModel).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
function hashCode(str) {
  var hash = 0;
  var i = void 0;
  var chr = void 0;
  var len = void 0;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

var bubbleShapes = {
  signin: '&#xf090;',
  signout: '&#xf08b;',
  certificate: '&#xf0a3;',
  circleFill: '&#xf111;',
  circle: '&#xf10c;',
  notchCircle: '&#xf1ce;',
  thinCircle: '&#xf1db;',
  dotCircle: '&#xf192;',
  cog: '&#xf013;',
  dashboard: '&#xf0e4;',
  db: '&#xf1c0;',
  desktop: '&#xf108;',
  squareFill: '&#xf0c8;',
  sun: '&#xf185;',
  square: '&#xf096;',
  star: '&#xf005;',
  spinner: '&#xf110;',
  sheld: '&#xf132;',
  network: '&#xf0e8;',
  tv: '&#xf26c;',
  window: '&#xf2d0;',
  cloud: '&#xf0c2;',
  cogs: '&#xf085;',
  compass: '&#xf14e;',
  warning: '&#xf071;',
  alarmFill: '&#xf0f3;',
  deleted: '&#xf05e;',
  asterisk: '&#xf069;'
};

exports.hashCode = hashCode;
exports.bubbleShapes = bubbleShapes;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SerieProvider = __webpack_require__(166);

Object.defineProperty(exports, 'SerieProvider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SerieProvider).default;
  }
});

var _DataFrameProvider = __webpack_require__(165);

Object.defineProperty(exports, 'DataFrameProvider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_DataFrameProvider).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var cos = exports.cos = Math.cos;
var sin = exports.sin = Math.sin;
var pi = exports.pi = Math.PI;
var halfPi = exports.halfPi = pi / 2;
var tau = exports.tau = pi * 2;
var max = exports.max = Math.max;

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var deg2rad = exports.deg2rad = Math.PI / 180;
var rad2deg = exports.rad2deg = 180 / Math.PI;

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (a, b) {
  var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(nb),
      c = new Array(nb),
      i;

  for (i = 0; i < na; ++i) {
    x[i] = (0, _value2.default)(a[i], b[i]);
  }for (; i < nb; ++i) {
    c[i] = b[i];
  }return function (t) {
    for (i = 0; i < na; ++i) {
      c[i] = x[i](t);
    }return c;
  };
};

var _value = __webpack_require__(23);

var _value2 = _interopRequireDefault(_value);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (values) {
  var n = values.length;
  return function (t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n),
        v0 = values[(i + n - 1) % n],
        v1 = values[i % n],
        v2 = values[(i + 1) % n],
        v3 = values[(i + 2) % n];
    return (0, _basis.basis)((t - i / n) * n, v0, v1, v2, v3);
  };
};

var _basis = __webpack_require__(22);

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (x) {
  return function () {
    return x;
  };
};

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (a, b) {
  var d = new Date();
  return a = +a, b -= a, function (t) {
    return d.setTime(a + b * t), d;
  };
};

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (a, b) {
  var i = {},
      c = {},
      k;

  if (a === null || (typeof a === "undefined" ? "undefined" : _typeof(a)) !== "object") a = {};
  if (b === null || (typeof b === "undefined" ? "undefined" : _typeof(b)) !== "object") b = {};

  for (k in b) {
    if (k in a) {
      i[k] = (0, _value2.default)(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function (t) {
    for (k in i) {
      c[k] = i[k](t);
    }return c;
  };
};

var _value = __webpack_require__(23);

var _value2 = _interopRequireDefault(_value);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rgbBasisClosed = exports.rgbBasis = undefined;

var _d3Color = __webpack_require__(11);

var _basis = __webpack_require__(22);

var _basis2 = _interopRequireDefault(_basis);

var _basisClosed = __webpack_require__(36);

var _basisClosed2 = _interopRequireDefault(_basisClosed);

var _color = __webpack_require__(12);

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function rgbGamma(y) {
  var color = (0, _color.gamma)(y);

  function rgb(start, end) {
    var r = color((start = (0, _d3Color.rgb)(start)).r, (end = (0, _d3Color.rgb)(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = (0, _color2.default)(start.opacity, end.opacity);
    return function (t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb.gamma = rgbGamma;

  return rgb;
}(1);

function rgbSpline(spline) {
  return function (colors) {
    var n = colors.length,
        r = new Array(n),
        g = new Array(n),
        b = new Array(n),
        i,
        color;
    for (i = 0; i < n; ++i) {
      color = (0, _d3Color.rgb)(colors[i]);
      r[i] = color.r || 0;
      g[i] = color.g || 0;
      b[i] = color.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color.opacity = 1;
    return function (t) {
      color.r = r(t);
      color.g = g(t);
      color.b = b(t);
      return color + "";
    };
  };
}

var rgbBasis = exports.rgbBasis = rgbSpline(_basis2.default);
var rgbBasisClosed = exports.rgbBasisClosed = rgbSpline(_basisClosed2.default);

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0,
      // scan index for next number in b
  am,
      // current match in a
  bm,
      // current match in b
  bs,
      // string preceding current number in b, if any
  i = -1,
      // index in s
  s = [],
      // string constants and placeholders
  q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else {
      // interpolate non-matching numbers
      s[++i] = null;
      q.push({ i: i, x: (0, _number2.default)(am, bm) });
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function (t) {
    for (var i = 0, o; i < b; ++i) {
      s[(o = q[i]).i] = o.x(t);
    }return s.join("");
  });
};

var _number = __webpack_require__(16);

var _number2 = _interopRequireDefault(_number);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB = new RegExp(reA.source, "g");

function zero(b) {
  return function () {
    return b;
  };
}

function one(b) {
  return function (t) {
    return b(t) + "";
  };
}

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (node, name) {
  var schedules = node.__transition,
      schedule,
      active,
      empty = true,
      i;

  if (!schedules) return;

  name = name == null ? null : name + "";

  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) {
      empty = false;continue;
    }
    active = schedule.state > _schedule.STARTING && schedule.state < _schedule.ENDING;
    schedule.state = _schedule.ENDED;
    schedule.timer.stop();
    if (active) schedule.on.call("interrupt", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }

  if (empty) delete node.__transition;
};

var _schedule = __webpack_require__(5);

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (a, b) {
    var c;
    return (typeof b === "number" ? _d3Interpolate.interpolateNumber : b instanceof _d3Color.color ? _d3Interpolate.interpolateRgb : (c = (0, _d3Color.color)(b)) ? (b = c, _d3Interpolate.interpolateRgb) : _d3Interpolate.interpolateString)(a, b);
};

var _d3Color = __webpack_require__(11);

var _d3Interpolate = __webpack_require__(14);

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

__webpack_require__(176);

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _d3Axis = __webpack_require__(0);

var d3Axis = _interopRequireWildcard(_d3Axis);

var _d3Array = __webpack_require__(0);

var d3Array = _interopRequireWildcard(_d3Array);

var _d3TimeFormat = __webpack_require__(0);

var d3TimeFormat = _interopRequireWildcard(_d3TimeFormat);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

var _LineChartView = __webpack_require__(126);

var _LineChartView2 = _interopRequireDefault(_LineChartView);

var _AreaChartView = __webpack_require__(124);

var _AreaChartView2 = _interopRequireDefault(_AreaChartView);

var _GroupedBarChartView = __webpack_require__(125);

var _GroupedBarChartView2 = _interopRequireDefault(_GroupedBarChartView);

var _StackedBarChartView = __webpack_require__(128);

var _StackedBarChartView2 = _interopRequireDefault(_StackedBarChartView);

var _ScatterPlotView = __webpack_require__(127);

var _ScatterPlotView2 = _interopRequireDefault(_ScatterPlotView);

var _CompositeYChartConfigModel = __webpack_require__(26);

var _CompositeYChartConfigModel2 = _interopRequireDefault(_CompositeYChartConfigModel);

var _TitleView = __webpack_require__(27);

var _TitleView2 = _interopRequireDefault(_TitleView);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var CompositeYChartView = function (_ContrailChartsView) {
  _inherits(CompositeYChartView, _ContrailChartsView);

  _createClass(CompositeYChartView, null, [{
    key: 'dataType',
    get: function get() {
      return 'DataFrame';
    }
  }]);

  function CompositeYChartView(p) {
    _classCallCheck(this, CompositeYChartView);

    var _this = _possibleConstructorReturn(this, (CompositeYChartView.__proto__ || Object.getPrototypeOf(CompositeYChartView)).call(this, p));

    _this._drawings = [];

    _this.listenTo(_this.model, 'change', _this.render);
    _this.listenTo(_this.config, 'change', _this._onConfigModelChange);
    /**
     * Let's bind super _onResize to this. Also .bind returns new function ref.
     * we need to store this for successful removal from window event
     */
    _this._onResize = _this._onResize.bind(_this);
    window.addEventListener('resize', _this._onResize);
    return _this;
  }

  _createClass(CompositeYChartView, [{
    key: 'render',
    value: function render() {
      if (!this.config || !this._container) return;
      this.resetParams();
      if (this.params.title) (0, _TitleView2.default)(this._container, this.params.title);
      this._updateChildDrawings();
      this._calculateActiveAccessorData();
      this._calculateDimensions();
      this._calculateRanges();
      this._calculateScales();

      _get(CompositeYChartView.prototype.__proto__ || Object.getPrototypeOf(CompositeYChartView.prototype), 'render', this).call(this);
      this._renderSVG();
      this._renderXAxis();
      this._renderYAxes();
      _lodash2.default.each(this._drawings, function (drawing) {
        return drawing.render();
      });

      var crosshairId = this.config.get('crosshair');
      if (crosshairId) _Actionman2.default.fire('HideComponent', crosshairId);

      this._ticking = false;
    }
  }, {
    key: 'remove',
    value: function remove() {
      _get(CompositeYChartView.prototype.__proto__ || Object.getPrototypeOf(CompositeYChartView.prototype), 'remove', this).call(this);
      window.removeEventListener('resize', this._onResize);
      _lodash2.default.each(this._drawings, function (drawing) {
        return drawing.remove();
      });
      this._drawings = [];
    }
  }, {
    key: 'showCrosshair',
    value: function showCrosshair(point) {
      var crosshairId = this.config.get('crosshair');
      var xScale = this.params.axis[this.config.get('plot.x.axis')].scale;
      var mouseX = xScale.invert(point[0]);
      var data = this.model.getNearest(this.config.get('plot.x.accessor'), mouseX);
      var config = this.getCrosshairConfig();
      _Actionman2.default.fire('ShowComponent', crosshairId, data, point, config);

      // reset the tick so we can capture the next handler
      this._ticking = false;
    }
  }, {
    key: '_calculateDimensions',
    value: function _calculateDimensions() {
      if (this._drawings[0]) {
        this.params.width = this._drawings[0].width;
        this.params.height = this._drawings[0].height;
      }
    }
    /**
    * Calculates the activeAccessorData that holds only the verified and enabled accessors from the 'plot' structure.
    * Params: activeAccessorData, yAxisInfoArray
    */

  }, {
    key: '_calculateActiveAccessorData',
    value: function _calculateActiveAccessorData() {
      var _this2 = this;

      this.params.activeAccessorData = [];
      this.params.yAxisInfoArray = [];
      // Initialize the drawings activeAccessorData structure
      _lodash2.default.each(this._drawings, function (drawing) {
        drawing.params.activeAccessorData = [];
        drawing.params.enabled = false;
      });
      // Fill the activeAccessorData structure.
      _lodash2.default.each(this.config.get('plot.y'), function (accessor) {
        var drawing = _this2.getDrawing(accessor);
        if (drawing) {
          if (accessor.enabled) {
            _this2.params.activeAccessorData.push(accessor);
            var foundAxisInfo = _lodash2.default.find(_this2.params.yAxisInfoArray, { name: accessor.axis });
            var axisPosition = _this2.hasAxisParam(accessor.axis, 'position') ? _this2.params.axis[accessor.axis].position : 'left';
            if (!foundAxisInfo) {
              foundAxisInfo = {
                name: accessor.axis,
                used: 0,
                position: axisPosition,
                num: 0,
                accessors: []
              };
              _this2.params.yAxisInfoArray.push(foundAxisInfo);
            }
            foundAxisInfo.used++;
            foundAxisInfo.accessors.push(accessor.accessor);
            if (accessor.chart) {
              // Set the activeAccessorData to the appropriate drawings.
              if (drawing) {
                drawing.params.activeAccessorData.push(accessor);
                drawing.params.enabled = true;
              }
            }
          }
        }
      });
    }
    /**
     * Use the scales provided in the config or calculate them to fit data in view.
     * Assumes to have the range values available in the DataProvider (model) and the chart dimensions available in params.
     * Params: xRange, yRange, xDomain, yDomain, xScale, yScale
     */

  }, {
    key: '_calculateRanges',
    value: function _calculateRanges() {
      var p = this.params;
      p.xMarginInner = _lodash2.default.max(_lodash2.default.map(this._drawings, 'xMarginInner'));
      p.xRange = [p.marginLeft + p.marginInner + p.xMarginInner, p.width - p.marginRight - p.marginInner - p.xMarginInner];
      p.yRange = [p.height - p.marginInner - p.marginBottom, p.marginInner + p.marginTop];
    }
  }, {
    key: 'getDrawing',
    value: function getDrawing(accessor) {
      return _lodash2.default.find(this._drawings, function (drawing) {
        return drawing.axisName === accessor.axis && drawing.type === accessor.chart;
      });
    }
    /**
     * Combine series domains (extents) by axis
     */

  }, {
    key: 'combineDomains',
    value: function combineDomains() {
      var domains = {};
      _lodash2.default.each(this._drawings, function (drawing) {
        _lodash2.default.each(drawing.combineDomains(), function (drawingDomain, axisName) {
          domains[axisName] = d3Array.extent(_lodash2.default.concat(domains[axisName] || [], drawingDomain));
        });
      });
      return domains;
    }
    /**
    * Save all scales in the params and drawing.params structures.
    */

  }, {
    key: '_calculateScales',
    value: function _calculateScales() {
      var _this3 = this;

      var domains = this.combineDomains();
      if (!_lodash2.default.has(this.params, 'axis')) {
        this.params.axis = {};
      }
      _lodash2.default.each(domains, function (domain, axisName) {
        if (!_lodash2.default.has(_this3.params.axis, axisName)) _this3.params.axis[axisName] = {};
        var axis = _this3.params.axis[axisName];
        axis.position = _this3.config.getPosition(axisName);
        axis.domain = domain;
        if (!_this3.hasAxisParam(axisName, 'range')) {
          if (['bottom', 'top'].includes(axis.position)) {
            axis.range = _this3.params.xRange;
          } else if (['left', 'right'].includes(axis.position)) {
            axis.range = _this3.params.yRange;
          }
        }
        if (!_lodash2.default.isFunction(axis.scale) && axis.range) {
          var scale = _this3.config.getScale(axisName);
          if (axis.nice) {
            if (_this3.hasAxisParam(axisName, 'ticks')) {
              scale.nice(axis.ticks);
            } else {
              scale.nice();
            }
          }
          scale.domain(axis.domain).range(axis.range);
          axis.scale = scale;
        }
      });
      this.adjustAxisMargin();

      // Now update the scales of the appropriate drawings.
      _lodash2.default.each(this._drawings, function (drawing) {
        drawing.params.axis = _this3.params.axis;
      });
    }
    /**
     * shrink x and y axes range to have margin for displaying of shapes sticking out of scale
     */

  }, {
    key: 'adjustAxisMargin',
    value: function adjustAxisMargin() {
      var sizeMargin = 0;
      var sizeAxises = _lodash2.default.filter(this.params.axis, function (axis, name) {
        return name.match('size');
      });
      _lodash2.default.each(sizeAxises, function (axis) {
        // assume max shape extension out of scale range as of triangle's half edge
        // TODO margin should be based on the biggest triangle in the visible dataset but not the whole data
        var axisSizeMargin = Math.sqrt(axis.range[1] / Math.sqrt(3));
        if (axisSizeMargin > sizeMargin) sizeMargin = axisSizeMargin;
      });
      if (!sizeMargin) return;
      var axises = _lodash2.default.filter(this.params.axis, function (axis) {
        return axis.position && axis.range;
      });
      _lodash2.default.each(axises, function (axis) {
        var axisMargin = ['left', 'right'].includes(axis.position) ? -sizeMargin : sizeMargin;
        axis.scale.range([axis.range[0] + axisMargin, axis.range[1] - axisMargin]);
      });
    }
    /**
     * Renders axis and drawing groups.
     * Resizes chart dimensions if chart already exists.
     */

  }, {
    key: '_renderSVG',
    value: function _renderSVG() {
      var translate = this.params.xRange[0] - this.xMarginInner;
      if (this.d3.select('clipPath').empty()) {
        this.d3.append('clipPath').attr('id', this.clip).append('rect').attr('x', this.params.xRange[0] - this.xMarginInner).attr('y', this.params.yRange[1] - this.params.marginInner).attr('width', this.params.xRange[1] - this.params.xRange[0] + 2 * this.xMarginInner).attr('height', this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner);
        this.d3.append('g').attr('class', 'axis x-axis').attr('transform', 'translate(0,' + (this.params.yRange[1] - this.params.marginInner) + ')');
      }
      // TODO merge with previous as enter / update
      // Handle (re)size.
      this.d3.select('#' + this.clip).select('rect').attr('x', this.params.xRange[0] - this.xMarginInner).attr('y', this.params.yRange[1] - this.params.marginInner).attr('width', this.params.xRange[1] - this.params.xRange[0] + 2 * this.xMarginInner).attr('height', this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner);

      // Handle Y axis
      var svgYAxis = this.d3.selectAll('.axis.y-axis').data(this.params.yAxisInfoArray, function (d) {
        return d.name;
      });

      // Do not remove last axis
      if (svgYAxis.nodes().length < 1) {
        var toRemove = svgYAxis.exit().nodes();
        _lodash2.default.each(toRemove.slice(1), function (node) {
          return node.remove();
        });
      } else svgYAxis.exit().remove();

      svgYAxis.enter().append('g').attr('class', function (d) {
        return 'axis y-axis ' + d.name + '-axis';
      }).merge(svgYAxis).attr('transform', 'translate(' + translate + ',0)');

      if (this.config.has('crosshair')) {
        this.svg.delegate('mousemove', 'svg', this._onMousemove.bind(this));
      }
    }
  }, {
    key: 'hasAxisConfig',
    value: function hasAxisConfig(axisName, axisAttributeName) {
      var axis = this.config.get('axis');
      return _lodash2.default.isObject(axis) && _lodash2.default.isObject(axis[axisName]) && !_lodash2.default.isUndefined(axis[axisName][axisAttributeName]);
    }
  }, {
    key: 'hasAxisParam',
    value: function hasAxisParam(axisName, axisAttributeName) {
      return _lodash2.default.isObject(this.params.axis) && _lodash2.default.isObject(this.params.axis[axisName]) && !_lodash2.default.isUndefined(this.params.axis[axisName][axisAttributeName]);
    }
    /**
     * Render x axis
     */

  }, {
    key: '_renderXAxis',
    value: function _renderXAxis() {
      var name = this.config.get('plot.x.axis');
      var axis = this.params.axis[name];
      if (!axis.scale) return;

      var xAxis = d3Axis.axisBottom(axis.scale).tickSize(this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner).tickPadding(10);
      if (this.hasAxisParam('x', 'ticks')) {
        xAxis = xAxis.ticks(axis.ticks);
      } else {
        xAxis = xAxis.ticks(this.params._xTicks);
      }
      if (this.hasAxisConfig('x', 'formatter')) {
        xAxis = xAxis.tickFormat(this.config.get('axis').x.formatter);
      }
      this.d3.transition().ease(d3Ease.easeLinear).duration(this.params.duration);
      this.d3.select('.axis.x-axis').call(xAxis);

      var labelData = [];
      var labelMargin = 5;
      if (this.hasAxisParam(name, 'labelMargin')) {
        labelMargin = axis.labelMargin;
      }
      var label = this.params.plot.x.labelFormatter || this.params.plot.x.label;
      if (this.hasAxisParam(name, 'label')) label = axis.label;
      if (label) labelData.push(label);

      var axisLabelElements = this.d3.select('.axis.x-axis').selectAll('.axis-label').data(labelData);
      axisLabelElements.enter().append('text').attr('class', 'axis-label').merge(axisLabelElements).attr('x', this.params.xRange[0] + (this.params.xRange[1] - this.params.xRange[0]) / 2).attr('y', this.params.height - this.params.marginTop - labelMargin).text(function (d) {
        return d;
      });
      axisLabelElements.exit().remove();
    }
  }, {
    key: '_renderYAxes',
    value: function _renderYAxes() {
      var _this4 = this;

      // We render the yAxis here because there may be multiple drawings for one axis.
      // The parent has aggregated information about all Y axis.
      var referenceYScale = null;
      var yLabelX = 0;
      var yLabelTransform = 'rotate(-90)';
      _lodash2.default.each(this.params.yAxisInfoArray, function (axisInfo) {
        var yLabelMargin = _this4.config.get('labelMargin');
        if (_this4.hasAxisParam(axisInfo.name, 'labelMargin')) {
          yLabelMargin = _this4.params.axis[axisInfo.name].labelMargin;
        }
        yLabelX = 0 - _this4.params.marginLeft + yLabelMargin;
        yLabelTransform = 'rotate(-90)';
        if (axisInfo.position === 'right') {
          yLabelX = _this4.params.width - _this4.params.marginLeft - yLabelMargin;
          yLabelTransform = 'rotate(90)';
          axisInfo.yAxis = d3Axis.axisRight(_this4.params.axis[axisInfo.name].scale).tickSize(_this4.params.xRange[1] - _this4.params.xRange[0] + 2 * _this4.xMarginInner).tickPadding(5);
        } else {
          axisInfo.yAxis = d3Axis.axisLeft(_this4.params.axis[axisInfo.name].scale).tickSize(-(_this4.params.xRange[1] - _this4.params.xRange[0] + 2 * _this4.xMarginInner)).tickPadding(5);
        }
        if (_this4.hasAxisParam(axisInfo.name, 'ticks')) {
          axisInfo.yAxis = axisInfo.yAxis.ticks(_this4.params.axis[axisInfo.name].ticks);
        }
        if (!referenceYScale) {
          referenceYScale = axisInfo.yAxis.scale();
        } else {
          // This is not the first Y axis so adjust the tick values to the first axis tick values.
          var ticks = referenceYScale.ticks(_this4.params._yTicks);
          if (_this4.hasAxisParam(axisInfo.name, 'ticks')) {
            ticks = referenceYScale.ticks(_this4.params.axis[axisInfo.name].ticks);
          }
          var referenceTickValues = _lodash2.default.map(ticks, function (tickValue) {
            return axisInfo.yAxis.scale().invert(referenceYScale(tickValue));
          });
          axisInfo.yAxis = axisInfo.yAxis.tickValues(referenceTickValues);
        }
        if (_this4.hasAxisConfig(axisInfo.name, 'formatter')) {
          axisInfo.yAxis = axisInfo.yAxis.tickFormat(_this4.config.get('axis')[axisInfo.name].formatter);
        }
        _this4.d3.select('.axis.y-axis.' + axisInfo.name + '-axis').call(axisInfo.yAxis);
        // Y axis label
        var yLabelData = [];
        if (_this4.hasAxisConfig(axisInfo.name, 'label')) {
          yLabelData.push({ label: _this4.config.get('axis')[axisInfo.name].label, x: yLabelX });
        } else {
          var i = 0;
          // There will be one label per unique accessor label displayed on this axis.
          _lodash2.default.each(axisInfo.accessors, function (key) {
            var foundActiveAccessorData = _lodash2.default.find(_this4.params.activeAccessorData, { accessor: key });
            if (!foundActiveAccessorData) return;
            var label = foundActiveAccessorData.labelFormatter || foundActiveAccessorData.label;
            if (!label) return;
            var foundYLabelData = _lodash2.default.find(yLabelData, { label: label });
            if (!foundYLabelData) {
              var yLabelXDelta = _this4.config.get('labelMargin') * i;
              if (axisInfo.position === 'right') {
                yLabelXDelta = -yLabelXDelta;
              }
              yLabelData.push({ label: label, x: yLabelX + yLabelXDelta });
              i++;
            }
          });
        }
        var yAxisLabelSvg = _this4.d3.select('.axis.y-axis.' + axisInfo.name + '-axis').selectAll('.axis-label').data(yLabelData, function (d) {
          return d.label;
        });
        yAxisLabelSvg.enter().append('text').attr('class', 'axis-label').merge(yAxisLabelSvg).attr('transform', function (d) {
          return 'translate(' + d.x + ',' + (_this4.params.yRange[1] + (_this4.params.yRange[0] - _this4.params.yRange[1]) / 2) + ') ' + yLabelTransform;
        }).text(function (d) {
          return d.label;
        });
        yAxisLabelSvg.exit().remove();
      });
    }
    // TODO move to CrosshairConfig

  }, {
    key: 'getCrosshairConfig',
    value: function getCrosshairConfig() {
      var _this5 = this;

      var _x = this.config.get('plot').x;
      var data = {
        bubbles: [],
        // Prepare crosshair bounding box
        x1: this.params.xRange[0],
        x2: this.params.xRange[1],
        y1: this.params.yRange[1],
        y2: this.params.yRange[0]
      };
      var globalXScale = this.params.axis[_x.axis].scale;

      // Prepare x label formatter
      data.xFormat = _lodash2.default.get(this.config, 'attributes.axis.' + _x.axis + '.formatter');
      if (!_lodash2.default.isFunction(data.xFormat)) data.xFormat = d3TimeFormat.timeFormat('%H:%M');

      // Prepare line coordinates
      data.line = {
        x: function x(d) {
          return globalXScale(_lodash2.default.get(d, _x.accessor));
        },
        y1: this.params.yRange[0],
        y2: this.params.yRange[1],
        // Prepare x label text
        text: function text(d) {
          return data.xFormat(_lodash2.default.get(d, _x.accessor));
        }
      };
      // Prepare circle data
      _lodash2.default.each(this._drawings, function (drawing) {
        _lodash2.default.each(drawing.params.activeAccessorData, function (accessor) {
          data.bubbles.push({
            id: accessor.accessor,
            x: function x(d) {
              return drawing.getScreenX(d, _x.accessor);
            },
            y: function y(d) {
              return drawing.getScreenY(d, accessor.accessor);
            },
            color: _this5.config.getColor([], accessor)
          });
        });
      });
      return data;
    }
    /**
     * Works only with incremental values at x scale, as range is set as min / max values for x scale
     * There is no option to set zoomed range by exact position at x scale (start / end)
     */

  }, {
    key: 'zoom',
    value: function zoom(ranges) {
      var _this6 = this;

      var accessorsByAxis = _lodash2.default.groupBy(this.params.activeAccessorData, 'axis');
      accessorsByAxis.x = [{ accessor: this.config.get('plot.x.accessor') }];
      _lodash2.default.each(accessorsByAxis, function (accessors, axisName) {
        var range = d3Array.extent((0, _lodash2.default)(accessors).map(function (accessor) {
          return ranges[accessor.accessor];
        }).flatten().value());
        if (range[0] !== range[1] || _lodash2.default.isNil(range[0])) _lodash2.default.set(_this6.config, 'attributes.axis.' + axisName + '.domain', range);
      });
      this.config.trigger('change', this.config);
    }
    /**
    * Update the drawings array based on the plot.y.
    */

  }, {
    key: '_updateChildDrawings',
    value: function _updateChildDrawings() {
      var _this7 = this;

      var plot = this.config.get('plot');
      if (!plot.x.axis) {
        // Default x axis name.
        plot.x.axis = 'x';
      }
      _lodash2.default.each(plot.y, function (accessor) {
        if (!accessor.axis) {
          // Default y axis name.
          accessor.axis = 'y';
        }
        // if accessor is not set to disabled treat it as enabled
        if (!_lodash2.default.has(accessor, 'enabled')) {
          accessor.enabled = true;
        }
        if (accessor.chart && accessor.enabled) {
          var foundDrawing = _this7.getDrawing(accessor);
          if (!foundDrawing) {
            // The child drawing with this name does not exist yet. Instantiate the child drawing.
            _lodash2.default.each(_this7.possibleChildViews, function (ChildView, chartType) {
              if (chartType === accessor.chart) {
                var params = _lodash2.default.extend({}, _this7.config.attributes, {
                  isPrimary: false,
                  axisName: accessor.axis
                });
                var compositeYConfig = new _CompositeYChartConfigModel2.default(params);
                foundDrawing = new ChildView({
                  model: _this7.model,
                  config: compositeYConfig,
                  container: _this7._container,
                  parent: _this7
                });
                _this7._drawings.push(foundDrawing);
              }
            });
          }
        }
      });
      // Order the drawings so the highest order drawings get rendered first.
      this._drawings.sort(function (a, b) {
        return a.renderOrder - b.renderOrder;
      });
      _lodash2.default.each(this._drawings, function (drawing) {
        drawing.resetParams();
      });
    }

    // Event handlers

  }, {
    key: '_onConfigModelChange',
    value: function _onConfigModelChange() {
      var _this8 = this;

      _lodash2.default.each(this._drawings, function (drawing) {
        drawing.config.set(_this8.config.attributes);
      });
      this.render();
    }
  }, {
    key: '_onMousemove',
    value: function _onMousemove(d, el, e) {
      var point = [e.offsetX, e.offsetY];
      if (!this._ticking) {
        window.requestAnimationFrame(this.showCrosshair.bind(this, point));
        this._ticking = true;
      }
    }
  }, {
    key: 'tagName',
    get: function get() {
      return 'g';
    }
  }, {
    key: 'possibleChildViews',
    get: function get() {
      return {
        LineChart: _LineChartView2.default,
        AreaChart: _AreaChartView2.default,
        BarChart: _GroupedBarChartView2.default,
        StackedBarChart: _StackedBarChartView2.default,
        ScatterPlot: _ScatterPlotView2.default
      };
    }
  }, {
    key: 'xMarginInner',
    get: function get() {
      return this.config.get('marginInner') + this.params.xMarginInner;
    }
    /**
     * @return {String} id of element to clip the visible area
     */

  }, {
    key: 'clip',
    get: function get() {
      return 'rect-clipPath-' + this.id;
    }
  }]);

  return CompositeYChartView;
}(_contrailChartsView2.default);

exports.default = CompositeYChartView;

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var BrushConfigModel = function (_ContrailChartsConfig) {
  _inherits(BrushConfigModel, _ContrailChartsConfig);

  function BrushConfigModel() {
    _classCallCheck(this, BrushConfigModel);

    return _possibleConstructorReturn(this, (BrushConfigModel.__proto__ || Object.getPrototypeOf(BrushConfigModel)).apply(this, arguments));
  }

  _createClass(BrushConfigModel, [{
    key: 'selection',

    /**
     * Brush selection in percentage [xMin%, xMax%]
     */
    get: function get() {
      return this.attributes.selection || [];
    }
  }, {
    key: 'duration',
    get: function get() {
      return this.attributes.duration;
    }
  }, {
    key: 'handleHeight',
    get: function get() {
      return this.has('handleHeight') ? this.attributes.handleHeight : 16;
    }
  }, {
    key: 'handleCenter',
    get: function get() {
      return this.attributes.yRange[1] / 2 + this.attributes.yRange[0] / 2;
    }
  }, {
    key: 'extent',
    get: function get() {
      return [[this.attributes.xRange[0], this.attributes.yRange[1]], [this.attributes.xRange[1], this.attributes.yRange[0]]];
    }
  }]);

  return BrushConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = BrushConfigModel;

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3Shape = __webpack_require__(0);

var d3Shape = _interopRequireWildcard(_d3Shape);

var _d3Brush = __webpack_require__(0);

var d3Brush = _interopRequireWildcard(_d3Brush);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

__webpack_require__(191);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var BrushView = function (_ContrailChartsView) {
  _inherits(BrushView, _ContrailChartsView);

  function BrushView(p) {
    _classCallCheck(this, BrushView);

    var _this = _possibleConstructorReturn(this, (BrushView.__proto__ || Object.getPrototypeOf(BrushView)).call(this, p));

    _this._brush = d3Brush.brushX().on('start brush end', _this._onSelection.bind(_this));
    _this.listenTo(_this.config, 'change', _this.render);
    return _this;
  }

  _createClass(BrushView, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      _get(BrushView.prototype.__proto__ || Object.getPrototypeOf(BrushView.prototype), 'render', this).call(this);
      this._brush.extent(this.config.extent).handleSize(10);

      var yRange = this.config.get('yRange');
      this.d3.selectAll(this.selectors.unselected).data([{ type: 'w' }, { type: 'e' }]).enter().append('rect').attr('class', function (d) {
        return _this2.selectorClass('unselected') + '-' + d.type;
      }).classed('hide', true).classed(this.selectorClass('unselected'), true).attr('y', yRange[1]).attr('height', yRange[0] - yRange[1]);

      this.d3.selectAll(this.selectors.handle).data([{ type: 'w' }, { type: 'e' }]).enter().append('path').classed('hide', true).classed(this.selectorClass('handle'), true).attr('d', d3Shape.arc().innerRadius(0).outerRadius(this.config.handleHeight / 2).startAngle(0).endAngle(function (d, i) {
        return i ? Math.PI : -Math.PI;
      }));
      this.d3.call(this._brush);

      var brushGroup = this.d3.transition().ease(d3Ease.easeLinear).duration(this.config.duration);
      this._brush.move(brushGroup, this.config.selection);
    }
  }, {
    key: 'show',
    value: function show(selection) {
      var _this3 = this;

      var xRange = this.config.get('xRange');
      this.d3.selectAll(this.selectors.unselected).classed('hide', false).attr('x', function (d) {
        return d.type === 'w' ? xRange[0] : selection[1];
      }).attr('width', function (d) {
        return d.type === 'w' ? selection[0] - xRange[0] : xRange[1] - selection[1];
      });

      this.d3.selectAll(this.selectors.handle).classed('hide', false).attr('transform', function (d, i) {
        return 'translate(' + selection[i] + ',' + _this3.config.handleCenter + ') scale(1,2)';
      });
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.d3.selectAll(this.selectors.handle).classed('hide', true);
      this.d3.selectAll(this.selectors.unselected).classed('hide', true);
    }

    // Event handlers

  }, {
    key: '_onSelection',
    value: function _onSelection() {
      var _this4 = this;

      var selection = d3Selection.event.selection;
      var xRange = this.config.get('xRange');

      if (!selection) return this.hide();else this.show(selection);

      this.config.set('selection', selection, { silent: true });
      // selection is removed when clicking outside a brush
      if (selection[0] === selection[1]) {
        var _xRange = this.config.get('xRange');
        selection = [_xRange[0], _xRange[1]];
      }
      if (_lodash2.default.isEqual(selection, xRange)) {
        setTimeout(function () {
          return _this4._brush.move(_this4.d3);
        });
      }

      this.trigger('selection', selection);
    }
  }, {
    key: 'tagName',
    get: function get() {
      return 'g';
    }
  }, {
    key: 'zIndex',
    get: function get() {
      return 9;
    }
  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(BrushView.prototype.__proto__ || Object.getPrototypeOf(BrushView.prototype), 'selectors', this), {
        handle: '.handle--custom',
        unselected: '.unselected'
      });
    }
  }]);

  return BrushView;
}(_contrailChartsView2.default);

exports.default = BrushView;

/***/ }),
/* 47 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_timer__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_timer___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__src_timer__);
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_0__src_timer__, "now")) __webpack_require__.d(__webpack_exports__, "now", function() { return __WEBPACK_IMPORTED_MODULE_0__src_timer__["now"]; });
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_0__src_timer__, "timer")) __webpack_require__.d(__webpack_exports__, "timer", function() { return __WEBPACK_IMPORTED_MODULE_0__src_timer__["timer"]; });
/* harmony reexport (binding) */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_0__src_timer__, "timerFlush")) __webpack_require__.d(__webpack_exports__, "timerFlush", function() { return __WEBPACK_IMPORTED_MODULE_0__src_timer__["timerFlush"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_timeout__ = __webpack_require__(92);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_timeout___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__src_timeout__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "timeout", function() { return __WEBPACK_IMPORTED_MODULE_1__src_timeout___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_interval__ = __webpack_require__(91);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_interval___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__src_interval__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interval", function() { return __WEBPACK_IMPORTED_MODULE_2__src_interval___default.a; });







/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_selection_index__ = __webpack_require__(94);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_selection_index___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__src_selection_index__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_transition_index__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_transition_index___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__src_transition_index__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "transition", function() { return __WEBPACK_IMPORTED_MODULE_1__src_transition_index___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_active__ = __webpack_require__(93);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_active___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__src_active__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "active", function() { return __WEBPACK_IMPORTED_MODULE_2__src_active___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__src_interrupt__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__src_interrupt___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__src_interrupt__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "interrupt", function() { return __WEBPACK_IMPORTED_MODULE_3__src_interrupt___default.a; });






/***/ }),
/* 49 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = __webpack_require__(7);

var _exception = __webpack_require__(15);

var _exception2 = _interopRequireDefault(_exception);

var _helpers = __webpack_require__(206);

var _decorators = __webpack_require__(204);

var _logger = __webpack_require__(214);

var _logger2 = _interopRequireDefault(_logger);

var VERSION = '4.0.5';
exports.VERSION = VERSION;
var COMPILER_REVISION = 7;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1',
  7: '>= 4.0.0'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials, decorators) {
  this.helpers = helpers || {};
  this.partials = partials || {};
  this.decorators = decorators || {};

  _helpers.registerDefaultHelpers(this);
  _decorators.registerDefaultDecorators(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: _logger2['default'],
  log: _logger2['default'].log,

  registerHelper: function registerHelper(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple helpers');
      }
      _utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (_utils.toString.call(name) === objectType) {
      _utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  },

  registerDecorator: function registerDecorator(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple decorators');
      }
      _utils.extend(this.decorators, name);
    } else {
      this.decorators[name] = fn;
    }
  },
  unregisterDecorator: function unregisterDecorator(name) {
    delete this.decorators[name];
  }
};

var log = _logger2['default'].log;

exports.log = log;
exports.createFrame = _utils.createFrame;
exports.logger = _logger2['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7cUJBQTRDLFNBQVM7O3lCQUMvQixhQUFhOzs7O3VCQUNFLFdBQVc7OzBCQUNSLGNBQWM7O3NCQUNuQyxVQUFVOzs7O0FBRXRCLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQzs7QUFDeEIsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7OztBQUU1QixJQUFNLGdCQUFnQixHQUFHO0FBQzlCLEdBQUMsRUFBRSxhQUFhO0FBQ2hCLEdBQUMsRUFBRSxlQUFlO0FBQ2xCLEdBQUMsRUFBRSxlQUFlO0FBQ2xCLEdBQUMsRUFBRSxVQUFVO0FBQ2IsR0FBQyxFQUFFLGtCQUFrQjtBQUNyQixHQUFDLEVBQUUsaUJBQWlCO0FBQ3BCLEdBQUMsRUFBRSxVQUFVO0NBQ2QsQ0FBQzs7O0FBRUYsSUFBTSxVQUFVLEdBQUcsaUJBQWlCLENBQUM7O0FBRTlCLFNBQVMscUJBQXFCLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUU7QUFDbkUsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO0FBQzdCLE1BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxJQUFJLEVBQUUsQ0FBQztBQUMvQixNQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsSUFBSSxFQUFFLENBQUM7O0FBRW5DLGtDQUF1QixJQUFJLENBQUMsQ0FBQztBQUM3Qix3Q0FBMEIsSUFBSSxDQUFDLENBQUM7Q0FDakM7O0FBRUQscUJBQXFCLENBQUMsU0FBUyxHQUFHO0FBQ2hDLGFBQVcsRUFBRSxxQkFBcUI7O0FBRWxDLFFBQU0scUJBQVE7QUFDZCxLQUFHLEVBQUUsb0JBQU8sR0FBRzs7QUFFZixnQkFBYyxFQUFFLHdCQUFTLElBQUksRUFBRSxFQUFFLEVBQUU7QUFDakMsUUFBSSxnQkFBUyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssVUFBVSxFQUFFO0FBQ3RDLFVBQUksRUFBRSxFQUFFO0FBQUUsY0FBTSwyQkFBYyx5Q0FBeUMsQ0FBQyxDQUFDO09BQUU7QUFDM0Usb0JBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM1QixNQUFNO0FBQ0wsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDekI7R0FDRjtBQUNELGtCQUFnQixFQUFFLDBCQUFTLElBQUksRUFBRTtBQUMvQixXQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDM0I7O0FBRUQsaUJBQWUsRUFBRSx5QkFBUyxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3ZDLFFBQUksZ0JBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVUsRUFBRTtBQUN0QyxvQkFBTyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzdCLE1BQU07QUFDTCxVQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsRUFBRTtBQUNsQyxjQUFNLHlFQUEwRCxJQUFJLG9CQUFpQixDQUFDO09BQ3ZGO0FBQ0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7S0FDL0I7R0FDRjtBQUNELG1CQUFpQixFQUFFLDJCQUFTLElBQUksRUFBRTtBQUNoQyxXQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDNUI7O0FBRUQsbUJBQWlCLEVBQUUsMkJBQVMsSUFBSSxFQUFFLEVBQUUsRUFBRTtBQUNwQyxRQUFJLGdCQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLEVBQUU7QUFDdEMsVUFBSSxFQUFFLEVBQUU7QUFBRSxjQUFNLDJCQUFjLDRDQUE0QyxDQUFDLENBQUM7T0FBRTtBQUM5RSxvQkFBTyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQy9CLE1BQU07QUFDTCxVQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUM1QjtHQUNGO0FBQ0QscUJBQW1CLEVBQUUsNkJBQVMsSUFBSSxFQUFFO0FBQ2xDLFdBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM5QjtDQUNGLENBQUM7O0FBRUssSUFBSSxHQUFHLEdBQUcsb0JBQU8sR0FBRyxDQUFDOzs7UUFFcEIsV0FBVztRQUFFLE1BQU0iLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y3JlYXRlRnJhbWUsIGV4dGVuZCwgdG9TdHJpbmd9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuL2V4Y2VwdGlvbic7XG5pbXBvcnQge3JlZ2lzdGVyRGVmYXVsdEhlbHBlcnN9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQge3JlZ2lzdGVyRGVmYXVsdERlY29yYXRvcnN9IGZyb20gJy4vZGVjb3JhdG9ycyc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcblxuZXhwb3J0IGNvbnN0IFZFUlNJT04gPSAnNC4wLjUnO1xuZXhwb3J0IGNvbnN0IENPTVBJTEVSX1JFVklTSU9OID0gNztcblxuZXhwb3J0IGNvbnN0IFJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPT0gMS54LngnLFxuICA1OiAnPT0gMi4wLjAtYWxwaGEueCcsXG4gIDY6ICc+PSAyLjAuMC1iZXRhLjEnLFxuICA3OiAnPj0gNC4wLjAnXG59O1xuXG5jb25zdCBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBIYW5kbGViYXJzRW52aXJvbm1lbnQoaGVscGVycywgcGFydGlhbHMsIGRlY29yYXRvcnMpIHtcbiAgdGhpcy5oZWxwZXJzID0gaGVscGVycyB8fCB7fTtcbiAgdGhpcy5wYXJ0aWFscyA9IHBhcnRpYWxzIHx8IHt9O1xuICB0aGlzLmRlY29yYXRvcnMgPSBkZWNvcmF0b3JzIHx8IHt9O1xuXG4gIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnModGhpcyk7XG4gIHJlZ2lzdGVyRGVmYXVsdERlY29yYXRvcnModGhpcyk7XG59XG5cbkhhbmRsZWJhcnNFbnZpcm9ubWVudC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBIYW5kbGViYXJzRW52aXJvbm1lbnQsXG5cbiAgbG9nZ2VyOiBsb2dnZXIsXG4gIGxvZzogbG9nZ2VyLmxvZyxcblxuICByZWdpc3RlckhlbHBlcjogZnVuY3Rpb24obmFtZSwgZm4pIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGZuKSB7IHRocm93IG5ldyBFeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpOyB9XG4gICAgICBleHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMuaGVscGVyc1tuYW1lXTtcbiAgfSxcblxuICByZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uKG5hbWUsIHBhcnRpYWwpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgZXh0ZW5kKHRoaXMucGFydGlhbHMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHBhcnRpYWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oYEF0dGVtcHRpbmcgdG8gcmVnaXN0ZXIgYSBwYXJ0aWFsIGNhbGxlZCBcIiR7bmFtZX1cIiBhcyB1bmRlZmluZWRgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBwYXJ0aWFsO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5wYXJ0aWFsc1tuYW1lXTtcbiAgfSxcblxuICByZWdpc3RlckRlY29yYXRvcjogZnVuY3Rpb24obmFtZSwgZm4pIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGZuKSB7IHRocm93IG5ldyBFeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgZGVjb3JhdG9ycycpOyB9XG4gICAgICBleHRlbmQodGhpcy5kZWNvcmF0b3JzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZWNvcmF0b3JzW25hbWVdID0gZm47XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVyRGVjb3JhdG9yOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMuZGVjb3JhdG9yc1tuYW1lXTtcbiAgfVxufTtcblxuZXhwb3J0IGxldCBsb2cgPSBsb2dnZXIubG9nO1xuXG5leHBvcnQge2NyZWF0ZUZyYW1lLCBsb2dnZXJ9O1xuIl19


/***/ }),
/* 51 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_51__;

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _index = __webpack_require__(30);

var Components = _interopRequireWildcard(_index);

var _index2 = __webpack_require__(32);

var Providers = _interopRequireWildcard(_index2);

var _index3 = __webpack_require__(29);

var Actions = _interopRequireWildcard(_index3);

var _TitleView = __webpack_require__(27);

var _TitleView2 = _interopRequireDefault(_TitleView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
*/
var ChartView = function () {
  function ChartView(p) {
    _classCallCheck(this, ChartView);

    this._components = [];
  }
  /**
  * Provide data for this chart as a simple array of objects.
  */


  _createClass(ChartView, [{
    key: 'setData',
    value: function setData(data) {
      if (this.frozen) return;
      if (!_lodash2.default.isArray(data)) return;
      (0, _lodash2.default)(this._components).map(function (c) {
        return c.model;
      }).uniq().compact().each(function (m) {
        m.data = data;
      });
    }
    /**
     * Sets the configuration for this chart as a simple object.
     * Instantiate the required views if they do not exist yet, set their configurations otherwise.
     * Updating configuration to a rendered chart will trigger a ConfigModel change event that will cause the chart to be re-rendered.
     * calling setConfig on already rendered chart will reset the chart.
     */

  }, {
    key: 'setConfig',
    value: function setConfig(config) {
      var _this = this;

      if (this._config) this.remove();
      this._config = _lodash2.default.cloneDeep(config);
      /**
       * Let's register actions here.
       * Doing this in the constructor causes actions to be registered for views which may not have setConfig invoked,
       * causing multiple chart instance scenarios having actions bound to registars not active in the dom.
       * Since action is singleton and some actions trigger on all registrar, we need to avoid above mentioned scenario.
       */
      _lodash2.default.each(Actions, function (action) {
        return _Actionman2.default.set(action, _this);
      });

      // create common provider for all components to prepare (format) data just once
      if (config.provider && config.provider.type) {
        this._provider = new [config.provider.type + 'Provider'](config.provider.config);
      }
      this._initComponents();
    }
    /**
     * Get component by id
     * @param {String} id
     */

  }, {
    key: 'getComponent',
    value: function getComponent(id) {
      return _lodash2.default.find(this._components, { id: id });
    }
    /**
     * Get array of components by type
     * @return {Array}
     */

  }, {
    key: 'getComponentsByType',
    value: function getComponentsByType(type) {
      return _lodash2.default.filter(this._components, { type: type });
    }
  }, {
    key: 'render',
    value: function render() {
      _lodash2.default.each(this._components, function (component) {
        component.render();
      });
    }
    /**
     * Removes chart view and its components.
     * All actions will be unregistered, individual components will be removed except the parent container.
     */

  }, {
    key: 'remove',
    value: function remove() {
      var _this2 = this;

      _lodash2.default.each(Actions, function (action) {
        return _Actionman2.default.unset(action, _this2);
      });
      _lodash2.default.each(this._components, function (component) {
        return component.remove();
      });
      this._components = [];
    }
  }, {
    key: 'renderMessage',
    value: function renderMessage(msgObj) {
      _Actionman2.default.fire('SendMessage', msgObj);
    }
  }, {
    key: 'clearMessage',
    value: function clearMessage(componentId) {
      // To clear messages for a given component we send a message with 'update' action and an empty array of messages.
      var msgObj = {
        componentId: componentId,
        action: 'update',
        messages: []
      };
      _Actionman2.default.fire('ClearMessage', msgObj);
    }
    /**
     * Initialize configured components
     */

  }, {
    key: '_initComponents',
    value: function _initComponents() {
      var _this3 = this;

      // Apply template
      this._container = document.querySelector('#' + this._config.id);
      if (this._config.template) {
        var template = document.createElement('template');
        template.innerHTML = this._config.template();
        // some components require container to have id
        _lodash2.default.each(template.content.querySelectorAll('[component]'), function (el) {
          el.setAttribute('id', 'cc-' + el.getAttribute('component'));
        });
        this._container.append(document.importNode(template.content, true));
      }
      if (this._config.title) (0, _TitleView2.default)(this._container, this._config.title);

      _lodash2.default.each(this._config.components, function (component, index) {
        component.config.order = index;
        component.config.id = component.id;
      });

      var _$partition = _lodash2.default.partition(this._config.components, function (c) {
        return c.config.sourceComponent;
      }),
          _$partition2 = _slicedToArray(_$partition, 2),
          dependent = _$partition2[0],
          independent = _$partition2[1];

      _lodash2.default.each(independent, function (component) {
        return _this3._registerComponent(component);
      });
      _lodash2.default.each(dependent, function (component) {
        var sourceComponent = _this3.getComponent(component.config.sourceComponent);
        var componentView = _this3._registerComponent(component, sourceComponent.model);
        componentView.config.parent = sourceComponent.config;
      });
    }
    /**
     * Initialize individual component
     * @param {String} type
     * @param {Object} config
     * @param {Object} providerConfig
     * @param {Provider} model optional for dependent components
     */

  }, {
    key: '_registerComponent',
    value: function _registerComponent(_ref, model) {
      var type = _ref.type,
          config = _ref.config,
          providerConfig = _ref.provider;

      if (!this._isEnabledComponent(type)) return false;
      var Component = Components[type + 'View'];
      var ConfigModel = Components[type + 'ConfigModel'];
      var Provider = Providers[Component.dataType + 'Provider'];

      var configModel = void 0;
      if (ConfigModel) configModel = new ConfigModel(config);
      var container = this._container.querySelector('[component="' + (config.container || config.id) + '"]');
      model = model || this._provider;
      if (Provider && (!model || providerConfig)) model = new Provider(null, providerConfig);

      // Share first initialized provider with all other components
      if (!this._provider) this._provider = model;
      var viewOptions = {
        id: config.id,
        config: configModel,
        model: model,
        container: container || this._container
      };
      var component = new Component(viewOptions);
      this._components.push(component);

      return component;
    }
  }, {
    key: '_isEnabled',
    value: function _isEnabled(config, type) {
      var foundConfig = _lodash2.default.find(config, { type: type });
      if (!foundConfig) return false;
      if (_lodash2.default.isObject(foundConfig.config)) {
        return !(foundConfig.config.enable === false);
      }
      return false;
    }

    // TODO this is not enough specific

  }, {
    key: '_isEnabledComponent',
    value: function _isEnabledComponent(type) {
      return this._isEnabled(this._config.components, type);
    }
  }]);

  return ChartView;
}();

exports.default = ChartView;

/***/ }),
/* 53 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var slice = exports.slice = Array.prototype.slice;

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var padAngle = 0,
      sortGroups = null,
      sortSubgroups = null,
      sortChords = null;

  function chord(matrix) {
    var n = matrix.length,
        groupSums = [],
        groupIndex = (0, _d3Array.range)(n),
        subgroupIndex = [],
        chords = [],
        groups = chords.groups = new Array(n),
        subgroups = new Array(n * n),
        k,
        x,
        x0,
        dx,
        i,
        j;

    // Compute the sum.
    k = 0, i = -1;while (++i < n) {
      x = 0, j = -1;while (++j < n) {
        x += matrix[i][j];
      }
      groupSums.push(x);
      subgroupIndex.push((0, _d3Array.range)(n));
      k += x;
    }

    // Sort groups…
    if (sortGroups) groupIndex.sort(function (a, b) {
      return sortGroups(groupSums[a], groupSums[b]);
    });

    // Sort subgroups…
    if (sortSubgroups) subgroupIndex.forEach(function (d, i) {
      d.sort(function (a, b) {
        return sortSubgroups(matrix[i][a], matrix[i][b]);
      });
    });

    // Convert the sum to scaling factor for [0, 2pi].
    // TODO Allow start and end angle to be specified?
    // TODO Allow padding to be specified as percentage?
    k = (0, _math.max)(0, _math.tau - padAngle * n) / k;
    dx = k ? padAngle : _math.tau / n;

    // Compute the start and end angle for each group and subgroup.
    // Note: Opera has a bug reordering object literal properties!
    x = 0, i = -1;while (++i < n) {
      x0 = x, j = -1;while (++j < n) {
        var di = groupIndex[i],
            dj = subgroupIndex[di][j],
            v = matrix[di][dj],
            a0 = x,
            a1 = x += v * k;
        subgroups[dj * n + di] = {
          index: di,
          subindex: dj,
          startAngle: a0,
          endAngle: a1,
          value: v
        };
      }
      groups[di] = {
        index: di,
        startAngle: x0,
        endAngle: x,
        value: groupSums[di]
      };
      x += dx;
    }

    // Generate chords for each (non-empty) subgroup-subgroup link.
    i = -1;while (++i < n) {
      j = i - 1;while (++j < n) {
        var source = subgroups[j * n + i],
            target = subgroups[i * n + j];
        if (source.value || target.value) {
          chords.push(source.value < target.value ? { source: target, target: source } : { source: source, target: target });
        }
      }
    }

    return sortChords ? chords.sort(sortChords) : chords;
  }

  chord.padAngle = function (_) {
    return arguments.length ? (padAngle = (0, _math.max)(0, _), chord) : padAngle;
  };

  chord.sortGroups = function (_) {
    return arguments.length ? (sortGroups = _, chord) : sortGroups;
  };

  chord.sortSubgroups = function (_) {
    return arguments.length ? (sortSubgroups = _, chord) : sortSubgroups;
  };

  chord.sortChords = function (_) {
    return arguments.length ? (_ == null ? sortChords = null : (sortChords = compareValue(_))._ = _, chord) : sortChords && sortChords._;
  };

  return chord;
};

var _d3Array = __webpack_require__(0);

var _math = __webpack_require__(33);

function compareValue(compare) {
  return function (a, b) {
    return compare(a.source.value + a.target.value, b.source.value + b.target.value);
  };
}

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (x) {
  return function () {
    return x;
  };
};

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var source = defaultSource,
      target = defaultTarget,
      radius = defaultRadius,
      startAngle = defaultStartAngle,
      endAngle = defaultEndAngle,
      context = null;

  function ribbon() {
    var buffer,
        argv = _array.slice.call(arguments),
        s = source.apply(this, argv),
        t = target.apply(this, argv),
        sr = +radius.apply(this, (argv[0] = s, argv)),
        sa0 = startAngle.apply(this, argv) - _math.halfPi,
        sa1 = endAngle.apply(this, argv) - _math.halfPi,
        sx0 = sr * (0, _math.cos)(sa0),
        sy0 = sr * (0, _math.sin)(sa0),
        tr = +radius.apply(this, (argv[0] = t, argv)),
        ta0 = startAngle.apply(this, argv) - _math.halfPi,
        ta1 = endAngle.apply(this, argv) - _math.halfPi;

    if (!context) context = buffer = (0, _d3Path.path)();

    context.moveTo(sx0, sy0);
    context.arc(0, 0, sr, sa0, sa1);
    if (sa0 !== ta0 || sa1 !== ta1) {
      // TODO sr !== tr?
      context.quadraticCurveTo(0, 0, tr * (0, _math.cos)(ta0), tr * (0, _math.sin)(ta0));
      context.arc(0, 0, tr, ta0, ta1);
    }
    context.quadraticCurveTo(0, 0, sx0, sy0);
    context.closePath();

    if (buffer) return context = null, buffer + "" || null;
  }

  ribbon.radius = function (_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : (0, _constant2.default)(+_), ribbon) : radius;
  };

  ribbon.startAngle = function (_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : (0, _constant2.default)(+_), ribbon) : startAngle;
  };

  ribbon.endAngle = function (_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : (0, _constant2.default)(+_), ribbon) : endAngle;
  };

  ribbon.source = function (_) {
    return arguments.length ? (source = _, ribbon) : source;
  };

  ribbon.target = function (_) {
    return arguments.length ? (target = _, ribbon) : target;
  };

  ribbon.context = function (_) {
    return arguments.length ? (context = _ == null ? null : _, ribbon) : context;
  };

  return ribbon;
};

var _array = __webpack_require__(54);

var _constant = __webpack_require__(56);

var _constant2 = _interopRequireDefault(_constant);

var _math = __webpack_require__(33);

var _d3Path = __webpack_require__(171);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function defaultSource(d) {
  return d.source;
}

function defaultTarget(d) {
  return d.target;
}

function defaultRadius(d) {
  return d.radius;
}

function defaultStartAngle(d) {
  return d.startAngle;
}

function defaultEndAngle(d) {
  return d.endAngle;
}

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (map) {
  var entries = [];
  for (var key in map) {
    entries.push({ key: key, value: map[key] });
  }return entries;
};

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (map) {
  var keys = [];
  for (var key in map) {
    keys.push(key);
  }return keys;
};

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var keys = [],
      _sortKeys = [],
      _sortValues,
      _rollup,
      nest;

  function apply(array, depth, createResult, setResult) {
    if (depth >= keys.length) return _rollup != null ? _rollup(array) : _sortValues != null ? array.sort(_sortValues) : array;

    var i = -1,
        n = array.length,
        key = keys[depth++],
        keyValue,
        value,
        valuesByKey = (0, _map2.default)(),
        values,
        result = createResult();

    while (++i < n) {
      if (values = valuesByKey.get(keyValue = key(value = array[i]) + "")) {
        values.push(value);
      } else {
        valuesByKey.set(keyValue, [value]);
      }
    }

    valuesByKey.each(function (values, key) {
      setResult(result, key, apply(values, depth, createResult, setResult));
    });

    return result;
  }

  function _entries(map, depth) {
    if (++depth > keys.length) return map;
    var array,
        sortKey = _sortKeys[depth - 1];
    if (_rollup != null && depth >= keys.length) array = map.entries();else array = [], map.each(function (v, k) {
      array.push({ key: k, values: _entries(v, depth) });
    });
    return sortKey != null ? array.sort(function (a, b) {
      return sortKey(a.key, b.key);
    }) : array;
  }

  return nest = {
    object: function object(array) {
      return apply(array, 0, createObject, setObject);
    },
    map: function map(array) {
      return apply(array, 0, createMap, setMap);
    },
    entries: function entries(array) {
      return _entries(apply(array, 0, createMap, setMap), 0);
    },
    key: function key(d) {
      keys.push(d);return nest;
    },
    sortKeys: function sortKeys(order) {
      _sortKeys[keys.length - 1] = order;return nest;
    },
    sortValues: function sortValues(order) {
      _sortValues = order;return nest;
    },
    rollup: function rollup(f) {
      _rollup = f;return nest;
    }
  };
};

var _map = __webpack_require__(19);

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createObject() {
  return {};
}

function setObject(object, key, value) {
  object[key] = value;
}

function createMap() {
  return (0, _map2.default)();
}

function setMap(map, key, value) {
  map.set(key, value);
}

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = __webpack_require__(19);

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Set() {}

var proto = _map2.default.prototype;

Set.prototype = set.prototype = {
  constructor: Set,
  has: proto.has,
  add: function add(value) {
    value += "";
    this[_map.prefix + value] = value;
    return this;
  },
  remove: proto.remove,
  clear: proto.clear,
  values: proto.keys,
  size: proto.size,
  empty: proto.empty,
  each: proto.each
};

function set(object, f) {
  var set = new Set();

  // Copy constructor.
  if (object instanceof Set) object.each(function (value) {
    set.add(value);
  });

  // Otherwise, assume it’s an array.
  else if (object) {
      var i = -1,
          n = object.length;
      if (f == null) while (++i < n) {
        set.add(object[i]);
      } else while (++i < n) {
        set.add(f(object[i], i, object));
      }
    }

  return set;
}

exports.default = set;

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (map) {
  var values = [];
  for (var key in map) {
    values.push(map[key]);
  }return values;
};

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cubehelix;
exports.Cubehelix = Cubehelix;

var _define = __webpack_require__(21);

var _define2 = _interopRequireDefault(_define);

var _color = __webpack_require__(20);

var _math = __webpack_require__(34);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var A = -0.14861,
    B = +1.78277,
    C = -0.29227,
    D = -0.90649,
    E = +1.97294,
    ED = E * D,
    EB = E * B,
    BC_DA = B * C - D * A;

function cubehelixConvert(o) {
  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof _color.Rgb)) o = (0, _color.rgbConvert)(o);
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
      bl = b - l,
      k = (E * (g - l) - C * bl) / D,
      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)),
      // NaN if l=0 or l=1
  h = s ? Math.atan2(k, bl) * _math.rad2deg - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
}

function cubehelix(h, s, l, opacity) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
}

function Cubehelix(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

(0, _define2.default)(Cubehelix, cubehelix, (0, _define.extend)(_color.Color, {
  brighter: function brighter(k) {
    k = k == null ? _color.brighter : Math.pow(_color.brighter, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function darker(k) {
    k = k == null ? _color.darker : Math.pow(_color.darker, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function rgb() {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * _math.deg2rad,
        l = +this.l,
        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
        cosh = Math.cos(h),
        sinh = Math.sin(h);
    return new _color.Rgb(255 * (l + a * (A * cosh + B * sinh)), 255 * (l + a * (C * cosh + D * sinh)), 255 * (l + a * (E * cosh)), this.opacity);
  }
}));

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = lab;
exports.Lab = Lab;
exports.hcl = hcl;
exports.Hcl = Hcl;

var _define = __webpack_require__(21);

var _define2 = _interopRequireDefault(_define);

var _color = __webpack_require__(20);

var _math = __webpack_require__(34);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Kn = 18,
    Xn = 0.950470,
    // D65 standard referent
Yn = 1,
    Zn = 1.088830,
    t0 = 4 / 29,
    t1 = 6 / 29,
    t2 = 3 * t1 * t1,
    t3 = t1 * t1 * t1;

function labConvert(o) {
  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
  if (o instanceof Hcl) {
    var h = o.h * _math.deg2rad;
    return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
  }
  if (!(o instanceof _color.Rgb)) o = (0, _color.rgbConvert)(o);
  var b = rgb2xyz(o.r),
      a = rgb2xyz(o.g),
      l = rgb2xyz(o.b),
      x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
      y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
      z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);
  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
}

function lab(l, a, b, opacity) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
}

function Lab(l, a, b, opacity) {
  this.l = +l;
  this.a = +a;
  this.b = +b;
  this.opacity = +opacity;
}

(0, _define2.default)(Lab, lab, (0, _define.extend)(_color.Color, {
  brighter: function brighter(k) {
    return new Lab(this.l + Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  darker: function darker(k) {
    return new Lab(this.l - Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  rgb: function rgb() {
    var y = (this.l + 16) / 116,
        x = isNaN(this.a) ? y : y + this.a / 500,
        z = isNaN(this.b) ? y : y - this.b / 200;
    y = Yn * lab2xyz(y);
    x = Xn * lab2xyz(x);
    z = Zn * lab2xyz(z);
    return new _color.Rgb(xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
    xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z), xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z), this.opacity);
  }
}));

function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}

function xyz2rgb(x) {
  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}

function rgb2xyz(x) {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function hclConvert(o) {
  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
  if (!(o instanceof Lab)) o = labConvert(o);
  var h = Math.atan2(o.b, o.a) * _math.rad2deg;
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}

function hcl(h, c, l, opacity) {
  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
}

function Hcl(h, c, l, opacity) {
  this.h = +h;
  this.c = +c;
  this.l = +l;
  this.opacity = +opacity;
}

(0, _define2.default)(Hcl, hcl, (0, _define.extend)(_color.Color, {
  brighter: function brighter(k) {
    return new Hcl(this.h, this.c, this.l + Kn * (k == null ? 1 : k), this.opacity);
  },
  darker: function darker(k) {
    return new Hcl(this.h, this.c, this.l - Kn * (k == null ? 1 : k), this.opacity);
  },
  rgb: function rgb() {
    return labConvert(this).rgb();
  }
}));

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var noop = { value: function value() {} };

function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}

function Dispatch(_) {
  this._ = _;
}

function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function (t) {
    var name = "",
        i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name: name };
  });
}

Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function on(typename, callback) {
    var _ = this._,
        T = parseTypenames(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) {
        if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      }return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);else if (callback == null) for (t in _) {
        _[t] = set(_[t], typename.name, null);
      }
    }

    return this;
  },
  copy: function copy() {
    var copy = {},
        _ = this._;
    for (var t in _) {
      copy[t] = _[t].slice();
    }return new Dispatch(copy);
  },
  call: function call(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) {
      args[i] = arguments[i + 2];
    }if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) {
      t[i].value.apply(that, args);
    }
  },
  apply: function apply(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) {
      t[i].value.apply(that, args);
    }
  }
};

function get(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({ name: name, value: callback });
  return type;
}

exports.default = dispatch;

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cubehelixLong = undefined;

var _d3Color = __webpack_require__(11);

var _color = __webpack_require__(12);

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cubehelix(hue) {
  return function cubehelixGamma(y) {
    y = +y;

    function cubehelix(start, end) {
      var h = hue((start = (0, _d3Color.cubehelix)(start)).h, (end = (0, _d3Color.cubehelix)(end)).h),
          s = (0, _color2.default)(start.s, end.s),
          l = (0, _color2.default)(start.l, end.l),
          opacity = (0, _color2.default)(start.opacity, end.opacity);
      return function (t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y));
        start.opacity = opacity(t);
        return start + "";
      };
    }

    cubehelix.gamma = cubehelixGamma;

    return cubehelix;
  }(1);
}

exports.default = cubehelix(_color.hue);
var cubehelixLong = exports.cubehelixLong = cubehelix(_color2.default);

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hclLong = undefined;

var _d3Color = __webpack_require__(11);

var _color = __webpack_require__(12);

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hcl(hue) {
  return function (start, end) {
    var h = hue((start = (0, _d3Color.hcl)(start)).h, (end = (0, _d3Color.hcl)(end)).h),
        c = (0, _color2.default)(start.c, end.c),
        l = (0, _color2.default)(start.l, end.l),
        opacity = (0, _color2.default)(start.opacity, end.opacity);
    return function (t) {
      start.h = h(t);
      start.c = c(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  };
}

exports.default = hcl(_color.hue);
var hclLong = exports.hclLong = hcl(_color2.default);

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hslLong = undefined;

var _d3Color = __webpack_require__(11);

var _color = __webpack_require__(12);

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hsl(hue) {
  return function (start, end) {
    var h = hue((start = (0, _d3Color.hsl)(start)).h, (end = (0, _d3Color.hsl)(end)).h),
        s = (0, _color2.default)(start.s, end.s),
        l = (0, _color2.default)(start.l, end.l),
        opacity = (0, _color2.default)(start.opacity, end.opacity);
    return function (t) {
      start.h = h(t);
      start.s = s(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  };
}

exports.default = hsl(_color.hue);
var hslLong = exports.hslLong = hsl(_color2.default);

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = lab;

var _d3Color = __webpack_require__(11);

var _color = __webpack_require__(12);

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function lab(start, end) {
  var l = (0, _color2.default)((start = (0, _d3Color.lab)(start)).l, (end = (0, _d3Color.lab)(end)).l),
      a = (0, _color2.default)(start.a, end.a),
      b = (0, _color2.default)(start.b, end.b),
      opacity = (0, _color2.default)(start.opacity, end.opacity);
  return function (t) {
    start.l = l(t);
    start.a = a(t);
    start.b = b(t);
    start.opacity = opacity(t);
    return start + "";
  };
}

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (interpolator, n) {
  var samples = new Array(n);
  for (var i = 0; i < n; ++i) {
    samples[i] = interpolator(i / (n - 1));
  }return samples;
};

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (a, b) {
  return a = +a, b -= a, function (t) {
    return Math.round(a + b * t);
  };
};

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX: scaleX,
    scaleY: scaleY
  };
};

var degrees = 180 / Math.PI;

var identity = exports.identity = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interpolateTransformSvg = exports.interpolateTransformCss = undefined;

var _number = __webpack_require__(16);

var _number2 = _interopRequireDefault(_number);

var _parse = __webpack_require__(74);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function interpolateTransform(parse, pxComma, pxParen, degParen) {

  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }

  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: (0, _number2.default)(xa, xb) }, { i: i - 2, x: (0, _number2.default)(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }

  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360;else if (b - a > 180) a += 360; // shortest path
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: (0, _number2.default)(a, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }

  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: (0, _number2.default)(a, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }

  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: (0, _number2.default)(xa, xb) }, { i: i - 2, x: (0, _number2.default)(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }

  return function (a, b) {
    var s = [],
        // string constants and placeholders
    q = []; // number interpolators
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null; // gc
    return function (t) {
      var i = -1,
          n = q.length,
          o;
      while (++i < n) {
        s[(o = q[i]).i] = o.x(t);
      }return s.join("");
    };
  };
}

var interpolateTransformCss = exports.interpolateTransformCss = interpolateTransform(_parse.parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = exports.interpolateTransformSvg = interpolateTransform(_parse.parseSvg, ", ", ")", ")");

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseCss = parseCss;
exports.parseSvg = parseSvg;

var _decompose = __webpack_require__(72);

var _decompose2 = _interopRequireDefault(_decompose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cssNode, cssRoot, cssView, svgNode;

function parseCss(value) {
  if (value === "none") return _decompose.identity;
  if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
  cssNode.style.transform = value;
  value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
  cssRoot.removeChild(cssNode);
  value = value.slice(7, -1).split(",");
  return (0, _decompose2.default)(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
}

function parseSvg(value) {
  if (value == null) return _decompose.identity;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return _decompose.identity;
  value = value.matrix;
  return (0, _decompose2.default)(value.a, value.b, value.c, value.d, value.e, value.f);
}

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (p0, p1) {
  var ux0 = p0[0],
      uy0 = p0[1],
      w0 = p0[2],
      ux1 = p1[0],
      uy1 = p1[1],
      w1 = p1[2],
      dx = ux1 - ux0,
      dy = uy1 - uy0,
      d2 = dx * dx + dy * dy,
      i,
      S;

  // Special case for u0 ≅ u1.
  if (d2 < epsilon2) {
    S = Math.log(w1 / w0) / rho;
    i = function i(t) {
      return [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
    };
  }

  // General case.
  else {
      var d1 = Math.sqrt(d2),
          b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
          b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
          r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
          r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function i(t) {
        var s = t * S,
            coshr0 = cosh(r0),
            u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [ux0 + u * dx, uy0 + u * dy, w0 * coshr0 / cosh(rho * s + r0)];
      };
    }

  i.duration = S * 1000;

  return i;
};

var rho = Math.SQRT2,
    rho2 = 2,
    rho4 = 4,
    epsilon2 = 1e-12;

function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}

function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}

function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}

// p0 = [ux0, uy0, w0]
// p1 = [ux1, uy1, w1]

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var pi = Math.PI,
    tau = 2 * pi,
    epsilon = 1e-6,
    tauEpsilon = tau - epsilon;

function Path() {
  this._x0 = this._y0 = // start of current subpath
  this._x1 = this._y1 = null; // end of current subpath
  this._ = "";
}

function path() {
  return new Path();
}

Path.prototype = path.prototype = {
  constructor: Path,
  moveTo: function moveTo(x, y) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
  },
  closePath: function closePath() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._ += "Z";
    }
  },
  lineTo: function lineTo(x, y) {
    this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  quadraticCurveTo: function quadraticCurveTo(x1, y1, x, y) {
    this._ += "Q" + +x1 + "," + +y1 + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  bezierCurveTo: function bezierCurveTo(x1, y1, x2, y2, x, y) {
    this._ += "C" + +x1 + "," + +y1 + "," + +x2 + "," + +y2 + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  arcTo: function arcTo(x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
    var x0 = this._x1,
        y0 = this._y1,
        x21 = x2 - x1,
        y21 = y2 - y1,
        x01 = x0 - x1,
        y01 = y0 - y1,
        l01_2 = x01 * x01 + y01 * y01;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x1,y1).
    if (this._x1 === null) {
      this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
    }

    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
    else if (!(l01_2 > epsilon)) {}

      // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
      // Equivalently, is (x1,y1) coincident with (x2,y2)?
      // Or, is the radius zero? Line to (x1,y1).
      else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
          this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Otherwise, draw an arc!
        else {
            var x20 = x2 - x0,
                y20 = y2 - y0,
                l21_2 = x21 * x21 + y21 * y21,
                l20_2 = x20 * x20 + y20 * y20,
                l21 = Math.sqrt(l21_2),
                l01 = Math.sqrt(l01_2),
                l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
                t01 = l / l01,
                t21 = l / l21;

            // If the start tangent is not coincident with (x0,y0), line to.
            if (Math.abs(t01 - 1) > epsilon) {
              this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
            }

            this._ += "A" + r + "," + r + ",0,0," + +(y01 * x20 > x01 * y20) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
          }
  },
  arc: function arc(x, y, r, a0, a1, ccw) {
    x = +x, y = +y, r = +r;
    var dx = r * Math.cos(a0),
        dy = r * Math.sin(a0),
        x0 = x + dx,
        y0 = y + dy,
        cw = 1 ^ ccw,
        da = ccw ? a0 - a1 : a1 - a0;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x0,y0).
    if (this._x1 === null) {
      this._ += "M" + x0 + "," + y0;
    }

    // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
    else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
        this._ += "L" + x0 + "," + y0;
      }

    // Is this arc empty? We’re done.
    if (!r) return;

    // Is this a complete circle? Draw two arcs to complete the circle.
    if (da > tauEpsilon) {
      this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
    }

    // Otherwise, draw an arc!
    else {
        if (da < 0) da = da % tau + tau;
        this._ += "A" + r + "," + r + ",0," + +(da >= pi) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
      }
  },
  rect: function rect(x, y, w, h) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + +w + "v" + +h + "h" + -w + "Z";
  },
  toString: function toString() {
    return this._;
  }
};

exports.default = path;

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (d) {
  var x = +this._x.call(null, d),
      y = +this._y.call(null, d);
  return add(this.cover(x, y), x, y, d);
};

exports.addAll = addAll;


function add(tree, x, y, d) {
  if (isNaN(x) || isNaN(y)) return tree; // ignore invalid points

  var parent,
      node = tree._root,
      leaf = { data: d },
      x0 = tree._x0,
      y0 = tree._y0,
      x1 = tree._x1,
      y1 = tree._y1,
      xm,
      ym,
      xp,
      yp,
      right,
      bottom,
      i,
      j;

  // If the tree is empty, initialize the root as a leaf.
  if (!node) return tree._root = leaf, tree;

  // Find the existing leaf for the new point, or add it.
  while (node.length) {
    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;else x1 = xm;
    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;else y1 = ym;
    if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
  }

  // Is the new point is exactly coincident with the existing point?
  xp = +tree._x.call(null, node.data);
  yp = +tree._y.call(null, node.data);
  if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

  // Otherwise, split the leaf node until the old and new point are separated.
  do {
    parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;else x1 = xm;
    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;else y1 = ym;
  } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | xp >= xm));
  return parent[j] = node, parent[i] = leaf, tree;
}

function addAll(data) {
  var d,
      i,
      n = data.length,
      x,
      y,
      xz = new Array(n),
      yz = new Array(n),
      x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;

  // Compute the points and their extent.
  for (i = 0; i < n; ++i) {
    if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
    xz[i] = x;
    yz[i] = y;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }

  // If there were no (valid) points, inherit the existing extent.
  if (x1 < x0) x0 = this._x0, x1 = this._x1;
  if (y1 < y0) y0 = this._y0, y1 = this._y1;

  // Expand the tree to cover the new points.
  this.cover(x0, y0).cover(x1, y1);

  // Add the new points.
  for (i = 0; i < n; ++i) {
    add(this, xz[i], yz[i], data[i]);
  }

  return this;
}

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (x, y) {
  if (isNaN(x = +x) || isNaN(y = +y)) return this; // ignore invalid points

  var x0 = this._x0,
      y0 = this._y0,
      x1 = this._x1,
      y1 = this._y1;

  // If the quadtree has no extent, initialize them.
  // Integer extent are necessary so that if we later double the extent,
  // the existing quadrant boundaries don’t change due to floating point error!
  if (isNaN(x0)) {
    x1 = (x0 = Math.floor(x)) + 1;
    y1 = (y0 = Math.floor(y)) + 1;
  }

  // Otherwise, double repeatedly to cover.
  else if (x0 > x || x > x1 || y0 > y || y > y1) {
      var z = x1 - x0,
          node = this._root,
          parent,
          i;

      switch (i = (y < (y0 + y1) / 2) << 1 | x < (x0 + x1) / 2) {
        case 0:
          {
            do {
              parent = new Array(4), parent[i] = node, node = parent;
            } while ((z *= 2, x1 = x0 + z, y1 = y0 + z, x > x1 || y > y1));
            break;
          }
        case 1:
          {
            do {
              parent = new Array(4), parent[i] = node, node = parent;
            } while ((z *= 2, x0 = x1 - z, y1 = y0 + z, x0 > x || y > y1));
            break;
          }
        case 2:
          {
            do {
              parent = new Array(4), parent[i] = node, node = parent;
            } while ((z *= 2, x1 = x0 + z, y0 = y1 - z, x > x1 || y0 > y));
            break;
          }
        case 3:
          {
            do {
              parent = new Array(4), parent[i] = node, node = parent;
            } while ((z *= 2, x0 = x1 - z, y0 = y1 - z, x0 > x || y0 > y));
            break;
          }
      }

      if (this._root && this._root.length) this._root = node;
    }

    // If the quadtree covers the point already, just return.
    else return this;

  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  return this;
};

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var data = [];
  this.visit(function (node) {
    if (!node.length) do {
      data.push(node.data);
    } while (node = node.next);
  });
  return data;
};

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (_) {
    return arguments.length ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1]) : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
};

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (x, y, radius) {
  var data,
      x0 = this._x0,
      y0 = this._y0,
      x1,
      y1,
      x2,
      y2,
      x3 = this._x1,
      y3 = this._y1,
      quads = [],
      node = this._root,
      q,
      i;

  if (node) quads.push(new _quad2.default(node, x0, y0, x3, y3));
  if (radius == null) radius = Infinity;else {
    x0 = x - radius, y0 = y - radius;
    x3 = x + radius, y3 = y + radius;
    radius *= radius;
  }

  while (q = quads.pop()) {

    // Stop searching if this quadrant can’t contain a closer node.
    if (!(node = q.node) || (x1 = q.x0) > x3 || (y1 = q.y0) > y3 || (x2 = q.x1) < x0 || (y2 = q.y1) < y0) continue;

    // Bisect the current quadrant.
    if (node.length) {
      var xm = (x1 + x2) / 2,
          ym = (y1 + y2) / 2;

      quads.push(new _quad2.default(node[3], xm, ym, x2, y2), new _quad2.default(node[2], x1, ym, xm, y2), new _quad2.default(node[1], xm, y1, x2, ym), new _quad2.default(node[0], x1, y1, xm, ym));

      // Visit the closest quadrant first.
      if (i = (y >= ym) << 1 | x >= xm) {
        q = quads[quads.length - 1];
        quads[quads.length - 1] = quads[quads.length - 1 - i];
        quads[quads.length - 1 - i] = q;
      }
    }

    // Visit this point. (Visiting coincident points isn’t necessary!)
    else {
        var dx = x - +this._x.call(null, node.data),
            dy = y - +this._y.call(null, node.data),
            d2 = dx * dx + dy * dy;
        if (d2 < radius) {
          var d = Math.sqrt(radius = d2);
          x0 = x - d, y0 = y - d;
          x3 = x + d, y3 = y + d;
          data = node.data;
        }
      }
  }

  return data;
};

var _quad = __webpack_require__(24);

var _quad2 = _interopRequireDefault(_quad);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = quadtree;

var _add = __webpack_require__(77);

var _add2 = _interopRequireDefault(_add);

var _cover = __webpack_require__(78);

var _cover2 = _interopRequireDefault(_cover);

var _data = __webpack_require__(79);

var _data2 = _interopRequireDefault(_data);

var _extent = __webpack_require__(80);

var _extent2 = _interopRequireDefault(_extent);

var _find = __webpack_require__(81);

var _find2 = _interopRequireDefault(_find);

var _remove = __webpack_require__(83);

var _remove2 = _interopRequireDefault(_remove);

var _root = __webpack_require__(84);

var _root2 = _interopRequireDefault(_root);

var _size = __webpack_require__(85);

var _size2 = _interopRequireDefault(_size);

var _visit = __webpack_require__(86);

var _visit2 = _interopRequireDefault(_visit);

var _visitAfter = __webpack_require__(87);

var _visitAfter2 = _interopRequireDefault(_visitAfter);

var _x = __webpack_require__(88);

var _x2 = _interopRequireDefault(_x);

var _y = __webpack_require__(89);

var _y2 = _interopRequireDefault(_y);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function quadtree(nodes, x, y) {
  var tree = new Quadtree(x == null ? _x.defaultX : x, y == null ? _y.defaultY : y, NaN, NaN, NaN, NaN);
  return nodes == null ? tree : tree.addAll(nodes);
}

function Quadtree(x, y, x0, y0, x1, y1) {
  this._x = x;
  this._y = y;
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  this._root = undefined;
}

function leaf_copy(leaf) {
  var copy = { data: leaf.data },
      next = copy;
  while (leaf = leaf.next) {
    next = next.next = { data: leaf.data };
  }return copy;
}

var treeProto = quadtree.prototype = Quadtree.prototype;

treeProto.copy = function () {
  var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
      node = this._root,
      nodes,
      child;

  if (!node) return copy;

  if (!node.length) return copy._root = leaf_copy(node), copy;

  nodes = [{ source: node, target: copy._root = new Array(4) }];
  while (node = nodes.pop()) {
    for (var i = 0; i < 4; ++i) {
      if (child = node.source[i]) {
        if (child.length) nodes.push({ source: child, target: node.target[i] = new Array(4) });else node.target[i] = leaf_copy(child);
      }
    }
  }

  return copy;
};

treeProto.add = _add2.default;
treeProto.addAll = _add.addAll;
treeProto.cover = _cover2.default;
treeProto.data = _data2.default;
treeProto.extent = _extent2.default;
treeProto.find = _find2.default;
treeProto.remove = _remove2.default;
treeProto.removeAll = _remove.removeAll;
treeProto.root = _root2.default;
treeProto.size = _size2.default;
treeProto.visit = _visit2.default;
treeProto.visitAfter = _visitAfter2.default;
treeProto.x = _x2.default;
treeProto.y = _y2.default;

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (d) {
  if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this; // ignore invalid points

  var parent,
      node = this._root,
      retainer,
      previous,
      next,
      x0 = this._x0,
      y0 = this._y0,
      x1 = this._x1,
      y1 = this._y1,
      x,
      y,
      xm,
      ym,
      right,
      bottom,
      i,
      j;

  // If the tree is empty, initialize the root as a leaf.
  if (!node) return this;

  // Find the leaf node for the point.
  // While descending, also retain the deepest parent with a non-removed sibling.
  if (node.length) while (true) {
    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;else x1 = xm;
    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;else y1 = ym;
    if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
    if (!node.length) break;
    if (parent[i + 1 & 3] || parent[i + 2 & 3] || parent[i + 3 & 3]) retainer = parent, j = i;
  }

  // Find the point to remove.
  while (node.data !== d) {
    if (!(previous = node, node = node.next)) return this;
  }if (next = node.next) delete node.next;

  // If there are multiple coincident points, remove just the point.
  if (previous) return next ? previous.next = next : delete previous.next, this;

  // If this is the root point, remove it.
  if (!parent) return this._root = next, this;

  // Remove this leaf.
  next ? parent[i] = next : delete parent[i];

  // If the parent now contains exactly one leaf, collapse superfluous parents.
  if ((node = parent[0] || parent[1] || parent[2] || parent[3]) && node === (parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) {
    if (retainer) retainer[j] = node;else this._root = node;
  }

  return this;
};

exports.removeAll = removeAll;
function removeAll(data) {
  for (var i = 0, n = data.length; i < n; ++i) {
    this.remove(data[i]);
  }return this;
}

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  return this._root;
};

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var size = 0;
  this.visit(function (node) {
    if (!node.length) do {
      ++size;
    } while (node = node.next);
  });
  return size;
};

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (callback) {
  var quads = [],
      q,
      node = this._root,
      child,
      x0,
      y0,
      x1,
      y1;
  if (node) quads.push(new _quad2.default(node, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
      var xm = (x0 + x1) / 2,
          ym = (y0 + y1) / 2;
      if (child = node[3]) quads.push(new _quad2.default(child, xm, ym, x1, y1));
      if (child = node[2]) quads.push(new _quad2.default(child, x0, ym, xm, y1));
      if (child = node[1]) quads.push(new _quad2.default(child, xm, y0, x1, ym));
      if (child = node[0]) quads.push(new _quad2.default(child, x0, y0, xm, ym));
    }
  }
  return this;
};

var _quad = __webpack_require__(24);

var _quad2 = _interopRequireDefault(_quad);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (callback) {
  var quads = [],
      next = [],
      q;
  if (this._root) quads.push(new _quad2.default(this._root, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    var node = q.node;
    if (node.length) {
      var child,
          x0 = q.x0,
          y0 = q.y0,
          x1 = q.x1,
          y1 = q.y1,
          xm = (x0 + x1) / 2,
          ym = (y0 + y1) / 2;
      if (child = node[0]) quads.push(new _quad2.default(child, x0, y0, xm, ym));
      if (child = node[1]) quads.push(new _quad2.default(child, xm, y0, x1, ym));
      if (child = node[2]) quads.push(new _quad2.default(child, x0, ym, xm, y1));
      if (child = node[3]) quads.push(new _quad2.default(child, xm, ym, x1, y1));
    }
    next.push(q);
  }
  while (q = next.pop()) {
    callback(q.node, q.x0, q.y0, q.x1, q.y1);
  }
  return this;
};

var _quad = __webpack_require__(24);

var _quad2 = _interopRequireDefault(_quad);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultX = defaultX;

exports.default = function (_) {
  return arguments.length ? (this._x = _, this) : this._x;
};

function defaultX(d) {
  return d[0];
}

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultY = defaultY;

exports.default = function (_) {
  return arguments.length ? (this._y = _, this) : this._y;
};

function defaultY(d) {
  return d[1];
}

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function (_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function (_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function (_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function (_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function (_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function (iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function () {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function () {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = (0, _d3Interpolate.interpolateNumber)(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0 + "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " + x1 + "," + y1;
    }

    link.curvature = function (_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function (node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function (link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function (node) {
      node.value = Math.max((0, _d3Array.sum)(node.sourceLinks, value), (0, _d3Array.sum)(node.targetLinks, value));
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function (node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function (link) {
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target);
          }
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  // function moveSourcesRight() {
  //   nodes.forEach(function(node) {
  //     if (!node.targetLinks.length) {
  //       node.x = min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
  //     }
  //   });
  // }

  function moveSinksRight(x) {
    nodes.forEach(function (node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function (node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = (0, _d3Collection.nest)().key(function (d) {
      return d.x;
    }).sortKeys(_d3Array.ascending).entries(nodes).map(function (d) {
      return d.values;
    });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = (0, _d3Array.min)(nodesByBreadth, function (nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / (0, _d3Array.sum)(nodes, value);
      });

      nodesByBreadth.forEach(function (nodes) {
        nodes.forEach(function (node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function (link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function (nodes) {
        nodes.forEach(function (node) {
          if (node.targetLinks.length) {
            var y = (0, _d3Array.sum)(node.targetLinks, weightedSource) / (0, _d3Array.sum)(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function (nodes) {
        nodes.forEach(function (node) {
          if (node.sourceLinks.length) {
            var y = (0, _d3Array.sum)(node.sourceLinks, weightedTarget) / (0, _d3Array.sum)(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function (nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function (node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function (node) {
      var sy = 0,
          ty = 0;
      node.sourceLinks.forEach(function (link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function (link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};

var _d3Array = __webpack_require__(0);

var _d3Collection = __webpack_require__(168);

var _d3Interpolate = __webpack_require__(14);

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (callback, delay, time) {
  var t = new _timer.Timer(),
      total = delay;
  if (delay == null) return t.restart(callback, delay, time), t;
  delay = +delay, time = time == null ? (0, _timer.now)() : +time;
  t.restart(function tick(elapsed) {
    elapsed += total;
    t.restart(tick, total += delay, time);
    callback(elapsed);
  }, delay, time);
  return t;
};

var _timer = __webpack_require__(25);

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (callback, delay, time) {
  var t = new _timer.Timer();
  delay = delay == null ? 0 : +delay;
  t.restart(function (elapsed) {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
};

var _timer = __webpack_require__(25);

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (node, name) {
  var schedules = node.__transition,
      schedule,
      i;

  if (schedules) {
    name = name == null ? null : name + "";
    for (i in schedules) {
      if ((schedule = schedules[i]).state > _schedule.SCHEDULED && schedule.name === name) {
        return new _index.Transition([[node]], root, name, +i);
      }
    }
  }

  return null;
};

var _index = __webpack_require__(9);

var _schedule = __webpack_require__(5);

var root = [null];

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _d3Selection = __webpack_require__(0);

var _interrupt = __webpack_require__(95);

var _interrupt2 = _interopRequireDefault(_interrupt);

var _transition = __webpack_require__(96);

var _transition2 = _interopRequireDefault(_transition);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_d3Selection.selection.prototype.interrupt = _interrupt2.default;
_d3Selection.selection.prototype.transition = _transition2.default;

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (name) {
  return this.each(function () {
    (0, _interrupt2.default)(this, name);
  });
};

var _interrupt = __webpack_require__(42);

var _interrupt2 = _interopRequireDefault(_interrupt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (name) {
  var id, timing;

  if (name instanceof _index.Transition) {
    id = name._id, name = name._name;
  } else {
    id = (0, _index.newId)(), (timing = defaultTiming).time = (0, _d3Timer.now)(), name = name == null ? null : name + "";
  }

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        (0, _schedule2.default)(node, name, id, i, group, timing || inherit(node, id));
      }
    }
  }

  return new _index.Transition(groups, this._parents, name, id);
};

var _index = __webpack_require__(9);

var _schedule = __webpack_require__(5);

var _schedule2 = _interopRequireDefault(_schedule);

var _d3Ease = __webpack_require__(0);

var _d3Timer = __webpack_require__(47);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultTiming = {
  time: null, // Set on use.
  delay: 0,
  duration: 250,
  ease: _d3Ease.easeCubicInOut
};

function inherit(node, id) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id])) {
    if (!(node = node.parentNode)) {
      return defaultTiming.time = (0, _d3Timer.now)(), defaultTiming;
    }
  }
  return timing;
}

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (name, value) {
  var fullname = (0, _d3Selection.namespace)(name),
      i = fullname === "transform" ? _d3Interpolate.interpolateTransformSvg : _interpolate2.default;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, (0, _tween.tweenValue)(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname) : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
};

var _d3Interpolate = __webpack_require__(14);

var _d3Selection = __webpack_require__(0);

var _tween = __webpack_require__(17);

var _interpolate = __webpack_require__(43);

var _interpolate2 = _interopRequireDefault(_interpolate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function attrRemove(name) {
  return function () {
    this.removeAttribute(name);
  };
}

function attrRemoveNS(fullname) {
  return function () {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant(name, interpolate, value1) {
  var value00, interpolate0;
  return function () {
    var value0 = this.getAttribute(name);
    return value0 === value1 ? null : value0 === value00 ? interpolate0 : interpolate0 = interpolate(value00 = value0, value1);
  };
}

function attrConstantNS(fullname, interpolate, value1) {
  var value00, interpolate0;
  return function () {
    var value0 = this.getAttributeNS(fullname.space, fullname.local);
    return value0 === value1 ? null : value0 === value00 ? interpolate0 : interpolate0 = interpolate(value00 = value0, value1);
  };
}

function attrFunction(name, interpolate, value) {
  var value00, value10, interpolate0;
  return function () {
    var value0,
        value1 = value(this);
    if (value1 == null) return void this.removeAttribute(name);
    value0 = this.getAttribute(name);
    return value0 === value1 ? null : value0 === value00 && value1 === value10 ? interpolate0 : interpolate0 = interpolate(value00 = value0, value10 = value1);
  };
}

function attrFunctionNS(fullname, interpolate, value) {
  var value00, value10, interpolate0;
  return function () {
    var value0,
        value1 = value(this);
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    value0 = this.getAttributeNS(fullname.space, fullname.local);
    return value0 === value1 ? null : value0 === value00 && value1 === value10 ? interpolate0 : interpolate0 = interpolate(value00 = value0, value10 = value1);
  };
}

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  var fullname = (0, _d3Selection.namespace)(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
};

var _d3Selection = __webpack_require__(0);

function attrTweenNS(fullname, value) {
  function tween() {
    var node = this,
        i = value.apply(node, arguments);
    return i && function (t) {
      node.setAttributeNS(fullname.space, fullname.local, i(t));
    };
  }
  tween._value = value;
  return tween;
}

function attrTween(name, value) {
  function tween() {
    var node = this,
        i = value.apply(node, arguments);
    return i && function (t) {
      node.setAttribute(name, i(t));
    };
  }
  tween._value = value;
  return tween;
}

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (value) {
  var id = this._id;

  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id, value)) : (0, _schedule.get)(this.node(), id).delay;
};

var _schedule = __webpack_require__(5);

function delayFunction(id, value) {
  return function () {
    (0, _schedule.init)(this, id).delay = +value.apply(this, arguments);
  };
}

function delayConstant(id, value) {
  return value = +value, function () {
    (0, _schedule.init)(this, id).delay = value;
  };
}

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (value) {
  var id = this._id;

  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id, value)) : (0, _schedule.get)(this.node(), id).duration;
};

var _schedule = __webpack_require__(5);

function durationFunction(id, value) {
  return function () {
    (0, _schedule.set)(this, id).duration = +value.apply(this, arguments);
  };
}

function durationConstant(id, value) {
  return value = +value, function () {
    (0, _schedule.set)(this, id).duration = value;
  };
}

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (value) {
  var id = this._id;

  return arguments.length ? this.each(easeConstant(id, value)) : (0, _schedule.get)(this.node(), id).ease;
};

var _schedule = __webpack_require__(5);

function easeConstant(id, value) {
  if (typeof value !== "function") throw new Error();
  return function () {
    (0, _schedule.set)(this, id).ease = value;
  };
}

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (match) {
  if (typeof match !== "function") match = (0, _d3Selection.matcher)(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new _index.Transition(subgroups, this._parents, this._name, this._id);
};

var _d3Selection = __webpack_require__(0);

var _index = __webpack_require__(9);

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (transition) {
  if (transition._id !== this._id) throw new Error();

  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new _index.Transition(merges, this._parents, this._name, this._id);
};

var _index = __webpack_require__(9);

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (name, listener) {
  var id = this._id;

  return arguments.length < 2 ? (0, _schedule.get)(this.node(), id).on.on(name) : this.each(onFunction(id, name, listener));
};

var _schedule = __webpack_require__(5);

function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function (t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}

function onFunction(id, name, listener) {
  var on0,
      on1,
      sit = start(name) ? _schedule.init : _schedule.set;
  return function () {
    var schedule = sit(this, id),
        on = schedule.on;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

    schedule.on = on1;
  };
}

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  return this.on("end.remove", removeFunction(this._id));
};

function removeFunction(id) {
  return function () {
    var parent = this.parentNode;
    for (var i in this.__transition) {
      if (+i !== id) return;
    }if (parent) parent.removeChild(this);
  };
}

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = (0, _d3Selection.selector)(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        (0, _schedule2.default)(subgroup[i], name, id, i, subgroup, (0, _schedule.get)(node, id));
      }
    }
  }

  return new _index.Transition(subgroups, this._parents, name, id);
};

var _d3Selection = __webpack_require__(0);

var _index = __webpack_require__(9);

var _schedule = __webpack_require__(5);

var _schedule2 = _interopRequireDefault(_schedule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = (0, _d3Selection.selectorAll)(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children = select.call(node, node.__data__, i, group), child, inherit = (0, _schedule.get)(node, id), k = 0, l = children.length; k < l; ++k) {
          if (child = children[k]) {
            (0, _schedule2.default)(child, name, id, k, children, inherit);
          }
        }
        subgroups.push(children);
        parents.push(node);
      }
    }
  }

  return new _index.Transition(subgroups, parents, name, id);
};

var _d3Selection = __webpack_require__(0);

var _index = __webpack_require__(9);

var _schedule = __webpack_require__(5);

var _schedule2 = _interopRequireDefault(_schedule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  return new Selection(this._groups, this._parents);
};

var _d3Selection = __webpack_require__(0);

var Selection = _d3Selection.selection.prototype.constructor;

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (name, value, priority) {
    var i = (name += "") === "transform" ? _d3Interpolate.interpolateTransformCss : _interpolate2.default;
    return value == null ? this.styleTween(name, styleRemove(name, i)).on("end.style." + name, styleRemoveEnd(name)) : this.styleTween(name, typeof value === "function" ? styleFunction(name, i, (0, _tween.tweenValue)(this, "style." + name, value)) : styleConstant(name, i, value), priority);
};

var _d3Interpolate = __webpack_require__(14);

var _d3Selection = __webpack_require__(0);

var _tween = __webpack_require__(17);

var _interpolate = __webpack_require__(43);

var _interpolate2 = _interopRequireDefault(_interpolate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function styleRemove(name, interpolate) {
    var value00, value10, interpolate0;
    return function () {
        var style = (0, _d3Selection.window)(this).getComputedStyle(this, null),
            value0 = style.getPropertyValue(name),
            value1 = (this.style.removeProperty(name), style.getPropertyValue(name));
        return value0 === value1 ? null : value0 === value00 && value1 === value10 ? interpolate0 : interpolate0 = interpolate(value00 = value0, value10 = value1);
    };
}

function styleRemoveEnd(name) {
    return function () {
        this.style.removeProperty(name);
    };
}

function styleConstant(name, interpolate, value1) {
    var value00, interpolate0;
    return function () {
        var value0 = (0, _d3Selection.window)(this).getComputedStyle(this, null).getPropertyValue(name);
        return value0 === value1 ? null : value0 === value00 ? interpolate0 : interpolate0 = interpolate(value00 = value0, value1);
    };
}

function styleFunction(name, interpolate, value) {
    var value00, value10, interpolate0;
    return function () {
        var style = (0, _d3Selection.window)(this).getComputedStyle(this, null),
            value0 = style.getPropertyValue(name),
            value1 = value(this);
        if (value1 == null) value1 = (this.style.removeProperty(name), style.getPropertyValue(name));
        return value0 === value1 ? null : value0 === value00 && value1 === value10 ? interpolate0 : interpolate0 = interpolate(value00 = value0, value10 = value1);
    };
}

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
};

function styleTween(name, value, priority) {
  function tween() {
    var node = this,
        i = value.apply(node, arguments);
    return i && function (t) {
      node.style.setProperty(name, i(t), priority);
    };
  }
  tween._value = value;
  return tween;
}

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (value) {
  return this.tween("text", typeof value === "function" ? textFunction((0, _tween.tweenValue)(this, "text", value)) : textConstant(value == null ? "" : value + ""));
};

var _tween = __webpack_require__(17);

function textConstant(value) {
  return function () {
    this.textContent = value;
  };
}

function textFunction(value) {
  return function () {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var name = this._name,
      id0 = this._id,
      id1 = (0, _index.newId)();

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit = (0, _schedule.get)(node, id0);
        (0, _schedule2.default)(node, name, id1, i, group, {
          time: inherit.time + inherit.delay + inherit.duration,
          delay: 0,
          duration: inherit.duration,
          ease: inherit.ease
        });
      }
    }
  }

  return new _index.Transition(groups, this._parents, name, id1);
};

var _index = __webpack_require__(9);

var _schedule = __webpack_require__(5);

var _schedule2 = _interopRequireDefault(_schedule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _Action2 = __webpack_require__(6);

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Freeze = function (_Action) {
  _inherits(Freeze, _Action);

  function Freeze(p) {
    _classCallCheck(this, Freeze);

    var _this = _possibleConstructorReturn(this, (Freeze.__proto__ || Object.getPrototypeOf(Freeze)).call(this, p));

    _this._deny = false;
    return _this;
  }

  _createClass(Freeze, [{
    key: '_execute',
    value: function _execute() {
      var _this2 = this;

      var chart = this._registrar;
      chart.frozen = true;
      _lodash2.default.each(chart.getComponentsByType('ControlPanel'), function (controlPanel) {
        var menuItems = controlPanel.config.get('menu');
        var menuItem = _lodash2.default.find(menuItems, function (item) {
          return item.id === _this2.constructor.name;
        });
        menuItem.id = 'Unfreeze';
        controlPanel.config.trigger('change', controlPanel.config);
      });
    }
  }]);

  return Freeze;
}(_Action3.default);

exports.default = Freeze;

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _Action2 = __webpack_require__(6);

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var HideComponent = function (_Action) {
  _inherits(HideComponent, _Action);

  function HideComponent(p) {
    _classCallCheck(this, HideComponent);

    var _this = _possibleConstructorReturn(this, (HideComponent.__proto__ || Object.getPrototypeOf(HideComponent)).call(this, p));

    _this._deny = false;
    return _this;
  }

  _createClass(HideComponent, [{
    key: '_execute',
    value: function _execute(id) {
      var _this2 = this;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var ids = _lodash2.default.isArray(id) ? id : [id];
      _lodash2.default.each(ids, function (id) {
        var component = _this2._registrar.getComponent(id);
        if (component) component.hide.apply(component, args);
      });
    }
  }]);

  return HideComponent;
}(_Action3.default);

exports.default = HideComponent;

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _Action2 = __webpack_require__(6);

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Refresh = function (_Action) {
  _inherits(Refresh, _Action);

  function Refresh(p) {
    _classCallCheck(this, Refresh);

    var _this = _possibleConstructorReturn(this, (Refresh.__proto__ || Object.getPrototypeOf(Refresh)).call(this, p));

    _this._deny = false;
    return _this;
  }

  _createClass(Refresh, [{
    key: '_execute',
    value: function _execute(accessorName, color) {
      var chart = this._registrar;

      _lodash2.default.each(chart.getComponentsByType('CompositeYChart'), function (compositeY) {
        compositeY.config.trigger('change', compositeY.config);
      });

      _lodash2.default.each(chart.getComponentsByType('Navigation'), function (navigation) {
        navigation.config.trigger('change', navigation.config);
      });

      _lodash2.default.each(chart.getComponentsByType('PieChart'), function (pieChart) {
        pieChart.config.trigger('change', pieChart.config);
      });
    }
  }]);

  return Refresh;
}(_Action3.default);

exports.default = Refresh;

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _Action2 = __webpack_require__(6);

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var SelectChartType = function (_Action) {
  _inherits(SelectChartType, _Action);

  function SelectChartType(p) {
    _classCallCheck(this, SelectChartType);

    var _this = _possibleConstructorReturn(this, (SelectChartType.__proto__ || Object.getPrototypeOf(SelectChartType)).call(this, p));

    _this._deny = false;
    return _this;
  }
  /**
   * To update chart type of an accessor under the component.
   * If the updated chart type is one of BarChart type, then we will change all charts (any of bar chart type)
   * under the axis to same updated chart type. This is to avoid showing bar and stacked bar under one axis.
   * @param component
   * @param accessorName
   * @param chartType
   * @private
   */


  _createClass(SelectChartType, [{
    key: '_updateChartType',
    value: function _updateChartType(component, accessorName, chartType) {
      var barCharts = ['BarChart', 'StackedBarChart'];
      var triggerChange = false;
      var plot = component.config.get('plot');
      var accessor = _lodash2.default.find(plot.y, function (a) {
        return a.accessor === accessorName;
      });
      if (_lodash2.default.includes(barCharts, chartType)) {
        // Find all bar charts under the same axis that of accessor.
        var barAccessors = _lodash2.default.filter(plot.y, function (a) {
          return _lodash2.default.includes(barCharts, a.chart) && a.axis === accessor.axis;
        });
        // If the chart to updated is currently not a Bar (eg: Line or area), add it to the bar accessors to be updated.
        if (!_lodash2.default.includes(barCharts, accessor.chart)) barAccessors.push(accessor);
        if (barAccessors) {
          _lodash2.default.each(barAccessors, function (accessor) {
            accessor.chart = chartType;
          });
          triggerChange = true;
        }
      } else {
        if (accessor) {
          accessor.chart = chartType;
          triggerChange = true;
        }
      }
      if (triggerChange) component.config.trigger('change', component.config);
    }
  }, {
    key: '_execute',
    value: function _execute(accessorName, chartType) {
      var _this2 = this;

      var chart = this._registrar;

      _lodash2.default.each(chart.getComponentsByType('CompositeYChart'), function (compositeY) {
        _this2._updateChartType(compositeY, accessorName, chartType);
      });

      _lodash2.default.each(chart.getComponentsByType('Navigation'), function (navigation) {
        _this2._updateChartType(navigation, accessorName, chartType);
      });
    }
  }]);

  return SelectChartType;
}(_Action3.default);

exports.default = SelectChartType;

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _Action2 = __webpack_require__(6);

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var SelectColor = function (_Action) {
  _inherits(SelectColor, _Action);

  function SelectColor(p) {
    _classCallCheck(this, SelectColor);

    var _this = _possibleConstructorReturn(this, (SelectColor.__proto__ || Object.getPrototypeOf(SelectColor)).call(this, p));

    _this._deny = false;
    return _this;
  }

  _createClass(SelectColor, [{
    key: '_execute',
    value: function _execute(accessorName, color) {
      var chart = this._registrar;

      _lodash2.default.each(chart.getComponentsByType('CompositeYChart'), function (compositeY) {
        var plot = compositeY.config.get('plot');
        var accessor = _lodash2.default.find(plot.y, function (a) {
          return a.accessor === accessorName;
        });
        if (accessor) {
          accessor.color = color;
          compositeY.config.trigger('change', compositeY.config);
        }
      });

      // Color Picker will be updated as it has CompositeY Config Model as a parent
      // as well as all CompositeY dependant components too

      _lodash2.default.each(chart.getComponentsByType('Navigation'), function (navigation) {
        var plot = navigation.config.get('plot');
        var accessor = _lodash2.default.find(plot.y, function (a) {
          return a.accessor === accessorName;
        });
        if (accessor) {
          accessor.color = color;
          navigation.config.trigger('change', navigation.config);
        }
      });

      _lodash2.default.each(chart.getComponentsByType('RadialDendrogram'), function (radialDendrogram) {
        var levels = radialDendrogram.config.get('levels');
        var level = _lodash2.default.find(levels, function (level) {
          return level.level === accessorName;
        });
        if (level) {
          level.color = color;
          radialDendrogram.config.trigger('change', radialDendrogram.config);
        }
      });
    }
  }]);

  return SelectColor;
}(_Action3.default);

exports.default = SelectColor;

/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _Action2 = __webpack_require__(6);

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var SelectSerie = function (_Action) {
  _inherits(SelectSerie, _Action);

  function SelectSerie(p) {
    _classCallCheck(this, SelectSerie);

    var _this = _possibleConstructorReturn(this, (SelectSerie.__proto__ || Object.getPrototypeOf(SelectSerie)).call(this, p));

    _this._deny = false;
    return _this;
  }

  _createClass(SelectSerie, [{
    key: '_execute',
    value: function _execute(accessorName, isSelected) {
      var chart = this._registrar;

      _lodash2.default.each(chart.getComponentsByType('CompositeYChart'), function (compositeY) {
        var plot = compositeY.config.get('plot');
        var accessor = _lodash2.default.find(plot.y, function (a) {
          return a.accessor === accessorName;
        });
        if (accessor) {
          accessor.enabled = isSelected;
          compositeY.config.trigger('change', compositeY.config);
        }
      });

      // Filter will be updated as it has CompositeY Config Model as a parent
      // as well as all CompositeY dependant components too

      _lodash2.default.each(chart.getComponentsByType('Navigation'), function (navigation) {
        var plot = navigation.config.get('plot');
        var accessor = _lodash2.default.find(plot.y, function (a) {
          return a.accessor === accessorName;
        });
        if (accessor) {
          accessor.enabled = isSelected;
          navigation.config.trigger('change', navigation.config);
        }
      });

      _lodash2.default.each(chart.getComponentsByType('RadialDendrogram'), function (radialDendrogram) {
        var levels = radialDendrogram.config.get('levels');
        var level = _lodash2.default.find(levels, function (level) {
          return level.level === accessorName;
        });
        if (level) {
          var drillDownLevel = isSelected ? level.level + 1 : level.level;
          if (drillDownLevel < 1) {
            drillDownLevel = 1;
          }
          radialDendrogram.config.set('drillDownLevel', drillDownLevel);
        }
      });
    }
  }]);

  return SelectSerie;
}(_Action3.default);

exports.default = SelectSerie;

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Action2 = __webpack_require__(6);

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var ShowComponent = function (_Action) {
  _inherits(ShowComponent, _Action);

  function ShowComponent(p) {
    _classCallCheck(this, ShowComponent);

    var _this = _possibleConstructorReturn(this, (ShowComponent.__proto__ || Object.getPrototypeOf(ShowComponent)).call(this, p));

    _this._deny = false;
    return _this;
  }

  _createClass(ShowComponent, [{
    key: '_execute',
    value: function _execute(id) {
      var component = this._registrar.getComponent(id);

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (component) component.show.apply(component, args);
    }
  }]);

  return ShowComponent;
}(_Action3.default);

exports.default = ShowComponent;

/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _Action2 = __webpack_require__(6);

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Unfreeze = function (_Action) {
  _inherits(Unfreeze, _Action);

  function Unfreeze(p) {
    _classCallCheck(this, Unfreeze);

    var _this = _possibleConstructorReturn(this, (Unfreeze.__proto__ || Object.getPrototypeOf(Unfreeze)).call(this, p));

    _this._deny = false;
    return _this;
  }

  _createClass(Unfreeze, [{
    key: '_execute',
    value: function _execute() {
      var _this2 = this;

      var chart = this._registrar;
      chart.frozen = false;
      _lodash2.default.each(chart.getComponentsByType('ControlPanel'), function (controlPanel) {
        var menuItems = controlPanel.config.get('menu');
        var menuItem = _lodash2.default.find(menuItems, function (item) {
          return item.id === _this2.constructor.name;
        });
        menuItem.id = 'Freeze';
        controlPanel.config.trigger('change', controlPanel.config);
      });
    }
  }]);

  return Unfreeze;
}(_Action3.default);

exports.default = Unfreeze;

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _Action2 = __webpack_require__(6);

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Zoom = function (_Action) {
  _inherits(Zoom, _Action);

  function Zoom(p) {
    _classCallCheck(this, Zoom);

    var _this = _possibleConstructorReturn(this, (Zoom.__proto__ || Object.getPrototypeOf(Zoom)).call(this, p));

    _this._deny = false;
    return _this;
  }
  /**
   * Zoom is performed by accessor ranges for any updated component be able to respond
   * while zooming by axes will require components to have the same corresponding axes names
   * @param ranges Hash of ranges by accessor
   */


  _createClass(Zoom, [{
    key: '_execute',
    value: function _execute(componentIds, ranges) {
      var chart = this._registrar;
      var components = [];
      if (componentIds) components = _lodash2.default.map(componentIds, function (id) {
        return chart.getComponent(id);
      });else {
        var _components, _components2;

        (_components = components).push.apply(_components, _toConsumableArray(chart.getComponentsByType('CompositeYChart')));
        (_components2 = components).push.apply(_components2, _toConsumableArray(chart.getComponentsByType('Navigation')));
      }

      _lodash2.default.each(components, function (component) {
        if (component) component.zoom(ranges);
      });
    }
  }]);

  return Zoom;
}(_Action3.default);

exports.default = Zoom;

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

var _ColoredChart = __webpack_require__(10);

var _ColoredChart2 = _interopRequireDefault(_ColoredChart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var ColorPickerConfigModel = function (_ContrailChartsConfig) {
  _inherits(ColorPickerConfigModel, _ContrailChartsConfig);

  function ColorPickerConfigModel() {
    _classCallCheck(this, ColorPickerConfigModel);

    return _possibleConstructorReturn(this, (ColorPickerConfigModel.__proto__ || Object.getPrototypeOf(ColorPickerConfigModel)).apply(this, arguments));
  }

  _createClass(ColorPickerConfigModel, [{
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(ColorPickerConfigModel.prototype.__proto__ || Object.getPrototypeOf(ColorPickerConfigModel.prototype), 'defaults', this), _ColoredChart2.default.defaults);
    }
    /**
     * Ask parent component for serie accessors
     */

  }, {
    key: 'data',
    get: function get() {
      var _this2 = this;

      var data = { colors: this.attributes.colorScheme };
      var accessors = this._parent.getAccessors();
      data.series = _lodash2.default.map(accessors, function (accessor) {
        return {
          accessor: accessor.accessor,
          label: _this2.getLabel(undefined, accessor),
          color: _this2._parent.getColor([], accessor)
        };
      });
      return data;
    }
  }]);

  return ColorPickerConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = ColorPickerConfigModel;

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

var _colorPicker = __webpack_require__(194);

var _colorPicker2 = _interopRequireDefault(_colorPicker);

__webpack_require__(174);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var ColorPickerView = function (_ContrailChartsView) {
  _inherits(ColorPickerView, _ContrailChartsView);

  function ColorPickerView(p) {
    _classCallCheck(this, ColorPickerView);

    var _this = _possibleConstructorReturn(this, (ColorPickerView.__proto__ || Object.getPrototypeOf(ColorPickerView)).call(this, p));

    _this.listenTo(_this.config, 'change', _this.render);
    return _this;
  }

  _createClass(ColorPickerView, [{
    key: 'render',
    value: function render() {
      var template = this.config.get('template') || _colorPicker2.default;
      var content = template(this.config.data);

      _get(ColorPickerView.prototype.__proto__ || Object.getPrototypeOf(ColorPickerView.prototype), 'render', this).call(this, content);
      this.d3.classed('hide', this.config.get('embedded') && !this._visible);
    }
  }, {
    key: 'open',
    value: function open(d, el) {
      var $elem = this.$(el);
      var label = $elem.find('.label').html();
      this._accessor = $elem.data('accessor');
      var paletteElement = this.$(this.selectors.palette);
      var elemOffset = $elem.position();
      elemOffset.left += $elem.outerWidth(true);
      paletteElement.css(elemOffset);
      paletteElement.find(this.selectors.title).html(label);
      paletteElement.removeClass('hide');
    }
  }, {
    key: 'close',
    value: function close() {
      this.d3.select(this.selectors.palette).classed('hide', true);
    }

    // Event handlers

  }, {
    key: '_onSelectColor',
    value: function _onSelectColor(d, el) {
      var color = el.style['background-color'];
      _Actionman2.default.fire('SelectColor', this._accessor, color);
    }
  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(ColorPickerView.prototype.__proto__ || Object.getPrototypeOf(ColorPickerView.prototype), 'selectors', this), {
        open: '.color-select',
        close: '.color-picker-palette-close',
        title: '.color-picker-palette-title',
        palette: '.color-picker-palette',
        colorSelector: '.color-picker-palette-color'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return {
        'click open': 'open',
        'click close': 'close',
        'click colorSelector': '_onSelectColor'
      };
    }
  }]);

  return ColorPickerView;
}(_contrailChartsView2.default);

exports.default = ColorPickerView;

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3Shape = __webpack_require__(0);

var d3Shape = _interopRequireWildcard(_d3Shape);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _d3Array = __webpack_require__(0);

var d3Array = _interopRequireWildcard(_d3Array);

var _XYChartSubView2 = __webpack_require__(13);

var _XYChartSubView3 = _interopRequireDefault(_XYChartSubView2);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

__webpack_require__(175);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var AreaChartView = function (_XYChartSubView) {
  _inherits(AreaChartView, _XYChartSubView);

  function AreaChartView() {
    _classCallCheck(this, AreaChartView);

    return _possibleConstructorReturn(this, (AreaChartView.__proto__ || Object.getPrototypeOf(AreaChartView)).apply(this, arguments));
  }

  _createClass(AreaChartView, [{
    key: 'combineDomains',
    value: function combineDomains() {
      var _this2 = this;

      var domains = _get(AreaChartView.prototype.__proto__ || Object.getPrototypeOf(AreaChartView.prototype), 'combineDomains', this).call(this);

      var stackGroups = _lodash2.default.groupBy(this.params.activeAccessorData, 'stack');
      var totalRangeValues = _lodash2.default.reduce(stackGroups, function (totalRangeValues, accessors) {
        var stackedRange = _lodash2.default.reduce(accessors, function (stackedRange, accessor) {
          var range = _this2.model.getRangeFor(accessor.accessor);
          // Summarize ranges for stacked layers
          return [stackedRange[0] + range[0], stackedRange[1] + range[1]];
        }, [0, 0]);
        // Get min / max extent for non-stacked layers
        return totalRangeValues.concat(stackedRange);
      }, [0, 0]);
      var totalRange = d3Array.extent(totalRangeValues);
      if (domains[this.axisName]) domains[this.axisName] = totalRange;
      return domains;
    }
    /**
    * @override
    * Y coordinate calculation considers position is being stacked
    */

  }, {
    key: 'getScreenY',
    value: function getScreenY(datum, yAccessor) {
      var stackGroups = _lodash2.default.groupBy(this.params.activeAccessorData, 'stack');
      var stackName = _lodash2.default.find(this.params.activeAccessorData, function (config) {
        return config.accessor === yAccessor;
      }).stack;
      var stackedValue = 0;
      _lodash2.default.takeWhile(stackGroups[stackName], function (accessorConfig) {
        stackedValue += _lodash2.default.get(datum, accessorConfig.accessor) || 0;
        return accessorConfig.accessor !== yAccessor;
      });
      return this.yScale(stackedValue);
    }
    /**
     * Render all areas in a single stack unless specific stack names specified
     */

  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      _get(AreaChartView.prototype.__proto__ || Object.getPrototypeOf(AreaChartView.prototype), 'render', this).call(this);
      var data = this.model.data;
      var xAccessor = this.config.get('plot.x.accessor');
      var area = d3Shape.area().x(function (d) {
        return _this3.xScale(_lodash2.default.get(d.data, xAccessor));
      }).y0(function (d) {
        return _this3.yScale(d[1]);
      }).y1(function (d) {
        return _this3.yScale(d[0]);
      }).curve(this.config.get('curve'));

      var stackGroups = _lodash2.default.groupBy(this.params.activeAccessorData, 'stack');
      _lodash2.default.each(stackGroups, function (accessorsByStack, stackName) {
        var stack = d3Shape.stack().offset(d3Shape.stackOffsetNone).keys(_lodash2.default.map(accessorsByStack, 'accessor')).value(function (d, key) {
          return _lodash2.default.get(d, key);
        });

        var areas = _this3.d3.selectAll(_this3.selectors.node + '-' + stackName).data(stack(data));
        areas.exit().remove();
        areas.enter().append('path').attr('class', function (d) {
          return _this3.selectorClass('node') + ' ' + _this3.selectorClass('node') + '-' + d.key + ' ' + _this3.selectorClass('node') + '-' + stackName;
        }).merge(areas).transition().ease(d3Ease.easeLinear).duration(_this3.params.duration).attr('fill', function (d) {
          return _this3.config.getColor([], _lodash2.default.find(accessorsByStack, { accessor: d.key }));
        }).attr('d', area);
      });

      // Remove areas from non-updated stacks
      var updatedAreaClasses = _lodash2.default.reduce(_lodash2.default.keys(stackGroups), function (sum, key) {
        return sum ? sum + ', ' + _this3.selectors.node + '-' + key : _this3.selectors.node + '-' + key;
      }, '');
      var updatedAreaEls = updatedAreaClasses ? this.el.querySelectorAll(updatedAreaClasses) : [];
      var updatedAreas = _lodash2.default.difference(this.el.querySelectorAll(this.selectors.node), updatedAreaEls);
      _lodash2.default.each(updatedAreas, function (area) {
        return area.remove();
      });
    }

    // Event handlers

  }, {
    key: '_onMousemove',
    value: function _onMousemove(d, el) {
      var tooltipId = this.params.activeAccessorData[d.index].tooltip;
      if (tooltipId) {
        var _d3Selection$mouse = d3Selection.mouse(this._container),
            _d3Selection$mouse2 = _slicedToArray(_d3Selection$mouse, 2),
            left = _d3Selection$mouse2[0],
            top = _d3Selection$mouse2[1];

        var xAccessor = this.config.get('plot.x.accessor');
        var xVal = this.xScale.invert(left);
        var dataItem = this.model.getNearest(xAccessor, xVal);
        _Actionman2.default.fire('ShowComponent', tooltipId, { left: left, top: top }, dataItem);
      }
      el.classList.add(this.selectorClass('active'));
    }
  }, {
    key: 'zIndex',
    get: function get() {
      return 2;
    }
    /**
     * follow same naming convention for all XY chart sub views
     */

  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(AreaChartView.prototype.__proto__ || Object.getPrototypeOf(AreaChartView.prototype), 'selectors', this), {
        node: '.area'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return {
        'mousemove node': '_onMousemove',
        'mouseout node': '_onMouseout'
      };
    }
  }]);

  return AreaChartView;
}(_XYChartSubView3.default);

exports.default = AreaChartView;

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

var _d3Array = __webpack_require__(0);

var d3Array = _interopRequireWildcard(_d3Array);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _XYChartSubView2 = __webpack_require__(13);

var _XYChartSubView3 = _interopRequireDefault(_XYChartSubView2);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

__webpack_require__(49);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var BarChartView = function (_XYChartSubView) {
  _inherits(BarChartView, _XYChartSubView);

  function BarChartView() {
    _classCallCheck(this, BarChartView);

    return _possibleConstructorReturn(this, (BarChartView.__proto__ || Object.getPrototypeOf(BarChartView)).apply(this, arguments));
  }

  _createClass(BarChartView, [{
    key: 'getScreenX',
    value: function getScreenX(datum, xAccessor, yAccessor) {
      var _this2 = this;

      var delta = 0;
      _lodash2.default.each(this.params.activeAccessorData, function (accessor, j) {
        if (accessor.accessor === yAccessor) {
          var innerBandScale = _this2.params.axis[_this2.config.get('plot.x.axis')].innerBandScale;
          delta = innerBandScale(j) + innerBandScale.bandwidth() / 2;
        }
      });
      return this.xScale(_lodash2.default.get(datum, xAccessor)) + delta;
    }
  }, {
    key: 'getScreenY',
    value: function getScreenY(datum, yAccessor) {
      return this.yScale(_lodash2.default.get(datum, yAccessor));
    }
  }, {
    key: 'render',
    value: function render() {
      _get(BarChartView.prototype.__proto__ || Object.getPrototypeOf(BarChartView.prototype), 'render', this).call(this);

      // Create a flat data structure
      var numOfAccessors = _lodash2.default.keys(this.params.activeAccessorData).length;
      var bandWidthHalf = this.bandWidth / 2;
      var innerBandScale = d3Scale.scaleBand().domain(d3Array.range(numOfAccessors)).range([-bandWidthHalf, bandWidthHalf]).paddingInner(0.05).paddingOuter(0.05);
      this.params.axis[this.params.plot.x.axis].innerBandScale = innerBandScale;
      // Render the flat data structure
      var svgBarGroups = this.d3.selectAll(this.selectors.node).data(this._prepareData(), function (d) {
        return d.id;
      });
      svgBarGroups.enter().append('rect').attr('class', function (d) {
        return 'bar';
      }).attr('x', function (d) {
        return d.x;
      }).attr('y', this.yScale.range()[0]).attr('height', 0).attr('width', function (d) {
        return d.w;
      }).merge(svgBarGroups).transition().ease(d3Ease.easeLinear).duration(this.params.duration).attr('fill', function (d) {
        return d.color;
      }).attr('x', function (d) {
        return d.x;
      }).attr('y', function (d) {
        return d.y;
      }).attr('height', function (d) {
        return d.h;
      }).attr('width', function (d) {
        return d.w;
      });
      svgBarGroups.exit().remove();
    }
  }, {
    key: '_prepareData',
    value: function _prepareData() {
      var _this3 = this;

      var flatData = [];
      var start = this.yScale.domain()[0];
      var innerBandScale = this.params.axis[this.config.get('plot.x.axis')].innerBandScale;
      var innerBandWidth = innerBandScale.bandwidth();
      _lodash2.default.each(this.model.data, function (d) {
        var x = _lodash2.default.get(d, _this3.config.get('plot.x.accessor'));
        _lodash2.default.each(_this3.params.activeAccessorData, function (accessor, j) {
          var key = accessor.accessor;
          var obj = {
            id: x + '-' + key,
            x: _this3.xScale(x) + innerBandScale(j),
            y: _this3.yScale(_lodash2.default.get(d, key)),
            h: _this3.yScale(start) - _this3.yScale(_lodash2.default.get(d, key)),
            w: innerBandWidth,
            color: _this3.config.getColor(d, accessor),
            accessor: accessor,
            data: d
          };
          flatData.push(obj);
        });
      });
      return flatData;
    }

    // Event handlers

  }, {
    key: '_onMousemove',
    value: function _onMousemove(d, el, event) {
      if (d.accessor.tooltip) {
        var _d3Selection$mouse = d3Selection.mouse(this._container),
            _d3Selection$mouse2 = _slicedToArray(_d3Selection$mouse, 2),
            left = _d3Selection$mouse2[0],
            top = _d3Selection$mouse2[1];

        _Actionman2.default.fire('ShowComponent', d.accessor.tooltip, { left: left, top: top }, d.data);
      }
      el.classList.add(this.selectorClass('active'));
    }
  }, {
    key: 'zIndex',
    get: function get() {
      return 1;
    }
    /**
     * follow same naming convention for all XY chart sub views
     */

  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(BarChartView.prototype.__proto__ || Object.getPrototypeOf(BarChartView.prototype), 'selectors', this), {
        node: '.bar'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return {
        'mousemove node': '_onMousemove',
        'mouseout node': '_onMouseout'
      };
    }
    /**
     * @override
     */

  }, {
    key: 'xMarginInner',
    get: function get() {
      if (this.model.data.length < 2) return 0;
      return this.bandWidth / 2;
    }
  }, {
    key: 'bandWidth',
    get: function get() {
      if (_lodash2.default.isEmpty(this.model.data)) return 0;
      var paddedPart = 1 - this.config.get('barPadding') / 2 / 100;
      // TODO do not use model.data.length as there can be gaps
      // or fill the gaps in it beforehand
      return this.outerWidth / this.model.data.length * paddedPart;
    }
  }]);

  return BarChartView;
}(_XYChartSubView3.default);

exports.default = BarChartView;

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Array = __webpack_require__(0);

var d3Array = _interopRequireWildcard(_d3Array);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3InterpolatePath = __webpack_require__(170);

__webpack_require__(48);

var _d3Shape = __webpack_require__(0);

var d3Shape = _interopRequireWildcard(_d3Shape);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

var _XYChartSubView2 = __webpack_require__(13);

var _XYChartSubView3 = _interopRequireDefault(_XYChartSubView2);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

__webpack_require__(177);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var LineChartView = function (_XYChartSubView) {
  _inherits(LineChartView, _XYChartSubView);

  function LineChartView() {
    _classCallCheck(this, LineChartView);

    return _possibleConstructorReturn(this, (LineChartView.__proto__ || Object.getPrototypeOf(LineChartView)).apply(this, arguments));
  }

  _createClass(LineChartView, [{
    key: 'render',


    /**
     * Draw one line (path) per each Y accessor.
     */
    value: function render() {
      var _this2 = this;

      _get(LineChartView.prototype.__proto__ || Object.getPrototypeOf(LineChartView.prototype), 'render', this).call(this);
      var data = this.model.data;
      var xAccessor = this.config.get('plot.x.accessor');

      // Collect linePathData - one line per Y accessor.
      var linePathData = [];
      this._lines = {};

      _lodash2.default.each(this.params.activeAccessorData, function (accessor) {
        var key = accessor.accessor;
        _this2._lines[key] = d3Shape.line().x(function (d) {
          return _this2.xScale(_lodash2.default.get(d, xAccessor));
        }).y(function (d) {
          return _this2.yScale(_lodash2.default.get(d, key));
        }).curve(_this2.config.get('curve'));
        linePathData.push({ key: key, accessor: accessor, data: data });
      });
      var svgLines = this.d3.selectAll(this.selectors.node).data(linePathData, function (d) {
        return d.key;
      });

      svgLines.enter().append('path').attr('class', function (d) {
        return 'line line-' + d.key;
      }).attr('d', function (d) {
        return _this2._lines[d.key](d.data[0]);
      }).transition().ease(d3Ease.easeLinear).duration(this.params.duration).attrTween('d', this._interpolate.bind(this)).attr('stroke', function (d) {
        return _this2.config.getColor(d.data, d.accessor);
      });

      svgLines.transition().ease(d3Ease.easeLinear).duration(this.params.duration).attrTween('d', function (d, i, els) {
        var previous = els[i].getAttribute('d');
        var current = _this2._lines[d.key](d.data);
        return (0, _d3InterpolatePath.interpolatePath)(previous, current);
      }).attr('stroke', function (d) {
        return _this2.config.getColor(d.data, d.accessor);
      });
      svgLines.exit().remove();
    }
    /**
     * Draw line along the path
     */

  }, {
    key: '_interpolate',
    value: function _interpolate(d) {
      var _this3 = this;

      var interpolate = d3Scale.scaleQuantile().domain([0, 1]).range(d3Array.range(1, d.data.length + 1));

      return function (t) {
        var interpolatedLine = d.data.slice(0, interpolate(t));
        return _this3._lines[d.key](interpolatedLine);
      };
    }

    // Event handlers

  }, {
    key: '_onMouseover',
    value: function _onMouseover(d, el) {
      if (d.accessor.tooltip) {
        var _d3Selection$mouse = d3Selection.mouse(this._container),
            _d3Selection$mouse2 = _slicedToArray(_d3Selection$mouse, 2),
            left = _d3Selection$mouse2[0],
            top = _d3Selection$mouse2[1];

        var xAccessor = this.config.get('plot.x.accessor');
        var xVal = this.xScale.invert(left);
        var dataItem = this.model.getNearest(xAccessor, xVal);
        _Actionman2.default.fire('ShowComponent', d.accessor.tooltip, { left: left, top: top }, dataItem);
      }
      el.classList.add(this.selectorClass('active'));
    }
  }, {
    key: 'zIndex',
    get: function get() {
      return 3;
    }
    /**
     * follow same naming convention for all XY chart sub views
     */

  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(LineChartView.prototype.__proto__ || Object.getPrototypeOf(LineChartView.prototype), 'selectors', this), {
        node: '.line'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return {
        'mouseover node': '_onMouseover',
        'mouseout node': '_onMouseout'
      };
    }
  }]);

  return LineChartView;
}(_XYChartSubView3.default);

exports.default = LineChartView;

/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

__webpack_require__(48);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _XYChartSubView2 = __webpack_require__(13);

var _XYChartSubView3 = _interopRequireDefault(_XYChartSubView2);

var _BucketConfigModel = __webpack_require__(160);

var _BucketConfigModel2 = _interopRequireDefault(_BucketConfigModel);

var _BucketView = __webpack_require__(161);

var _BucketView2 = _interopRequireDefault(_BucketView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

__webpack_require__(178);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var ScatterPlotView = function (_XYChartSubView) {
  _inherits(ScatterPlotView, _XYChartSubView);

  function ScatterPlotView(p) {
    _classCallCheck(this, ScatterPlotView);

    var _this = _possibleConstructorReturn(this, (ScatterPlotView.__proto__ || Object.getPrototypeOf(ScatterPlotView)).call(this, p));

    var bucketConfig = _this.config.get('bucket');
    if (bucketConfig) {
      _this._bucketConfigModel = new _BucketConfigModel2.default(bucketConfig);
      _this._bucketConfigModel.set('clip', _this._parent.clip);
      _this._bucketConfigModel.parent = _this.config;
      _this._bucketView = new _BucketView2.default({
        config: _this._bucketConfigModel,
        actionman: _this._actionman
      });
    }
    return _this;
  }

  _createClass(ScatterPlotView, [{
    key: 'combineDomains',

    /**
     * @return {Object} like:  y1: [0,10], x: [-10,10]
     */
    value: function combineDomains() {
      var _this2 = this;

      var domains = _get(ScatterPlotView.prototype.__proto__ || Object.getPrototypeOf(ScatterPlotView.prototype), 'combineDomains', this).call(this);
      var accessorsBySizeAxis = _lodash2.default.groupBy(this.params.activeAccessorData, 'sizeAxis');
      _lodash2.default.each(accessorsBySizeAxis, function (accessors, axis) {
        var validAccessors = _lodash2.default.filter(accessors, function (a) {
          return a.sizeAccessor && a.shape;
        });
        var validAccessorNames = _lodash2.default.map(validAccessors, 'sizeAccessor');

        domains[axis] = _this2.model.combineDomains(validAccessorNames);
      });
      return domains;
    }
  }, {
    key: 'render',
    value: function render() {
      _get(ScatterPlotView.prototype.__proto__ || Object.getPrototypeOf(ScatterPlotView.prototype), 'render', this).call(this);
      var data = this._prepareData();
      if (this._bucketView) {
        this._bucketView.container = this._container;
        this._bucketView.render(data);
      }

      var points = this.d3.selectAll(this.selectors.node).data(data, function (d) {
        return d.id;
      });

      points.enter().append('text').classed('point', true).attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      }).merge(points).html(function (d) {
        return d.accessor.shape;
      })
      // overlap attribute is set in Bucket View
      .attr('fill', function (d) {
        return d.overlap ? 'none' : d.color;
      }).style('font-size', function (d) {
        return Math.sqrt(d.area);
      });

      // Update
      points.transition().ease(d3Ease.easeLinear).duration(this.config.get('duration')).attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

      points.exit().remove();
      if (this._bucketView) this.svg.delegate('click', 'svg', this._onBackgroundClick.bind(this));
    }
    /**
     * Create a flat data structure
     */

  }, {
    key: '_prepareData',
    value: function _prepareData() {
      var _this3 = this;

      var xAccessor = this.config.get('plot.x.accessor');
      var points = [];
      _lodash2.default.map(this.model.data, function (d) {
        var x = _lodash2.default.get(d, xAccessor);
        _lodash2.default.each(_this3.params.activeAccessorData, function (accessor) {
          var key = accessor.accessor;
          if (!_lodash2.default.isNil(_lodash2.default.get(d, key))) {
            // key may not exist in all the data set.
            var sizeScale = _this3.params.axis[accessor.sizeAxis].scale;
            var obj = {
              id: x + '-' + key,
              x: _this3.xScale(x),
              y: _this3.yScale(_lodash2.default.get(d, key)),
              area: sizeScale(_lodash2.default.get(d, accessor.sizeAccessor)),
              color: _this3.config.getColor(d, accessor),
              accessor: accessor,
              data: d,
              halfWidth: Math.sqrt(sizeScale(_lodash2.default.get(d, accessor.sizeAccessor))) / 2,
              halfHeight: Math.sqrt(sizeScale(_lodash2.default.get(d, accessor.sizeAccessor))) / 2
            };
            points.push(obj);
          }
        });
      });
      return points;
    }

    // Event handlers

  }, {
    key: '_onMouseover',
    value: function _onMouseover(d, el, event) {
      if (d.accessor.tooltip) {
        var _d3Selection$mouse = d3Selection.mouse(this._container),
            _d3Selection$mouse2 = _slicedToArray(_d3Selection$mouse, 2),
            left = _d3Selection$mouse2[0],
            top = _d3Selection$mouse2[1];

        _Actionman2.default.fire('ShowComponent', d.accessor.tooltip, { left: left, top: top }, d.data);
      }
      el.classList.add(this.selectorClass('active'));
    }
  }, {
    key: '_onBackgroundClick',
    value: function _onBackgroundClick() {
      var accessor = this.config.get('plot.x.accessor');
      this.actionman.fire('Zoom', null, _defineProperty({}, accessor, this.model.getRangeFor(accessor, true)));
    }
  }, {
    key: 'zIndex',
    get: function get() {
      return 1;
    }
    /**
     * follow same naming convention for all XY chart sub views
     */

  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(ScatterPlotView.prototype.__proto__ || Object.getPrototypeOf(ScatterPlotView.prototype), 'selectors', this), {
        node: '.point'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return {
        'mouseover node': '_onMouseover',
        'mouseout node': '_onMouseout'
      };
    }
  }]);

  return ScatterPlotView;
}(_XYChartSubView3.default);

exports.default = ScatterPlotView;

/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _XYChartSubView2 = __webpack_require__(13);

var _XYChartSubView3 = _interopRequireDefault(_XYChartSubView2);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

__webpack_require__(49);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var StackedBarChartView = function (_XYChartSubView) {
  _inherits(StackedBarChartView, _XYChartSubView);

  function StackedBarChartView() {
    _classCallCheck(this, StackedBarChartView);

    return _possibleConstructorReturn(this, (StackedBarChartView.__proto__ || Object.getPrototypeOf(StackedBarChartView)).apply(this, arguments));
  }

  _createClass(StackedBarChartView, [{
    key: 'combineDomains',
    value: function combineDomains() {
      var _this2 = this;

      var domains = _get(StackedBarChartView.prototype.__proto__ || Object.getPrototypeOf(StackedBarChartView.prototype), 'combineDomains', this).call(this);
      var topY = _lodash2.default.reduce(this.params.activeAccessorData, function (sum, accessor) {
        return sum + _this2.model.getRangeFor(accessor.accessor)[1];
      }, 0);
      if (domains[this.axisName]) domains[this.axisName][1] = topY;
      return domains;
    }
    /**
    * @override
    * Y coordinate calculation considers position is being stacked
    */

  }, {
    key: 'getScreenY',
    value: function getScreenY(datum, yAccessor) {
      if (_lodash2.default.isNil(_lodash2.default.get(datum, yAccessor))) return undefined;
      var stackedValue = 0;
      _lodash2.default.takeWhile(this.params.activeAccessorData, function (accessorConfig) {
        stackedValue += _lodash2.default.get(datum, accessorConfig.accessor) || 0;
        return accessorConfig.accessor !== yAccessor;
      });
      return this.yScale(stackedValue);
    }
  }, {
    key: 'render',
    value: function render() {
      _get(StackedBarChartView.prototype.__proto__ || Object.getPrototypeOf(StackedBarChartView.prototype), 'render', this).call(this);

      var start = this.yScale.range()[0];
      var barGroups = this.d3.selectAll(this.selectors.node).data(this._prepareData(), function (d) {
        return d.id;
      });
      barGroups.enter().append('rect').attr('class', function (d) {
        return 'bar';
      }).attr('x', function (d) {
        return d.x;
      }).attr('y', start).attr('height', 0).attr('width', function (d) {
        return d.w;
      }).merge(barGroups).transition().ease(d3Ease.easeLinear).duration(this.params.duration).attr('fill', function (d) {
        return d.color;
      }).attr('x', function (d) {
        return d.x;
      }).attr('y', function (d) {
        return d.y;
      }).attr('height', function (d) {
        return d.h;
      }).attr('width', function (d) {
        return d.w;
      });
      barGroups.exit().remove();
    }
  }, {
    key: '_prepareData',
    value: function _prepareData() {
      var _this3 = this;

      var data = this.model.data;
      var start = this.yScale.domain()[0];
      var flatData = [];
      var bandWidthHalf = this.bandWidth / 2;
      _lodash2.default.each(data, function (d) {
        var x = _lodash2.default.get(d, _this3.config.get('plot.x.accessor'));
        var stackedValue = start;
        // y coordinate to stack next bar to
        _lodash2.default.each(_this3.params.activeAccessorData, function (accessor) {
          var key = accessor.accessor;
          var value = _lodash2.default.get(d, key) || 0;
          var obj = {
            id: x + '-' + key,
            x: _this3.xScale(x) - bandWidthHalf,
            y: _this3.yScale(value - start + stackedValue),
            h: _this3.yScale(start) - _this3.yScale(value + (stackedValue === start ? 0 : start)),
            w: _this3.bandWidth,
            color: _this3.config.getColor(d, accessor),
            accessor: accessor,
            data: d
          };
          stackedValue += value;
          flatData.push(obj);
        });
      });
      return flatData;
    }

    // Event handlers

  }, {
    key: '_onMousemove',
    value: function _onMousemove(d, el, event) {
      if (d.accessor.tooltip) {
        var _d3Selection$mouse = d3Selection.mouse(this._container),
            _d3Selection$mouse2 = _slicedToArray(_d3Selection$mouse, 2),
            left = _d3Selection$mouse2[0],
            top = _d3Selection$mouse2[1];

        _Actionman2.default.fire('ShowComponent', d.accessor.tooltip, { left: left, top: top }, d.data);
      }
      el.classList.add(this.selectorClass('active'));
    }
  }, {
    key: 'zIndex',
    get: function get() {
      return 1;
    }
    /**
     * follow same naming convention for all XY chart sub views
     */

  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(StackedBarChartView.prototype.__proto__ || Object.getPrototypeOf(StackedBarChartView.prototype), 'selectors', this), {
        node: '.bar'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return {
        'mousemove node': '_onMousemove',
        'mouseout node': '_onMouseout'
      };
    }
    /**
     * @override
     */

  }, {
    key: 'xMarginInner',
    get: function get() {
      if (this.model.data.length < 2) return 0;
      return this.bandWidth / 2;
    }
    // TODO use memoize function

  }, {
    key: 'bandWidth',
    get: function get() {
      if (_lodash2.default.isEmpty(this.model.data)) return 0;
      var paddedPart = 1 - this.config.get('barPadding') / 2 / 100;
      // TODO do not use model.data.length as there can be gaps
      // or fill the gaps in it beforehand
      return this.outerWidth / this.model.data.length * paddedPart;
    }
  }]);

  return StackedBarChartView;
}(_XYChartSubView3.default);

exports.default = StackedBarChartView;

/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var ControlPanelConfigModel = function (_ContrailChartsConfig) {
  _inherits(ControlPanelConfigModel, _ContrailChartsConfig);

  function ControlPanelConfigModel() {
    _classCallCheck(this, ControlPanelConfigModel);

    return _possibleConstructorReturn(this, (ControlPanelConfigModel.__proto__ || Object.getPrototypeOf(ControlPanelConfigModel)).apply(this, arguments));
  }

  _createClass(ControlPanelConfigModel, [{
    key: 'menuItems',
    get: function get() {
      return {
        Refresh: {
          title: 'Refresh chart',
          icon: 'fa fa-refresh'
        },
        Freeze: {
          title: 'Stop Live Update',
          icon: 'fa fa-stop'
        },
        Unfreeze: {
          title: 'Start Live Update',
          icon: 'fa fa-play'
        },
        ColorPicker: {
          title: 'Select color for serie',
          icon: 'fa fa-eyedropper'
        },
        Filter: {
          title: 'Select serie to show',
          icon: 'fa fa-filter'
        }
      };
    }
  }]);

  return ControlPanelConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = ControlPanelConfigModel;

/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } }; /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */


var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

var _controlPanel = __webpack_require__(196);

var _controlPanel2 = _interopRequireDefault(_controlPanel);

var _panel = __webpack_require__(197);

var _panel2 = _interopRequireDefault(_panel);

var _action = __webpack_require__(195);

var _action2 = _interopRequireDefault(_action);

__webpack_require__(179);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ControlPanelView = function (_ContrailChartsView) {
  _inherits(ControlPanelView, _ContrailChartsView);

  function ControlPanelView() {
    var _ref;

    _classCallCheck(this, ControlPanelView);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = ControlPanelView.__proto__ || Object.getPrototypeOf(ControlPanelView)).call.apply(_ref, [this].concat(args)));

    _get(ControlPanelView.prototype.__proto__ || Object.getPrototypeOf(ControlPanelView.prototype), 'render', _this).call(_this, (0, _controlPanel2.default)());
    _this._opened = false;
    _this.render();
    _this.listenTo(_this.config, 'change', _this.render);
    return _this;
  }

  _createClass(ControlPanelView, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var configs = _lodash2.default.map(this.config.get('menu'), function (config) {
        return _lodash2.default.extend({}, config, _this2.config.menuItems[config.id]);
      });
      var menuItemsDiv = this.d3.select(this.selectors.menuItems);

      var menuItems = menuItemsDiv.selectAll(this.selectors.menuItem).data(configs, function (config) {
        return config.id;
      }).classed('disabled', function (d) {
        return d.disabled;
      });

      menuItems.enter().append('div').classed(this.selectorClass('menuItem'), true).classed('disabled', function (d) {
        return d.disabled;
      }).html(function (d) {
        return (0, _action2.default)(d);
      });

      menuItems.exit().remove();
    }
  }, {
    key: 'addMenuItem',
    value: function addMenuItem(config) {
      this.config.set(this.config.get('menu').push(config));
    }
  }, {
    key: 'removeMenuItem',
    value: function removeMenuItem(id) {
      this.el.querySelector('[data-id="' + id + '"]').remove();
    }
  }, {
    key: 'enableMenuItem',
    value: function enableMenuItem(id) {}
  }, {
    key: 'disableMenuItem',
    value: function disableMenuItem(id) {}
  }, {
    key: 'open',
    value: function open(config) {
      var panel = this.el.querySelector(this.selectors.panel);
      panel.innerHTML = (0, _panel2.default)(config);
      var container = panel.querySelector(this.selectors.container);
      panel.classList.toggle('hide');
      var actionId = this._opened ? 'HideComponent' : 'ShowComponent';
      this._opened = !this._opened;
      _Actionman2.default.fire(actionId, config.component, container);
    }

    // Event handlers

  }, {
    key: '_onMenuItemClick',
    value: function _onMenuItemClick(d, el) {
      d3Selection.event.stopPropagation();
      if (d.component) this.open(d);else _Actionman2.default.fire(d.id, d);
    }
  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend({}, _get(ControlPanelView.prototype.__proto__ || Object.getPrototypeOf(ControlPanelView.prototype), 'selectors', this), {
        panel: '.panel',
        menuItem: '.control-panel-item',
        menuItems: '.control-panel-items',
        container: '.control-panel-expanded-container'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return {
        'click menuItem': '_onMenuItemClick'
      };
    }
  }]);

  return ControlPanelView;
}(_contrailChartsView2.default);

exports.default = ControlPanelView;

/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
* This CrosshairConfigModel is designed to prepare data for CrosshairView based on the CompositeYChartView.
*/
var CrosshairConfigModel = function (_ContrailChartsConfig) {
  _inherits(CrosshairConfigModel, _ContrailChartsConfig);

  function CrosshairConfigModel() {
    _classCallCheck(this, CrosshairConfigModel);

    return _possibleConstructorReturn(this, (CrosshairConfigModel.__proto__ || Object.getPrototypeOf(CrosshairConfigModel)).apply(this, arguments));
  }

  _createClass(CrosshairConfigModel, [{
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(CrosshairConfigModel.prototype.__proto__ || Object.getPrototypeOf(CrosshairConfigModel.prototype), 'defaults', this), {
        // by default will use common shared container under the parent
        isSharedContainer: true,
        duration: 100,
        bubbleR: 5
      });
    }
  }]);

  return CrosshairConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = CrosshairConfigModel;

/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

__webpack_require__(180);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var CrosshairView = function (_ContrailChartsView) {
  _inherits(CrosshairView, _ContrailChartsView);

  function CrosshairView(p) {
    _classCallCheck(this, CrosshairView);

    var _this = _possibleConstructorReturn(this, (CrosshairView.__proto__ || Object.getPrototypeOf(CrosshairView)).call(this, p));

    _this.render();
    _this.listenTo(_this.config, 'change', _this.render);
    return _this;
  }

  _createClass(CrosshairView, [{
    key: 'show',

    /**
     * @param data
     * @param {Array [x, y]} point mouse offset relative to svg container
     * @param config
     */
    value: function show(data, point, config) {
      var _this2 = this;

      if (!data) return this.hide();

      if (point[0] < config.x1 || point[0] > config.x2 || point[1] < config.y1 || point[1] > config.y2) {
        return this.hide();
      }
      // Draw crosshair line
      var lines = this.d3.selectAll(this.selectors.node).data([config.line]);
      var linesEnter = lines.enter().append('g').attr('class', this.selectorClass('node'));
      linesEnter.attr('transform', function (d) {
        return 'translate(' + d.x(data) + ', 0)';
      }).merge(lines).transition().ease(d3Ease.easeLinear).duration(this.config.get('duration')).attr('transform', function (d) {
        return 'translate(' + d.x(data) + ', 0)';
      });
      linesEnter.append('line').attr('class', this.selectorClass('line')).attr('x1', 0).attr('x2', 0).attr('y1', function (d) {
        return d.y1;
      }).attr('y2', function (d) {
        return d.y2;
      });
      linesEnter.append('text').attr('class', this.selectorClass('text')).attr('y', function (d) {
        return d.y1 + 15;
      }).text(function (d) {
        return d.text(data);
      });
      var update = linesEnter.merge(lines);
      update.selectAll(this.selectors.line).attr('y1', function (d) {
        return d.y1;
      }).attr('y2', function (d) {
        return d.y2;
      });
      update.selectAll(this.selectors.text).attr('y', function (d) {
        return d.y1 + 15;
      }).text(function (d) {
        return d.text(data);
      });

      // Draw bubbles for all enabled y accessors.
      update.each(function (d, i, els) {
        var bubbleData = _lodash2.default.filter(config.bubbles, function (bubble) {
          return !!_lodash2.default.get(data, bubble.id);
        });
        var bubbles = d3Selection.select(els[i]).selectAll(_this2.selectors.bubble).data(bubbleData, function (d) {
          return d.id;
        });
        bubbles.enter().append('circle').classed(_this2.selectorClass('bubble'), true).attr('cx', 0).attr('cy', function (d) {
          return d.y(data);
        }).attr('fill', function (d) {
          return d.color;
        }).attr('r', 0).merge(bubbles).transition().ease(d3Ease.easeLinear).duration(_this2.config.get('duration')).attr('cy', function (d) {
          return d.y(data);
        }).attr('r', _this2.config.get('bubbleR'));
        bubbles.exit().remove();
      });
      lines.exit().remove();

      // Show tooltip
      var tooltipPosition = {
        left: this.svgOffset.left + point[0],
        top: this.svgOffset.top + point[1]
      };
      var tooltipOptions = { placement: 'horizontal' };
      _Actionman2.default.fire('ShowComponent', this.config.get('tooltip'), tooltipPosition, data, tooltipOptions);
    }
  }, {
    key: 'hide',
    value: function hide() {
      var lines = this.d3.selectAll(this.selectors.node).data([]);
      lines.exit().remove();

      _Actionman2.default.fire('HideComponent', this.config.get('tooltip'));
    }
  }, {
    key: 'tagName',
    get: function get() {
      return 'g';
    }
  }, {
    key: 'zIndex',
    get: function get() {
      return 9;
    }
    /**
     * follow same naming convention for all XY chart sub views
     */

  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(CrosshairView.prototype.__proto__ || Object.getPrototypeOf(CrosshairView.prototype), 'selectors', this), {
        node: '.crosshair-line',
        line: '.x-line',
        text: '.x-text',
        bubble: '.bubble'
      });
    }
  }]);

  return CrosshairView;
}(_contrailChartsView2.default);

exports.default = CrosshairView;

/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var FilterConfigModel = function (_ContrailChartsConfig) {
  _inherits(FilterConfigModel, _ContrailChartsConfig);

  function FilterConfigModel() {
    _classCallCheck(this, FilterConfigModel);

    return _possibleConstructorReturn(this, (FilterConfigModel.__proto__ || Object.getPrototypeOf(FilterConfigModel)).apply(this, arguments));
  }

  _createClass(FilterConfigModel, [{
    key: 'data',
    get: function get() {
      var _this2 = this;

      var accessors = this._parent.getAccessors();
      var data = _lodash2.default.map(accessors, function (accessor) {
        return {
          key: accessor.accessor,
          label: _this2.getLabel(undefined, accessor),
          enabled: accessor.enabled
        };
      });
      return data;
    }
  }]);

  return FilterConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = FilterConfigModel;

/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

var _filter = __webpack_require__(198);

var _filter2 = _interopRequireDefault(_filter);

__webpack_require__(181);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var FilterView = function (_ContrailChartsView) {
  _inherits(FilterView, _ContrailChartsView);

  _createClass(FilterView, null, [{
    key: 'dataType',
    get: function get() {
      return 'DataFrame';
    }
  }]);

  function FilterView(p) {
    _classCallCheck(this, FilterView);

    var _this = _possibleConstructorReturn(this, (FilterView.__proto__ || Object.getPrototypeOf(FilterView)).call(this, p));

    _this.listenTo(_this.model, 'change', _this.render);
    _this.listenTo(_this.config, 'change', _this.render);
    return _this;
  }

  _createClass(FilterView, [{
    key: 'render',
    value: function render() {
      var template = this.config.get('template') || _filter2.default;
      var content = template(this.config.data);

      _get(FilterView.prototype.__proto__ || Object.getPrototypeOf(FilterView.prototype), 'render', this).call(this, content);
      this.d3.classed('hide', this.config.get('embedded') && !this._visible);
    }
  }, {
    key: '_onItemClick',
    value: function _onItemClick(d, el) {
      d3Selection.event.stopPropagation();
      var accessorName = el.value;
      var isChecked = el.checked;
      _Actionman2.default.fire('SelectSerie', accessorName, isChecked);
    }
  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend({}, _get(FilterView.prototype.__proto__ || Object.getPrototypeOf(FilterView.prototype), 'selectors', this), {
        item: '.filter-item-input'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return {
        'change item': '_onItemClick'
      };
    }
  }]);

  return FilterView;
}(_contrailChartsView2.default);

exports.default = FilterView;

/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

var _ColoredChart = __webpack_require__(10);

var _ColoredChart2 = _interopRequireDefault(_ColoredChart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var chartTypeIconMap = {
  'BarChart': 'fa-bar-chart',
  'StackedBarChart': 'fa-signal', // Todo find something better
  'LineChart': 'fa-line-chart',
  'AreaChart': 'fa-area-chart',
  'PieChart': 'fa-pie-chart'
};

var LegendPanelConfigModel = function (_ContrailChartsConfig) {
  _inherits(LegendPanelConfigModel, _ContrailChartsConfig);

  function LegendPanelConfigModel() {
    _classCallCheck(this, LegendPanelConfigModel);

    return _possibleConstructorReturn(this, (LegendPanelConfigModel.__proto__ || Object.getPrototypeOf(LegendPanelConfigModel)).apply(this, arguments));
  }

  _createClass(LegendPanelConfigModel, [{
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(LegendPanelConfigModel.prototype.__proto__ || Object.getPrototypeOf(LegendPanelConfigModel.prototype), 'defaults', this), _ColoredChart2.default.defaults, {
        editable: {
          colorSelector: true,
          chartSelector: true
        },
        filter: true,
        placement: 'horizontal'
      });
    }
  }, {
    key: 'data',
    get: function get() {
      var _this2 = this;

      var accessors = this._parent.getAccessors();
      var axesCount = _lodash2.default.chain(accessors).map('axis').uniq().value().length;

      var possibleChartTypes = [];
      _lodash2.default.each(this._parent.attributes.possibleChartTypes, function (chartTypes, axisLabel) {
        possibleChartTypes = _lodash2.default.concat(possibleChartTypes, _lodash2.default.map(chartTypes, function (chartType) {
          return {
            axisLabel: axisLabel,
            chartType: chartType,
            chartIcon: chartTypeIconMap[chartType]
          };
        }));
      });

      var data = {
        colors: this.attributes.colorScheme,
        possibleChartTypes: possibleChartTypes,
        editable: this.attributes.editable.colorSelector || this.attributes.editable.chartSelector,
        axesCount: axesCount
      };

      data.attributes = _lodash2.default.map(accessors, function (accessor) {
        return {
          accessor: accessor.accessor,
          axis: accessor.axis,
          label: _this2.getLabel([], accessor),
          color: _this2._parent.getColor([], accessor),
          chartType: accessor.chart,
          chartIcon: chartTypeIconMap[accessor.chart],
          checked: _this2.attributes.filter ? accessor.enabled : true,
          shape: accessor.shape
        };
      });

      return data;
    }
  }]);

  return LegendPanelConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = LegendPanelConfigModel;

/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _jquery = __webpack_require__(51);

var _jquery2 = _interopRequireDefault(_jquery);

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _d3Color = __webpack_require__(11);

var d3Color = _interopRequireWildcard(_d3Color);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

var _legend = __webpack_require__(199);

var _legend2 = _interopRequireDefault(_legend);

__webpack_require__(182);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var _states = {
  DEFAULT: 'default',
  EDIT: 'edit'
};

var LegendPanelView = function (_ContrailChartsView) {
  _inherits(LegendPanelView, _ContrailChartsView);

  function LegendPanelView(p) {
    _classCallCheck(this, LegendPanelView);

    var _this = _possibleConstructorReturn(this, (LegendPanelView.__proto__ || Object.getPrototypeOf(LegendPanelView)).call(this, p));

    _this.listenTo(_this.config, 'change', _this.render);
    _this._state = _states.DEFAULT;
    return _this;
  }

  _createClass(LegendPanelView, [{
    key: 'render',
    value: function render() {
      var template = this.config.get('template') || _legend2.default;
      var content = template(this.config.data);
      _get(LegendPanelView.prototype.__proto__ || Object.getPrototypeOf(LegendPanelView.prototype), 'render', this).call(this, content);

      if (!this.config.attributes.filter || this.config.data.attributes.length === 1) {
        this.d3.selectAll(this.selectors.attribute).classed('disabled', true).select('input').property('disabled', true);
      }

      this.d3.classed('vertical', this.config.attributes.placement === 'vertical');
      this.d3.selectAll('.axis').classed('active', this.config.data.axesCount > 1);
      if (this._state === _states.EDIT) this._setEditState();
    }
  }, {
    key: '_toggleAttribute',
    value: function _toggleAttribute(d, el) {
      var accessorName = (0, _jquery2.default)(el).parents('.attribute').data('accessor');
      var isChecked = el.querySelector('input').checked;
      _Actionman2.default.fire('SelectSerie', accessorName, isChecked);
    }
  }, {
    key: '_setEditState',
    value: function _setEditState() {
      var _this2 = this;

      this.$('.attribute').toggleClass('edit');
      this.d3.selectAll('.selector').classed('active', false);

      this.d3.selectAll(this.selectors.color).classed('hide', !this.config.attributes.editable.colorSelector);
      this.d3.selectAll(this.selectors.chartType).classed('hide', !this.config.attributes.editable.chartSelector);

      _lodash2.default.each(this.el.querySelectorAll(this.selectors.attribute + ' > input'), function (el) {
        el.disabled = _this2._state !== _states.DEFAULT;
      });
    }
  }, {
    key: '_toggleEditMode',
    value: function _toggleEditMode(d, el) {
      this._state = this._state === _states.DEFAULT ? _states.EDIT : _states.DEFAULT;
      this.el.classList.toggle('edit-mode');
      this._setEditState();
    }
  }, {
    key: '_addChartTypes',
    value: function _addChartTypes(attributeAxis) {
      this.d3.selectAll(this.selectors.chartType).classed('show', false).filter(function (d, i, n) {
        return n[i].dataset.axis === attributeAxis;
      }).classed('show', true);
    }
  }, {
    key: '_toggleSelector',
    value: function _toggleSelector(d, el) {
      this._accessor = (0, _jquery2.default)(el).parents('.attribute').data('accessor');

      var selectorElement = this.d3.select('.selector');
      selectorElement.classed('select--color', false).classed('select--chart', false);
      selectorElement.selectAll('.switch').classed('selected', false);

      if (this.el.querySelector('.selector').classList.contains('active')) {
        selectorElement.classed('active', false);
      } else if (el.classList.contains('select--color')) {
        selectorElement.classed('active', true).classed('select--color', true);
        var currentColor = d3Color.color(el.dataset.color);
        selectorElement.selectAll(this.selectors.color).filter(function (d, i, n) {
          return d3Color.color(n[i].dataset.color).toString() === currentColor.toString();
        }).classed('selected', true);
      } else if (el.classList.contains('select--chart')) {
        var currentAttribute = _lodash2.default.find(this.config.data.attributes, { 'accessor': this._accessor });
        this._addChartTypes(currentAttribute.axis);
        selectorElement.classed('active', true).classed('select--chart', true);
        var currentChart = el.dataset.chartType;
        selectorElement.selectAll(this.selectors.chartType).filter(function (d, i, n) {
          return n[i].dataset.chartType === currentChart;
        }).classed('selected', true);
      }

      var elemOffset = (0, _jquery2.default)(el).position();
      elemOffset.top += (0, _jquery2.default)(el).outerHeight() + 1;
      selectorElement.style('top', elemOffset.top + 'px').style('left', elemOffset.left + 'px');
    }
  }, {
    key: '_selectColor',
    value: function _selectColor(d, el) {
      var color = window.getComputedStyle(el).backgroundColor;
      _Actionman2.default.fire('SelectColor', this._accessor, color);
    }
  }, {
    key: '_selectChartType',
    value: function _selectChartType(d, el) {
      var chartType = el.dataset.chartType;
      _Actionman2.default.fire('SelectChartType', this._accessor, chartType);
    }
  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend({}, _get(LegendPanelView.prototype.__proto__ || Object.getPrototypeOf(LegendPanelView.prototype), 'selectors', this), {
        attribute: '.legend-attribute',
        mode: '.edit-legend',
        select: '.select',
        color: '.switch--color',
        chartType: '.switch--chart'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return {
        'change attribute': '_toggleAttribute',
        'click mode': '_toggleEditMode',
        'click select': '_toggleSelector',
        'click color': '_selectColor',
        'click chartType': '_selectChartType'
      };
    }
  }]);

  return LegendPanelView;
}(_contrailChartsView2.default);

exports.default = LegendPanelView;

/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var LegendConfigModel = function (_ContrailChartsConfig) {
  _inherits(LegendConfigModel, _ContrailChartsConfig);

  function LegendConfigModel() {
    _classCallCheck(this, LegendConfigModel);

    return _possibleConstructorReturn(this, (LegendConfigModel.__proto__ || Object.getPrototypeOf(LegendConfigModel)).apply(this, arguments));
  }

  _createClass(LegendConfigModel, [{
    key: 'getData',
    value: function getData(dataProvider) {
      var _this2 = this;

      var accessors = this._parent.getAccessors(dataProvider);
      return _lodash2.default.map(accessors, function (accessor) {
        return {
          label: _this2.getLabel(undefined, accessor),
          color: _this2._parent.getColor([], accessor)
        };
      });
    }
  }]);

  return LegendConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = LegendConfigModel;

/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _legend = __webpack_require__(200);

var _legend2 = _interopRequireDefault(_legend);

__webpack_require__(183);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var LegendView = function (_ContrailChartsView) {
  _inherits(LegendView, _ContrailChartsView);

  function LegendView(p) {
    _classCallCheck(this, LegendView);

    var _this = _possibleConstructorReturn(this, (LegendView.__proto__ || Object.getPrototypeOf(LegendView)).call(this, p));

    _this.listenTo(_this.config, 'change', _this.render);
    _this.listenTo(_this.model, 'change', _this.render);
    return _this;
  }

  _createClass(LegendView, [{
    key: 'render',
    value: function render() {
      var template = this.config.get('template') || _legend2.default;
      var content = template(this.config.getData(this.model));
      _get(LegendView.prototype.__proto__ || Object.getPrototypeOf(LegendView.prototype), 'render', this).call(this, content);
    }
  }]);

  return LegendView;
}(_contrailChartsView2.default);

exports.default = LegendView;

/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _d3Geo = __webpack_require__(0);

var d3Geo = _interopRequireWildcard(_d3Geo);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

var _ColoredChart = __webpack_require__(10);

var _ColoredChart2 = _interopRequireDefault(_ColoredChart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var MapConfigModel = function (_ContrailChartsConfig) {
  _inherits(MapConfigModel, _ContrailChartsConfig);

  function MapConfigModel() {
    _classCallCheck(this, MapConfigModel);

    return _possibleConstructorReturn(this, (MapConfigModel.__proto__ || Object.getPrototypeOf(MapConfigModel)).apply(this, arguments));
  }

  _createClass(MapConfigModel, [{
    key: 'project',
    value: function project(serie) {
      var lon = this.getValue(serie, { accessor: this.get('accessors.longitude') });
      var lat = this.getValue(serie, { accessor: this.get('accessors.latitude') });
      return this.attributes.projection([lon, lat]);
    }
  }, {
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(MapConfigModel.prototype.__proto__ || Object.getPrototypeOf(MapConfigModel.prototype), 'defaults', this), _ColoredChart2.default.defaults, {
        isSharedContainer: true,

        projection: d3Geo.geoMercator(),
        // scale factor to show map at
        // 170 - is the world view for mercator projection
        zoom: 170,

        // grid of meridians and parallels for showing projection distortion
        graticule: false,

        accessors: {
          longitude: 'longitude',
          latitude: 'latitude'
        }
      });
    }
  }]);

  return MapConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = MapConfigModel;

/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3Zoom = __webpack_require__(0);

var d3Zoom = _interopRequireWildcard(_d3Zoom);

var _d3Geo = __webpack_require__(0);

var d3Geo = _interopRequireWildcard(_d3Geo);

var _topojson = __webpack_require__(218);

var topojson = _interopRequireWildcard(_topojson);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

__webpack_require__(184);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var MapView = function (_ContrailChartsView) {
  _inherits(MapView, _ContrailChartsView);

  _createClass(MapView, null, [{
    key: 'dataType',
    get: function get() {
      return 'DataFrame';
    }
  }]);

  function MapView() {
    var _ref;

    _classCallCheck(this, MapView);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = MapView.__proto__ || Object.getPrototypeOf(MapView)).call.apply(_ref, [this].concat(args)));

    _this.listenTo(_this.model, 'change', _this.render);
    _this.listenTo(_this.config, 'change', _this.render);
    _this._onResize = _this._onResize.bind(_this);
    window.addEventListener('resize', _this._onResize);
    return _this;
  }

  _createClass(MapView, [{
    key: 'render',

    /**
     * Draw a world map
     */
    value: function render() {
      this.params = { width: this.width, height: this.height };
      _get(MapView.prototype.__proto__ || Object.getPrototypeOf(MapView.prototype), 'render', this).call(this);
      this._renderLayout();
      this._renderData();
      this._ticking = false;
    }
  }, {
    key: '_renderLayout',
    value: function _renderLayout() {
      var world = this.config.get('map');
      var projection = this.config.get('projection').scale(this.config.get('zoom')).translate([this.params.width / 2, this.params.height / 2]).precision(0.1);
      var zoom = d3Zoom.zoom().scaleExtent([1, 8]).on('zoom', this._onZoom.bind(this));

      this.svg.call(zoom);

      var path = d3Geo.geoPath().projection(projection);

      // TODO
      if (this.config.get('graticule')) {
        var graticule = d3Geo.geoGraticule();

        this.d3.append('path').datum(graticule).attr('class', 'graticule').attr('d', path);

        this.d3.append('defs').append('path').datum({ type: 'Sphere' }).attr('id', 'sphere').attr('d', path);

        this.d3.append('use').attr('class', 'stroke').attr('xlink:href', '#sphere');

        this.d3.append('use').attr('class', 'fill').attr('xlink:href', '#sphere');
      }

      // TODO it may have sense to parametrize this variable to deal with other maps (not world)
      var countries = topojson.feature(world, world.objects.countries).features;
      var boundaries = [topojson.mesh(world, world.objects.countries, function (a, b) {
        return a !== b;
      })];

      this.d3.selectAll(this.selectors.feature).data(countries).enter().insert('path', this.selectors.graticule).attr('class', this.selectorClass('feature')).attr('d', path);

      this.d3.selectAll(this.selectors.boundary).data(boundaries).enter().insert('path', this.selectors.graticule).attr('class', this.selectorClass('boundary')).attr('d', path);
    }
    // TODO temporary method to plot data before integrating with any chart component like scatter plot

  }, {
    key: '_renderData',
    value: function _renderData() {
      var _this2 = this;

      var data = this.model.data;
      this.d3.selectAll('circle').data(data).enter().append('circle').attr('class', this.selectorClass('node')).attr('cx', function (d) {
        return _this2.config.project(d)[0];
      }).attr('cy', function (d) {
        return _this2.config.project(d)[1];
      }).attr('r', 5);
    }
  }, {
    key: 'zoom',
    value: function zoom(transform) {
      this.d3.selectAll(this.selectors.boundary).style('stroke-width', 0.5 / transform.k + 'px');
      this.d3.selectAll('circle').attr('r', 5 / transform.k);
      this.d3.attr('transform', transform);
      this._ticking = false;
    }

    // Event handlers

  }, {
    key: '_onZoom',
    value: function _onZoom() {
      if (!this._ticking) {
        window.requestAnimationFrame(this.zoom.bind(this, d3Selection.event.transform));
        this._ticking = true;
      }
    }
  }, {
    key: '_onMousemove',
    value: function _onMousemove(d, el) {
      var _d3Selection$mouse = d3Selection.mouse(this._container),
          _d3Selection$mouse2 = _slicedToArray(_d3Selection$mouse, 2),
          left = _d3Selection$mouse2[0],
          top = _d3Selection$mouse2[1];

      _Actionman2.default.fire('ShowComponent', this.config.get('tooltip'), { left: left, top: top }, d);
    }
  }, {
    key: '_onMouseout',
    value: function _onMouseout(d, el) {
      _Actionman2.default.fire('HideComponent', this.config.get('tooltip'));
    }
  }, {
    key: 'tagName',
    get: function get() {
      return 'g';
    }
  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(MapView.prototype.__proto__ || Object.getPrototypeOf(MapView.prototype), 'selectors', this), {
        graticule: '.graticule',
        feature: '.feature',
        boundary: '.boundary',
        node: '.point'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return _lodash2.default.extend(_get(MapView.prototype.__proto__ || Object.getPrototypeOf(MapView.prototype), 'events', this), {
        'mousemove node': '_onMousemove',
        'mouseout node': '_onMouseout'
      });
    }
  }, {
    key: 'width',
    get: function get() {
      return this.config.get('width') || this._container.getBoundingClientRect().width;
    }
  }, {
    key: 'height',
    get: function get() {
      return this.config.get('height') || Math.round(this.width / 2);
    }
  }]);

  return MapView;
}(_contrailChartsView2.default);

exports.default = MapView;

/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var MessageConfigModel = function (_ContrailChartsConfig) {
  _inherits(MessageConfigModel, _ContrailChartsConfig);

  function MessageConfigModel() {
    _classCallCheck(this, MessageConfigModel);

    return _possibleConstructorReturn(this, (MessageConfigModel.__proto__ || Object.getPrototypeOf(MessageConfigModel)).apply(this, arguments));
  }

  return MessageConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = MessageConfigModel;

/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

var _message = __webpack_require__(201);

var _message2 = _interopRequireDefault(_message);

var _SendMessage = __webpack_require__(144);

var _SendMessage2 = _interopRequireDefault(_SendMessage);

var _ClearMessage = __webpack_require__(143);

var _ClearMessage2 = _interopRequireDefault(_ClearMessage);

__webpack_require__(185);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Actions = { SendMessage: _SendMessage2.default, ClearMessage: _ClearMessage2.default };

var MessageView = function (_ContrailChartsView) {
  _inherits(MessageView, _ContrailChartsView);

  function MessageView(p) {
    _classCallCheck(this, MessageView);

    var _this = _possibleConstructorReturn(this, (MessageView.__proto__ || Object.getPrototypeOf(MessageView)).call(this, p));

    _this.params.containerList = {};
    _this.render();
    _lodash2.default.each(Actions, function (action) {
      return _Actionman2.default.set(action, _this);
    });
    return _this;
  }

  _createClass(MessageView, [{
    key: 'show',
    value: function show(data) {
      var _this2 = this;

      var msgObj = _lodash2.default.assignIn({
        componentId: 'default',
        action: 'update', // 'new', 'once', 'update'. future: 'dismiss', 'block'
        messages: []
      }, data);
      var template = this.config.get('template') || _message2.default;

      if (!this.params.containerList[msgObj.componentId]) {
        var componentElemD3 = d3Selection.select('#' + msgObj.componentId);

        // TODO el.closest is not supported in IE15
        if (componentElemD3.node() && componentElemD3.node().closest(this.selectors.chart)) {
          this.params.containerList[msgObj.componentId] = componentElemD3;
        }
      }

      var associatedComponent = this.params.containerList[msgObj.componentId];

      if (associatedComponent) {
        if (!associatedComponent.classed(this.selectors.component.substring(1))) {
          // TODO el.closest is not supported in IE15
          associatedComponent = d3Selection.select(associatedComponent.node().closest(this.selectors.component));
        }

        this.d3.remove();
        associatedComponent.append(function () {
          return _this2.d3.node();
        });
      } else {
        console.warn('MessageView.show: invalid componentId (' + msgObj.componentId + ')');
      }

      if (msgObj.action === 'update') {
        // update message so remove any previous messages from this component
        this.clear(msgObj.componentId);
      }
      _lodash2.default.forEach(msgObj.messages, function (msg) {
        _lodash2.default.assignIn(msg, {
          level: msg.level || 'default',
          iconLevel: _this2.selectors.icon[msg.level || 'default'],
          msgLevel: _this2.selectors.message[msg.level || 'default']
        });
      });

      this.$el.html(template(msgObj));

      this.d3.selectAll('[data-action="once"').style('opacity', 1).transition().duration(5000).style('opacity', 1e-06).remove();
    }
  }, {
    key: 'clear',
    value: function clear(componentId) {
      var _this3 = this;

      var messageSelector = '.message-row[data-component-id="' + componentId + '"]';
      this.$(messageSelector).fadeOut('fast', function () {
        _this3.$(messageSelector).remove();
      });
    }
  }, {
    key: 'remove',
    value: function remove() {
      var _this4 = this;

      _get(MessageView.prototype.__proto__ || Object.getPrototypeOf(MessageView.prototype), 'remove', this).call(this);
      _lodash2.default.each(Actions, function (action) {
        return _Actionman2.default.unset(action, _this4);
      });
    }
  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(MessageView.prototype.__proto__ || Object.getPrototypeOf(MessageView.prototype), 'selectors', this), {
        message: {
          default: 'msg-default',
          info: 'msg-info',
          error: 'msg-error',
          warn: 'msg-warn'
        },
        icon: {
          default: 'fa-comment-o',
          info: 'fa-info-circle',
          error: 'fa-times-circle',
          warn: 'fa-exclamation-triangle'
        }
      });
    }
  }]);

  return MessageView;
}(_contrailChartsView2.default);

exports.default = MessageView;

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Action2 = __webpack_require__(6);

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ClearMessage = function (_Action) {
  _inherits(ClearMessage, _Action);

  function ClearMessage(p) {
    _classCallCheck(this, ClearMessage);

    var _this = _possibleConstructorReturn(this, (ClearMessage.__proto__ || Object.getPrototypeOf(ClearMessage)).call(this, p));

    _this._deny = false;
    return _this;
  }

  _createClass(ClearMessage, [{
    key: '_execute',
    value: function _execute(msgObj) {
      this._registrar.clear(msgObj);
    }
  }]);

  return ClearMessage;
}(_Action3.default);

exports.default = ClearMessage;

/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Action2 = __webpack_require__(6);

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SendMessage = function (_Action) {
  _inherits(SendMessage, _Action);

  function SendMessage(p) {
    _classCallCheck(this, SendMessage);

    var _this = _possibleConstructorReturn(this, (SendMessage.__proto__ || Object.getPrototypeOf(SendMessage)).call(this, p));

    _this._deny = false;
    return _this;
  }

  _createClass(SendMessage, [{
    key: '_execute',
    value: function _execute(msgObj) {
      this._registrar.show(msgObj);
    }
  }]);

  return SendMessage;
}(_Action3.default);

exports.default = SendMessage;

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

var _d3Shape = __webpack_require__(0);

var d3Shape = _interopRequireWildcard(_d3Shape);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

var _ColoredChart = __webpack_require__(10);

var _ColoredChart2 = _interopRequireDefault(_ColoredChart);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var NavigationConfigModel = function (_ContrailChartsConfig) {
  _inherits(NavigationConfigModel, _ContrailChartsConfig);

  function NavigationConfigModel() {
    _classCallCheck(this, NavigationConfigModel);

    return _possibleConstructorReturn(this, (NavigationConfigModel.__proto__ || Object.getPrototypeOf(NavigationConfigModel)).apply(this, arguments));
  }

  _createClass(NavigationConfigModel, [{
    key: 'getColor',
    value: function getColor(data, accessor) {
      var configuredColor = _ColoredChart2.default.getColor(data, accessor);
      return configuredColor || this.attributes.colorScale(accessor.accessor);
    }
  }, {
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(NavigationConfigModel.prototype.__proto__ || Object.getPrototypeOf(NavigationConfigModel.prototype), 'defaults', this), _ColoredChart2.default.defaults, {
        // The component width. If not provided will be caculated by View.
        width: undefined,

        // The difference by how much we want to modify the computed width.
        widthDelta: undefined,

        // The component height. If not provided will be caculated by View.
        height: undefined,

        // Scale to transform values from percentage based selection to visual coordinates
        selectionScale: d3Scale.scaleLinear().domain([0, 100]),

        // Default axis ticks if not specified per axis.
        _xTicks: 10,
        _yTicks: 10,

        // Margin between label and chart
        labelMargin: 16,

        marginTop: 25,
        marginBottom: 40,
        marginLeft: 50,
        marginRight: 50,
        marginInner: 10,

        curve: d3Shape.curveCatmullRom.alpha(0.5),

        // The selection to use when first rendered [xMin%, xMax%].
        selection: []
      });
    }
  }, {
    key: 'selectionRange',
    get: function get() {
      this.attributes.selectionScale.range([this.attributes.xRange[0], this.attributes.xRange[1]]);
      if (_lodash2.default.isEmpty(this.attributes.selection)) return [];
      return [this.attributes.selectionScale(this.attributes.selection[0]), this.attributes.selectionScale(this.attributes.selection[1])];
    }
  }]);

  return NavigationConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = NavigationConfigModel;

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _CompositeYChartView = __webpack_require__(44);

var _CompositeYChartView2 = _interopRequireDefault(_CompositeYChartView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

var _BrushView = __webpack_require__(46);

var _BrushView2 = _interopRequireDefault(_BrushView);

var _BrushConfigModel = __webpack_require__(45);

var _BrushConfigModel2 = _interopRequireDefault(_BrushConfigModel);

var _CompositeYChartConfigModel = __webpack_require__(26);

var _CompositeYChartConfigModel2 = _interopRequireDefault(_CompositeYChartConfigModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var NavigationView = function (_ContrailChartsView) {
  _inherits(NavigationView, _ContrailChartsView);

  _createClass(NavigationView, null, [{
    key: 'dataType',
    get: function get() {
      return 'DataFrame';
    }
  }]);

  function NavigationView(p) {
    _classCallCheck(this, NavigationView);

    var _this = _possibleConstructorReturn(this, (NavigationView.__proto__ || Object.getPrototypeOf(NavigationView)).call(this, p));

    _this._brush = new _BrushView2.default({
      config: new _BrushConfigModel2.default({
        isSharedContainer: true
      })
    });
    var compositeYConfig = new _CompositeYChartConfigModel2.default(_this.config.attributes);
    _this._compositeYChartView = new _CompositeYChartView2.default({
      config: compositeYConfig,
      model: _this.model
    });
    _this._components = [_this._brush, _this._compositeYChartView];
    _this.listenTo(_this._brush, 'selection', _lodash2.default.throttle(_this._onSelection));
    _this.listenTo(_this.config, 'change', _this.render);
    _this.listenTo(_this.model, 'change', _this._onModelChange);
    /**
     * Let's bind super _onResize to this. Also .bind returns new function ref.
     * we need to store this for successful removal from window event
     */
    _this._onResize = _this._onResize.bind(_this);
    window.addEventListener('resize', _this._onResize);
    // needs more time to not encounter onSelection event after zoom
    _this._debouncedEnable = _lodash2.default.debounce(function () {
      _this._disabled = false;
    }, _this.config.get('duration') * 2);
    return _this;
  }

  _createClass(NavigationView, [{
    key: 'render',
    value: function render() {
      _get(NavigationView.prototype.__proto__ || Object.getPrototypeOf(NavigationView.prototype), 'render', this).call(this);
      this.resetParams();
      this._compositeYChartView.container = this.el;
      // TODO this will also trigger render async, but the next one is needed by following _update immediately
      this._compositeYChartView.config.set(this.config.attributes);
      this._compositeYChartView.render();
      this._update();
    }
  }, {
    key: 'remove',
    value: function remove() {
      _get(NavigationView.prototype.__proto__ || Object.getPrototypeOf(NavigationView.prototype), 'remove', this).call(this);
      _lodash2.default.each(this._components, function (component) {
        component.remove();
      });
      this._components = [];
      this.stopListening(this._brush, 'selection');
      window.removeEventListener('resize', this._onResize);
    }
  }, {
    key: 'zoom',
    value: function zoom(ranges) {
      var range = ranges[this.config.get('plot.x.accessor')];
      if (!range || range[0] === range[1]) return;
      var sScale = this.config.get('selectionScale');
      var visualMin = this.params.xScale(range[0]);
      var visualMax = this.params.xScale(range[1]);

      // round zoom range to integers in percents including the original exact float values
      var selection = [_lodash2.default.floor(sScale.invert(visualMin)), _lodash2.default.ceil(sScale.invert(visualMax))];

      if (_lodash2.default.isEqual(this.config.get('selection'), selection)) return;
      this.config.set('selection', selection, { silent: true });
      this._disabled = true;
      this._update();
      this._debouncedEnable();
    }

    // Event handlers

  }, {
    key: '_onModelChange',
    value: function _onModelChange() {
      this.render();
    }
  }, {
    key: '_onSelection',
    value: function _onSelection(range) {
      if (this._disabled) return;
      var xAccessor = this.config.get('plot.x.accessor');
      var xMin = this.params.xScale.invert(range[0]);
      var xMax = this.params.xScale.invert(range[1]);
      var sScale = this.config.get('selectionScale');
      var selection = [_lodash2.default.floor(sScale.invert(range[0])), _lodash2.default.ceil(sScale.invert(range[1]))];
      this.config.set('selection', selection, { silent: true });

      // TODO navigation should not know anything about the data it operates
      if (_lodash2.default.isDate(xMin)) xMin = xMin.getTime();
      if (_lodash2.default.isDate(xMax)) xMax = xMax.getTime();

      var data = _defineProperty({}, xAccessor, [xMin, xMax]);
      _Actionman2.default.fire('Zoom', this.config.get('updateComponents'), data);
    }
    /**
     * Turn off selection for the animation period on resize
     */

  }, {
    key: '_onResize',
    value: function _onResize() {
      this._disabled = true;
      this._debouncedEnable();
      if (!this._ticking) {
        window.requestAnimationFrame(this._update.bind(this));
        this._ticking = true;
      }
    }
    /**
     * Composite Y component is updated on resize on its own
     */

  }, {
    key: '_update',
    value: function _update() {
      var p = this._compositeYChartView.params;
      this.params.xScale = p.axis.x.scale;
      this._brush.container = this.el;
      this.config.set('xRange', p.xRange, { silent: true });
      this.config.set('yRange', p.yRange, { silent: true });
      this._brush.config.set({
        selection: this.config.selectionRange,
        xRange: p.xRange,
        yRange: p.yRange
      }, { silent: true });
      this._brush.render();
      this._ticking = false;
    }
  }]);

  return NavigationView;
}(_contrailChartsView2.default);

exports.default = NavigationView;

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

var _ColoredChart = __webpack_require__(10);

var _ColoredChart2 = _interopRequireDefault(_ColoredChart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var PieChartConfigModel = function (_ContrailChartsConfig) {
  _inherits(PieChartConfigModel, _ContrailChartsConfig);

  function PieChartConfigModel() {
    _classCallCheck(this, PieChartConfigModel);

    return _possibleConstructorReturn(this, (PieChartConfigModel.__proto__ || Object.getPrototypeOf(PieChartConfigModel)).apply(this, arguments));
  }

  _createClass(PieChartConfigModel, [{
    key: 'set',
    value: function set() {
      _get(PieChartConfigModel.prototype.__proto__ || Object.getPrototypeOf(PieChartConfigModel.prototype), 'set', this).call(this, _ColoredChart2.default.set.apply(_ColoredChart2.default, arguments));
    }
    /**
     * retrieves color by label in accessor OR by getLabel function from the data
     */

  }, {
    key: 'getColor',
    value: function getColor(data) {
      var _this2 = this;

      var accessor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      accessor.color = function (datum) {
        return _this2.attributes.colorScale(accessor.label || _this2.getLabel(datum, _this2.attributes.serie));
      };
      return _ColoredChart2.default.getColor(data, accessor);
    }
    /**
     * @return Array of Objects with labels which serve as accessors for values
     */

  }, {
    key: 'getAccessors',
    value: function getAccessors(dataProvider) {
      var labelFormatter = this.get('serie').getLabel;
      return _lodash2.default.map(dataProvider.getLabels(labelFormatter), function (label) {
        return { label: label };
      });
    }
  }, {
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(PieChartConfigModel.prototype.__proto__ || Object.getPrototypeOf(PieChartConfigModel.prototype), 'defaults', this), _ColoredChart2.default.defaults, {
        // sets the position for shared svg container
        isPrimary: true,

        // The component width. If not provided will be caculated by View.
        width: undefined,

        // The component height. If not provided will be caculated by View.
        height: undefined
      });
    }
  }, {
    key: 'innerRadius',
    get: function get() {
      var chartType = this.get('type');
      var innerRadiusCoefficient = chartType === 'pie' ? 0 : 0.75;
      return this.get('radius') * innerRadiusCoefficient;
    }
  }]);

  return PieChartConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = PieChartConfigModel;

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3Shape = __webpack_require__(0);

var d3Shape = _interopRequireWildcard(_d3Shape);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

__webpack_require__(186);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright (c) Juniper Networks, Inc. All rights reserved.

var PieChartView = function (_ContrailChartsView) {
  _inherits(PieChartView, _ContrailChartsView);

  _createClass(PieChartView, null, [{
    key: 'dataType',
    get: function get() {
      return 'Serie';
    }
  }]);

  function PieChartView() {
    var p = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PieChartView);

    var _this = _possibleConstructorReturn(this, (PieChartView.__proto__ || Object.getPrototypeOf(PieChartView)).call(this, p));

    _this.listenTo(_this.model, 'change', _this.render);
    _this.listenTo(_this.config, 'change', _this.render);
    /**
     * Let's bind super _onResize to this. Also .bind returns new function ref.
     * we need to store this for successful removal from window event
     */
    _this._onResize = _this._onResize.bind(_this);
    window.addEventListener('resize', _this._onResize);
    return _this;
  }

  _createClass(PieChartView, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.resetParams();
      this._calculateDimensions();
      _get(PieChartView.prototype.__proto__ || Object.getPrototypeOf(PieChartView.prototype), 'render', this).call(this);
      this._onMouseout();
      var serieConfig = this.config.get('serie');
      var radius = this.config.get('radius');
      var data = this.model.data;

      var arc = d3Shape.arc().outerRadius(radius).innerRadius(this.config.innerRadius);

      var stakes = d3Shape.pie().sort(null).value(function (d) {
        return serieConfig.getValue(d);
      })(data);

      this.d3.attr('transform', 'translate(' + this.params.width / 2 + ', ' + this.params.height / 2 + ')');

      var sectors = this.d3.selectAll(this.selectors.node).data(stakes, function (d) {
        return d.value;
      });

      sectors.enter().append('path').classed(this.selectorClass('node'), true).style('fill', function (d) {
        return _this2.config.getColor(d.data);
      }).merge(sectors).classed(this.selectorClass('interactive'), this.config.hasAction('node')).attr('d', arc).transition().ease(d3Ease.easeLinear).duration(this.params.duration).style('fill', function (d) {
        return _this2.config.getColor(d.data);
      });

      sectors.exit().remove();

      this._ticking = false;
    }
  }, {
    key: 'remove',
    value: function remove() {
      _get(PieChartView.prototype.__proto__ || Object.getPrototypeOf(PieChartView.prototype), 'remove', this).call(this);
      window.removeEventListener('resize', this._onResize);
    }
  }, {
    key: '_calculateDimensions',
    value: function _calculateDimensions() {
      this.params.width = this.config.get('width') || this._container.getBoundingClientRect().width;
      if (this.params.widthDelta) this.params.width += this.params.widthDelta;
      this.params.height = this.config.get('height') || Math.round(this.params.width / 2);
    }

    // Event handlers

  }, {
    key: '_onMouseover',
    value: function _onMouseover(d, el, event) {
      var radius = this.config.get('radius');
      var highlightArc = d3Shape.arc(d).innerRadius(radius).outerRadius(radius * 1.06).startAngle(d.startAngle).endAngle(d.endAngle);
      this.d3.append('path').classed('arc', true).classed(this.selectorClass('highlight'), true).attr('d', highlightArc).style('fill', this.config.getColor(d.data));
    }
  }, {
    key: '_onMousemove',
    value: function _onMousemove(d, el, event) {
      var _d3Selection$mouse = d3Selection.mouse(this._container),
          _d3Selection$mouse2 = _slicedToArray(_d3Selection$mouse, 2),
          left = _d3Selection$mouse2[0],
          top = _d3Selection$mouse2[1];

      _Actionman2.default.fire('ShowComponent', this.config.get('tooltip'), { left: left, top: top }, d.data);
    }
  }, {
    key: '_onMouseout',
    value: function _onMouseout(d, el) {
      this.d3.selectAll(this.selectors.highlight).remove();
      _Actionman2.default.fire('HideComponent', this.config.get('tooltip'));
    }
  }, {
    key: '_onClickNode',
    value: function _onClickNode(d, el, e) {
      this._onMouseout(d, el);
      _get(PieChartView.prototype.__proto__ || Object.getPrototypeOf(PieChartView.prototype), '_onEvent', this).call(this, d, el, e);
    }
  }, {
    key: 'tagName',
    get: function get() {
      return 'g';
    }
    /**
     * follow same naming convention for all charts
     */

  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(PieChartView.prototype.__proto__ || Object.getPrototypeOf(PieChartView.prototype), 'selectors', this), {
        node: '.arc',
        highlight: '.highlight'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return _lodash2.default.extend(_get(PieChartView.prototype.__proto__ || Object.getPrototypeOf(PieChartView.prototype), 'events', this), {
        'click node': '_onClickNode',
        'mouseover node': '_onMouseover',
        'mousemove node': '_onMousemove',
        'mouseout node': '_onMouseout'
      });
    }
  }]);

  return PieChartView;
}(_contrailChartsView2.default);

exports.default = PieChartView;

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _d3Shape = __webpack_require__(0);

var d3Shape = _interopRequireWildcard(_d3Shape);

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

var _ColoredChart = __webpack_require__(10);

var _ColoredChart2 = _interopRequireDefault(_ColoredChart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var RadialDendrogramConfigModel = function (_ContrailChartsConfig) {
  _inherits(RadialDendrogramConfigModel, _ContrailChartsConfig);

  function RadialDendrogramConfigModel() {
    _classCallCheck(this, RadialDendrogramConfigModel);

    return _possibleConstructorReturn(this, (RadialDendrogramConfigModel.__proto__ || Object.getPrototypeOf(RadialDendrogramConfigModel)).apply(this, arguments));
  }

  _createClass(RadialDendrogramConfigModel, [{
    key: 'set',
    value: function set() {
      _get(RadialDendrogramConfigModel.prototype.__proto__ || Object.getPrototypeOf(RadialDendrogramConfigModel.prototype), 'set', this).call(this, _ColoredChart2.default.set.apply(_ColoredChart2.default, arguments));
    }
  }, {
    key: 'getColor',
    value: function getColor(data, accessor, item) {
      return accessor.color || this.attributes.colorScale(item);
    }
  }, {
    key: 'getAccessors',
    value: function getAccessors() {
      var _this2 = this;

      return _lodash2.default.map(this.attributes.levels, function (level) {
        return {
          accessor: level.level,
          level: level.level,
          label: level.label,
          color: level.color,
          enabled: level.level < _this2.attributes.drillDownLevel
        };
      });
    }
  }, {
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(RadialDendrogramConfigModel.prototype.__proto__ || Object.getPrototypeOf(RadialDendrogramConfigModel.prototype), 'defaults', this), _ColoredChart2.default.defaults, {
        // The component width. If not provided will be caculated by View.
        width: undefined,

        // The component height. If not provided will be caculated by View.
        height: undefined,

        // The labels of the levels.
        levels: [],

        // The duration of transitions.
        ease: d3Ease.easeCubic,
        duration: 500,

        valueScale: d3Scale.scaleLog(),
        // valueScale: d3Scale.scaleLinear(),

        // The separation in degrees between nodes with different parents
        parentSeparation: 1,
        parentSeparationThreshold: 0,

        // Arc width
        arcWidth: 10,

        // Show arc labels
        showArcLabels: true,

        // Define how will the labels be rendered: 'along-arc', 'perpendicular'
        labelFlow: 'along-arc',

        // Estimated average letter width
        arcLabelLetterWidth: 5,

        // The X offset (in pixels) of the arc label counted from the beggining of the arc.
        arcLabelXOffset: 2,

        // The Y offset (in pixels) of the arc label counted from the outer edge of the arc (positive values offset the label into the center of the circle).
        arcLabelYOffset: 18,

        // Initial drill down level
        drillDownLevel: 1,

        // curve: d3Shape.curveBundle.beta(0.85)
        // curve: d3Shape.curveBundle.beta(0.95)
        // curve: d3Shape.curveBundle.beta(1)
        curve: d3Shape.curveCatmullRom.alpha(0.5)
      });
    }
  }]);

  return RadialDendrogramConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = RadialDendrogramConfigModel;

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Hierarchy = __webpack_require__(0);

var d3Hierarchy = _interopRequireWildcard(_d3Hierarchy);

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3Shape = __webpack_require__(0);

var d3Shape = _interopRequireWildcard(_d3Shape);

var _d3Chord = __webpack_require__(167);

var d3Chord = _interopRequireWildcard(_d3Chord);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

__webpack_require__(187);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var RadialDendrogramView = function (_ContrailChartsView) {
  _inherits(RadialDendrogramView, _ContrailChartsView);

  _createClass(RadialDendrogramView, null, [{
    key: 'dataType',
    get: function get() {
      return 'Serie';
    }
  }]);

  function RadialDendrogramView(p) {
    _classCallCheck(this, RadialDendrogramView);

    var _this = _possibleConstructorReturn(this, (RadialDendrogramView.__proto__ || Object.getPrototypeOf(RadialDendrogramView)).call(this, p));

    _this.listenTo(_this.model, 'change', _this._onDataModelChange);
    _this.listenTo(_this.config, 'change', _this._onConfigModelChange);
    /**
     * Let's bind super _onResize to this. Also .bind returns new function ref.
     * we need to store this for successful removal from window event
     */
    _this._onResize = _this._onResize.bind(_this);
    window.addEventListener('resize', _this._onResize);
    return _this;
  }

  _createClass(RadialDendrogramView, [{
    key: 'render',
    value: function render() {
      this.resetParams();
      this._calculateDimensions();
      this._prepareHierarchy();
      _get(RadialDendrogramView.prototype.__proto__ || Object.getPrototypeOf(RadialDendrogramView.prototype), 'render', this).call(this);
      this._render();
      this._ticking = false;
    }
  }, {
    key: 'remove',
    value: function remove() {
      _get(RadialDendrogramView.prototype.__proto__ || Object.getPrototypeOf(RadialDendrogramView.prototype), 'remove', this).call(this);
      window.removeEventListener('resize', this._onResize);
    }
  }, {
    key: '_calculateDimensions',
    value: function _calculateDimensions() {
      if (!this.params.width) {
        this.params.width = this._container.getBoundingClientRect().width;
      }
      if (this.params.widthDelta) {
        this.params.width += this.params.widthDelta;
      }
      if (!this.params.height) {
        this.params.height = this.params.width;
      }
      if (!this.params.radius) {
        this.params.radius = this.params.width / 2;
      }
      if (!this.params.labelMargin) {
        this.params.labelMargin = 50;
      }
      if (!this.params.innerRadius) {
        this.params.innerRadius = this.params.radius - this.params.labelMargin;
      }
    }
    /**
    * Build the root node tree structure that will be the input for the d3.hierarchy() layout.
    * We build one more level than configured in order to allow branching of the last configured level.
    */

  }, {
    key: '_prepareRootNode',
    value: function _prepareRootNode() {
      var _this2 = this;

      var data = this.model.data;
      var hierarchyConfig = this.config.get('hierarchyConfig');
      var leafNodes = [];
      this.maxDepth = 0;
      // The root node of the hierarchy (tree) we are building.
      this.rootNode = {
        name: 'root',
        children: []
      };
      this.valueSum = 0;
      _lodash2.default.each(data, function (d, index) {
        // Parsing a data element should return a 2 element array: [source, destination]
        var leafs = hierarchyConfig.parse(d);
        if (leafs[0].value <= 0 || leafs[1].value <= 0) {
          return;
        }
        // Check if we havent already created a node pair (link) with the same id.
        var foundSrcNode = _lodash2.default.find(leafNodes, function (leafNode) {
          var found = false;
          //If there already exists a leaf node matching the src & dst
          // if (leafNode.type == 'src' && leafNode.id === leafs[0].id) {
          if (leafNode.type == 'src' && leafNode.id === leafs[0].id) {
            if (leafNode.otherNode.id === leafs[1].id) {
              found = true;
            }
          }
          if (leafNode.type == 'src' && leafNode.id === leafs[1].id) {
            if (leafNode.otherNode.id === leafs[0].id) {
              found = true;
            }
          }
          return found;
        });
        //How to ensure for intra traffic
        var foundDstNode = _lodash2.default.find(leafNodes, function (leafNode) {
          var found = false;
          //If there already exists a leaf node matching the src & dst
          if (leafNode.type == 'dst' && leafNode.id === leafs[1].id) {
            if (leafNode.otherNode.id === leafs[0].id) {
              found = true;
            }
          }
          if (leafNode.type == 'dst' && leafNode.id === leafs[0].id) {
            if (leafNode.otherNode.id === leafs[1].id) {
              found = true;
            }
          }
          return found;
        });
        var foundLeafNode = null;
        if (foundSrcNode != null) foundLeafNode = foundSrcNode;else foundLeafNode = foundDstNode;
        if (foundLeafNode) {
          foundLeafNode.value += foundLeafNode.id === leafs[0].id ? leafs[0].value : leafs[1].value;
          foundLeafNode.otherNode.value += foundLeafNode.otherNode.id === leafs[0].id ? leafs[0].value : leafs[1].value;
          _this2.valueSum += leafs[0].value + leafs[1].value;
          if (foundSrcNode) {
            foundSrcNode.dataChildren.push(d);
          }
          if (foundDstNode) {
            foundDstNode.dataChildren.push(d);
          }
        } else {
          _lodash2.default.each(leafs, function (leaf, i) {
            // leaf node contains an array of 'names' (ie. the path from root to leaf) and a 'value'
            var children = _this2.rootNode.children;
            var node = null;
            var namePath = [];
            var currLeaf = leaf;
            _lodash2.default.each(leaf.names, function (name, depth) {
              _this2.maxDepth = Math.max(_this2.maxDepth, depth + 1);
              if (depth >= _this2.params.drillDownLevel) {
                return;
              }
              namePath.push(name);
              node = _lodash2.default.find(children, function (child) {
                return child.name === name;
              });
              if (!node) {
                node = {
                  name: name,
                  labelAppend: currLeaf.labelAppend,
                  arcType: currLeaf.type,
                  namePath: namePath.slice(0),
                  children: [],
                  level: depth + 1
                };
                children.push(node);
              }
              children = node.children;
            });
            // Now 'node' is one before leaf
            var leafNode = {
              id: leaf.id,
              otherNode: i === 0 ? leafs[1] : leafs[0],
              currentNode: i === 0 ? leafs[0] : leafs[1],
              arcType: leaf.type,
              value: leaf.value,
              type: i === 0 ? 'src' : 'dst',
              linkId: leafs[0].id + '-' + leafs[1].id,
              dataChildren: [d]
            };
            if (node) {
              node.children.push(leafNode);
            }
            _this2.valueSum += leafNode.value;
            leafNodes.push(leafNode);
          });
        }
      });
      // console.log('maxDepth: ', this.maxDepth)
      // console.log('rootNode: ', this.rootNode, this.valueSum)
    }
  }, {
    key: '_prepareHierarchyRootNode',
    value: function _prepareHierarchyRootNode() {
      var valueScale = this.config.get('valueScale').domain([0.01, this.valueSum]).range([0, 360]);
      this.hierarchyRootNode = d3Hierarchy.hierarchy(this.rootNode).sum(function (d) {
        return valueScale(d.value);
      }).sort(function (a, b) {
        return b.value - a.value;
      });
      // console.log('hierarchyRootNode: ', this.hierarchyRootNode)
    }
  }, {
    key: '_prepareLinks',
    value: function _prepareLinks() {
      var _this3 = this;

      this.links = [];
      var i = 0;
      var leaves = this.hierarchyRootNode.leaves();
      _lodash2.default.each(leaves, function (leaf, leafIndex) {
        for (i = leafIndex + 1; i < leaves.length; i++) {
          if (leaf.data.linkId === leaves[i].data.linkId) {
            _this3.links.push(leaf.path(leaves[i]));
          }
        }
      });
      // console.log('Links: ', this.links)
    }
  }, {
    key: '_prepareCluster',
    value: function _prepareCluster() {
      var _this4 = this;

      var extraPaddingPerDepth = _lodash2.default.fill(_lodash2.default.range(this.params.drillDownLevel + 1), 0);
      // Create the cluster layout.
      var cluster = d3Hierarchy.cluster().size([360, this.params.innerRadius])
      // const cluster = d3Hierarchy.tree().size([360, this.params.innerRadius])
      .separation(function (a, b) {
        var distance = (a.value + b.value) / 2;
        if (a.parent !== b.parent) {
          // Count how many ancestors differ the two nodes.
          var aAncestors = a.ancestors();
          var bAncestors = b.ancestors();
          var differences = Math.max(0, _lodash2.default.difference(aAncestors, bAncestors).length - _this4.params.parentSeparationDepthThreshold);
          var extraPadding = _this4.params.parentSeparation * differences * _this4.hierarchyRootNode.value / 360;
          distance += extraPadding;
          extraPaddingPerDepth[a.depth] += extraPadding;
        }
        return distance;
      });
      cluster(this.hierarchyRootNode);
    }
  }, {
    key: '_prepareCircles',
    value: function _prepareCircles() {
      var _this5 = this;

      this.circles = [];
      var radiusScale = d3Scale.scaleLinear().domain([0, this.params.drillDownLevel]).range([0, this.params.innerRadius]).clamp(true);
      this.hierarchyRootNode.each(function (n) {
        if (!n.parent || !n.children) {
          return;
        }
        n.y = radiusScale(n.depth);
        if (_this5.circles.length === n.depth) {
          _this5.circles[n.depth] = { r: n.y };
        }
      });
      // console.log('circles: ', this.circles)
    }

    /**
    * Positions the arcs.
    */

  }, {
    key: '_prepareAngleRanges',
    value: function _prepareAngleRanges() {
      var _this6 = this;

      var depthValueOffset = [0];
      this.hierarchyRootNode.angleRange = [0, 360];
      this.hierarchyRootNode.valueRange = [0, this.hierarchyRootNode.value];
      this.hierarchyRootNode.angleScale = d3Scale.scaleLinear().domain(this.hierarchyRootNode.valueRange).range(this.hierarchyRootNode.angleRange);
      this.hierarchyRootNode.each(function (n) {
        if (!n.parent) {
          return;
        }
        if (depthValueOffset.length <= n.depth) {
          depthValueOffset.push(0);
        }
        var minValue = depthValueOffset[n.depth];
        var maxValue = minValue + n.value;
        depthValueOffset[n.depth] = maxValue;
        n.valueRange = [minValue, maxValue];
        var minAngle = n.parent.angleScale(minValue);
        var maxAngle = n.parent.angleScale(maxValue);
        // Shrink the angle range in order to create padding between nodes.
        n.separationValue = 0;
        if (n.depth < _this6.params.parentSeparationDepthThreshold) {
          n.separationValue = _this6.params.parentSeparationShrinkFactor * (maxAngle - minAngle) / 2;
        }
        minAngle += n.separationValue;
        maxAngle -= n.separationValue;
        n.angleRange = [minAngle, maxAngle];
        n.angleScale = d3Scale.scaleLinear().domain(n.valueRange).range(n.angleRange);
      });
      // Now shrink the parent nodes by the amount of sepration added to children.
      this.hierarchyRootNode.each(function (n) {
        if (!n.parent) {
          return;
        }
        var separationValueOfChildren = 0;
        _lodash2.default.each(n.descendants(), function (child) {
          separationValueOfChildren += child.separationValue;
        });
        n.angleRange[0] += separationValueOfChildren;
        n.angleRange[1] -= separationValueOfChildren;
        n.angleScale = d3Scale.scaleLinear().domain(n.valueRange).range(n.angleRange);
      });
    }

    /**
    * Prepares the connections. A connection consists of a path:
    * - starting from the leaf of the outer edge of the ribbon
    * - moving to just before the root
    * - leaf of the outer edge of the target arc
    * - inner edge to just before the root
    * - inner edge of the source leaf arc.
    */

  }, {
    key: '_prepareRibbons',
    value: function _prepareRibbons() {
      var _this7 = this;

      var ribbons = this.ribbons;
      this.ribbons = [];
      _lodash2.default.each(this.links, function (link) {
        var src = link[0];
        var dst = link[link.length - 1];
        var srcAncestors = src.ancestors();
        var dstAncestors = dst.ancestors();
        var outerPoints = [];
        // Outer edge from source leaf to root.
        _lodash2.default.each(srcAncestors, function (n, i) {
          if (n.parent && n.children) {
            var valueStart = n.valueRange[0];
            if (n.children) {
              var found = false;
              var leaves = n.leaves();
              _lodash2.default.each(leaves, function (child) {
                if (child === src) {
                  found = true;
                }
                if (!found) {
                  valueStart += child.valueRange[1] - child.valueRange[0];
                }
              });
              if (!found) {
                // console.log('Never found')
              }
            }
            outerPoints.push([n.angleScale(valueStart), n.y]);
          }
        });
        // Outer edge from root to target leaf.
        var i = 0;
        for (i = dstAncestors.length - 1; i >= 0; i--) {
          var n = dstAncestors[i];
          if (n.parent && n.children) {
            var valueStart = n.valueRange[1];
            if (n.children) {
              var found = false;
              var ci = 0;
              var leaves = n.leaves();
              for (ci = leaves.length - 1; ci >= 0; ci--) {
                var child = leaves[ci];
                if (child === dst) {
                  found = true;
                }
                if (!found) {
                  valueStart -= child.valueRange[1] - child.valueRange[0];
                }
              }
              if (!found) {
                // console.log('Never found')
              }
            }
            outerPoints.push([n.angleScale(valueStart), n.y]);
          }
        }
        // Inner edge from target leaf to root.
        var innerPoints = [];
        _lodash2.default.each(dstAncestors, function (n, i) {
          if (n.parent && n.children) {
            var _valueStart = n.valueRange[0];
            if (n.children) {
              var _found = false;
              var _leaves = n.leaves();
              _lodash2.default.each(_leaves, function (child) {
                if (child === dst) {
                  _found = true;
                }
                if (!_found) {
                  _valueStart += child.valueRange[1] - child.valueRange[0];
                }
              });
              if (!_found) {
                // console.log('Never found')
              }
            }
            innerPoints.push([n.angleScale(_valueStart), n.y]);
          }
        });
        // Inner edge from root to source leaf.
        for (i = srcAncestors.length - 1; i >= 0; i--) {
          var _n = srcAncestors[i];
          if (_n.parent && _n.children) {
            var _valueStart2 = _n.valueRange[1];
            if (_n.children) {
              var _found2 = false;
              var _ci = 0;
              var _leaves2 = _n.leaves();
              for (_ci = _leaves2.length - 1; _ci >= 0; _ci--) {
                var _child = _leaves2[_ci];
                if (_child === src) {
                  _found2 = true;
                }
                if (!_found2) {
                  _valueStart2 -= _child.valueRange[1] - _child.valueRange[0];
                }
              }
            }
            innerPoints.push([_n.angleScale(_valueStart2), _n.y]);
          }
        }
        var linkCssClass = '';
        _lodash2.default.each(_this7.params.linkCssClasses, function (cssClass) {
          var linkCssNode = src && src.data && _lodash2.default.find(src.data.dataChildren, function (child) {
            return child.linkCssClass === cssClass;
          });
          if (linkCssNode) {
            linkCssClass = cssClass;
            return false;
          }
        });
        _this7.ribbons.push({
          outerPoints: outerPoints,
          innerPoints: innerPoints,
          id: src.data.linkId,
          link: [src, dst],
          linkCssClass: linkCssClass
        });
      });
      if (ribbons) {
        var selectedRibbon = _lodash2.default.filter(ribbons, function (ribbon) {
          return ribbon.selected;
        });
        if (selectedRibbon && selectedRibbon.length > 0) {
          _lodash2.default.filter(this.ribbons, function (ribbon) {
            if (ribbon.id == selectedRibbon[0].id) {
              ribbon.selected = true;
              ribbon.active = true;
            }
          });
        }
      }
    }
  }, {
    key: '_prepareArcs',
    value: function _prepareArcs() {
      var _this8 = this;

      this.arcs = [];
      this.hierarchyRootNode.each(function (n) {
        if (!n.parent || !n.children) {
          return;
        }
        // Estimate arc length and wheather the label will fit (default letter width is assumed to be 5px).
        n.arcLength = 6 * (n.y - _this8.params.arcLabelYOffset[n.height - 1]) * (n.angleRange[1] - n.angleRange[0]) / 360;
        n.label = '' + n.data.namePath[n.data.namePath.length - 1];
        if (n.depth == 1 && n.data.labelAppend) {
          n.label += '-' + n.data.labelAppend;
        }
        if (n.label && n.data.arcType) {
          n.label = n.label.replace(new RegExp('_' + n.data.arcType, 'g'), '');
        }
        var labelArcLengthDiff = void 0;
        n.labelFits = (labelArcLengthDiff = _this8.config.get('arcLabelLetterWidth') * n.label.length - n.arcLength) < 0;
        if (!n.labelFits) {
          n.labelLengthToTrim = (labelArcLengthDiff + 3 * _this8.config.get('arcLabelLetterWidth')) / _this8.config.get('arcLabelLetterWidth');
        }
        if (_this8.config.get('labelFlow') === 'perpendicular') {
          n.labelFits = n.arcLength > 9 && _this8.config.get('innerRadius') / _this8.config.get('drillDownLevel') - _this8.params.arcLabelYOffset[n.height - 1] > _this8.config.get('arcLabelLetterWidth') * n.label.length;
        }
        _this8.arcs.push(n);
      });
    }
  }, {
    key: '_prepareHierarchy',
    value: function _prepareHierarchy() {
      this._prepareRootNode();
      this._prepareHierarchyRootNode();
      this._prepareLinks();
      this._prepareCluster();
      this._prepareCircles();
      this._prepareAngleRanges();
      this._prepareRibbons();
      this._prepareArcs();
    }
  }, {
    key: '_render',
    value: function _render() {
      var _this9 = this;

      this.d3.attr('transform', 'translate(' + this.params.width / 2 + ', ' + this.params.height / 2 + ')');
      // Circles
      var svgCircles = this.d3.selectAll('.circle').data(this.circles);
      svgCircles.enter().append('circle').attr('class', 'circle').attr('r', 0).merge(svgCircles).attr('r', function (d) {
        return d.r + 1;
      });
      svgCircles.exit().remove();

      if (this.params.drawLinks) {
        // Links
        var radialLine = d3Shape.radialLine().angle(function (d) {
          return d.x / 180 * Math.PI;
        }).radius(function (d) {
          return d.y;
        }).curve(this.config.get('curve'));
        var svgLinks = this.d3.selectAll('.link').data(this.links);
        svgLinks.enter().append('path').attr('class', function (d) {
          return 'link ' + d[0].data.id;
        }).classed(this.selectorClass('interactive'), this.config.hasAction('node')).style('stroke-width', 0).attr('d', function (d) {
          return radialLine(d[0]);
        }).merge(svgLinks).style('stroke-width', function (d) {
          return d[0].y * Math.sin((d[0].angleRange[1] - d[0].angleRange[0]) * Math.PI / 180) + 'px';
        }).attr('d', radialLine);
      }
      if (this.params.drawRibbons) {
        // Ribbons
        var _radialLine = d3Shape.radialLine().angle(function (d) {
          return d[0] / 180 * Math.PI;
        }).radius(function (d) {
          return d[1];
        }).curve(this.config.get('curve'));
        var _svgLinks = this.d3.selectAll('.ribbon').data(this.ribbons, function (d) {
          return d.id;
        });
        _svgLinks.enter().append('path').attr('class', function (d) {
          return 'ribbon' + (d.active ? ' active' : '');
        }).merge(_svgLinks) // .transition().ease(this.config.get('ease')).duration(this.params.duration)
        .attr('class', function (d) {
          return 'ribbon' + (d.active ? ' active' : '') + (d.linkCssClass ? ' ' + d.linkCssClass : '');
        }).classed(this.selectorClass('interactive'), this.config.hasAction('link')).attr('d', function (d) {
          // var lastPoint = d.outerPoints[1];
          // var controlPoint = d.outerPoints[1] = [0,0];

          /*var startPoint = [d.outerPoints[0][1] * Math.cos(d.outerPoints[0][0]),d.outerPoints[0][1] * Math.sin(d.outerPoints[0][0])];
          var endPoint = [d.outerPoints[1][1] * Math.cos(d.outerPoints[1][0]),d.outerPoints[1][1] * Math.sin(d.outerPoints[1][0])];
          var midPoint = [(startPoint[0] + endPoint[0])/2, (startPoint[1] + endPoint[1])/2];
          //Convert midPoint form cartesian to Polar
          var midPointInPolar = [Math.atan2(midPoint[1],midPoint[0]),Math.sqrt(Math.pow(midPoint[0],2) + Math.pow(midPoint[1],2)*.9)];*/
          /*function getMidPoint(points) {
            //Converting to cartesian
            var out1 = { radians: points[0][0]/180 * Math.PI, radius: points[0][1]},
                out2 = { radians: points[1][0]/180 * Math.PI, radius: points[1][1]};
             var [x1,y1] = [out1.radius * Math.cos(out1.radians),out1.radius * Math.sin(out1.radians)];
            var [x2,y2] = [out1.radius * Math.cos(out2.radians),out1.radius * Math.sin(out2.radians)];
            var midPoint = [(x1 + x2)/2, (y1 + y2)/2];
            //Convert midPoint form cartesian to Polar
            var midPointInPolar = [Math.atan2(midPoint[1],midPoint[0])*57.29,Math.sqrt(Math.pow(midPoint[0],2) + Math.pow(midPoint[1],2)*.8)];
            return midPointInPolar;
          }*/
          // d.outerPoints.splice(1,0,getMidPoint(d.outerPoints));
          // d.innerPoints.splice(1,0,getMidPoint(d.innerPoints));
          if (d.outerPoints.length == 2 && d.innerPoints.length == 2) {
            var out1 = { radians: d.outerPoints[0][0] / 180 * Math.PI, radius: d.outerPoints[0][1] },
                out2 = { radians: d.outerPoints[1][0] / 180 * Math.PI, radius: d.outerPoints[1][1] };
            var in1 = { radians: d.innerPoints[0][0] / 180 * Math.PI, radius: d.innerPoints[0][1] },
                in2 = { radians: d.innerPoints[1][0] / 180 * Math.PI, radius: d.innerPoints[1][1] };

            var ribbon = d3v4.ribbon().radius(out1.radius);
            var radians = [out1.radians, in1.radians, out2.radians, in2.radians];
            radians.sort();
            //Adding 10% buffer
            var startWidth = Math.abs(radians[0] - radians[1]) * .35,
                endWidth = Math.abs(radians[2] - radians[3]) * .35;
            return ribbon({
              source: { startAngle: radians[0] + startWidth, endAngle: radians[1] - startWidth },
              target: { startAngle: radians[2] + endWidth, endAngle: radians[3] - endWidth }
            });
            return ribbon({
              source: { startAngle: out1.radians, endAngle: in1.radians },
              target: { startAngle: Math.min(out2.radians, in2.radians), endAngle: Math.max(out2.radians, in2.radians) }
            });
          }

          //Need to try with simple sample for debugging 
          //Looks causing issues as it's using elliptical arc
          /*
          d.outerPoints = _.map(d.outerPoints,function(val,idx) {
            var diff = Math.abs(val[0],val[1])*.1;
            return [val[0]+diff,val[1]-diff];
          });
          d.innerPoints = _.map(d.innerPoints,function(val,idx) {
            var diff = Math.abs(val[0],val[1])*.1;
            return [val[0]+diff,val[1]-diff];
          });
          */

          var outerPath = _radialLine(d.outerPoints);
          var innerPath = _radialLine(d.innerPoints);
          var endingStitchLargeArc = 0;
          if (Math.abs(d.innerPoints.slice(-1)[0][0] - d.outerPoints.slice(0, 1)[0][0]) > 180) {
            endingStitchLargeArc = 1;
          }
          var innerStitch = 'A' + d.outerPoints[0][1] + ' ' + d.outerPoints[0][1] + ' 0 0 0 ';
          var endingStitch = 'A' + d.outerPoints[0][1] + ' ' + d.outerPoints[0][1] + ' 0 ' + endingStitchLargeArc + ' 0 ' + _radialLine([d.outerPoints[0]]).substr(1);

          return outerPath + innerStitch + innerPath.substr(1) + endingStitch;
        });
        _svgLinks.exit().remove();

        // Arc labels
        var arcLabelsAlongArcData = this.params.labelFlow === 'along-arc' ? this.arcs : [];
        var arcLabelsPerpendicularData = this.params.labelFlow === 'perpendicular' ? this.arcs : [];
        // Along Arc
        var svgArcLabels = this.d3.selectAll('.arc-label.along-arc').data(arcLabelsAlongArcData);
        var svgArcLabelsEnter = svgArcLabels.enter().append('text').attr('class', function (d) {
          return 'arc-label along-arc arc-label-' + d.height;
        }).attr('x', this.params.arcLabelXOffset).attr('dy', function (d) {
          return _this9.params.arcLabelYOffset[d.height - 1];
        });
        svgArcLabelsEnter.append('textPath').attr('xlink:href', function (d) {
          return '#' + d.data.namePath.join('-');
        }).attr('class', function (d) {
          return d.data.arcType ? d.data.arcType.split(' ')[0] : '';
        });
        var svgArcLabelsEdit = svgArcLabelsEnter.merge(svgArcLabels).transition().ease(this.config.get('ease')).duration(this.params.labelDuration != null ? this.params.labelDuration : this.params.duration).attr('x', this.params.arcLabelXOffset).attr('dy', function (d) {
          return _this9.params.arcLabelYOffset[d.height - 1];
        });
        svgArcLabelsEdit.select('textPath').attr('startOffset', function (d) {
          return d.arcLength / 2;
        }).text(function (d) {
          return _this9.config.get('showArcLabels') && d.labelFits ? d.label : d.label.slice(0, -d.labelLengthToTrim) + '...';
        });
        svgArcLabels.exit().remove();
        // Perpendicular
        svgArcLabels = this.d3.selectAll('.arc-label.perpendicular').data(arcLabelsPerpendicularData);
        svgArcLabelsEnter = svgArcLabels.enter().append('text').attr('class', function (d) {
          return 'arc-label perpendicular arc-label-' + d.height;
        }).merge(svgArcLabels).attr('transform', function (d) {
          var alpha = (d.angleRange[1] + d.angleRange[0]) / 2 + 90;
          if ((d.angleRange[1] + d.angleRange[0]) / 2 < 180) {
            alpha -= 180;
          }
          var x = (d.y + _this9.params.arcLabelYOffset[d.height - 1]) * Math.cos((d.angleRange[1] + d.angleRange[0] - 180) * Math.PI / 360) + _this9.params.arcLabelXOffset;
          var y = (d.y + _this9.params.arcLabelYOffset[d.height - 1]) * Math.sin((d.angleRange[1] + d.angleRange[0] - 180) * Math.PI / 360);
          return 'translate(' + x + ', ' + y + ') rotate(' + alpha + ')';
        }).style('text-anchor', function (d) {
          return (d.angleRange[1] + d.angleRange[0]) / 2 < 180 ? 'start' : 'end';
        }).text(function (d) {
          return _this9.params.showArcLabels && d.labelFits ? d.label : '';
        });
        svgArcLabels.exit().remove();

        // Arcs for parent nodes.
        var arcEnter = d3Shape.arc().innerRadius(function (n) {
          return n.y;
        }).outerRadius(function (n) {
          return n.y + 1;
        }).startAngle(function (n) {
          return Math.PI * n.angleRange[0] / 180;
        }).endAngle(function (n) {
          return Math.PI * n.angleRange[1] / 180;
        });
        var arc = d3Shape.arc().innerRadius(function (n) {
          return n.y;
        }).outerRadius(function (n) {
          return n.y + _this9.params.arcWidth[n.height - 1];
        }).startAngle(function (n) {
          return Math.PI * n.angleRange[0] / 180;
        }).endAngle(function (n) {
          return Math.PI * n.angleRange[1] / 180;
        });
        var svgArcs = this.d3.selectAll('.arc').data(this.arcs, function (d) {
          return d.data.namePath.join('-');
        });
        svgArcs.enter().append('path').attr('id', function (d) {
          return d.data.namePath.join('-');
        }).attr('d', arcEnter).merge(svgArcs).attr('class', function (d) {
          return 'arc arc-' + d.depth + (d.data.arcType ? ' ' + d.data.arcType.split(' ')[0] : '') + (d.active ? ' active' : '');
        }).transition().ease(this.config.get('ease')).duration(this.params.duration).style('fill', function (d) {
          return _this9.config.getColor([], _this9.config.get('levels')[d.depth - 1], d.data);
        }).attr('d', arc);
        svgArcs.exit().transition().ease(this.config.get('ease')).duration(this.params.duration).attr('d', arcEnter).remove();
      }
    }

    // Event handlers

  }, {
    key: '_onDataModelChange',
    value: function _onDataModelChange() {
      this.render();
    }
  }, {
    key: '_onConfigModelChange',
    value: function _onConfigModelChange() {
      this.render();
    }
  }, {
    key: '_onMousemove',
    value: function _onMousemove(d, el, e) {
      var _this10 = this;

      if (this.config.attributes && this.config.attributes.showArcInfo == 'disable') {
        return;
      }
      var leaves = d.leaves();
      _lodash2.default.each(this.ribbons, function (ribbon) {
        ribbon.active = Boolean(_lodash2.default.find(leaves, function (leaf) {
          return leaf.data.linkId === ribbon.id;
        })) ? true : ribbon.selected;
      });
      _lodash2.default.each(this.arcs, function (arc) {
        arc.active = Boolean(arc.data.namePath && arc.data.namePath.join('-') == e.target.id);
      });
      this._render();

      var _d3Selection$mouse = d3Selection.mouse(this._container),
          _d3Selection$mouse2 = _slicedToArray(_d3Selection$mouse, 2),
          left = _d3Selection$mouse2[0],
          top = _d3Selection$mouse2[1];

      if (this.clearArcTootltip) {
        clearTimeout(this.clearArcTootltip);
      }
      this.clearArcTootltip = setTimeout(function () {
        _Actionman2.default.fire('ShowComponent', _this10.config.get('tooltip'), { left: left, top: top }, d.data);
        document.getElementById(_this10.config.get('tooltip')).style.right = 'auto';
      }, 300);
    }
  }, {
    key: '_onMouseout',
    value: function _onMouseout(d, el) {
      _lodash2.default.each(this.ribbons, function (ribbon) {
        if (!ribbon.selected) {
          ribbon.active = false;
        }
      });
      _lodash2.default.each(this.arcs, function (arc) {
        arc.active = false;
      });
      this._render();
      if (this.clearArcTootltip) {
        clearTimeout(this.clearArcTootltip);
      }
      _Actionman2.default.fire('HideComponent', this.config.get('tooltip'));
    }
  }, {
    key: '_onClickNode',
    value: function _onClickNode(d, el, e) {
      if (this.config.attributes && this.config.attributes.expandLevels == 'disable') {
        return;
      }
      /*if (d.depth < this.maxDepth && d.depth === this.params.drillDownLevel) {
        // Expand
        this.config.set('drillDownLevel', this.params.drillDownLevel + 1)
      } else if (d.depth < this.params.drillDownLevel) {
        // Collapse
        this.config.set('drillDownLevel', this.params.drillDownLevel - 1)
      }
      this.config.set('drillDownLevel', this.params.drillDownLevel - 1)*/
      if (this.clearArcTootltip) {
        clearTimeout(this.clearArcTootltip);
      }
      var levels = 2;
      //If clicked on 2nd level arc,collapse to 1st level
      if (d.depth == 2 || d.height == 2) levels = 1;
      this.config.attributes.updateChart({
        levels: levels
      });
      el.classList.remove(this.selectorClass('active'));
      _get(RadialDendrogramView.prototype.__proto__ || Object.getPrototypeOf(RadialDendrogramView.prototype), '_onEvent', this).call(this, d, el, e);
    }
  }, {
    key: '_onClickLink',
    value: function _onClickLink(d, el, e) {
      if (this.config.attributes && this.config.attributes.showLinkInfo && typeof this.config.attributes.showLinkInfo == 'function') {
        this.config.attributes.showLinkInfo(d, el, e, this);
      }
    }
  }, {
    key: '_onMousemoveLink',
    value: function _onMousemoveLink(d, el, e) {
      var _this11 = this;

      if (this.config.attributes && this.config.attributes.showLinkTooltip) {
        var _d3Selection$mouse3 = d3Selection.mouse(this._container),
            _d3Selection$mouse4 = _slicedToArray(_d3Selection$mouse3, 2),
            left = _d3Selection$mouse4[0],
            top = _d3Selection$mouse4[1];

        if (this.clearLinkTooltip) {
          clearTimeout(this.clearLinkTooltip);
        }
        this.clearLinkTooltip = setTimeout(function () {
          _Actionman2.default.fire('ShowComponent', _this11.config.get('tooltip'), { left: left, top: top }, d);
          var tooltipId = document.getElementById(_this11.config.get('tooltip'));
          if (left > _this11._container.offsetWidth / 2) {
            tooltipId.style.right = 0;
            tooltipId.style.left = 'auto';
          } else {
            tooltipId.style.right = 'auto';
          }
        }, 300);
      }
    }
  }, {
    key: '_onMouseoutLink',
    value: function _onMouseoutLink(d, el, e) {
      if (this.clearLinkTooltip) {
        clearTimeout(this.clearLinkTooltip);
      }
      _Actionman2.default.fire('HideComponent', this.config.get('tooltip'));
    }
  }, {
    key: 'tagName',
    get: function get() {
      return 'g';
    }
  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(RadialDendrogramView.prototype.__proto__ || Object.getPrototypeOf(RadialDendrogramView.prototype), 'selectors', this), {
        node: '.arc',
        link: '.ribbon',
        active: '.active'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      var _$extend;

      return _lodash2.default.extend(_get(RadialDendrogramView.prototype.__proto__ || Object.getPrototypeOf(RadialDendrogramView.prototype), 'events', this), (_$extend = {
        'click node': '_onClickNode',
        'click link': '_onEvent',
        'dblclick node': '_onEvent',
        'dblclick link': '_onEvent',
        'mousemove node': '_onMousemove',
        'mouseout node': '_onMouseout'
      }, _defineProperty(_$extend, 'click link', '_onClickLink'), _defineProperty(_$extend, 'mousemove link', '_onMousemoveLink'), _defineProperty(_$extend, 'mouseout link', '_onMouseoutLink'), _$extend));
    }
  }]);

  return RadialDendrogramView;
}(_contrailChartsView2.default);

exports.default = RadialDendrogramView;

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _d3Shape = __webpack_require__(0);

var d3Shape = _interopRequireWildcard(_d3Shape);

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

var _ColoredChart = __webpack_require__(10);

var _ColoredChart2 = _interopRequireDefault(_ColoredChart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var SankeyConfigModel = function (_ContrailChartsConfig) {
  _inherits(SankeyConfigModel, _ContrailChartsConfig);

  function SankeyConfigModel() {
    _classCallCheck(this, SankeyConfigModel);

    return _possibleConstructorReturn(this, (SankeyConfigModel.__proto__ || Object.getPrototypeOf(SankeyConfigModel)).apply(this, arguments));
  }

  _createClass(SankeyConfigModel, [{
    key: 'set',
    value: function set() {
      _get(SankeyConfigModel.prototype.__proto__ || Object.getPrototypeOf(SankeyConfigModel.prototype), 'set', this).call(this, _ColoredChart2.default.set.apply(_ColoredChart2.default, arguments));
    }
  }, {
    key: 'getColor',
    value: function getColor(data, accessor) {
      return accessor.color || this.attributes.colorScale(accessor.level);
    }
  }, {
    key: 'getAccessors',
    value: function getAccessors() {
      var _this2 = this;

      return _lodash2.default.map(this.attributes.levels, function (level) {
        return {
          accessor: level.level,
          level: level.level,
          label: level.label,
          color: level.color,
          enabled: level.level < _this2.attributes.drillDownLevel
        };
      });
    }
  }, {
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(SankeyConfigModel.prototype.__proto__ || Object.getPrototypeOf(SankeyConfigModel.prototype), 'defaults', this), _ColoredChart2.default.defaults, {
        /*
        isPrimary: true,
        // by default will use common shared container under the parent
        isSharedContainer: true,
        */

        // The component width. If not provided will be caculated by View.
        width: undefined,

        // The component height. If not provided will be caculated by View.
        height: undefined,

        labelMargin: 50,

        // The scale to use that will represent the value of links.
        valueScale: d3Scale.scaleLog(),

        // The width of the nodes in sankey diagram.
        nodeWidth: 15,

        // The padding between nodes in sankey diagram.
        nodePadding: 2,

        // The labels of the levels.
        levels: [],

        // The duration of transitions.
        ease: d3Ease.easeCubic,

        // The separation in degrees between nodes with different parents
        parentSeparation: 1,
        parentSeparationThreshold: 0,

        // Arc width
        arcWidth: 10,

        // Show arc labels
        showArcLabels: true,

        // Estimated average letter width
        arcLabelLetterWidth: 5,

        // The X offset (in pixels) of the arc label counted from the beggining of the arc.
        arcLabelXOffset: 2,

        // The Y offset (in pixels) of the arc label counted from the outer edge of the arc (positive values offset the label into the center of the circle).
        arcLabelYOffset: 18,

        // Initial drill down level
        drillDownLevel: 1,

        // curve: d3Shape.curveBundle.beta(0.85)
        // curve: d3Shape.curveBundle.beta(0.95)
        // curve: d3Shape.curveBundle.beta(1)
        curve: d3Shape.curveCatmullRom.alpha(0.5)
        // curve: d3Shape.curveCatmullRom.alpha(0.75)
        // curve: d3Shape.curveCatmullRom.alpha(1)
        // curve: d3Shape.curveLinear
      });
    }
  }]);

  return SankeyConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = SankeyConfigModel;

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

__webpack_require__(188);

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3Sankey = __webpack_require__(173);

var d3Sankey = _interopRequireWildcard(_d3Sankey);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var SankeyView = function (_ContrailChartsView) {
  _inherits(SankeyView, _ContrailChartsView);

  _createClass(SankeyView, [{
    key: 'tagName',
    get: function get() {
      return 'g';
    }
  }, {
    key: 'className',
    get: function get() {
      return 'sankey';
    }
  }, {
    key: 'events',
    get: function get() {
      return {
        'mouseover .link': '_onMouseoverLink',
        'mouseout .link': '_onMouseoutLink',
        'click .arc': '_arcClick'
      };
    }
  }], [{
    key: 'dataType',
    get: function get() {
      return 'Serie';
    }
  }]);

  function SankeyView() {
    var p = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SankeyView);

    var _this = _possibleConstructorReturn(this, (SankeyView.__proto__ || Object.getPrototypeOf(SankeyView)).call(this, p));

    _this.listenTo(_this.model, 'change', _this._onDataModelChange);
    _this.listenTo(_this.config, 'change', _this._onConfigModelChange);
    /**
     * Let's bind super _onResize to this. Also .bind returns new function ref.
     * we need to store this for successful removal from window event
     */
    _this._onResize = _this._onResize.bind(_this);
    window.addEventListener('resize', _this._onResize);
    return _this;
  }

  _createClass(SankeyView, [{
    key: 'render',
    value: function render() {
      this.resetParams();
      this._calculateDimensions();
      this._prepareLayout();
      _get(SankeyView.prototype.__proto__ || Object.getPrototypeOf(SankeyView.prototype), 'render', this).call(this);
      this._render();
      this._ticking = false;
    }
  }, {
    key: 'remove',
    value: function remove() {
      _get(SankeyView.prototype.__proto__ || Object.getPrototypeOf(SankeyView.prototype), 'remove', this).call(this);
      window.removeEventListener('resize', this._onResize);
    }
  }, {
    key: '_calculateDimensions',
    value: function _calculateDimensions() {
      if (!this.params.width) {
        this.params.width = this._container.getBoundingClientRect().width;
      }
      if (this.params.widthDelta) {
        this.params.width += this.params.widthDelta;
      }
      if (!this.params.height) {
        this.params.height = 3 * this.params.width / 5;
      }
      if (!this.params.labelMargin) {
        this.params.labelMargin = 50;
      }
      if (!this.params.topMargin) {
        this.params.topMargin = 5;
      }
    }
  }, {
    key: '_prepareLayout',
    value: function _prepareLayout() {
      var _this2 = this;

      var data = this.model.data;
      var nodeNameMap = {};
      var parseConfig = this.config.get('parseConfig');
      var valueSum = 0;
      this.nodes = [];
      this.links = [];
      _lodash2.default.each(data, function (d) {
        // Parsing a data element should return an array of links: { source: 'sourceNodeName', target: 'targetNodeName', value: value }
        var parsedLinks = parseConfig.parse(d);
        _lodash2.default.each(parsedLinks, function (link, i) {
          if (!link.value || link.value <= 0) {
            return;
          }
          valueSum += link.value;
          if (!nodeNameMap[link.source]) {
            var node = { name: link.source, label: link.sourceNode.label, level: link.sourceNode.level, index: _this2.nodes.length };
            nodeNameMap[link.source] = node;
            _this2.nodes.push(node);
          }
          if (!nodeNameMap[link.target]) {
            var _node = { name: link.target, label: link.targetNode.label, level: link.targetNode.level, index: _this2.nodes.length };
            nodeNameMap[link.target] = _node;
            _this2.nodes.push(_node);
          }
          var sourceIndex = nodeNameMap[link.source].index;
          var targetIndex = nodeNameMap[link.target].index;
          var foundLink = null;
          // Check if this link already exists.
          _lodash2.default.each(_this2.links, function (uniqueLink) {
            if (uniqueLink.source === sourceIndex && uniqueLink.target === targetIndex || uniqueLink.source === targetIndex && uniqueLink.target === sourceIndex) {
              foundLink = uniqueLink;
            }
          });
          if (foundLink) {
            foundLink.value += link.value;
          } else {
            _this2.links.push({ source: sourceIndex, target: targetIndex, value: link.value, data: link });
          }
        });
      });
      // Rescale the link values.
      // Does not look good - the sum of incoming values will not equal sum of outgoing values and the outgoing link will be thinner than the sum of incomming ones.
      // This needs to be handled during data parsing (ie. by the user) because only the user knows which data is input (in our example the input is from port to ip).
      /*
      console.log('valueSum, height: ', valueSum, this.params.height)
      const valueScale = this.config.get('valueScale').domain([1, valueSum]).range([1, this.params.height])
      _.each(this.links, (link) => {
        link.originalValue = link.value
        link.value = valueScale(link.originalValue)
      })
      */
      this.sankey = d3Sankey.sankey().nodeWidth(this.params.nodeWidth).nodePadding(this.params.nodePadding).size([this.params.width - 2 * this.params.labelMargin, this.params.height - 2 * this.params.topMargin]);
      this.sankey.nodes(this.nodes).links(this.links).layout(32);
    }
  }, {
    key: '_render',
    value: function _render() {
      var _this3 = this;

      this.d3.attr('transform', 'translate(' + this.params.labelMargin + ', ' + this.params.topMargin + ')');
      // Links
      var path = this.sankey.link();
      var svgLinks = this.d3.selectAll('.link').data(this.links);
      svgLinks.enter().append('path').attr('class', 'link').attr('d', path).style('stroke-width', function (d) {
        return Math.max(1, d.dy);
      }).merge(svgLinks).attr('d', path).style('stroke-width', function (d) {
        return Math.max(1, d.dy);
      });
      svgLinks.exit().remove();
      // Nodes
      var svgNodes = this.d3.selectAll('.node').data(this.nodes);
      var svgNodesEnter = svgNodes.enter().append('g').attr('class', 'node').attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
      svgNodesEnter.append('rect').attr('width', this.sankey.nodeWidth()).attr('height', function (d) {
        return d.dy;
      });
      svgNodesEnter.append('text').attr('x', -5).attr('y', function (d) {
        return d.dy / 2;
      }).attr('text-anchor', 'end').text(function (d) {
        return d.dy > 10 ? d.label : '';
      }).filter(function (d) {
        return d.x > _this3.params.width / 2;
      }).attr('x', 5 + this.sankey.nodeWidth()).attr('text-anchor', 'start');
      var svgNodesEdit = svgNodesEnter.merge(svgNodes).transition().ease(this.config.get('ease')).duration(this.params.duration).attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
      svgNodesEdit.select('rect').style('fill', function (d) {
        return _this3.config.getColor([], _this3.config.get('levels')[d.level]);
      }).attr('width', this.sankey.nodeWidth()).attr('height', function (d) {
        return d.dy;
      });
      svgNodesEdit.select('text').attr('x', -5).attr('y', function (d) {
        return d.dy / 2;
      }).attr('text-anchor', 'end').text(function (d) {
        return d.dy > 10 ? d.label : '';
      }).filter(function (d) {
        return d.x > _this3.params.width / 2;
      }).attr('x', 5 + this.sankey.nodeWidth()).attr('text-anchor', 'start');
    }

    // Event handlers

  }, {
    key: '_onDataModelChange',
    value: function _onDataModelChange() {
      this.render();
    }
  }, {
    key: '_onConfigModelChange',
    value: function _onConfigModelChange() {
      this.render();
    }
  }, {
    key: '_onMouseoverLink',
    value: function _onMouseoverLink(d, el) {
      var _d3Selection$mouse = d3Selection.mouse(this._container),
          _d3Selection$mouse2 = _slicedToArray(_d3Selection$mouse, 2),
          left = _d3Selection$mouse2[0],
          top = _d3Selection$mouse2[1];

      _Actionman2.default.fire('ShowComponent', this.config.get('tooltip'), { left: left, top: top }, d);
    }
  }, {
    key: '_onMouseoutLink',
    value: function _onMouseoutLink(d, el) {
      _Actionman2.default.fire('HideComponent', this.config.get('tooltip'));
    }
  }, {
    key: '_arcClick',
    value: function _arcClick(d, el) {
      if (d.depth < this.maxDepth && d.depth === this.params.drillDownLevel) {
        // Expand
        this.config.set('drillDownLevel', this.params.drillDownLevel + 1);
      } else if (d.depth < this.params.drillDownLevel) {
        // Collapse
        this.config.set('drillDownLevel', this.params.drillDownLevel - 1);
      }
    }
  }]);

  return SankeyView;
}(_contrailChartsView2.default);

exports.default = SankeyView;

/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
* Component to test rendering of vector contents as standalone
*/
var StandaloneModel = function (_ContrailChartsConfig) {
  _inherits(StandaloneModel, _ContrailChartsConfig);

  function StandaloneModel() {
    _classCallCheck(this, StandaloneModel);

    return _possibleConstructorReturn(this, (StandaloneModel.__proto__ || Object.getPrototypeOf(StandaloneModel)).apply(this, arguments));
  }

  _createClass(StandaloneModel, [{
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(StandaloneModel.prototype.__proto__ || Object.getPrototypeOf(StandaloneModel.prototype), 'defaults', this), {
        // by default will use shared container under the parent
        isSharedContainer: true,
        width: 300,
        height: 100
      });
    }
  }]);

  return StandaloneModel;
}(_contrailChartsConfigModel2.default);

exports.default = StandaloneModel;

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var StandaloneView = function (_ContrailChartsView) {
  _inherits(StandaloneView, _ContrailChartsView);

  function StandaloneView(p) {
    _classCallCheck(this, StandaloneView);

    var _this = _possibleConstructorReturn(this, (StandaloneView.__proto__ || Object.getPrototypeOf(StandaloneView)).call(this, p));

    _this.render();
    return _this;
  }

  _createClass(StandaloneView, [{
    key: 'render',
    value: function render() {
      _get(StandaloneView.prototype.__proto__ || Object.getPrototypeOf(StandaloneView.prototype), 'render', this).call(this);
      this.d3.append('text').text('standalone component');
      this.svg.classed('standalone-is-here', true);
    }
  }, {
    key: 'tagName',
    get: function get() {
      return 'g';
    }
  }]);

  return StandaloneView;
}(_contrailChartsView2.default);

exports.default = StandaloneView;

/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var TimelineConfigModel = function (_ContrailChartsConfig) {
  _inherits(TimelineConfigModel, _ContrailChartsConfig);

  function TimelineConfigModel() {
    _classCallCheck(this, TimelineConfigModel);

    return _possibleConstructorReturn(this, (TimelineConfigModel.__proto__ || Object.getPrototypeOf(TimelineConfigModel)).apply(this, arguments));
  }

  _createClass(TimelineConfigModel, [{
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(TimelineConfigModel.prototype.__proto__ || Object.getPrototypeOf(TimelineConfigModel.prototype), 'defaults', this), {
        isSharedContainer: true,

        // The component width
        width: undefined,

        // The component height
        height: 100,

        brushHandleHeight: 8,
        brushHandleScaleX: 1,
        brushHandleScaleY: 1.2,

        // Scale to transform values from percentage based selection to visual coordinates
        selectionScale: d3Scale.scaleLinear().domain([0, 100]),

        // The selection to use when first rendered [xMin%, xMax%].
        selection: []
      });
    }
  }, {
    key: 'selectionRange',
    get: function get() {
      this.attributes.selectionScale.range([this.attributes.xRange[0], this.attributes.xRange[1]]);
      if (_lodash2.default.isEmpty(this.attributes.selection)) return [];
      return [this.attributes.selectionScale(this.attributes.selection[0]), this.attributes.selectionScale(this.attributes.selection[1])];
    }
  }]);

  return TimelineConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = TimelineConfigModel;

/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

var _BrushView = __webpack_require__(46);

var _BrushView2 = _interopRequireDefault(_BrushView);

var _BrushConfigModel = __webpack_require__(45);

var _BrushConfigModel2 = _interopRequireDefault(_BrushConfigModel);

__webpack_require__(189);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var TimelineView = function (_ContrailChartsView) {
  _inherits(TimelineView, _ContrailChartsView);

  _createClass(TimelineView, null, [{
    key: 'dataType',
    get: function get() {
      return 'DataFrame';
    }
  }]);

  function TimelineView() {
    var _ref;

    _classCallCheck(this, TimelineView);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = TimelineView.__proto__ || Object.getPrototypeOf(TimelineView)).call.apply(_ref, [this].concat(args)));

    _this._brush = new _BrushView2.default({
      config: new _BrushConfigModel2.default({
        isSharedContainer: true
      })
    });

    _this.listenTo(_this.model, 'change', _this.render);
    _this.listenTo(_this.config, 'change', _this.render);
    _this.listenTo(_this._brush, 'selection', _lodash2.default.throttle(_this._onSelection));
    _this._onResize = _this._onResize.bind(_this);
    window.addEventListener('resize', _this._onResize);
    _this._debouncedEnable = _lodash2.default.debounce(function () {
      _this._disabled = false;
    }, _this.config.get('duration'));
    return _this;
  }

  _createClass(TimelineView, [{
    key: 'render',
    value: function render() {
      this.resetParams();
      var rect = this._container.getBoundingClientRect();
      this.params.width = rect.width;
      _get(TimelineView.prototype.__proto__ || Object.getPrototypeOf(TimelineView.prototype), 'render', this).call(this);

      var xAccessor = this.config.get('accessor');
      var xRange = [0, this.config.get('width') || rect.width];
      var yRange = [this.config.get('height'), 0];
      var xScale = d3Scale.scaleLinear().range(xRange).domain(this.model.getRangeFor(xAccessor));
      this.config.set({ xRange: xRange, yRange: yRange, xScale: xScale }, { silent: true });

      var barHeight = 10;
      this._bar = this.d3.selectAll(this.selectors.bar).data([{ barHeight: barHeight }]);
      this._bar.enter().append('rect').attr('class', this.selectorClass('bar')).attr('x', xRange[0]).attr('y', yRange[0] / 2 - barHeight / 2).attr('height', barHeight).attr('width', xRange[1] - xRange[0]).merge(this._bar).transition().ease(d3Ease.easeLinear).duration(this.config.get('duration')).attr('y', yRange[0] / 2 - barHeight / 2).attr('width', xRange[1] - xRange[0]);
      this._bar.exit().remove();

      this._brush.container = this._container;
      this._brush.config.set({
        selection: this.config.selectionRange,
        xRange: xRange,
        yRange: yRange
      }, { silent: true });
      this._brush.render();
      this._ticking = false;
    }
  }, {
    key: 'zoom',
    value: function zoom(_ref2) {
      var accessor = _ref2.accessor,
          range = _ref2.range;

      var sScale = this.config.get('selectionScale');
      var xScale = this.config.get('xScale');
      var visualMin = xScale(range[0]);
      var visualMax = xScale(range[1]);

      // round zoom range to integers in percents including the original exact float values
      var selection = [_lodash2.default.floor(sScale.invert(visualMin)), _lodash2.default.ceil(sScale.invert(visualMax))];

      if (_lodash2.default.isEqual(this.config.get('selection'), selection)) return;
      this.config.set('selection', selection, { silent: true });
      this._update();
    }

    // Event handlers

  }, {
    key: '_onSelection',
    value: function _onSelection(range) {
      if (this._disabled) return;
      var xAccessor = this.config.get('accessor');
      var xScale = this.config.get('xScale');
      var xMin = xScale.invert(range[0]);
      var xMax = xScale.invert(range[1]);
      var sScale = this.config.get('selectionScale');
      var selection = [_lodash2.default.floor(sScale.invert(range[0])), _lodash2.default.ceil(sScale.invert(range[1]))];
      this.config.set('selection', selection, { silent: true });

      // TODO navigation should not know anything about the data it operates
      if (_lodash2.default.isDate(xMin)) xMin = xMin.getTime();
      if (_lodash2.default.isDate(xMax)) xMax = xMax.getTime();

      var data = _defineProperty({}, xAccessor, [xMin, xMax]);
      _Actionman2.default.fire('Zoom', this.config.get('updateComponents'), data);
    }
    /**
     * Turn off selection for the animation period on resize
     */

  }, {
    key: '_onResize',
    value: function _onResize() {
      this._disabled = true;
      this._debouncedEnable();
      if (!this._ticking) {
        window.requestAnimationFrame(this.render.bind(this));
        this._ticking = true;
      }
    }
  }, {
    key: 'tagName',
    get: function get() {
      return 'g';
    }
  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(TimelineView.prototype.__proto__ || Object.getPrototypeOf(TimelineView.prototype), 'selectors', this), {
        bar: '.timeline-bar'
      });
    }
  }, {
    key: 'width',
    get: function get() {
      return this.config.get('width') || this._container.getBoundingClientRect().width;
    }
  }]);

  return TimelineView;
}(_contrailChartsView2.default);

exports.default = TimelineView;

/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var TooltipConfigModel = function (_ContrailChartsConfig) {
  _inherits(TooltipConfigModel, _ContrailChartsConfig);

  function TooltipConfigModel() {
    _classCallCheck(this, TooltipConfigModel);

    return _possibleConstructorReturn(this, (TooltipConfigModel.__proto__ || Object.getPrototypeOf(TooltipConfigModel)).apply(this, arguments));
  }

  _createClass(TooltipConfigModel, [{
    key: 'defaults',
    get: function get() {
      var _this2 = this;

      return Object.assign(_get(TooltipConfigModel.prototype.__proto__ || Object.getPrototypeOf(TooltipConfigModel.prototype), 'defaults', this), {
        // Which tooltip ids to accept. If empty accept all.
        acceptFilters: [],

        // place tooltip at the top of the cursor by default
        placement: 'vertical',

        sticky: false,
        // Default formatter to build tooltip content.
        formatter: function formatter(data) {
          var tooltipContent = {};
          var dataConfig = _this2.get('dataConfig');
          var titleConfig = _this2.get('title');

          if (titleConfig) {
            tooltipContent.title = _lodash2.default.isString(titleConfig) ? titleConfig : _this2.getFormattedValue(data, titleConfig);
          }

          // Todo move out color to be class based.
          tooltipContent.color = _this2.get('color');
          tooltipContent.backgroundColor = _this2.get('backgroundColor');

          tooltipContent.items = _lodash2.default.map(dataConfig, function (datumConfig) {
            return {
              label: _this2.getLabel(data, datumConfig),
              value: _this2.getFormattedValue(data, datumConfig)
            };
          });
          return tooltipContent;
        }
      });
    }
  }, {
    key: 'sourceId',
    get: function get() {
      return this._parent.id;
    }
    // TODO

  }, {
    key: 'stickyMargin',
    get: function get() {
      return { left: 0, right: 0 };
    }
  }]);

  return TooltipConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = TooltipConfigModel;

/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

var _TitleView = __webpack_require__(27);

var _TitleView2 = _interopRequireDefault(_TitleView);

var _tooltip = __webpack_require__(202);

var _tooltip2 = _interopRequireDefault(_tooltip);

__webpack_require__(190);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright (c) Juniper Networks, Inc. All rights reserved.

var TooltipView = function (_ContrailChartsView) {
  _inherits(TooltipView, _ContrailChartsView);

  function TooltipView(p) {
    _classCallCheck(this, TooltipView);

    var _this = _possibleConstructorReturn(this, (TooltipView.__proto__ || Object.getPrototypeOf(TooltipView)).call(this, p));

    _this.resetParams();
    _this.listenTo(_this.config, 'change', _this.resetParams);
    return _this;
  }

  _createClass(TooltipView, [{
    key: 'show',

    /**
     * @param {Object} position relative to container: top, left in pixels
     * @param {Object} data to display
     */
    value: function show(rect, data) {
      var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var left = rect.left,
          top = rect.top;

      var placement = void 0;
      this._loadTemplate(data);
      this.d3.classed('active', true);

      if (this.config.get('sticky')) {
        // TODO do not make assumptions on source component internal structure, just get it by ID only
        // and get margin from its config model
        var sourceRect = this._container.querySelector('#' + this.config.sourceId + ' clipPath rect').getBoundingClientRect();
        var containerRect = this._container.getBoundingClientRect();
        left = sourceRect.left - containerRect.left;
        if (rect.left > containerRect.width / 2) {
          left += this.config.stickyMargin.left;
        } else {
          left += sourceRect.width - this.config.stickyMargin.right - this.width;
        }
        top = sourceRect.top - containerRect.top + (sourceRect.height / 2 - this.height / 2);
      } else {
        placement = p.placement || this.config.get('placement');
      }
      this.place({ left: left, top: top }, placement);
      this.el.style.height = rect.height + 'px';
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.d3.classed('active', false);
    }
    /**
     * Position tooltip box relative to the passed center point (usually cursor)
     * vertical and horizontal placement tries to keep the box within container
     */

  }, {
    key: 'place',
    value: function place(point, placement) {
      var left = point.left,
          top = point.top;

      var margin = 10;
      var containerWidth = this._container.offsetWidth;
      var containerHeight = this._container.offsetHeight;

      switch (placement) {
        case 'vertical':
          if (top - this.height - margin > 0) return this.place(point, 'top');else if (top + this.height + margin < containerHeight) return this.place(point, 'bottom');
          return this.place(point, 'center');
        case 'horizontal':
          if (left + this.width + margin < containerWidth) return this.place(point, 'right');else if (left - this.width - margin > 0) return this.place(point, 'left');
          return this.place(point, 'center');
        case 'top':
          left = left - this.width / 2;
          top = top - this.height - margin;
          break;
        case 'bottom':
          left = left - this.width / 2;
          top = top + margin;
          break;
        case 'left':
          left = left - this.width - margin;
          top = top - this.height / 2;
          break;
        case 'right':
          left = left + margin;
          top = top - this.height / 2;
          break;
        case 'center':
          left = left - this.width / 2;
          top = top - this.height / 2;
      }
      this.el.style.left = left + 'px';
      this.el.style.top = top + 'px';
    }
  }, {
    key: '_loadTemplate',
    value: function _loadTemplate(data) {
      var template = this.config.get('template') || _tooltip2.default;
      var tooltipContent = this.config.get('formatter').bind(this.config)(data);
      _get(TooltipView.prototype.__proto__ || Object.getPrototypeOf(TooltipView.prototype), 'render', this).call(this, template(tooltipContent));
      // TODO Discuss if title needs to be handled via TitleView or using the tooltip template itself.
      if (tooltipContent.title) {
        (0, _TitleView2.default)(this.d3.select('.tooltip-content').node(), tooltipContent.title);
      }
    }
  }, {
    key: 'width',
    get: function get() {
      return this.el.offsetWidth;
    }
  }, {
    key: 'height',
    get: function get() {
      return this.el.offsetHeight;
    }
  }]);

  return TooltipView;
}(_contrailChartsView2.default);

exports.default = TooltipView;

/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _contrailEvents = __webpack_require__(18);

var _contrailEvents2 = _interopRequireDefault(_contrailEvents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _contrailEvents2.default; /*
                                            * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                            */

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Scale = __webpack_require__(0);

var d3Scale = _interopRequireWildcard(_d3Scale);

var _contrailChartsConfigModel = __webpack_require__(4);

var _contrailChartsConfigModel2 = _interopRequireDefault(_contrailChartsConfigModel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var BucketConfigModel = function (_ContrailChartsConfig) {
  _inherits(BucketConfigModel, _ContrailChartsConfig);

  function BucketConfigModel() {
    _classCallCheck(this, BucketConfigModel);

    return _possibleConstructorReturn(this, (BucketConfigModel.__proto__ || Object.getPrototypeOf(BucketConfigModel)).apply(this, arguments));
  }

  _createClass(BucketConfigModel, [{
    key: 'defaults',
    get: function get() {
      return Object.assign(_get(BucketConfigModel.prototype.__proto__ || Object.getPrototypeOf(BucketConfigModel.prototype), 'defaults', this), {
        isSharedContainer: true,
        // range start 256 - is an area of 16x16 square considering the default font for number of buckets as 14px
        range: [256, 512],
        scale: d3Scale.scaleLinear(),
        shape: '&#xf111;',

        // default value is set in css
        color: undefined
      });
    }
  }, {
    key: 'scale',
    get: function get() {
      var configRange = this.attributes.range;
      var defaultRange = this.defaults.range;
      var start = _lodash2.default.isNil(configRange[0]) ? defaultRange[0] : configRange[0];
      var end = _lodash2.default.isNil(configRange[1]) ? defaultRange[1] : configRange[1];
      return this.attributes.scale.range([start, end]);
    }
  }, {
    key: 'duration',
    get: function get() {
      return this._parent.get('duration') || this.attributes.duration;
    }
  }, {
    key: 'xAccessor',
    get: function get() {
      return this._parent.get('plot.x.accessor');
    }
  }, {
    key: 'updateComponents',
    get: function get() {
      return this._parent.get('updateComponents');
    }
  }]);

  return BucketConfigModel;
}(_contrailChartsConfigModel2.default);

exports.default = BucketConfigModel;

/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Array = __webpack_require__(0);

var d3Array = _interopRequireWildcard(_d3Array);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _d3Ease = __webpack_require__(0);

var d3Ease = _interopRequireWildcard(_d3Ease);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

var _Util = __webpack_require__(31);

var _Cluster = __webpack_require__(162);

var _Cluster2 = _interopRequireDefault(_Cluster);

var _contrailChartsView = __webpack_require__(3);

var _contrailChartsView2 = _interopRequireDefault(_contrailChartsView);

__webpack_require__(192);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var BucketView = function (_ContrailChartsView) {
  _inherits(BucketView, _ContrailChartsView);

  function BucketView() {
    _classCallCheck(this, BucketView);

    return _possibleConstructorReturn(this, (BucketView.__proto__ || Object.getPrototypeOf(BucketView)).apply(this, arguments));
  }

  _createClass(BucketView, [{
    key: 'render',
    value: function render(points) {
      _get(BucketView.prototype.__proto__ || Object.getPrototypeOf(BucketView.prototype), 'render', this).call(this);
      this.d3.attr('clip-path', 'url(#' + this.config.get('clip') + ')');
      var data = this._bucketize(points);

      var buckets = this.d3.selectAll(this.selectors.node).data(data, function (d) {
        return d.id;
      });

      var shape = this.config.get('shape');
      var color = this.config.get('color');
      var scale = this.config.scale;
      var groups = buckets.enter().append('g').classed(this.selectorClass('node'), true).classed(this.selectorClass('interactive'), true).attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
      groups.append('text').html(shape).attr('fill', color).style('font-size', function (d) {
        return Math.sqrt(scale(d.area));
      });

      groups.append('text').attr('class', this.selectorClass('label')).text(function (d) {
        return d.bucket.length;
      });
      // Update
      buckets.transition().ease(d3Ease.easeLinear).duration(this.config.duration).attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

      buckets.exit().remove();
    }
  }, {
    key: '_bucketize',
    value: function _bucketize(data) {
      var _this2 = this;

      var cluster = new _Cluster2.default();
      cluster.x(function (d) {
        return d.x;
      }).y(function (d) {
        return d.y;
      }).data(data);
      var buckets = cluster.buckets();

      _lodash2.default.each(buckets, function (d) {
        d.id = _this2._getId(d);
        d.area = _this2._getSize(d);
      });
      this.config.scale.domain(d3Array.extent(buckets, function (d) {
        return d.area;
      }));

      return buckets;
    }
  }, {
    key: '_getId',
    value: function _getId(bucket) {
      var summaryId = _lodash2.default.reduce(bucket.bucket, function (sum, datum) {
        sum += datum.id;
        return sum;
      }, '');
      return (0, _Util.hashCode)(summaryId);
    }
  }, {
    key: '_getSize',
    value: function _getSize(bucket) {
      return _lodash2.default.reduce(bucket.bucket, function (sum, datum) {
        sum += datum.area;
        return sum;
      }, 0);
    }

    // Event handlers

  }, {
    key: '_onMouseover',
    value: function _onMouseover(d, el, event) {
      var tooltip = this.config.get('tooltip');
      if (tooltip) {
        var _d3Selection$mouse = d3Selection.mouse(this._container),
            _d3Selection$mouse2 = _slicedToArray(_d3Selection$mouse, 2),
            left = _d3Selection$mouse2[0],
            top = _d3Selection$mouse2[1];

        _Actionman2.default.fire('ShowComponent', tooltip, { left: left, top: top }, d.bucket);
      }
      el.classList.add(this.selectorClass('active'));
    }
  }, {
    key: '_onMouseout',
    value: function _onMouseout(d, el) {
      var tooltip = this.config.get('tooltip');
      if (tooltip) {
        _Actionman2.default.fire('HideComponent', tooltip);
      }
      var els = el ? this.d3.select(function () {
        return el;
      }) : this.d3.selectAll(this.selectors.node);
      els.classed('active', false);
    }
  }, {
    key: '_onClickNode',
    value: function _onClickNode(d, el, e) {
      e.stopPropagation();
      this._onMouseout(d, el);
      var ranges = {};
      (0, _lodash2.default)(d.bucket).map('accessor.accessor').uniq().push(this.config.xAccessor).each(function (accessor) {
        ranges[accessor] = d3Array.extent(_lodash2.default.map(d.bucket, 'data.' + accessor));
      });
      _Actionman2.default.fire('Zoom', this.config.updateComponents, ranges);
    }
  }, {
    key: 'tagName',
    get: function get() {
      return 'g';
    }
  }, {
    key: 'zIndex',
    get: function get() {
      return 2;
    }
  }, {
    key: 'selectors',
    get: function get() {
      return _lodash2.default.extend(_get(BucketView.prototype.__proto__ || Object.getPrototypeOf(BucketView.prototype), 'selectors', this), {
        node: '.bucket',
        active: '.active',
        label: '.bucket-label'
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return _lodash2.default.extend(_get(BucketView.prototype.__proto__ || Object.getPrototypeOf(BucketView.prototype), 'events', this), {
        'click node': '_onClickNode',
        'mouseover node': '_onMouseover',
        'mouseout node': '_onMouseout'
      });
    }
  }]);

  return BucketView;
}(_contrailChartsView2.default);

exports.default = BucketView;

/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Quadtree = __webpack_require__(172);

var _d3Array = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Clusterize overlapping shapes
 * Works with 2D array
 * Shapes are considered rectangles
 * TODO operate on width and height instead of halves
 */
var Cluster = function () {
  function Cluster() {
    _classCallCheck(this, Cluster);
  }

  _createClass(Cluster, [{
    key: 'x',
    value: function x(getX) {
      this._getX = getX;
      return this;
    }
  }, {
    key: 'y',
    value: function y(getY) {
      this._getY = getY;
      return this;
    }
  }, {
    key: 'data',
    value: function data(_data) {
      this._overlapping = undefined;
      this._buckets = undefined;

      this._data = _data;
      this._quadtree = (0, _d3Quadtree.quadtree)().x(this._getX).y(this._getY).addAll(_data);
      this._maxW = (0, _d3Array.max)(_data, function (d) {
        return d.halfWidth;
      });
      this._maxH = (0, _d3Array.max)(_data, function (d) {
        return d.halfHeight;
      });

      return this;
    }
    /**
     * @return {Array} of points which overlaps with others
     */

  }, {
    key: 'overlapping',
    value: function overlapping() {
      var _this = this;

      if (this._overlapping) return this._overlapping;else this._overlapping = [];

      _lodash2.default.each(this._data, function (point) {
        // TODO add option to set modify or not original data array
        point.overlap = _this._collisionDetection(point);
      });
      _lodash2.default.each(this._data, function (d) {
        if (d.overlap) {
          _lodash2.default.each(d.overlap, function (d) {
            // TODO some overlapping nodes are not marked both
            if (d.overlap && !_this._overlapping.includes(d)) _this._overlapping.push(d);
          });
        }
      });
      return this._overlapping;
    }
    /** Aggregates points into bucket points
     * Minimize amount of bucketized nodes
     * @return {Array} bucket points
     */

  }, {
    key: 'buckets',
    value: function buckets() {
      if (this._buckets) return this._buckets;else this._buckets = [];
      if (_lodash2.default.isEmpty(this.overlapping())) return [];

      // Maximize the number of points in the bucket
      // this will make some points overlapping with multiple other nodes alone
      // as they will not be included to bigger buckets starting with the root node with which there is no overlap
      var toBuckets = _lodash2.default.sortBy(this.overlapping(), function (d) {
        return d.overlap.length;
      });
      do {
        var root = toBuckets.pop();

        // add to current bucket points which are not added to other buckets
        var bucket = _lodash2.default.filter(root.overlap, function (d) {
          var index = toBuckets.indexOf(d);
          if (index < 0) return;
          return toBuckets.splice(index, 1)[0];
        });
        if (!bucket.length) continue;
        this._buckets.push({
          // TODO position bucket point at the center of aggregated points
          x: root.x,
          y: root.y,
          // TODO calculate halfWidth and halfHeight based on aggregated points
          bucket: [root].concat(_toConsumableArray(bucket))
        });
      } while (toBuckets.length);
      return this._buckets;
    }
    /**
     * Find the nodes within the specified rectangle.
     * @param {Object} p point specified by two points
     */

  }, {
    key: '_collisionDetection',
    value: function _collisionDetection(p) {
      var _this2 = this;

      var x0 = p.x - p.halfWidth;
      var y0 = p.y - p.halfHeight;
      var x3 = p.x + p.halfWidth;
      var y3 = p.y + p.halfHeight;
      var collided = [];
      this._quadtree.visit(function (node, x1, y1, x2, y2) {
        if (!node.length) {
          do {
            var d = node.data;
            if (d.x + d.halfWidth >= x0 && d.x - d.halfWidth < x3 && d.y + d.halfHeight >= y0 && d.y - d.halfHeight < y3) {
              if (d !== p) collided.push(d);
            }
            node = node.next;
          } while (node);
        }
        return x1 - _this2._maxW >= x3 || y1 - _this2._maxH >= y3 || x2 + _this2._maxW < x0 || y2 + _this2._maxH < y0;
      });
      return collided.length ? collided : false;
    }
  }]);

  return Cluster;
}();

exports.default = Cluster;

/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _backbone = __webpack_require__(28);

var _backbone2 = _interopRequireDefault(_backbone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var ContrailModel = function (_Backbone$Model) {
  _inherits(ContrailModel, _Backbone$Model);

  function ContrailModel() {
    _classCallCheck(this, ContrailModel);

    return _possibleConstructorReturn(this, (ContrailModel.__proto__ || Object.getPrototypeOf(ContrailModel)).apply(this, arguments));
  }

  _createClass(ContrailModel, [{
    key: 'get',
    value: function get(attr) {
      return _lodash2.default.get(this.attributes, attr);
    }
  }]);

  return ContrailModel;
}(_backbone2.default.Model);

exports.default = ContrailModel;

/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _backbone = __webpack_require__(28);

var _backbone2 = _interopRequireDefault(_backbone);

var _jquery = __webpack_require__(51);

var _jquery2 = _interopRequireDefault(_jquery);

var _d3Selection = __webpack_require__(0);

var d3Selection = _interopRequireWildcard(_d3Selection);

var _Actionman = __webpack_require__(2);

var _Actionman2 = _interopRequireDefault(_Actionman);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


d3Selection.selection.prototype.delegate = function (eventName, targetSelector, handler) {
  function delegated() {
    // TODO use jquery.closest d3 alternative here
    // as native closest is not supported in IE15
    var eventTarget = (0, _jquery2.default)(d3Selection.event.target).closest(targetSelector)[0];
    if (eventTarget) handler.call(eventTarget, eventTarget.__data__, eventTarget, d3Selection.event);
  }
  return this.on(eventName, delegated);
};
/**
 * Extending Backbone View
 */

var ContrailView = function (_Backbone$View) {
  _inherits(ContrailView, _Backbone$View);

  function ContrailView(p) {
    _classCallCheck(this, ContrailView);

    var _this = _possibleConstructorReturn(this, (ContrailView.__proto__ || Object.getPrototypeOf(ContrailView)).call(this, p));

    _this.actionman = _Actionman2.default;
    return _this;
  }
  /**
   * @return {String} this class name without 'View'
   */


  _createClass(ContrailView, [{
    key: 'selectorClass',

    /**
     * Convenience method to get class name of selector
     * Just remove leading dot
     */
    value: function selectorClass(selectorName) {
      return this.selectors[selectorName].substr(1);
    }

    // TODO move this function to Utils?
    // instanceof SVGElement works for existing element

  }, {
    key: 'isTagNameSvg',
    value: function isTagNameSvg(tagName) {
      return _lodash2.default.includes(['g'], tagName);
    }
  }, {
    key: 'delegateEvents',
    value: function delegateEvents(events) {
      events || (events = _lodash2.default.result(this, 'events'));
      if (!events) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_lodash2.default.isFunction(method)) method = this[method];
        if (!method) continue;
        var match = key.match(this.delegateEventSplitter);
        this.delegate(match[1], match[2], method.bind(this), events[key]);
      }
      return this;
    }
    /**
     * Replace jquery with d3
     * d3 doesn't support multiple listeners on the same event and element,
     * so add listener name to create event namespace
     */

  }, {
    key: 'delegate',
    value: function delegate(eventName, selectorName, listener, listenerName) {
      // code minification drops original listener name
      // const listenerName = listener.name.split(' ')[1]
      var uniqEventName = eventName + '.' + selectorName + '.' + listenerName + '.delegateEvents' + this.cid;
      this.d3.delegate(uniqEventName, this.selectors[selectorName], listener);
      return this;
    }
    // d3 doesn't support two levels of event namespace
    // TODO undelegate one by one

  }, {
    key: 'undelegateEvents',
    value: function undelegateEvents() {
      // if (this.d3) this.d3.on('.delegateEvents' + this.cid, null)
      return this;
    }
  }, {
    key: 'undelegate',
    value: function undelegate(eventName, selectorName, listener) {
      var listenerName = listener.name.split(' ')[1];
      this.d3.on(eventName + '.' + selectorName + '.' + listenerName + '.delegateEvents' + this.cid, null);
      return this;
    }
    /**
     * svg elements are xml and require namespace to be specified
     */

  }, {
    key: '_createElement',
    value: function _createElement(tagName) {
      if (this.isTagNameSvg(tagName)) {
        return document.createElementNS('http://www.w3.org/2000/svg', tagName);
      } else return _get(ContrailView.prototype.__proto__ || Object.getPrototypeOf(ContrailView.prototype), '_createElement', this).call(this, tagName);
    }
    /**
     * d3 selection shortcut for view element
     */

  }, {
    key: '_setElement',
    value: function _setElement(el) {
      _get(ContrailView.prototype.__proto__ || Object.getPrototypeOf(ContrailView.prototype), '_setElement', this).call(this, el);
      this.d3 = d3Selection.select(el);
    }
  }, {
    key: 'type',
    get: function get() {
      return this.constructor.name.slice(0, -4);
    }
    /**
     * @return {String} this class name in dashed case without 'View'
     */

  }, {
    key: 'className',
    get: function get() {
      return this.constructor.name.slice(0, -4).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
  }, {
    key: 'delegateEventSplitter',
    get: function get() {
      return (/^(\S+)\s*(.*)$/
      );
    }
  }]);

  return ContrailView;
}(_backbone2.default.View);

exports.default = ContrailView;

/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Array = __webpack_require__(0);

var d3Array = _interopRequireWildcard(_d3Array);

var _contrailEvents = __webpack_require__(18);

var _contrailEvents2 = _interopRequireDefault(_contrailEvents);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Data preparation
 */
var DataFrameProvider = function () {
  function DataFrameProvider(data, config) {
    _classCallCheck(this, DataFrameProvider);

    this.data = data;
    this.config = config;
    this._ranges = {};
  }

  _createClass(DataFrameProvider, [{
    key: 'parse',
    value: function parse(data) {
      return _lodash2.default.isFunction(this._formatter) ? this._formatter(data) : data;
    }
    /**
     * Calculate and cache range of a serie
     * @param {String} accessor - serie accessor
     * @param {Boolean} isFull if true get range of the whole data, not just selection
     * @return {Array} [min, max] extent of values of the serie
     */

  }, {
    key: 'getRangeFor',
    value: function getRangeFor(accessor, isFull) {
      if (isFull) return d3Array.extent(this._data, function (d) {
        return _lodash2.default.get(d, accessor);
      });

      if (!_lodash2.default.has(this._ranges, accessor)) {
        this._ranges[accessor] = d3Array.extent(this._data, function (d) {
          return _lodash2.default.get(d, accessor);
        });
      }
      return _lodash2.default.clone(this._ranges[accessor]);
    }
    /**
     * @return {Array} [min, max] values of provided series values combined
     */

  }, {
    key: 'combineDomains',
    value: function combineDomains(accessors) {
      var _this = this;

      var domains = _lodash2.default.map(accessors, function (accessor) {
        return _this.getRangeFor(accessor);
      });
      return d3Array.extent(_lodash2.default.concat.apply(_lodash2.default, _toConsumableArray(domains)));
    }
    /**
     * Limited to ascending sorted values
     */

  }, {
    key: 'getNearest',
    value: function getNearest(accessor, value) {
      var data = this._data;
      var xBisector = d3Array.bisector(function (d) {
        return _lodash2.default.get(d, accessor);
      }).left;
      var index = xBisector(data, value, 1, data.length - 1);
      return value - _lodash2.default.get(data[index - 1], accessor) > _lodash2.default.get(data[index], accessor) - value ? data[index] : data[index - 1];
    }
    /**
     * Filter out dataframes which have no provided key or its value is not within provided range
     * @param {String} key - serie accessor to filter dataframes by
     * @param {Array} range - [min, max] values of a serie
     */

  }, {
    key: 'filter',
    value: function filter(key, range) {
      return _lodash2.default.filter(this._data, function (d) {
        return _lodash2.default.has(d, key) && d[key] >= range[0] && d[key] <= range[1];
      });
    }
    /**
     * Utility function to filter data by inclusion of dataframe inside provided ranges
     * @param {Object[]} data
     * @param {Object} ranges
     * @param {Object[]} ranges.keys
     */

  }, {
    key: 'filterByRanges',
    value: function filterByRanges(data, ranges) {
      return _lodash2.default.filter(data, function (d) {
        var pass = true;
        var i = 0;
        var keys = ranges.keys();
        while (pass && i < keys.length) {
          var key = keys[i];
          pass = _lodash2.default.has(d, key) && d[key] >= ranges[key][0] && d[key] <= ranges[key][1];
          i++;
        }
      });
    }
  }, {
    key: 'data',
    get: function get() {
      return this._data;
    },
    set: function set(data) {
      this._data = this.parse(data) || [];
      this._ranges = {};
      this.trigger('change');
    }
  }, {
    key: 'config',
    set: function set() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          formatter = _ref.formatter;

      if (!formatter) return;
      this._formatter = formatter;
      this.trigger('change');
    }
  }]);

  return DataFrameProvider;
}();
// TODO replace with class extends syntax


exports.default = DataFrameProvider;
_lodash2.default.extend(DataFrameProvider.prototype, _contrailEvents2.default);

/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) Juniper Networks, Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _lodash = __webpack_require__(1);

var _lodash2 = _interopRequireDefault(_lodash);

var _contrailEvents = __webpack_require__(18);

var _contrailEvents2 = _interopRequireDefault(_contrailEvents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SerieProvider = function () {
  function SerieProvider(data, config) {
    _classCallCheck(this, SerieProvider);

    this.data = data;
    this.config = config;
  }

  _createClass(SerieProvider, [{
    key: 'parse',
    value: function parse(data) {
      return _lodash2.default.isFunction(this._formatter) ? this._formatter(data) : data;
    }
  }, {
    key: 'getLabels',
    value: function getLabels(formatter) {
      return _lodash2.default.map(this._data, function (serie) {
        return formatter(serie);
      });
    }
  }, {
    key: 'data',
    get: function get() {
      return this._data;
    },
    set: function set(data) {
      this._data = this.parse(data) || [];
      this.trigger('change');
    }
  }, {
    key: 'config',
    set: function set() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          formatter = _ref.formatter;

      if (!formatter) return;
      this._formatter = formatter;
      this.trigger('change');
    }
  }]);

  return SerieProvider;
}();
// TODO replace with class extends syntax


exports.default = SerieProvider;
_lodash2.default.extend(SerieProvider.prototype, _contrailEvents2.default);

/***/ }),
/* 167 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_chord__ = __webpack_require__(55);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_chord___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__src_chord__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "chord", function() { return __WEBPACK_IMPORTED_MODULE_0__src_chord___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_ribbon__ = __webpack_require__(57);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_ribbon___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__src_ribbon__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "ribbon", function() { return __WEBPACK_IMPORTED_MODULE_1__src_ribbon___default.a; });




/***/ }),
/* 168 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_nest__ = __webpack_require__(60);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_nest___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__src_nest__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "nest", function() { return __WEBPACK_IMPORTED_MODULE_0__src_nest___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_set__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_set___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__src_set__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "set", function() { return __WEBPACK_IMPORTED_MODULE_1__src_set___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_map__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__src_map__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "map", function() { return __WEBPACK_IMPORTED_MODULE_2__src_map___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__src_keys__ = __webpack_require__(59);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__src_keys___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__src_keys__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "keys", function() { return __WEBPACK_IMPORTED_MODULE_3__src_keys___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__src_values__ = __webpack_require__(62);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__src_values___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__src_values__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "values", function() { return __WEBPACK_IMPORTED_MODULE_4__src_values___default.a; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__src_entries__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__src_entries___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__src_entries__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "entries", function() { return __WEBPACK_IMPORTED_MODULE_5__src_entries___default.a; });








/***/ }),
/* 169 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_dispatch__ = __webpack_require__(65);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_dispatch___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__src_dispatch__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "dispatch", function() { return __WEBPACK_IMPORTED_MODULE_0__src_dispatch___default.a; });



/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

(function (global, factory) {
   true ? factory(exports, __webpack_require__(14)) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-interpolate'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3));
}(this, (function (exports,d3Interpolate) { 'use strict';

/**
 * List of params for each command type in a path `d` attribute
 */
var typeMap = {
  M: ['x', 'y'],
  L: ['x', 'y'],
  H: ['x'],
  V: ['y'],
  C: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
  S: ['x2', 'y2', 'x', 'y'],
  Q: ['x1', 'y1', 'x', 'y'],
  T: ['x', 'y'],
  A: ['rx', 'ry', 'xAxisRotation', 'largeArcFlag', 'sweepFlag', 'x', 'y']
};

/**
 * Convert to object representation of the command from a string
 *
 * @param {String} commandString Token string from the `d` attribute (e.g., L0,0)
 * @return {Object} An object representing this command.
 */
function commandObject(commandString) {
  // convert all spaces to commas
  commandString = commandString.trim().replace(/ /g, ',');

  var type = commandString[0];
  var args = commandString.substring(1).split(',');
  return typeMap[type.toUpperCase()].reduce(function (obj, param, i) {
    // parse X as float since we need it to do distance checks for extending points
    obj[param] = param === 'x' ? parseFloat(args[i]) : args[i];
    return obj;
  }, { type: type });
}

/**
 * Converts a command object to a string to be used in a `d` attribute
 * @param {Object} command A command object
 * @return {String} The string for the `d` attribute
 */
function commandToString(command) {
  var type = command.type;

  var params = typeMap[type.toUpperCase()];
  return '' + type + params.map(function (p) {
    return command[p];
  }).join(',');
}

/**
 * Converts command A to have the same type as command B.
 *
 * e.g., L0,5 -> C0,5,0,5,0,5
 *
 * Uses these rules:
 * x1 <- x
 * x2 <- x
 * y1 <- y
 * y2 <- y
 * rx <- 0
 * ry <- 0
 * xAxisRotation <- read from B
 * largeArcFlag <- read from B
 * sweepflag <- read from B
 *
 * @param {Object} aCommand Command object from path `d` attribute
 * @param {Object} bCommand Command object from path `d` attribute to match against
 * @return {Object} aCommand converted to type of bCommand
 */
function convertToSameType(aCommand, bCommand) {
  var conversionMap = {
    x1: 'x',
    y1: 'y',
    x2: 'x',
    y2: 'y'
  };

  var readFromBKeys = ['xAxisRotation', 'largeArcFlag', 'sweepFlag'];

  // convert (but ignore M types)
  if (aCommand.type !== bCommand.type && bCommand.type.toUpperCase() !== 'M') {
    (function () {
      var aConverted = {};
      Object.keys(bCommand).forEach(function (bKey) {
        var bValue = bCommand[bKey];
        // first read from the A command
        var aValue = aCommand[bKey];

        // if it is one of these values, read from B no matter what
        if (aValue === undefined) {
          if (readFromBKeys.includes(bKey)) {
            aValue = bValue;
          } else {
            // if it wasn't in the A command, see if an equivalent was
            if (aValue === undefined && conversionMap[bKey]) {
              aValue = aCommand[conversionMap[bKey]];
            }

            // if it doesn't have a converted value, use 0
            if (aValue === undefined) {
              aValue = 0;
            }
          }
        }

        aConverted[bKey] = aValue;
      });

      // update the type to match B
      aConverted.type = bCommand.type;
      aCommand = aConverted;
    })();
  }

  return aCommand;
}

/**
 * Extends an array of commands to the length of the second array
 * inserting points at the spot that is closest by X value. Ensures
 * all the points of commandsToExtend are in the extended array and that
 * only numPointsToExtend points are added.
 *
 * @param {Object[]} commandsToExtend The commands array to extend
 * @param {Object[]} referenceCommands The commands array to match
 * @return {Object[]} The extended commands1 array
 */
function extend(commandsToExtend, referenceCommands, numPointsToExtend) {
  // map each command in B to a command in A by counting how many times ideally
  // a command in A was in the initial path (see https://github.com/pbeshai/d3-interpolate-path/issues/8)
  var initialCommandIndex = void 0;
  if (commandsToExtend.length > 1 && commandsToExtend[0].type === 'M') {
    initialCommandIndex = 1;
  } else {
    initialCommandIndex = 0;
  }

  var counts = referenceCommands.reduce(function (counts, refCommand, i) {
    // skip first M
    if (i === 0 && refCommand.type === 'M') {
      counts[0] = 1;
      return counts;
    }

    var minDistance = Math.abs(commandsToExtend[initialCommandIndex].x - refCommand.x);
    var minCommand = initialCommandIndex;

    // find the closest point by X position in A
    for (var j = initialCommandIndex + 1; j < commandsToExtend.length; j++) {
      var distance = Math.abs(commandsToExtend[j].x - refCommand.x);
      if (distance < minDistance) {
        minDistance = distance;
        minCommand = j;
        // since we assume sorted by X, once we find a value farther, we can return the min.
      } else {
        break;
      }
    }

    counts[minCommand] = (counts[minCommand] || 0) + 1;
    return counts;
  }, {});

  // now extend the array adding in at the appropriate place as needed
  var extended = [];
  var numExtended = 0;
  for (var i = 0; i < commandsToExtend.length; i++) {
    // add in the initial point for this A command
    extended.push(commandsToExtend[i]);

    for (var j = 1; j < counts[i] && numExtended < numPointsToExtend; j++) {
      var commandToAdd = Object.assign({}, commandsToExtend[i]);
      // don't allow multiple Ms
      if (commandToAdd.type === 'M') {
        commandToAdd.type = 'L';
      } else {
        // try to set control points to x and y
        if (commandToAdd.x1 !== undefined) {
          commandToAdd.x1 = commandToAdd.x;
          commandToAdd.y1 = commandToAdd.y;
        }

        if (commandToAdd.x2 !== undefined) {
          commandToAdd.x2 = commandToAdd.x;
          commandToAdd.y2 = commandToAdd.y;
        }
      }
      extended.push(commandToAdd);
      numExtended += 1;
    }
  }

  return extended;
}

/**
 * Interpolate from A to B by extending A and B during interpolation to have
 * the same number of points. This allows for a smooth transition when they
 * have a different number of points.
 *
 * Ignores the `Z` character in paths unless both A and B end with it.
 *
 * @param {String} a The `d` attribute for a path
 * @param {String} b The `d` attribute for a path
 */
function interpolatePath(a, b) {
  // remove Z, remove spaces after letters as seen in IE
  var aNormalized = a == null ? '' : a.replace(/[Z]/gi, '').replace(/([MLCSTQAHV])\s*/gi, '$1');
  var bNormalized = b == null ? '' : b.replace(/[Z]/gi, '').replace(/([MLCSTQAHV])\s*/gi, '$1');
  var aPoints = aNormalized === '' ? [] : aNormalized.split(/(?=[MLCSTQAHV])/gi);
  var bPoints = bNormalized === '' ? [] : bNormalized.split(/(?=[MLCSTQAHV])/gi);

  // if both are empty, interpolation is always the empty string.
  if (!aPoints.length && !bPoints.length) {
    return function nullInterpolator() {
      return '';
    };
  }

  // if A is empty, treat it as if it used to contain just the first point
  // of B. This makes it so the line extends out of from that first point.
  if (!aPoints.length) {
    aPoints.push(bPoints[0]);

    // otherwise if B is empty, treat it as if it contains the first point
    // of A. This makes it so the line retracts into the first point.
  } else if (!bPoints.length) {
    bPoints.push(aPoints[0]);
  }

  // convert to command objects so we can match types
  var aCommands = aPoints.map(commandObject);
  var bCommands = bPoints.map(commandObject);

  // extend to match equal size
  var numPointsToExtend = Math.abs(bPoints.length - aPoints.length);

  if (numPointsToExtend !== 0) {
    // B has more points than A, so add points to A before interpolating
    if (bCommands.length > aCommands.length) {
      aCommands = extend(aCommands, bCommands, numPointsToExtend);

      // else if A has more points than B, add more points to B
    } else if (bCommands.length < aCommands.length) {
      bCommands = extend(bCommands, aCommands, numPointsToExtend);
    }
  }

  // commands have same length now.
  // convert A to the same type of B
  aCommands = aCommands.map(function (aCommand, i) {
    return convertToSameType(aCommand, bCommands[i]);
  });

  var aProcessed = aCommands.map(commandToString).join('');
  var bProcessed = bCommands.map(commandToString).join('');

  // if both A and B end with Z add it back in
  if ((a == null || a[a.length - 1] === 'Z') && (b == null || b[b.length - 1] === 'Z')) {
    aProcessed += 'Z';
    bProcessed += 'Z';
  }

  var stringInterpolator = d3Interpolate.interpolateString(aProcessed, bProcessed);

  return function pathInterpolator(t) {
    // at 1 return the final value without the extensions used during interpolation
    if (t === 1) {
      return b == null ? '' : b;
    }

    return stringInterpolator(t);
  };
}

exports.interpolatePath = interpolatePath;

Object.defineProperty(exports, '__esModule', { value: true });

})));

/***/ }),
/* 171 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_path__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_path___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__src_path__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "path", function() { return __WEBPACK_IMPORTED_MODULE_0__src_path___default.a; });



/***/ }),
/* 172 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_quadtree__ = __webpack_require__(82);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_quadtree___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__src_quadtree__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "quadtree", function() { return __WEBPACK_IMPORTED_MODULE_0__src_quadtree___default.a; });



/***/ }),
/* 173 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_sankey__ = __webpack_require__(90);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_sankey___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__src_sankey__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "sankey", function() { return __WEBPACK_IMPORTED_MODULE_0__src_sankey___default.a; });



/***/ }),
/* 174 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 175 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 176 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 177 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 178 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 179 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 180 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 181 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 182 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 183 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 184 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 185 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 186 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 187 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 188 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 189 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 190 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 191 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 192 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 193 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

var Handlebars = __webpack_require__(8);
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"color-select\" style=\"background-color: "
    + alias4(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"color","hash":{},"data":data}) : helper)))
    + "\" data-accessor=\""
    + alias4(((helper = (helper = helpers.accessor || (depth0 != null ? depth0.accessor : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"accessor","hash":{},"data":data}) : helper)))
    + "\">\n  <span class=\"label\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</span>\n</div>\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "    <span class=\"color-picker-palette-color\" style=\"background-color: "
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\">&nbsp;</span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.series : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "<div class=\"color-picker-palette hide\">\n  <div class=\"color-picker-palette-header\">\n    <span class=\"color-picker-palette-title\"></span>\n  </div>\n  <div class=\"color-picker-palette-body\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.colors : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\n</div>\n";
},"useData":true});

/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

var Handlebars = __webpack_require__(8);
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data) {
    return "<div class=\"opener\"></div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<button title=\""
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "\">\n  <i class=\""
    + alias4(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>\n</button>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.component : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

var Handlebars = __webpack_require__(8);
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"control-panel-items\"></div> \n<div class=\"panel hide\"></div>\n";
},"useData":true});

/***/ }),
/* 197 */
/***/ (function(module, exports, __webpack_require__) {

var Handlebars = __webpack_require__(8);
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"head\">\n  <span class=\"head-icon\"><i class=\""
    + alias4(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i></span>\n  <span class=\"title\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "</span>\n  <span class=\"close\"></span>\n</div>\n<div class=\"body\">\n  <div class=\"control-panel-expanded-container\"></div> \n</div>\n";
},"useData":true});

/***/ }),
/* 198 */
/***/ (function(module, exports, __webpack_require__) {

var Handlebars = __webpack_require__(8);
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "  <div class=\"filter-item\"> \n    <input id=\"filter-item-input-"
    + alias4(((helper = (helper = helpers.key || (depth0 != null ? depth0.key : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"key","hash":{},"data":data}) : helper)))
    + "\" class=\"filter-item-input\" type=\"checkbox\" name=\"filter\" class=\"accessor-data-checkbox\" value=\""
    + alias4(((helper = (helper = helpers.key || (depth0 != null ? depth0.key : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"key","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.enabled : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "> \n    <label for=\"filter-item-input-"
    + alias4(((helper = (helper = helpers.key || (depth0 != null ? depth0.key : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"key","hash":{},"data":data}) : helper)))
    + "\" class=\"accessor-data-checkbox-label\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label> \n  </div> \n";
},"2":function(container,depth0,helpers,partials,data) {
    return "checked";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"filter-items\"> \n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div> \n";
},"useData":true});

/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

var Handlebars = __webpack_require__(8);
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data) {
    return "<div class=\"edit-legend\"><i class=\"fa fa-pencil-square fs\" aria-hidden=\"true\"></i></div>";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "  	<div class=\"attribute\" data-accessor=\""
    + alias4(((helper = (helper = helpers.accessor || (depth0 != null ? depth0.accessor : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"accessor","hash":{},"data":data}) : helper)))
    + "\">\n  		<div class=\"edit-attribute\">\n  			<div class=\"select select--color\" style=\"background-color: "
    + alias4(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"color","hash":{},"data":data}) : helper)))
    + "; border-color: "
    + alias4(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"color","hash":{},"data":data}) : helper)))
    + "\" data-color=\""
    + alias4(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"color","hash":{},"data":data}) : helper)))
    + "\"><div class=\"triangle\"></div></div>\n  			<div class=\"select select--chart fa "
    + alias4(((helper = (helper = helpers.chartIcon || (depth0 != null ? depth0.chartIcon : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"chartIcon","hash":{},"data":data}) : helper)))
    + "\" data-chart-type=\""
    + alias4(((helper = (helper = helpers.chartType || (depth0 != null ? depth0.chartType : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"chartType","hash":{},"data":data}) : helper)))
    + "\"><div class=\"triangle\"></div></div>\n  		</div>\n  		<label class=\"legend-attribute checkbox\">\n  			<input type=\"checkbox\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.checked : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " />\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.shape : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.program(9, data, 0),"data":data})) != null ? stack1 : "")
    + "        <span class=\"associate-axis\">"
    + alias4(((helper = (helper = helpers.axis || (depth0 != null ? depth0.axis : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"axis","hash":{},"data":data}) : helper)))
    + "</span>"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "\n  		</label>\n  	</div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return " checked ";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "        <div class=\"indicator fa\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.checked : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">"
    + ((stack1 = ((helper = (helper = helpers.shape || (depth0 != null ? depth0.shape : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"shape","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return " color: "
    + container.escapeExpression(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"color","hash":{},"data":data}) : helper)))
    + " ";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "        <div class=\"color-indicator\" style=\"border-color: "
    + container.escapeExpression(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"color","hash":{},"data":data}) : helper)))
    + "; "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.checked : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\"></div>\n";
},"10":function(container,depth0,helpers,partials,data) {
    var helper;

  return " background-color: "
    + container.escapeExpression(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"color","hash":{},"data":data}) : helper)))
    + " ";
},"12":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "      <div class=\"switch switch--color\" style=\"background-color: "
    + alias2(alias1(depth0, depth0))
    + "; border-color: "
    + alias2(alias1(depth0, depth0))
    + "\" data-color=\""
    + alias2(alias1(depth0, depth0))
    + "\"></div>\n";
},"14":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "      <div class=\"switch switch--chart fa "
    + alias4(((helper = (helper = helpers.chartIcon || (depth0 != null ? depth0.chartIcon : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"chartIcon","hash":{},"data":data}) : helper)))
    + "\" data-chart-type=\""
    + alias4(((helper = (helper = helpers.chartType || (depth0 != null ? depth0.chartType : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"chartType","hash":{},"data":data}) : helper)))
    + "\" data-axis=\""
    + alias4(((helper = (helper = helpers.axisLabel || (depth0 != null ? depth0.axisLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"axisLabel","hash":{},"data":data}) : helper)))
    + "\"></div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"legend-inner-container\">\n  "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.editable : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n  <div class=\"attributes\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.attributes : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\n\n  <div class=\"selector\">\n    <div class=\"switches switches--colors\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.colors : depth0),{"name":"each","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n\n    <div class=\"switches switches--charts\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.possibleChartTypes : depth0),{"name":"each","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n  </div>\n</div>\n";
},"useData":true});

/***/ }),
/* 200 */
/***/ (function(module, exports, __webpack_require__) {

var Handlebars = __webpack_require__(8);
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"legend-group\">\n  <span class=\"color-indicator\" style=\"background-color: "
    + alias4(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"color","hash":{},"data":data}) : helper)))
    + "\">&nbsp;</span>\n  <span class=\"label\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</span>\n</div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

var Handlebars = __webpack_require__(8);
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda;

  return "<div class=\"message-row "
    + alias4(((helper = (helper = helpers.msgLevel || (depth0 != null ? depth0.msgLevel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"msgLevel","hash":{},"data":data}) : helper)))
    + "\" data-component-id=\""
    + alias4(alias5((depths[1] != null ? depths[1].componentId : depths[1]), depth0))
    + "\" data-action=\""
    + alias4(alias5((depths[1] != null ? depths[1].action : depths[1]), depth0))
    + "\" data-msg-level=\""
    + alias4(((helper = (helper = helpers.level || (depth0 != null ? depth0.level : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"level","hash":{},"data":data}) : helper)))
    + "\">\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.title : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  <div class=\"message-body\">"
    + alias4(alias5((depth0 != null ? depth0.message : depth0), depth0))
    + "</div>\n</div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper, alias1=container.escapeExpression;

  return "  <div class=\"message-heading\">\n    <i class=\"fa "
    + alias1(((helper = (helper = helpers.iconLevel || (depth0 != null ? depth0.iconLevel : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"iconLevel","hash":{},"data":data}) : helper)))
    + "\" aria-hidden=\"true\"></i>\n    <span class=\"message-title\">\n        "
    + alias1(container.lambda((depth0 != null ? depth0.title : depth0), depth0))
    + "\n    </span>\n  </div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.messages : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});

/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

var Handlebars = __webpack_require__(8);
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "  <div class=\"tooltip-item\">\n    "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.color : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n    <span class=\"tooltip-item-label\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</span>\n    <span class=\"tooltip-item-value\">"
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "</span>\n  </div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<span class=\"tooltip-item-color\" style=\"background-color: "
    + container.escapeExpression(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"color","hash":{},"data":data}) : helper)))
    + "\" ></span>";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"tooltip-content\" style=\"color: "
    + alias4(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"color","hash":{},"data":data}) : helper)))
    + "; background-color: "
    + alias4(((helper = (helper = helpers.backgroundColor || (depth0 != null ? depth0.backgroundColor : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"backgroundColor","hash":{},"data":data}) : helper)))
    + "\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.items : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});

/***/ }),
/* 203 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _handlebarsBase = __webpack_require__(50);

var base = _interopRequireWildcard(_handlebarsBase);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _handlebarsSafeString = __webpack_require__(217);

var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

var _handlebarsException = __webpack_require__(15);

var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

var _handlebarsUtils = __webpack_require__(7);

var Utils = _interopRequireWildcard(_handlebarsUtils);

var _handlebarsRuntime = __webpack_require__(216);

var runtime = _interopRequireWildcard(_handlebarsRuntime);

var _handlebarsNoConflict = __webpack_require__(215);

var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _handlebarsSafeString2['default'];
  hb.Exception = _handlebarsException2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9oYW5kbGViYXJzLnJ1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OEJBQXNCLG1CQUFtQjs7SUFBN0IsSUFBSTs7Ozs7b0NBSU8sMEJBQTBCOzs7O21DQUMzQix3QkFBd0I7Ozs7K0JBQ3ZCLG9CQUFvQjs7SUFBL0IsS0FBSzs7aUNBQ1Esc0JBQXNCOztJQUFuQyxPQUFPOztvQ0FFSSwwQkFBMEI7Ozs7O0FBR2pELFNBQVMsTUFBTSxHQUFHO0FBQ2hCLE1BQUksRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7O0FBRTFDLE9BQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZCLElBQUUsQ0FBQyxVQUFVLG9DQUFhLENBQUM7QUFDM0IsSUFBRSxDQUFDLFNBQVMsbUNBQVksQ0FBQztBQUN6QixJQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNqQixJQUFFLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDOztBQUU3QyxJQUFFLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUNoQixJQUFFLENBQUMsUUFBUSxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQzNCLFdBQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7R0FDbkMsQ0FBQzs7QUFFRixTQUFPLEVBQUUsQ0FBQztDQUNYOztBQUVELElBQUksSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztBQUVyQixrQ0FBVyxJQUFJLENBQUMsQ0FBQzs7QUFFakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQzs7cUJBRVIsSUFBSSIsImZpbGUiOiJoYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBiYXNlIGZyb20gJy4vaGFuZGxlYmFycy9iYXNlJztcblxuLy8gRWFjaCBvZiB0aGVzZSBhdWdtZW50IHRoZSBIYW5kbGViYXJzIG9iamVjdC4gTm8gbmVlZCB0byBzZXR1cCBoZXJlLlxuLy8gKFRoaXMgaXMgZG9uZSB0byBlYXNpbHkgc2hhcmUgY29kZSBiZXR3ZWVuIGNvbW1vbmpzIGFuZCBicm93c2UgZW52cylcbmltcG9ydCBTYWZlU3RyaW5nIGZyb20gJy4vaGFuZGxlYmFycy9zYWZlLXN0cmluZyc7XG5pbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4vaGFuZGxlYmFycy9leGNlcHRpb24nO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSAnLi9oYW5kbGViYXJzL3V0aWxzJztcbmltcG9ydCAqIGFzIHJ1bnRpbWUgZnJvbSAnLi9oYW5kbGViYXJzL3J1bnRpbWUnO1xuXG5pbXBvcnQgbm9Db25mbGljdCBmcm9tICcuL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QnO1xuXG4vLyBGb3IgY29tcGF0aWJpbGl0eSBhbmQgdXNhZ2Ugb3V0c2lkZSBvZiBtb2R1bGUgc3lzdGVtcywgbWFrZSB0aGUgSGFuZGxlYmFycyBvYmplY3QgYSBuYW1lc3BhY2VcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IGhiID0gbmV3IGJhc2UuSGFuZGxlYmFyc0Vudmlyb25tZW50KCk7XG5cbiAgVXRpbHMuZXh0ZW5kKGhiLCBiYXNlKTtcbiAgaGIuU2FmZVN0cmluZyA9IFNhZmVTdHJpbmc7XG4gIGhiLkV4Y2VwdGlvbiA9IEV4Y2VwdGlvbjtcbiAgaGIuVXRpbHMgPSBVdGlscztcbiAgaGIuZXNjYXBlRXhwcmVzc2lvbiA9IFV0aWxzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgaGIuVk0gPSBydW50aW1lO1xuICBoYi50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHNwZWMpIHtcbiAgICByZXR1cm4gcnVudGltZS50ZW1wbGF0ZShzcGVjLCBoYik7XG4gIH07XG5cbiAgcmV0dXJuIGhiO1xufVxuXG5sZXQgaW5zdCA9IGNyZWF0ZSgpO1xuaW5zdC5jcmVhdGUgPSBjcmVhdGU7XG5cbm5vQ29uZmxpY3QoaW5zdCk7XG5cbmluc3RbJ2RlZmF1bHQnXSA9IGluc3Q7XG5cbmV4cG9ydCBkZWZhdWx0IGluc3Q7XG4iXX0=


/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.registerDefaultDecorators = registerDefaultDecorators;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _decoratorsInline = __webpack_require__(205);

var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);

function registerDefaultDecorators(instance) {
  _decoratorsInline2['default'](instance);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2RlY29yYXRvcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Z0NBQTJCLHFCQUFxQjs7OztBQUV6QyxTQUFTLHlCQUF5QixDQUFDLFFBQVEsRUFBRTtBQUNsRCxnQ0FBZSxRQUFRLENBQUMsQ0FBQztDQUMxQiIsImZpbGUiOiJkZWNvcmF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlZ2lzdGVySW5saW5lIGZyb20gJy4vZGVjb3JhdG9ycy9pbmxpbmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0RGVjb3JhdG9ycyhpbnN0YW5jZSkge1xuICByZWdpc3RlcklubGluZShpbnN0YW5jZSk7XG59XG5cbiJdfQ==


/***/ }),
/* 205 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _utils = __webpack_require__(7);

exports['default'] = function (instance) {
  instance.registerDecorator('inline', function (fn, props, container, options) {
    var ret = fn;
    if (!props.partials) {
      props.partials = {};
      ret = function (context, options) {
        // Create a new partials stack frame prior to exec.
        var original = container.partials;
        container.partials = _utils.extend({}, original, props.partials);
        var ret = fn(context, options);
        container.partials = original;
        return ret;
      };
    }

    props.partials[options.args[0]] = options.fn;

    return ret;
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2RlY29yYXRvcnMvaW5saW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7cUJBQXFCLFVBQVU7O3FCQUVoQixVQUFTLFFBQVEsRUFBRTtBQUNoQyxVQUFRLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFVBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFO0FBQzNFLFFBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ25CLFdBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFNBQUcsR0FBRyxVQUFTLE9BQU8sRUFBRSxPQUFPLEVBQUU7O0FBRS9CLFlBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7QUFDbEMsaUJBQVMsQ0FBQyxRQUFRLEdBQUcsY0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxRCxZQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLGlCQUFTLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUM5QixlQUFPLEdBQUcsQ0FBQztPQUNaLENBQUM7S0FDSDs7QUFFRCxTQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDOztBQUU3QyxXQUFPLEdBQUcsQ0FBQztHQUNaLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6ImlubGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXh0ZW5kfSBmcm9tICcuLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVyRGVjb3JhdG9yKCdpbmxpbmUnLCBmdW5jdGlvbihmbiwgcHJvcHMsIGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIGxldCByZXQgPSBmbjtcbiAgICBpZiAoIXByb3BzLnBhcnRpYWxzKSB7XG4gICAgICBwcm9wcy5wYXJ0aWFscyA9IHt9O1xuICAgICAgcmV0ID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgcGFydGlhbHMgc3RhY2sgZnJhbWUgcHJpb3IgdG8gZXhlYy5cbiAgICAgICAgbGV0IG9yaWdpbmFsID0gY29udGFpbmVyLnBhcnRpYWxzO1xuICAgICAgICBjb250YWluZXIucGFydGlhbHMgPSBleHRlbmQoe30sIG9yaWdpbmFsLCBwcm9wcy5wYXJ0aWFscyk7XG4gICAgICAgIGxldCByZXQgPSBmbihjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gb3JpZ2luYWw7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHByb3BzLnBhcnRpYWxzW29wdGlvbnMuYXJnc1swXV0gPSBvcHRpb25zLmZuO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG4iXX0=


/***/ }),
/* 206 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.registerDefaultHelpers = registerDefaultHelpers;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersBlockHelperMissing = __webpack_require__(207);

var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

var _helpersEach = __webpack_require__(208);

var _helpersEach2 = _interopRequireDefault(_helpersEach);

var _helpersHelperMissing = __webpack_require__(209);

var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

var _helpersIf = __webpack_require__(210);

var _helpersIf2 = _interopRequireDefault(_helpersIf);

var _helpersLog = __webpack_require__(211);

var _helpersLog2 = _interopRequireDefault(_helpersLog);

var _helpersLookup = __webpack_require__(212);

var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

var _helpersWith = __webpack_require__(213);

var _helpersWith2 = _interopRequireDefault(_helpersWith);

function registerDefaultHelpers(instance) {
  _helpersBlockHelperMissing2['default'](instance);
  _helpersEach2['default'](instance);
  _helpersHelperMissing2['default'](instance);
  _helpersIf2['default'](instance);
  _helpersLog2['default'](instance);
  _helpersLookup2['default'](instance);
  _helpersWith2['default'](instance);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7eUNBQXVDLGdDQUFnQzs7OzsyQkFDOUMsZ0JBQWdCOzs7O29DQUNQLDBCQUEwQjs7Ozt5QkFDckMsY0FBYzs7OzswQkFDYixlQUFlOzs7OzZCQUNaLGtCQUFrQjs7OzsyQkFDcEIsZ0JBQWdCOzs7O0FBRWxDLFNBQVMsc0JBQXNCLENBQUMsUUFBUSxFQUFFO0FBQy9DLHlDQUEyQixRQUFRLENBQUMsQ0FBQztBQUNyQywyQkFBYSxRQUFRLENBQUMsQ0FBQztBQUN2QixvQ0FBc0IsUUFBUSxDQUFDLENBQUM7QUFDaEMseUJBQVcsUUFBUSxDQUFDLENBQUM7QUFDckIsMEJBQVksUUFBUSxDQUFDLENBQUM7QUFDdEIsNkJBQWUsUUFBUSxDQUFDLENBQUM7QUFDekIsMkJBQWEsUUFBUSxDQUFDLENBQUM7Q0FDeEIiLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZWdpc3RlckJsb2NrSGVscGVyTWlzc2luZyBmcm9tICcuL2hlbHBlcnMvYmxvY2staGVscGVyLW1pc3NpbmcnO1xuaW1wb3J0IHJlZ2lzdGVyRWFjaCBmcm9tICcuL2hlbHBlcnMvZWFjaCc7XG5pbXBvcnQgcmVnaXN0ZXJIZWxwZXJNaXNzaW5nIGZyb20gJy4vaGVscGVycy9oZWxwZXItbWlzc2luZyc7XG5pbXBvcnQgcmVnaXN0ZXJJZiBmcm9tICcuL2hlbHBlcnMvaWYnO1xuaW1wb3J0IHJlZ2lzdGVyTG9nIGZyb20gJy4vaGVscGVycy9sb2cnO1xuaW1wb3J0IHJlZ2lzdGVyTG9va3VwIGZyb20gJy4vaGVscGVycy9sb29rdXAnO1xuaW1wb3J0IHJlZ2lzdGVyV2l0aCBmcm9tICcuL2hlbHBlcnMvd2l0aCc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckRlZmF1bHRIZWxwZXJzKGluc3RhbmNlKSB7XG4gIHJlZ2lzdGVyQmxvY2tIZWxwZXJNaXNzaW5nKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJFYWNoKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJIZWxwZXJNaXNzaW5nKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJJZihpbnN0YW5jZSk7XG4gIHJlZ2lzdGVyTG9nKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJMb29rdXAoaW5zdGFuY2UpO1xuICByZWdpc3RlcldpdGgoaW5zdGFuY2UpO1xufVxuIl19


/***/ }),
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _utils = __webpack_require__(7);

exports['default'] = function (instance) {
  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (_utils.isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvYmxvY2staGVscGVyLW1pc3NpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztxQkFBc0QsVUFBVTs7cUJBRWpELFVBQVMsUUFBUSxFQUFFO0FBQ2hDLFVBQVEsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLEVBQUUsVUFBUyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3ZFLFFBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPO1FBQ3pCLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDOztBQUVwQixRQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7QUFDcEIsYUFBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakIsTUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLElBQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUMvQyxhQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN0QixNQUFNLElBQUksZUFBUSxPQUFPLENBQUMsRUFBRTtBQUMzQixVQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3RCLFlBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUNmLGlCQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlCOztBQUVELGVBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ2hELE1BQU07QUFDTCxlQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN0QjtLQUNGLE1BQU07QUFDTCxVQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUMvQixZQUFJLElBQUksR0FBRyxtQkFBWSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsWUFBSSxDQUFDLFdBQVcsR0FBRyx5QkFBa0IsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdFLGVBQU8sR0FBRyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQztPQUN4Qjs7QUFFRCxhQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDN0I7R0FDRixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJibG9jay1oZWxwZXItbWlzc2luZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7YXBwZW5kQ29udGV4dFBhdGgsIGNyZWF0ZUZyYW1lLCBpc0FycmF5fSBmcm9tICcuLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgbGV0IGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmIChjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYgKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICAgICAgICBvcHRpb25zLmlkcyA9IFtvcHRpb25zLm5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIGxldCBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5uYW1lKTtcbiAgICAgICAgb3B0aW9ucyA9IHtkYXRhOiBkYXRhfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=


/***/ }),
/* 208 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = __webpack_require__(7);

var _exception = __webpack_require__(15);

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = _utils.createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (_utils.isArray(context)) {
        for (var j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1);
          }
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey !== undefined) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvZWFjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O3FCQUErRSxVQUFVOzt5QkFDbkUsY0FBYzs7OztxQkFFckIsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsVUFBUyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3pELFFBQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixZQUFNLDJCQUFjLDZCQUE2QixDQUFDLENBQUM7S0FDcEQ7O0FBRUQsUUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUU7UUFDZixPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU87UUFDekIsQ0FBQyxHQUFHLENBQUM7UUFDTCxHQUFHLEdBQUcsRUFBRTtRQUNSLElBQUksWUFBQTtRQUNKLFdBQVcsWUFBQSxDQUFDOztBQUVoQixRQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUMvQixpQkFBVyxHQUFHLHlCQUFrQixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0tBQ2pGOztBQUVELFFBQUksa0JBQVcsT0FBTyxDQUFDLEVBQUU7QUFBRSxhQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUFFOztBQUUxRCxRQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDaEIsVUFBSSxHQUFHLG1CQUFZLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNsQzs7QUFFRCxhQUFTLGFBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtBQUN6QyxVQUFJLElBQUksRUFBRTtBQUNSLFlBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO0FBQ2pCLFlBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFlBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxLQUFLLENBQUMsQ0FBQztBQUN6QixZQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7O0FBRW5CLFlBQUksV0FBVyxFQUFFO0FBQ2YsY0FBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFDO1NBQ3hDO09BQ0Y7O0FBRUQsU0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzdCLFlBQUksRUFBRSxJQUFJO0FBQ1YsbUJBQVcsRUFBRSxtQkFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDL0UsQ0FBQyxDQUFDO0tBQ0o7O0FBRUQsUUFBSSxPQUFPLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO0FBQzFDLFVBQUksZUFBUSxPQUFPLENBQUMsRUFBRTtBQUNwQixhQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN2QyxjQUFJLENBQUMsSUFBSSxPQUFPLEVBQUU7QUFDaEIseUJBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1dBQy9DO1NBQ0Y7T0FDRixNQUFNO0FBQ0wsWUFBSSxRQUFRLFlBQUEsQ0FBQzs7QUFFYixhQUFLLElBQUksR0FBRyxJQUFJLE9BQU8sRUFBRTtBQUN2QixjQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7Ozs7QUFJL0IsZ0JBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUMxQiwyQkFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDaEM7QUFDRCxvQkFBUSxHQUFHLEdBQUcsQ0FBQztBQUNmLGFBQUMsRUFBRSxDQUFDO1dBQ0w7U0FDRjtBQUNELFlBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUMxQix1QkFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3RDO09BQ0Y7S0FDRjs7QUFFRCxRQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDWCxTQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3JCOztBQUVELFdBQU8sR0FBRyxDQUFDO0dBQ1osQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiZWFjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7YXBwZW5kQ29udGV4dFBhdGgsIGJsb2NrUGFyYW1zLCBjcmVhdGVGcmFtZSwgaXNBcnJheSwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuLi9leGNlcHRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ011c3QgcGFzcyBpdGVyYXRvciB0byAjZWFjaCcpO1xuICAgIH1cblxuICAgIGxldCBmbiA9IG9wdGlvbnMuZm4sXG4gICAgICAgIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICByZXQgPSAnJyxcbiAgICAgICAgZGF0YSxcbiAgICAgICAgY29udGV4dFBhdGg7XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICBjb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pICsgJy4nO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWNJdGVyYXRpb24oZmllbGQsIGluZGV4LCBsYXN0KSB7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBkYXRhLmtleSA9IGZpZWxkO1xuICAgICAgICBkYXRhLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIGRhdGEuZmlyc3QgPSBpbmRleCA9PT0gMDtcbiAgICAgICAgZGF0YS5sYXN0ID0gISFsYXN0O1xuXG4gICAgICAgIGlmIChjb250ZXh0UGF0aCkge1xuICAgICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBjb250ZXh0UGF0aCArIGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbZmllbGRdLCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBibG9ja1BhcmFtcyhbY29udGV4dFtmaWVsZF0sIGZpZWxkXSwgW2NvbnRleHRQYXRoICsgZmllbGQsIG51bGxdKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IgKGxldCBqID0gY29udGV4dC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICBpZiAoaSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgICBleGVjSXRlcmF0aW9uKGksIGksIGkgPT09IGNvbnRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcHJpb3JLZXk7XG5cbiAgICAgICAgZm9yIChsZXQga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgICBpZiAoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAvLyBXZSdyZSBydW5uaW5nIHRoZSBpdGVyYXRpb25zIG9uZSBzdGVwIG91dCBvZiBzeW5jIHNvIHdlIGNhbiBkZXRlY3RcbiAgICAgICAgICAgIC8vIHRoZSBsYXN0IGl0ZXJhdGlvbiB3aXRob3V0IGhhdmUgdG8gc2NhbiB0aGUgb2JqZWN0IHR3aWNlIGFuZCBjcmVhdGVcbiAgICAgICAgICAgIC8vIGFuIGl0ZXJtZWRpYXRlIGtleXMgYXJyYXkuXG4gICAgICAgICAgICBpZiAocHJpb3JLZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmlvcktleSA9IGtleTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByaW9yS2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cbiJdfQ==


/***/ }),
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = __webpack_require__(15);

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('helperMissing', function () /* [args, ]options */{
    if (arguments.length === 1) {
      // A missing field in a {{foo}} construct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvaGVscGVyLW1pc3NpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozt5QkFBc0IsY0FBYzs7OztxQkFFckIsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsaUNBQWdDO0FBQ3ZFLFFBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRTFCLGFBQU8sU0FBUyxDQUFDO0tBQ2xCLE1BQU07O0FBRUwsWUFBTSwyQkFBYyxtQkFBbUIsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7S0FDdkY7R0FDRixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJoZWxwZXItbWlzc2luZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi4vZXhjZXB0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbigvKiBbYXJncywgXW9wdGlvbnMgKi8pIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8gQSBtaXNzaW5nIGZpZWxkIGluIGEge3tmb299fSBjb25zdHJ1Y3QuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTb21lb25lIGlzIGFjdHVhbGx5IHRyeWluZyB0byBjYWxsIHNvbWV0aGluZywgYmxvdyB1cC5cbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ01pc3NpbmcgaGVscGVyOiBcIicgKyBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdLm5hbWUgKyAnXCInKTtcbiAgICB9XG4gIH0pO1xufVxuIl19


/***/ }),
/* 210 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _utils = __webpack_require__(7);

exports['default'] = function (instance) {
  instance.registerHelper('if', function (conditional, options) {
    if (_utils.isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvaWYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztxQkFBa0MsVUFBVTs7cUJBRTdCLFVBQVMsUUFBUSxFQUFFO0FBQ2hDLFVBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVMsV0FBVyxFQUFFLE9BQU8sRUFBRTtBQUMzRCxRQUFJLGtCQUFXLFdBQVcsQ0FBQyxFQUFFO0FBQUUsaUJBQVcsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQUU7Ozs7O0FBS3RFLFFBQUksQUFBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxJQUFLLGVBQVEsV0FBVyxDQUFDLEVBQUU7QUFDdkUsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzlCLE1BQU07QUFDTCxhQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDekI7R0FDRixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsVUFBUyxXQUFXLEVBQUUsT0FBTyxFQUFFO0FBQy9ELFdBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztHQUN2SCxDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJpZi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNFbXB0eSwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbmRpdGlvbmFsKSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICAgIC8vIERlZmF1bHQgYmVoYXZpb3IgaXMgdG8gcmVuZGVyIHRoZSBwb3NpdGl2ZSBwYXRoIGlmIHRoZSB2YWx1ZSBpcyB0cnV0aHkgYW5kIG5vdCBlbXB0eS5cbiAgICAvLyBUaGUgYGluY2x1ZGVaZXJvYCBvcHRpb24gbWF5IGJlIHNldCB0byB0cmVhdCB0aGUgY29uZHRpb25hbCBhcyBwdXJlbHkgbm90IGVtcHR5IGJhc2VkIG9uIHRoZVxuICAgIC8vIGJlaGF2aW9yIG9mIGlzRW1wdHkuIEVmZmVjdGl2ZWx5IHRoaXMgZGV0ZXJtaW5lcyBpZiAwIGlzIGhhbmRsZWQgYnkgdGhlIHBvc2l0aXZlIHBhdGggb3IgbmVnYXRpdmUuXG4gICAgaWYgKCghb3B0aW9ucy5oYXNoLmluY2x1ZGVaZXJvICYmICFjb25kaXRpb25hbCkgfHwgaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm4sIGhhc2g6IG9wdGlvbnMuaGFzaH0pO1xuICB9KTtcbn1cbiJdfQ==


/***/ }),
/* 211 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('log', function () /* message, options */{
    var args = [undefined],
        options = arguments[arguments.length - 1];
    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i]);
    }

    var level = 1;
    if (options.hash.level != null) {
      level = options.hash.level;
    } else if (options.data && options.data.level != null) {
      level = options.data.level;
    }
    args[0] = level;

    instance.log.apply(instance, args);
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvbG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7cUJBQWUsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsa0NBQWlDO0FBQzlELFFBQUksSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ2xCLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5QyxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDN0MsVUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN6Qjs7QUFFRCxRQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxRQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTtBQUM5QixXQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDNUIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ3JELFdBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztLQUM1QjtBQUNELFFBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7O0FBRWhCLFlBQVEsQ0FBQyxHQUFHLE1BQUEsQ0FBWixRQUFRLEVBQVMsSUFBSSxDQUFDLENBQUM7R0FDeEIsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoibG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKC8qIG1lc3NhZ2UsIG9wdGlvbnMgKi8pIHtcbiAgICBsZXQgYXJncyA9IFt1bmRlZmluZWRdLFxuICAgICAgICBvcHRpb25zID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgIH1cblxuICAgIGxldCBsZXZlbCA9IDE7XG4gICAgaWYgKG9wdGlvbnMuaGFzaC5sZXZlbCAhPSBudWxsKSB7XG4gICAgICBsZXZlbCA9IG9wdGlvbnMuaGFzaC5sZXZlbDtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCkge1xuICAgICAgbGV2ZWwgPSBvcHRpb25zLmRhdGEubGV2ZWw7XG4gICAgfVxuICAgIGFyZ3NbMF0gPSBsZXZlbDtcblxuICAgIGluc3RhbmNlLmxvZyguLi4gYXJncyk7XG4gIH0pO1xufVxuIl19


/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvbG9va3VwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7cUJBQWUsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsVUFBUyxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQ3JELFdBQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUMxQixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJsb29rdXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9va3VwJywgZnVuY3Rpb24ob2JqLCBmaWVsZCkge1xuICAgIHJldHVybiBvYmogJiYgb2JqW2ZpZWxkXTtcbiAgfSk7XG59XG4iXX0=


/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _utils = __webpack_require__(7);

exports['default'] = function (instance) {
  instance.registerHelper('with', function (context, options) {
    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!_utils.isEmpty(context)) {
      var data = options.data;
      if (options.data && options.ids) {
        data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
      }

      return fn(context, {
        data: data,
        blockParams: _utils.blockParams([context], [data && data.contextPath])
      });
    } else {
      return options.inverse(this);
    }
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvd2l0aC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3FCQUErRSxVQUFVOztxQkFFMUUsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsVUFBUyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3pELFFBQUksa0JBQVcsT0FBTyxDQUFDLEVBQUU7QUFBRSxhQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUFFOztBQUUxRCxRQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDOztBQUVwQixRQUFJLENBQUMsZUFBUSxPQUFPLENBQUMsRUFBRTtBQUNyQixVQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3hCLFVBQUksT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQy9CLFlBQUksR0FBRyxtQkFBWSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakMsWUFBSSxDQUFDLFdBQVcsR0FBRyx5QkFBa0IsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ2hGOztBQUVELGFBQU8sRUFBRSxDQUFDLE9BQU8sRUFBRTtBQUNqQixZQUFJLEVBQUUsSUFBSTtBQUNWLG1CQUFXLEVBQUUsbUJBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7T0FDaEUsQ0FBQyxDQUFDO0tBQ0osTUFBTTtBQUNMLGFBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM5QjtHQUNGLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6IndpdGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2FwcGVuZENvbnRleHRQYXRoLCBibG9ja1BhcmFtcywgY3JlYXRlRnJhbWUsIGlzRW1wdHksIGlzRnVuY3Rpb259IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3dpdGgnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gICAgbGV0IGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmICghaXNFbXB0eShjb250ZXh0KSkge1xuICAgICAgbGV0IGRhdGEgPSBvcHRpb25zLmRhdGE7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLmlkc1swXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBibG9ja1BhcmFtcyhbY29udGV4dF0sIFtkYXRhICYmIGRhdGEuY29udGV4dFBhdGhdKVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfVxuICB9KTtcbn1cbiJdfQ==


/***/ }),
/* 214 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _utils = __webpack_require__(7);

var logger = {
  methodMap: ['debug', 'info', 'warn', 'error'],
  level: 'info',

  // Maps a given level value to the `methodMap` indexes above.
  lookupLevel: function lookupLevel(level) {
    if (typeof level === 'string') {
      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
      if (levelMap >= 0) {
        level = levelMap;
      } else {
        level = parseInt(level, 10);
      }
    }

    return level;
  },

  // Can be overridden in the host environment
  log: function log(level) {
    level = logger.lookupLevel(level);

    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
      var method = logger.methodMap[level];
      if (!console[method]) {
        // eslint-disable-line no-console
        method = 'log';
      }

      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      console[method].apply(console, message); // eslint-disable-line no-console
    }
  }
};

exports['default'] = logger;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2xvZ2dlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3FCQUFzQixTQUFTOztBQUUvQixJQUFJLE1BQU0sR0FBRztBQUNYLFdBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztBQUM3QyxPQUFLLEVBQUUsTUFBTTs7O0FBR2IsYUFBVyxFQUFFLHFCQUFTLEtBQUssRUFBRTtBQUMzQixRQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtBQUM3QixVQUFJLFFBQVEsR0FBRyxlQUFRLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDOUQsVUFBSSxRQUFRLElBQUksQ0FBQyxFQUFFO0FBQ2pCLGFBQUssR0FBRyxRQUFRLENBQUM7T0FDbEIsTUFBTTtBQUNMLGFBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO09BQzdCO0tBQ0Y7O0FBRUQsV0FBTyxLQUFLLENBQUM7R0FDZDs7O0FBR0QsS0FBRyxFQUFFLGFBQVMsS0FBSyxFQUFjO0FBQy9CLFNBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVsQyxRQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEVBQUU7QUFDL0UsVUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyQyxVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFOztBQUNwQixjQUFNLEdBQUcsS0FBSyxDQUFDO09BQ2hCOzt3Q0FQbUIsT0FBTztBQUFQLGVBQU87OztBQVEzQixhQUFPLENBQUMsTUFBTSxPQUFDLENBQWYsT0FBTyxFQUFZLE9BQU8sQ0FBQyxDQUFDO0tBQzdCO0dBQ0Y7Q0FDRixDQUFDOztxQkFFYSxNQUFNIiwiZmlsZSI6ImxvZ2dlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aW5kZXhPZn0gZnJvbSAnLi91dGlscyc7XG5cbmxldCBsb2dnZXIgPSB7XG4gIG1ldGhvZE1hcDogWydkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSxcbiAgbGV2ZWw6ICdpbmZvJyxcblxuICAvLyBNYXBzIGEgZ2l2ZW4gbGV2ZWwgdmFsdWUgdG8gdGhlIGBtZXRob2RNYXBgIGluZGV4ZXMgYWJvdmUuXG4gIGxvb2t1cExldmVsOiBmdW5jdGlvbihsZXZlbCkge1xuICAgIGlmICh0eXBlb2YgbGV2ZWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICBsZXQgbGV2ZWxNYXAgPSBpbmRleE9mKGxvZ2dlci5tZXRob2RNYXAsIGxldmVsLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgaWYgKGxldmVsTWFwID49IDApIHtcbiAgICAgICAgbGV2ZWwgPSBsZXZlbE1hcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldmVsID0gcGFyc2VJbnQobGV2ZWwsIDEwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGV2ZWw7XG4gIH0sXG5cbiAgLy8gQ2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgLi4ubWVzc2FnZSkge1xuICAgIGxldmVsID0gbG9nZ2VyLmxvb2t1cExldmVsKGxldmVsKTtcblxuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9nZ2VyLmxvb2t1cExldmVsKGxvZ2dlci5sZXZlbCkgPD0gbGV2ZWwpIHtcbiAgICAgIGxldCBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICghY29uc29sZVttZXRob2RdKSB7ICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgIG1ldGhvZCA9ICdsb2cnO1xuICAgICAgfVxuICAgICAgY29uc29sZVttZXRob2RdKC4uLm1lc3NhZ2UpOyAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGxvZ2dlcjtcbiJdfQ==


/***/ }),
/* 215 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* global window */


exports.__esModule = true;

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
    return Handlebars;
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL25vLWNvbmZsaWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O3FCQUNlLFVBQVMsVUFBVSxFQUFFOztBQUVsQyxNQUFJLElBQUksR0FBRyxPQUFPLE1BQU0sS0FBSyxXQUFXLEdBQUcsTUFBTSxHQUFHLE1BQU07TUFDdEQsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7O0FBRWxDLFlBQVUsQ0FBQyxVQUFVLEdBQUcsWUFBVztBQUNqQyxRQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFO0FBQ2xDLFVBQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDO0tBQy9CO0FBQ0QsV0FBTyxVQUFVLENBQUM7R0FDbkIsQ0FBQztDQUNIIiwiZmlsZSI6Im5vLWNvbmZsaWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIHdpbmRvdyAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oSGFuZGxlYmFycykge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBsZXQgcm9vdCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93LFxuICAgICAgJEhhbmRsZWJhcnMgPSByb290LkhhbmRsZWJhcnM7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIEhhbmRsZWJhcnMubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChyb290LkhhbmRsZWJhcnMgPT09IEhhbmRsZWJhcnMpIHtcbiAgICAgIHJvb3QuSGFuZGxlYmFycyA9ICRIYW5kbGViYXJzO1xuICAgIH1cbiAgICByZXR1cm4gSGFuZGxlYmFycztcbiAgfTtcbn1cbiJdfQ==

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(219)))

/***/ }),
/* 216 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.checkRevision = checkRevision;
exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = __webpack_require__(7);

var Utils = _interopRequireWildcard(_utils);

var _exception = __webpack_require__(15);

var _exception2 = _interopRequireDefault(_exception);

var _base = __webpack_require__(50);

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _base.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
          compilerVersions = _base.REVISION_CHANGES[compilerRevision];
      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  templateSpec.main.decorator = templateSpec.main_d;

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
      if (options.ids) {
        options.ids[0] = true;
      }
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      var ret = templateSpec[i];
      ret.decorator = templateSpec[i + '_d'];
      return ret;
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      if (options.depths) {
        depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
      } else {
        depths = [context];
      }
    }

    function main(context /*, options*/) {
      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
    }
    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
    return main(context, options);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
      if (templateSpec.usePartial || templateSpec.useDecorators) {
        container.decorators = container.merge(options.decorators, env.decorators);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
      container.decorators = options.decorators;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var currentDepths = depths;
    if (depths && context != depths[0]) {
      currentDepths = [context].concat(depths);
    }

    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
  }

  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    if (options.name === '@partial-block') {
      var data = options.data;
      while (data['partial-block'] === noop) {
        data = data._parent;
      }
      partial = data['partial-block'];
      data['partial-block'] = noop;
    } else {
      partial = options.partials[options.name];
    }
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  options.partial = true;
  if (options.ids) {
    options.data.contextPath = options.ids[0] || options.data.contextPath;
  }

  var partialBlock = undefined;
  if (options.fn && options.fn !== noop) {
    options.data = _base.createFrame(options.data);
    partialBlock = options.data['partial-block'] = options.fn;

    if (partialBlock.partials) {
      options.partials = Utils.extend({}, options.partials, partialBlock.partials);
    }
  }

  if (partial === undefined && partialBlock) {
    partial = partialBlock;
  }

  if (partial === undefined) {
    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _base.createFrame(data) : {};
    data.root = context;
  }
  return data;
}

function executeDecorators(fn, prog, container, depths, data, blockParams) {
  if (fn.decorator) {
    var props = {};
    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
    Utils.extend(prog, props);
  }
  return prog;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7cUJBQXVCLFNBQVM7O0lBQXBCLEtBQUs7O3lCQUNLLGFBQWE7Ozs7b0JBQzhCLFFBQVE7O0FBRWxFLFNBQVMsYUFBYSxDQUFDLFlBQVksRUFBRTtBQUMxQyxNQUFNLGdCQUFnQixHQUFHLFlBQVksSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztNQUN2RCxlQUFlLDBCQUFvQixDQUFDOztBQUUxQyxNQUFJLGdCQUFnQixLQUFLLGVBQWUsRUFBRTtBQUN4QyxRQUFJLGdCQUFnQixHQUFHLGVBQWUsRUFBRTtBQUN0QyxVQUFNLGVBQWUsR0FBRyx1QkFBaUIsZUFBZSxDQUFDO1VBQ25ELGdCQUFnQixHQUFHLHVCQUFpQixnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVELFlBQU0sMkJBQWMseUZBQXlGLEdBQ3ZHLHFEQUFxRCxHQUFHLGVBQWUsR0FBRyxtREFBbUQsR0FBRyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNoSyxNQUFNOztBQUVMLFlBQU0sMkJBQWMsd0ZBQXdGLEdBQ3RHLGlEQUFpRCxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNuRjtHQUNGO0NBQ0Y7O0FBRU0sU0FBUyxRQUFRLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTs7QUFFMUMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNSLFVBQU0sMkJBQWMsbUNBQW1DLENBQUMsQ0FBQztHQUMxRDtBQUNELE1BQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFO0FBQ3ZDLFVBQU0sMkJBQWMsMkJBQTJCLEdBQUcsT0FBTyxZQUFZLENBQUMsQ0FBQztHQUN4RTs7QUFFRCxjQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDOzs7O0FBSWxELEtBQUcsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFNUMsV0FBUyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUN2RCxRQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDaEIsYUFBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEQsVUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQ2YsZUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7T0FDdkI7S0FDRjs7QUFFRCxXQUFPLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3RFLFFBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFeEUsUUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUU7QUFDakMsYUFBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN6RixZQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzNEO0FBQ0QsUUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ2xCLFVBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUNsQixZQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUMsY0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUM1QixrQkFBTTtXQUNQOztBQUVELGVBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN0QztBQUNELGNBQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzNCO0FBQ0QsYUFBTyxNQUFNLENBQUM7S0FDZixNQUFNO0FBQ0wsWUFBTSwyQkFBYyxjQUFjLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRywwREFBMEQsQ0FBQyxDQUFDO0tBQ2pIO0dBQ0Y7OztBQUdELE1BQUksU0FBUyxHQUFHO0FBQ2QsVUFBTSxFQUFFLGdCQUFTLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDMUIsVUFBSSxFQUFFLElBQUksSUFBSSxHQUFHLENBQUEsQUFBQyxFQUFFO0FBQ2xCLGNBQU0sMkJBQWMsR0FBRyxHQUFHLElBQUksR0FBRyxtQkFBbUIsR0FBRyxHQUFHLENBQUMsQ0FBQztPQUM3RDtBQUNELGFBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2xCO0FBQ0QsVUFBTSxFQUFFLGdCQUFTLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDN0IsVUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUMxQixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVCLFlBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDeEMsaUJBQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO09BQ0Y7S0FDRjtBQUNELFVBQU0sRUFBRSxnQkFBUyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ2pDLGFBQU8sT0FBTyxPQUFPLEtBQUssVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDO0tBQ3hFOztBQUVELG9CQUFnQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0I7QUFDeEMsaUJBQWEsRUFBRSxvQkFBb0I7O0FBRW5DLE1BQUUsRUFBRSxZQUFTLENBQUMsRUFBRTtBQUNkLFVBQUksR0FBRyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixTQUFHLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDdkMsYUFBTyxHQUFHLENBQUM7S0FDWjs7QUFFRCxZQUFRLEVBQUUsRUFBRTtBQUNaLFdBQU8sRUFBRSxpQkFBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUU7QUFDbkUsVUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7VUFDakMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsVUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLFdBQVcsSUFBSSxtQkFBbUIsRUFBRTtBQUN4RCxzQkFBYyxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQzNGLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUMxQixzQkFBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7T0FDOUQ7QUFDRCxhQUFPLGNBQWMsQ0FBQztLQUN2Qjs7QUFFRCxRQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQzNCLGFBQU8sS0FBSyxJQUFJLEtBQUssRUFBRSxFQUFFO0FBQ3ZCLGFBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO09BQ3ZCO0FBQ0QsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFNBQUssRUFBRSxlQUFTLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDN0IsVUFBSSxHQUFHLEdBQUcsS0FBSyxJQUFJLE1BQU0sQ0FBQzs7QUFFMUIsVUFBSSxLQUFLLElBQUksTUFBTSxJQUFLLEtBQUssS0FBSyxNQUFNLEFBQUMsRUFBRTtBQUN6QyxXQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQ3ZDOztBQUVELGFBQU8sR0FBRyxDQUFDO0tBQ1o7O0FBRUQsUUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNqQixnQkFBWSxFQUFFLFlBQVksQ0FBQyxRQUFRO0dBQ3BDLENBQUM7O0FBRUYsV0FBUyxHQUFHLENBQUMsT0FBTyxFQUFnQjtRQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDaEMsUUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQzs7QUFFeEIsT0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwQixRQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQzVDLFVBQUksR0FBRyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ2hDO0FBQ0QsUUFBSSxNQUFNLFlBQUE7UUFDTixXQUFXLEdBQUcsWUFBWSxDQUFDLGNBQWMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO0FBQy9ELFFBQUksWUFBWSxDQUFDLFNBQVMsRUFBRTtBQUMxQixVQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDbEIsY0FBTSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO09BQzNGLE1BQU07QUFDTCxjQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNwQjtLQUNGOztBQUVELGFBQVMsSUFBSSxDQUFDLE9BQU8sZ0JBQWU7QUFDbEMsYUFBTyxFQUFFLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3JIO0FBQ0QsUUFBSSxHQUFHLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsTUFBTSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDdEcsV0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQy9CO0FBQ0QsS0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7O0FBRWpCLEtBQUcsQ0FBQyxNQUFNLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDN0IsUUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7QUFDcEIsZUFBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUVsRSxVQUFJLFlBQVksQ0FBQyxVQUFVLEVBQUU7QUFDM0IsaUJBQVMsQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUN0RTtBQUNELFVBQUksWUFBWSxDQUFDLFVBQVUsSUFBSSxZQUFZLENBQUMsYUFBYSxFQUFFO0FBQ3pELGlCQUFTLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDNUU7S0FDRixNQUFNO0FBQ0wsZUFBUyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3BDLGVBQVMsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztBQUN0QyxlQUFTLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7S0FDM0M7R0FDRixDQUFDOztBQUVGLEtBQUcsQ0FBQyxNQUFNLEdBQUcsVUFBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUU7QUFDbEQsUUFBSSxZQUFZLENBQUMsY0FBYyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQy9DLFlBQU0sMkJBQWMsd0JBQXdCLENBQUMsQ0FBQztLQUMvQztBQUNELFFBQUksWUFBWSxDQUFDLFNBQVMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNyQyxZQUFNLDJCQUFjLHlCQUF5QixDQUFDLENBQUM7S0FDaEQ7O0FBRUQsV0FBTyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7R0FDakYsQ0FBQztBQUNGLFNBQU8sR0FBRyxDQUFDO0NBQ1o7O0FBRU0sU0FBUyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUU7QUFDNUYsV0FBUyxJQUFJLENBQUMsT0FBTyxFQUFnQjtRQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDakMsUUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDO0FBQzNCLFFBQUksTUFBTSxJQUFJLE9BQU8sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDbEMsbUJBQWEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQzs7QUFFRCxXQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQ2YsT0FBTyxFQUNQLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFDckMsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQ3BCLFdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQ3hELGFBQWEsQ0FBQyxDQUFDO0dBQ3BCOztBQUVELE1BQUksR0FBRyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDOztBQUV6RSxNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNqQixNQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4QyxNQUFJLENBQUMsV0FBVyxHQUFHLG1CQUFtQixJQUFJLENBQUMsQ0FBQztBQUM1QyxTQUFPLElBQUksQ0FBQztDQUNiOztBQUVNLFNBQVMsY0FBYyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3hELE1BQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixRQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssZ0JBQWdCLEVBQUU7QUFDckMsVUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUN4QixhQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDckMsWUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7T0FDckI7QUFDRCxhQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUM7S0FDOUIsTUFBTTtBQUNMLGFBQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMxQztHQUNGLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFOztBQUV6QyxXQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztBQUN2QixXQUFPLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNyQztBQUNELFNBQU8sT0FBTyxDQUFDO0NBQ2hCOztBQUVNLFNBQVMsYUFBYSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3ZELFNBQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLE1BQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUNmLFdBQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7R0FDdkU7O0FBRUQsTUFBSSxZQUFZLFlBQUEsQ0FBQztBQUNqQixNQUFJLE9BQU8sQ0FBQyxFQUFFLElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxJQUFJLEVBQUU7QUFDckMsV0FBTyxDQUFDLElBQUksR0FBRyxrQkFBWSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekMsZ0JBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7O0FBRTFELFFBQUksWUFBWSxDQUFDLFFBQVEsRUFBRTtBQUN6QixhQUFPLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzlFO0dBQ0Y7O0FBRUQsTUFBSSxPQUFPLEtBQUssU0FBUyxJQUFJLFlBQVksRUFBRTtBQUN6QyxXQUFPLEdBQUcsWUFBWSxDQUFDO0dBQ3hCOztBQUVELE1BQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtBQUN6QixVQUFNLDJCQUFjLGNBQWMsR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLHFCQUFxQixDQUFDLENBQUM7R0FDNUUsTUFBTSxJQUFJLE9BQU8sWUFBWSxRQUFRLEVBQUU7QUFDdEMsV0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ2xDO0NBQ0Y7O0FBRU0sU0FBUyxJQUFJLEdBQUc7QUFBRSxTQUFPLEVBQUUsQ0FBQztDQUFFOztBQUVyQyxTQUFTLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFO0FBQy9CLE1BQUksQ0FBQyxJQUFJLElBQUksRUFBRSxNQUFNLElBQUksSUFBSSxDQUFBLEFBQUMsRUFBRTtBQUM5QixRQUFJLEdBQUcsSUFBSSxHQUFHLGtCQUFZLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNyQyxRQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztHQUNyQjtBQUNELFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtBQUN6RSxNQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUU7QUFDaEIsUUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2YsUUFBSSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzVGLFNBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQzNCO0FBQ0QsU0FBTyxJQUFJLENBQUM7Q0FDYiIsImZpbGUiOiJydW50aW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgVXRpbHMgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4vZXhjZXB0aW9uJztcbmltcG9ydCB7IENPTVBJTEVSX1JFVklTSU9OLCBSRVZJU0lPTl9DSEFOR0VTLCBjcmVhdGVGcmFtZSB9IGZyb20gJy4vYmFzZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1JldmlzaW9uKGNvbXBpbGVySW5mbykge1xuICBjb25zdCBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvICYmIGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgICBjdXJyZW50UmV2aXNpb24gPSBDT01QSUxFUl9SRVZJU0lPTjtcblxuICBpZiAoY29tcGlsZXJSZXZpc2lvbiAhPT0gY3VycmVudFJldmlzaW9uKSB7XG4gICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgIGNvbnN0IHJ1bnRpbWVWZXJzaW9ucyA9IFJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBSRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYW4gb2xkZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gJyArXG4gICAgICAgICAgICAnUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIHJ1bnRpbWVWZXJzaW9ucyArICcpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVyVmVyc2lvbnMgKyAnKS4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgK1xuICAgICAgICAgICAgJ1BsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVySW5mb1sxXSArICcpLicpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGUodGVtcGxhdGVTcGVjLCBlbnYpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKCFlbnYpIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGUnKTtcbiAgfVxuICBpZiAoIXRlbXBsYXRlU3BlYyB8fCAhdGVtcGxhdGVTcGVjLm1haW4pIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdVbmtub3duIHRlbXBsYXRlIG9iamVjdDogJyArIHR5cGVvZiB0ZW1wbGF0ZVNwZWMpO1xuICB9XG5cbiAgdGVtcGxhdGVTcGVjLm1haW4uZGVjb3JhdG9yID0gdGVtcGxhdGVTcGVjLm1haW5fZDtcblxuICAvLyBOb3RlOiBVc2luZyBlbnYuVk0gcmVmZXJlbmNlcyByYXRoZXIgdGhhbiBsb2NhbCB2YXIgcmVmZXJlbmNlcyB0aHJvdWdob3V0IHRoaXMgc2VjdGlvbiB0byBhbGxvd1xuICAvLyBmb3IgZXh0ZXJuYWwgdXNlcnMgdG8gb3ZlcnJpZGUgdGhlc2UgYXMgcHN1ZWRvLXN1cHBvcnRlZCBBUElzLlxuICBlbnYuVk0uY2hlY2tSZXZpc2lvbih0ZW1wbGF0ZVNwZWMuY29tcGlsZXIpO1xuXG4gIGZ1bmN0aW9uIGludm9rZVBhcnRpYWxXcmFwcGVyKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5oYXNoKSB7XG4gICAgICBjb250ZXh0ID0gVXRpbHMuZXh0ZW5kKHt9LCBjb250ZXh0LCBvcHRpb25zLmhhc2gpO1xuICAgICAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIG9wdGlvbnMuaWRzWzBdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwYXJ0aWFsID0gZW52LlZNLnJlc29sdmVQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG4gICAgbGV0IHJlc3VsdCA9IGVudi5WTS5pbnZva2VQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG5cbiAgICBpZiAocmVzdWx0ID09IG51bGwgJiYgZW52LmNvbXBpbGUpIHtcbiAgICAgIG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXSA9IGVudi5jb21waWxlKHBhcnRpYWwsIHRlbXBsYXRlU3BlYy5jb21waWxlck9wdGlvbnMsIGVudik7XG4gICAgICByZXN1bHQgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChyZXN1bHQgIT0gbnVsbCkge1xuICAgICAgaWYgKG9wdGlvbnMuaW5kZW50KSB7XG4gICAgICAgIGxldCBsaW5lcyA9IHJlc3VsdC5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gbGluZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFsaW5lc1tpXSAmJiBpICsgMSA9PT0gbCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGluZXNbaV0gPSBvcHRpb25zLmluZGVudCArIGxpbmVzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignVGhlIHBhcnRpYWwgJyArIG9wdGlvbnMubmFtZSArICcgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZScpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEp1c3QgYWRkIHdhdGVyXG4gIGxldCBjb250YWluZXIgPSB7XG4gICAgc3RyaWN0OiBmdW5jdGlvbihvYmosIG5hbWUpIHtcbiAgICAgIGlmICghKG5hbWUgaW4gb2JqKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdcIicgKyBuYW1lICsgJ1wiIG5vdCBkZWZpbmVkIGluICcgKyBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ialtuYW1lXTtcbiAgICB9LFxuICAgIGxvb2t1cDogZnVuY3Rpb24oZGVwdGhzLCBuYW1lKSB7XG4gICAgICBjb25zdCBsZW4gPSBkZXB0aHMubGVuZ3RoO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZGVwdGhzW2ldICYmIGRlcHRoc1tpXVtuYW1lXSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGRlcHRoc1tpXVtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbGFtYmRhOiBmdW5jdGlvbihjdXJyZW50LCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGN1cnJlbnQgPT09ICdmdW5jdGlvbicgPyBjdXJyZW50LmNhbGwoY29udGV4dCkgOiBjdXJyZW50O1xuICAgIH0sXG5cbiAgICBlc2NhcGVFeHByZXNzaW9uOiBVdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgIGludm9rZVBhcnRpYWw6IGludm9rZVBhcnRpYWxXcmFwcGVyLFxuXG4gICAgZm46IGZ1bmN0aW9uKGkpIHtcbiAgICAgIGxldCByZXQgPSB0ZW1wbGF0ZVNwZWNbaV07XG4gICAgICByZXQuZGVjb3JhdG9yID0gdGVtcGxhdGVTcGVjW2kgKyAnX2QnXTtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSxcblxuICAgIHByb2dyYW1zOiBbXSxcbiAgICBwcm9ncmFtOiBmdW5jdGlvbihpLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgICBsZXQgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldLFxuICAgICAgICAgIGZuID0gdGhpcy5mbihpKTtcbiAgICAgIGlmIChkYXRhIHx8IGRlcHRocyB8fCBibG9ja1BhcmFtcyB8fCBkZWNsYXJlZEJsb2NrUGFyYW1zKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgIH0sXG5cbiAgICBkYXRhOiBmdW5jdGlvbih2YWx1ZSwgZGVwdGgpIHtcbiAgICAgIHdoaWxlICh2YWx1ZSAmJiBkZXB0aC0tKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUuX3BhcmVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuICAgIG1lcmdlOiBmdW5jdGlvbihwYXJhbSwgY29tbW9uKSB7XG4gICAgICBsZXQgb2JqID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICBpZiAocGFyYW0gJiYgY29tbW9uICYmIChwYXJhbSAhPT0gY29tbW9uKSkge1xuICAgICAgICBvYmogPSBVdGlscy5leHRlbmQoe30sIGNvbW1vbiwgcGFyYW0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cbiAgICBub29wOiBlbnYuVk0ubm9vcCxcbiAgICBjb21waWxlckluZm86IHRlbXBsYXRlU3BlYy5jb21waWxlclxuICB9O1xuXG4gIGZ1bmN0aW9uIHJldChjb250ZXh0LCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgZGF0YSA9IG9wdGlvbnMuZGF0YTtcblxuICAgIHJldC5fc2V0dXAob3B0aW9ucyk7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwgJiYgdGVtcGxhdGVTcGVjLnVzZURhdGEpIHtcbiAgICAgIGRhdGEgPSBpbml0RGF0YShjb250ZXh0LCBkYXRhKTtcbiAgICB9XG4gICAgbGV0IGRlcHRocyxcbiAgICAgICAgYmxvY2tQYXJhbXMgPSB0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgPyBbXSA6IHVuZGVmaW5lZDtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocykge1xuICAgICAgaWYgKG9wdGlvbnMuZGVwdGhzKSB7XG4gICAgICAgIGRlcHRocyA9IGNvbnRleHQgIT0gb3B0aW9ucy5kZXB0aHNbMF0gPyBbY29udGV4dF0uY29uY2F0KG9wdGlvbnMuZGVwdGhzKSA6IG9wdGlvbnMuZGVwdGhzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVwdGhzID0gW2NvbnRleHRdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1haW4oY29udGV4dC8qLCBvcHRpb25zKi8pIHtcbiAgICAgIHJldHVybiAnJyArIHRlbXBsYXRlU3BlYy5tYWluKGNvbnRhaW5lciwgY29udGV4dCwgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscywgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gICAgfVxuICAgIG1haW4gPSBleGVjdXRlRGVjb3JhdG9ycyh0ZW1wbGF0ZVNwZWMubWFpbiwgbWFpbiwgY29udGFpbmVyLCBvcHRpb25zLmRlcHRocyB8fCBbXSwgZGF0YSwgYmxvY2tQYXJhbXMpO1xuICAgIHJldHVybiBtYWluKGNvbnRleHQsIG9wdGlvbnMpO1xuICB9XG4gIHJldC5pc1RvcCA9IHRydWU7XG5cbiAgcmV0Ll9zZXR1cCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCkge1xuICAgICAgY29udGFpbmVyLmhlbHBlcnMgPSBjb250YWluZXIubWVyZ2Uob3B0aW9ucy5oZWxwZXJzLCBlbnYuaGVscGVycyk7XG5cbiAgICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlUGFydGlhbCkge1xuICAgICAgICBjb250YWluZXIucGFydGlhbHMgPSBjb250YWluZXIubWVyZ2Uob3B0aW9ucy5wYXJ0aWFscywgZW52LnBhcnRpYWxzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlUGFydGlhbCB8fCB0ZW1wbGF0ZVNwZWMudXNlRGVjb3JhdG9ycykge1xuICAgICAgICBjb250YWluZXIuZGVjb3JhdG9ycyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLmRlY29yYXRvcnMsIGVudi5kZWNvcmF0b3JzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29udGFpbmVyLmhlbHBlcnMgPSBvcHRpb25zLmhlbHBlcnM7XG4gICAgICBjb250YWluZXIucGFydGlhbHMgPSBvcHRpb25zLnBhcnRpYWxzO1xuICAgICAgY29udGFpbmVyLmRlY29yYXRvcnMgPSBvcHRpb25zLmRlY29yYXRvcnM7XG4gICAgfVxuICB9O1xuXG4gIHJldC5fY2hpbGQgPSBmdW5jdGlvbihpLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VCbG9ja1BhcmFtcyAmJiAhYmxvY2tQYXJhbXMpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ211c3QgcGFzcyBibG9jayBwYXJhbXMnKTtcbiAgICB9XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMgJiYgIWRlcHRocykge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignbXVzdCBwYXNzIHBhcmVudCBkZXB0aHMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCB0ZW1wbGF0ZVNwZWNbaV0sIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCBmbiwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICBmdW5jdGlvbiBwcm9nKGNvbnRleHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBjdXJyZW50RGVwdGhzID0gZGVwdGhzO1xuICAgIGlmIChkZXB0aHMgJiYgY29udGV4dCAhPSBkZXB0aHNbMF0pIHtcbiAgICAgIGN1cnJlbnREZXB0aHMgPSBbY29udGV4dF0uY29uY2F0KGRlcHRocyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuKGNvbnRhaW5lcixcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscyxcbiAgICAgICAgb3B0aW9ucy5kYXRhIHx8IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zICYmIFtvcHRpb25zLmJsb2NrUGFyYW1zXS5jb25jYXQoYmxvY2tQYXJhbXMpLFxuICAgICAgICBjdXJyZW50RGVwdGhzKTtcbiAgfVxuXG4gIHByb2cgPSBleGVjdXRlRGVjb3JhdG9ycyhmbiwgcHJvZywgY29udGFpbmVyLCBkZXB0aHMsIGRhdGEsIGJsb2NrUGFyYW1zKTtcblxuICBwcm9nLnByb2dyYW0gPSBpO1xuICBwcm9nLmRlcHRoID0gZGVwdGhzID8gZGVwdGhzLmxlbmd0aCA6IDA7XG4gIHByb2cuYmxvY2tQYXJhbXMgPSBkZWNsYXJlZEJsb2NrUGFyYW1zIHx8IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBhcnRpYWwocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICBpZiAoIXBhcnRpYWwpIHtcbiAgICBpZiAob3B0aW9ucy5uYW1lID09PSAnQHBhcnRpYWwtYmxvY2snKSB7XG4gICAgICBsZXQgZGF0YSA9IG9wdGlvbnMuZGF0YTtcbiAgICAgIHdoaWxlIChkYXRhWydwYXJ0aWFsLWJsb2NrJ10gPT09IG5vb3ApIHtcbiAgICAgICAgZGF0YSA9IGRhdGEuX3BhcmVudDtcbiAgICAgIH1cbiAgICAgIHBhcnRpYWwgPSBkYXRhWydwYXJ0aWFsLWJsb2NrJ107XG4gICAgICBkYXRhWydwYXJ0aWFsLWJsb2NrJ10gPSBub29wO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdO1xuICAgIH1cbiAgfSBlbHNlIGlmICghcGFydGlhbC5jYWxsICYmICFvcHRpb25zLm5hbWUpIHtcbiAgICAvLyBUaGlzIGlzIGEgZHluYW1pYyBwYXJ0aWFsIHRoYXQgcmV0dXJuZWQgYSBzdHJpbmdcbiAgICBvcHRpb25zLm5hbWUgPSBwYXJ0aWFsO1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW3BhcnRpYWxdO1xuICB9XG4gIHJldHVybiBwYXJ0aWFsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMucGFydGlhbCA9IHRydWU7XG4gIGlmIChvcHRpb25zLmlkcykge1xuICAgIG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCA9IG9wdGlvbnMuaWRzWzBdIHx8IG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aDtcbiAgfVxuXG4gIGxldCBwYXJ0aWFsQmxvY2s7XG4gIGlmIChvcHRpb25zLmZuICYmIG9wdGlvbnMuZm4gIT09IG5vb3ApIHtcbiAgICBvcHRpb25zLmRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIHBhcnRpYWxCbG9jayA9IG9wdGlvbnMuZGF0YVsncGFydGlhbC1ibG9jayddID0gb3B0aW9ucy5mbjtcblxuICAgIGlmIChwYXJ0aWFsQmxvY2sucGFydGlhbHMpIHtcbiAgICAgIG9wdGlvbnMucGFydGlhbHMgPSBVdGlscy5leHRlbmQoe30sIG9wdGlvbnMucGFydGlhbHMsIHBhcnRpYWxCbG9jay5wYXJ0aWFscyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCAmJiBwYXJ0aWFsQmxvY2spIHtcbiAgICBwYXJ0aWFsID0gcGFydGlhbEJsb2NrO1xuICB9XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBmb3VuZCcpO1xuICB9IGVsc2UgaWYgKHBhcnRpYWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub29wKCkgeyByZXR1cm4gJyc7IH1cblxuZnVuY3Rpb24gaW5pdERhdGEoY29udGV4dCwgZGF0YSkge1xuICBpZiAoIWRhdGEgfHwgISgncm9vdCcgaW4gZGF0YSkpIHtcbiAgICBkYXRhID0gZGF0YSA/IGNyZWF0ZUZyYW1lKGRhdGEpIDoge307XG4gICAgZGF0YS5yb290ID0gY29udGV4dDtcbiAgfVxuICByZXR1cm4gZGF0YTtcbn1cblxuZnVuY3Rpb24gZXhlY3V0ZURlY29yYXRvcnMoZm4sIHByb2csIGNvbnRhaW5lciwgZGVwdGhzLCBkYXRhLCBibG9ja1BhcmFtcykge1xuICBpZiAoZm4uZGVjb3JhdG9yKSB7XG4gICAgbGV0IHByb3BzID0ge307XG4gICAgcHJvZyA9IGZuLmRlY29yYXRvcihwcm9nLCBwcm9wcywgY29udGFpbmVyLCBkZXB0aHMgJiYgZGVwdGhzWzBdLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgICBVdGlscy5leHRlbmQocHJvZywgcHJvcHMpO1xuICB9XG4gIHJldHVybiBwcm9nO1xufVxuIl19


/***/ }),
/* 217 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Build out our basic SafeString type


exports.__esModule = true;
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxTQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUU7QUFDMUIsTUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Q0FDdEI7O0FBRUQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBVztBQUN2RSxTQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0NBQ3pCLENBQUM7O3FCQUVhLFVBQVUiLCJmaWxlIjoic2FmZS1zdHJpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gU2FmZVN0cmluZy5wcm90b3R5cGUudG9IVE1MID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnJyArIHRoaXMuc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2FmZVN0cmluZztcbiJdfQ==


/***/ }),
/* 218 */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/topojson/topojson Version 2.2.0. Copyright 2016 Mike Bostock.
(function (global, factory) {
   true ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.topojson = global.topojson || {})));
}(this, (function (exports) { 'use strict';

// Computes the bounding box of the specified hash of GeoJSON objects.
var bounds = function(objects) {
  var x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;

  function boundGeometry(geometry) {
    if (geometry && boundGeometryType.hasOwnProperty(geometry.type)) boundGeometryType[geometry.type](geometry);
  }

  var boundGeometryType = {
    GeometryCollection: function(o) { o.geometries.forEach(boundGeometry); },
    Point: function(o) { boundPoint(o.coordinates); },
    MultiPoint: function(o) { o.coordinates.forEach(boundPoint); },
    LineString: function(o) { boundLine(o.coordinates); },
    MultiLineString: function(o) { o.coordinates.forEach(boundLine); },
    Polygon: function(o) { o.coordinates.forEach(boundLine); },
    MultiPolygon: function(o) { o.coordinates.forEach(boundMultiLine); }
  };

  function boundPoint(coordinates) {
    var x = coordinates[0],
        y = coordinates[1];
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }

  function boundLine(coordinates) {
    coordinates.forEach(boundPoint);
  }

  function boundMultiLine(coordinates) {
    coordinates.forEach(boundLine);
  }

  for (var key in objects) {
    boundGeometry(objects[key]);
  }

  return x1 >= x0 && y1 >= y0 ? [x0, y0, x1, y1] : undefined;
};

var hashset = function(size, hash, equal, type, empty) {
  if (arguments.length === 3) {
    type = Array;
    empty = null;
  }

  var store = new type(size = 1 << Math.max(4, Math.ceil(Math.log(size) / Math.LN2))),
      mask = size - 1;

  for (var i = 0; i < size; ++i) {
    store[i] = empty;
  }

  function add(value) {
    var index = hash(value) & mask,
        match = store[index],
        collisions = 0;
    while (match != empty) {
      if (equal(match, value)) return true;
      if (++collisions >= size) throw new Error("full hashset");
      match = store[index = (index + 1) & mask];
    }
    store[index] = value;
    return true;
  }

  function has(value) {
    var index = hash(value) & mask,
        match = store[index],
        collisions = 0;
    while (match != empty) {
      if (equal(match, value)) return true;
      if (++collisions >= size) break;
      match = store[index = (index + 1) & mask];
    }
    return false;
  }

  function values() {
    var values = [];
    for (var i = 0, n = store.length; i < n; ++i) {
      var match = store[i];
      if (match != empty) values.push(match);
    }
    return values;
  }

  return {
    add: add,
    has: has,
    values: values
  };
};

var hashmap = function(size, hash, equal, keyType, keyEmpty, valueType) {
  if (arguments.length === 3) {
    keyType = valueType = Array;
    keyEmpty = null;
  }

  var keystore = new keyType(size = 1 << Math.max(4, Math.ceil(Math.log(size) / Math.LN2))),
      valstore = new valueType(size),
      mask = size - 1;

  for (var i = 0; i < size; ++i) {
    keystore[i] = keyEmpty;
  }

  function set(key, value) {
    var index = hash(key) & mask,
        matchKey = keystore[index],
        collisions = 0;
    while (matchKey != keyEmpty) {
      if (equal(matchKey, key)) return valstore[index] = value;
      if (++collisions >= size) throw new Error("full hashmap");
      matchKey = keystore[index = (index + 1) & mask];
    }
    keystore[index] = key;
    valstore[index] = value;
    return value;
  }

  function maybeSet(key, value) {
    var index = hash(key) & mask,
        matchKey = keystore[index],
        collisions = 0;
    while (matchKey != keyEmpty) {
      if (equal(matchKey, key)) return valstore[index];
      if (++collisions >= size) throw new Error("full hashmap");
      matchKey = keystore[index = (index + 1) & mask];
    }
    keystore[index] = key;
    valstore[index] = value;
    return value;
  }

  function get(key, missingValue) {
    var index = hash(key) & mask,
        matchKey = keystore[index],
        collisions = 0;
    while (matchKey != keyEmpty) {
      if (equal(matchKey, key)) return valstore[index];
      if (++collisions >= size) break;
      matchKey = keystore[index = (index + 1) & mask];
    }
    return missingValue;
  }

  function keys() {
    var keys = [];
    for (var i = 0, n = keystore.length; i < n; ++i) {
      var matchKey = keystore[i];
      if (matchKey != keyEmpty) keys.push(matchKey);
    }
    return keys;
  }

  return {
    set: set,
    maybeSet: maybeSet, // set if unset
    get: get,
    keys: keys
  };
};

var equalPoint = function(pointA, pointB) {
  return pointA[0] === pointB[0] && pointA[1] === pointB[1];
};

// TODO if quantized, use simpler Int32 hashing?

var buffer = new ArrayBuffer(16);
var floats = new Float64Array(buffer);
var uints = new Uint32Array(buffer);

var hashPoint = function(point) {
  floats[0] = point[0];
  floats[1] = point[1];
  var hash = uints[0] ^ uints[1];
  hash = hash << 5 ^ hash >> 7 ^ uints[2] ^ uints[3];
  return hash & 0x7fffffff;
};

// Given an extracted (pre-)topology, identifies all of the junctions. These are
// the points at which arcs (lines or rings) will need to be cut so that each
// arc is represented uniquely.
//
// A junction is a point where at least one arc deviates from another arc going
// through the same point. For example, consider the point B. If there is a arc
// through ABC and another arc through CBA, then B is not a junction because in
// both cases the adjacent point pairs are {A,C}. However, if there is an
// additional arc ABD, then {A,D} != {A,C}, and thus B becomes a junction.
//
// For a closed ring ABCA, the first point A’s adjacent points are the second
// and last point {B,C}. For a line, the first and last point are always
// considered junctions, even if the line is closed; this ensures that a closed
// line is never rotated.
var join = function(topology) {
  var coordinates = topology.coordinates,
      lines = topology.lines,
      rings = topology.rings,
      indexes = index(),
      visitedByIndex = new Int32Array(coordinates.length),
      leftByIndex = new Int32Array(coordinates.length),
      rightByIndex = new Int32Array(coordinates.length),
      junctionByIndex = new Int8Array(coordinates.length),
      junctionCount = 0, // upper bound on number of junctions
      i, n,
      previousIndex,
      currentIndex,
      nextIndex;

  for (i = 0, n = coordinates.length; i < n; ++i) {
    visitedByIndex[i] = leftByIndex[i] = rightByIndex[i] = -1;
  }

  for (i = 0, n = lines.length; i < n; ++i) {
    var line = lines[i],
        lineStart = line[0],
        lineEnd = line[1];
    currentIndex = indexes[lineStart];
    nextIndex = indexes[++lineStart];
    ++junctionCount, junctionByIndex[currentIndex] = 1; // start
    while (++lineStart <= lineEnd) {
      sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[lineStart]);
    }
    ++junctionCount, junctionByIndex[nextIndex] = 1; // end
  }

  for (i = 0, n = coordinates.length; i < n; ++i) {
    visitedByIndex[i] = -1;
  }

  for (i = 0, n = rings.length; i < n; ++i) {
    var ring = rings[i],
        ringStart = ring[0] + 1,
        ringEnd = ring[1];
    previousIndex = indexes[ringEnd - 1];
    currentIndex = indexes[ringStart - 1];
    nextIndex = indexes[ringStart];
    sequence(i, previousIndex, currentIndex, nextIndex);
    while (++ringStart <= ringEnd) {
      sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[ringStart]);
    }
  }

  function sequence(i, previousIndex, currentIndex, nextIndex) {
    if (visitedByIndex[currentIndex] === i) return; // ignore self-intersection
    visitedByIndex[currentIndex] = i;
    var leftIndex = leftByIndex[currentIndex];
    if (leftIndex >= 0) {
      var rightIndex = rightByIndex[currentIndex];
      if ((leftIndex !== previousIndex || rightIndex !== nextIndex)
        && (leftIndex !== nextIndex || rightIndex !== previousIndex)) {
        ++junctionCount, junctionByIndex[currentIndex] = 1;
      }
    } else {
      leftByIndex[currentIndex] = previousIndex;
      rightByIndex[currentIndex] = nextIndex;
    }
  }

  function index() {
    var indexByPoint = hashmap(coordinates.length * 1.4, hashIndex, equalIndex, Int32Array, -1, Int32Array),
        indexes = new Int32Array(coordinates.length);

    for (var i = 0, n = coordinates.length; i < n; ++i) {
      indexes[i] = indexByPoint.maybeSet(i, i);
    }

    return indexes;
  }

  function hashIndex(i) {
    return hashPoint(coordinates[i]);
  }

  function equalIndex(i, j) {
    return equalPoint(coordinates[i], coordinates[j]);
  }

  visitedByIndex = leftByIndex = rightByIndex = null;

  var junctionByPoint = hashset(junctionCount * 1.4, hashPoint, equalPoint), j;

  // Convert back to a standard hashset by point for caller convenience.
  for (i = 0, n = coordinates.length; i < n; ++i) {
    if (junctionByIndex[j = indexes[i]]) {
      junctionByPoint.add(coordinates[j]);
    }
  }

  return junctionByPoint;
};

// Given an extracted (pre-)topology, cuts (or rotates) arcs so that all shared
// point sequences are identified. The topology can then be subsequently deduped
// to remove exact duplicate arcs.
var cut = function(topology) {
  var junctions = join(topology),
      coordinates = topology.coordinates,
      lines = topology.lines,
      rings = topology.rings,
      next,
      i, n;

  for (i = 0, n = lines.length; i < n; ++i) {
    var line = lines[i],
        lineMid = line[0],
        lineEnd = line[1];
    while (++lineMid < lineEnd) {
      if (junctions.has(coordinates[lineMid])) {
        next = {0: lineMid, 1: line[1]};
        line[1] = lineMid;
        line = line.next = next;
      }
    }
  }

  for (i = 0, n = rings.length; i < n; ++i) {
    var ring = rings[i],
        ringStart = ring[0],
        ringMid = ringStart,
        ringEnd = ring[1],
        ringFixed = junctions.has(coordinates[ringStart]);
    while (++ringMid < ringEnd) {
      if (junctions.has(coordinates[ringMid])) {
        if (ringFixed) {
          next = {0: ringMid, 1: ring[1]};
          ring[1] = ringMid;
          ring = ring.next = next;
        } else { // For the first junction, we can rotate rather than cut.
          rotateArray(coordinates, ringStart, ringEnd, ringEnd - ringMid);
          coordinates[ringEnd] = coordinates[ringStart];
          ringFixed = true;
          ringMid = ringStart; // restart; we may have skipped junctions
        }
      }
    }
  }

  return topology;
};

function rotateArray(array, start, end, offset) {
  reverse(array, start, end);
  reverse(array, start, start + offset);
  reverse(array, start + offset, end);
}

function reverse(array, start, end) {
  for (var mid = start + ((end-- - start) >> 1), t; start < mid; ++start, --end) {
    t = array[start], array[start] = array[end], array[end] = t;
  }
}

// Given a cut topology, combines duplicate arcs.
var dedup = function(topology) {
  var coordinates = topology.coordinates,
      lines = topology.lines, line,
      rings = topology.rings, ring,
      arcCount = lines.length + rings.length,
      i, n;

  delete topology.lines;
  delete topology.rings;

  // Count the number of (non-unique) arcs to initialize the hashmap safely.
  for (i = 0, n = lines.length; i < n; ++i) {
    line = lines[i]; while (line = line.next) ++arcCount;
  }
  for (i = 0, n = rings.length; i < n; ++i) {
    ring = rings[i]; while (ring = ring.next) ++arcCount;
  }

  var arcsByEnd = hashmap(arcCount * 2 * 1.4, hashPoint, equalPoint),
      arcs = topology.arcs = [];

  for (i = 0, n = lines.length; i < n; ++i) {
    line = lines[i];
    do {
      dedupLine(line);
    } while (line = line.next);
  }

  for (i = 0, n = rings.length; i < n; ++i) {
    ring = rings[i];
    if (ring.next) { // arc is no longer closed
      do {
        dedupLine(ring);
      } while (ring = ring.next);
    } else {
      dedupRing(ring);
    }
  }

  function dedupLine(arc) {
    var startPoint,
        endPoint,
        startArcs, startArc,
        endArcs, endArc,
        i, n;

    // Does this arc match an existing arc in order?
    if (startArcs = arcsByEnd.get(startPoint = coordinates[arc[0]])) {
      for (i = 0, n = startArcs.length; i < n; ++i) {
        startArc = startArcs[i];
        if (equalLine(startArc, arc)) {
          arc[0] = startArc[0];
          arc[1] = startArc[1];
          return;
        }
      }
    }

    // Does this arc match an existing arc in reverse order?
    if (endArcs = arcsByEnd.get(endPoint = coordinates[arc[1]])) {
      for (i = 0, n = endArcs.length; i < n; ++i) {
        endArc = endArcs[i];
        if (reverseEqualLine(endArc, arc)) {
          arc[1] = endArc[0];
          arc[0] = endArc[1];
          return;
        }
      }
    }

    if (startArcs) startArcs.push(arc); else arcsByEnd.set(startPoint, [arc]);
    if (endArcs) endArcs.push(arc); else arcsByEnd.set(endPoint, [arc]);
    arcs.push(arc);
  }

  function dedupRing(arc) {
    var endPoint,
        endArcs,
        endArc,
        i, n;

    // Does this arc match an existing line in order, or reverse order?
    // Rings are closed, so their start point and end point is the same.
    if (endArcs = arcsByEnd.get(endPoint = coordinates[arc[0]])) {
      for (i = 0, n = endArcs.length; i < n; ++i) {
        endArc = endArcs[i];
        if (equalRing(endArc, arc)) {
          arc[0] = endArc[0];
          arc[1] = endArc[1];
          return;
        }
        if (reverseEqualRing(endArc, arc)) {
          arc[0] = endArc[1];
          arc[1] = endArc[0];
          return;
        }
      }
    }

    // Otherwise, does this arc match an existing ring in order, or reverse order?
    if (endArcs = arcsByEnd.get(endPoint = coordinates[arc[0] + findMinimumOffset(arc)])) {
      for (i = 0, n = endArcs.length; i < n; ++i) {
        endArc = endArcs[i];
        if (equalRing(endArc, arc)) {
          arc[0] = endArc[0];
          arc[1] = endArc[1];
          return;
        }
        if (reverseEqualRing(endArc, arc)) {
          arc[0] = endArc[1];
          arc[1] = endArc[0];
          return;
        }
      }
    }

    if (endArcs) endArcs.push(arc); else arcsByEnd.set(endPoint, [arc]);
    arcs.push(arc);
  }

  function equalLine(arcA, arcB) {
    var ia = arcA[0], ib = arcB[0],
        ja = arcA[1], jb = arcB[1];
    if (ia - ja !== ib - jb) return false;
    for (; ia <= ja; ++ia, ++ib) if (!equalPoint(coordinates[ia], coordinates[ib])) return false;
    return true;
  }

  function reverseEqualLine(arcA, arcB) {
    var ia = arcA[0], ib = arcB[0],
        ja = arcA[1], jb = arcB[1];
    if (ia - ja !== ib - jb) return false;
    for (; ia <= ja; ++ia, --jb) if (!equalPoint(coordinates[ia], coordinates[jb])) return false;
    return true;
  }

  function equalRing(arcA, arcB) {
    var ia = arcA[0], ib = arcB[0],
        ja = arcA[1], jb = arcB[1],
        n = ja - ia;
    if (n !== jb - ib) return false;
    var ka = findMinimumOffset(arcA),
        kb = findMinimumOffset(arcB);
    for (var i = 0; i < n; ++i) {
      if (!equalPoint(coordinates[ia + (i + ka) % n], coordinates[ib + (i + kb) % n])) return false;
    }
    return true;
  }

  function reverseEqualRing(arcA, arcB) {
    var ia = arcA[0], ib = arcB[0],
        ja = arcA[1], jb = arcB[1],
        n = ja - ia;
    if (n !== jb - ib) return false;
    var ka = findMinimumOffset(arcA),
        kb = n - findMinimumOffset(arcB);
    for (var i = 0; i < n; ++i) {
      if (!equalPoint(coordinates[ia + (i + ka) % n], coordinates[jb - (i + kb) % n])) return false;
    }
    return true;
  }

  // Rings are rotated to a consistent, but arbitrary, start point.
  // This is necessary to detect when a ring and a rotated copy are dupes.
  function findMinimumOffset(arc) {
    var start = arc[0],
        end = arc[1],
        mid = start,
        minimum = mid,
        minimumPoint = coordinates[mid];
    while (++mid < end) {
      var point = coordinates[mid];
      if (point[0] < minimumPoint[0] || point[0] === minimumPoint[0] && point[1] < minimumPoint[1]) {
        minimum = mid;
        minimumPoint = point;
      }
    }
    return minimum - start;
  }

  return topology;
};

// Given a TopoJSON topology in absolute (quantized) coordinates,
// converts to fixed-point delta encoding.
// This is a destructive operation that modifies the given topology!
var delta = function(topology) {
  var arcs = topology.arcs,
      i = -1,
      n = arcs.length;

  while (++i < n) {
    var arc = arcs[i],
        j = 0,
        m = arc.length,
        point = arc[0],
        x0 = point[0],
        y0 = point[1],
        x1,
        y1;
    while (++j < m) {
      point = arc[j];
      x1 = point[0];
      y1 = point[1];
      arc[j] = [x1 - x0, y1 - y0];
      x0 = x1;
      y0 = y1;
    }
  }

  return topology;
};

// Extracts the lines and rings from the specified hash of geometry objects.
//
// Returns an object with three properties:
//
// * coordinates - shared buffer of [x, y] coordinates
// * lines - lines extracted from the hash, of the form [start, end]
// * rings - rings extracted from the hash, of the form [start, end]
//
// For each ring or line, start and end represent inclusive indexes into the
// coordinates buffer. For rings (and closed lines), coordinates[start] equals
// coordinates[end].
//
// For each line or polygon geometry in the input hash, including nested
// geometries as in geometry collections, the `coordinates` array is replaced
// with an equivalent `arcs` array that, for each line (for line string
// geometries) or ring (for polygon geometries), points to one of the above
// lines or rings.
var extract = function(objects) {
  var index = -1,
      lines = [],
      rings = [],
      coordinates = [];

  function extractGeometry(geometry) {
    if (geometry && extractGeometryType.hasOwnProperty(geometry.type)) extractGeometryType[geometry.type](geometry);
  }

  var extractGeometryType = {
    GeometryCollection: function(o) { o.geometries.forEach(extractGeometry); },
    LineString: function(o) { o.arcs = extractLine(o.coordinates); delete o.coordinates; },
    MultiLineString: function(o) { o.arcs = o.coordinates.map(extractLine); delete o.coordinates; },
    Polygon: function(o) { o.arcs = o.coordinates.map(extractRing); delete o.coordinates; },
    MultiPolygon: function(o) { o.arcs = o.coordinates.map(extractMultiRing); delete o.coordinates; }
  };

  function extractLine(line) {
    for (var i = 0, n = line.length; i < n; ++i) coordinates[++index] = line[i];
    var arc = {0: index - n + 1, 1: index};
    lines.push(arc);
    return arc;
  }

  function extractRing(ring) {
    for (var i = 0, n = ring.length; i < n; ++i) coordinates[++index] = ring[i];
    var arc = {0: index - n + 1, 1: index};
    rings.push(arc);
    return arc;
  }

  function extractMultiRing(rings) {
    return rings.map(extractRing);
  }

  for (var key in objects) {
    extractGeometry(objects[key]);
  }

  return {
    type: "Topology",
    coordinates: coordinates,
    lines: lines,
    rings: rings,
    objects: objects
  };
};

// Given a hash of GeoJSON objects, replaces Features with geometry objects.
// This is a destructive operation that modifies the input objects!
var geometry = function(objects) {
  var key;
  for (key in objects) objects[key] = geomifyObject(objects[key]);
  return objects;
};

function geomifyObject(object) {
  return (object && geomifyObjectType.hasOwnProperty(object.type)
      ? geomifyObjectType[object.type]
      : geomifyGeometry)(object);
}

function geomifyFeature(feature) {
  var geometry = feature.geometry;
  if (geometry == null) {
    feature.type = null;
  } else {
    geomifyGeometry(geometry);
    feature.type = geometry.type;
    if (geometry.geometries) feature.geometries = geometry.geometries;
    else if (geometry.coordinates) feature.coordinates = geometry.coordinates;
    if (geometry.bbox) feature.bbox = geometry.bbox;
  }
  delete feature.geometry;
  return feature;
}

function geomifyGeometry(geometry) {
  if (!geometry) return {type: null};
  if (geomifyGeometryType.hasOwnProperty(geometry.type)) geomifyGeometryType[geometry.type](geometry);
  return geometry;
}

var geomifyObjectType = {
  Feature: geomifyFeature,
  FeatureCollection: function(collection) {
    collection.type = "GeometryCollection";
    collection.geometries = collection.features;
    collection.features.forEach(geomifyFeature);
    delete collection.features;
    return collection;
  }
};

var geomifyGeometryType = {
  GeometryCollection: function(o) {
    var geometries = o.geometries, i = -1, n = geometries.length;
    while (++i < n) geometries[i] = geomifyGeometry(geometries[i]);
  },
  MultiPoint: function(o) {
    if (!o.coordinates.length) {
      o.type = null;
      delete o.coordinates;
    } else if (o.coordinates.length < 2) {
      o.type = "Point";
      o.coordinates = o.coordinates[0];
    }
  },
  LineString: function(o) {
    if (!o.coordinates.length) {
      o.type = null;
      delete o.coordinates;
    }
  },
  MultiLineString: function(o) {
    for (var lines = o.coordinates, i = 0, N = 0, n = lines.length; i < n; ++i) {
      var line = lines[i];
      if (line.length) lines[N++] = line;
    }
    if (!N) {
      o.type = null;
      delete o.coordinates;
    } else if (N < 2) {
      o.type = "LineString";
      o.coordinates = lines[0];
    } else {
      o.coordinates.length = N;
    }
  },
  Polygon: function(o) {
    for (var rings = o.coordinates, i = 0, N = 0, n = rings.length; i < n; ++i) {
      var ring = rings[i];
      if (ring.length) rings[N++] = ring;
    }
    if (!N) {
      o.type = null;
      delete o.coordinates;
    } else {
      o.coordinates.length = N;
    }
  },
  MultiPolygon: function(o) {
    for (var polygons = o.coordinates, j = 0, M = 0, m = polygons.length; j < m; ++j) {
      for (var rings = polygons[j], i = 0, N = 0, n = rings.length; i < n; ++i) {
        var ring = rings[i];
        if (ring.length) rings[N++] = ring;
      }
      if (N) {
        rings.length = N;
        polygons[M++] = rings;
      }
    }
    if (!M) {
      o.type = null;
      delete o.coordinates;
    } else if (M < 2) {
      o.type = "Polygon";
      o.coordinates = polygons[0];
    } else {
      polygons.length = M;
    }
  }
};

var prequantize = function(objects, bbox, n) {
  var x0 = bbox[0],
      y0 = bbox[1],
      x1 = bbox[2],
      y1 = bbox[3],
      kx = x1 - x0 ? (n - 1) / (x1 - x0) : 1,
      ky = y1 - y0 ? (n - 1) / (y1 - y0) : 1;

  function quantizePoint(coordinates) {
    coordinates[0] = Math.round((coordinates[0] - x0) * kx);
    coordinates[1] = Math.round((coordinates[1] - y0) * ky);
    return coordinates;
  }

  function quantizeLine(coordinates) {
    var i = 0,
        j = 1,
        n = coordinates.length,
        pi = quantizePoint(coordinates[0]),
        pj,
        px = pi[0],
        py = pi[1],
        x,
        y;

    while (++i < n) {
      pi = quantizePoint(coordinates[i]);
      x = pi[0];
      y = pi[1];
      if (x !== px || y !== py) { // skip coincident points
        pj = coordinates[j++];
        pj[0] = px = x;
        pj[1] = py = y;
      }
    }

    coordinates.length = j;
  }

  function quantizeGeometry(o) {
    if (o && quantizeGeometryType.hasOwnProperty(o.type)) quantizeGeometryType[o.type](o);
  }

  var quantizeGeometryType = {
    GeometryCollection: function(o) {
      o.geometries.forEach(quantizeGeometry);
    },
    Point: function(o) {
      quantizePoint(o.coordinates);
    },
    MultiPoint: function(o) {
      o.coordinates.forEach(quantizePoint);
    },
    LineString: function(o) {
      var line = o.coordinates;
      quantizeLine(line);
      if (line.length < 2) line[1] = line[0]; // must have 2+
    },
    MultiLineString: function(o) {
      for (var lines = o.coordinates, i = 0, n = lines.length; i < n; ++i) {
        var line = lines[i];
        quantizeLine(line);
        if (line.length < 2) line[1] = line[0]; // must have 2+
      }
    },
    Polygon: function(o) {
      for (var rings = o.coordinates, i = 0, n = rings.length; i < n; ++i) {
        var ring = rings[i];
        quantizeLine(ring);
        while (ring.length < 4) ring.push(ring[0]); // must have 4+
      }
    },
    MultiPolygon: function(o) {
      for (var polygons = o.coordinates, i = 0, n = polygons.length; i < n; ++i) {
        for (var rings = polygons[i], j = 0, m = rings.length; j < m; ++j) {
          var ring = rings[j];
          quantizeLine(ring);
          while (ring.length < 4) ring.push(ring[0]); // must have 4+
        }
      }
    }
  };

  for (var key in objects) {
    quantizeGeometry(objects[key]);
  }

  return {
    scale: [1 / kx, 1 / ky],
    translate: [x0, y0]
  };
};

// Constructs the TopoJSON Topology for the specified hash of features.
// Each object in the specified hash must be a GeoJSON object,
// meaning FeatureCollection, a Feature or a geometry object.
var topology = function(objects, quantization) {
  var bbox = bounds(geometry(objects)),
      transform = quantization > 0 && bbox && prequantize(objects, bbox, quantization),
      topology = dedup(cut(extract(objects))),
      coordinates = topology.coordinates,
      indexByArc = hashmap(topology.arcs.length * 1.4, hashArc, equalArc);

  objects = topology.objects; // for garbage collection
  topology.bbox = bbox;
  topology.arcs = topology.arcs.map(function(arc, i) {
    indexByArc.set(arc, i);
    return coordinates.slice(arc[0], arc[1] + 1);
  });

  delete topology.coordinates;
  coordinates = null;

  function indexGeometry(geometry$$1) {
    if (geometry$$1 && indexGeometryType.hasOwnProperty(geometry$$1.type)) indexGeometryType[geometry$$1.type](geometry$$1);
  }

  var indexGeometryType = {
    GeometryCollection: function(o) { o.geometries.forEach(indexGeometry); },
    LineString: function(o) { o.arcs = indexArcs(o.arcs); },
    MultiLineString: function(o) { o.arcs = o.arcs.map(indexArcs); },
    Polygon: function(o) { o.arcs = o.arcs.map(indexArcs); },
    MultiPolygon: function(o) { o.arcs = o.arcs.map(indexMultiArcs); }
  };

  function indexArcs(arc) {
    var indexes = [];
    do {
      var index = indexByArc.get(arc);
      indexes.push(arc[0] < arc[1] ? index : ~index);
    } while (arc = arc.next);
    return indexes;
  }

  function indexMultiArcs(arcs) {
    return arcs.map(indexArcs);
  }

  for (var key in objects) {
    indexGeometry(objects[key]);
  }

  if (transform) {
    topology.transform = transform;
    delta(topology);
  }

  return topology;
};

function hashArc(arc) {
  var i = arc[0], j = arc[1], t;
  if (j < i) t = i, i = j, j = t;
  return i + 31 * j;
}

function equalArc(arcA, arcB) {
  var ia = arcA[0], ja = arcA[1],
      ib = arcB[0], jb = arcB[1], t;
  if (ja < ia) t = ia, ia = ja, ja = t;
  if (jb < ib) t = ib, ib = jb, jb = t;
  return ia === ib && ja === jb;
}

var prune = function(topology) {
  var oldArcs = topology.arcs,
      newArcs = topology.arcs = [],
      newArcIndex = -1,
      newIndexByOldIndex = new Array(oldArcs.length),
      name;

  function pruneGeometry(o) {
    switch (o.type) {
      case "GeometryCollection": o.geometries.forEach(pruneGeometry); break;
      case "LineString": pruneArcs(o.arcs); break;
      case "MultiLineString": o.arcs.forEach(pruneArcs); break;
      case "Polygon": o.arcs.forEach(pruneArcs); break;
      case "MultiPolygon": o.arcs.forEach(pruneMultiArcs); break;
    }
  }

  function pruneArcs(arcs) {
    for (var i = 0, n = arcs.length; i < n; ++i) {
      var oldIndex = arcs[i],
          oldReverse = oldIndex < 0 && (oldIndex = ~oldIndex, true),
          newIndex;

      // If this is the first instance of this arc,
      // record it under its new index.
      if ((newIndex = newIndexByOldIndex[oldIndex]) == null) {
        newIndexByOldIndex[oldIndex] = newIndex = ++newArcIndex;
        newArcs[newIndex] = oldArcs[oldIndex];
      }

      arcs[i] = oldReverse ? ~newIndex : newIndex;
    }
  }

  function pruneMultiArcs(arcs) {
    arcs.forEach(pruneArcs);
  }

  for (name in topology.objects) {
    pruneGeometry(topology.objects[name]);
  }

  return topology;
};

var filter = function(topology, filter) {
  var name;

  if (filter == null) filter = filterTrue;

  function filterGeometry(o) {
    switch (o.type) {
      case "Polygon": {
        o.arcs = filterRings(o.arcs);
        if (!o.arcs) o.type = null, delete o.arcs;
        break;
      }
      case "MultiPolygon": {
        o.arcs = o.arcs.map(filterRings).filter(filterIdentity);
        if (!o.arcs.length) o.type = null, delete o.arcs;
        break;
      }
      case "GeometryCollection": {
        o.geometries.forEach(filterGeometry);
        o.geometries = o.geometries.filter(filterNotNull);
        if (!o.geometries.length) o.type = null, delete o.geometries;
        break;
      }
    }
  }

  function filterRings(arcs) {
    return arcs.length && filterExteriorRing(arcs[0]) // if the exterior is small, ignore any holes
        ? [arcs.shift()].concat(arcs.filter(filterInteriorRing))
        : null;
  }

  function filterExteriorRing(ring) {
    return filter(ring, false);
  }

  function filterInteriorRing(ring) {
    return filter(ring, true);
  }

  for (name in topology.objects) {
    filterGeometry(topology.objects[name]);
  }

  return prune(topology);
};

function filterTrue() {
  return true;
}

function filterIdentity(x) {
  return x;
}

function filterNotNull(geometry) {
  return geometry.type != null;
}

var filterAttached = function(topology) {
  var uniqueRingByArc = {}, // arc index -> index of unique associated ring, or -1 if used by multiple rings
      ringIndex = 0,
      name;

  function testGeometry(o) {
    switch (o.type) {
      case "GeometryCollection": o.geometries.forEach(testGeometry); break;
      case "Polygon": testArcs(o.arcs); break;
      case "MultiPolygon": o.arcs.forEach(testArcs); break;
    }
  }

  function testArcs(arcs) {
    for (var i = 0, n = arcs.length; i < n; ++i, ++ringIndex) {
      for (var ring = arcs[i], j = 0, m = ring.length; j < m; ++j) {
        var arc = ring[j];
        if (arc < 0) arc = ~arc;
        var uniqueRing = uniqueRingByArc[arc];
        if (uniqueRing >= 0 && uniqueRing !== ringIndex) uniqueRingByArc[arc] = -1;
        else uniqueRingByArc[arc] = ringIndex;
      }
    }
  }

  for (name in topology.objects) {
    testGeometry(topology.objects[name]);
  }

  return function(ring) {
    for (var j = 0, m = ring.length, arc; j < m; ++j) {
      if (arc = ring[j], uniqueRingByArc[arc < 0 ? ~arc : arc] < 0) {
        return true;
      }
    }
    return false;
  };
};

var identity = function(x) {
  return x;
};

var transform = function(topology) {
  if ((transform = topology.transform) == null) return identity;
  var transform,
      x0,
      y0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function(point, i) {
    if (!i) x0 = y0 = 0;
    point[0] = (x0 += point[0]) * kx + dx;
    point[1] = (y0 += point[1]) * ky + dy;
    return point;
  };
};

var bbox = function(topology) {
  var bbox = topology.bbox;

  function bboxPoint(p0) {
    p1[0] = p0[0], p1[1] = p0[1], t(p1);
    if (p1[0] < x0) x0 = p1[0];
    if (p1[0] > x1) x1 = p1[0];
    if (p1[1] < y0) y0 = p1[1];
    if (p1[1] > y1) y1 = p1[1];
  }

  function bboxGeometry(o) {
    switch (o.type) {
      case "GeometryCollection": o.geometries.forEach(bboxGeometry); break;
      case "Point": bboxPoint(o.coordinates); break;
      case "MultiPoint": o.coordinates.forEach(bboxPoint); break;
    }
  }

  if (!bbox) {
    var t = transform(topology), p0, p1 = new Array(2), name,
        x0 = Infinity, y0 = x0, x1 = -x0, y1 = -x0;

    topology.arcs.forEach(function(arc) {
      var i = -1, n = arc.length;
      while (++i < n) {
        p0 = arc[i], p1[0] = p0[0], p1[1] = p0[1], t(p1, i);
        if (p1[0] < x0) x0 = p1[0];
        if (p1[0] > x1) x1 = p1[0];
        if (p1[1] < y0) y0 = p1[1];
        if (p1[1] > y1) y1 = p1[1];
      }
    });

    for (name in topology.objects) {
      bboxGeometry(topology.objects[name]);
    }

    bbox = topology.bbox = [x0, y0, x1, y1];
  }

  return bbox;
};

var reverse$1 = function(array, n) {
  var t, j = array.length, i = j - n;
  while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
};

var feature = function(topology, o) {
  return o.type === "GeometryCollection"
      ? {type: "FeatureCollection", features: o.geometries.map(function(o) { return feature$1(topology, o); })}
      : feature$1(topology, o);
};

function feature$1(topology, o) {
  var id = o.id,
      bbox = o.bbox,
      properties = o.properties == null ? {} : o.properties,
      geometry = object(topology, o);
  return id == null && bbox == null ? {type: "Feature", properties: properties, geometry: geometry}
      : bbox == null ? {type: "Feature", id: id, properties: properties, geometry: geometry}
      : {type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry};
}

function object(topology, o) {
  var transformPoint = transform(topology),
      arcs = topology.arcs;

  function arc(i, points) {
    if (points.length) points.pop();
    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
      points.push(transformPoint(a[k].slice(), k));
    }
    if (i < 0) reverse$1(points, n);
  }

  function point(p) {
    return transformPoint(p.slice());
  }

  function line(arcs) {
    var points = [];
    for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
    if (points.length < 2) points.push(points[0].slice());
    return points;
  }

  function ring(arcs) {
    var points = line(arcs);
    while (points.length < 4) points.push(points[0].slice());
    return points;
  }

  function polygon(arcs) {
    return arcs.map(ring);
  }

  function geometry(o) {
    var type = o.type, coordinates;
    switch (type) {
      case "GeometryCollection": return {type: type, geometries: o.geometries.map(geometry)};
      case "Point": coordinates = point(o.coordinates); break;
      case "MultiPoint": coordinates = o.coordinates.map(point); break;
      case "LineString": coordinates = line(o.arcs); break;
      case "MultiLineString": coordinates = o.arcs.map(line); break;
      case "Polygon": coordinates = polygon(o.arcs); break;
      case "MultiPolygon": coordinates = o.arcs.map(polygon); break;
      default: return null;
    }
    return {type: type, coordinates: coordinates};
  }

  return geometry(o);
}

var stitch = function(topology, arcs) {
  var stitchedArcs = {},
      fragmentByStart = {},
      fragmentByEnd = {},
      fragments = [],
      emptyIndex = -1;

  // Stitch empty arcs first, since they may be subsumed by other arcs.
  arcs.forEach(function(i, j) {
    var arc = topology.arcs[i < 0 ? ~i : i], t;
    if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
      t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
    }
  });

  arcs.forEach(function(i) {
    var e = ends(i),
        start = e[0],
        end = e[1],
        f, g;

    if (f = fragmentByEnd[start]) {
      delete fragmentByEnd[f.end];
      f.push(i);
      f.end = end;
      if (g = fragmentByStart[end]) {
        delete fragmentByStart[g.start];
        var fg = g === f ? f : f.concat(g);
        fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else if (f = fragmentByStart[end]) {
      delete fragmentByStart[f.start];
      f.unshift(i);
      f.start = start;
      if (g = fragmentByEnd[start]) {
        delete fragmentByEnd[g.end];
        var gf = g === f ? f : g.concat(f);
        fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else {
      f = [i];
      fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
    }
  });

  function ends(i) {
    var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
    if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });
    else p1 = arc[arc.length - 1];
    return i < 0 ? [p1, p0] : [p0, p1];
  }

  function flush(fragmentByEnd, fragmentByStart) {
    for (var k in fragmentByEnd) {
      var f = fragmentByEnd[k];
      delete fragmentByStart[f.start];
      delete f.start;
      delete f.end;
      f.forEach(function(i) { stitchedArcs[i < 0 ? ~i : i] = 1; });
      fragments.push(f);
    }
  }

  flush(fragmentByEnd, fragmentByStart);
  flush(fragmentByStart, fragmentByEnd);
  arcs.forEach(function(i) { if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]); });

  return fragments;
};

var mesh = function(topology) {
  return object(topology, meshArcs.apply(this, arguments));
};

function meshArcs(topology, object$$1, filter) {
  var arcs, i, n;
  if (arguments.length > 1) arcs = extractArcs(topology, object$$1, filter);
  else for (i = 0, arcs = new Array(n = topology.arcs.length); i < n; ++i) arcs[i] = i;
  return {type: "MultiLineString", arcs: stitch(topology, arcs)};
}

function extractArcs(topology, object$$1, filter) {
  var arcs = [],
      geomsByArc = [],
      geom;

  function extract0(i) {
    var j = i < 0 ? ~i : i;
    (geomsByArc[j] || (geomsByArc[j] = [])).push({i: i, g: geom});
  }

  function extract1(arcs) {
    arcs.forEach(extract0);
  }

  function extract2(arcs) {
    arcs.forEach(extract1);
  }

  function extract3(arcs) {
    arcs.forEach(extract2);
  }

  function geometry(o) {
    switch (geom = o, o.type) {
      case "GeometryCollection": o.geometries.forEach(geometry); break;
      case "LineString": extract1(o.arcs); break;
      case "MultiLineString": case "Polygon": extract2(o.arcs); break;
      case "MultiPolygon": extract3(o.arcs); break;
    }
  }

  geometry(object$$1);

  geomsByArc.forEach(filter == null
      ? function(geoms) { arcs.push(geoms[0].i); }
      : function(geoms) { if (filter(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i); });

  return arcs;
}

function planarRingArea(ring) {
  var i = -1, n = ring.length, a, b = ring[n - 1], area = 0;
  while (++i < n) a = b, b = ring[i], area += a[0] * b[1] - a[1] * b[0];
  return Math.abs(area); // Note: doubled area!
}

var merge = function(topology) {
  return object(topology, mergeArcs.apply(this, arguments));
};

function mergeArcs(topology, objects) {
  var polygonsByArc = {},
      polygons = [],
      groups = [];

  objects.forEach(geometry);

  function geometry(o) {
    switch (o.type) {
      case "GeometryCollection": o.geometries.forEach(geometry); break;
      case "Polygon": extract(o.arcs); break;
      case "MultiPolygon": o.arcs.forEach(extract); break;
    }
  }

  function extract(polygon) {
    polygon.forEach(function(ring) {
      ring.forEach(function(arc) {
        (polygonsByArc[arc = arc < 0 ? ~arc : arc] || (polygonsByArc[arc] = [])).push(polygon);
      });
    });
    polygons.push(polygon);
  }

  function area(ring) {
    return planarRingArea(object(topology, {type: "Polygon", arcs: [ring]}).coordinates[0]);
  }

  polygons.forEach(function(polygon) {
    if (!polygon._) {
      var group = [],
          neighbors = [polygon];
      polygon._ = 1;
      groups.push(group);
      while (polygon = neighbors.pop()) {
        group.push(polygon);
        polygon.forEach(function(ring) {
          ring.forEach(function(arc) {
            polygonsByArc[arc < 0 ? ~arc : arc].forEach(function(polygon) {
              if (!polygon._) {
                polygon._ = 1;
                neighbors.push(polygon);
              }
            });
          });
        });
      }
    }
  });

  polygons.forEach(function(polygon) {
    delete polygon._;
  });

  return {
    type: "MultiPolygon",
    arcs: groups.map(function(polygons) {
      var arcs = [], n;

      // Extract the exterior (unique) arcs.
      polygons.forEach(function(polygon) {
        polygon.forEach(function(ring) {
          ring.forEach(function(arc) {
            if (polygonsByArc[arc < 0 ? ~arc : arc].length < 2) {
              arcs.push(arc);
            }
          });
        });
      });

      // Stitch the arcs into one or more rings.
      arcs = stitch(topology, arcs);

      // If more than one ring is returned,
      // at most one of these rings can be the exterior;
      // choose the one with the greatest absolute area.
      if ((n = arcs.length) > 1) {
        for (var i = 1, k = area(arcs[0]), ki, t; i < n; ++i) {
          if ((ki = area(arcs[i])) > k) {
            t = arcs[0], arcs[0] = arcs[i], arcs[i] = t, k = ki;
          }
        }
      }

      return arcs;
    })
  };
}

var bisect = function(a, x) {
  var lo = 0, hi = a.length;
  while (lo < hi) {
    var mid = lo + hi >>> 1;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

var neighbors = function(objects) {
  var indexesByArc = {}, // arc index -> array of object indexes
      neighbors = objects.map(function() { return []; });

  function line(arcs, i) {
    arcs.forEach(function(a) {
      if (a < 0) a = ~a;
      var o = indexesByArc[a];
      if (o) o.push(i);
      else indexesByArc[a] = [i];
    });
  }

  function polygon(arcs, i) {
    arcs.forEach(function(arc) { line(arc, i); });
  }

  function geometry(o, i) {
    if (o.type === "GeometryCollection") o.geometries.forEach(function(o) { geometry(o, i); });
    else if (o.type in geometryType) geometryType[o.type](o.arcs, i);
  }

  var geometryType = {
    LineString: line,
    MultiLineString: polygon,
    Polygon: polygon,
    MultiPolygon: function(arcs, i) { arcs.forEach(function(arc) { polygon(arc, i); }); }
  };

  objects.forEach(geometry);

  for (var i in indexesByArc) {
    for (var indexes = indexesByArc[i], m = indexes.length, j = 0; j < m; ++j) {
      for (var k = j + 1; k < m; ++k) {
        var ij = indexes[j], ik = indexes[k], n;
        if ((n = neighbors[ij])[i = bisect(n, ik)] !== ik) n.splice(i, 0, ik);
        if ((n = neighbors[ik])[i = bisect(n, ij)] !== ij) n.splice(i, 0, ij);
      }
    }
  }

  return neighbors;
};

var quantize = function(topology, n) {
  if (!((n = Math.floor(n)) >= 2)) throw new Error("n must be \u22652");
  if (topology.transform) throw new Error("already quantized");
  var bb = bbox(topology), name,
      dx = bb[0], kx = (bb[2] - dx) / (n - 1) || 1,
      dy = bb[1], ky = (bb[3] - dy) / (n - 1) || 1;

  function quantizePoint(p) {
    p[0] = Math.round((p[0] - dx) / kx);
    p[1] = Math.round((p[1] - dy) / ky);
  }

  function quantizeGeometry(o) {
    switch (o.type) {
      case "GeometryCollection": o.geometries.forEach(quantizeGeometry); break;
      case "Point": quantizePoint(o.coordinates); break;
      case "MultiPoint": o.coordinates.forEach(quantizePoint); break;
    }
  }

  topology.arcs.forEach(function(arc) {
    var i = 1,
        j = 1,
        n = arc.length,
        pi = arc[0],
        x0 = pi[0] = Math.round((pi[0] - dx) / kx),
        y0 = pi[1] = Math.round((pi[1] - dy) / ky),
        pj,
        x1,
        y1;

    for (; i < n; ++i) {
      pi = arc[i];
      x1 = Math.round((pi[0] - dx) / kx);
      y1 = Math.round((pi[1] - dy) / ky);
      if (x1 !== x0 || y1 !== y0) {
        pj = arc[j++];
        pj[0] = x1 - x0, x0 = x1;
        pj[1] = y1 - y0, y0 = y1;
      }
    }

    if (j < 2) {
      pj = arc[j++];
      pj[0] = 0;
      pj[1] = 0;
    }

    arc.length = j;
  });

  for (name in topology.objects) {
    quantizeGeometry(topology.objects[name]);
  }

  topology.transform = {
    scale: [kx, ky],
    translate: [dx, dy]
  };

  return topology;
};

var untransform = function(topology) {
  if ((transform = topology.transform) == null) return identity;
  var transform,
      x0,
      y0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function(point, i) {
    if (!i) x0 = y0 = 0;
    var x1 = Math.round((point[0] - dx) / kx),
        y1 = Math.round((point[1] - dy) / ky);
    point[0] = x1 - x0, x0 = x1;
    point[1] = y1 - y0, y0 = y1;
    return point;
  };
};

function planarTriangleArea(triangle) {
  var a = triangle[0], b = triangle[1], c = triangle[2];
  return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));
}

function planarRingArea$1(ring) {
  var i = -1, n = ring.length, a, b = ring[n - 1], area = 0;
  while (++i < n) a = b, b = ring[i], area += a[0] * b[1] - a[1] * b[0];
  return Math.abs(area) / 2;
}

var filterWeight = function(topology, minWeight, weight) {
  minWeight = minWeight == null ? Number.MIN_VALUE : +minWeight;

  if (weight == null) weight = planarRingArea$1;

  return function(ring, interior) {
    return weight(feature(topology, {type: "Polygon", arcs: [ring]}).geometry.coordinates[0], interior) >= minWeight;
  };
};

function compare(a, b) {
  return a[1][2] - b[1][2];
}

var newHeap = function() {
  var heap = {},
      array = [],
      size = 0;

  heap.push = function(object) {
    up(array[object._ = size] = object, size++);
    return size;
  };

  heap.pop = function() {
    if (size <= 0) return;
    var removed = array[0], object;
    if (--size > 0) object = array[size], down(array[object._ = 0] = object, 0);
    return removed;
  };

  heap.remove = function(removed) {
    var i = removed._, object;
    if (array[i] !== removed) return; // invalid request
    if (i !== --size) object = array[size], (compare(object, removed) < 0 ? up : down)(array[object._ = i] = object, i);
    return i;
  };

  function up(object, i) {
    while (i > 0) {
      var j = ((i + 1) >> 1) - 1,
          parent = array[j];
      if (compare(object, parent) >= 0) break;
      array[parent._ = i] = parent;
      array[object._ = i = j] = object;
    }
  }

  function down(object, i) {
    while (true) {
      var r = (i + 1) << 1,
          l = r - 1,
          j = i,
          child = array[j];
      if (l < size && compare(array[l], child) < 0) child = array[j = l];
      if (r < size && compare(array[r], child) < 0) child = array[j = r];
      if (j === i) break;
      array[child._ = i] = child;
      array[object._ = i = j] = object;
    }
  }

  return heap;
};

var presimplify = function(topology, weight) {
  var absolute = transform(topology),
      relative = untransform(topology),
      heap = newHeap();

  if (weight == null) weight = planarTriangleArea;

  topology.arcs.forEach(function(arc) {
    var triangles = [],
        maxWeight = 0,
        triangle,
        i,
        n;

    arc.forEach(absolute);

    for (i = 1, n = arc.length - 1; i < n; ++i) {
      triangle = arc.slice(i - 1, i + 2);
      triangle[1][2] = weight(triangle);
      triangles.push(triangle);
      heap.push(triangle);
    }

    // Always keep the arc endpoints!
    arc[0][2] = arc[n][2] = Infinity;

    for (i = 0, n = triangles.length; i < n; ++i) {
      triangle = triangles[i];
      triangle.previous = triangles[i - 1];
      triangle.next = triangles[i + 1];
    }

    while (triangle = heap.pop()) {
      var previous = triangle.previous,
          next = triangle.next;

      // If the weight of the current point is less than that of the previous
      // point to be eliminated, use the latter’s weight instead. This ensures
      // that the current point cannot be eliminated without eliminating
      // previously- eliminated points.
      if (triangle[1][2] < maxWeight) triangle[1][2] = maxWeight;
      else maxWeight = triangle[1][2];

      if (previous) {
        previous.next = next;
        previous[2] = triangle[2];
        update(previous);
      }

      if (next) {
        next.previous = previous;
        next[0] = triangle[0];
        update(next);
      }
    }

    arc.forEach(relative);
  });

  function update(triangle) {
    heap.remove(triangle);
    triangle[1][2] = weight(triangle);
    heap.push(triangle);
  }

  return topology;
};

var quantile = function(topology, p) {
  var array = [];

  topology.arcs.forEach(function(arc) {
    arc.forEach(function(point) {
      if (isFinite(point[2])) { // Ignore endpoints, whose weight is Infinity.
        array.push(point[2]);
      }
    });
  });

  return array.length && quantile$1(array.sort(descending), p);
};

function quantile$1(array, p) {
  if (!(n = array.length)) return;
  if ((p = +p) <= 0 || n < 2) return array[0];
  if (p >= 1) return array[n - 1];
  var n,
      h = (n - 1) * p,
      i = Math.floor(h),
      a = array[i],
      b = array[i + 1];
  return a + (b - a) * (h - i);
}

function descending(a, b) {
  return b - a;
}

var simplify = function(topology, minWeight) {
  minWeight = minWeight == null ? Number.MIN_VALUE : +minWeight;

  // Remove points whose weight is less than the minimum weight.
  topology.arcs.forEach(topology.transform ? function(arc) {
    var dx = 0,
        dy = 0, // accumulate removed points
        i = -1,
        j = -1,
        n = arc.length,
        source,
        target;

    while (++i < n) {
      source = arc[i];
      if (source[2] >= minWeight) {
        target = arc[++j];
        target[0] = source[0] + dx;
        target[1] = source[1] + dy;
        dx = dy = 0;
      } else {
        dx += source[0];
        dy += source[1];
      }
    }

    arc.length = ++j;
  } : function(arc) {
    var i = -1,
        j = -1,
        n = arc.length,
        point;

    while (++i < n) {
      point = arc[i];
      if (point[2] >= minWeight) {
        arc[++j] = point;
      }
    }

    arc.length = ++j;
  });

  // Remove the computed weight for each point, and remove coincident points.
  // This is done as a separate pass because some coordinates may be shared
  // between arcs (such as the last point and first point of a cut line).
  // If the entire arc is empty, retain at least two points (per spec).
  topology.arcs.forEach(topology.transform ? function(arc) {
    var i = 0,
        j = 0,
        n = arc.length,
        p = arc[0];
    p.length = 2;
    while (++i < n) {
      p = arc[i];
      p.length = 2;
      if (p[0] || p[1]) arc[++j] = p;
    }
    arc.length = (j || 1) + 1;
  } : function(arc) {
    var i = 0,
        j = 0,
        n = arc.length,
        p = arc[0],
        x0 = p[0],
        y0 = p[1],
        x1,
        y1;
    p.length = 2;
    while (++i < n) {
      p = arc[i], x1 = p[0], y1 = p[1];
      p.length = 2;
      if (x0 !== x1 || y0 !== y1) arc[++j] = p, x0 = x1, y0 = y1;
    }
    arc.length = (j || 1) + 1;
  });

  return topology;
};

var pi = Math.PI;
var tau = 2 * pi;
var fourPi = 4 * pi;
var radians = pi / 180;
var abs = Math.abs;
var atan = Math.atan;
var atan2 = Math.atan2;
var cos = Math.cos;
var max = Math.max;
var sin = Math.sin;
var sqrt = Math.sqrt;
var tan = Math.tan;

function sphericalRingArea(ring, interior) {
  if (!ring.length) return 0;
  var sum = 0,
      point = ring[0],
      lambda0, lambda1 = point[0] * radians, delta,
      phi1 = (point[1] * radians + tau) / 2,
      cosPhi0, cosPhi1 = cos(phi1),
      sinPhi0, sinPhi1 = sin(phi1),
      i, n, k;

  for (i = 1, n = ring.length; i < n; ++i) {
    point = ring[i];
    lambda0 = lambda1, lambda1 = point[0] * radians, delta = lambda1 - lambda0;
    phi1 = (point[1] * radians + tau) / 2;
    cosPhi0 = cosPhi1, cosPhi1 = cos(phi1);
    sinPhi0 = sinPhi1, sinPhi1 = sin(phi1);

    // Spherical excess E for a spherical triangle with vertices: south pole,
    // previous point, current point. Uses a formula derived from Cagnoli’s
    // theorem. See Todhunter, Spherical Trig. (1871), Sec. 103, Eq. (2).
    k = sinPhi0 * sinPhi1;
    sum += atan2(k * sin(delta), cosPhi0 * cosPhi1 + k * cos(delta));
  }

  sum = 2 * (sum > pi ? sum - tau : sum < -pi ? sum + tau : sum);
  if (interior) sum *= -1;
  return sum < 0 ? sum + fourPi : sum;
}

function sphericalTriangleArea(t) {
  var lambda0 = t[0][0] * radians, phi0 = t[0][1] * radians, cosPhi0 = cos(phi0), sinPhi0 = sin(phi0),
      lambda1 = t[1][0] * radians, phi1 = t[1][1] * radians, cosPhi1 = cos(phi1), sinPhi1 = sin(phi1),
      lambda2 = t[2][0] * radians, phi2 = t[2][1] * radians, cosPhi2 = cos(phi2), sinPhi2 = sin(phi2),
      a = distance(lambda0, cosPhi0, sinPhi0, lambda1, cosPhi1, sinPhi1),
      b = distance(lambda1, cosPhi1, sinPhi1, lambda2, cosPhi2, sinPhi2),
      c = distance(lambda2, cosPhi2, sinPhi2, lambda0, cosPhi0, sinPhi0),
      s = (a + b + c) / 2;
  return 4 * atan(sqrt(max(0, tan(s / 2) * tan((s - a) / 2) * tan((s - b) / 2) * tan((s - c) / 2))));
}

function distance(lambda0, sinPhi0, cosPhi0, lambda1, sinPhi1, cosPhi1) {
  var delta = abs(lambda1 - lambda0),
      cosDelta = cos(delta),
      sinDelta = sin(delta),
      x = cosPhi1 * sinDelta,
      y = cosPhi0 * sinPhi1 - sinPhi0 * cosPhi1 * cosDelta,
      z = sinPhi0 * sinPhi1 + cosPhi0 * cosPhi1 * cosDelta;
  return atan2(sqrt(x * x + y * y), z);
}

exports.topology = topology;
exports.filter = filter;
exports.filterAttached = filterAttached;
exports.filterWeight = filterWeight;
exports.planarRingArea = planarRingArea$1;
exports.planarTriangleArea = planarTriangleArea;
exports.presimplify = presimplify;
exports.quantile = quantile;
exports.simplify = simplify;
exports.sphericalRingArea = sphericalRingArea;
exports.sphericalTriangleArea = sphericalTriangleArea;
exports.bbox = bbox;
exports.feature = feature;
exports.merge = merge;
exports.mergeArcs = mergeArcs;
exports.mesh = mesh;
exports.meshArcs = meshArcs;
exports.neighbors = neighbors;
exports.quantize = quantize;
exports.transform = transform;
exports.untransform = untransform;

Object.defineProperty(exports, '__esModule', { value: true });

})));


/***/ }),
/* 219 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 220 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Util = exports.actions = exports.providers = exports.components = exports.ChartView = undefined;

var _index = __webpack_require__(32);

var providers = _interopRequireWildcard(_index);

var _index2 = __webpack_require__(30);

var components = _interopRequireWildcard(_index2);

var _index3 = __webpack_require__(29);

var actions = _interopRequireWildcard(_index3);

var _Util = __webpack_require__(31);

var Util = _interopRequireWildcard(_Util);

var _ChartView = __webpack_require__(52);

var _ChartView2 = _interopRequireDefault(_ChartView);

__webpack_require__(53);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.ChartView = _ChartView2.default;
exports.components = components;
exports.providers = providers;
exports.actions = actions;
exports.Util = Util; /*
                      * Copyright (c) Juniper Networks, Inc. All rights reserved.
                      */

/***/ })
/******/ ]);
});
//# sourceMappingURL=contrail-charts.js.map