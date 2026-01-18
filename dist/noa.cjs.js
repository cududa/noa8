'use strict';

var discBuilder = require('@babylonjs/core/Meshes/Builders/discBuilder');
var transformNode = require('@babylonjs/core/Meshes/transformNode');
var materialPluginBase = require('@babylonjs/core/Materials/materialPluginBase');
var engine = require('@babylonjs/core/Engines/engine');
var texture = require('@babylonjs/core/Materials/Textures/texture');
var rawTexture2DArray = require('@babylonjs/core/Materials/Textures/rawTexture2DArray');
var mesh = require('@babylonjs/core/Meshes/mesh');
var mesh_vertexData = require('@babylonjs/core/Meshes/mesh.vertexData');
var octreeSceneComponent = require('@babylonjs/core/Culling/Octrees/octreeSceneComponent');
var octree = require('@babylonjs/core/Culling/Octrees/octree');
var math_vector = require('@babylonjs/core/Maths/math.vector');
var octreeBlock = require('@babylonjs/core/Culling/Octrees/octreeBlock');
var scene = require('@babylonjs/core/scene');
var freeCamera = require('@babylonjs/core/Cameras/freeCamera');
var math_color = require('@babylonjs/core/Maths/math.color');
var directionalLight = require('@babylonjs/core/Lights/directionalLight');
var hemisphericLight = require('@babylonjs/core/Lights/hemisphericLight');
var meshBuilder = require('@babylonjs/core/Meshes/meshBuilder');
var standardMaterial = require('@babylonjs/core/Materials/standardMaterial');
var shaderMaterial = require('@babylonjs/core/Materials/shaderMaterial');
var sceneLoader = require('@babylonjs/core/Loading/sceneLoader');
var planeBuilder = require('@babylonjs/core/Meshes/Builders/planeBuilder');
var ray = require('@babylonjs/core/Culling/ray');
var linesBuilder = require('@babylonjs/core/Meshes/Builders/linesBuilder');
var material = require('@babylonjs/core/Materials/material');
var fresnelParameters = require('@babylonjs/core/Materials/fresnelParameters');
var dynamicTexture = require('@babylonjs/core/Materials/Textures/dynamicTexture');
var instancedMesh = require('@babylonjs/core/Meshes/instancedMesh');
var boxBuilder = require('@babylonjs/core/Meshes/Builders/boxBuilder');
var cylinderBuilder = require('@babylonjs/core/Meshes/Builders/cylinderBuilder');
var sphereBuilder = require('@babylonjs/core/Meshes/Builders/sphereBuilder');
var skeleton = require('@babylonjs/core/Bones/skeleton');
var animation = require('@babylonjs/core/Animations/animation');
var animationGroup = require('@babylonjs/core/Animations/animationGroup');

function _mergeNamespaces(n, m) {
	m.forEach(function (e) {
		e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
			if (k !== 'default' && !(k in n)) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	});
	return Object.freeze(n);
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var events = {exports: {}};

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };

var ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter$1() {
  EventEmitter$1.init.call(this);
}
events.exports = EventEmitter$1;
events.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter$1.EventEmitter = EventEmitter$1;

EventEmitter$1.prototype._events = undefined;
EventEmitter$1.prototype._eventsCount = 0;
EventEmitter$1.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter$1, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter$1.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter$1.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter$1.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter$1.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter$1.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter$1.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter$1.prototype.on = EventEmitter$1.prototype.addListener;

EventEmitter$1.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter$1.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter$1.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter$1.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter$1.prototype.off = EventEmitter$1.prototype.removeListener;

EventEmitter$1.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter$1.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter$1.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter$1.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter$1.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter$1.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    }
    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

var eventsExports = events.exports;
var EventEmitter = /*@__PURE__*/getDefaultExportFromCjs(eventsExports);

var epsilon = 0.000001;

var create_1 = create$1;

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
function create$1() {
    var out = new Float32Array(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out
}

var clone_1 = clone$1;

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
function clone$1(a) {
    var out = new Float32Array(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out
}

var fromValues_1 = fromValues$1;

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
function fromValues$1(x, y, z) {
    var out = new Float32Array(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out
}

var normalize_1 = normalize$1;

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize$1(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out
}

var dot_1 = dot$1;

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot$1(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

var angle_1 = angle;

var fromValues = fromValues_1;
var normalize = normalize_1;
var dot = dot_1;

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
function angle(a, b) {
    var tempA = fromValues(a[0], a[1], a[2]);
    var tempB = fromValues(b[0], b[1], b[2]);
 
    normalize(tempA, tempA);
    normalize(tempB, tempB);
 
    var cosine = dot(tempA, tempB);

    if(cosine > 1.0){
        return 0
    } else {
        return Math.acos(cosine)
    }     
}

var copy_1 = copy$1;

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
function copy$1(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out
}

var set_1 = set;

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
function set(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out
}

var equals_1 = equals$1;

var EPSILON = epsilon;

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function equals$1(a, b) {
  var a0 = a[0];
  var a1 = a[1];
  var a2 = a[2];
  var b0 = b[0];
  var b1 = b[1];
  var b2 = b[2];
  return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
          Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
          Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)))
}

var exactEquals_1 = exactEquals;

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}

var add_1 = add$1;

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function add$1(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out
}

var subtract_1 = subtract$1;

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function subtract$1(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out
}

var sub = subtract_1;

var multiply_1 = multiply;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out
}

var mul = multiply_1;

var divide_1 = divide;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out
}

var div = divide_1;

var min_1 = min$1;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function min$1(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out
}

var max_1 = max$1;

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function max$1(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out
}

var floor_1 = floor;

/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to floor
 * @returns {vec3} out
 */
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out
}

var ceil_1 = ceil;

/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to ceil
 * @returns {vec3} out
 */
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out
}

var round_1 = round;

/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to round
 * @returns {vec3} out
 */
function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out
}

var scale_1 = scale;

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out
}

var scaleAndAdd_1 = scaleAndAdd;

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
function scaleAndAdd(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    return out
}

var distance_1 = distance;

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z)
}

var dist = distance_1;

var squaredDistance_1 = squaredDistance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z
}

var sqrDist = squaredDistance_1;

var length_1 = length$1;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length$1(a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z)
}

var len = length_1;

var squaredLength_1 = squaredLength;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z
}

var sqrLen = squaredLength_1;

var negate_1 = negate;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out
}

var inverse_1 = inverse;

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  return out
}

var cross_1 = cross;

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out
}

var lerp_1 = lerp;

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
function lerp(out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out
}

var random_1 = random;

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
function random(out, scale) {
    scale = scale || 1.0;

    var r = Math.random() * 2.0 * Math.PI;
    var z = (Math.random() * 2.0) - 1.0;
    var zScale = Math.sqrt(1.0-z*z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out
}

var transformMat4_1 = transformMat4;

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
function transformMat4(out, a, m) {
    var x = a[0], y = a[1], z = a[2],
        w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out
}

var transformMat3_1 = transformMat3;

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
function transformMat3(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out
}

var transformQuat_1 = transformQuat;

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
function transformQuat(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out
}

var rotateX_1 = rotateX;

/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateX(out, a, b, c){
    var by = b[1];
    var bz = b[2];

    // Translate point to the origin
    var py = a[1] - by;
    var pz = a[2] - bz;

    var sc = Math.sin(c);
    var cc = Math.cos(c);

    // perform rotation and translate to correct position
    out[0] = a[0];
    out[1] = by + py * cc - pz * sc;
    out[2] = bz + py * sc + pz * cc;

    return out
}

var rotateY_1 = rotateY;

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateY(out, a, b, c){
    var bx = b[0];
    var bz = b[2];

    // translate point to the origin
    var px = a[0] - bx;
    var pz = a[2] - bz;
    
    var sc = Math.sin(c);
    var cc = Math.cos(c);
  
    // perform rotation and translate to correct position
    out[0] = bx + pz * sc + px * cc;
    out[1] = a[1];
    out[2] = bz + pz * cc - px * sc;
  
    return out
}

var rotateZ_1 = rotateZ;

/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateZ(out, a, b, c){
    var bx = b[0];
    var by = b[1];

    //Translate point to the origin
    var px = a[0] - bx;
    var py = a[1] - by;
  
    var sc = Math.sin(c);
    var cc = Math.cos(c);

    // perform rotation and translate to correct position
    out[0] = bx + px * cc - py * sc;
    out[1] = by + px * sc + py * cc;
    out[2] = a[2];
  
    return out
}

var forEach_1 = forEach;

var vec = create_1();

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
function forEach(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; 
            vec[1] = a[i+1]; 
            vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; 
            a[i+1] = vec[1]; 
            a[i+2] = vec[2];
        }
        
        return a
}

var glVec3 = {
  EPSILON: epsilon
  , create: create_1
  , clone: clone_1
  , angle: angle_1
  , fromValues: fromValues_1
  , copy: copy_1
  , set: set_1
  , equals: equals_1
  , exactEquals: exactEquals_1
  , add: add_1
  , subtract: subtract_1
  , sub: sub
  , multiply: multiply_1
  , mul: mul
  , divide: divide_1
  , div: div
  , min: min_1
  , max: max_1
  , floor: floor_1
  , ceil: ceil_1
  , round: round_1
  , scale: scale_1
  , scaleAndAdd: scaleAndAdd_1
  , distance: distance_1
  , dist: dist
  , squaredDistance: squaredDistance_1
  , sqrDist: sqrDist
  , length: length_1
  , len: len
  , squaredLength: squaredLength_1
  , sqrLen: sqrLen
  , negate: negate_1
  , inverse: inverse_1
  , normalize: normalize_1
  , dot: dot_1
  , cross: cross_1
  , lerp: lerp_1
  , random: random_1
  , transformMat4: transformMat4_1
  , transformMat3: transformMat3_1
  , transformQuat: transformQuat_1
  , rotateX: rotateX_1
  , rotateY: rotateY_1
  , rotateZ: rotateZ_1
  , forEach: forEach_1
};

var vec3 = /*@__PURE__*/getDefaultExportFromCjs(glVec3);

var vec3$1 = /*#__PURE__*/_mergeNamespaces({
	__proto__: null,
	default: vec3
}, [glVec3]);

function iota$1(n) {
  var result = new Array(n);
  for(var i=0; i<n; ++i) {
    result[i] = i;
  }
  return result
}

var iota_1 = iota$1;

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
var isBuffer_1 = function (obj) {
  return obj != null && (isBuffer$3(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
};

function isBuffer$3 (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer$3(obj.slice(0, 0))
}

var iota = iota_1;
var isBuffer$2 = isBuffer_1;

var hasTypedArrays  = ((typeof Float64Array) !== "undefined");

function compare1st(a, b) {
  return a[0] - b[0]
}

function order() {
  var stride = this.stride;
  var terms = new Array(stride.length);
  var i;
  for(i=0; i<terms.length; ++i) {
    terms[i] = [Math.abs(stride[i]), i];
  }
  terms.sort(compare1st);
  var result = new Array(terms.length);
  for(i=0; i<result.length; ++i) {
    result[i] = terms[i][1];
  }
  return result
}

function compileConstructor(dtype, dimension) {
  var className = ["View", dimension, "d", dtype].join("");
  if(dimension < 0) {
    className = "View_Nil" + dtype;
  }
  var useGetters = (dtype === "generic");

  if(dimension === -1) {
    //Special case for trivial arrays
    var code =
      "function "+className+"(a){this.data=a;};\
var proto="+className+".prototype;\
proto.dtype='"+dtype+"';\
proto.index=function(){return -1};\
proto.size=0;\
proto.dimension=-1;\
proto.shape=proto.stride=proto.order=[];\
proto.lo=proto.hi=proto.transpose=proto.step=\
function(){return new "+className+"(this.data);};\
proto.get=proto.set=function(){};\
proto.pick=function(){return null};\
return function construct_"+className+"(a){return new "+className+"(a);}";
    var procedure = new Function(code);
    return procedure()
  } else if(dimension === 0) {
    //Special case for 0d arrays
    var code =
      "function "+className+"(a,d) {\
this.data = a;\
this.offset = d\
};\
var proto="+className+".prototype;\
proto.dtype='"+dtype+"';\
proto.index=function(){return this.offset};\
proto.dimension=0;\
proto.size=1;\
proto.shape=\
proto.stride=\
proto.order=[];\
proto.lo=\
proto.hi=\
proto.transpose=\
proto.step=function "+className+"_copy() {\
return new "+className+"(this.data,this.offset)\
};\
proto.pick=function "+className+"_pick(){\
return TrivialArray(this.data);\
};\
proto.valueOf=proto.get=function "+className+"_get(){\
return "+(useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]")+
"};\
proto.set=function "+className+"_set(v){\
return "+(useGetters ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v")+"\
};\
return function construct_"+className+"(a,b,c,d){return new "+className+"(a,d)}";
    var procedure = new Function("TrivialArray", code);
    return procedure(CACHED_CONSTRUCTORS[dtype][0])
  }

  var code = ["'use strict'"];

  //Create constructor for view
  var indices = iota(dimension);
  var args = indices.map(function(i) { return "i"+i });
  var index_str = "this.offset+" + indices.map(function(i) {
        return "this.stride[" + i + "]*i" + i
      }).join("+");
  var shapeArg = indices.map(function(i) {
      return "b"+i
    }).join(",");
  var strideArg = indices.map(function(i) {
      return "c"+i
    }).join(",");
  code.push(
    "function "+className+"(a," + shapeArg + "," + strideArg + ",d){this.data=a",
      "this.shape=[" + shapeArg + "]",
      "this.stride=[" + strideArg + "]",
      "this.offset=d|0}",
    "var proto="+className+".prototype",
    "proto.dtype='"+dtype+"'",
    "proto.dimension="+dimension);

  //view.size:
  code.push("Object.defineProperty(proto,'size',{get:function "+className+"_size(){\
return "+indices.map(function(i) { return "this.shape["+i+"]" }).join("*"),
"}})");

  //view.order:
  if(dimension === 1) {
    code.push("proto.order=[0]");
  } else {
    code.push("Object.defineProperty(proto,'order',{get:");
    if(dimension < 4) {
      code.push("function "+className+"_order(){");
      if(dimension === 2) {
        code.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})");
      } else if(dimension === 3) {
        code.push(
"var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);\
if(s0>s1){\
if(s1>s2){\
return [2,1,0];\
}else if(s0>s2){\
return [1,2,0];\
}else{\
return [1,0,2];\
}\
}else if(s0>s2){\
return [2,0,1];\
}else if(s2>s1){\
return [0,1,2];\
}else{\
return [0,2,1];\
}}})");
      }
    } else {
      code.push("ORDER})");
    }
  }

  //view.set(i0, ..., v):
  code.push(
"proto.set=function "+className+"_set("+args.join(",")+",v){");
  if(useGetters) {
    code.push("return this.data.set("+index_str+",v)}");
  } else {
    code.push("return this.data["+index_str+"]=v}");
  }

  //view.get(i0, ...):
  code.push("proto.get=function "+className+"_get("+args.join(",")+"){");
  if(useGetters) {
    code.push("return this.data.get("+index_str+")}");
  } else {
    code.push("return this.data["+index_str+"]}");
  }

  //view.index:
  code.push(
    "proto.index=function "+className+"_index(", args.join(), "){return "+index_str+"}");

  //view.hi():
  code.push("proto.hi=function "+className+"_hi("+args.join(",")+"){return new "+className+"(this.data,"+
    indices.map(function(i) {
      return ["(typeof i",i,"!=='number'||i",i,"<0)?this.shape[", i, "]:i", i,"|0"].join("")
    }).join(",")+","+
    indices.map(function(i) {
      return "this.stride["+i + "]"
    }).join(",")+",this.offset)}");

  //view.lo():
  var a_vars = indices.map(function(i) { return "a"+i+"=this.shape["+i+"]" });
  var c_vars = indices.map(function(i) { return "c"+i+"=this.stride["+i+"]" });
  code.push("proto.lo=function "+className+"_lo("+args.join(",")+"){var b=this.offset,d=0,"+a_vars.join(",")+","+c_vars.join(","));
  for(var i=0; i<dimension; ++i) {
    code.push(
"if(typeof i"+i+"==='number'&&i"+i+">=0){\
d=i"+i+"|0;\
b+=c"+i+"*d;\
a"+i+"-=d}");
  }
  code.push("return new "+className+"(this.data,"+
    indices.map(function(i) {
      return "a"+i
    }).join(",")+","+
    indices.map(function(i) {
      return "c"+i
    }).join(",")+",b)}");

  //view.step():
  code.push("proto.step=function "+className+"_step("+args.join(",")+"){var "+
    indices.map(function(i) {
      return "a"+i+"=this.shape["+i+"]"
    }).join(",")+","+
    indices.map(function(i) {
      return "b"+i+"=this.stride["+i+"]"
    }).join(",")+",c=this.offset,d=0,ceil=Math.ceil");
  for(var i=0; i<dimension; ++i) {
    code.push(
"if(typeof i"+i+"==='number'){\
d=i"+i+"|0;\
if(d<0){\
c+=b"+i+"*(a"+i+"-1);\
a"+i+"=ceil(-a"+i+"/d)\
}else{\
a"+i+"=ceil(a"+i+"/d)\
}\
b"+i+"*=d\
}");
  }
  code.push("return new "+className+"(this.data,"+
    indices.map(function(i) {
      return "a" + i
    }).join(",")+","+
    indices.map(function(i) {
      return "b" + i
    }).join(",")+",c)}");

  //view.transpose():
  var tShape = new Array(dimension);
  var tStride = new Array(dimension);
  for(var i=0; i<dimension; ++i) {
    tShape[i] = "a[i"+i+"]";
    tStride[i] = "b[i"+i+"]";
  }
  code.push("proto.transpose=function "+className+"_transpose("+args+"){"+
    args.map(function(n,idx) { return n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)"}).join(";"),
    "var a=this.shape,b=this.stride;return new "+className+"(this.data,"+tShape.join(",")+","+tStride.join(",")+",this.offset)}");

  //view.pick():
  code.push("proto.pick=function "+className+"_pick("+args+"){var a=[],b=[],c=this.offset");
  for(var i=0; i<dimension; ++i) {
    code.push("if(typeof i"+i+"==='number'&&i"+i+">=0){c=(c+this.stride["+i+"]*i"+i+")|0}else{a.push(this.shape["+i+"]);b.push(this.stride["+i+"])}");
  }
  code.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}");

  //Add return statement
  code.push("return function construct_"+className+"(data,shape,stride,offset){return new "+className+"(data,"+
    indices.map(function(i) {
      return "shape["+i+"]"
    }).join(",")+","+
    indices.map(function(i) {
      return "stride["+i+"]"
    }).join(",")+",offset)}");

  //Compile procedure
  var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"));
  return procedure(CACHED_CONSTRUCTORS[dtype], order)
}

function arrayDType(data) {
  if(isBuffer$2(data)) {
    return "buffer"
  }
  if(hasTypedArrays) {
    switch(Object.prototype.toString.call(data)) {
      case "[object Float64Array]":
        return "float64"
      case "[object Float32Array]":
        return "float32"
      case "[object Int8Array]":
        return "int8"
      case "[object Int16Array]":
        return "int16"
      case "[object Int32Array]":
        return "int32"
      case "[object Uint8Array]":
        return "uint8"
      case "[object Uint16Array]":
        return "uint16"
      case "[object Uint32Array]":
        return "uint32"
      case "[object Uint8ClampedArray]":
        return "uint8_clamped"
      case "[object BigInt64Array]":
        return "bigint64"
      case "[object BigUint64Array]":
        return "biguint64"
    }
  }
  if(Array.isArray(data)) {
    return "array"
  }
  return "generic"
}

var CACHED_CONSTRUCTORS = {
  "float32":[],
  "float64":[],
  "int8":[],
  "int16":[],
  "int32":[],
  "uint8":[],
  "uint16":[],
  "uint32":[],
  "array":[],
  "uint8_clamped":[],
  "bigint64": [],
  "biguint64": [],
  "buffer":[],
  "generic":[]
}

;
function wrappedNDArrayCtor(data, shape, stride, offset) {
  if(data === undefined) {
    var ctor = CACHED_CONSTRUCTORS.array[0];
    return ctor([])
  } else if(typeof data === "number") {
    data = [data];
  }
  if(shape === undefined) {
    shape = [ data.length ];
  }
  var d = shape.length;
  if(stride === undefined) {
    stride = new Array(d);
    for(var i=d-1, sz=1; i>=0; --i) {
      stride[i] = sz;
      sz *= shape[i];
    }
  }
  if(offset === undefined) {
    offset = 0;
    for(var i=0; i<d; ++i) {
      if(stride[i] < 0) {
        offset -= (shape[i]-1)*stride[i];
      }
    }
  }
  var dtype = arrayDType(data);
  var ctor_list = CACHED_CONSTRUCTORS[dtype];
  while(ctor_list.length <= d+1) {
    ctor_list.push(compileConstructor(dtype, ctor_list.length-1));
  }
  var ctor = ctor_list[d+1];
  return ctor(data, shape, stride, offset)
}

var ndarray$1 = wrappedNDArrayCtor;

var ndarray = /*@__PURE__*/getDefaultExportFromCjs(ndarray$1);

function traceRay_impl( getVoxel,
	px, py, pz,
	dx, dy, dz,
	max_d, hit_pos, hit_norm) {
	
	// consider raycast vector to be parametrized by t
	//   vec = [px,py,pz] + t * [dx,dy,dz]
	
	// algo below is as described by this paper:
	// http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf
	
	var t = 0.0
		, floor = Math.floor
		, ix = floor(px) | 0
		, iy = floor(py) | 0
		, iz = floor(pz) | 0

		, stepx = (dx > 0) ? 1 : -1
		, stepy = (dy > 0) ? 1 : -1
		, stepz = (dz > 0) ? 1 : -1
		
	// dx,dy,dz are already normalized
		, txDelta = Math.abs(1 / dx)
		, tyDelta = Math.abs(1 / dy)
		, tzDelta = Math.abs(1 / dz)

		, xdist = (stepx > 0) ? (ix + 1 - px) : (px - ix)
		, ydist = (stepy > 0) ? (iy + 1 - py) : (py - iy)
		, zdist = (stepz > 0) ? (iz + 1 - pz) : (pz - iz)
		
	// location of nearest voxel boundary, in units of t 
		, txMax = (txDelta < Infinity) ? txDelta * xdist : Infinity
		, tyMax = (tyDelta < Infinity) ? tyDelta * ydist : Infinity
		, tzMax = (tzDelta < Infinity) ? tzDelta * zdist : Infinity

		, steppedIndex = -1;
	
	// main loop along raycast vector
	while (t <= max_d) {
		
		// exit check
		var b = getVoxel(ix, iy, iz);
		if (b) {
			if (hit_pos) {
				hit_pos[0] = px + t * dx;
				hit_pos[1] = py + t * dy;
				hit_pos[2] = pz + t * dz;
			}
			if (hit_norm) {
				hit_norm[0] = hit_norm[1] = hit_norm[2] = 0;
				if (steppedIndex === 0) hit_norm[0] = -stepx;
				if (steppedIndex === 1) hit_norm[1] = -stepy;
				if (steppedIndex === 2) hit_norm[2] = -stepz;
			}
			return b
		}
		
		// advance t to next nearest voxel boundary
		if (txMax < tyMax) {
			if (txMax < tzMax) {
				ix += stepx;
				t = txMax;
				txMax += txDelta;
				steppedIndex = 0;
			} else {
				iz += stepz;
				t = tzMax;
				tzMax += tzDelta;
				steppedIndex = 2;
			}
		} else {
			if (tyMax < tzMax) {
				iy += stepy;
				t = tyMax;
				tyMax += tyDelta;
				steppedIndex = 1;
			} else {
				iz += stepz;
				t = tzMax;
				tzMax += tzDelta;
				steppedIndex = 2;
			}
		}

	}
	
	// no voxel hit found
	if (hit_pos) {
		hit_pos[0] = px + t * dx;
		hit_pos[1] = py + t * dy;
		hit_pos[2] = pz + t * dz;
	}
	if (hit_norm) {
		hit_norm[0] = hit_norm[1] = hit_norm[2] = 0;
	}

	return 0

}


// conform inputs

function traceRay(getVoxel, origin, direction, max_d, hit_pos, hit_norm) {
	var px = +origin[0]
		, py = +origin[1]
		, pz = +origin[2]
		, dx = +direction[0]
		, dy = +direction[1]
		, dz = +direction[2]
		, ds = Math.sqrt(dx * dx + dy * dy + dz * dz);

	if (ds === 0) {
		throw new Error("Can't raycast along a zero vector")
	}

	dx /= ds;
	dy /= ds;
	dz /= ds;
	if (typeof (max_d) === "undefined") {
		max_d = 64.0;
	} else {
		max_d = +max_d;
	}
	return traceRay_impl(getVoxel, px, py, pz, dx, dy, dz, max_d, hit_pos, hit_norm)
}

var fastVoxelRaycast = traceRay;

var raycast = /*@__PURE__*/getDefaultExportFromCjs(fastVoxelRaycast);

var defaultOptions$4 = {
    preventDefaults: false,
    stopPropagation: false,
    allowContextMenu: false,
    disabled: false,
};

var defaultBindings = {
    "forward": ["KeyW", "ArrowUp"],
    "backward": ["KeyS", "ArrowDown"],
    "left": ["KeyA", "ArrowLeft"],
    "right": ["KeyD", "ArrowRight"],
    "fire": ["Mouse1"],
    "mid-fire": ["Mouse2", "KeyQ"],
    "alt-fire": ["Mouse3", "KeyE"],
    "jump": ["Space"],
};

/**
 * Lightweight re-implementation of the `game-inputs` module used earlier by noa.
 * Adds deterministic cleanup so instances can be garbage-collected safely.
 */
class GameInputsLike {

    constructor(domElement, options) {
        var opts = Object.assign({}, defaultOptions$4, options || {});
        this.version = 'noa-inputs';
        this.element = domElement || document;
        this.preventDefaults = !!opts.preventDefaults;
        this.stopPropagation = !!opts.stopPropagation;
        this.allowContextMenu = !!opts.allowContextMenu;
        this.disabled = !!opts.disabled;

        this.filterEvents = (ev, bindingName) => true;

        this.down = new eventsExports.EventEmitter();
        this.up = new eventsExports.EventEmitter();

        this.state = {};
        this.pointerState = {
            dx: 0,
            dy: 0,
            scrollx: 0,
            scrolly: 0,
            scrollz: 0,
        };
        this.pressCount = {};
        this.releaseCount = {};

        this._keyBindmap = {};
        this._keyStates = {};
        this._bindPressCount = {};
        this._touches = { lastX: 0, lastY: 0, currID: null };
        this._pressedDuringMeta = {};
        this._domListeners = [];

        if (document.readyState !== 'loading') {
            initEvents(this);
        } else {
            var onReady = () => initEvents(this);
            this._trackDomListener(document, 'DOMContentLoaded', onReady, { once: true });
        }
    }

    bind(bindingName, ...keys) {
        keys.forEach(code => {
            var bindings = this._keyBindmap[code] || [];
            if (bindings.includes(bindingName)) return
            bindings.push(bindingName);
            this._keyBindmap[code] = bindings;
        });
        this.state[bindingName] = !!this.state[bindingName];
        this.pressCount[bindingName] = this.pressCount[bindingName] || 0;
        this.releaseCount[bindingName] = this.releaseCount[bindingName] || 0;
    }

    unbind(bindingName) {
        for (var code in this._keyBindmap) {
            var bindings = this._keyBindmap[code];
            var i = bindings.indexOf(bindingName);
            if (i > -1) bindings.splice(i, 1);
        }
    }

    getBindings() {
        var res = {};
        for (var code in this._keyBindmap) {
            var bindings = this._keyBindmap[code];
            bindings.forEach(bindingName => {
                res[bindingName] = res[bindingName] || [];
                res[bindingName].push(code);
            });
        }
        return res
    }

    tick() {
        zeroAllProperties(this.pointerState);
        zeroAllProperties(this.pressCount);
        zeroAllProperties(this.releaseCount);
    }

    dispose() {
        while (this._domListeners.length) {
            var entry = this._domListeners.pop();
            entry.target.removeEventListener(entry.type, entry.handler, entry.options);
        }
        this.down.removeAllListeners();
        this.up.removeAllListeners();
        this.element = null;
    }

    _trackDomListener(target, type, handler, options) {
        target.addEventListener(type, handler, options);
        this._domListeners.push({ target, type, handler, options });
    }
}

class Inputs extends GameInputsLike {
    constructor(noa, opts = {}, element) {
        super(element, opts);
        var bindings = cloneBindings(opts.bindings || defaultBindings);
        for (var name in bindings) {
            this.bind(name, ...bindings[name]);
        }
    }
}

function cloneBindings(map) {
    var res = {};
    for (var name in map) {
        var val = map[name];
        if (Array.isArray(val)) res[name] = val.slice();
        else res[name] = [val];
    }
    return res
}

function zeroAllProperties(obj) {
    for (var key in obj) obj[key] = 0;
}

function initEvents(inputs) {
    var keyDown = onKeyEvent.bind(null, inputs, true);
    var keyUp = onKeyEvent.bind(null, inputs, false);
    inputs._trackDomListener(window, 'keydown', keyDown, false);
    inputs._trackDomListener(window, 'keyup', keyUp, false);

    var pointerOpts = { passive: true };
    if (window.PointerEvent) {
        var down = onPointerEvent.bind(null, inputs, true);
        var up = onPointerEvent.bind(null, inputs, false);
        var move = onPointerMove.bind(null, inputs);
        inputs._trackDomListener(inputs.element, 'pointerdown', down, pointerOpts);
        inputs._trackDomListener(window.document, 'pointerup', up, pointerOpts);
        inputs._trackDomListener(inputs.element, 'pointermove', move, pointerOpts);
    } else {
        var mDown = onPointerEvent.bind(null, inputs, true);
        var mUp = onPointerEvent.bind(null, inputs, false);
        var mMove = onPointerMove.bind(null, inputs);
        inputs._trackDomListener(inputs.element, 'mousedown', mDown, pointerOpts);
        inputs._trackDomListener(window.document, 'mouseup', mUp, pointerOpts);
        inputs._trackDomListener(inputs.element, 'mousemove', mMove, pointerOpts);
    }
    inputs._trackDomListener(inputs.element, 'wheel', onWheelEvent.bind(null, inputs), pointerOpts);
    inputs._trackDomListener(inputs.element, 'contextmenu', onContextMenu.bind(null, inputs), false);

    inputs._trackDomListener(window, 'blur', onWindowBlur.bind(null, inputs), false);
}

function onKeyEvent(inputs, nowDown, ev) {
    handleKeyEvent(ev.code, nowDown, inputs, ev);
    workaroundMacBug(nowDown, inputs, ev);
}

function onPointerEvent(inputs, nowDown, ev) {
    if ('pointerId' in ev) {
        if (nowDown) {
            if (inputs._touches.currID !== null) return
            inputs._touches.currID = ev.pointerId;
        } else {
            if (inputs._touches.currID !== ev.pointerId) return
            inputs._touches.currID = null;
        }
    }
    var button = ('button' in ev) ? (ev.button + 1) : 1;
    handleKeyEvent('Mouse' + button, nowDown, inputs, ev);
    return false
}

function onPointerMove(inputs, ev) {
    if ('pointerId' in ev && inputs._touches.currID !== null) {
        if (inputs._touches.currID !== ev.pointerId) return
    }
    var dx = ev.movementX || ev.mozMovementX || 0;
    var dy = ev.movementY || ev.mozMovementY || 0;
    inputs.pointerState.dx += dx;
    inputs.pointerState.dy += dy;
}

function onWheelEvent(inputs, ev) {
    var scale = 1;
    switch (ev.deltaMode) {
        case 0: scale = 1; break
        case 1: scale = 12; break
        case 2:
            scale = inputs.element.clientHeight || window.innerHeight;
            break
    }
    inputs.pointerState.scrollx += (ev.deltaX || 0) * scale;
    inputs.pointerState.scrolly += (ev.deltaY || 0) * scale;
    inputs.pointerState.scrollz += (ev.deltaZ || 0) * scale;
}

function onContextMenu(inputs, ev) {
    if (!inputs.allowContextMenu) {
        ev.preventDefault();
        return false
    }
}

function onWindowBlur(inputs) {
    for (var code in inputs._keyStates) {
        if (!inputs._keyStates[code]) continue
        if (/^Mouse\d/.test(code)) continue
        handleKeyEvent(code, false, inputs, {
            code: code,
            note: `This is a mocked KeyboardEvent made by the 'noa-inputs' module`,
            preventDefault: () => { },
            stopPropagation: () => { },
        });
    }
}

function handleKeyEvent(code, nowDown, inputs, ev) {
    var bindings = inputs._keyBindmap[code];
    if (!bindings) return

    var prevState = inputs._keyStates[code];
    if (XOR(prevState, nowDown)) {
        inputs._keyStates[code] = nowDown;
        bindings.forEach(bindingName => {
            var allow = (inputs.filterEvents) ? inputs.filterEvents(ev, bindingName) : true;
            if (!allow) return
            handleBindingEvent(bindingName, nowDown, inputs, ev);
        });
    }

    if (!('button' in ev)) {
        if (inputs.preventDefaults && !ev.defaultPrevented) ev.preventDefault();
        if (inputs.stopPropagation) ev.stopPropagation();
    }
}

function handleBindingEvent(bindingName, pressed, inputs, ev) {
    var counter = (pressed) ? inputs.pressCount : inputs.releaseCount;
    counter[bindingName] = (counter[bindingName] || 0) + 1;
    var ct = inputs._bindPressCount[bindingName] || 0;
    ct += pressed ? 1 : -1;
    if (ct < 0) ct = 0;
    inputs._bindPressCount[bindingName] = ct;

    var currstate = inputs.state[bindingName];
    if (XOR(currstate, ct)) {
        inputs.state[bindingName] = (ct > 0);
        var emitter = pressed ? inputs.down : inputs.up;
        if (!inputs.disabled) emitter.emit(bindingName, ev);
    }
}

function XOR(a, b) {
    return a ? !b : b
}

function workaroundMacBug(down, inputs, ev) {
    var isMeta = /^Meta/.test(ev.code);
    if (ev.metaKey && !isMeta && down) {
        inputs._pressedDuringMeta[ev.code] = true;
    } else if (isMeta && !down) {
        for (var code in inputs._pressedDuringMeta) {
            if (!inputs._keyStates[code]) continue
            if (/^Mouse\d/.test(code)) continue
            handleKeyEvent(code, false, inputs, {
                code: code,
                note: `This is a mocked KeyboardEvent made by the 'noa-inputs' module`,
                preventDefault: () => { },
                stopPropagation: () => { },
            });
        }
        inputs._pressedDuringMeta = {};
    }
}

/*
 * 
 * 
 *      base class and API
 * 
 * 
*/

class MicroGameShell {

    constructor(domElement = null, pollTime = 10) {

        /** When true, the shell will try to acquire pointerlock on click events */
        this.stickyPointerLock = false;
        /** When true, the shell will try to acquire fullscreen on click events */
        this.stickyFullscreen = false;

        /** Desired tick events per second */
        this.tickRate = 30;
        /** Upper limit for render events per second - `0` means uncapped */
        this.maxRenderRate = 0;
        /** Max time spent issuing tick events when behind schedule. If the shell spends this long on tick events, it will discard all pending ticks to catch up. */
        this.maxTickTime = 100;


        /** Check or set whether the DOM element has pointerlock */
        this.pointerLock = false;
        /** Check or set whether the DOM element has fullscreen */
        this.fullscreen = false;

        /**
         * Tick event handler.
         * @param {number} dt: tick duration (ms) - this is a fixed value based on the tick rate, not the observed time elapsed
         */
        this.onTick = function (dt) { };

        /**
         * Render event handler.
         * @param {number} dt: elapsed time (ms) since previous render event
         * @param {number} framePart: fraction (0..1) corresponding to how much of the current tick has elapsed
         * @param {number} tickDur: tick duration (ms)
         */
        this.onRender = function (dt, framePart, tickDur) { };


        /** This event fires once after shell initializes. */
        this.onInit = function () { };
        /** This event fires when the domElement's window resizes */
        this.onResize = function () { };
        /** This event fires when pointerlock is gained or lost */
        this.onPointerLockChanged = function (hasPL = false) { };
        /** This event fires when fullscreen is gained or lost */
        this.onFullscreenChanged = function (hasFS = false) { };
        /** This event fires when a pointerLock error occurs */
        this.onPointerLockError = function (err) { };



        // hide internals in a data object
        this._data = new Data(pollTime);

        // init
        domReady(() => {
            setupTimers(this);
            setupDomElement(this, domElement);
            this.onInit();
        });
    }
}


// internal data structure
function Data(pollTime = 10) {
    this.nowObject = performance || Date;
    this.pollTime = pollTime;
    this.renderAccum = 0;
    this.lastTickStarted = 0;
    this.lastFrameStarted = 0;
    this.lastRenderStarted = 0;
    this.avgTickTime = 2;
    this.frameCB = null;
    this.intervalCB = null;
    this.intervalID = -1;
}







/*
 * 
 *      tick- and render events
 * 
*/

/** @param {MicroGameShell} shell */
function setupTimers(shell) {
    var dat = shell._data;
    var now = dat.nowObject.now();
    dat.lastTickStarted = now;
    dat.lastFrameStarted = now;
    dat.lastRenderStarted = now;

    dat.frameCB = () => frameHandler(shell);
    dat.intervalCB = () => intervalHandler(shell);
    requestAnimationFrame(dat.frameCB);

    if (dat.pollTime > 0) {
        dat.intervalID = setInterval(dat.intervalCB, dat.pollTime);
    }
}




/** 
 * RAF handler - triggers render events
 * @param {MicroGameShell} shell
*/
function frameHandler(shell) {
    var dat = shell._data;
    requestAnimationFrame(dat.frameCB);
    // first catch up on ticks if we're behind schedule
    intervalHandler(shell);
    // now decide whether to do a render, if rate is capped
    var now = dat.nowObject.now();
    var dt = now - dat.lastFrameStarted;
    dat.lastFrameStarted = now;
    if (shell.maxRenderRate > 0) {
        dat.renderAccum += dt;
        var frameDur = 1000 / shell.maxRenderRate;
        if (dat.renderAccum < frameDur) return
        dat.renderAccum -= frameDur;
        // don't save up more than one pending frame
        if (dat.renderAccum > frameDur) dat.renderAccum = frameDur;
    }
    // issue the render event
    var renderDt = now - dat.lastRenderStarted;
    dat.lastRenderStarted = now;
    var tickDur = 1000 / shell.tickRate;
    var framePart = (now - dat.lastTickStarted) / tickDur;
    if (framePart < 0) framePart = 0;

    // issue render, and optimistically schedule lookahead interval handler
    shell.onRender(renderDt, framePart, tickDur);
    setTimeout(intervalHandler, 0, shell, true);
}




/** 
 * setInterval handler - triggers tick events
 * @param {MicroGameShell} shell
*/
function intervalHandler(shell, lookAhead = false) {
    var dat = shell._data;
    var now = dat.nowObject.now();
    // decide base and cutoff times until which we issue ticks
    var tickUntil = now;
    if (lookAhead) tickUntil += dat.avgTickTime;
    var cutoffTime = now + shell.maxTickTime;
    if (!(cutoffTime > now)) cutoffTime = now + 1;
    var tickDur = 1000 / shell.tickRate;

    // issue ticks until we're up to date or out of time
    while (dat.lastTickStarted + tickDur < tickUntil) {
        shell.onTick(tickDur);
        dat.lastTickStarted += tickDur;
        var after = dat.nowObject.now();
        dat.avgTickTime = runningAverage(dat.avgTickTime, after - now);

        // and track the approx processing time, and close loop
        now = after;
        if (now > cutoffTime) {
            dat.lastTickStarted = now;
            return
        }
    }
}







/*
 * 
 *      DOM element and sticky fullscreen/pointerlock
 * 
*/

function setupDomElement(shell, el) {
    if (!el) return
    var hasPL = false;
    var hasFS = false;

    var setPL = (want) => {
        hasPL = (el === document.pointerLockElement);
        if (!!want === hasPL) return
        if (want) {
            // chrome returns a promise here, others don't
            var res = el.requestPointerLock();
            if (res && res.catch) res.catch(err => {
                // error already handled in `pointerlockerror`
            });
        } else {
            document.exitPointerLock();
        }
    };
    var setFS = (want) => {
        hasFS = (el === document.fullscreenElement);
        if (!!want === hasFS) return
        if (want) {
            if (el.requestFullscreen) {
                el.requestFullscreen();
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document['webkitExitFullscreen']) {
                document['webkitExitFullscreen']();
            }
        }
    };

    // track whether we actually have PL/FS, and send events
    document.addEventListener('pointerlockchange', ev => {
        hasPL = (el === document.pointerLockElement);
        shell.onPointerLockChanged(hasPL);
    });
    document.addEventListener('fullscreenchange', ev => {
        hasFS = (el === document.fullscreenElement);
        shell.onFullscreenChanged(hasFS);
    });
    document.addEventListener('pointerlockerror', err => {
        hasPL = (el === document.pointerLockElement);
        shell.onPointerLockError(err);
    });


    // decorate shell with getter/setters that request FS/PL
    Object.defineProperty(shell, 'pointerLock', {
        get: () => hasPL,
        set: setPL,
    });
    Object.defineProperty(shell, 'fullscreen', {
        get: () => hasFS,
        set: setFS,
    });


    // stickiness via click handler
    el.addEventListener('click', ev => {
        if (shell.stickyPointerLock) setPL(true);
        if (shell.stickyFullscreen) setFS(true);
    });


    // resize events via ResizeObserver
    var resizeHandler = () => shell.onResize();
    if (window.ResizeObserver) {
        var observer = new ResizeObserver(resizeHandler);
        observer.observe(el);
    } else {
        window.addEventListener('resize', resizeHandler);
    }
}





/*
 * 
 *      util 
 * 
*/

function runningAverage(avg, newVal) {
    // squash effects of large one-off spikes
    if (newVal > avg * 4) newVal = avg * 4;
    if (newVal < avg * 0.25) newVal = avg * 0.25;
    return 0.9 * avg + 0.1 * newVal
}

function domReady(fn) {
    if (document.readyState === 'loading') {
        var handler = () => {
            document.removeEventListener('readystatechange', handler);
            fn();
        };
        document.addEventListener('readystatechange', handler);
    } else {
        setTimeout(fn, 0);
    }
}

/**
 * @typedef {{ overflow: string, height: string }} BodyStyleBackup
 * @typedef {HTMLDivElement & { __noaBodyStyleBackup?: BodyStyleBackup }} NoaContainerElement
 */





/**
 * `noa.container` - manages the game's HTML container element, canvas, 
 * fullscreen, pointerLock, and so on.
 * 
 * This module wraps `micro-game-shell`, which does most of the implementation.
 * 
 * **Events**
 *  + `DOMready => ()`  
 *    Relays the browser DOMready event, after noa does some initialization
 *  + `gainedPointerLock => ()`  
 *    Fires when the game container gains pointerlock.
 *  + `lostPointerLock => ()`  
 *    Fires when the game container loses pointerlock.
 */

class Container extends eventsExports.EventEmitter {

    /** @internal */
    constructor(noa, opts) {
        super();
        opts = opts || {};

        /** 
         * @internal
         * @type {import('../index').Engine}
        */
        this.noa = noa;

        this._trackedListeners = [];
        this._ownsElement = false;
        this._disposed = false;

        /** The game's DOM element container */
        var domEl = opts.domElement || null;
        if (typeof domEl === 'string') {
            domEl = document.querySelector(domEl);
        }
        if (!domEl) {
            domEl = createContainerDiv();
            this._ownsElement = true;
        }
        this.element = domEl;

        /** The `canvas` element that the game will draw into */
        this.canvas = getOrCreateCanvas(this.element);
        doCanvasBugfix(noa, this.canvas); // grumble...


        // internal backing fields for readonly accessors
        this._supportsPointerLock = false;
        this._pointerInGame = false;
        this._isFocused = !!document.hasFocus();
        this._hasPointerLock = false;



        // shell manages tick/render rates, and pointerlock/fullscreen
        var pollTime = 10;
        /** @internal */
        this._shell = new MicroGameShell(this.element, pollTime);
        this._shell.tickRate = opts.tickRate;
        this._shell.maxRenderRate = opts.maxRenderRate;
        this._shell.stickyPointerLock = opts.stickyPointerLock;
        this._shell.stickyFullscreen = opts.stickyFullscreen;
        this._shell.maxTickTime = 50;



        // core timing events
        this._shell.onTick = noa.tick.bind(noa);
        this._shell.onRender = noa.render.bind(noa);

        // shell listeners
        this._shell.onPointerLockChanged = (hasPL) => {
            this._hasPointerLock = hasPL;
            this.emit((hasPL) ? 'gainedPointerLock' : 'lostPointerLock');
            // this works around a Firefox bug where no mouse-in event 
            // gets issued after starting pointerlock
            if (hasPL) this._pointerInGame = true;
        };

        // catch and relay domReady event
        this._shell.onInit = () => {
            this._shell.onResize = noa.rendering.resize.bind(noa.rendering);
            // listeners to track when game has focus / pointer
            detectPointerLock(this);
            trackListener(this, this.element, 'mouseenter', () => { this._pointerInGame = true; });
            trackListener(this, this.element, 'mouseleave', () => { this._pointerInGame = false; });
            trackListener(this, window, 'focus', () => { this._isFocused = true; });
            trackListener(this, window, 'blur', () => { this._isFocused = false; });
            // catch edge cases for initial states
            var onFirstMousedown = () => {
                this._pointerInGame = true;
                this._isFocused = true;
            };
            trackListener(this, this.element, 'mousedown', onFirstMousedown, { once: true });
            // emit for engine core
            this.emit('DOMready');
            // done and remove listener
            this._shell.onInit = null;
        };
    }

    /** Whether the browser supports pointerLock. @readonly */
    get supportsPointerLock() { return this._supportsPointerLock }

    /** Whether the user's pointer is within the game area. @readonly */
    get pointerInGame() { return this._pointerInGame }

    /** Whether the game is focused. @readonly */
    get isFocused() { return this._isFocused }

    /** Gets the current state of pointerLock. @readonly */
    get hasPointerLock() { return this._hasPointerLock }


    /*
     *
     *
     *              PUBLIC API 
     *
     *
    */

    /** @internal */
    appendTo(htmlElement) {
        this.element.appendChild(htmlElement);
    }

    /** 
     * Sets whether `noa` should try to acquire or release pointerLock
    */
    setPointerLock(lock = false) {
        // not sure if this will work robustly
        this._shell.pointerLock = !!lock;
    }

    dispose() {
        if (this._disposed) return
        this._disposed = true;
        // disable shell callbacks and timers
        if (this._shell) {
            this._shell.onTick = () => { };
            this._shell.onRender = () => { };
            this._shell.onInit = null;
            this._shell.onResize = null;
            if (this._shell._data && this._shell._data.intervalID >= 0) {
                clearInterval(this._shell._data.intervalID);
                this._shell._data.intervalID = -1;
            }
        }
        while (this._trackedListeners.length) {
            var remove = this._trackedListeners.pop();
            remove();
        }
        if (this._ownsElement && this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
            restoreBodyStyles(/** @type {NoaContainerElement} */ (this.element));
        }
        this.canvas = null;
        this.element = null;
    }
}



/*
 *
 *
 *              INTERNALS
 *
 *
*/


function createContainerDiv() {
    // based on github.com/mikolalysenko/game-shell - makeDefaultContainer()
    /** @type {NoaContainerElement} */
    var container = document.createElement("div");
    container.tabIndex = 1;
    container.style.position = "fixed";
    container.style.left = "0px";
    container.style.right = "0px";
    container.style.top = "0px";
    container.style.bottom = "0px";
    container.style.height = "100%";
    container.style.overflow = "hidden";
    var body = document.body;
    container.__noaBodyStyleBackup = {
        overflow: body.style.overflow || '',
        height: body.style.height || '',
    };
    document.body.appendChild(container);
    document.body.style.overflow = "hidden"; //Prevent bounce
    document.body.style.height = "100%";
    container.id = 'noa-container';
    return container
}


function getOrCreateCanvas(el) {
    // based on github.com/stackgl/gl-now - default canvas
    var canvas = el.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.style.position = "absolute";
        canvas.style.left = "0px";
        canvas.style.top = "0px";
        canvas.style.height = "100%";
        canvas.style.width = "100%";
        canvas.id = 'noa-canvas';
        el.insertBefore(canvas, el.firstChild);
    }
    return canvas
}


// set up stuff to detect pointer lock support.
// Needlessly complex because Chrome/Android claims to support but doesn't.
// For now, just feature detect, but assume no support if a touch event occurs
// TODO: see if this makes sense on hybrid touch/mouse devices
function detectPointerLock(self) {
    var lockElementExists =
        ('pointerLockElement' in document) ||
        ('mozPointerLockElement' in document) ||
        ('webkitPointerLockElement' in document);
    if (lockElementExists) {
        self._supportsPointerLock = true;
        var activeTouches = 0;
        var update = () => {
            self._supportsPointerLock = lockElementExists && activeTouches === 0;
        };
        trackListener(self, window, 'touchstart', () => {
            activeTouches++;
            update();
        }, { passive: true });
        var onTouchEnd = () => {
            if (activeTouches > 0) activeTouches--;
            update();
        };
        trackListener(self, window, 'touchend', onTouchEnd, { passive: true });
        trackListener(self, window, 'touchcancel', onTouchEnd, { passive: true });
    }
}


/**
 * This works around a weird bug that seems to be chrome/mac only?
 * Without this, the page sometimes initializes with the canva
 * zoomed into its lower left quadrant. 
 * Resizing the canvas fixes the issue (also: resizing page, changing zoom...)
 */
function doCanvasBugfix(noa, canvas) {
    var ct = 0;
    var fixCanvas = () => {
        var w = canvas.width;
        canvas.width = w + 1;
        canvas.width = w;
        if (ct++ > 10) noa.off('beforeRender', fixCanvas);
    };
    noa.on('beforeRender', fixCanvas);
}

function trackListener(self, target, type, handler, options) {
    target.addEventListener(type, handler, options);
    self._trackedListeners.push(() => target.removeEventListener(type, handler, options));
}

/**
 * @param {NoaContainerElement | null} container
 */
function restoreBodyStyles(container) {
    var prev = container && container.__noaBodyStyleBackup;
    if (!prev) return
    if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = prev.overflow;
    }
    if (document.body.style.height === '100%') {
        document.body.style.height = prev.height;
    }
}

/**
 * Common utilities
 * @module glMatrix
 */

var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
function create() {
  var out = new ARRAY_TYPE(3);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {ReadonlyVec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
function clone(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

/**
 * Calculates the length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the source vector
 * @returns {vec3} out
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
(function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 3;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }
    return a;
  };
})();

class AABB {
    base;
    vec;
    max;
    mag;
    constructor(pos, vec) {
        const pos2 = create();
        add(pos2, pos, vec);
        this.base = min(create(), pos, pos2);
        this.vec = clone(vec);
        this.max = max(create(), pos, pos2);
        this.mag = length(this.vec);
    }
    width() {
        return this.vec[0];
    }
    height() {
        return this.vec[1];
    }
    depth() {
        return this.vec[2];
    }
    x0() {
        return this.base[0];
    }
    y0() {
        return this.base[1];
    }
    z0() {
        return this.base[2];
    }
    x1() {
        return this.max[0];
    }
    y1() {
        return this.max[1];
    }
    z1() {
        return this.max[2];
    }
    /**
     * Moves the box. Returns itself.
     */
    translate(by) {
        add(this.max, this.max, by);
        add(this.base, this.base, by);
        return this;
    }
    setPosition(pos) {
        add(this.max, pos, this.vec);
        copy(this.base, pos);
        return this;
    }
    /**
     * Returns a new `aabb` that surrounds both `aabb`'s.
     */
    expand(aabb) {
        const max$1 = create();
        const min$1 = create();
        max(max$1, aabb.max, this.max);
        min(min$1, aabb.base, this.base);
        subtract(max$1, max$1, min$1);
        return new AABB(min$1, max$1);
    }
    /**
     * Returns `true` if the two bounding boxes intersect (or touch at all.)
     */
    intersects(aabb) {
        if (aabb.base[0] > this.max[0])
            return false;
        if (aabb.base[1] > this.max[1])
            return false;
        if (aabb.base[2] > this.max[2])
            return false;
        if (aabb.max[0] < this.base[0])
            return false;
        if (aabb.max[1] < this.base[1])
            return false;
        if (aabb.max[2] < this.base[2])
            return false;
        return true;
    }
    touches(aabb) {
        const intersection = this.union(aabb);
        return (intersection !== null) &&
            ((intersection.width() == 0) ||
                (intersection.height() == 0) ||
                (intersection.depth() == 0));
    }
    /**
     * Returns a new `aabb` representing the shared area of the
     * two `aabb`'s. returns `null` if the boxes don't intersect.
     */
    union(aabb) {
        if (!this.intersects(aabb))
            return null;
        const base_x = Math.max(aabb.base[0], this.base[0]);
        const base_y = Math.max(aabb.base[1], this.base[1]);
        const base_z = Math.max(aabb.base[2], this.base[2]);
        const max_x = Math.min(aabb.max[0], this.max[0]);
        const max_y = Math.min(aabb.max[1], this.max[1]);
        const max_z = Math.min(aabb.max[2], this.max[2]);
        return new AABB([base_x, base_y, base_z], [max_x - base_x, max_y - base_y, max_z - base_z]);
    }
}

// reused array instances

var tr_arr = [];
var ldi_arr = [];
var tri_arr = [];
var step_arr = [];
var tDelta_arr = [];
var tNext_arr = [];
var vec_arr = [];
var normed_arr = [];
var base_arr = [];
var max_arr = [];
var left_arr = [];
var result_arr = [];



// core implementation:

function sweep_impl(getVoxel, callback, vec, base, max, epsilon) {

    // consider algo as a raycast along the AABB's leading corner
    // as raycast enters each new voxel, iterate in 2D over the AABB's 
    // leading face in that axis looking for collisions
    // 
    // original raycast implementation: https://github.com/andyhall/fast-voxel-raycast
    // original raycast paper: http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf

    var tr = tr_arr;
    var ldi = ldi_arr;
    var tri = tri_arr;
    var step = step_arr;
    var tDelta = tDelta_arr;
    var tNext = tNext_arr;
    var normed = normed_arr;

    var floor = Math.floor;
    var cumulative_t = 0.0;
    var t = 0.0;
    var max_t = 0.0;
    var axis = 0;
    var i = 0;


    // init for the current sweep vector and take first step
    initSweep();
    if (max_t === 0) return 0

    axis = stepForward();

    // loop along raycast vector
    while (t <= max_t) {

        // sweeps over leading face of AABB
        if (checkCollision(axis)) {
            // calls the callback and decides whether to continue
            var done = handleCollision();
            if (done) return cumulative_t
        }

        axis = stepForward();
    }

    // reached the end of the vector unobstructed, finish and exit
    cumulative_t += max_t;
    for (i = 0; i < 3; i++) {
        base[i] += vec[i];
        max[i] += vec[i];
    }
    return cumulative_t





    // low-level implementations of each step:
    function initSweep() {

        // parametrization t along raycast
        t = 0.0;
        max_t = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
        if (max_t === 0) return
        for (var i = 0; i < 3; i++) {
            var dir = (vec[i] >= 0);
            step[i] = dir ? 1 : -1;
            // trailing / trailing edge coords
            var lead = dir ? max[i] : base[i];
            tr[i] = dir ? base[i] : max[i];
            // int values of lead/trail edges
            ldi[i] = leadEdgeToInt(lead, step[i]);
            tri[i] = trailEdgeToInt(tr[i], step[i]);
            // normed vector
            normed[i] = vec[i] / max_t;
            // distance along t required to move one voxel in each axis
            tDelta[i] = Math.abs(1 / normed[i]);
            // location of nearest voxel boundary, in units of t 
            var dist = dir ? (ldi[i] + 1 - lead) : (lead - ldi[i]);
            tNext[i] = (tDelta[i] < Infinity) ? tDelta[i] * dist : Infinity;
        }

    }


    // check for collisions - iterate over the leading face on the advancing axis

    function checkCollision(i_axis) {
        var stepx = step[0];
        var x0 = (i_axis === 0) ? ldi[0] : tri[0];
        var x1 = ldi[0] + stepx;

        var stepy = step[1];
        var y0 = (i_axis === 1) ? ldi[1] : tri[1];
        var y1 = ldi[1] + stepy;

        var stepz = step[2];
        var z0 = (i_axis === 2) ? ldi[2] : tri[2];
        var z1 = ldi[2] + stepz;

        // var j_axis = (i_axis + 1) % 3
        // var k_axis = (i_axis + 2) % 3
        // var s = ['x', 'y', 'z'][i_axis]
        // var js = ['x', 'y', 'z'][j_axis]
        // var ks = ['x', 'y', 'z'][k_axis]
        // var i0 = [x0, y0, z0][i_axis]
        // var j0 = [x0, y0, z0][j_axis]
        // var k0 = [x0, y0, z0][k_axis]
        // var i1 = [x1 - stepx, y1 - stepy, z1 - stepz][i_axis]
        // var j1 = [x1 - stepx, y1 - stepy, z1 - stepz][j_axis]
        // var k1 = [x1 - stepx, y1 - stepy, z1 - stepz][k_axis]
        // console.log('=== step', s, 'to', i0, '   sweep', js, j0 + ',' + j1, '   ', ks, k0 + ',' + k1)

        for (var x = x0; x != x1; x += stepx) {
            for (var y = y0; y != y1; y += stepy) {
                for (var z = z0; z != z1; z += stepz) {
                    if (getVoxel(x, y, z)) return true
                }
            }
        }
        return false
    }


    // on collision - call the callback and return or set up for the next sweep

    function handleCollision() {

        // set up for callback
        cumulative_t += t;
        var dir = step[axis];

        // vector moved so far, and left to move
        var done = t / max_t;
        var left = left_arr;
        for (i = 0; i < 3; i++) {
            var dv = vec[i] * done;
            base[i] += dv;
            max[i] += dv;
            left[i] = vec[i] - dv;
        }

        // set leading edge of stepped axis exactly to voxel boundary
        // else we'll sometimes rounding error beyond it
        if (dir > 0) {
            max[axis] = Math.round(max[axis]);
        } else {
            base[axis] = Math.round(base[axis]);
        }
        
        // call back to let client update the "left to go" vector
        var res = callback(cumulative_t, axis, dir, left);

        // bail out out on truthy response
        if (res) return true

        // init for new sweep along vec
        for (i = 0; i < 3; i++) vec[i] = left[i];
        initSweep();
        if (max_t === 0) return true // no vector left

        return false
    }


    // advance to next voxel boundary, and return which axis was stepped

    function stepForward() {
        var axis = (tNext[0] < tNext[1]) ?
            ((tNext[0] < tNext[2]) ? 0 : 2) :
            ((tNext[1] < tNext[2]) ? 1 : 2);
        var dt = tNext[axis] - t;
        t = tNext[axis];
        ldi[axis] += step[axis];
        tNext[axis] += tDelta[axis];
        for (i = 0; i < 3; i++) {
            tr[i] += dt * normed[i];
            tri[i] = trailEdgeToInt(tr[i], step[i]);
        }

        return axis
    }



    function leadEdgeToInt(coord, step) {
        return floor(coord - step * epsilon)
    }
    function trailEdgeToInt(coord, step) {
        return floor(coord + step * epsilon)
    }

}





// conform inputs

function sweep$4(getVoxel, box, dir, callback, noTranslate, epsilon) {

    var vec = vec_arr;
    var base = base_arr;
    var max = max_arr;
    var result = result_arr;

    // init parameter float arrays
    for (var i = 0; i < 3; i++) {
        vec[i] = +dir[i];
        max[i] = +box.max[i];
        base[i] = +box.base[i];
    }

    if (!epsilon) epsilon = 1e-10;

    // run sweep implementation
    var dist = sweep_impl(getVoxel, callback, vec, base, max, epsilon);

    // translate box by distance needed to updated base value
    if (!noTranslate) {
        for (i = 0; i < 3; i++) {
            result[i] = (dir[i] > 0) ? max[i] - box.max[i] : base[i] - box.base[i];
        }
        box.translate(result);
    }

    // return value is total distance moved (not necessarily magnitude of [end]-[start])
    return dist
}

var voxelAabbSweep = sweep$4;

var sweep$3 = /*@__PURE__*/getDefaultExportFromCjs(voxelAabbSweep);

// default options
function CameraDefaults() {
    this.inverseX = false;
    this.inverseY = false;
    this.sensitivityMult = 1;
    this.sensitivityMultOutsidePointerlock = 0;
    this.sensitivityX = 10;
    this.sensitivityY = 10;
    this.initialZoom = 0;
    this.zoomSpeed = 0.2;
    this.dragCameraOutsidePointerlock = false;
}


// locals
var tempVectors = [
    glVec3.create(),
    glVec3.create(),
    glVec3.create(),
];
var originVector = glVec3.create();


/**
 * `noa.camera` - manages the camera, its position and direction, 
 * mouse sensitivity, and so on.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * ```js
 * var defaults = {
 *     inverseX: false,
 *     inverseY: false,
 *     sensitivityX: 10,
 *     sensitivityY: 10,
 *     initialZoom: 0,
 *     zoomSpeed: 0.2,
 * }
 * ```
*/

class Camera {

    /** 
     * @internal 
     * @param {import('../index').Engine} noa
     * @param {Partial.<CameraDefaults>} opts
    */
    constructor(noa, opts) {
        opts = Object.assign({}, new CameraDefaults, opts);
        this.noa = noa;

        /** Horizontal mouse sensitivity. Same scale as Overwatch (typical values around `5..10`) */
        this.sensitivityX = +opts.sensitivityX;

        /** Vertical mouse sensitivity. Same scale as Overwatch (typical values around `5..10`) */
        this.sensitivityY = +opts.sensitivityY;

        /** Mouse look inverse (horizontal) */
        this.inverseX = !!opts.inverseX;

        /** Mouse look inverse (vertical) */
        this.inverseY = !!opts.inverseY;

        /** 
         * Multiplier for temporarily altering mouse sensitivity.
         * Set this to `0` to temporarily disable camera controls.
        */
        this.sensitivityMult = opts.sensitivityMult;

        /** 
         * Multiplier for altering mouse sensitivity when pointerlock
         * is not active - default of `0` means no camera movement.
         * Note this setting is ignored if pointerLock isn't supported.
         */
        this.sensitivityMultOutsidePointerlock = opts.sensitivityMultOutsidePointerlock;

        /** Allow the camera to drag when pointerlock is unavailable */
        this.dragCameraOutsidePointerlock = !!opts.dragCameraOutsidePointerlock;

        /** 
         * Camera yaw angle. 
         * Returns the camera's rotation angle around the vertical axis. 
         * Range: `0..2π`  
         * This value is writeable, but it's managed by the engine and 
         * will be overwritten each frame.
        */
        this.heading = 0;

        /** Camera pitch angle. 
         * Returns the camera's up/down rotation angle. The pitch angle is 
         * clamped by a small epsilon, such that the camera never quite 
         * points perfectly up or down.  
         * Range: `-π/2..π/2`.  
         * This value is writeable, but it's managed by the engine and 
         * will be overwritten each frame.
        */
        this.pitch = 0;

        /** 
         * Entity ID of a special entity that exists for the camera to point at.
         * 
         * By default this entity follows the player entity, so you can 
         * change the player's eye height by changing the `follow` component's offset:
         * ```js
         * var followState = noa.ents.getState(noa.camera.cameraTarget, 'followsEntity')
         * followState.offset[1] = 0.9 * myPlayerHeight
         * ```
         * 
         * For customized camera controls you can change the follow 
         * target to some other entity, or override the behavior entirely:
         * ```js
         * // make cameraTarget stop following the player
         * noa.ents.removeComponent(noa.camera.cameraTarget, 'followsEntity')
         * // control cameraTarget position directly (or whatever..)
         * noa.ents.setPosition(noa.camera.cameraTarget, [x,y,z])
         * ```
        */
        this.cameraTarget = this.noa.ents.createEntity(['position']);

        // make the camera follow the cameraTarget entity
        var eyeOffset = 0.9 * noa.ents.getPositionData(noa.playerEntity).height;
        noa.ents.addComponent(this.cameraTarget, 'followsEntity', {
            entity: noa.playerEntity,
            offset: [0, eyeOffset, 0],
        });

        /** How far back the camera should be from the player's eye position */
        this.zoomDistance = opts.initialZoom;

        /** How quickly the camera moves to its `zoomDistance` (0..1) */
        this.zoomSpeed = opts.zoomSpeed;

        /** Current actual zoom distance. This differs from `zoomDistance` when
         * the camera is in the process of moving towards the desired distance, 
         * or when it's obstructed by solid terrain behind the player.
         * This value will get overwritten each tick, but you may want to write to it
         * when overriding the camera zoom speed.
        */
        this.currentZoom = opts.initialZoom;

        /** @internal */
        this._dirVector = glVec3.fromValues(0, 0, 1);
    }




    /*
     * 
     * 
     *          API
     * 
     * 
    */


    /*
     *      Local position functions for high precision
    */
    /** @internal */
    _localGetTargetPosition() {
        var pdat = this.noa.ents.getPositionData(this.cameraTarget);
        var pos = tempVectors[0];
        return glVec3.copy(pos, pdat._renderPosition)
    }
    /** @internal */
    _localGetPosition() {
        var loc = this._localGetTargetPosition();
        if (this.currentZoom === 0) return loc
        return glVec3.scaleAndAdd(loc, loc, this._dirVector, -this.currentZoom)
    }



    /**
     * Returns the camera's current target position - i.e. the player's 
     * eye position. When the camera is zoomed all the way in, 
     * this returns the same location as `camera.getPosition()`.
    */
    getTargetPosition() {
        var loc = this._localGetTargetPosition();
        var globalCamPos = tempVectors[1];
        return this.noa.localToGlobal(loc, globalCamPos)
    }


    /**
     * Returns the current camera position (read only)
    */
    getPosition() {
        var loc = this._localGetPosition();
        var globalCamPos = tempVectors[2];
        return this.noa.localToGlobal(loc, globalCamPos)
    }


    /**
     * Returns the camera direction vector (read only)
    */
    getDirection() {
        return this._dirVector
    }




    /*
     * 
     * 
     * 
     *          internals below
     * 
     * 
     * 
    */



    /**
     * Called before render, if mouseLock etc. is applicable.
     * Applies current mouse x/y inputs to the camera angle and zoom
     * @internal
    */

    applyInputsToCamera() {

        // conditional changes to mouse sensitivity
        var senseMult = this.sensitivityMult;
        var container = this.noa.container;
        if (container.supportsPointerLock) {
            if (!container.hasPointerLock) {
                senseMult *= this.sensitivityMultOutsidePointerlock;
                if (!this.dragCameraOutsidePointerlock || !container.pointerInGame) {
                    senseMult = 0;
                }
            }
        } else {
            if (this.dragCameraOutsidePointerlock) {
                senseMult *= this.sensitivityMultOutsidePointerlock;
            } else {
                senseMult = 0;
            }
        }
        if (senseMult === 0) return

        // dx/dy from input state
        var pointerState = this.noa.inputs.pointerState;
        bugFix(pointerState); // TODO: REMOVE EVENTUALLY    

        // convert to rads, using (sens * 0.0066 deg/pixel), like Overwatch
        var conv = 0.0066 * Math.PI / 180;
        var dx = pointerState.dx * this.sensitivityX * senseMult * conv;
        var dy = pointerState.dy * this.sensitivityY * senseMult * conv;
        if (this.inverseX) dx = -dx;
        if (this.inverseY) dy = -dy;

        // normalize/clamp angles, update direction vector
        var twopi = 2 * Math.PI;
        this.heading += (dx < 0) ? dx + twopi : dx;
        if (this.heading > twopi) this.heading -= twopi;
        var maxPitch = Math.PI / 2 - 0.001;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch + dy));

        glVec3.set(this._dirVector, 0, 0, 1);
        var dir = this._dirVector;
        var origin = originVector;
        glVec3.rotateX(dir, dir, origin, this.pitch);
        glVec3.rotateY(dir, dir, origin, this.heading);
    }



    /**
     *  Called before all renders, pre- and post- entity render systems
     * @internal
    */
    updateBeforeEntityRenderSystems(dt = 0) {
        var target = this.zoomDistance;
        if (target === this.currentZoom) return
        var lerp = Math.max(0, Math.min(0.99, this.zoomSpeed));
        if (lerp <= 0) {
            this.currentZoom = target;
            return
        }
        var frameMs = 1000 / 60;
        var factor = 1 - Math.pow(1 - lerp, Math.max(dt, 0) / frameMs);
        this.currentZoom += (target - this.currentZoom) * factor;
    }

    /** @internal */
    updateAfterEntityRenderSystems() {
        // clamp camera zoom not to clip into solid terrain
        var maxZoom = cameraObstructionDistance(this);
        if (this.currentZoom > maxZoom) this.currentZoom = maxZoom;
    }

}




/*
 *  check for obstructions behind camera by sweeping back an AABB
*/

function cameraObstructionDistance(self) {
    if (!self._sweepBox) {
        self._sweepBox = new AABB([0, 0, 0], [0.2, 0.2, 0.2]);
        self._sweepGetVoxel = self.noa.world.getBlockSolidity.bind(self.noa.world);
        self._sweepVec = glVec3.create();
        self._sweepHit = () => true;
    }
    var pos = glVec3.copy(self._sweepVec, self._localGetTargetPosition());
    glVec3.add(pos, pos, self.noa.worldOriginOffset);
    for (var i = 0; i < 3; i++) pos[i] -= 0.1;
    self._sweepBox.setPosition(pos);
    var dist = Math.max(self.zoomDistance, self.currentZoom) + 0.1;
    glVec3.scale(self._sweepVec, self.getDirection(), -dist);
    return sweep$3(self._sweepGetVoxel, self._sweepBox, self._sweepVec, self._sweepHit, true)
}






// workaround for this Chrome 63 + Win10 bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=781182
// later updated to also address: https://github.com/fenomas/noa/issues/153
function bugFix(pointerState) {
    var dx = pointerState.dx;
    var dy = pointerState.dy;
    var badx = (Math.abs(dx) > 400 && Math.abs(dx / lastx) > 4);
    var bady = (Math.abs(dy) > 400 && Math.abs(dy / lasty) > 4);
    if (badx || bady) {
        pointerState.dx = lastx;
        pointerState.dy = lasty;
        lastx = (lastx + dx) / 2;
        lasty = (lasty + dy) / 2;
    } else {
        lastx = dx || 1;
        lasty = dy || 1;
    }
}

var lastx = 0;
var lasty = 0;

/*
 * 
 *      Encapsulates (mostly) a collection of objects, 
 *      exposed both as a hash and as an array
 *      _map maps hash id to list index
 * 
 *      Note this is a dumb store, it doesn't check any inputs at all.
 *      It also assumes every stored data object is stored like:
 *          dataStore.add(37, {__id:37} )
 * 
*/


var dataStore = class DataStore {

    constructor() {
        this.list = [];
        this.hash = {};
        this._map = {};
        this._pendingRemovals = [];
    }


    // add a new state object
    add(id, stateObject) {
        if (typeof this._map[id] === 'number') {
            // this happens if id is removed/readded without flushing
            var index = this._map[id];
            this.hash[id] = stateObject;
            this.list[index] = stateObject;
        } else {
            this._map[id] = this.list.length;
            this.hash[id] = stateObject;
            this.list.push(stateObject);
        }
    }


    // remove - nulls the state object, actual removal comes later
    remove(id) {
        var index = this._map[id];
        this.hash[id] = null;
        this.list[index] = null;
        this._pendingRemovals.push(id);
    }


    // just sever references
    dispose() {
        this.list = null;
        this.hash = null;
        this._map = null;
        this._pendingRemovals.length = 0;
    }


    // deletes removed objects from data structures
    flush() {
        for (var i = 0; i < this._pendingRemovals.length; i++) {
            var id = this._pendingRemovals[i];
            // removal might have been reversed, or already handled
            if (this.hash[id] !== null) continue
            removeElement(this, id);
        }
        this._pendingRemovals.length = 0;
    }

};


/*
 * 
 *      actual remove / cleanup logic, fixes up data structures after removal
 * 
 * 
*/


function removeElement(data, id) {
    // current location of this element in the list
    var index = data._map[id];
    // for hash and map, just delete by id
    delete data.hash[id];
    delete data._map[id];
    // now splice - either by popping or by swapping with final element
    if (index === data.list.length - 1) {
        data.list.pop();
    } else {
        // swap last item with the one we're removing
        var swapped = data.list.pop();
        data.list[index] = swapped;
        // need to fix _map for swapped item
        if (swapped === null || swapped[0] === null) {
            // slowest but rarest case - swapped item is ALSO pending removal
            var prevIndex = data.list.length;
            for (var swapID in data._map) {
                if (data._map[swapID] === prevIndex) {
                    data._map[swapID] = index;
                    return
                }
            }
        } else {
            var swappedID = swapped.__id || swapped[0].__id;
            data._map[swappedID] = index;
        }
    }
}

var ECS_1 = ECS$1;
var DataStore = dataStore;



/*!
 * ent-comp: a light, *fast* Entity Component System in JS
 * @url      github.com/fenomas/ent-comp
 * @author   Andy Hall <andy@fenomas.com>
 * @license  MIT
*/



/**
 * Constructor for a new entity-component-system manager.
 * 
 * ```js
 * var ECS = require('ent-comp')
 * var ecs = new ECS()
 * ```
 * @class
 * @constructor
 * @exports ECS
 * @typicalname ecs
*/

function ECS$1() {
	var self = this;

	/** 
	 * Hash of component definitions. Also aliased to `comps`.
	 * 
	 * ```js
	 * var comp = { name: 'foo' }
	 * ecs.createComponent(comp)
	 * ecs.components['foo'] === comp  // true
	 * ecs.comps['foo']                // same
	 * ```
	*/
	this.components = {};
	this.comps = this.components;



	/*
	 * 
	 * 		internal properties:
	 * 
	*/

	var components = this.components;

	// counter for entity IDs
	var UID = 1;

	// Storage for all component state data:
	// storage['component-name'] = DataStore instance
	var storage = {};

	// flat arrays of names of components with systems
	var systems = [];
	var renderSystems = [];

	// flags and arrays for deferred cleanup of removed stuff
	var deferrals = {
		timeout: false,
		removals: [],
		multiComps: [],
	};

	// expose references to internals for debugging or hacking
	this._storage = storage;
	this._systems = systems;
	this._renderSystems = renderSystems;





	/*
	 * 
	 * 
	 * 				Public API
	 * 
	 * 
	*/




	/**
	 * Creates a new entity id (currently just an incrementing integer).
	 * 
	 * Optionally takes a list of component names to add to the entity (with default state data).
	 * 
	 * ```js
	 * var id1 = ecs.createEntity()
	 * var id2 = ecs.createEntity([ 'some-component', 'other-component' ])
	 * ```
	*/
	this.createEntity = function (compList) {
		var id = UID++;
		if (Array.isArray(compList)) {
			compList.forEach(compName => self.addComponent(id, compName));
		}
		return id
	};



	/**
	 * Deletes an entity, which in practice means removing all its components.
	 * 
	 * ```js
	 * ecs.deleteEntity(id)
	 * ```
	*/
	this.deleteEntity = function (entID) {
		// loop over all components and maybe remove them
		// this avoids needing to keep a list of components-per-entity
		Object.keys(storage).forEach(compName => {
			var data = storage[compName];
			if (data.hash[entID]) {
				removeComponent(entID, compName);
			}
		});
		return self
	};







	/**
	 * Creates a new component from a definition object. 
	 * The definition must have a `name`; all other properties are optional.
	 * 
	 * Returns the component name, to make it easy to grab when the component
	 * is being `require`d from a module.
	 * 
	 * ```js
	 * var comp = {
	 * 	 name: 'some-unique-string',
	 * 	 state: {},
	 * 	 order: 99,
	 * 	 multi: false,
	 * 	 onAdd:        (id, state) => { },
	 * 	 onRemove:     (id, state) => { },
	 * 	 system:       (dt, states) => { },
	 * 	 renderSystem: (dt, states) => { },
	 * }
	 * 
	 * var name = ecs.createComponent( comp )
	 * // name == 'some-unique-string'
	 * ```
	 * 
	 * Note the `multi` flag - for components where this is true, a given 
	 * entity can have multiple state objects for that component.
	 * For multi-components, APIs that would normally return a state object 
	 * (like `getState`) will instead return an array of them.
	*/
	this.createComponent = function (compDefn) {
		if (!compDefn) throw new Error('Missing component definition')
		var name = compDefn.name;
		if (!name) throw new Error('Component definition must have a name property.')
		if (typeof name !== 'string') throw new Error('Component name must be a string.')
		if (name === '') throw new Error('Component name must be a non-empty string.')
		if (storage[name]) throw new Error(`Component ${name} already exists.`)

		// rebuild definition object for monomorphism
		var internalDef = {};
		internalDef.name = name;
		internalDef.multi = !!compDefn.multi;
		internalDef.order = isNaN(compDefn.order) ? 99 : compDefn.order;
		internalDef.state = compDefn.state || {};
		internalDef.onAdd = compDefn.onAdd || null;
		internalDef.onRemove = compDefn.onRemove || null;
		internalDef.system = compDefn.system || null;
		internalDef.renderSystem = compDefn.renderSystem || null;

		components[name] = internalDef;
		storage[name] = new DataStore();
		storage[name]._pendingMultiCleanup = false;
		storage[name]._multiCleanupIDs = (internalDef.multi) ? [] : null;

		if (internalDef.system) {
			systems.push(name);
			systems.sort((a, b) => components[a].order - components[b].order);
		}
		if (internalDef.renderSystem) {
			renderSystems.push(name);
			renderSystems.sort((a, b) => components[a].order - components[b].order);
		}

		return name
	};






	/**
	 * Overwrites an existing component with a new definition object, which
	 * must have the same `name` property as the component it overwrites.
	 * Otherwise identical to `createComponent`
	 * 
	 * ```js
	 *   ecs.createComponent({
	 *     name: 'foo',
	 *     state: { aaa: 0 },
	 *   })
	 *   ecs.addComponent(myEntity, 'foo')
	 *   ecs.getState(myEntity, 'foo').aaa = 123
	 *   
	 *   ecs.overwriteComponent('foo', {
	 *	   name: 'foo',
	 *	   state: { bbb: 456 },
	 *	 })
	 *   ecs.getState(myEntity, 'foo')  // { aaa:123, bbb:456 }
	 * ```
	 * 
	*/
	this.overwriteComponent = function (compName, compDefn) {
		var def = components[compName];
		if (!def) throw new Error(`Unknown component: ${compName}`)
		if (!compDefn) throw new Error('Missing component definition')
		if (def.name !== compDefn.name) throw new Error('Overwriting component must use the same name property.')

		// rebuild definition object for monomorphism
		var internalDef = {};
		internalDef.name = compName;
		internalDef.multi = !!compDefn.multi;
		internalDef.order = isNaN(compDefn.order) ? 99 : compDefn.order;
		internalDef.state = compDefn.state || {};
		internalDef.onAdd = compDefn.onAdd || null;
		internalDef.onRemove = compDefn.onRemove || null;
		internalDef.system = compDefn.system || null;
		internalDef.renderSystem = compDefn.renderSystem || null;

		// overwrite internal references to old component def
		components[compName] = internalDef;
		storage[compName]._pendingMultiCleanup = false;
		storage[compName]._multiCleanupIDs = (internalDef.multi) ? [] : null;

		var si = systems.indexOf(compName);
		if (internalDef.system && si < 0) systems.push(compName);
		if (!internalDef.system && si >= 0) systems.splice(si, 1);
		systems.sort((a, b) => components[a].order - components[b].order);

		var ri = renderSystems.indexOf(compName);
		if (internalDef.renderSystem && ri < 0) renderSystems.push(compName);
		if (!internalDef.renderSystem && ri >= 0) renderSystems.splice(ri, 1);
		renderSystems.sort((a, b) => components[a].order - components[b].order);

		// for any existing entities with the component,
		// add any default state properties they're missing
		var baseState = internalDef.state;
		this.getStatesList(compName).forEach(state => {
			for (var key in baseState) {
				if (!(key in state)) state[key] = baseState[key];
			}
			// also call the new comp's add handler, if any
			if (internalDef.onAdd) internalDef.onAdd(state.__id, state);
		});


		return compName
	};







	/**
	 * Deletes the component definition with the given name. 
	 * First removes the component from all entities that have it.
	 * 
	 * **Note:** This API shouldn't be necessary in most real-world usage - 
	 * you should set up all your components during init and then leave them be.
	 * But it's useful if, say, you receive an ECS from another library and 
	 * you need to replace its components.
	 * 
	 * ```js
	 * ecs.deleteComponent( 'some-component' )
	 * ```
	*/
	this.deleteComponent = function (compName) {
		var data = storage[compName];
		if (!data) throw new Error(`Unknown component: ${compName}`)

		data.flush();
		data.list.forEach(obj => {
			if (!obj) return
			var id = obj.__id || obj[0].__id;
			removeComponent(id, compName);
		});

		var i = systems.indexOf(compName);
		var j = renderSystems.indexOf(compName);
		if (i > -1) systems.splice(i, 1);
		if (j > -1) renderSystems.splice(j, 1);

		storage[compName].dispose();
		delete storage[compName];
		delete components[compName];

		return self
	};




	/**
	 * Adds a component to an entity, optionally initializing the state object.
	 * 
	 * ```js
	 * ecs.createComponent({
	 * 	name: 'foo',
	 * 	state: { val: 1 }
	 * })
	 * ecs.addComponent(id1, 'foo')             // use default state
	 * ecs.addComponent(id2, 'foo', { val:2 })  // pass in state data
	 * ```
	*/
	this.addComponent = function (entID, compName, state) {
		var def = components[compName];
		var data = storage[compName];
		if (!data) throw new Error(`Unknown component: ${compName}.`)

		// treat adding an existing (non-multi-) component as an error
		if (data.hash[entID] && !def.multi) {
			throw new Error(`Entity ${entID} already has component: ${compName}.`)
		}

		// create new component state object for this entity
		var newState = Object.assign({}, { __id: entID }, def.state, state);

		// just in case passed-in state object had an __id property
		newState.__id = entID;

		// add to data store - for multi components, may already be present
		if (def.multi) {
			var statesArr = data.hash[entID];
			if (!statesArr) {
				statesArr = [];
				data.add(entID, statesArr);
			}
			statesArr.push(newState);
		} else {
			data.add(entID, newState);
		}

		// call handler and return
		if (def.onAdd) def.onAdd(entID, newState);

		return this
	};



	/**
	 * Checks if an entity has a component.
	 * 
	 * ```js
	 * ecs.addComponent(id, 'foo')
	 * ecs.hasComponent(id, 'foo')       // true
	 * ```
	*/

	this.hasComponent = function (entID, compName) {
		var data = storage[compName];
		if (!data) throw new Error(`Unknown component: ${compName}.`)
		return !!data.hash[entID]
	};





	/**
	 * Removes a component from an entity, triggering the component's 
	 * `onRemove` handler, and then deleting any state data.
	 * 
	 * ```js
	 * ecs.removeComponent(id, 'foo')
	 * ecs.hasComponent(id, 'foo')     	 // false
	 * ```
	*/
	this.removeComponent = function (entID, compName) {
		var data = storage[compName];
		if (!data) throw new Error(`Unknown component: ${compName}.`)

		// removal implementations at end
		removeComponent(entID, compName);

		return self
	};





	/**
	 * Get the component state for a given entity.
	 * It will automatically have an `__id` property for the entity id.
	 * 
	 * ```js
	 * ecs.createComponent({
	 * 	name: 'foo',
	 * 	state: { val: 0 }
	 * })
	 * ecs.addComponent(id, 'foo')
	 * ecs.getState(id, 'foo').val       // 0
	 * ecs.getState(id, 'foo').__id      // equals id
	 * ```
	*/

	this.getState = function (entID, compName) {
		var data = storage[compName];
		if (!data) throw new Error(`Unknown component: ${compName}.`)
		return data.hash[entID]
	};




	/**
	 * Get an array of state objects for every entity with the given component. 
	 * Each one will have an `__id` property for the entity id it refers to.
	 * Don't add or remove elements from the returned list!
	 * 
	 * ```js
	 * var arr = ecs.getStatesList('foo')
	 * // returns something shaped like:
	 * //   [
	 * //     {__id:0, x:1},
	 * //     {__id:7, x:2},
	 * //   ]
	 * ```  
	*/

	this.getStatesList = function (compName) {
		var data = storage[compName];
		if (!data) throw new Error(`Unknown component: ${compName}.`)
		doDeferredCleanup();
		return data.list
	};




	/**
	 * Makes a `getState`-like accessor bound to a given component. 
	 * The accessor is faster than `getState`, so you may want to create 
	 * an accessor for any component you'll be accessing a lot.
	 * 
	 * ```js
	 * ecs.createComponent({
	 * 	name: 'size',
	 * 	state: { val: 0 }
	 * })
	 * var getEntitySize = ecs.getStateAccessor('size')
	 * // ...
	 * ecs.addComponent(id, 'size', { val:123 })
	 * getEntitySize(id).val      // 123
	 * ```  
	*/

	this.getStateAccessor = function (compName) {
		if (!storage[compName]) throw new Error(`Unknown component: ${compName}.`)
		var hash = storage[compName].hash;
		return (id) => hash[id]
	};




	/**
	 * Makes a `hasComponent`-like accessor function bound to a given component. 
	 * The accessor is much faster than `hasComponent`.
	 * 
	 * ```js
	 * ecs.createComponent({
	 * 	name: 'foo',
	 * })
	 * var hasFoo = ecs.getComponentAccessor('foo')
	 * // ...
	 * ecs.addComponent(id, 'foo')
	 * hasFoo(id) // true
	 * ```  
	*/

	this.getComponentAccessor = function (compName) {
		if (!storage[compName]) throw new Error(`Unknown component: ${compName}.`)
		var hash = storage[compName].hash;
		return (id) => !!hash[id]
	};





	/**
	 * Tells the ECS that a game tick has occurred, causing component 
	 * `system` functions to get called.
	 * 
	 * The optional parameter simply gets passed to the system functions. 
	 * It's meant to be a timestep, but can be used (or not used) as you like.    
	 * 
	 * If components have an `order` property, they'll get called in that order
	 * (lowest to highest). Component order defaults to `99`.
	 * ```js
	 * ecs.createComponent({
	 * 	name: foo,
	 * 	order: 1,
	 * 	system: function(dt, states) {
	 * 		// states is the same array you'd get from #getStatesList()
	 * 		states.forEach(state => {
	 * 			console.log('Entity ID: ', state.__id)
	 * 		})
	 * 	}
	 * })
	 * ecs.tick(30) // triggers log statements
	 * ```
	*/

	this.tick = function (dt) {
		doDeferredCleanup();
		for (var i = 0; i < systems.length; i++) {
			var compName = systems[i];
			var comp = components[compName];
			var data = storage[compName];
			comp.system(dt, data.list);
			doDeferredCleanup();
		}
		return self
	};



	/**
	 * Functions exactly like `tick`, but calls `renderSystem` functions.
	 * this effectively gives you a second set of systems that are 
	 * called with separate timing, in case you want to 
	 * [tick and render in separate loops](http://gafferongames.com/game-physics/fix-your-timestep/)
	 * (which you should!).
	 * 
	 * ```js
	 * ecs.createComponent({
	 * 	name: foo,
	 * 	order: 5,
	 * 	renderSystem: function(dt, states) {
	 * 		// states is the same array you'd get from #getStatesList()
	 * 	}
	 * })
	 * ecs.render(1000/60)
	 * ```
	*/

	this.render = function (dt) {
		doDeferredCleanup();
		for (var i = 0; i < renderSystems.length; i++) {
			var compName = renderSystems[i];
			var comp = components[compName];
			var data = storage[compName];
			comp.renderSystem(dt, data.list);
			doDeferredCleanup();
		}
		return self
	};




	/**
	 * Removes one particular instance of a multi-component.
	 * To avoid breaking loops, the relevant state object will get nulled
	 * immediately, and spliced from the states array later when safe 
	 * (after the current tick/render/animationFrame).
	 * 
	 * ```js
	 * // where component 'foo' is a multi-component
	 * ecs.getState(id, 'foo')   // [ state1, state2, state3 ]
	 * ecs.removeMultiComponent(id, 'foo', 1)
	 * ecs.getState(id, 'foo')   // [ state1, null, state3 ]
	 * // one JS event loop later...
	 * ecs.getState(id, 'foo')   // [ state1, state3 ]
	 * ```
	 */
	this.removeMultiComponent = function (entID, compName, index) {
		var def = components[compName];
		var data = storage[compName];
		if (!data) throw new Error(`Unknown component: ${compName}.`)
		if (!def.multi) throw new Error('removeMultiComponent called on non-multi component')

		// removal implementations at end
		removeMultiCompElement(entID, def, data, index);

		return self
	};













	/*
	 * 
	 * 
	 *		internal implementations of remove/delete operations
	 * 		a bit hairy due to deferred cleanup, etc.
	 * 
	 * 
	*/


	// remove given component from an entity
	function removeComponent(entID, compName) {
		var def = components[compName];
		var data = storage[compName];

		// fail silently on all cases where removal target isn't present,
		// since multiple pieces of logic often remove/delete simultaneously
		var state = data.hash[entID];
		if (!state) return

		// null out data now, so overlapped remove events won't fire
		data.remove(entID);

		// call onRemove handler - on each instance for multi components
		if (def.onRemove) {
			if (def.multi) {
				state.forEach(state => {
					if (state) def.onRemove(entID, state);
				});
				state.length = 0;
			} else {
				def.onRemove(entID, state);
			}
		}

		deferrals.removals.push(data);
		pingDeferrals();
	}


	// remove one state from a multi component
	function removeMultiCompElement(entID, def, data, index) {
		// if statesArr isn't present there's no work or cleanup to do
		var statesArr = data.hash[entID];
		if (!statesArr) return

		// as above, ignore cases where removal target doesn't exist
		var state = statesArr[index];
		if (!state) return

		// null out element and fire event
		statesArr[index] = null;
		if (def.onRemove) def.onRemove(entID, state);

		deferrals.multiComps.push({ entID, data });
		pingDeferrals();
	}







	// rigging
	function pingDeferrals() {
		if (deferrals.timeout) return
		deferrals.timeout = true;
		setTimeout(deferralHandler, 1);
	}

	function deferralHandler() {
		deferrals.timeout = false;
		doDeferredCleanup();
	}


	/*
	 * 
	 *		general handling for deferred data cleanup
	 * 			- removes null states if component is multi
	 * 			- removes null entries from component dataStore
	 * 		should be called at safe times - not during state loops
	 * 
	*/

	function doDeferredCleanup() {
		if (deferrals.multiComps.length) {
			deferredMultiCompCleanup(deferrals.multiComps);
		}
		if (deferrals.removals.length) {
			deferredComponentCleanup(deferrals.removals);
		}
	}

	// removes null elements from multi-comp state arrays
	function deferredMultiCompCleanup(list) {
		for (var i = 0; i < list.length; i++) {
			var { entID, data } = list[i];
			var statesArr = data.hash[entID];
			if (!statesArr) continue
			for (var j = 0; j < statesArr.length; j++) {
				if (statesArr[j]) continue
				statesArr.splice(j, 1);
				j--;
			}
			// if this leaves the states list empty, remove the whole component
			if (statesArr.length === 0) {
				data.remove(entID);
				deferrals.removals.push(data);
			}
		}
		list.length = 0;
	}

	// flushes dataStore after components have been removed
	function deferredComponentCleanup(list) {
		for (var i = 0; i < list.length; i++) {
			var data = list[i];
			data.flush();
		}
		list.length = 0;
	}



}

var ECS = /*@__PURE__*/getDefaultExportFromCjs(ECS_1);

var pool$3 = {};

var twiddle = {};

/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */

//Number of bits in an integer
var INT_BITS = 32;

//Constants
twiddle.INT_BITS  = INT_BITS;
twiddle.INT_MAX   =  0x7fffffff;
twiddle.INT_MIN   = -1<<(INT_BITS-1);

//Returns -1, 0, +1 depending on sign of x
twiddle.sign = function(v) {
  return (v > 0) - (v < 0);
};

//Computes absolute value of integer
twiddle.abs = function(v) {
  var mask = v >> (INT_BITS-1);
  return (v ^ mask) - mask;
};

//Computes minimum of integers x and y
twiddle.min = function(x, y) {
  return y ^ ((x ^ y) & -(x < y));
};

//Computes maximum of integers x and y
twiddle.max = function(x, y) {
  return x ^ ((x ^ y) & -(x < y));
};

//Checks if a number is a power of two
twiddle.isPow2 = function(v) {
  return !(v & (v-1)) && (!!v);
};

//Computes log base 2 of v
twiddle.log2 = function(v) {
  var r, shift;
  r =     (v > 0xFFFF) << 4; v >>>= r;
  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
  return r | (v >> 1);
};

//Computes log base 10 of v
twiddle.log10 = function(v) {
  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
};

//Counts number of bits
twiddle.popCount = function(v) {
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
};

//Counts number of trailing zeros
function countTrailingZeros(v) {
  var c = 32;
  v &= -v;
  if (v) c--;
  if (v & 0x0000FFFF) c -= 16;
  if (v & 0x00FF00FF) c -= 8;
  if (v & 0x0F0F0F0F) c -= 4;
  if (v & 0x33333333) c -= 2;
  if (v & 0x55555555) c -= 1;
  return c;
}
twiddle.countTrailingZeros = countTrailingZeros;

//Rounds to next power of 2
twiddle.nextPow2 = function(v) {
  v += v === 0;
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v + 1;
};

//Rounds down to previous power of 2
twiddle.prevPow2 = function(v) {
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v - (v>>>1);
};

//Computes parity of word
twiddle.parity = function(v) {
  v ^= v >>> 16;
  v ^= v >>> 8;
  v ^= v >>> 4;
  v &= 0xf;
  return (0x6996 >>> v) & 1;
};

var REVERSE_TABLE = new Array(256);

(function(tab) {
  for(var i=0; i<256; ++i) {
    var v = i, r = i, s = 7;
    for (v >>>= 1; v; v >>>= 1) {
      r <<= 1;
      r |= v & 1;
      --s;
    }
    tab[i] = (r << s) & 0xff;
  }
})(REVERSE_TABLE);

//Reverse bits in a 32 bit word
twiddle.reverse = function(v) {
  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
           REVERSE_TABLE[(v >>> 24) & 0xff];
};

//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
twiddle.interleave2 = function(x, y) {
  x &= 0xFFFF;
  x = (x | (x << 8)) & 0x00FF00FF;
  x = (x | (x << 4)) & 0x0F0F0F0F;
  x = (x | (x << 2)) & 0x33333333;
  x = (x | (x << 1)) & 0x55555555;

  y &= 0xFFFF;
  y = (y | (y << 8)) & 0x00FF00FF;
  y = (y | (y << 4)) & 0x0F0F0F0F;
  y = (y | (y << 2)) & 0x33333333;
  y = (y | (y << 1)) & 0x55555555;

  return x | (y << 1);
};

//Extracts the nth interleaved component
twiddle.deinterleave2 = function(v, n) {
  v = (v >>> n) & 0x55555555;
  v = (v | (v >>> 1))  & 0x33333333;
  v = (v | (v >>> 2))  & 0x0F0F0F0F;
  v = (v | (v >>> 4))  & 0x00FF00FF;
  v = (v | (v >>> 16)) & 0x000FFFF;
  return (v << 16) >> 16;
};


//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
twiddle.interleave3 = function(x, y, z) {
  x &= 0x3FF;
  x  = (x | (x<<16)) & 4278190335;
  x  = (x | (x<<8))  & 251719695;
  x  = (x | (x<<4))  & 3272356035;
  x  = (x | (x<<2))  & 1227133513;

  y &= 0x3FF;
  y  = (y | (y<<16)) & 4278190335;
  y  = (y | (y<<8))  & 251719695;
  y  = (y | (y<<4))  & 3272356035;
  y  = (y | (y<<2))  & 1227133513;
  x |= (y << 1);
  
  z &= 0x3FF;
  z  = (z | (z<<16)) & 4278190335;
  z  = (z | (z<<8))  & 251719695;
  z  = (z | (z<<4))  & 3272356035;
  z  = (z | (z<<2))  & 1227133513;
  
  return x | (z << 2);
};

//Extracts nth interleaved component of a 3-tuple
twiddle.deinterleave3 = function(v, n) {
  v = (v >>> n)       & 1227133513;
  v = (v | (v>>>2))   & 3272356035;
  v = (v | (v>>>4))   & 251719695;
  v = (v | (v>>>8))   & 4278190335;
  v = (v | (v>>>16))  & 0x3FF;
  return (v<<22)>>22;
};

//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
twiddle.nextCombination = function(v) {
  var t = v | (v - 1);
  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
};

function dupe_array(count, value, i) {
  var c = count[i]|0;
  if(c <= 0) {
    return []
  }
  var result = new Array(c), j;
  if(i === count.length-1) {
    for(j=0; j<c; ++j) {
      result[j] = value;
    }
  } else {
    for(j=0; j<c; ++j) {
      result[j] = dupe_array(count, value, i+1);
    }
  }
  return result
}

function dupe_number(count, value) {
  var result, i;
  result = new Array(count);
  for(i=0; i<count; ++i) {
    result[i] = value;
  }
  return result
}

function dupe(count, value) {
  if(typeof value === "undefined") {
    value = 0;
  }
  switch(typeof count) {
    case "number":
      if(count > 0) {
        return dupe_number(count|0, value)
      }
    break
    case "object":
      if(typeof (count.length) === "number") {
        return dupe_array(count, value, 0)
      }
    break
  }
  return []
}

var dup$1 = dupe;

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

var isBuffer$1 = function isBuffer (obj) {
  return obj != null && obj.constructor != null &&
    typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
};

var bits$2 = twiddle;
var dup = dup$1;
var isBuffer = isBuffer$1;

//Legacy pool support
if(!commonjsGlobal.__TYPEDARRAY_POOL) {
  commonjsGlobal.__TYPEDARRAY_POOL = {
      UINT8   : dup([32, 0])
    , UINT16  : dup([32, 0])
    , UINT32  : dup([32, 0])
    , INT8    : dup([32, 0])
    , INT16   : dup([32, 0])
    , INT32   : dup([32, 0])
    , FLOAT   : dup([32, 0])
    , DOUBLE  : dup([32, 0])
    , DATA    : dup([32, 0])
    , UINT8C  : dup([32, 0])
    , BUFFER  : dup([32, 0])
  };
}

var hasUint8C = (typeof Uint8ClampedArray) !== 'undefined';
var POOL = commonjsGlobal.__TYPEDARRAY_POOL;

//Upgrade pool
if(!POOL.UINT8C) {
  POOL.UINT8C = dup([32, 0]);
}
if(!POOL.BUFFER) {
  POOL.BUFFER = dup([32, 0]);
}

//New technique: Only allocate from ArrayBufferView and Buffer
var DATA    = POOL.DATA
  , BUFFER  = POOL.BUFFER;

pool$3.free = function free(array) {
  if(isBuffer(array)) {
    BUFFER[bits$2.log2(array.length)].push(array);
  } else {
    if(Object.prototype.toString.call(array) !== '[object ArrayBuffer]') {
      array = array.buffer;
    }
    if(!array) {
      return
    }
    var n = array.length || array.byteLength;
    var log_n = bits$2.log2(n)|0;
    DATA[log_n].push(array);
  }
};

function freeArrayBuffer(buffer) {
  if(!buffer) {
    return
  }
  var n = buffer.length || buffer.byteLength;
  var log_n = bits$2.log2(n);
  DATA[log_n].push(buffer);
}

function freeTypedArray(array) {
  freeArrayBuffer(array.buffer);
}

pool$3.freeUint8 =
pool$3.freeUint16 =
pool$3.freeUint32 =
pool$3.freeInt8 =
pool$3.freeInt16 =
pool$3.freeInt32 =
pool$3.freeFloat32 = 
pool$3.freeFloat =
pool$3.freeFloat64 = 
pool$3.freeDouble = 
pool$3.freeUint8Clamped = 
pool$3.freeDataView = freeTypedArray;

pool$3.freeArrayBuffer = freeArrayBuffer;

pool$3.freeBuffer = function freeBuffer(array) {
  BUFFER[bits$2.log2(array.length)].push(array);
};

pool$3.malloc = function malloc(n, dtype) {
  if(dtype === undefined || dtype === 'arraybuffer') {
    return mallocArrayBuffer(n)
  } else {
    switch(dtype) {
      case 'uint8':
        return mallocUint8(n)
      case 'uint16':
        return mallocUint16(n)
      case 'uint32':
        return mallocUint32(n)
      case 'int8':
        return mallocInt8(n)
      case 'int16':
        return mallocInt16(n)
      case 'int32':
        return mallocInt32(n)
      case 'float':
      case 'float32':
        return mallocFloat(n)
      case 'double':
      case 'float64':
        return mallocDouble(n)
      case 'uint8_clamped':
        return mallocUint8Clamped(n)
      case 'buffer':
        throw 'Buffer not supported'
      case 'data':
      case 'dataview':
        return mallocDataView(n)

      default:
        return null
    }
  }
  return null
};

function mallocArrayBuffer(n) {
  var n = bits$2.nextPow2(n);
  var log_n = bits$2.log2(n);
  var d = DATA[log_n];
  if(d.length > 0) {
    return d.pop()
  }
  return new ArrayBuffer(n)
}
pool$3.mallocArrayBuffer = mallocArrayBuffer;

function mallocUint8(n) {
  return new Uint8Array(mallocArrayBuffer(n), 0, n)
}
pool$3.mallocUint8 = mallocUint8;

function mallocUint16(n) {
  return new Uint16Array(mallocArrayBuffer(2*n), 0, n)
}
pool$3.mallocUint16 = mallocUint16;

function mallocUint32(n) {
  return new Uint32Array(mallocArrayBuffer(4*n), 0, n)
}
pool$3.mallocUint32 = mallocUint32;

function mallocInt8(n) {
  return new Int8Array(mallocArrayBuffer(n), 0, n)
}
pool$3.mallocInt8 = mallocInt8;

function mallocInt16(n) {
  return new Int16Array(mallocArrayBuffer(2*n), 0, n)
}
pool$3.mallocInt16 = mallocInt16;

function mallocInt32(n) {
  return new Int32Array(mallocArrayBuffer(4*n), 0, n)
}
pool$3.mallocInt32 = mallocInt32;

function mallocFloat(n) {
  return new Float32Array(mallocArrayBuffer(4*n), 0, n)
}
pool$3.mallocFloat32 = pool$3.mallocFloat = mallocFloat;

function mallocDouble(n) {
  return new Float64Array(mallocArrayBuffer(8*n), 0, n)
}
pool$3.mallocFloat64 = pool$3.mallocDouble = mallocDouble;

function mallocUint8Clamped(n) {
  if(hasUint8C) {
    return new Uint8ClampedArray(mallocArrayBuffer(n), 0, n)
  } else {
    return mallocUint8(n)
  }
}
pool$3.mallocUint8Clamped = mallocUint8Clamped;

function mallocDataView(n) {
  return new DataView(mallocArrayBuffer(n), 0, n)
}
pool$3.mallocDataView = mallocDataView;

pool$3.clearCache = function clearCache() {
  for(var i=0; i<32; ++i) {
    POOL.UINT8[i].length = 0;
    POOL.UINT16[i].length = 0;
    POOL.UINT32[i].length = 0;
    POOL.INT8[i].length = 0;
    POOL.INT16[i].length = 0;
    POOL.INT32[i].length = 0;
    POOL.FLOAT[i].length = 0;
    POOL.DOUBLE[i].length = 0;
    POOL.UINT8C[i].length = 0;
    DATA[i].length = 0;
    BUFFER[i].length = 0;
  }
};

//This code is extracted from ndarray-sort
//It is inlined here as a temporary workaround

var sort = wrapper;

var INSERT_SORT_CUTOFF = 32;

function wrapper(data, n0) {
  if (n0 <= 4*INSERT_SORT_CUTOFF) {
    insertionSort$1(0, n0 - 1, data);
  } else {
    quickSort(0, n0 - 1, data);
  }
}

function insertionSort$1(left, right, data) {
  var ptr = 2*(left+1);
  for(var i=left+1; i<=right; ++i) {
    var a = data[ptr++];
    var b = data[ptr++];
    var j = i;
    var jptr = ptr-2;
    while(j-- > left) {
      var x = data[jptr-2];
      var y = data[jptr-1];
      if(x < a) {
        break
      } else if(x === a && y < b) {
        break
      }
      data[jptr]   = x;
      data[jptr+1] = y;
      jptr -= 2;
    }
    data[jptr]   = a;
    data[jptr+1] = b;
  }
}

function swap(i, j, data) {
  i *= 2;
  j *= 2;
  var x = data[i];
  var y = data[i+1];
  data[i] = data[j];
  data[i+1] = data[j+1];
  data[j] = x;
  data[j+1] = y;
}

function move(i, j, data) {
  i *= 2;
  j *= 2;
  data[i] = data[j];
  data[i+1] = data[j+1];
}

function rotate(i, j, k, data) {
  i *= 2;
  j *= 2;
  k *= 2;
  var x = data[i];
  var y = data[i+1];
  data[i] = data[j];
  data[i+1] = data[j+1];
  data[j] = data[k];
  data[j+1] = data[k+1];
  data[k] = x;
  data[k+1] = y;
}

function shufflePivot(i, j, px, py, data) {
  i *= 2;
  j *= 2;
  data[i] = data[j];
  data[j] = px;
  data[i+1] = data[j+1];
  data[j+1] = py;
}

function compare(i, j, data) {
  i *= 2;
  j *= 2;
  var x = data[i],
      y = data[j];
  if(x < y) {
    return false
  } else if(x === y) {
    return data[i+1] > data[j+1]
  }
  return true
}

function comparePivot(i, y, b, data) {
  i *= 2;
  var x = data[i];
  if(x < y) {
    return true
  } else if(x === y) {
    return data[i+1] < b
  }
  return false
}

function quickSort(left, right, data) {
  var sixth = (right - left + 1) / 6 | 0, 
      index1 = left + sixth, 
      index5 = right - sixth, 
      index3 = left + right >> 1, 
      index2 = index3 - sixth, 
      index4 = index3 + sixth, 
      el1 = index1, 
      el2 = index2, 
      el3 = index3, 
      el4 = index4, 
      el5 = index5, 
      less = left + 1, 
      great = right - 1, 
      tmp = 0;
  if(compare(el1, el2, data)) {
    tmp = el1;
    el1 = el2;
    el2 = tmp;
  }
  if(compare(el4, el5, data)) {
    tmp = el4;
    el4 = el5;
    el5 = tmp;
  }
  if(compare(el1, el3, data)) {
    tmp = el1;
    el1 = el3;
    el3 = tmp;
  }
  if(compare(el2, el3, data)) {
    tmp = el2;
    el2 = el3;
    el3 = tmp;
  }
  if(compare(el1, el4, data)) {
    tmp = el1;
    el1 = el4;
    el4 = tmp;
  }
  if(compare(el3, el4, data)) {
    tmp = el3;
    el3 = el4;
    el4 = tmp;
  }
  if(compare(el2, el5, data)) {
    tmp = el2;
    el2 = el5;
    el5 = tmp;
  }
  if(compare(el2, el3, data)) {
    tmp = el2;
    el2 = el3;
    el3 = tmp;
  }
  if(compare(el4, el5, data)) {
    tmp = el4;
    el4 = el5;
    el5 = tmp;
  }

  var pivot1X = data[2*el2];
  var pivot1Y = data[2*el2+1];
  var pivot2X = data[2*el4];
  var pivot2Y = data[2*el4+1];

  var ptr0 = 2 * el1;
  var ptr2 = 2 * el3;
  var ptr4 = 2 * el5;
  var ptr5 = 2 * index1;
  var ptr6 = 2 * index3;
  var ptr7 = 2 * index5;
  for (var i1 = 0; i1 < 2; ++i1) {
    var x = data[ptr0+i1];
    var y = data[ptr2+i1];
    var z = data[ptr4+i1];
    data[ptr5+i1] = x;
    data[ptr6+i1] = y;
    data[ptr7+i1] = z;
  }

  move(index2, left, data);
  move(index4, right, data);
  for (var k = less; k <= great; ++k) {
    if (comparePivot(k, pivot1X, pivot1Y, data)) {
      if (k !== less) {
        swap(k, less, data);
      }
      ++less;
    } else {
      if (!comparePivot(k, pivot2X, pivot2Y, data)) {
        while (true) {
          if (!comparePivot(great, pivot2X, pivot2Y, data)) {
            if (--great < k) {
              break;
            }
            continue;
          } else {
            if (comparePivot(great, pivot1X, pivot1Y, data)) {
              rotate(k, less, great, data);
              ++less;
              --great;
            } else {
              swap(k, great, data);
              --great;
            }
            break;
          }
        }
      }
    }
  }
  shufflePivot(left, less-1, pivot1X, pivot1Y, data);
  shufflePivot(right, great+1, pivot2X, pivot2Y, data);
  if (less - 2 - left <= INSERT_SORT_CUTOFF) {
    insertionSort$1(left, less - 2, data);
  } else {
    quickSort(left, less - 2, data);
  }
  if (right - (great + 2) <= INSERT_SORT_CUTOFF) {
    insertionSort$1(great + 2, right, data);
  } else {
    quickSort(great + 2, right, data);
  }
  if (great - less <= INSERT_SORT_CUTOFF) {
    insertionSort$1(less, great, data);
  } else {
    quickSort(less, great, data);
  }
}

var sweep$2 = {
  init:           sqInit,
  sweepBipartite: sweepBipartite,
  sweepComplete:  sweepComplete,
  scanBipartite:  scanBipartite,
  scanComplete:   scanComplete
};

var pool$2  = pool$3;
var bits$1  = twiddle;
var isort = sort;

//Flag for blue
var BLUE_FLAG = (1<<28);

//1D sweep event queue stuff (use pool to save space)
var INIT_CAPACITY$1      = 1024;
var RED_SWEEP_QUEUE    = pool$2.mallocInt32(INIT_CAPACITY$1);
var RED_SWEEP_INDEX    = pool$2.mallocInt32(INIT_CAPACITY$1);
var BLUE_SWEEP_QUEUE   = pool$2.mallocInt32(INIT_CAPACITY$1);
var BLUE_SWEEP_INDEX   = pool$2.mallocInt32(INIT_CAPACITY$1);
var COMMON_SWEEP_QUEUE = pool$2.mallocInt32(INIT_CAPACITY$1);
var COMMON_SWEEP_INDEX = pool$2.mallocInt32(INIT_CAPACITY$1);
var SWEEP_EVENTS       = pool$2.mallocDouble(INIT_CAPACITY$1 * 8);

//Reserves memory for the 1D sweep data structures
function sqInit(count) {
  var rcount = bits$1.nextPow2(count);
  if(RED_SWEEP_QUEUE.length < rcount) {
    pool$2.free(RED_SWEEP_QUEUE);
    RED_SWEEP_QUEUE = pool$2.mallocInt32(rcount);
  }
  if(RED_SWEEP_INDEX.length < rcount) {
    pool$2.free(RED_SWEEP_INDEX);
    RED_SWEEP_INDEX = pool$2.mallocInt32(rcount);
  }
  if(BLUE_SWEEP_QUEUE.length < rcount) {
    pool$2.free(BLUE_SWEEP_QUEUE);
    BLUE_SWEEP_QUEUE = pool$2.mallocInt32(rcount);
  }
  if(BLUE_SWEEP_INDEX.length < rcount) {
    pool$2.free(BLUE_SWEEP_INDEX);
    BLUE_SWEEP_INDEX = pool$2.mallocInt32(rcount);
  }
  if(COMMON_SWEEP_QUEUE.length < rcount) {
    pool$2.free(COMMON_SWEEP_QUEUE);
    COMMON_SWEEP_QUEUE = pool$2.mallocInt32(rcount);
  }
  if(COMMON_SWEEP_INDEX.length < rcount) {
    pool$2.free(COMMON_SWEEP_INDEX);
    COMMON_SWEEP_INDEX = pool$2.mallocInt32(rcount);
  }
  var eventLength = 8 * rcount;
  if(SWEEP_EVENTS.length < eventLength) {
    pool$2.free(SWEEP_EVENTS);
    SWEEP_EVENTS = pool$2.mallocDouble(eventLength);
  }
}

//Remove an item from the active queue in O(1)
function sqPop(queue, index, count, item) {
  var idx = index[item];
  var top = queue[count-1];
  queue[idx] = top;
  index[top] = idx;
}

//Insert an item into the active queue in O(1)
function sqPush(queue, index, count, item) {
  queue[count] = item;
  index[item]  = count;
}

//Recursion base case: use 1D sweep algorithm
function sweepBipartite(
    d, visit,
    redStart,  redEnd, red, redIndex,
    blueStart, blueEnd, blue, blueIndex) {

  //store events as pairs [coordinate, idx]
  //
  //  red create:  -(idx+1)
  //  red destroy: idx
  //  blue create: -(idx+BLUE_FLAG)
  //  blue destroy: idx+BLUE_FLAG
  //
  var ptr      = 0;
  var elemSize = 2*d;
  var istart   = d-1;
  var iend     = elemSize-1;

  for(var i=redStart; i<redEnd; ++i) {
    var idx = redIndex[i];
    var redOffset = elemSize*i;
    SWEEP_EVENTS[ptr++] = red[redOffset+istart];
    SWEEP_EVENTS[ptr++] = -(idx+1);
    SWEEP_EVENTS[ptr++] = red[redOffset+iend];
    SWEEP_EVENTS[ptr++] = idx;
  }

  for(var i=blueStart; i<blueEnd; ++i) {
    var idx = blueIndex[i]+BLUE_FLAG;
    var blueOffset = elemSize*i;
    SWEEP_EVENTS[ptr++] = blue[blueOffset+istart];
    SWEEP_EVENTS[ptr++] = -idx;
    SWEEP_EVENTS[ptr++] = blue[blueOffset+iend];
    SWEEP_EVENTS[ptr++] = idx;
  }

  //process events from left->right
  var n = ptr >>> 1;
  isort(SWEEP_EVENTS, n);
  
  var redActive  = 0;
  var blueActive = 0;
  for(var i=0; i<n; ++i) {
    var e = SWEEP_EVENTS[2*i+1]|0;
    if(e >= BLUE_FLAG) {
      //blue destroy event
      e = (e-BLUE_FLAG)|0;
      sqPop(BLUE_SWEEP_QUEUE, BLUE_SWEEP_INDEX, blueActive--, e);
    } else if(e >= 0) {
      //red destroy event
      sqPop(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive--, e);
    } else if(e <= -BLUE_FLAG) {
      //blue create event
      e = (-e-BLUE_FLAG)|0;
      for(var j=0; j<redActive; ++j) {
        var retval = visit(RED_SWEEP_QUEUE[j], e);
        if(retval !== void 0) {
          return retval
        }
      }
      sqPush(BLUE_SWEEP_QUEUE, BLUE_SWEEP_INDEX, blueActive++, e);
    } else {
      //red create event
      e = (-e-1)|0;
      for(var j=0; j<blueActive; ++j) {
        var retval = visit(e, BLUE_SWEEP_QUEUE[j]);
        if(retval !== void 0) {
          return retval
        }
      }
      sqPush(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive++, e);
    }
  }
}

//Complete sweep
function sweepComplete(d, visit, 
  redStart, redEnd, red, redIndex,
  blueStart, blueEnd, blue, blueIndex) {

  var ptr      = 0;
  var elemSize = 2*d;
  var istart   = d-1;
  var iend     = elemSize-1;

  for(var i=redStart; i<redEnd; ++i) {
    var idx = (redIndex[i]+1)<<1;
    var redOffset = elemSize*i;
    SWEEP_EVENTS[ptr++] = red[redOffset+istart];
    SWEEP_EVENTS[ptr++] = -idx;
    SWEEP_EVENTS[ptr++] = red[redOffset+iend];
    SWEEP_EVENTS[ptr++] = idx;
  }

  for(var i=blueStart; i<blueEnd; ++i) {
    var idx = (blueIndex[i]+1)<<1;
    var blueOffset = elemSize*i;
    SWEEP_EVENTS[ptr++] = blue[blueOffset+istart];
    SWEEP_EVENTS[ptr++] = (-idx)|1;
    SWEEP_EVENTS[ptr++] = blue[blueOffset+iend];
    SWEEP_EVENTS[ptr++] = idx|1;
  }

  //process events from left->right
  var n = ptr >>> 1;
  isort(SWEEP_EVENTS, n);
  
  var redActive    = 0;
  var blueActive   = 0;
  var commonActive = 0;
  for(var i=0; i<n; ++i) {
    var e     = SWEEP_EVENTS[2*i+1]|0;
    var color = e&1;
    if(i < n-1 && (e>>1) === (SWEEP_EVENTS[2*i+3]>>1)) {
      color = 2;
      i += 1;
    }
    
    if(e < 0) {
      //Create event
      var id = -(e>>1) - 1;

      //Intersect with common
      for(var j=0; j<commonActive; ++j) {
        var retval = visit(COMMON_SWEEP_QUEUE[j], id);
        if(retval !== void 0) {
          return retval
        }
      }

      if(color !== 0) {
        //Intersect with red
        for(var j=0; j<redActive; ++j) {
          var retval = visit(RED_SWEEP_QUEUE[j], id);
          if(retval !== void 0) {
            return retval
          }
        }
      }

      if(color !== 1) {
        //Intersect with blue
        for(var j=0; j<blueActive; ++j) {
          var retval = visit(BLUE_SWEEP_QUEUE[j], id);
          if(retval !== void 0) {
            return retval
          }
        }
      }

      if(color === 0) {
        //Red
        sqPush(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive++, id);
      } else if(color === 1) {
        //Blue
        sqPush(BLUE_SWEEP_QUEUE, BLUE_SWEEP_INDEX, blueActive++, id);
      } else if(color === 2) {
        //Both
        sqPush(COMMON_SWEEP_QUEUE, COMMON_SWEEP_INDEX, commonActive++, id);
      }
    } else {
      //Destroy event
      var id = (e>>1) - 1;
      if(color === 0) {
        //Red
        sqPop(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive--, id);
      } else if(color === 1) {
        //Blue
        sqPop(BLUE_SWEEP_QUEUE, BLUE_SWEEP_INDEX, blueActive--, id);
      } else if(color === 2) {
        //Both
        sqPop(COMMON_SWEEP_QUEUE, COMMON_SWEEP_INDEX, commonActive--, id);
      }
    }
  }
}

//Sweep and prune/scanline algorithm:
//  Scan along axis, detect intersections
//  Brute force all boxes along axis
function scanBipartite(
  d, axis, visit, flip,
  redStart,  redEnd, red, redIndex,
  blueStart, blueEnd, blue, blueIndex) {
  
  var ptr      = 0;
  var elemSize = 2*d;
  var istart   = axis;
  var iend     = axis+d;

  var redShift  = 1;
  var blueShift = 1;
  if(flip) {
    blueShift = BLUE_FLAG;
  } else {
    redShift  = BLUE_FLAG;
  }

  for(var i=redStart; i<redEnd; ++i) {
    var idx = i + redShift;
    var redOffset = elemSize*i;
    SWEEP_EVENTS[ptr++] = red[redOffset+istart];
    SWEEP_EVENTS[ptr++] = -idx;
    SWEEP_EVENTS[ptr++] = red[redOffset+iend];
    SWEEP_EVENTS[ptr++] = idx;
  }
  for(var i=blueStart; i<blueEnd; ++i) {
    var idx = i + blueShift;
    var blueOffset = elemSize*i;
    SWEEP_EVENTS[ptr++] = blue[blueOffset+istart];
    SWEEP_EVENTS[ptr++] = -idx;
  }

  //process events from left->right
  var n = ptr >>> 1;
  isort(SWEEP_EVENTS, n);
  
  var redActive    = 0;
  for(var i=0; i<n; ++i) {
    var e = SWEEP_EVENTS[2*i+1]|0;
    if(e < 0) {
      var idx   = -e;
      var isRed = false;
      if(idx >= BLUE_FLAG) {
        isRed = !flip;
        idx -= BLUE_FLAG; 
      } else {
        isRed = !!flip;
        idx -= 1;
      }
      if(isRed) {
        sqPush(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive++, idx);
      } else {
        var blueId  = blueIndex[idx];
        var bluePtr = elemSize * idx;
        
        var b0 = blue[bluePtr+axis+1];
        var b1 = blue[bluePtr+axis+1+d];

red_loop:
        for(var j=0; j<redActive; ++j) {
          var oidx   = RED_SWEEP_QUEUE[j];
          var redPtr = elemSize * oidx;

          if(b1 < red[redPtr+axis+1] || 
             red[redPtr+axis+1+d] < b0) {
            continue
          }

          for(var k=axis+2; k<d; ++k) {
            if(blue[bluePtr + k + d] < red[redPtr + k] || 
               red[redPtr + k + d] < blue[bluePtr + k]) {
              continue red_loop
            }
          }

          var redId  = redIndex[oidx];
          var retval;
          if(flip) {
            retval = visit(blueId, redId);
          } else {
            retval = visit(redId, blueId);
          }
          if(retval !== void 0) {
            return retval 
          }
        }
      }
    } else {
      sqPop(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive--, e - redShift);
    }
  }
}

function scanComplete(
  d, axis, visit,
  redStart,  redEnd, red, redIndex,
  blueStart, blueEnd, blue, blueIndex) {

  var ptr      = 0;
  var elemSize = 2*d;
  var istart   = axis;
  var iend     = axis+d;

  for(var i=redStart; i<redEnd; ++i) {
    var idx = i + BLUE_FLAG;
    var redOffset = elemSize*i;
    SWEEP_EVENTS[ptr++] = red[redOffset+istart];
    SWEEP_EVENTS[ptr++] = -idx;
    SWEEP_EVENTS[ptr++] = red[redOffset+iend];
    SWEEP_EVENTS[ptr++] = idx;
  }
  for(var i=blueStart; i<blueEnd; ++i) {
    var idx = i + 1;
    var blueOffset = elemSize*i;
    SWEEP_EVENTS[ptr++] = blue[blueOffset+istart];
    SWEEP_EVENTS[ptr++] = -idx;
  }

  //process events from left->right
  var n = ptr >>> 1;
  isort(SWEEP_EVENTS, n);
  
  var redActive    = 0;
  for(var i=0; i<n; ++i) {
    var e = SWEEP_EVENTS[2*i+1]|0;
    if(e < 0) {
      var idx   = -e;
      if(idx >= BLUE_FLAG) {
        RED_SWEEP_QUEUE[redActive++] = idx - BLUE_FLAG;
      } else {
        idx -= 1;
        var blueId  = blueIndex[idx];
        var bluePtr = elemSize * idx;

        var b0 = blue[bluePtr+axis+1];
        var b1 = blue[bluePtr+axis+1+d];

red_loop:
        for(var j=0; j<redActive; ++j) {
          var oidx   = RED_SWEEP_QUEUE[j];
          var redId  = redIndex[oidx];

          if(redId === blueId) {
            break
          }

          var redPtr = elemSize * oidx;
          if(b1 < red[redPtr+axis+1] || 
            red[redPtr+axis+1+d] < b0) {
            continue
          }
          for(var k=axis+2; k<d; ++k) {
            if(blue[bluePtr + k + d] < red[redPtr + k] || 
               red[redPtr + k + d]   < blue[bluePtr + k]) {
              continue red_loop
            }
          }

          var retval = visit(redId, blueId);
          if(retval !== void 0) {
            return retval 
          }
        }
      }
    } else {
      var idx = e - BLUE_FLAG;
      for(var j=redActive-1; j>=0; --j) {
        if(RED_SWEEP_QUEUE[j] === idx) {
          for(var k=j+1; k<redActive; ++k) {
            RED_SWEEP_QUEUE[k-1] = RED_SWEEP_QUEUE[k];
          }
          break
        }
      }
      --redActive;
    }
  }
}

var brute = {};

var DIMENSION   = 'd';
var AXIS        = 'ax';
var VISIT       = 'vv';
var FLIP        = 'fp';

var ELEM_SIZE   = 'es';

var RED_START   = 'rs';
var RED_END     = 're';
var RED_BOXES   = 'rb';
var RED_INDEX   = 'ri';
var RED_PTR     = 'rp';

var BLUE_START  = 'bs';
var BLUE_END    = 'be';
var BLUE_BOXES  = 'bb';
var BLUE_INDEX  = 'bi';
var BLUE_PTR    = 'bp';

var RETVAL      = 'rv';

var INNER_LABEL = 'Q';

var ARGS = [
  DIMENSION,
  AXIS,
  VISIT,
  RED_START,
  RED_END,
  RED_BOXES,
  RED_INDEX,
  BLUE_START,
  BLUE_END,
  BLUE_BOXES,
  BLUE_INDEX
];

function generateBruteForce(redMajor, flip, full) {
  var funcName = 'bruteForce' + 
    (redMajor ? 'Red' : 'Blue') + 
    (flip ? 'Flip' : '') +
    (full ? 'Full' : '');

  var code = ['function ', funcName, '(', ARGS.join(), '){',
    'var ', ELEM_SIZE, '=2*', DIMENSION, ';'];

  var redLoop = 
    'for(var i=' + RED_START + ',' + RED_PTR + '=' + ELEM_SIZE + '*' + RED_START + ';' +
        'i<' + RED_END +';' +
        '++i,' + RED_PTR + '+=' + ELEM_SIZE + '){' +
        'var x0=' + RED_BOXES + '[' + AXIS + '+' + RED_PTR + '],' +
            'x1=' + RED_BOXES + '[' + AXIS + '+' + RED_PTR + '+' + DIMENSION + '],' +
            'xi=' + RED_INDEX + '[i];';

  var blueLoop = 
    'for(var j=' + BLUE_START + ',' + BLUE_PTR + '=' + ELEM_SIZE + '*' + BLUE_START + ';' +
        'j<' + BLUE_END + ';' +
        '++j,' + BLUE_PTR + '+=' + ELEM_SIZE + '){' +
        'var y0=' + BLUE_BOXES + '[' + AXIS + '+' + BLUE_PTR + '],' +
            (full ? 'y1=' + BLUE_BOXES + '[' + AXIS + '+' + BLUE_PTR + '+' + DIMENSION + '],' : '') +
            'yi=' + BLUE_INDEX + '[j];';

  if(redMajor) {
    code.push(redLoop, INNER_LABEL, ':', blueLoop);
  } else {
    code.push(blueLoop, INNER_LABEL, ':', redLoop);
  }

  if(full) {
    code.push('if(y1<x0||x1<y0)continue;');
  } else if(flip) {
    code.push('if(y0<=x0||x1<y0)continue;');
  } else {
    code.push('if(y0<x0||x1<y0)continue;');
  }

  code.push('for(var k='+AXIS+'+1;k<'+DIMENSION+';++k){'+
    'var r0='+RED_BOXES+'[k+'+RED_PTR+'],'+
        'r1='+RED_BOXES+'[k+'+DIMENSION+'+'+RED_PTR+'],'+
        'b0='+BLUE_BOXES+'[k+'+BLUE_PTR+'],'+
        'b1='+BLUE_BOXES+'[k+'+DIMENSION+'+'+BLUE_PTR+'];'+
      'if(r1<b0||b1<r0)continue ' + INNER_LABEL + ';}' +
      'var ' + RETVAL + '=' + VISIT + '(');

  if(flip) {
    code.push('yi,xi');
  } else {
    code.push('xi,yi');
  }

  code.push(');if(' + RETVAL + '!==void 0)return ' + RETVAL + ';}}}');

  return {
    name: funcName, 
    code: code.join('')
  }
}

function bruteForcePlanner(full) {
  var funcName = 'bruteForce' + (full ? 'Full' : 'Partial');
  var prefix = [];
  var fargs = ARGS.slice();
  if(!full) {
    fargs.splice(3, 0, FLIP);
  }

  var code = ['function ' + funcName + '(' + fargs.join() + '){'];

  function invoke(redMajor, flip) {
    var res = generateBruteForce(redMajor, flip, full);
    prefix.push(res.code);
    code.push('return ' + res.name + '(' + ARGS.join() + ');');
  }

  code.push('if(' + RED_END + '-' + RED_START + '>' +
                    BLUE_END + '-' + BLUE_START + '){');

  if(full) {
    invoke(true, false);
    code.push('}else{');
    invoke(false, false);
  } else {
    code.push('if(' + FLIP + '){');
    invoke(true, true);
    code.push('}else{');
    invoke(true, false);
    code.push('}}else{if(' + FLIP + '){');
    invoke(false, true);
    code.push('}else{');
    invoke(false, false);
    code.push('}');
  }
  code.push('}}return ' + funcName);

  var codeStr = prefix.join('') + code.join('');
  var proc = new Function(codeStr);
  return proc()
}


brute.partial = bruteForcePlanner(false);
brute.full    = bruteForcePlanner(true);

var partition = genPartition$2;

var code = 'for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var _;if($)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m';

function genPartition$2(predicate, args) {
  var fargs ='abcdef'.split('').concat(args);
  var reads = [];
  if(predicate.indexOf('lo') >= 0) {
    reads.push('lo=e[k+n]');
  }
  if(predicate.indexOf('hi') >= 0) {
    reads.push('hi=e[k+o]');
  }
  fargs.push(
    code.replace('_', reads.join())
        .replace('$', predicate));
  return Function.apply(void 0, fargs)
}

var median = findMedian$1;

var genPartition$1 = partition;

var partitionStartLessThan$1 = genPartition$1('lo<p0', ['p0']);

var PARTITION_THRESHOLD = 8;   //Cut off for using insertion sort in findMedian

//Base case for median finding:  Use insertion sort
function insertionSort(d, axis, start, end, boxes, ids) {
  var elemSize = 2 * d;
  var boxPtr = elemSize * (start+1) + axis;
  for(var i=start+1; i<end; ++i, boxPtr+=elemSize) {
    var x = boxes[boxPtr];
    for(var j=i, ptr=elemSize*(i-1); 
        j>start && boxes[ptr+axis] > x; 
        --j, ptr-=elemSize) {
      //Swap
      var aPtr = ptr;
      var bPtr = ptr+elemSize;
      for(var k=0; k<elemSize; ++k, ++aPtr, ++bPtr) {
        var y = boxes[aPtr];
        boxes[aPtr] = boxes[bPtr];
        boxes[bPtr] = y;
      }
      var tmp = ids[j];
      ids[j] = ids[j-1];
      ids[j-1] = tmp;
    }
  }
}

//Find median using quick select algorithm
//  takes O(n) time with high probability
function findMedian$1(d, axis, start, end, boxes, ids) {
  if(end <= start+1) {
    return start
  }

  var lo       = start;
  var hi       = end;
  var mid      = ((end + start) >>> 1);
  var elemSize = 2*d;
  var pivot    = mid;
  var value    = boxes[elemSize*mid+axis];
  
  while(lo < hi) {
    if(hi - lo < PARTITION_THRESHOLD) {
      insertionSort(d, axis, lo, hi, boxes, ids);
      value = boxes[elemSize*mid+axis];
      break
    }
    
    //Select pivot using median-of-3
    var count  = hi - lo;
    var pivot0 = (Math.random()*count+lo)|0;
    var value0 = boxes[elemSize*pivot0 + axis];
    var pivot1 = (Math.random()*count+lo)|0;
    var value1 = boxes[elemSize*pivot1 + axis];
    var pivot2 = (Math.random()*count+lo)|0;
    var value2 = boxes[elemSize*pivot2 + axis];
    if(value0 <= value1) {
      if(value2 >= value1) {
        pivot = pivot1;
        value = value1;
      } else if(value0 >= value2) {
        pivot = pivot0;
        value = value0;
      } else {
        pivot = pivot2;
        value = value2;
      }
    } else {
      if(value1 >= value2) {
        pivot = pivot1;
        value = value1;
      } else if(value2 >= value0) {
        pivot = pivot0;
        value = value0;
      } else {
        pivot = pivot2;
        value = value2;
      }
    }

    //Swap pivot to end of array
    var aPtr = elemSize * (hi-1);
    var bPtr = elemSize * pivot;
    for(var i=0; i<elemSize; ++i, ++aPtr, ++bPtr) {
      var x = boxes[aPtr];
      boxes[aPtr] = boxes[bPtr];
      boxes[bPtr] = x;
    }
    var y = ids[hi-1];
    ids[hi-1] = ids[pivot];
    ids[pivot] = y;

    //Partition using pivot
    pivot = partitionStartLessThan$1(
      d, axis, 
      lo, hi-1, boxes, ids,
      value);

    //Swap pivot back
    var aPtr = elemSize * (hi-1);
    var bPtr = elemSize * pivot;
    for(var i=0; i<elemSize; ++i, ++aPtr, ++bPtr) {
      var x = boxes[aPtr];
      boxes[aPtr] = boxes[bPtr];
      boxes[bPtr] = x;
    }
    var y = ids[hi-1];
    ids[hi-1] = ids[pivot];
    ids[pivot] = y;

    //Swap pivot to last pivot
    if(mid < pivot) {
      hi = pivot-1;
      while(lo < hi && 
        boxes[elemSize*(hi-1)+axis] === value) {
        hi -= 1;
      }
      hi += 1;
    } else if(pivot < mid) {
      lo = pivot + 1;
      while(lo < hi &&
        boxes[elemSize*lo+axis] === value) {
        lo += 1;
      }
    } else {
      break
    }
  }

  //Make sure pivot is at start
  return partitionStartLessThan$1(
    d, axis, 
    start, mid, boxes, ids,
    boxes[elemSize*mid+axis])
}

var intersect = boxIntersectIter$1;

var pool$1 = pool$3;
var bits = twiddle;
var bruteForce = brute;
var bruteForcePartial = bruteForce.partial;
var bruteForceFull = bruteForce.full;
var sweep$1 = sweep$2;
var findMedian = median;
var genPartition = partition;

//Twiddle parameters
var BRUTE_FORCE_CUTOFF    = 128;       //Cut off for brute force search
var SCAN_CUTOFF           = (1<<22);   //Cut off for two way scan
var SCAN_COMPLETE_CUTOFF  = (1<<22);  

//Partition functions
var partitionInteriorContainsInterval = genPartition(
  '!(lo>=p0)&&!(p1>=hi)', 
  ['p0', 'p1']);

var partitionStartEqual = genPartition(
  'lo===p0',
  ['p0']);

var partitionStartLessThan = genPartition(
  'lo<p0',
  ['p0']);

var partitionEndLessThanEqual = genPartition(
  'hi<=p0',
  ['p0']);

var partitionContainsPoint = genPartition(
  'lo<=p0&&p0<=hi',
  ['p0']);

var partitionContainsPointProper = genPartition(
  'lo<p0&&p0<=hi',
  ['p0']);

//Frame size for iterative loop
var IFRAME_SIZE = 6;
var DFRAME_SIZE = 2;

//Data for box statck
var INIT_CAPACITY = 1024;
var BOX_ISTACK  = pool$1.mallocInt32(INIT_CAPACITY);
var BOX_DSTACK  = pool$1.mallocDouble(INIT_CAPACITY);

//Initialize iterative loop queue
function iterInit(d, count) {
  var levels = (8 * bits.log2(count+1) * (d+1))|0;
  var maxInts = bits.nextPow2(IFRAME_SIZE*levels);
  if(BOX_ISTACK.length < maxInts) {
    pool$1.free(BOX_ISTACK);
    BOX_ISTACK = pool$1.mallocInt32(maxInts);
  }
  var maxDoubles = bits.nextPow2(DFRAME_SIZE*levels);
  if(BOX_DSTACK.length < maxDoubles) {
    pool$1.free(BOX_DSTACK);
    BOX_DSTACK = pool$1.mallocDouble(maxDoubles);
  }
}

//Append item to queue
function iterPush(ptr,
  axis, 
  redStart, redEnd, 
  blueStart, blueEnd, 
  state, 
  lo, hi) {

  var iptr = IFRAME_SIZE * ptr;
  BOX_ISTACK[iptr]   = axis;
  BOX_ISTACK[iptr+1] = redStart;
  BOX_ISTACK[iptr+2] = redEnd;
  BOX_ISTACK[iptr+3] = blueStart;
  BOX_ISTACK[iptr+4] = blueEnd;
  BOX_ISTACK[iptr+5] = state;

  var dptr = DFRAME_SIZE * ptr;
  BOX_DSTACK[dptr]   = lo;
  BOX_DSTACK[dptr+1] = hi;
}

//Special case:  Intersect single point with list of intervals
function onePointPartial(
  d, axis, visit, flip,
  redStart, redEnd, red, redIndex,
  blueOffset, blue, blueId) {

  var elemSize = 2 * d;
  var bluePtr  = blueOffset * elemSize;
  var blueX    = blue[bluePtr + axis];

red_loop:
  for(var i=redStart, redPtr=redStart*elemSize; i<redEnd; ++i, redPtr+=elemSize) {
    var r0 = red[redPtr+axis];
    var r1 = red[redPtr+axis+d];
    if(blueX < r0 || r1 < blueX) {
      continue
    }
    if(flip && blueX === r0) {
      continue
    }
    var redId = redIndex[i];
    for(var j=axis+1; j<d; ++j) {
      var r0 = red[redPtr+j];
      var r1 = red[redPtr+j+d];
      var b0 = blue[bluePtr+j];
      var b1 = blue[bluePtr+j+d];
      if(r1 < b0 || b1 < r0) {
        continue red_loop
      }
    }
    var retval;
    if(flip) {
      retval = visit(blueId, redId);
    } else {
      retval = visit(redId, blueId);
    }
    if(retval !== void 0) {
      return retval
    }
  }
}

//Special case:  Intersect one point with list of intervals
function onePointFull(
  d, axis, visit,
  redStart, redEnd, red, redIndex,
  blueOffset, blue, blueId) {

  var elemSize = 2 * d;
  var bluePtr  = blueOffset * elemSize;
  var blueX    = blue[bluePtr + axis];

red_loop:
  for(var i=redStart, redPtr=redStart*elemSize; i<redEnd; ++i, redPtr+=elemSize) {
    var redId = redIndex[i];
    if(redId === blueId) {
      continue
    }
    var r0 = red[redPtr+axis];
    var r1 = red[redPtr+axis+d];
    if(blueX < r0 || r1 < blueX) {
      continue
    }
    for(var j=axis+1; j<d; ++j) {
      var r0 = red[redPtr+j];
      var r1 = red[redPtr+j+d];
      var b0 = blue[bluePtr+j];
      var b1 = blue[bluePtr+j+d];
      if(r1 < b0 || b1 < r0) {
        continue red_loop
      }
    }
    var retval = visit(redId, blueId);
    if(retval !== void 0) {
      return retval
    }
  }
}

//The main box intersection routine
function boxIntersectIter$1(
  d, visit, initFull,
  xSize, xBoxes, xIndex,
  ySize, yBoxes, yIndex) {

  //Reserve memory for stack
  iterInit(d, xSize + ySize);

  var top  = 0;
  var elemSize = 2 * d;
  var retval;

  iterPush(top++,
      0,
      0, xSize,
      0, ySize,
      initFull ? 16 : 0, 
      -Infinity, Infinity);
  if(!initFull) {
    iterPush(top++,
      0,
      0, ySize,
      0, xSize,
      1, 
      -Infinity, Infinity);
  }

  while(top > 0) {
    top  -= 1;

    var iptr = top * IFRAME_SIZE;
    var axis      = BOX_ISTACK[iptr];
    var redStart  = BOX_ISTACK[iptr+1];
    var redEnd    = BOX_ISTACK[iptr+2];
    var blueStart = BOX_ISTACK[iptr+3];
    var blueEnd   = BOX_ISTACK[iptr+4];
    var state     = BOX_ISTACK[iptr+5];

    var dptr = top * DFRAME_SIZE;
    var lo        = BOX_DSTACK[dptr];
    var hi        = BOX_DSTACK[dptr+1];

    //Unpack state info
    var flip      = (state & 1);
    var full      = !!(state & 16);

    //Unpack indices
    var red       = xBoxes;
    var redIndex  = xIndex;
    var blue      = yBoxes;
    var blueIndex = yIndex;
    if(flip) {
      red         = yBoxes;
      redIndex    = yIndex;
      blue        = xBoxes;
      blueIndex   = xIndex;
    }

    if(state & 2) {
      redEnd = partitionStartLessThan(
        d, axis,
        redStart, redEnd, red, redIndex,
        hi);
      if(redStart >= redEnd) {
        continue
      }
    }
    if(state & 4) {
      redStart = partitionEndLessThanEqual(
        d, axis,
        redStart, redEnd, red, redIndex,
        lo);
      if(redStart >= redEnd) {
        continue
      }
    }
    
    var redCount  = redEnd  - redStart;
    var blueCount = blueEnd - blueStart;

    if(full) {
      if(d * redCount * (redCount + blueCount) < SCAN_COMPLETE_CUTOFF) {
        retval = sweep$1.scanComplete(
          d, axis, visit, 
          redStart, redEnd, red, redIndex,
          blueStart, blueEnd, blue, blueIndex);
        if(retval !== void 0) {
          return retval
        }
        continue
      }
    } else {
      if(d * Math.min(redCount, blueCount) < BRUTE_FORCE_CUTOFF) {
        //If input small, then use brute force
        retval = bruteForcePartial(
            d, axis, visit, flip,
            redStart,  redEnd,  red,  redIndex,
            blueStart, blueEnd, blue, blueIndex);
        if(retval !== void 0) {
          return retval
        }
        continue
      } else if(d * redCount * blueCount < SCAN_CUTOFF) {
        //If input medium sized, then use sweep and prune
        retval = sweep$1.scanBipartite(
          d, axis, visit, flip, 
          redStart, redEnd, red, redIndex,
          blueStart, blueEnd, blue, blueIndex);
        if(retval !== void 0) {
          return retval
        }
        continue
      }
    }
    
    //First, find all red intervals whose interior contains (lo,hi)
    var red0 = partitionInteriorContainsInterval(
      d, axis, 
      redStart, redEnd, red, redIndex,
      lo, hi);

    //Lower dimensional case
    if(redStart < red0) {

      if(d * (red0 - redStart) < BRUTE_FORCE_CUTOFF) {
        //Special case for small inputs: use brute force
        retval = bruteForceFull(
          d, axis+1, visit,
          redStart, red0, red, redIndex,
          blueStart, blueEnd, blue, blueIndex);
        if(retval !== void 0) {
          return retval
        }
      } else if(axis === d-2) {
        if(flip) {
          retval = sweep$1.sweepBipartite(
            d, visit,
            blueStart, blueEnd, blue, blueIndex,
            redStart, red0, red, redIndex);
        } else {
          retval = sweep$1.sweepBipartite(
            d, visit,
            redStart, red0, red, redIndex,
            blueStart, blueEnd, blue, blueIndex);
        }
        if(retval !== void 0) {
          return retval
        }
      } else {
        iterPush(top++,
          axis+1,
          redStart, red0,
          blueStart, blueEnd,
          flip,
          -Infinity, Infinity);
        iterPush(top++,
          axis+1,
          blueStart, blueEnd,
          redStart, red0,
          flip^1,
          -Infinity, Infinity);
      }
    }

    //Divide and conquer phase
    if(red0 < redEnd) {

      //Cut blue into 3 parts:
      //
      //  Points < mid point
      //  Points = mid point
      //  Points > mid point
      //
      var blue0 = findMedian(
        d, axis, 
        blueStart, blueEnd, blue, blueIndex);
      var mid = blue[elemSize * blue0 + axis];
      var blue1 = partitionStartEqual(
        d, axis,
        blue0, blueEnd, blue, blueIndex,
        mid);

      //Right case
      if(blue1 < blueEnd) {
        iterPush(top++,
          axis,
          red0, redEnd,
          blue1, blueEnd,
          (flip|4) + (full ? 16 : 0),
          mid, hi);
      }

      //Left case
      if(blueStart < blue0) {
        iterPush(top++,
          axis,
          red0, redEnd,
          blueStart, blue0,
          (flip|2) + (full ? 16 : 0),
          lo, mid);
      }

      //Center case (the hard part)
      if(blue0 + 1 === blue1) {
        //Optimization: Range with exactly 1 point, use a brute force scan
        if(full) {
          retval = onePointFull(
            d, axis, visit,
            red0, redEnd, red, redIndex,
            blue0, blue, blueIndex[blue0]);
        } else {
          retval = onePointPartial(
            d, axis, visit, flip,
            red0, redEnd, red, redIndex,
            blue0, blue, blueIndex[blue0]);
        }
        if(retval !== void 0) {
          return retval
        }
      } else if(blue0 < blue1) {
        var red1;
        if(full) {
          //If full intersection, need to handle special case
          red1 = partitionContainsPoint(
            d, axis,
            red0, redEnd, red, redIndex,
            mid);
          if(red0 < red1) {
            var redX = partitionStartEqual(
              d, axis,
              red0, red1, red, redIndex,
              mid);
            if(axis === d-2) {
              //Degenerate sweep intersection:
              //  [red0, redX] with [blue0, blue1]
              if(red0 < redX) {
                retval = sweep$1.sweepComplete(
                  d, visit,
                  red0, redX, red, redIndex,
                  blue0, blue1, blue, blueIndex);
                if(retval !== void 0) {
                  return retval
                }
              }

              //Normal sweep intersection:
              //  [redX, red1] with [blue0, blue1]
              if(redX < red1) {
                retval = sweep$1.sweepBipartite(
                  d, visit,
                  redX, red1, red, redIndex,
                  blue0, blue1, blue, blueIndex);
                if(retval !== void 0) {
                  return retval
                }
              }
            } else {
              if(red0 < redX) {
                iterPush(top++,
                  axis+1,
                  red0, redX,
                  blue0, blue1,
                  16,
                  -Infinity, Infinity);
              }
              if(redX < red1) {
                iterPush(top++,
                  axis+1,
                  redX, red1,
                  blue0, blue1,
                  0,
                  -Infinity, Infinity);
                iterPush(top++,
                  axis+1,
                  blue0, blue1,
                  redX, red1,
                  1,
                  -Infinity, Infinity);
              }
            }
          }
        } else {
          if(flip) {
            red1 = partitionContainsPointProper(
              d, axis,
              red0, redEnd, red, redIndex,
              mid);
          } else {
            red1 = partitionContainsPoint(
              d, axis,
              red0, redEnd, red, redIndex,
              mid);
          }
          if(red0 < red1) {
            if(axis === d-2) {
              if(flip) {
                retval = sweep$1.sweepBipartite(
                  d, visit,
                  blue0, blue1, blue, blueIndex,
                  red0, red1, red, redIndex);
              } else {
                retval = sweep$1.sweepBipartite(
                  d, visit,
                  red0, red1, red, redIndex,
                  blue0, blue1, blue, blueIndex);
              }
            } else {
              iterPush(top++,
                axis+1,
                red0, red1,
                blue0, blue1,
                flip,
                -Infinity, Infinity);
              iterPush(top++,
                axis+1,
                blue0, blue1,
                red0, red1,
                flip^1,
                -Infinity, Infinity);
            }
          }
        }
      }
    }
  }
}

var boxIntersect_1 = boxIntersectWrapper;

var pool = pool$3;
var sweep = sweep$2;
var boxIntersectIter = intersect;

function boxEmpty(d, box) {
  for(var j=0; j<d; ++j) {
    if(!(box[j] <= box[j+d])) {
      return true
    }
  }
  return false
}

//Unpack boxes into a flat typed array, remove empty boxes
function convertBoxes(boxes, d, data, ids) {
  var ptr = 0;
  var count = 0;
  for(var i=0, n=boxes.length; i<n; ++i) {
    var b = boxes[i];
    if(boxEmpty(d, b)) {
      continue
    }
    for(var j=0; j<2*d; ++j) {
      data[ptr++] = b[j];
    }
    ids[count++] = i;
  }
  return count
}

//Perform type conversions, check bounds
function boxIntersect$1(red, blue, visit, full) {
  var n = red.length;
  var m = blue.length;

  //If either array is empty, then we can skip this whole thing
  if(n <= 0 || m <= 0) {
    return
  }

  //Compute dimension, if it is 0 then we skip
  var d = (red[0].length)>>>1;
  if(d <= 0) {
    return
  }

  var retval;

  //Convert red boxes
  var redList  = pool.mallocDouble(2*d*n);
  var redIds   = pool.mallocInt32(n);
  n = convertBoxes(red, d, redList, redIds);

  if(n > 0) {
    if(d === 1 && full) {
      //Special case: 1d complete
      sweep.init(n);
      retval = sweep.sweepComplete(
        d, visit, 
        0, n, redList, redIds,
        0, n, redList, redIds);
    } else {

      //Convert blue boxes
      var blueList = pool.mallocDouble(2*d*m);
      var blueIds  = pool.mallocInt32(m);
      m = convertBoxes(blue, d, blueList, blueIds);

      if(m > 0) {
        sweep.init(n+m);

        if(d === 1) {
          //Special case: 1d bipartite
          retval = sweep.sweepBipartite(
            d, visit, 
            0, n, redList,  redIds,
            0, m, blueList, blueIds);
        } else {
          //General case:  d>1
          retval = boxIntersectIter(
            d, visit,    full,
            n, redList,  redIds,
            m, blueList, blueIds);
        }

        pool.free(blueList);
        pool.free(blueIds);
      }
    }

    pool.free(redList);
    pool.free(redIds);
  }

  return retval
}


var RESULT;

function appendItem(i,j) {
  RESULT.push([i,j]);
}

function intersectFullArray(x) {
  RESULT = [];
  boxIntersect$1(x, x, appendItem, true);
  return RESULT
}

function intersectBipartiteArray(x, y) {
  RESULT = [];
  boxIntersect$1(x, y, appendItem, false);
  return RESULT
}

//User-friendly wrapper, handle full input and no-visitor cases
function boxIntersectWrapper(arg0, arg1, arg2) {
  switch(arguments.length) {
    case 1:
      return intersectFullArray(arg0)
    case 2:
      if(typeof arg1 === 'function') {
        return boxIntersect$1(arg0, arg0, arg1, true)
      } else {
        return intersectBipartiteArray(arg0, arg1)
      }
    case 3:
      return boxIntersect$1(arg0, arg1, arg2, false)
    default:
      throw new Error('box-intersect: Invalid arguments')
  }
}

var boxIntersect = /*@__PURE__*/getDefaultExportFromCjs(boxIntersect_1);

/*
 * 	Every frame, entities with this component will get mutually checked for colliions
 * 
 *   * cylinder: flag for checking collisions as a vertical cylindar (rather than AABB)
 *   * collideBits: category for this entity
 *   * collideMask: categories this entity collides with
 *   * callback: function(other_id) - called when `own.collideBits & other.collideMask` is true
 * 
 * 
 * 		Notes:
 * 	Set collideBits=0 for entities like bullets, which can collide with things 
 * 		but are never the target of a collision.
 * 	Set collideMask=0 for things with no callback - things that get collided with,
 * 		but don't themselves instigate collisions.
 * 
 */



function collideEntitiesComp (noa) {

    var intervals = [];

    return {

        name: 'collideEntities',

        order: 70,

        state: {
            cylinder: false,
            collideBits: 1 | 0,
            collideMask: 1 | 0,
            callback: null,
        },

        onAdd: null,

        onRemove: function (eid, state) {
            state.callback = null;
        },


        system: function entityCollider(dt, states) {
            var ents = noa.ents;

            // data struct that boxIntersect looks for
            // - array of [lo, lo, lo, hi, hi, hi] extents
            // Track valid states for index mapping after filtering
            var validStates = [];
            for (var i = 0; i < states.length; i++) {
                var id = states[i].__id;
                var dat = ents.getPositionData(id);
                if (!dat) continue // defensive check for mid-frame deletion
                intervals[validStates.length] = dat._extents;
                validStates.push(states[i]);
            }
            intervals.length = validStates.length;

            // run the intersect library
            boxIntersect(intervals, function (a, b) {
                var stateA = validStates[a];
                var stateB = validStates[b];
                if (!stateA || !stateB) return
                var intervalA = intervals[a];
                var intervalB = intervals[b];
                if (cylindricalHitTest(stateA, stateB, intervalA, intervalB)) {
                    handleCollision(noa, stateA, stateB);
                }
            });

        }
    }



    /*
     * 
     * 		IMPLEMENTATION
     * 
     */


    function handleCollision(noa, stateA, stateB) {
        var idA = stateA.__id;
        var idB = stateB.__id;

        // entities really do overlap, so check masks and call event handlers
        if (stateA.collideMask & stateB.collideBits) {
            if (stateA.callback) stateA.callback(idB);
        }
        if (stateB.collideMask & stateA.collideBits) {
            if (stateB.callback) stateB.callback(idA);
        }

        // general pairwise handler
        noa.ents.onPairwiseEntityCollision(idA, idB);
    }



    // For entities whose extents overlap, 
    // test if collision still happens when taking cylinder flags into account

    function cylindricalHitTest(stateA, stateB, intervalA, intervalB) {
        if (stateA.cylinder) {
            if (stateB.cylinder) {
                return cylinderCylinderTest(intervalA, intervalB)
            } else {
                return cylinderBoxTest(intervalA, intervalB)
            }
        } else if (stateB.cylinder) {
            return cylinderBoxTest(intervalB, intervalA)
        }
        return true
    }




    // Cylinder-cylinder hit test (AABBs are known to overlap)
    // given their extent arrays [lo, lo, lo, hi, hi, hi]

    function cylinderCylinderTest(a, b) {
        // distance between cylinder centers
        var rada = (a[3] - a[0]) / 2;
        var radb = (b[3] - b[0]) / 2;
        var dx = a[0] + rada - (b[0] + radb);
        var dz = a[2] + rada - (b[2] + radb);
        // collide if dist <= sum of radii
        var distsq = dx * dx + dz * dz;
        var radsum = rada + radb;
        return (distsq <= radsum * radsum)
    }




    // Cylinder-Box hit test (AABBs are known to overlap)
    // given their extent arrays [lo, lo, lo, hi, hi, hi]

    function cylinderBoxTest(cyl, cube) {
        // X-z center of cylinder
        var rad = (cyl[3] - cyl[0]) / 2;
        var cx = cyl[0] + rad;
        var cz = cyl[2] + rad;
        // point in X-Z square closest to cylinder
        var px = clamp(cx, cube[0], cube[3]);
        var pz = clamp(cz, cube[2], cube[5]);
        // collision if distance from that point to circle <= cylinder radius
        var dx = px - cx;
        var dz = pz - cz;
        var distsq = dx * dx + dz * dz;
        return (distsq <= rad * rad)
    }

    function clamp(val, lo, hi) {
        return (val < lo) ? lo : (val > hi) ? hi : val
    }




}

function collideTerrainComp (noa) {
    return {

        name: 'collideTerrain',

        order: 0,

        state: {
            callback: null
        },

        onAdd: function (eid, state) {
            // add collide handler for physics engine to call
            var ents = noa.entities;
            if (ents.hasPhysics(eid)) {
                var body = ents.getPhysics(eid).body;
                body.onCollide = function bodyOnCollide(impulse) {
                    var cb = noa.ents.getCollideTerrain(eid).callback;
                    if (cb) cb(impulse, eid);
                };
            }
        },

        onRemove: function (eid, state) {
            var ents = noa.entities;
            if (ents.hasPhysics(eid)) {
                ents.getPhysics(eid).body.onCollide = null;
            }
            state.callback = null; // clear user callback to prevent closure retention
        },



    }
}

/**
 * Component for the player entity, when active hides the player's mesh 
 * when camera zoom is less than a certain amount
 */

function fadeOnZoomComp (noa) {
    return {

        name: 'fadeOnZoom',

        order: 99,

        state: {
            cutoff: 1.5,
        },

        onAdd: null,

        onRemove: null,

        system: function fadeOnZoomProc(dt, states) {
            // Use minimum to hide immediately when switching to first-person
            var zoomMetric = Math.min(noa.camera.currentZoom, noa.camera.zoomDistance);
            for (var i = 0; i < states.length; i++) {
                checkZoom(states[i], zoomMetric, noa);
            }
        }
    }
}


function checkZoom(state, zoomMetric, noa) {
    if (!noa.ents.hasMesh(state.__id)) return
    var mesh = noa.ents.getMeshData(state.__id).mesh;
    if (!mesh) return

    var shouldHide = (zoomMetric < state.cutoff);
    var visible = !shouldHide;

    // Cache targets per entity to avoid per-frame allocations.
    var targets = state._fadeTargets;
    if (!targets || state._fadeTargetsMesh !== mesh) {
        targets = [];
        if (mesh.getChildMeshes) {
            targets = mesh.getChildMeshes(false); // false = all descendants (recursive)
        }
        targets.push(mesh);
        state._fadeTargets = targets;
        state._fadeTargetsMesh = mesh;
    }

    var ADDED_FLAG = 'noa_added_to_scene';
    for (var i = 0; i < targets.length; i++) {
        var m = targets[i];
        if (!m) continue
        if (m.metadata && m.metadata[ADDED_FLAG] !== undefined) {
            noa.rendering.setMeshVisibility(m, visible);
        } else {
            // Fallback for unregistered/transform nodes
            m.isVisible = visible;
        }
    }
}

/*
 * Indicates that an entity should be moved to another entity's position each tick,
 * possibly by a fixed offset, and the same for renderPositions each render
 */

function followsEntityComp (noa) {

    return {

        name: 'followsEntity',

        order: 50,

        state: {
            entity: 0 | 0,
            offset: null,
            onTargetMissing: null,
        },

        onAdd: function (eid, state) {
            var off = glVec3.create();
            state.offset = (state.offset) ? glVec3.copy(off, state.offset) : off;
            updatePosition(state);
            updateRenderPosition(state);
        },

        onRemove: function (eid, state) {
            state.onTargetMissing = null;
            state.offset = null;
        },


        // on tick, copy over regular positions
        system: function followEntity(dt, states) {
            for (var i = 0; i < states.length; i++) {
                updatePosition(states[i]);
            }
        },


        // on render, copy over render positions
        renderSystem: function followEntityMesh(dt, states) {
            for (var i = 0; i < states.length; i++) {
                updateRenderPosition(states[i]);
            }
        }
    }



    function updatePosition(state) {
        var id = state.__id;
        var self = noa.ents.getPositionData(id);
        if (!self) return // defensive check for mid-frame deletion
        var other = noa.ents.getPositionData(state.entity);
        if (!other) {
            if (state.onTargetMissing) state.onTargetMissing(id);
            noa.ents.removeComponent(id, noa.ents.names.followsEntity);
        } else {
            glVec3.add(self._localPosition, other._localPosition, state.offset);
        }
    }

    function updateRenderPosition(state) {
        var id = state.__id;
        var self = noa.ents.getPositionData(id);
        if (!self) return // defensive check for mid-frame deletion
        var other = noa.ents.getPositionData(state.entity);
        if (other) {
            glVec3.add(self._renderPosition, other._renderPosition, state.offset);
        }
    }

}

/**
 * Label component - attaches floating 3D text to an entity.
 *
 * Supports:
 * - Billboarding (text always faces camera)
 * - Position offset from entity center
 * - Dynamic text updates
 * - Automatic world origin rebasing
 *
 * @example
 * ```js
 * // Add a label to an entity
 * noa.ents.addComponent(entityId, noa.ents.names.label, {
 *     text: 'Player Name',
 *     offset: [0, 2.5, 0],
 *     billboard: true,
 *     options: {
 *         letterHeight: 0.4,
 *         color: '#FFFF00',
 *     }
 * })
 *
 * // Update label text dynamically
 * const labelState = noa.ents.getLabel(entityId)
 * labelState.text = 'New Name'
 * ```
 *
 * @param {import('../index').Engine} noa
 */

function labelComp (noa) {

    return {

        name: 'label',

        order: 85, // After shadow (80), before mesh render updates

        state: {
            /** Text content to display */
            text: '',
            /** Offset from entity position [x, y, z] */
            offset: null,
            /** Text rendering options */
            options: null,
            /** Whether to billboard (face camera) */
            billboard: true,
            /** @internal - TextHandle from text system */
            _handle: null,
            /** @internal - Cached text for change detection */
            _cachedText: '',
            /** @internal - Whether we're waiting for the text system to init */
            _waitingForText: false,
        },


        onAdd: function (eid, state) {
            // Initialize offset
            if (!state.offset) {
                state.offset = [0, 1.5, 0]; // Default: above entity
            } else {
                state.offset = glVec3.clone(state.offset);
            }

            // Initialize options
            state.options = Object.assign({
                letterHeight: 0.5,
                letterThickness: 0.05,
                color: '#FFFFFF',
                alpha: 1,
                anchor: 'center',
            }, state.options || {});

            state._cachedText = state.text;

            // Create text if system is ready
            createLabelText(noa, eid, state);
        },


        onRemove: function (eid, state) {
            if (state._handle) {
                state._handle.dispose();
                state._handle = null;
            }
            state.offset = null;
            state.options = null;
            state._waitingForText = false;
        },


        // Tick system: handle text updates
        system: function labelSystem(dt, states) {
            for (var i = 0; i < states.length; i++) {
                var state = states[i];

                // Check for text content changes
                if (state.text !== state._cachedText) {
                    state._cachedText = state.text;
                    updateLabelText(noa, state.__id, state);
                }
            }
        },


        // Render system: update label positions to match entity render positions
        renderSystem: function labelRenderSystem(dt, states) {
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                if (!state._handle || !state._handle.mesh) continue

                var posData = noa.ents.getPositionData(state.__id);
                if (!posData) continue // defensive check for mid-frame deletion

                var rpos = posData._renderPosition;
                var mesh = state._handle.mesh;

                // Position = render position + offset
                mesh.position.copyFromFloats(
                    rpos[0] + state.offset[0],
                    rpos[1] + state.offset[1],
                    rpos[2] + state.offset[2]
                );
            }
        }

    }


    function createLabelText(noa, eid, state) {
        if (!noa.text || noa.text.initFailed) return
        if (!noa.text.ready) {
            if (state._waitingForText) return
            state._waitingForText = true;
            noa.text.onReady(() => {
                state._waitingForText = false;
                if (!state._handle && noa.ents.getPositionData(state.__id)) {
                    createLabelText(noa, state.__id, state);
                }
            });
            return
        }
        state._waitingForText = false;

        if (!state.text) return

        // Get entity position for initial placement
        var posData = noa.ents.getPositionData(eid);
        var position = posData ? posData.position.slice() : [0, 0, 0];
        glVec3.add(position, position, state.offset);

        var options = Object.assign({}, state.options, { position });

        // Create billboard or regular text
        state._handle = state.billboard
            ? noa.text.createBillboardText(state.text, options)
            : noa.text.createWorldText(state.text, options);
    }


    function updateLabelText(noa, eid, state) {
        if (!noa.text) return
        if (noa.text.initFailed || !noa.text.ready) {
            if (state._handle) {
                state._handle.dispose();
                state._handle = null;
            }
            return
        }

        if (!state.text) {
            // Empty text - dispose existing
            if (state._handle) {
                state._handle.dispose();
                state._handle = null;
            }
            return
        }

        if (state._handle) {
            // Update existing - get position from current mesh
            var mesh = state._handle.mesh;
            var position = [
                mesh.position.x + noa.worldOriginOffset[0],
                mesh.position.y + noa.worldOriginOffset[1],
                mesh.position.z + noa.worldOriginOffset[2],
            ];
            var options = Object.assign({}, state.options, { position });

            // Dispose and recreate (MeshWriter doesn't support in-place updates)
            var wasBillboard = state._handle._billboard;
            state._handle.dispose();

            state._handle = wasBillboard
                ? noa.text.createBillboardText(state.text, options)
                : noa.text.createWorldText(state.text, options);
        } else {
            // Create new
            createLabelText(noa, eid, state);
        }
    }
}


/**
 * @typedef {object} LabelState
 * @property {string} text - Text content to display
 * @property {number[]} offset - Offset from entity position [x, y, z]
 * @property {object} options - Text rendering options
 * @property {boolean} billboard - Whether to billboard (face camera)
 */

function meshComp (noa) {
    return {

        name: 'mesh',

        order: 100,

        state: {
            mesh: null,
            offset: null
        },


        onAdd: function (eid, state) {
            // implicitly assume there's already a position component
            var posDat = noa.ents.getPositionData(eid);
            if (state.mesh) {
                noa.rendering.addMeshToScene(state.mesh, false, posDat.position);
            } else {
                throw new Error('Mesh component added without a mesh - probably a bug!')
            }
            if (!state.offset) state.offset = glVec3.create();

            // set mesh to correct position
            var rpos = posDat._renderPosition;
            state.mesh.position.copyFromFloats(
                rpos[0] + state.offset[0],
                rpos[1] + state.offset[1],
                rpos[2] + state.offset[2]);
        },


        onRemove: function (eid, state) {
            state.mesh.dispose();
        },



        renderSystem: function (dt, states) {
            // before render move each mesh to its render position, 
            // set by the physics engine or driving logic
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                var id = state.__id;

                var rpos = noa.ents.getPositionData(id)._renderPosition;
                state.mesh.position.copyFromFloats(
                    rpos[0] + state.offset[0],
                    rpos[1] + state.offset[1],
                    rpos[2] + state.offset[2]);
            }
        }


    }
}

/** 
 * 
 * State object of the `movement` component
 * 
*/
function MovementState() {
    this.heading = 0; // radians
    this.running = false;
    this.jumping = false;

    // options
    this.maxSpeed = 10;
    this.moveForce = 30;
    this.responsiveness = 15;
    this.runningFriction = 0;
    this.standingFriction = 2;

    // jumps
    this.airMoveMult = 0.5;
    this.jumpImpulse = 10;
    this.jumpForce = 12;
    this.jumpTime = 500; // ms
    this.airJumps = 1;

    // internal state
    this._jumpCount = 0;
    this._currjumptime = 0;
    this._isJumping = false;
}





/**
 * Movement component. State stores settings like jump height, etc.,
 * as well as current state (running, jumping, heading angle).
 * Processor checks state and applies movement/friction/jump forces
 * to the entity's physics body. 
 * @param {import('..').Engine} noa
*/

function movementComp (noa) {
    return {

        name: 'movement',

        order: 30,

        state: new MovementState(),

        onAdd: null,

        onRemove: null,


        system: function movementProcessor(dt, states) {
            var ents = noa.entities;
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                var phys = ents.getPhysics(state.__id);
                if (phys) applyMovementPhysics(dt, state, phys.body);
            }
        }


    }
}


var tempvec = glVec3.create();
var tempvec2 = glVec3.create();
var zeroVec = glVec3.create();


/**
 * @param {number} dt 
 * @param {MovementState} state 
 * @param {*} body 
*/

function applyMovementPhysics(dt, state, body) {
    // move implementation originally written as external module
    //   see https://github.com/fenomas/voxel-fps-controller
    //   for original code

    // jumping
    var onGround = (body.atRestY() < 0);
    var canjump = (onGround || state._jumpCount < state.airJumps);
    if (onGround) {
        state._isJumping = false;
        state._jumpCount = 0;
    }

    // process jump input
    if (state.jumping) {
        if (state._isJumping) { // continue previous jump
            if (state._currjumptime > 0) {
                var jf = state.jumpForce;
                if (state._currjumptime < dt) jf *= state._currjumptime / dt;
                body.applyForce([0, jf, 0]);
                state._currjumptime -= dt;
            }
        } else if (canjump) { // start new jump
            state._isJumping = true;
            if (!onGround) state._jumpCount++;
            state._currjumptime = state.jumpTime;
            body.applyImpulse([0, state.jumpImpulse, 0]);
            // clear downward velocity on airjump
            if (!onGround && body.velocity[1] < 0) body.velocity[1] = 0;
        }
    } else {
        state._isJumping = false;
    }

    // apply movement forces if entity is moving, otherwise just friction
    var m = tempvec;
    var push = tempvec2;
    if (state.running) {

        var speed = state.maxSpeed;
        // todo: add crouch/sprint modifiers if needed
        // if (state.sprint) speed *= state.sprintMoveMult
        // if (state.crouch) speed *= state.crouchMoveMult
        glVec3.set(m, 0, 0, speed);

        // rotate move vector to entity's heading
        glVec3.rotateY(m, m, zeroVec, state.heading);

        // push vector to achieve desired speed & dir
        // following code to adjust 2D velocity to desired amount is patterned on Quake: 
        // https://github.com/id-Software/Quake-III-Arena/blob/master/code/game/bg_pmove.c#L275
        glVec3.sub(push, m, body.velocity);
        push[1] = 0;
        var pushLen = glVec3.len(push);
        glVec3.normalize(push, push);

        if (pushLen > 0) {
            // pushing force vector
            var canPush = state.moveForce;
            if (!onGround) canPush *= state.airMoveMult;

            // apply final force
            var pushAmt = state.responsiveness * pushLen;
            if (canPush > pushAmt) canPush = pushAmt;

            glVec3.scale(push, push, canPush);
            body.applyForce(push);
        }

        // different friction when not moving
        // idea from Sonic: http://info.sonicretro.org/SPG:Running
        body.friction = state.runningFriction;
    } else {
        body.friction = state.standingFriction;
    }
}

/** 
 * @module
 * @internal
 */



class PhysicsState {
    constructor() {
        /** @type {import('voxel-physics-engine').RigidBody} */
        this.body = null;
    }
}


/**
 * Physics component, stores an entity's physics engbody.
 * @param {import('..').Engine} noa
*/

function physicsComp (noa) {

    return {

        name: 'physics',

        order: 40,

        state: new PhysicsState,

        onAdd: function (entID, state) {
            state.body = noa.physics.addBody();
            // implicitly assume body has a position component, to get size
            var posDat = noa.ents.getPositionData(state.__id);
            setPhysicsFromPosition(state, posDat);
        },


        onRemove: function (entID, state) {
            // update position before removing
            // this lets entity wind up at e.g. the result of a collision
            // even if physics component is removed in collision handler
            if (noa.ents.hasPosition(state.__id)) {
                var pdat = noa.ents.getPositionData(state.__id);
                setPositionFromPhysics(state, pdat);
                backtrackRenderPos(state, pdat, 0, false);
            }
            // Clear body callbacks before removal to prevent memory retention
            if (state.body) {
                state.body.onStep = null;
                state.body.onCollide = null;
            }
            noa.physics.removeBody(state.body);
        },


        system: function (dt, states) {
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                var pdat = noa.ents.getPositionData(state.__id);
                if (!pdat) continue // defensive check for mid-frame deletion
                setPositionFromPhysics(state, pdat);
            }
        },


        renderSystem: function (dt, states) {

            var tickPos = noa.positionInCurrentTick;
            var tickTime = 1000 / noa.container._shell.tickRate;
            tickTime *= noa.timeScale;
            var tickMS = tickPos * tickTime;

            // tickMS is time since last physics engine tick
            // to avoid temporal aliasing, render the state as if lerping between
            // the last position and the next one
            // since the entity data is the "next" position this amounts to
            // offsetting each entity into the past by tickRate - dt
            // http://gafferongames.com/game-physics/fix-your-timestep/

            var backtrackAmt = (tickMS - tickTime) / 1000;
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                var id = state.__id;
                var pdat = noa.ents.getPositionData(id);
                if (!pdat) continue // defensive check for mid-frame deletion
                var smoothed = noa.ents.cameraSmoothed(id);
                backtrackRenderPos(state, pdat, backtrackAmt, smoothed);
            }
        }

    }

}



// var offset = vec3.create()
var local = glVec3.create();

function setPhysicsFromPosition(physState, posState) {
    var box = physState.body.aabb;
    var ext = posState._extents;
    glVec3.copy(box.base, ext);
    glVec3.set(box.vec, posState.width, posState.height, posState.width);
    glVec3.add(box.max, box.base, box.vec);
}


function setPositionFromPhysics(physState, posState) {
    var base = physState.body.aabb.base;
    var hw = posState.width / 2;
    glVec3.set(posState._localPosition, base[0] + hw, base[1], base[2] + hw);
}


function backtrackRenderPos(physState, posState, backtrackAmt, smoothed) {
    // pos = pos + backtrack * body.velocity
    var vel = physState.body.velocity;
    glVec3.scaleAndAdd(local, posState._localPosition, vel, backtrackAmt);

    // smooth out update if component is present
    // (this is set after sudden movements like auto-stepping)
    if (smoothed) glVec3.lerp(local, posState._renderPosition, local, 0.3);

    // copy values over to renderPosition, 
    glVec3.copy(posState._renderPosition, local);
}

/** 
 * @module 
 * @internal 
 */




// definition for this component's state object
class PositionState {
    constructor() {
        /** Position in global coords (may be low precision) 
         * @type {null | number[]} */
        this.position = null;
        this.width = 0.8;
        this.height = 0.8;

        /** Precise position in local coords
         * @type {null | number[]} */
        this._localPosition = null;

        /** [x,y,z] in LOCAL COORDS
         * @type {null | number[]} */
        this._renderPosition = null;

        /** [lo,lo,lo, hi,hi,hi] in LOCAL COORDS
         * @type {null | number[]} */
        this._extents = null;
    }
}




/**
 * 	Component holding entity's position, width, and height.
 *  By convention, entity's "position" is the bottom center of its AABB
 * 
 *  Of the various properties, _localPosition is the "real", 
 *  single-source-of-truth position. Others are derived.
 *  Local coords are relative to `noa.worldOriginOffset`.
 * @param {import('..').Engine} noa
*/

function positionComp (noa) {

    return {

        name: 'position',

        order: 60,

        state: new PositionState,

        onAdd: function (eid, state) {
            // copy position into a plain array
            var pos = [0, 0, 0];
            if (state.position) glVec3.copy(pos, state.position);
            state.position = pos;

            state._localPosition = glVec3.create();
            state._renderPosition = glVec3.create();
            state._extents = new Float32Array(6);

            // on init only, set local from global
            noa.globalToLocal(state.position, null, state._localPosition);
            glVec3.copy(state._renderPosition, state._localPosition);
            updatePositionExtents(state);
        },

        onRemove: null,



        system: function (dt, states) {
            var off = noa.worldOriginOffset;
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                glVec3.add(state.position, state._localPosition, off);
                updatePositionExtents(state);
            }
        },


    }
}



// update an entity's position state `_extents` 
function updatePositionExtents(state) {
    var hw = state.width / 2;
    var lpos = state._localPosition;
    var ext = state._extents;
    ext[0] = lpos[0] - hw;
    ext[1] = lpos[1];
    ext[2] = lpos[2] - hw;
    ext[3] = lpos[0] + hw;
    ext[4] = lpos[1] + state.height;
    ext[5] = lpos[2] + hw;
}

/**
 * 
 * Input processing component - gets (key) input state and  
 * applies it to receiving entities by updating their movement 
 * component state (heading, movespeed, jumping, etc.)
 * 
 */

function receivesInputsComp (noa) {
    return {

        name: 'receivesInputs',

        order: 20,

        state: {},

        onAdd: null,

        onRemove: null,

        system: function inputProcessor(dt, states) {
            var ents = noa.entities;
            var inputState = noa.inputs.state;
            var camHeading = noa.camera.heading;

            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                var moveState = ents.getMovement(state.__id);
                setMovementState(moveState, inputState, camHeading);
            }
        }

    }
}



/**
 * @param {import('../components/movement').MovementState} state 
 * @param {Object<string, boolean>} inputs 
 * @param {number} camHeading 
*/

function setMovementState(state, inputs, camHeading) {
    state.jumping = !!inputs.jump;

    var fb = inputs.forward ? (inputs.backward ? 0 : 1) : (inputs.backward ? -1 : 0);
    var rl = inputs.right ? (inputs.left ? 0 : 1) : (inputs.left ? -1 : 0);

    if ((fb | rl) === 0) {
        state.running = false;
    } else {
        state.running = true;
        if (fb) {
            if (fb == -1) camHeading += Math.PI;
            if (rl) {
                camHeading += Math.PI / 4 * fb * rl; // didn't plan this but it works!
            }
        } else {
            camHeading += rl * Math.PI / 2;
        }
        state.heading = camHeading;
    }

}

/** @param {import('../index').Engine} noa  */
function shadowComp (noa, distance = 10) {

    var shadowDist = distance;

    // create a mesh to re-use for shadows
    var scene = noa.rendering.getScene();
    var disc = discBuilder.CreateDisc('shadow', { radius: 0.75, tessellation: 30 }, scene);
    disc.rotation.x = Math.PI / 2;
    var mat = noa.rendering.makeStandardMaterial('shadow_component_mat');
    mat.diffuseColor.set(0, 0, 0);
    mat.ambientColor.set(0, 0, 0);
    mat.alpha = 0.5;
    disc.material = mat;
    mat.freeze();

    // Fix Babylon.js 8 SubMesh.getBoundingInfo() issue
    // SubMesh returns _boundingInfo (null) unless IsGlobal is true
    // IsGlobal is read-only, so we set _boundingInfo directly
    disc.refreshBoundingInfo();
    var discBi = disc.getBoundingInfo();
    if (disc.subMeshes && discBi) {
        disc.subMeshes.forEach(sm => { /** @type {any} */ (sm)._boundingInfo = discBi; });
    }

    // source mesh needn't be in the scene graph
    noa.rendering.setMeshVisibility(disc, false);


    return {

        name: 'shadow',

        order: 80,

        state: {
            size: 0.5,
            _mesh: null,
        },


        onAdd: function (eid, state) {
            var mesh = disc.createInstance('shadow_instance');
            // Fix Babylon.js 8 SubMesh.getBoundingInfo() issue for instances
            if (mesh.subMeshes && discBi) {
                mesh.subMeshes.forEach(sm => { /** @type {any} */ (sm)._boundingInfo = discBi; });
            }
            noa.rendering.addMeshToScene(mesh);
            mesh.setEnabled(false);
            state._mesh = mesh;
        },


        onRemove: function (eid, state) {
            state._mesh.dispose();
            state._mesh = null;
        },


        system: function shadowSystem(dt, states) {
            var cpos = noa.camera._localGetPosition();
            var dist = shadowDist;
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                var posState = noa.ents.getPositionData(state.__id);
                if (!posState) continue // defensive check for mid-frame deletion
                var physState = noa.ents.getPhysics(state.__id);
                updateShadowHeight(noa, posState, physState, state._mesh, state.size, dist, cpos);
            }
        },


        renderSystem: function (dt, states) {
            // before render adjust shadow x/z to render positions
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                var posData = noa.ents.getPositionData(state.__id);
                if (!posData) continue // defensive check for mid-frame deletion
                var rpos = posData._renderPosition;
                var spos = state._mesh.position;
                spos.x = rpos[0];
                spos.z = rpos[2];
            }
        }




    }
}

var shadowPos = glVec3.fromValues(0, 0, 0);
var down$1 = glVec3.fromValues(0, -1, 0);

function updateShadowHeight(noa, posDat, physDat, mesh, size, shadowDist, camPos) {

    // local Y ground position - from physics or raycast
    var localY;
    if (physDat && physDat.body.resting[1] < 0) {
        localY = posDat._localPosition[1];
    } else {
        var res = noa._localPick(posDat._localPosition, down$1, shadowDist);
        if (!res) {
            mesh.setEnabled(false);
            return
        }
        localY = res.position[1] - noa.worldOriginOffset[1];
    }

    // round Y pos and offset upwards slightly to avoid z-fighting
    localY = Math.round(localY);
    glVec3.copy(shadowPos, posDat._localPosition);
    shadowPos[1] = localY;
    // gl-vec3 typings return number[]; coerce for arithmetic
    var sqdist = Number(glVec3.sqrDist(camPos, shadowPos));
    // offset ~ 0.01 for nearby shadows, up to 0.1 at distance of ~40
    var offset = 0.01 + 0.1 * (sqdist / 1600);
    if (offset > 0.1) offset = 0.1;
    mesh.position.y = localY + offset;
    // set shadow scale
    var dist = posDat._localPosition[1] - localY;
    var scale = size * 0.7 * (1 - dist / shadowDist);
    mesh.scaling.copyFromFloats(scale, scale, scale);
    mesh.setEnabled(true);
}

function smoothCameraComp (noa) {

    var compName = 'smoothCamera';

    return {

        name: compName,

        order: 99,

        state: {
            time: 100.1
        },

        onAdd: null,

        onRemove: null,

        system: function (dt, states) {
            // remove self after time elapses
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                state.time -= dt;
                if (state.time < 0) noa.ents.removeComponent(state.__id, compName);
            }
        },

    }
}

/**
 * Entity utilities - types, defaults, and hot-path helpers.
 * @module entities/entitiesUtils
 */


/**
 * Default options for the Entities module.
 * @typedef {object} EntitiesOptions
 * @property {number} [shadowDistance=10] - Distance for entity shadow rendering
 */

/** @type {EntitiesOptions} */
var defaultOptions$3 = {
    shadowDistance: 10,
};


/**
 * Cached array for entity world position hot paths.
 * Used by getWorldPositionCached - do not store references to this array.
 * @internal
 */
var _cachedEntityWorldPos = [0, 0, 0];

/**
 * Separate cache for isInWorldBounds to avoid corrupting user's
 * getWorldPositionCached() result during bounds checking.
 * @internal
 */
var _boundsCheckPos = [0, 0, 0];


/**
 * Compare two extent arrays for overlap.
 * Extents are [minX, minY, minZ, maxX, maxY, maxZ].
 *
 * @param {number[]} extA
 * @param {number[]} extB
 * @returns {boolean}
 */
function extentsOverlap(extA, extB) {
    if (extA[0] > extB[3]) return false
    if (extA[1] > extB[4]) return false
    if (extA[2] > extB[5]) return false
    if (extA[3] < extB[0]) return false
    if (extA[4] < extB[1]) return false
    if (extA[5] < extB[2]) return false
    return true
}


/**
 * Safety helper for origin rebasing - nudges position away from voxel
 * boundaries so floating point error doesn't carry us across.
 *
 * @internal
 * @param {number[]} pos
 * @param {number} index
 * @param {number} dmin
 * @param {number} dmax
 * @param {number} id - Entity ID (unused, kept for debugging)
 */
function nudgePosition(pos, index, dmin, dmax, id) {
    var min = pos[index] + dmin;
    var max = pos[index] + dmax;
    if (Math.abs(min - Math.round(min)) < 0.002) pos[index] += 0.002;
    if (Math.abs(max - Math.round(max)) < 0.001) pos[index] -= 0.001;
}

/**
 * Entity accessor factory - creates accessor methods on Entities instance.
 * Called once at construction time, no runtime overhead.
 * @module entities/entityAccessors
 *
 * These accessors provide convenient getters for component state.
 * They are moderately faster than `ents.getState(componentName)`.
 */



/**
 * Sets up all entity accessor methods on the Entities instance.
 * This runs once during construction - no runtime overhead.
 *
 * @param {import('./index.js').Entities} ents
 */
function setupAccessors(ents) {
    var names = ents.names;

    // ============ COMPONENT EXISTENCE CHECKS ============

    /** @internal */
    ents.cameraSmoothed = ents.getComponentAccessor(names.smoothCamera);

    /**
     * Returns whether the entity has a physics body.
     * @type {(id:number) => boolean}
     */
    ents.hasPhysics = ents.getComponentAccessor(names.physics);

    /**
     * Returns whether the entity has a position.
     * @type {(id:number) => boolean}
     */
    ents.hasPosition = ents.getComponentAccessor(names.position);

    /**
     * Returns whether the entity has a mesh.
     * @type {(id:number) => boolean}
     */
    ents.hasMesh = ents.getComponentAccessor(names.mesh);


    // ============ COMPONENT STATE GETTERS ============

    /**
     * Returns the entity's position component state.
     * @type {(id:number) => null | import("../../components/position.js").PositionState}
     */
    ents.getPositionData = ents.getStateAccessor(names.position);

    /**
     * Returns the entity's position vector.
     * @type {(id:number) => number[] | null}
     */
    ents.getPosition = (id) => {
        var state = ents.getPositionData(id);
        return (state) ? state.position : null
    };

    /**
     * Get the entity's `physics` component state.
     * @type {(id:number) => null | import("../../components/physics.js").PhysicsState}
     */
    ents.getPhysics = ents.getStateAccessor(names.physics);

    /**
     * Returns the entity's physics body.
     * Note: will throw if the entity doesn't have the position component!
     * @type {(id:number) => null | import("voxel-physics-engine").RigidBody}
     */
    ents.getPhysicsBody = (id) => {
        var state = ents.getPhysics(id);
        return (state) ? state.body : null
    };

    /**
     * Returns the entity's axis-aligned bounding box (AABB) in local coordinates.
     * The AABB represents the entity's collision box position relative to the
     * current world origin offset. To get world coordinates, add noa.worldOriginOffset.
     *
     * **Note:** Returns a direct reference to the physics body's internal AABB.
     * Modifying the returned object will mutate the entity's physics state.
     *
     * @type {(id:number) => null | {base: number[], max: number[]}}
     */
    ents.getAABB = (id) => {
        var body = ents.getPhysicsBody(id);
        if (!body || !body.aabb) return null
        return body.aabb
    };

    /**
     * Returns the entity's `mesh` component state.
     * @type {(id:number) => {mesh:any, offset:number[]}}
     */
    ents.getMeshData = ents.getStateAccessor(names.mesh);

    /**
     * Returns the entity's `movement` component state.
     * @type {(id:number) => import('../../components/movement.js').MovementState}
     */
    ents.getMovement = ents.getStateAccessor(names.movement);

    /**
     * Returns the entity's `collideTerrain` component state.
     * @type {(id:number) => {callback: function}}
     */
    ents.getCollideTerrain = ents.getStateAccessor(names.collideTerrain);

    /**
     * Returns the entity's `collideEntities` component state.
     * @type {(id:number) => {
     *      cylinder:boolean, collideBits:number,
     *      collideMask:number, callback: function}}
     */
    ents.getCollideEntities = ents.getStateAccessor(names.collideEntities);

    /**
     * Returns the entity's `label` component state.
     * @type {(id:number) => null | import("../../components/label.js").LabelState}
     */
    ents.getLabel = ents.getStateAccessor(names.label);


    // ============ WORLD POSITION HELPERS ============

    /**
     * Returns the entity's position in world coordinates.
     * Returns center X/Z and base Y of the entity's AABB.
     *
     * @example
     * const [worldX, worldY, worldZ] = noa.entities.getWorldPosition(playerId)
     *
     * @type {(id:number) => number[] | null}
     */
    ents.getWorldPosition = (id) => {
        var aabb = ents.getAABB(id);
        if (!aabb) return null
        var off = ents.noa.worldOriginOffset;
        return [
            (aabb.base[0] + aabb.max[0]) / 2 + off[0],
            aabb.base[1] + off[1],
            (aabb.base[2] + aabb.max[2]) / 2 + off[2]
        ]
    };

    /**
     * Returns the entity's world position (cached version for hot paths).
     * Use this in per-frame updates to avoid GC pressure.
     * WARNING: Returns shared internal array - do not store the result!
     *
     * @type {(id:number, out?: number[]) => number[] | null}
     */
    ents.getWorldPositionCached = (id, out) => {
        var aabb = ents.getAABB(id);
        if (!aabb) return null
        var off = ents.noa.worldOriginOffset;
        out = out || _cachedEntityWorldPos;
        out[0] = (aabb.base[0] + aabb.max[0]) / 2 + off[0];
        out[1] = aabb.base[1] + off[1];
        out[2] = (aabb.base[2] + aabb.max[2]) / 2 + off[2];
        return out
    };

    /**
     * Check if an entity is within world-coordinate bounds.
     *
     * @example
     * const inRiver = noa.entities.isInWorldBounds(playerId, {
     *     xMin: -5, xMax: 5,
     *     yMin: 0, yMax: 3,
     *     zMin: -50, zMax: 50
     * })
     *
     * @type {(id:number, bounds: {xMin?:number, xMax?:number, yMin?:number, yMax?:number, zMin?:number, zMax?:number}) => boolean}
     */
    ents.isInWorldBounds = (id, bounds) => {
        // Uses separate cache to avoid corrupting user's getWorldPositionCached() result
        var pos = ents.getWorldPositionCached(id, _boundsCheckPos);
        if (!pos) return false
        if (bounds.xMin !== undefined && pos[0] < bounds.xMin) return false
        if (bounds.xMax !== undefined && pos[0] > bounds.xMax) return false
        if (bounds.yMin !== undefined && pos[1] < bounds.yMin) return false
        if (bounds.yMax !== undefined && pos[1] > bounds.yMax) return false
        if (bounds.zMin !== undefined && pos[2] < bounds.zMin) return false
        if (bounds.zMax !== undefined && pos[2] > bounds.zMax) return false
        return true
    };


    // ============ COLLISION CALLBACK ============

    /**
     * Pairwise collideEntities event - assign your own function to this
     * property if you want to handle entity-entity overlap events.
     * @type {(id1:number, id2:number) => void}
     */
    ents.onPairwiseEntityCollision = function (id1, id2) { };
}


/**
 * Clears accessor references during disposal.
 *
 * @param {import('./index.js').Entities} ents
 */
function clearAccessors(ents) {
    ents.cameraSmoothed = null;
    ents.hasPhysics = null;
    ents.hasPosition = null;
    ents.getPositionData = null;
    ents.getPosition = null;
    ents.getPhysics = null;
    ents.getPhysicsBody = null;
    ents.getAABB = null;
    ents.hasMesh = null;
    ents.getMeshData = null;
    ents.getMovement = null;
    ents.getCollideTerrain = null;
    ents.getCollideEntities = null;
    ents.getLabel = null;
    ents.getWorldPosition = null;
    ents.getWorldPositionCached = null;
    ents.isInWorldBounds = null;
    ents.onPairwiseEntityCollision = null;
}

/**
 * Entity position management - setting positions and derived state updates.
 * @module entities/entityPositions
 */



/**
 * Position management class for the Entities module.
 * Handles setting entity positions and updating all derived state.
 */
class EntityPositions {

    /**
     * @param {import('./index.js').Entities} entities
     */
    constructor(entities) {
        /** @internal @type {import('./index.js').Entities} */
        this._entities = entities;
    }

    /**
     * Set an entity's position, and update all derived state.
     *
     * In general, always use this to set an entity's position unless
     * you're familiar with engine internals.
     *
     * @example
     * noa.ents.setPosition(playerEntity, [5, 6, 7])
     * noa.ents.setPosition(playerEntity, 5, 6, 7)  // also works
     *
     * @param {number} id
     * @param {number|number[]} pos
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    setPosition(id, pos, y = 0, z = 0) {
        if (typeof pos === 'number') pos = [pos, y, z];
        var loc = this._entities.noa.globalToLocal(pos, null, []);
        this._localSetPosition(id, loc);
    }

    /**
     * Set an entity's size.
     *
     * @param {number} id
     * @param {number} xs
     * @param {number} ys
     * @param {number} zs
     */
    setEntitySize(id, xs, ys, zs) {
        var posDat = this._entities.getPositionData(id);
        posDat.width = (xs + zs) / 2;
        posDat.height = ys;
        this._updateDerivedPositionData(id, posDat);
    }

    /**
     * Called when engine rebases its local coords.
     * @internal
     * @param {number[]} delta
     */
    _rebaseOrigin(delta) {
        var ents = this._entities;
        for (var state of ents.getStatesList(ents.names.position)) {
            var locPos = state._localPosition;
            var hw = state.width / 2;
            nudgePosition(locPos, 0, -hw, hw, state.__id);
            nudgePosition(locPos, 1, 0, state.height, state.__id);
            nudgePosition(locPos, 2, -hw, hw, state.__id);
            glVec3.sub(locPos, locPos, delta);
            this._updateDerivedPositionData(state.__id, state);
        }
    }

    /**
     * @internal
     * @param {number} id
     * @returns {number[]}
     */
    _localGetPosition(id) {
        return this._entities.getPositionData(id)._localPosition
    }

    /**
     * @internal
     * @param {number} id
     * @param {number[]} pos
     */
    _localSetPosition(id, pos) {
        var posDat = this._entities.getPositionData(id);
        glVec3.copy(posDat._localPosition, pos);
        this._updateDerivedPositionData(id, posDat);
    }

    /**
     * Helper to update everything derived from `_localPosition`.
     * @internal
     * @param {number} id
     * @param {import('../../components/position.js').PositionState} posDat
     */
    _updateDerivedPositionData(id, posDat) {
        var ents = this._entities;
        glVec3.copy(posDat._renderPosition, posDat._localPosition);
        var offset = ents.noa.worldOriginOffset;
        glVec3.add(posDat.position, posDat._localPosition, offset);
        updatePositionExtents(posDat);
        var physDat = ents.getPhysics(id);
        if (physDat) setPhysicsFromPosition(physDat, posDat);
    }
}

/**
 * Entity query and spatial search functionality.
 * @module entities/entityQueries
 */



/**
 * Query object for iterating over entities with specific components.
 * Supports iterator protocol, forEach, and component chaining.
 *
 * @example
 * // Iterate over all entities with physics
 * for (const { id, state } of noa.entities.query('physics')) {
 *   console.log(id, state.body)
 * }
 *
 * // With forEach
 * noa.entities.query('physics').forEach(({ id, state }) => {
 *   console.log(id, state)
 * })
 *
 * // Chain multiple components
 * noa.entities.query('physics').withComponent('mesh').forEach(...)
 */
class EntityQueryImpl {

    /**
     * @param {import('./index.js').Entities} ecs
     * @param {string} name
     */
    constructor(ecs, name) {
        /** @internal */
        this._ecs = ecs;
        /** @internal */
        this._names = [name];
    }

    *[Symbol.iterator]() {
        const states = this._ecs.getStatesList(this._names[0]);
        for (const state of states) {
            if (!state) continue
            const id = state.__id;
            if (this._names.length === 1) {
                yield { id, state };
            } else {
                let merged = { ...state };
                let valid = true;
                for (let i = 1; i < this._names.length; i++) {
                    const other = this._ecs.getState(id, this._names[i]);
                    if (!other) { valid = false; break }
                    merged = { ...merged, ...other };
                }
                if (valid) yield { id, state: merged };
            }
        }
    }

    /**
     * Chain another component requirement to the query.
     * @param {string} name - Component name
     * @returns {EntityQueryImpl}
     */
    withComponent(name) {
        const q = new EntityQueryImpl(this._ecs, this._names[0]);
        q._names = [...this._names, name];
        return q
    }

    /**
     * Iterate with a callback function.
     * @param {function({id:number, state:object}):void} cb
     */
    forEach(cb) {
        for (const r of this) cb(r);
    }

    /**
     * Get array of entity IDs matching the query.
     * @returns {number[]}
     */
    getIds() {
        return Array.from(this).map(r => r.id)
    }

    /**
     * Count entities matching the query.
     * @returns {number}
     */
    count() {
        let c = 0;
        for (const _ of this) c++;
        return c
    }
}


/**
 * Spatial query methods for entity lookups.
 */
class EntitySpatialQueries {

    /**
     * @param {import('./index.js').Entities} entities
     */
    constructor(entities) {
        /** @internal @type {import('./index.js').Entities} */
        this._entities = entities;
    }

    /**
     * Checks whether a voxel is obstructed by any entity
     * (with the `collidesTerrain` component).
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {boolean}
     */
    isTerrainBlocked(x, y, z) {
        var ents = this._entities;
        var off = ents.noa.worldOriginOffset;
        var xlocal = Math.floor(x - off[0]);
        var ylocal = Math.floor(y - off[1]);
        var zlocal = Math.floor(z - off[2]);
        var blockExt = [
            xlocal + 0.001, ylocal + 0.001, zlocal + 0.001,
            xlocal + 0.999, ylocal + 0.999, zlocal + 0.999,
        ];
        var list = ents.getStatesList(ents.names.collideTerrain);
        for (var i = 0; i < list.length; i++) {
            var id = list[i].__id;
            var ext = ents.getPositionData(id)._extents;
            if (extentsOverlap(blockExt, ext)) return true
        }
        return false
    }

    /**
     * Gets an array of all entities overlapping the given AABB.
     *
     * @param {{ base: number[], max: number[] }} box
     * @param {string} [withComponent] - Optional component filter
     * @returns {number[]}
     */
    getEntitiesInAABB(box, withComponent) {
        var ents = this._entities;
        var off = ents.noa.worldOriginOffset;
        var testExtents = [
            box.base[0] - off[0], box.base[1] - off[1], box.base[2] - off[2],
            box.max[0] - off[0], box.max[1] - off[1], box.max[2] - off[2],
        ];

        var entStates;
        if (withComponent) {
            entStates = [];
            for (var compState of ents.getStatesList(withComponent)) {
                var pdat = ents.getPositionData(compState.__id);
                if (pdat) entStates.push(pdat);
            }
        } else {
            entStates = ents.getStatesList(ents.names.position);
        }

        var hits = [];
        for (var i = 0; i < entStates.length; i++) {
            var state = entStates[i];
            if (extentsOverlap(testExtents, state._extents)) {
                hits.push(state.__id);
            }
        }
        return hits
    }
}

/**
 * Entities module - manages entities and components.
 * @module entities
 */



/**
 * `noa.entities` - manages entities and components.
 *
 * This class extends [ent-comp](https://github.com/fenomas/ent-comp),
 * a general-purpose ECS. It's also decorated with noa-specific helpers and
 * accessor functions for querying entity positions, etc.
 *
 * Expects entity definitions in a specific format - see source `components`
 * folder for examples.
 *
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 *
 * ```js
 * var defaults = {
 *     shadowDistance: 10,
 * }
 * ```
 */
class Entities extends ECS {

    // ============ ACCESSOR PROPERTY DECLARATIONS ============
    // These are assigned dynamically in setupAccessors() but declared
    // here for TypeScript recognition.

    /** @internal @type {(id:number) => boolean} */
    cameraSmoothed

    /**
     * Returns whether the entity has a physics body.
     * @type {(id:number) => boolean}
     */
    hasPhysics

    /**
     * Returns whether the entity has a position.
     * @type {(id:number) => boolean}
     */
    hasPosition

    /**
     * Returns whether the entity has a mesh.
     * @type {(id:number) => boolean}
     */
    hasMesh

    /**
     * Returns the entity's position component state.
     * @type {(id:number) => null | import("../../components/position.js").PositionState}
     */
    getPositionData

    /**
     * Returns the entity's position vector.
     * @type {(id:number) => number[] | null}
     */
    getPosition

    /**
     * Get the entity's `physics` component state.
     * @type {(id:number) => null | import("../../components/physics.js").PhysicsState}
     */
    getPhysics

    /**
     * Returns the entity's physics body.
     * Note, will throw if the entity doesn't have the position component!
     * @type {(id:number) => null | import("voxel-physics-engine").RigidBody}
     */
    getPhysicsBody

    /**
     * Returns the entity's axis-aligned bounding box (AABB) in local coordinates.
     * The AABB represents the entity's collision box position relative to the
     * current world origin offset. To get world coordinates, add noa.worldOriginOffset.
     *
     * **Note:** Returns a direct reference to the physics body's internal AABB.
     * Modifying the returned object will mutate the entity's physics state.
     *
     * @type {(id:number) => null | {base: number[], max: number[]}}
     */
    getAABB

    /**
     * Returns the entity's `mesh` component state.
     * @type {(id:number) => {mesh:any, offset:number[]}}
     */
    getMeshData

    /**
     * Returns the entity's `movement` component state.
     * @type {(id:number) => import('../../components/movement.js').MovementState}
     */
    getMovement

    /**
     * Returns the entity's `collideTerrain` component state.
     * @type {(id:number) => {callback: function}}
     */
    getCollideTerrain

    /**
     * Returns the entity's `collideEntities` component state.
     * @type {(id:number) => {
     *      cylinder:boolean, collideBits:number,
     *      collideMask:number, callback: function}}
     */
    getCollideEntities

    /**
     * Returns the entity's `label` component state.
     * @type {(id:number) => null | import("../../components/label.js").LabelState}
     */
    getLabel

    /**
     * Returns the entity's position in world coordinates.
     * Returns center X/Z and base Y of the entity's AABB.
     *
     * @example
     * const [worldX, worldY, worldZ] = noa.entities.getWorldPosition(playerId)
     *
     * @type {(id:number) => number[] | null}
     */
    getWorldPosition

    /**
     * Returns the entity's world position (cached version for hot paths).
     * Use this in per-frame updates to avoid GC pressure.
     * WARNING: Returns shared internal array - do not store the result!
     *
     * @type {(id:number, out?: number[]) => number[] | null}
     */
    getWorldPositionCached

    /**
     * Check if an entity is within world-coordinate bounds.
     *
     * @example
     * const inRiver = noa.entities.isInWorldBounds(playerId, {
     *     xMin: -5, xMax: 5,
     *     yMin: 0, yMax: 3,
     *     zMin: -50, zMax: 50
     * })
     *
     * @type {(id:number, bounds: {xMin?:number, xMax?:number, yMin?:number, yMax?:number, zMin?:number, zMax?:number}) => boolean}
     */
    isInWorldBounds

    /**
     * Pairwise collideEntities event - assign your own function to this
     * property if you want to handle entity-entity overlap events.
     * @type {(id1:number, id2:number) => void}
     */
    onPairwiseEntityCollision


    /** @internal */
    constructor(noa, opts) {
        super();
        opts = Object.assign({}, defaultOptions$3, opts);

        /**
         * @internal
         * @type {import('../../index.js').Engine}
         */
        this.noa = noa;

        /** @internal */
        this._disposed = false;

        /**
         * Hash containing the component names of built-in components.
         * @type {{ [key:string]: string }}
         */
        this.names = {};

        // Register all built-in components
        this._registerComponents(opts);

        // Initialize sub-modules
        /** @internal */
        this._positions = new EntityPositions(this);
        /** @internal */
        this._spatialQueries = new EntitySpatialQueries(this);

        // Setup all accessor methods (runs once, no runtime overhead)
        setupAccessors(this);
    }


    // ============ COMPONENT REGISTRATION ============

    /**
     * Register all built-in components.
     * Calls `createComponent` on all component definitions, and
     * stores their names in `ents.names`.
     * @internal
     * @param {import('./entitiesUtils.js').EntitiesOptions} opts
     */
    _registerComponents(opts) {
        // optional arguments to supply to component creation functions
        var componentArgs = {
            'shadow': opts.shadowDistance,
        };

        var compDefs = {
            collideEntities: collideEntitiesComp,
            collideTerrain: collideTerrainComp,
            fadeOnZoom: fadeOnZoomComp,
            followsEntity: followsEntityComp,
            label: labelComp,
            mesh: meshComp,
            movement: movementComp,
            physics: physicsComp,
            position: positionComp,
            receivesInputs: receivesInputsComp,
            shadow: shadowComp,
            smoothCamera: smoothCameraComp,
        };

        Object.keys(compDefs).forEach(bareName => {
            var arg = componentArgs[bareName] || undefined;
            var compFn = compDefs[bareName];
            var compDef = compFn(this.noa, arg);
            this.names[bareName] = this.createComponent(compDef);
        });
    }


    // ============ QUERY API ============

    /**
     * Query entities by component name.
     * Returns an iterable query object for efficient iteration.
     *
     * @example
     * // Iterate over all entities with physics
     * for (const { id, state } of noa.entities.query('physics')) {
     *   console.log(id, state.body)
     * }
     *
     * // With forEach
     * noa.entities.query('physics').forEach(({ id, state }) => {
     *   console.log(id, state)
     * })
     *
     * // Chain multiple components
     * noa.entities.query('physics').withComponent('mesh').forEach(...)
     *
     * @param {string} componentName
     * @returns {EntityQueryImpl}
     */
    query(componentName) {
        return new EntityQueryImpl(this, componentName)
    }


    // ============ POSITION API ============

    /**
     * Set an entity's position, and update all derived state.
     *
     * In general, always use this to set an entity's position unless
     * you're familiar with engine internals.
     *
     * @example
     * noa.ents.setPosition(playerEntity, [5, 6, 7])
     * noa.ents.setPosition(playerEntity, 5, 6, 7)  // also works
     *
     * @param {number} id
     * @param {number|number[]} pos
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    setPosition(id, pos, y = 0, z = 0) {
        this._positions.setPosition(id, pos, y, z);
    }

    /**
     * Set an entity's size.
     *
     * @param {number} id
     * @param {number} xs
     * @param {number} ys
     * @param {number} zs
     */
    setEntitySize(id, xs, ys, zs) {
        this._positions.setEntitySize(id, xs, ys, zs);
    }

    /**
     * Called when engine rebases its local coords.
     * @internal
     * @param {number[]} delta
     */
    _rebaseOrigin(delta) {
        this._positions._rebaseOrigin(delta);
    }

    /**
     * @internal
     * @param {number} id
     * @returns {number[]}
     */
    _localGetPosition(id) {
        return this._positions._localGetPosition(id)
    }

    /**
     * @internal
     * @param {number} id
     * @param {number[]} pos
     */
    _localSetPosition(id, pos) {
        this._positions._localSetPosition(id, pos);
    }

    /**
     * Helper to update everything derived from `_localPosition`.
     * @internal
     * @param {number} id
     * @param {import('../../components/position.js').PositionState} posDat
     */
    _updateDerivedPositionData(id, posDat) {
        this._positions._updateDerivedPositionData(id, posDat);
    }


    // ============ SPATIAL QUERIES ============

    /**
     * Checks whether a voxel is obstructed by any entity (with the
     * `collidesTerrain` component).
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {boolean}
     */
    isTerrainBlocked(x, y, z) {
        return this._spatialQueries.isTerrainBlocked(x, y, z)
    }

    /**
     * Gets an array of all entities overlapping the given AABB.
     *
     * @param {{ base: number[], max: number[] }} box
     * @param {string} [withComponent] - Optional component filter
     * @returns {number[]}
     */
    getEntitiesInAABB(box, withComponent) {
        return this._spatialQueries.getEntitiesInAABB(box, withComponent)
    }


    // ============ ENTITY MANAGEMENT ============
    // Note: most entity APIs are on the base ECS module (ent-comp).
    // These are noa-specific extras.

    /**
     * Safely add a component - if the entity already had the
     * component, this will remove and re-add it.
     *
     * @param {number} id
     * @param {string} name
     * @param {object} [state]
     */
    addComponentAgain(id, name, state) {
        if (this.hasComponent(id, name)) this.removeComponent(id, name);
        this.addComponent(id, name, state);
    }


    // ============ ENTITY FACTORY ============

    /**
     * Helper to set up a general entity, and populate with some
     * common components depending on arguments.
     *
     * @param {number[] | null} [position=null]
     * @param {number} [width=1]
     * @param {number} [height=1]
     * @param {*} [mesh=null]
     * @param {number[] | null} [meshOffset=null]
     * @param {boolean} [doPhysics=false]
     * @param {boolean} [shadow=false]
     * @returns {number} Entity ID
     */
    add(position = null, width = 1, height = 1,
        mesh = null, meshOffset = null, doPhysics = false, shadow = false) {

        var self = this;

        // new entity
        var eid = this.createEntity();

        // position component
        this.addComponent(eid, this.names.position, {
            position: position || glVec3.create(),
            width: width,
            height: height,
        });

        // rigid body in physics simulator
        if (doPhysics) {
            this.addComponent(eid, this.names.physics);
            var body = this.getPhysics(eid).body;

            // handler for physics engine to call on auto-step
            var smoothName = this.names.smoothCamera;
            body.onStep = function () {
                self.addComponentAgain(eid, smoothName);
            };
        }

        // mesh for the entity
        if (mesh) {
            if (!meshOffset) meshOffset = glVec3.create();
            this.addComponent(eid, this.names.mesh, {
                mesh: mesh,
                offset: meshOffset
            });
        }

        // add shadow-drawing component
        if (shadow) {
            this.addComponent(eid, this.names.shadow, { size: width });
        }

        return eid
    }


    // ============ LIFECYCLE ============

    dispose() {
        if (this._disposed) return
        this._disposed = true;

        // Clear accessor function references
        clearAccessors(this);

        // Delete all entities (triggers onRemove handlers for cleanup)
        var ids = new Set();
        if (this._storage) {
            Object.keys(this._storage).forEach(compName => {
                var store = this._storage[compName];
                if (!store || !store.hash) return
                Object.keys(store.hash).forEach(id => {
                    if (store.hash[id]) ids.add(Number(id));
                });
            });
        }
        ids.forEach(id => this.deleteEntity(id));

        // Run deferred cleanup synchronously so pending timers don't touch disposed stores
        try {
            this.tick(0);
            this.render(0);
        } catch (err) { /* ignore cleanup errors during disposal */ }

        // Flush any remaining pending removals before disposing stores
        if (this._storage) {
            Object.keys(this._storage).forEach(compName => {
                var store = this._storage[compName];
                if (store && typeof store.flush === 'function') store.flush();
            });
        }

        // Dispose component stores
        if (this._storage) {
            Object.keys(this._storage).forEach(compName => {
                var store = this._storage[compName];
                if (store && typeof store.dispose === 'function') store.dispose();
            });
        }

        // Clear remaining references
        this.components = {};
        this.comps = this.components;
        this._systems.length = 0;
        this._renderSystems.length = 0;
        this.names = null;
        this.noa = null;
        this._positions = null;
        this._spatialQueries = null;
    }
}

// helper to swap item to end and pop(), instead of splice()ing
function removeUnorderedListItem(list, item) {
    var i = list.indexOf(item);
    if (i < 0) return
    if (i === list.length - 1) {
        list.pop();
    } else {
        list[i] = list.pop();
    }
}






// function to hash three indexes (i,j,k) into one integer
// note that hash wraps around every 1024 indexes.
//      i.e.:   hash(1, 1, 1) === hash(1025, 1, -1023)
function locationHasher(i, j, k) {
    return (i & 1023)
        | ((j & 1023) << 10)
        | ((k & 1023) << 20)
}



/*
 * 
 *      chunkStorage - a Map-backed abstraction for storing/
 *      retrieving chunk objects by their location indexes
 * 
*/

/** @internal */
class ChunkStorage {
    constructor() {
        this.hash = {};
    }

    /** @returns {import('./chunk').Chunk} */
    getChunkByIndexes(i = 0, j = 0, k = 0) {
        return this.hash[locationHasher(i, j, k)] || null
    }
    /** @param {import('./chunk').Chunk} chunk */
    storeChunkByIndexes(i = 0, j = 0, k = 0, chunk) {
        this.hash[locationHasher(i, j, k)] = chunk;
    }
    removeChunkByIndexes(i = 0, j = 0, k = 0) {
        delete this.hash[locationHasher(i, j, k)];
    }
}






/*
 * 
 *      LocationQueue - simple array of [i,j,k] locations, 
 *      backed by a hash for O(1) existence checks.
 *      removals by value are O(n).
 * 
*/

/** @internal */
class LocationQueue {
    constructor() {
        this.arr = [];
        this.hash = {};
    }
    forEach(cb, thisArg) {
        this.arr.forEach(cb, thisArg);
    }
    includes(i, j, k) {
        var id = locationHasher(i, j, k);
        return !!this.hash[id]
    }
    add(i, j, k, toFront = false) {
        var id = locationHasher(i, j, k);
        if (this.hash[id]) return
        if (toFront) {
            this.arr.unshift([i, j, k, id]);
        } else {
            this.arr.push([i, j, k, id]);
        }
        this.hash[id] = true;
    }
    removeByIndex(ix) {
        var el = this.arr[ix];
        delete this.hash[el[3]];
        this.arr.splice(ix, 1);
    }
    remove(i, j, k) {
        var id = locationHasher(i, j, k);
        if (!this.hash[id]) return
        delete this.hash[id];
        for (var ix = 0; ix < this.arr.length; ix++) {
            if (id === this.arr[ix][3]) {
                this.arr.splice(ix, 1);
                return
            }
        }
        throw 'internal bug with location queue - hash value overlapped'
    }
    count() { return this.arr.length }
    isEmpty() { return (this.arr.length === 0) }
    empty() {
        this.arr = [];
        this.hash = {};
    }
    pop() {
        var el = this.arr.pop();
        delete this.hash[el[3]];
        return el
    }
    copyFrom(queue) {
        this.arr = queue.arr.slice();
        this.hash = {};
        for (var key in queue.hash) this.hash[key] = true;
    }
    sortByDistance(locToDist, reverse = false) {
        sortLocationArrByDistance(this.arr, locToDist, reverse);
    }
}

// internal helper for preceding class
function sortLocationArrByDistance(arr, distFn, reverse) {
    var hash = {};
    for (var loc of arr) {
        hash[loc[3]] = distFn(loc[0], loc[1], loc[2]);
    }
    if (reverse) {
        arr.sort((a, b) => hash[a[3]] - hash[b[3]]); // ascending
    } else {
        arr.sort((a, b) => hash[b[3]] - hash[a[3]]); // descending
    }
    hash = null;
}











// simple thing for reporting time split up between several activities
function makeProfileHook(every, title = '', filter) {
    return () => { }
}

/*
 *
 *          Object meshing
 * 
 *      Per-chunk handling of the creation/disposal of static meshes
 *      associated with particular voxel IDs
 * 
 * 
*/


/** 
 * @internal
 * @param {import('../index').Engine} noa
*/
function ObjectMesher(noa) {

    // transform node for all instance meshes to be parented to
    this.rootNode = new transformNode.TransformNode('objectMeshRoot', noa.rendering.scene);

    // tracking rebase amount inside matrix data
    var rebaseOffset = [0, 0, 0];

    // flag to trigger a rebuild after a chunk is disposed
    var rebuildNextTick = false;

    // mock object to pass to customMesh handler, to get transforms
    var transformObj = new transformNode.TransformNode('');

    // list of known base meshes
    this.allBaseMeshes = [];

    // internal storage of instance managers, keyed by ID
    // has check to dedupe by mesh, since babylon chokes on
    // separate sets of instances for the same mesh/clone/geometry
    var managers = {};
    var getManager = (id) => {
        if (managers[id]) return managers[id]
        var mesh = noa.registry._blockMeshLookup[id];
        for (var id2 in managers) {
            var prev = managers[id2].mesh;
            if (prev === mesh || (prev.geometry === mesh.geometry)) {
                return managers[id] = managers[id2]
            }
        }
        this.allBaseMeshes.push(mesh);
        if (!mesh.metadata) mesh.metadata = {};
        mesh.metadata[objectMeshFlag] = true;
        return managers[id] = new InstanceManager(noa, mesh)
    };
    var objectMeshFlag = 'noa_object_base_mesh';



    /*
     * 
     *      public API
     * 
    */


    // add any properties that will get used for meshing
    this.initChunk = function (chunk) {
        chunk._objectBlocks = {};
    };


    // called by world when an object block is set or cleared
    this.setObjectBlock = function (chunk, blockID, i, j, k) {
        var x = chunk.x + i;
        var y = chunk.y + j;
        var z = chunk.z + k;
        var key = `${x}:${y}:${z}`;

        var oldID = chunk._objectBlocks[key] || 0;
        if (oldID === blockID) return // should be impossible
        if (oldID > 0) {
            var oldMgr = getManager(oldID);
            oldMgr.removeInstance(chunk, key);
        }

        if (blockID > 0) {
            // if there's a block event handler, call it with
            // a mock object so client can add transforms
            var handlers = noa.registry._blockHandlerLookup[blockID];
            var onCreate = handlers && handlers.onCustomMeshCreate;
            if (onCreate) {
                transformObj.position.copyFromFloats(0.5, 0, 0.5);
                transformObj.scaling.setAll(1);
                transformObj.rotation.setAll(0);
                onCreate(transformObj, x, y, z);
            }
            var mgr = getManager(blockID);
            var xform = (onCreate) ? transformObj : null;
            mgr.addInstance(chunk, key, i, j, k, xform, rebaseOffset);
        }

        if (oldID > 0 && !blockID) delete chunk._objectBlocks[key];
        if (blockID > 0) chunk._objectBlocks[key] = blockID;
    };



    // called by world when it knows that objects have been updated
    this.buildObjectMeshes = function () {

        for (var id in managers) {
            var mgr = managers[id];
            mgr.updateMatrix();
            if (mgr.count === 0) mgr.dispose();
            if (mgr.disposed) delete managers[id];
        }
    };



    // called by world at end of chunk lifecycle
    this.disposeChunk = function (chunk) {
        for (var key in chunk._objectBlocks) {
            var id = chunk._objectBlocks[key];
            if (id > 0) {
                var mgr = getManager(id);
                mgr.removeInstance(chunk, key);
            }
        }
        chunk._objectBlocks = null;

        // since some instance managers will have been updated
        rebuildNextTick = true;
    };



    // tick handler catches case where objects are dirty due to disposal
    this.tick = function () {
        if (rebuildNextTick) {
            this.buildObjectMeshes();
            rebuildNextTick = false;
        }
    };



    // world rebase handler
    this._rebaseOrigin = function (delta) {
        rebaseOffset[0] += delta[0];
        rebaseOffset[1] += delta[1];
        rebaseOffset[2] += delta[2];

        for (var id1 in managers) managers[id1].rebased = false;
        for (var id2 in managers) {
            var mgr = managers[id2];
            if (mgr.rebased) continue
            for (var i = 0; i < mgr.count; i++) {
                var ix = i << 4;
                mgr.buffer[ix + 12] -= delta[0];
                mgr.buffer[ix + 13] -= delta[1];
                mgr.buffer[ix + 14] -= delta[2];
            }
            mgr.rebased = true;
            mgr.dirty = true;
        }
        rebuildNextTick = true;
    };

}















/*
 * 
 * 
 *      manager class for thin instances of a given object block ID 
 * 
 * 
*/

/** @param {import('../index').Engine} noa*/
function InstanceManager(noa, mesh) {
    this.noa = noa;
    this.mesh = mesh;
    this.buffer = null;
    this.capacity = 0;
    this.count = 0;
    this.dirty = false;
    this.rebased = true;
    this.disposed = false;
    // dual struct to map keys (locations) to buffer locations, and back
    this.keyToIndex = {};
    this.locToKey = [];
    // prepare mesh for rendering
    this.mesh.position.setAll(0);
    this.mesh.parent = noa._objectMesher.rootNode;
    this.noa.rendering.addMeshToScene(this.mesh, false);
    this.noa.emit('addingTerrainMesh', this.mesh);
    this.mesh.isPickable = false;
    this.mesh.doNotSyncBoundingInfo = true;
    this.mesh.alwaysSelectAsActiveMesh = true;
}



InstanceManager.prototype.dispose = function () {
    if (this.disposed) return
    this.mesh.thinInstanceCount = 0;
    this.setCapacity(0);
    this.noa.emit('removingTerrainMesh', this.mesh);
    this.noa.rendering.setMeshVisibility(this.mesh, false);
    this.mesh.dispose();
    this.mesh = null;
    this.keyToIndex = null;
    this.locToKey = null;
    this.disposed = true;
    this.noa = null;
};


InstanceManager.prototype.addInstance = function (chunk, key, i, j, k, transform, rebaseVec) {
    maybeExpandBuffer(this);
    var ix = this.count << 4;
    this.locToKey[this.count] = key;
    this.keyToIndex[key] = ix;
    if (transform) {
        transform.position.x += (chunk.x - rebaseVec[0]) + i;
        transform.position.y += (chunk.y - rebaseVec[1]) + j;
        transform.position.z += (chunk.z - rebaseVec[2]) + k;
        transform.computeWorldMatrix(true);
        var xformArr = transform._localMatrix._m;
        copyMatrixData(xformArr, 0, this.buffer, ix);
    } else {
        var matArray = tempMatrixArray;
        matArray[12] = (chunk.x - rebaseVec[0]) + i + 0.5;
        matArray[13] = (chunk.y - rebaseVec[1]) + j;
        matArray[14] = (chunk.z - rebaseVec[2]) + k + 0.5;
        copyMatrixData(matArray, 0, this.buffer, ix);
    }
    this.count++;
    this.dirty = true;
};


InstanceManager.prototype.removeInstance = function (chunk, key) {
    var remIndex = this.keyToIndex[key];
    if (!(remIndex >= 0)) throw 'tried to remove object instance not in storage'
    delete this.keyToIndex[key];
    var remLoc = remIndex >> 4;
    // copy tail instance's data to location of one we're removing
    var tailLoc = this.count - 1;
    if (remLoc !== tailLoc) {
        var tailIndex = tailLoc << 4;
        copyMatrixData(this.buffer, tailIndex, this.buffer, remIndex);
        // update key/location structs
        var tailKey = this.locToKey[tailLoc];
        this.keyToIndex[tailKey] = remIndex;
        this.locToKey[remLoc] = tailKey;
    }
    this.count--;
    this.dirty = true;
    maybeContractBuffer(this);
};


InstanceManager.prototype.updateMatrix = function () {
    if (!this.dirty) return
    this.mesh.thinInstanceCount = this.count;
    this.mesh.thinInstanceBufferUpdated('matrix');
    this.mesh.isVisible = (this.count > 0);
    this.dirty = false;
};



InstanceManager.prototype.setCapacity = function (size = 4) {
    this.capacity = size;
    if (size === 0) {
        this.buffer = null;
    } else {
        var newBuff = new Float32Array(this.capacity * 16);
        if (this.buffer) {
            var len = Math.min(this.buffer.length, newBuff.length);
            for (var i = 0; i < len; i++) newBuff[i] = this.buffer[i];
        }
        this.buffer = newBuff;
    }
    this.mesh.thinInstanceSetBuffer('matrix', this.buffer);
    this.updateMatrix();
};


function maybeExpandBuffer(mgr) {
    if (mgr.count < mgr.capacity) return
    var size = Math.max(8, mgr.capacity * 2);
    mgr.setCapacity(size);
}

function maybeContractBuffer(mgr) {
    if (mgr.count > mgr.capacity * 0.4) return
    if (mgr.capacity < 100) return
    mgr.setCapacity(Math.round(mgr.capacity / 2));
    mgr.locToKey.length = Math.min(mgr.locToKey.length, mgr.capacity);
}



// helpers

var tempMatrixArray = [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
];

function copyMatrixData(src, srcOff, dest, destOff) {
    for (var i = 0; i < 16; i++) dest[destOff + i] = src[srcOff + i];
}

/**
 * Babylon.js material plugins for terrain rendering.
 * @module terrain/terrainPlugins
 */

/**
 * Babylon material plugin - twiddles the defines/shaders/etc so that
 * a standard material can use textures from a 2D texture atlas.
 */
class TerrainMaterialPlugin extends materialPluginBase.MaterialPluginBase {
    /**
     * @param {import('@babylonjs/core').Material} material
     * @param {import('@babylonjs/core').Texture} texture
     */
    constructor(material, texture) {
        var priority = 200;
        var defines = { 'NOA_TWOD_ARRAY_TEXTURE': false };
        super(material, 'TestPlugin', priority, defines);
        this._enable(true);

        /** @type {import('@babylonjs/core').RawTexture2DArray | null} */
        this._atlasTextureArray = null;
        /** @type {import('@babylonjs/core').Observer<import('@babylonjs/core').Texture> | null} */
        this._textureLoadObserver = null;

        this._textureLoadObserver = texture.onLoadObservable.add((tex) => {
            this.setTextureArrayData(tex);
        });

        // Clean up observer when material is disposed to prevent memory leaks
        material.onDisposeObservable.add(() => {
            if (this._textureLoadObserver) {
                texture.onLoadObservable.remove(this._textureLoadObserver);
                this._textureLoadObserver = null;
            }
            if (this._atlasTextureArray) {
                this._atlasTextureArray.dispose();
                this._atlasTextureArray = null;
            }
        });
    }

    /**
     * @param {import('@babylonjs/core').Texture} texture
     */
    setTextureArrayData(texture$1) {
        var { width, height } = texture$1.getSize();
        var numLayers = Math.round(height / width);
        height = width;
        var data = texture$1._readPixelsSync();

        var format = engine.Engine.TEXTUREFORMAT_RGBA;
        var genMipMaps = true;
        var invertY = false;
        var mode = texture.Texture.NEAREST_SAMPLINGMODE;
        var scene = texture$1.getScene();

        this._atlasTextureArray = new rawTexture2DArray.RawTexture2DArray(
            data, width, height, numLayers,
            format, scene, genMipMaps, invertY, mode,
        );
    }

    prepareDefines(defines, scene, mesh) {
        defines['NOA_TWOD_ARRAY_TEXTURE'] = true;
    }

    getClassName() {
        return 'TerrainMaterialPluginName'
    }

    getSamplers(samplers) {
        samplers.push('atlasTexture');
    }

    getAttributes(attributes) {
        attributes.push('texAtlasIndices');
    }

    getUniforms() {
        return { ubo: [] }
    }

    bindForSubMesh(uniformBuffer, scene, engine, subMesh) {
        if (this._atlasTextureArray) {
            uniformBuffer.setTexture('atlasTexture', this._atlasTextureArray);
        }
    }

    getCustomCode(shaderType) {
        if (shaderType === 'vertex') return {
            'CUSTOM_VERTEX_MAIN_BEGIN': `
                texAtlasIndex = texAtlasIndices;
            `,
            'CUSTOM_VERTEX_DEFINITIONS': `
                uniform highp sampler2DArray atlasTexture;
                attribute float texAtlasIndices;
                varying float texAtlasIndex;
            `,
        }
        if (shaderType === 'fragment') return {
            '!baseColor\\\\=texture2D\\\\(diffuseSampler,vDiffuseUV\\\\+uvOffset\\\\);':
                `baseColor = texture(atlasTexture, vec3(vDiffuseUV, texAtlasIndex));`,
            'CUSTOM_FRAGMENT_DEFINITIONS': `
                uniform highp sampler2DArray atlasTexture;
                varying float texAtlasIndex;
            `,
        }
        return null
    }
}


/**
 * Flow Animation Plugin - adds vertex offset for conveyor belt effect.
 * Uses simple repeating pattern mode where offset wraps every patternLength blocks.
 */
class FlowAnimationPlugin extends materialPluginBase.MaterialPluginBase {
    /**
     * @param {import('@babylonjs/core').Material} material
     * @param {number} flowSpeed
     * @param {number[]} flowDirection
     * @param {number} [patternLength=10]
     */
    constructor(material, flowSpeed, flowDirection, patternLength = 10) {
        var priority = 100;
        var defines = { 'NOA_FLOW_ANIMATION': false };
        super(material, 'FlowAnimationPlugin', priority, defines);
        this._enable(true);

        /** @type {number} */
        this._flowSpeed = flowSpeed;
        /** @type {number[]} */
        this._flowDirection = flowDirection.slice(); // copy array
        /** @type {number} */
        this._patternLength = patternLength;
        /** @type {number} */
        this._time = 0;
        /** @type {import('@babylonjs/core').Observer<import('@babylonjs/core').Scene> | null} */
        this._renderObserver = null;

        // hook into scene render loop to update time
        var scene = material.getScene();
        this._renderObserver = scene.onBeforeRenderObservable.add(() => {
            // delta time is in milliseconds, convert to seconds
            var dt = scene.getEngine().getDeltaTime() / 1000;
            this._time += dt;
        });

        // Clean up observer when material is disposed to prevent memory leaks
        material.onDisposeObservable.add(() => {
            if (this._renderObserver) {
                scene.onBeforeRenderObservable.remove(this._renderObserver);
                this._renderObserver = null;
            }
        });
    }

    prepareDefines(defines, scene, mesh) {
        defines['NOA_FLOW_ANIMATION'] = true;
    }

    getClassName() {
        return 'FlowAnimationPlugin'
    }

    getUniforms() {
        return {
            ubo: [
                { name: 'flowTime', size: 1, type: 'float' },
                { name: 'flowDirection', size: 3, type: 'vec3' },
                { name: 'flowSpeed', size: 1, type: 'float' },
                { name: 'flowPatternLength', size: 1, type: 'float' },
            ]
        }
    }

    bindForSubMesh(uniformBuffer, scene, engine, subMesh) {
        uniformBuffer.updateFloat('flowTime', this._time);
        uniformBuffer.updateFloat3('flowDirection',
            this._flowDirection[0],
            this._flowDirection[1],
            this._flowDirection[2]);
        uniformBuffer.updateFloat('flowSpeed', this._flowSpeed);
        uniformBuffer.updateFloat('flowPatternLength', this._patternLength);
    }

    getCustomCode(shaderType) {
        if (shaderType === 'vertex') return {
            'CUSTOM_VERTEX_DEFINITIONS': `
                uniform float flowTime;
                uniform vec3 flowDirection;
                uniform float flowSpeed;
                uniform float flowPatternLength;
            `,
            'CUSTOM_VERTEX_UPDATE_POSITION': `
                // Simple repeating pattern mode
                // Pattern repeats every patternLength blocks
                // Offset wraps seamlessly because pattern also repeats at patternLength
                float flowOffset = fract(flowTime * flowSpeed / flowPatternLength) * flowPatternLength;
                positionUpdated += flowDirection * flowOffset;
            `,
        }
        return null
    }
}

/**
 * Material management for terrain meshes.
 * @module terrain/terrainMaterials
 */

/**
 * Creates and manages Materials for terrain meshes.
 * Maps block face materials to terrain material IDs for mesh merging,
 * and creates the materials when needed.
 * @internal
 */
class TerrainMatManager {
    /**
     * @param {import('./index.js').TerrainMesher} parent
     */
    constructor(parent) {
        /** @type {import('./index.js').TerrainMesher} */
        this.parent = parent;

        // make a baseline default material for untextured terrain with no alpha
        this._defaultMat = parent.noa.rendering.makeStandardMaterial('base-terrain');
        this._defaultMat.freeze();

        /** @type {import('@babylonjs/core').Material[]} */
        this.allMaterials = [this._defaultMat];

        // internals
        /** @internal @type {number} */
        this._idCounter = 1000;
        /** @internal @type {Object.<number, number>} */
        this._blockMatIDtoTerrainID = {};
        /** @internal @type {Object.<number, import('@babylonjs/core').Material>} */
        this._terrainIDtoMatObject = {};
        /** @internal @type {Object.<string, number>} */
        this._texURLtoTerrainID = {};
        /** @internal @type {Map<import('@babylonjs/core').Material, number>} */
        this._renderMatToTerrainID = new Map();
    }

    /**
     * Maps a given `matID` (from noa.registry) to a unique ID of which
     * terrain material can be used for that block material.
     * This lets the terrain mesher map which blocks can be merged into
     * the same meshes.
     * Internally, this accessor also creates the material for each
     * terrainMatID as they are first encountered.
     * @param {number} blockMatID
     * @returns {number}
     */
    getTerrainMatId(blockMatID) {
        // fast case where matID has been seen before
        if (blockMatID in this._blockMatIDtoTerrainID) {
            return this._blockMatIDtoTerrainID[blockMatID]
        }
        // decide a unique terrainID for this block material
        var terrID = decideTerrainMatID(this, blockMatID);
        // create a mat object for it, if needed
        if (!(terrID in this._terrainIDtoMatObject)) {
            var mat = createTerrainMat(this, blockMatID);
            this.allMaterials.push(mat);
            this._terrainIDtoMatObject[terrID] = mat;
        }
        // cache results and done
        this._blockMatIDtoTerrainID[blockMatID] = terrID;
        return terrID
    }

    /**
     * Get a Babylon Material object, given a terrainMatID (gotten from this module)
     * @param {number} [terrainMatID=1]
     * @returns {import('@babylonjs/core').Material}
     */
    getMaterial(terrainMatID = 1) {
        return this._terrainIDtoMatObject[terrainMatID]
    }
}


/**
 * Decide a unique terrainID, based on block material ID properties
 * @param {TerrainMatManager} self
 * @param {number} [blockMatID=0]
 * @returns {number}
 */
function decideTerrainMatID(self, blockMatID = 0) {
    var matInfo = self.parent.noa.registry.getMaterialData(blockMatID);

    // custom render materials get one unique terrainID per material
    if (matInfo.renderMat) {
        var mat = matInfo.renderMat;
        if (!self._renderMatToTerrainID.has(mat)) {
            self._renderMatToTerrainID.set(mat, self._idCounter++);
        }
        return self._renderMatToTerrainID.get(mat)
    }

    // animated materials get unique terrain IDs since they need their own material instance
    if (matInfo.flowSpeed > 0) {
        return self._idCounter++
    }

    // ditto for textures, unique URL
    if (matInfo.texture) {
        var url = matInfo.texture;
        if (!(url in self._texURLtoTerrainID)) {
            self._texURLtoTerrainID[url] = self._idCounter++;
        }
        return self._texURLtoTerrainID[url]
    }

    // plain color materials with an alpha value are unique by alpha
    var alpha = matInfo.alpha;
    if (alpha > 0 && alpha < 1) return 10 + Math.round(alpha * 100)

    // the only remaining case is the baseline, which always reuses one fixed ID
    return 1
}


/**
 * Create (choose) a material for a given set of block material properties
 * @param {TerrainMatManager} self
 * @param {number} [blockMatID=0]
 * @returns {import('@babylonjs/core').Material}
 */
function createTerrainMat(self, blockMatID = 0) {
    var noa = self.parent.noa;
    var matInfo = noa.registry.getMaterialData(blockMatID);

    // custom render mats are just reused
    if (matInfo.renderMat) return matInfo.renderMat

    var isAnimated = (matInfo.flowSpeed > 0);

    // if no texture: use a basic flat material, possibly with alpha or animation
    if (!matInfo.texture) {
        var needsAlpha = (matInfo.alpha > 0 && matInfo.alpha < 1);
        if (!needsAlpha && !isAnimated) return self._defaultMat
        var matName = 'terrain-' + (isAnimated ? 'animated-' : 'alpha-') + blockMatID;
        var plainMat = noa.rendering.makeStandardMaterial(matName);
        plainMat.alpha = matInfo.alpha;

        // add flow animation plugin if needed
        if (isAnimated) {
            new FlowAnimationPlugin(plainMat, matInfo.flowSpeed, matInfo.flowDirection, matInfo.flowPatternLength);
            // animated materials can't be frozen since uniforms update each frame
        } else {
            plainMat.freeze();
        }
        return plainMat
    }

    // remaining case is a new material with a diffuse texture
    var scene = noa.rendering.getScene();
    var mat = noa.rendering.makeStandardMaterial('terrain-textured-' + blockMatID);
    var texURL = matInfo.texture;
    var sampling = texture.Texture.NEAREST_SAMPLINGMODE;
    var tex = new texture.Texture(texURL, scene, true, false, sampling);
    if (matInfo.texHasAlpha) tex.hasAlpha = true;
    mat.diffuseTexture = tex;

    // if texture is an atlas, apply material plugin
    // and check whether any material for the atlas needs alpha
    if (matInfo.atlasIndex >= 0) {
        new TerrainMaterialPlugin(mat, tex);
        if (noa.registry._textureNeedsAlpha(matInfo.texture)) {
            tex.hasAlpha = true;
        }
    }

    // add flow animation plugin if needed
    if (isAnimated) {
        new FlowAnimationPlugin(mat, matInfo.flowSpeed, matInfo.flowDirection, matInfo.flowPatternLength);
        // animated materials can't be frozen since uniforms update each frame
    } else {
        mat.freeze();
    }

    return mat
}

/**
 * Intermediate face data structures for terrain meshing.
 * @module terrain/faceData
 */

/**
 * Intermediate struct to hold data for a bunch of merged block faces.
 * The greedy mesher produces these (one per terrainID),
 * and the mesh builder turns each one into a Mesh instance.
 */
class MeshedFaceData {
    constructor() {
        /** @type {number} */
        this.terrainID = 0;
        /** @type {number} */
        this.numFaces = 0;
        // following arrays are all one element per quad
        /** @type {number[]} */
        this.matIDs = [];
        /** @type {number[]} */
        this.dirs = [];
        /** @type {number[]} */
        this.is = [];
        /** @type {number[]} */
        this.js = [];
        /** @type {number[]} */
        this.ks = [];
        /** @type {number[]} */
        this.wids = [];
        /** @type {number[]} */
        this.hts = [];
        /** @type {number[]} */
        this.packedAO = [];
    }
}

/**
 * Extremely naive object pool for MeshedFaceData objects.
 * Avoids allocations in the hot meshing path.
 */
var faceDataPool = (() => {
    /** @type {MeshedFaceData[]} */
    var arr = [];
    var ix = 0;
    var get = () => {
        if (ix >= arr.length) arr.push(new MeshedFaceData());
        ix++;
        return arr[ix - 1]
    };
    var reset = () => { ix = 0; };
    return { get, reset }
})();

/**
 * Ambient occlusion helper functions for terrain meshing.
 * @module terrain/aoHelpers
 */

/**
 * For a given face, find occlusion levels for each vertex,
 * then pack 4 such (2-bit) values into one Uint8 value.
 *
 * Occlusion levels:
 *   1 is flat ground, 2 is partial occlusion, 3 is max (corners)
 *   0 is "reverse occlusion" - an unoccluded exposed edge
 *
 * Packing order var(bit offset):
 *     B(2)  -  C(6)   ^  K
 *      -        -     +> J
 *     A(0)  -  D(4)
 *
 * @param {function(number, number, number): boolean} isSolid
 * @param {number} ipos
 * @param {number} ineg
 * @param {number} j
 * @param {number} k
 * @param {boolean} [skipReverse=false]
 * @returns {number}
 */
function packAOMask(isSolid, ipos, ineg, j, k, skipReverse = false) {
    var A = 1;
    var B = 1;
    var D = 1;
    var C = 1;

    // inc occlusion of vertex next to obstructed side
    if (isSolid(ipos, j + 1, k)) { ++D; ++C; }
    if (isSolid(ipos, j - 1, k)) { ++A; ++B; }
    if (isSolid(ipos, j, k + 1)) { ++B; ++C; }
    if (isSolid(ipos, j, k - 1)) { ++A; ++D; }

    // facing into a solid (non-opaque) block?
    var facingSolid = isSolid(ipos, j, k);
    if (facingSolid) {
        // always 2, or 3 in corners
        C = (C === 3 || isSolid(ipos, j + 1, k + 1)) ? 3 : 2;
        B = (B === 3 || isSolid(ipos, j - 1, k + 1)) ? 3 : 2;
        D = (D === 3 || isSolid(ipos, j + 1, k - 1)) ? 3 : 2;
        A = (A === 3 || isSolid(ipos, j - 1, k - 1)) ? 3 : 2;
        return C << 6 | D << 4 | B << 2 | A
    }

    // simpler logic if skipping reverse AO
    if (skipReverse) {
        // treat corner as occlusion 3 only if not occluded already
        if (C === 1 && (isSolid(ipos, j + 1, k + 1))) { C = 2; }
        if (B === 1 && (isSolid(ipos, j - 1, k + 1))) { B = 2; }
        if (D === 1 && (isSolid(ipos, j + 1, k - 1))) { D = 2; }
        if (A === 1 && (isSolid(ipos, j - 1, k - 1))) { A = 2; }
        return C << 6 | D << 4 | B << 2 | A
    }

    // check each corner, and if not present do reverse AO
    if (C === 1) {
        if (isSolid(ipos, j + 1, k + 1)) {
            C = 2;
        } else if (!(isSolid(ineg, j, k + 1)) ||
            !(isSolid(ineg, j + 1, k)) ||
            !(isSolid(ineg, j + 1, k + 1))) {
            C = 0;
        }
    }

    if (D === 1) {
        if (isSolid(ipos, j + 1, k - 1)) {
            D = 2;
        } else if (!(isSolid(ineg, j, k - 1)) ||
            !(isSolid(ineg, j + 1, k)) ||
            !(isSolid(ineg, j + 1, k - 1))) {
            D = 0;
        }
    }

    if (B === 1) {
        if (isSolid(ipos, j - 1, k + 1)) {
            B = 2;
        } else if (!(isSolid(ineg, j, k + 1)) ||
            !(isSolid(ineg, j - 1, k)) ||
            !(isSolid(ineg, j - 1, k + 1))) {
            B = 0;
        }
    }

    if (A === 1) {
        if (isSolid(ipos, j - 1, k - 1)) {
            A = 2;
        } else if (!(isSolid(ineg, j, k - 1)) ||
            !(isSolid(ineg, j - 1, k)) ||
            !(isSolid(ineg, j - 1, k - 1))) {
            A = 0;
        }
    }

    return C << 6 | D << 4 | B << 2 | A
}

/**
 * Takes in a packed AO value representing a face,
 * and returns four 2-bit numbers for the AO levels at the four corners.
 * @param {number} aomask
 * @returns {[number, number, number, number]}
 */
function unpackAOMask(aomask) {
    var A = aomask & 3;
    var B = (aomask >> 2) & 3;
    var D = (aomask >> 4) & 3;
    var C = (aomask >> 6) & 3;
    return [A, B, C, D]
}

/**
 * Metadata flag used to identify terrain meshes
 * @type {string}
 */
var terrainMeshFlag = 'noa_chunk_terrain_mesh';

/**
 * Reusable coordinate array to avoid allocations in hot paths
 * @type {number[]}
 */
var tempCoordArray = [0, 0, 0];

/**
 * Greedy meshing algorithm for terrain.
 * @module terrain/greedyMesher
 *
 * Originally based on algorithm by Mikola Lysenko:
 *     http://0fps.net/2012/07/07/meshing-minecraft-part-2/
 * but probably no code remaining from there anymore.
 * Ad-hoc AO handling made of cobwebs and dreams.
 *
 * Takes in a Chunk instance, and returns an object containing
 * GeometryData structs, keyed by terrain material ID,
 * which the terrain builder can then make into meshes.
 */

/**
 * Greedy mesher - takes a Chunk instance and returns face data
 * keyed by terrain material ID.
 * @internal
 */
class GreedyMesher {
    /**
     * @param {import('./index.js').TerrainMesher} parent
     */
    constructor(parent) {
        /** @type {import('./index.js').TerrainMesher} */
        this.parent = parent;

        // class-wide cached structs
        /** @type {Int16Array} */
        this._maskCache = new Int16Array(16);
        /** @type {Int16Array} */
        this._aoMaskCache = new Int16Array(16);
    }

    /**
     * Entry point - mesh a chunk and return face data by terrain ID
     * @param {import('../chunk.js').Chunk} chunk
     * @param {boolean} ignoreMaterials
     * @returns {Object.<string, MeshedFaceData>} keyed by terrain material ID
     */
    mesh(chunk, ignoreMaterials) {
        var cs = chunk.size;
        var noa = this.parent.noa;
        var matManager = this.parent._matManager;

        // terrain ID accessor can be overridden for hacky reasons
        var realGetTerrainID = matManager.getTerrainMatId.bind(matManager);
        var fakeGetTerrainID = (matID) => 1;
        var terrainIDgetter = ignoreMaterials ? fakeGetTerrainID : realGetTerrainID;

        // no internal faces for empty or entirely solid chunks
        var edgesOnly = (chunk._isEmpty || chunk._isFull);

        /** @type {Object.<string, MeshedFaceData>} */
        var faceDataSet = {};
        faceDataPool.reset();

        // Sweep over each axis, mapping axes to [d,u,v]
        for (var d = 0; d < 3; ++d) {
            var u = (d === 2) ? 0 : 2;
            var v = (d === 1) ? 0 : 1;

            // transposed ndarrays of nearby chunk voxels (self and neighbors)
            var nabVoxelsArr = chunk._neighbors.data.map(c => {
                if (c && c.voxels) return c.voxels.transpose(d, u, v)
                return null
            });

            // ndarray of the previous, similarly transposed
            var nabVoxelsT = ndarray(nabVoxelsArr, [3, 3, 3])
                .lo(1, 1, 1)
                .transpose(d, u, v);

            // embiggen the cached mask arrays if needed - grow exponentially to reduce allocations
            if (this._maskCache.length < cs * cs) {
                var newSize = Math.max(cs * cs, this._maskCache.length * 2);
                this._maskCache = new Int16Array(newSize);
                this._aoMaskCache = new Int16Array(newSize);
            }

            // sets up transposed accessor for querying solidity of (i,j,k)
            prepareSolidityLookup(noa, nabVoxelsT, cs);

            // mesh plane between this chunk and previous neighbor on i axis
            var prev = nabVoxelsT.get(-1, 0, 0);
            var here = nabVoxelsT.get(0, 0, 0);
            if (prev) {
                // offset version of neighbor to make queries work at i=-1
                var prevOff = prev.lo(cs, 0, 0);
                var nFaces = this._constructMeshMask(d, prevOff, -1, here, 0, noa);

                if (nFaces > 0) {
                    this._constructGeometryFromMasks(0, d, u, v, cs, cs, nFaces, faceDataSet, terrainIDgetter, noa);
                }
            }

            // if only doing edges, we're done with this axis
            if (edgesOnly) continue

            // mesh the rest of the planes internal to this chunk
            // note only looping up to (size-1), skipping final coord so as
            // not to duplicate faces at chunk borders
            for (var i = 0; i < cs - 1; i++) {
                // maybe skip y axis, if both layers are all the same voxel
                if (d === 1) {
                    var v1 = chunk._wholeLayerVoxel[i];
                    if (v1 >= 0 && v1 === chunk._wholeLayerVoxel[i + 1]) {
                        continue
                    }
                }

                // pass in layer array for skip checks, only if not already checked
                var layerVoxRef = (d === 1) ? null : chunk._wholeLayerVoxel;

                var nf = this._constructMeshMask(d, here, i, here, i + 1, noa, layerVoxRef);
                if (nf > 0) {
                    this._constructGeometryFromMasks(i + 1, d, u, v, cs, cs, nf, faceDataSet, terrainIDgetter, noa);
                }
            }

            // we skip the i-positive neighbor so as not to duplicate edge faces
        }

        return faceDataSet
    }

    /**
     * Build a 2D array of mask values representing whether a mesh face is needed at each position.
     * Each mask value is a terrain material ID, negative if the face needs to point
     * in the -i direction (towards voxel arr A).
     * @returns {number} number of mesh faces found
     */
    _constructMeshMask(d, arrA, iA, arrB, iB, noa, wholeLayerVoxel = null) {
        var len = arrA.shape[1];
        var mask = this._maskCache;
        var aoMask = this._aoMaskCache;
        var doAO = noa.rendering.useAO;
        var skipRevAo = (noa.rendering.revAoVal === noa.rendering.aoVals[0]);

        var opacityLookup = noa.registry._opacityLookup;
        var getMaterial = noa.registry.getBlockFaceMaterial;
        var materialDir = d * 2;

        // mask is iterated by a simple integer, both here and later when
        // merging meshes, so the j/k order must be the same in both places
        var n = 0;

        // set up for quick ndarray traversals
        var indexA = arrA.index(iA, 0, 0);
        var jstrideA = arrA.stride[1];
        var kstrideA = arrA.stride[2];
        var indexB = arrB.index(iB, 0, 0);
        var jstrideB = arrB.stride[1];
        var kstrideB = arrB.stride[2];

        var facesFound = 0;

        for (var k = 0; k < len; ++k) {
            var dA = indexA;
            var dB = indexB;
            indexA += kstrideA;
            indexB += kstrideB;

            // skip this second axis, if whole layer is same voxel?
            if (wholeLayerVoxel && wholeLayerVoxel[k] >= 0) {
                n += len;
                continue
            }

            for (var j = 0; j < len; j++, n++, dA += jstrideA, dB += jstrideB) {
                // mask[n] represents the face needed between the two voxel layers
                // for now, assume we never have two faces in both directions

                // note that mesher zeroes out the mask as it goes, so there's
                // no need to zero it here when no face is needed

                // IDs at i-1,j,k  and  i,j,k
                var id0 = arrA.data[dA];
                var id1 = arrB.data[dB];

                // most common case: never a face between same voxel IDs, so skip out early
                if (id0 === id1) continue

                // no face if both blocks are opaque
                var op0 = opacityLookup[id0];
                var op1 = opacityLookup[id1];
                if (op0 && op1) continue

                // also no face if both block faces have the same block material
                var m0 = getMaterial(id0, materialDir) || 0;
                var m1 = getMaterial(id1, materialDir + 1) || 0;
                if (m0 === m1) continue

                // choose which block face to draw:
                //   * if either block is opaque draw that one
                //   * if either material is missing draw the other one
                if (op0 || m1 === 0) {
                    mask[n] = m0;
                    if (doAO) aoMask[n] = packAOMask(voxelIsSolid, iB, iA, j, k, skipRevAo);
                    facesFound++;
                } else if (op1 || m0 === 0) {
                    mask[n] = -m1;
                    if (doAO) aoMask[n] = packAOMask(voxelIsSolid, iA, iB, j, k, skipRevAo);
                    facesFound++;
                } else ;
            }
        }
        return facesFound
    }

    /**
     * Greedy meshing inner loop - construct geometry data from the masks
     */
    _constructGeometryFromMasks(i, d, u, v, len1, len2, numFaces, faceDataSet, terrainIDgetter, noa) {
        var doAO = noa.rendering.useAO;
        var mask = this._maskCache;
        var aomask = this._aoMaskCache;

        var n = 0;
        var materialDir = d * 2;
        // reuse array to avoid allocation in hot path
        var coords = tempCoordArray;
        coords[0] = 0;
        coords[1] = 0;
        coords[2] = 0;
        coords[d] = i;

        var maskCompareFcn = (doAO) ? maskCompare : maskCompare_noAO;

        for (var k = 0; k < len2; ++k) {
            var w = 1;
            var h = 1;
            for (var j = 0; j < len1; j += w, n += w) {
                var maskVal = mask[n] | 0;
                if (!maskVal) {
                    w = 1;
                    continue
                }

                var ao = aomask[n] | 0;

                // Compute width and height of area with same mask/aomask values
                for (w = 1; w < len1 - j; ++w) {
                    if (!maskCompareFcn(n + w, mask, maskVal, aomask, ao)) break
                }

                OUTER:
                for (h = 1; h < len2 - k; ++h) {
                    for (var m = 0; m < w; ++m) {
                        var ix = n + m + h * len1;
                        if (!maskCompareFcn(ix, mask, maskVal, aomask, ao)) break OUTER
                    }
                }

                // for testing: doing the following will disable greediness
                //w=h=1

                // materialID and terrain ID type for the face
                var matID = Math.abs(maskVal);
                var terrainID = terrainIDgetter(matID);

                // if terrainID not seen before, start a new MeshedFaceData
                // from the extremely naive object pool
                if (!(terrainID in faceDataSet)) {
                    var fdFromPool = faceDataPool.get();
                    fdFromPool.numFaces = 0;
                    fdFromPool.terrainID = terrainID;
                    faceDataSet[terrainID] = fdFromPool;
                }

                // pack one face worth of data into the return struct
                var faceData = faceDataSet[terrainID];
                var nf = faceData.numFaces;
                faceData.numFaces++;

                faceData.matIDs[nf] = matID;
                coords[u] = j;
                coords[v] = k;
                faceData.is[nf] = coords[0];
                faceData.js[nf] = coords[1];
                faceData.ks[nf] = coords[2];
                faceData.wids[nf] = w;
                faceData.hts[nf] = h;
                faceData.packedAO[nf] = ao;
                faceData.dirs[nf] = (maskVal > 0) ? materialDir : materialDir + 1;

                // Face now finished, zero out the used part of the mask
                for (var hx = 0; hx < h; ++hx) {
                    for (var wx = 0; wx < w; ++wx) {
                        mask[n + wx + hx * len1] = 0;
                    }
                }

                // exit condition where no more faces are left to mesh
                numFaces -= w * h;
                if (numFaces === 0) return
            }
        }
    }
}


// Mask comparison helpers
function maskCompare(index, mask, maskVal, aomask, aoVal) {
    if (maskVal !== mask[index]) return false
    if (aoVal !== aomask[index]) return false
    return true
}

function maskCompare_noAO(index, mask, maskVal, aomask, aoVal) {
    if (maskVal !== mask[index]) return false
    return true
}


/*
 * Solidity lookup system
 *
 * Rigging for a transposed (i,j,k) => boolean solidity lookup,
 * that knows how to query into neighboring chunks at edges.
 * This sets up the indirection used by `voxelIsSolid` below.
 */

var solidityLookupInittedSize = -1;
var voxelIDtoSolidity = [false, true];
var voxLookup = Array(27).fill(null);
var voxTypeLookup = Array(27).fill(0);
var coordToLoc = [0, 1, 1, 1, 1, 1, 2];
var edgeCoordLookup = [3, 0, 1, 2, 3, 0];
var missingCoordLookup = [0, 0, 1, 2, 3, 3];

/**
 * @param {import('../../index.js').Engine} noa
 */
function prepareSolidityLookup(noa, nabVoxelsT, size) {
    if (solidityLookupInittedSize !== size) {
        solidityLookupInittedSize = size;
        voxelIDtoSolidity = noa.registry._solidityLookup;

        for (var x = -1; x < size + 1; x++) {
            var loc = (x < 0) ? 0 : (x < size) ? 1 : 2;
            coordToLoc[x + 1] = [0, 1, 2][loc];
            edgeCoordLookup[x + 1] = [size - 1, x, 0][loc];
            missingCoordLookup[x + 1] = [0, x, size - 1][loc];
        }
    }

    var centerChunk = nabVoxelsT.get(0, 0, 0);
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                var ix = i * 9 + j * 3 + k;
                var nab = nabVoxelsT.get(i - 1, j - 1, k - 1);
                var type = 0;
                if (!nab) type = 1;
                if (nab === centerChunk) type = 2;
                voxTypeLookup[ix] = type;
                voxLookup[ix] = nab || centerChunk;
            }
        }
    }
}

/**
 * Query solidity at a transposed (i,j,k) coordinate
 * @param {number} i
 * @param {number} j
 * @param {number} k
 * @returns {boolean}
 */
function voxelIsSolid(i, j, k) {
    var li = coordToLoc[i + 1];
    var lj = coordToLoc[j + 1];
    var lk = coordToLoc[k + 1];
    var ix = li * 9 + lj * 3 + lk;
    var voxArray = voxLookup[ix];
    var type = voxTypeLookup[ix];
    if (type === 2) {
        return voxelIDtoSolidity[voxArray.get(i, j, k)]
    }
    var lookup = [edgeCoordLookup, missingCoordLookup][type];
    var ci = lookup[i + 1];
    var cj = lookup[j + 1];
    var ck = lookup[k + 1];
    return voxelIDtoSolidity[voxArray.get(ci, cj, ck)]
}

/**
 * Mesh construction from greedy mesher output.
 * @module terrain/meshBuilder
 *
 * Consumes all the raw data in faceDataSet to build
 * Babylon.js mesh/submeshes, ready to be added to the scene.
 */

/**
 * Mesh Builder - consumes raw face data to build
 * Babylon.js mesh/submeshes ready to be added to the scene.
 * @internal
 */
class MeshBuilder {
    /**
     * @param {import('./index.js').TerrainMesher} parent
     */
    constructor(parent) {
        /** @type {import('./index.js').TerrainMesher} */
        this.parent = parent;
    }

    /**
     * Consume the intermediate FaceData struct and produce
     * actual meshes the 3D engine can render
     * @param {import('../chunk.js').Chunk} chunk
     * @param {Object.<string, MeshedFaceData>} faceDataSet
     * @param {boolean} ignoreMaterials
     * @returns {import('@babylonjs/core').Mesh[]}
     */
    buildMesh(chunk, faceDataSet, ignoreMaterials) {
        var noa = this.parent.noa;
        var scene = noa.rendering.getScene();

        var doAO = noa.rendering.useAO;
        var aoVals = noa.rendering.aoVals;
        var revAoVal = noa.rendering.revAoVal;

        var atlasIndexLookup = noa.registry._matAtlasIndexLookup;
        var matColorLookup = noa.registry._materialColorLookup;
        var white = [1, 1, 1];

        // geometry data is already keyed by terrain type, so build
        // one mesh per faceData object in the hash
        var meshes = [];
        for (var key in faceDataSet) {
            var faceData = faceDataSet[key];
            var terrainID = faceData.terrainID;

            // will this mesh need texture atlas indexes?
            var usesAtlas = false;
            if (!ignoreMaterials) {
                var firstIx = atlasIndexLookup[faceData.matIDs[0]];
                usesAtlas = (firstIx >= 0);
            }

            // build the necessary arrays
            var nf = faceData.numFaces;
            var indices = new Uint16Array(nf * 6);
            var positions = new Float32Array(nf * 12);
            var normals = new Float32Array(nf * 12);
            var colors = new Float32Array(nf * 16);
            var uvs = new Float32Array(nf * 8);
            var atlasIndexes;
            if (usesAtlas) atlasIndexes = new Float32Array(nf * 4);

            // scan all faces in the struct, creating data for each
            for (var f = 0; f < faceData.numFaces; f++) {
                // basic data from struct
                var matID = faceData.matIDs[f];
                var materialDir = faceData.dirs[f];  // 0..5: x,-x, y,-y, z,-z

                var i = faceData.is[f];
                var j = faceData.js[f];
                var k = faceData.ks[f];
                var w = faceData.wids[f];
                var h = faceData.hts[f];
                var axis = (materialDir / 2) | 0;
                var dir = (materialDir % 2) ? -1 : 1;

                addPositionValues(positions, f, i, j, k, axis, w, h);
                addUVs(uvs, f, axis, w, h, dir);

                var norms = [0, 0, 0];
                norms[axis] = dir;
                addNormalValues(normals, f, norms);

                var ao = faceData.packedAO[f];
                var [A, B, C, D] = unpackAOMask(ao);
                var triDir = decideTriDir(A, B, C, D);

                addIndexValues(indices, f, axis, dir, triDir);

                if (usesAtlas) {
                    var atlasIndex = atlasIndexLookup[matID];
                    addAtlasIndices(atlasIndexes, f, atlasIndex);
                }

                var matColor = matColorLookup[matID] || white;
                if (doAO) {
                    pushMeshColors(colors, f, matColor, aoVals, revAoVal, A, B, C, D);
                } else {
                    pushMeshColors_noAO(colors, f, matColor);
                }
            }

            // the mesh and vertexData object
            var name = `chunk_${chunk.requestID}_${terrainID}`;
            var mesh$1 = new mesh.Mesh(name, scene);
            var vdat = new mesh_vertexData.VertexData();

            // finish the mesh
            vdat.positions = positions;
            vdat.indices = indices;
            vdat.normals = normals;
            vdat.colors = colors;
            vdat.uvs = uvs;
            vdat.applyToMesh(mesh$1);

            // meshes using a texture atlas need atlasIndices
            if (usesAtlas) {
                mesh$1.setVerticesData('texAtlasIndices', atlasIndexes, false, 1);
            }

            // disable some unnecessary bounding checks
            mesh$1.isPickable = false;
            mesh$1.doNotSyncBoundingInfo = true;
            mesh$1._refreshBoundingInfo = () => mesh$1;

            // materials wrangled by external module
            if (!ignoreMaterials) {
                mesh$1.material = this.parent._matManager.getMaterial(terrainID);
            }

            meshes.push(mesh$1);
        }

        return meshes
    }
}


/*
 * Helper functions for building mesh arrays
 * These could probably be simplified and less magical
 */

/**
 * @param {Float32Array} posArr
 */
function addPositionValues(posArr, faceNum, i, j, k, axis, w, h) {
    var offset = faceNum * 12;

    var loc = [i, j, k];
    var du = [0, 0, 0];
    var dv = [0, 0, 0];
    du[(axis === 2) ? 0 : 2] = w;
    dv[(axis === 1) ? 0 : 1] = h;

    for (var ix = 0; ix < 3; ix++) {
        posArr[offset + ix] = loc[ix];
        posArr[offset + 3 + ix] = loc[ix] + du[ix];
        posArr[offset + 6 + ix] = loc[ix] + du[ix] + dv[ix];
        posArr[offset + 9 + ix] = loc[ix] + dv[ix];
    }
}

/**
 * @param {Float32Array} uvArr
 */
function addUVs(uvArr, faceNum, d, w, h, dir) {
    var offset = faceNum * 8;
    var epsilon = 0;
    for (var i = 0; i < 8; i++) uvArr[offset + i] = epsilon;
    if (d === 0) {
        uvArr[offset + 1] = uvArr[offset + 3] = h - epsilon;
        uvArr[offset + 2] = uvArr[offset + 4] = dir * w;
    } else if (d === 1) {
        uvArr[offset + 1] = uvArr[offset + 7] = w - epsilon;
        uvArr[offset + 4] = uvArr[offset + 6] = dir * h;
    } else {
        uvArr[offset + 1] = uvArr[offset + 3] = h - epsilon;
        uvArr[offset + 2] = uvArr[offset + 4] = -dir * w;
    }
}

/**
 * @param {Float32Array} normArr
 */
function addNormalValues(normArr, faceNum, norms) {
    var offset = faceNum * 12;
    for (var i = 0; i < 12; i++) {
        normArr[offset + i] = norms[i % 3];
    }
}

var indexLists = [
    [0, 1, 2, 0, 2, 3], // base
    [0, 2, 1, 0, 3, 2], // flipped
    [1, 2, 3, 1, 3, 0], // opposite triDir
    [1, 3, 2, 1, 0, 3], // opposite triDir
];

/**
 * @param {Uint16Array} indArr
 */
function addIndexValues(indArr, faceNum, axis, dir, triDir) {
    var offset = faceNum * 6;
    var baseIndex = faceNum * 4;
    if (axis === 0) dir = -dir;
    var ix = (dir < 0) ? 0 : 1;
    if (!triDir) ix += 2;
    var indexVals = indexLists[ix];
    for (var i = 0; i < 6; i++) {
        indArr[offset + i] = baseIndex + indexVals[i];
    }
}

/**
 * @param {Float32Array} indArr
 */
function addAtlasIndices(indArr, faceNum, atlasIndex) {
    var offset = faceNum * 4;
    for (var i = 0; i < 4; i++) {
        indArr[offset + i] = atlasIndex;
    }
}

/**
 * Decide triangle direction based on AO values - this bit is pretty magical.
 * (true means split along the a00-a11 axis)
 */
function decideTriDir(A, B, C, D) {
    if (A === C) {
        return (D === B) ? (D === 2) : true
    } else {
        return (D === B) ? false : (A + C > D + B)
    }
}

/**
 * @param {Float32Array} colors
 */
function pushMeshColors_noAO(colors, faceNum, col) {
    var offset = faceNum * 16;
    for (var i = 0; i < 16; i += 4) {
        colors[offset + i] = col[0];
        colors[offset + i + 1] = col[1];
        colors[offset + i + 2] = col[2];
        colors[offset + i + 3] = 1;
    }
}

/**
 * @param {Float32Array} colors
 */
function pushMeshColors(colors, faceNum, col, aoVals, revAo, A, B, C, D) {
    var offset = faceNum * 16;
    pushAOColor(colors, offset, col, A, aoVals, revAo);
    pushAOColor(colors, offset + 4, col, D, aoVals, revAo);
    pushAOColor(colors, offset + 8, col, C, aoVals, revAo);
    pushAOColor(colors, offset + 12, col, B, aoVals, revAo);
}

/**
 * Premultiply vertex colors by value depending on AO level
 * then push them into color array
 */
function pushAOColor(colors, ix, baseCol, ao, aoVals, revAoVal) {
    var mult = (ao === 0) ? revAoVal : aoVals[ao - 1];
    colors[ix] = baseCol[0] * mult;
    colors[ix + 1] = baseCol[1] * mult;
    colors[ix + 2] = baseCol[2] * mult;
    colors[ix + 3] = 1;
}

/**
 * Terrain meshing module - manages terrain mesh generation and materials.
 * @module terrain
 *
 * Top-level entry point: takes a chunk, passes it to the greedy mesher,
 * gets back an intermediate struct of face data, passes that to the mesh
 * builder, gets back an array of Mesh objects, and finally puts those
 * into the 3D engine.
 */

/**
 * `noa._terrainMesher` - Top-level terrain meshing coordinator.
 * @internal
 */
class TerrainMesher {
    /**
     * @param {import('../../index.js').Engine} noa
     */
    constructor(noa) {
        /** @type {import('../../index.js').Engine} */
        this.noa = noa;

        // Initialize sub-modules
        /** @internal */
        this._matManager = new TerrainMatManager(this);
        /** @internal */
        this._greedyMesher = new GreedyMesher(this);
        /** @internal */
        this._meshBuilder = new MeshBuilder(this);

        // Expose public properties
        /** @type {import('@babylonjs/core').Material[]} */
        this.allTerrainMaterials = this._matManager.allMaterials;

        // internally expose the default flat material used for untextured terrain
        /** @internal */
        this._defaultMaterial = this._matManager._defaultMat;
    }


    // ============ CHUNK LIFECYCLE ============

    /**
     * Set or clean up any per-chunk properties needed for terrain meshing
     * @param {import('../chunk.js').Chunk} chunk
     */
    initChunk(chunk) {
        chunk._terrainMeshes.length = 0;
    }

    /**
     * Dispose all terrain meshes for a chunk
     * @param {import('../chunk.js').Chunk} chunk
     */
    disposeChunk(chunk) {
        chunk._terrainMeshes.forEach(mesh => {
            this.noa.emit('removingTerrainMesh', mesh);
            mesh.dispose();
        });
        chunk._terrainMeshes.length = 0;
    }


    // ============ MESHING ============

    /**
     * Meshing entry point and high-level flow
     * @param {import('../chunk.js').Chunk} chunk
     * @param {boolean} [ignoreMaterials=false]
     */
    meshChunk(chunk, ignoreMaterials = false) {

        // remove any previous terrain meshes
        this.disposeChunk(chunk);

        // greedy mesher generates struct of face data
        var faceDataSet = this._greedyMesher.mesh(chunk, ignoreMaterials);

        // builder generates mesh data (positions, normals, etc)
        var meshes = this._meshBuilder.buildMesh(chunk, faceDataSet, ignoreMaterials);

        // add meshes to scene and finish
        meshes.forEach((mesh$1) => {
            mesh$1.cullingStrategy = mesh.Mesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;
            this.noa.rendering.addMeshToScene(mesh$1, true, chunk.pos, chunk);
            this.noa.emit('addingTerrainMesh', mesh$1);
            mesh$1.freezeNormals();
            mesh$1.freezeWorldMatrix();
            chunk._terrainMeshes.push(mesh$1);
            if (!mesh$1.metadata) mesh$1.metadata = {};
            mesh$1.metadata[terrainMeshFlag] = true;
        });
    }
}

/**
 * Registry module - block and material registration.
 * @module registry
 */


/** @type {{texturePath: string}} */
var defaults$1 = {
    texturePath: ''
};

/** Maximum block ID (uses full Uint16Array element). */
var MAX_BLOCK_ID = (1 << 16) - 1;



/**
 * `noa.registry` - Where you register your voxel types, 
 * materials, properties, and events.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * 
 * ```js
 * var defaults = {
 *     texturePath: ''
 * }
 * ```
*/

class Registry {


    /** 
     * @internal 
     * @param {import('../index').Engine} noa
    */
    constructor(noa, opts) {
        opts = Object.assign({}, defaults$1, opts);
        /** @internal */
        this.noa = noa;

        /** @internal */
        this._texturePath = opts.texturePath;

        /** Maps block face material names to matIDs
         * @type {Object.<string, number>} */
        var matIDs = {};

        // lookup arrays for block props and flags - all keyed by blockID
        // fill in first value for the air block with id=0
        var blockSolidity = [false];
        var blockOpacity = [false];
        var blockIsFluid = [false];
        var blockIsObject = [false];
        var blockProps = [null];     // less-often accessed properties
        var blockMeshes = [null];    // custom mesh objects
        var blockHandlers = [null];  // block event handlers
        var blockIsPlain = [false];  // true if voxel is "boring" - solid/opaque, no special props

        // this one is keyed by `blockID*6 + faceNumber`
        var blockMats = [0, 0, 0, 0, 0, 0];

        // and these are keyed by material id
        var matColorLookup = [null];
        var matAtlasIndexLookup = [-1];

        /**
         * Lookup array of block face material properties - keyed by matID (not blockID)
         * @typedef MatDef
         * @prop {number[]} color
         * @prop {number} alpha
         * @prop {string} texture
         * @prop {boolean} texHasAlpha
         * @prop {number} atlasIndex
         * @prop {*} renderMat
         * @prop {number} flowSpeed
         * @prop {number[]} flowDirection
         * @prop {number} flowPatternLength
         */
        /** @type {MatDef[]} */
        var matDefs = [];


        // ============ BLOCK REGISTRATION ============

        /**
         * Register (by integer ID) a block type and its parameters.
         *  `id` param: integer, currently 1..65535. Generally you should 
         * specify sequential values for blocks, without gaps, but this 
         * isn't technically necessary.
         * 
         * @param {number} id - sequential integer ID (from 1)
         * @param {Partial<BlockOptions>} [options] 
         * @returns the `id` value specified
         */
        this.registerBlock = function (id = 1, options = null) {
            var defaults = new BlockOptions(options && options.fluid);
            var opts = Object.assign({}, defaults, options || {});

            // console.log('register block: ', id, opts)
            if (id < 1 || id > MAX_BLOCK_ID) throw 'Block id out of range: ' + id

            // if block ID is greater than current highest ID, 
            // register fake blocks to avoid holes in lookup arrays
            while (id > blockSolidity.length) {
                this.registerBlock(blockSolidity.length, {});
            }

            // flags default to solid, opaque, nonfluid
            blockSolidity[id] = !!opts.solid;
            blockOpacity[id] = !!opts.opaque;
            blockIsFluid[id] = !!opts.fluid;

            // store any custom mesh
            blockIsObject[id] = !!opts.blockMesh;
            blockMeshes[id] = opts.blockMesh || null;

            // parse out material parameter
            // always store 6 material IDs per blockID, so material lookup is monomorphic
            var mat = opts.material || null;
            var mats;
            if (!mat) {
                mats = [null, null, null, null, null, null];
            } else if (typeof mat == 'string') {
                mats = [mat, mat, mat, mat, mat, mat];
            } else if (mat.length && mat.length == 2) {
                // interpret as [top/bottom, sides]
                mats = [mat[1], mat[1], mat[0], mat[0], mat[1], mat[1]];
            } else if (mat.length && mat.length == 3) {
                // interpret as [top, bottom, sides]
                mats = [mat[2], mat[2], mat[0], mat[1], mat[2], mat[2]];
            } else if (mat.length && mat.length == 6) {
                // interpret as [+x, -x, +y, -y, +z, -z]
                mats = mat;
            } else throw 'Invalid material parameter: ' + mat

            // argument is material name, but store as material id, allocating one if needed
            for (var i = 0; i < 6; ++i) {
                blockMats[id * 6 + i] = getMaterialId(this, matIDs, mats[i], true);
            }

            // props data object - currently only used for fluid properties
            blockProps[id] = {};

            // if block is fluid, initialize properties if needed
            if (blockIsFluid[id]) {
                blockProps[id].fluidDensity = opts.fluidDensity;
                blockProps[id].viscosity = opts.viscosity;
            }

            // event callbacks
            var hasHandler = opts.onLoad || opts.onUnload || opts.onSet || opts.onUnset || opts.onCustomMeshCreate;
            blockHandlers[id] = (hasHandler) ? new BlockCallbackHolder(opts) : null;

            // special lookup for "plain"-ness
            // plain means solid, opaque, not fluid, no mesh or events
            var isPlain = blockSolidity[id] && blockOpacity[id]
                && !hasHandler && !blockIsFluid[id] && !blockIsObject[id];
            blockIsPlain[id] = isPlain;

            return id
        };




        /**
         * Register (by name) a material and its parameters.
         * 
         * @param {string} name of this material
         * @param {Partial<MaterialOptions>} [options]
         */

        this.registerMaterial = function (name = '?', options = null) {
            // catch calls to earlier signature
            if (Array.isArray(options)) {
                throw 'This API changed signatures in v0.33, please use: `noa.registry.registerMaterial("name", optionsObj)`'
            }

            var opts = Object.assign(new MaterialOptions(), options || {});
            var matID = matIDs[name] || matDefs.length;
            matIDs[name] = matID;

            var texURL = opts.textureURL ? this._texturePath + opts.textureURL : '';
            var alpha = 1.0;
            var color = opts.color || [1.0, 1.0, 1.0];
            if (color.length === 4) alpha = color.pop();
            if (texURL) color = null;

            // populate lookup arrays for terrain meshing
            matColorLookup[matID] = color;
            matAtlasIndexLookup[matID] = opts.atlasIndex;

            matDefs[matID] = {
                color,
                alpha,
                texture: texURL,
                texHasAlpha: !!opts.texHasAlpha,
                atlasIndex: opts.atlasIndex,
                renderMat: opts.renderMaterial,
                flowSpeed: opts.flowSpeed || 0,
                flowDirection: opts.flowDirection || [1, 0, 0],
                flowPatternLength: opts.flowPatternLength || 10,
            };
            return matID
        };


        // ============ BLOCK ACCESSORS ============

        /**
         * Block solidity (for physics purposes).
         * @param {number} id
         * @returns {boolean}
         */
        this.getBlockSolidity = function (id) {
            return blockSolidity[id]
        };

        /**
         * Block opacity - whether it fully obscures the voxel (like dirt)
         * or can be partially seen through (like a fencepost).
         * @param {number} id
         * @returns {boolean}
         */
        this.getBlockOpacity = function (id) {
            return blockOpacity[id]
        };

        /**
         * Whether the block is a fluid.
         * @param {number} id
         * @returns {boolean}
         */
        this.getBlockFluidity = function (id) {
            return blockIsFluid[id]
        };

        /**
         * Get block property object passed in at registration.
         * @param {number} id
         * @returns {object|null|undefined}
         */
        this.getBlockProps = function (id) {
            return blockProps[id]
        };

        /**
         * Look up a block ID's face material.
         * @param {number} blockId
         * @param {number} dir - Face direction 0..5: [+x, -x, +y, -y, +z, -z]
         * @returns {number} Material ID
         */
        this.getBlockFaceMaterial = function (blockId, dir) {
            return blockMats[blockId * 6 + dir]
        };


        /**
         * General lookup for all properties of a block material
         * @param {number} matID 
         * @returns {MatDef|undefined}
         */
        this.getMaterialData = function (matID) {
            return matDefs[matID]
        };


        /**
         * Given a texture URL, check if any material using that texture needs alpha.
         * @internal
         * @param {string} tex
         * @returns {boolean}
         */
        this._textureNeedsAlpha = function (tex = '') {
            return matDefs.some(def => {
                if (def.texture !== tex) return false
                return def.texHasAlpha
            })
        };


        // ============ INTERNAL LOOKUP ARRAYS ============
        /** @internal */
        this._solidityLookup = blockSolidity;
        /** @internal */
        this._opacityLookup = blockOpacity;
        /** @internal */
        this._fluidityLookup = blockIsFluid;
        /** @internal */
        this._objectLookup = blockIsObject;
        /** @internal */
        this._blockMeshLookup = blockMeshes;
        /** @internal */
        this._blockHandlerLookup = blockHandlers;
        /** @internal */
        this._blockIsPlainLookup = blockIsPlain;
        /** @internal */
        this._materialColorLookup = matColorLookup;
        /** @internal */
        this._matAtlasIndexLookup = matAtlasIndexLookup;


        // ============ DEFAULT INITIALIZATION ============
        // Add a default material and block ID=1. Safe since registering
        // new block data overwrites the old.
        this.registerMaterial('dirt', { color: [0.4, 0.3, 0] });
        this.registerBlock(1, { material: 'dirt' });

    }

}


// ============ HELPERS ============

/**
 * Look up material ID given its name.
 * If lazyInit is set, pre-register the name and return an ID.
 * @param {Registry} reg
 * @param {Object.<string, number>} matIDs
 * @param {string} name
 * @param {boolean} lazyInit
 * @returns {number}
 */
function getMaterialId(reg, matIDs, name, lazyInit) {
    if (!name) return 0
    var id = matIDs[name];
    if (id === undefined && lazyInit) id = reg.registerMaterial(name);
    return id
}



/**
 * Data class for holding block callback references.
 * @internal
 */
class BlockCallbackHolder {
    /**
     * @param {BlockOptions} opts
     */
    constructor(opts) {
        /** @type {((x:number, y:number, z:number) => void)|null} */
        this.onLoad = opts.onLoad || null;
        /** @type {((x:number, y:number, z:number) => void)|null} */
        this.onUnload = opts.onUnload || null;
        /** @type {((x:number, y:number, z:number) => void)|null} */
        this.onSet = opts.onSet || null;
        /** @type {((x:number, y:number, z:number) => void)|null} */
        this.onUnset = opts.onUnset || null;
        /** @type {((mesh:TransformNode, x:number, y:number, z:number) => void)|null} */
        this.onCustomMeshCreate = opts.onCustomMeshCreate || null;
    }
}




/**
 * Default options when registering a block type.
 */
class BlockOptions {
    /**
     * @param {boolean} [isFluid=false]
     */
    constructor(isFluid = false) {
        /** Solidity for physics purposes.
         * @type {boolean} */
        this.solid = (isFluid) ? false : true;

        /** Whether the block fully obscures neighboring blocks.
         * @type {boolean} */
        this.opaque = (isFluid) ? false : true;

        /** Whether a nonsolid block is a fluid (buoyant, viscous..).
         * @type {boolean} */
        this.fluid = false;

        /**
         * The block material(s) for this voxel's faces. May be:
         *   - one (String) material name
         *   - array of 2 names: [top/bottom, sides]
         *   - array of 3 names: [top, bottom, sides]
         *   - array of 6 names: [+x, -x, +y, -y, +z, -z]
         * @type {string|string[]|null}
         */
        this.material = null;

        /** Specifies a custom mesh for this voxel, instead of terrain.
         * @type {*} */
        this.blockMesh = null;

        /** Fluid density parameter for fluid blocks.
         * @type {number} */
        this.fluidDensity = 1.0;

        /** Viscosity parameter for fluid blocks.
         * @type {number} */
        this.viscosity = 0.5;

        /** Callback when block's chunk is loaded.
         * @type {((x:number, y:number, z:number) => void)|null} */
        this.onLoad = null;

        /** Callback when block's chunk is unloaded.
         * @type {((x:number, y:number, z:number) => void)|null} */
        this.onUnload = null;

        /** Callback when block is set/placed.
         * @type {((x:number, y:number, z:number) => void)|null} */
        this.onSet = null;

        /** Callback when block is unset/removed.
         * @type {((x:number, y:number, z:number) => void)|null} */
        this.onUnset = null;

        /** Callback when custom mesh is created for this block.
         * @type {((mesh:TransformNode, x:number, y:number, z:number) => void)|null} */
        this.onCustomMeshCreate = null;
    }
}

/** @typedef {import('@babylonjs/core').TransformNode} TransformNode */


/**
 * Default options when registering a block material.
 */
class MaterialOptions {
    constructor() {
        /**
         * An array of 0..1 floats, either [R,G,B] or [R,G,B,A].
         * @type {number[]|null}
         */
        this.color = null;

        /**
         * Filename of texture image, if any.
         * @type {string|null}
         */
        this.textureURL = null;

        /**
         * Whether the texture image has alpha.
         * @type {boolean}
         */
        this.texHasAlpha = false;

        /**
         * Index into a (vertical strip) texture atlas, if applicable.
         * @type {number}
         */
        this.atlasIndex = -1;

        /**
         * An optional Babylon.js `Material`. If specified, terrain for this voxel
         * will be rendered with the supplied material (this can impact performance).
         * @type {*}
         */
        this.renderMaterial = null;

        /**
         * Flow/conveyor animation speed in blocks per second.
         * If > 0, the material will animate smoothly. Default is 0 (no animation).
         * @type {number}
         */
        this.flowSpeed = 0;

        /**
         * Flow/conveyor animation direction as [x, y, z]. Only used if flowSpeed > 0.
         * Example: [1, 0, 0] flows in +X direction, [0, 0, -1] flows in -Z direction.
         * @type {number[]}
         */
        this.flowDirection = [1, 0, 0];

        /**
         * Pattern length in blocks for repeating flow animations.
         * The vertex offset will wrap every N blocks. Default is 10.
         * Set this to match your prebaked texture/block pattern length for seamless wrapping.
         * @type {number}
         */
        this.flowPatternLength = 10;
    }
}

/**
 * Internal representation of OctreeBlock for rebase operations.
 * Includes private Babylon.js properties we need to access.
 * We cast to this type when accessing Babylon internals.
 * @typedef {object} OctreeBlockInternal
 * @property {Vector3} minPoint
 * @property {Vector3} maxPoint
 * @property {Vector3[]} _boundingVectors - Private Babylon.js property
 * @property {OctreeBlockInternal[]} [blocks] - Child blocks (optional)
 */

/**
 * Parent node in octree hierarchy (Octree or OctreeBlock with children)
 * @typedef {object} OctreeParent
 * @property {OctreeBlockInternal[]} blocks
 */

/*
 * 
 * 
 * 
 *          simple class to manage scene octree and octreeBlocks
 * 
 * 
 * 
*/

/** @internal */
class SceneOctreeManager {

    /** @internal */
    constructor(rendering, blockSize) {
        var scene = rendering.scene;
        scene._addComponent(new octreeSceneComponent.OctreeSceneComponent(scene));

        // mesh metadata flags
        var octreeBlock$1 = 'noa_octree_block';
        var inDynamicList = 'noa_in_dynamic_list';
        var inOctreeBlock = 'noa_in_octree_block';

        // the root octree object
        var octree$1 = new octree.Octree(NOP);
        scene._selectionOctree = octree$1;
        octree$1.blocks = [];
        var octBlocksHash = {};


        /*
         * 
         *          public API
         * 
        */

        /** @param {Vector3} offset */
        this.rebase = (offset) => { recurseRebaseBlocks(/** @type {OctreeParent} */ (/** @type {unknown} */ (octree$1)), offset); };

        this.addMesh = (mesh, isStatic, pos, chunk) => {
            if (!mesh.metadata) mesh.metadata = {};

            // dynamic content is just rendered from a list on the octree
            if (!isStatic) {
                if (mesh.metadata[inDynamicList]) return
                octree$1.dynamicContent.push(mesh);
                mesh.metadata[inDynamicList] = true;
                return
            }

            // octreeBlock-space integer coords of mesh position, and hashed key
            var ci = Math.floor(pos[0] / bs);
            var cj = Math.floor(pos[1] / bs);
            var ck = Math.floor(pos[2] / bs);
            var mapKey = locationHasher(ci, cj, ck);

            // get or create octreeBlock
            var block = octBlocksHash[mapKey];
            if (!block) {
                // lower corner of new octree block position, in global/local
                var gloc = [ci * bs, cj * bs, ck * bs];
                var loc = [0, 0, 0];
                rendering.noa.globalToLocal(gloc, null, loc);
                // make the new octree block and store it
                block = makeOctreeBlock(loc, bs);
                octree$1.blocks.push(block);
                octBlocksHash[mapKey] = block;
                block._noaMapKey = mapKey;
            }

            // do the actual adding logic
            block.entries.push(mesh);
            mesh.metadata[octreeBlock$1] = block;
            mesh.metadata[inOctreeBlock] = true;

            // rely on octrees for selection, skipping bounds checks
            mesh.alwaysSelectAsActiveMesh = true;
        };



        this.removeMesh = (mesh) => {
            if (!mesh.metadata) return

            if (mesh.metadata[inDynamicList]) {
                removeUnorderedListItem(octree$1.dynamicContent, mesh);
                mesh.metadata[inDynamicList] = false;
            }
            if (mesh.metadata[inOctreeBlock]) {
                var block = mesh.metadata[octreeBlock$1];
                if (block && block.entries) {
                    removeUnorderedListItem(block.entries, mesh);
                    if (block.entries.length === 0) {
                        delete octBlocksHash[block._noaMapKey];
                        removeUnorderedListItem(octree$1.blocks, block);
                    }
                }
                mesh.metadata[octreeBlock$1] = null;
                mesh.metadata[inOctreeBlock] = false;
            }
        };



        // experimental helper
        this.setMeshVisibility = (mesh, visible = false) => {
            if (mesh.metadata[octreeBlock$1]) {
                // mesh is static
                if (mesh.metadata[inOctreeBlock] === visible) return
                var block = mesh.metadata[octreeBlock$1];
                if (block && block.entries) {
                    if (visible) {
                        block.entries.push(mesh);
                    } else {
                        removeUnorderedListItem(block.entries, mesh);
                    }
                }
                mesh.metadata[inOctreeBlock] = visible;
            } else {
                // mesh is dynamic
                if (mesh.metadata[inDynamicList] === visible) return
                if (visible) {
                    octree$1.dynamicContent.push(mesh);
                } else {
                    removeUnorderedListItem(octree$1.dynamicContent, mesh);
                }
                mesh.metadata[inDynamicList] = visible;
            }
            // Actually hide/show the mesh in Babylon.js
            mesh.isVisible = visible;
        };

        /*
         * 
         *          internals
         * 
        */

        var NOP = () => { };
        var bs = blockSize * rendering.noa.world._chunkSize;

        /**
         * @param {OctreeParent} parent
         * @param {Vector3} offset
         */
        var recurseRebaseBlocks = (parent, offset) => {
            parent.blocks.forEach((child) => {
                child.minPoint.subtractInPlace(offset);
                child.maxPoint.subtractInPlace(offset);
                child._boundingVectors.forEach((v) => v.subtractInPlace(offset));
                if (child.blocks) recurseRebaseBlocks(/** @type {OctreeParent} */ (child), offset);
            });
        };

        /**
         * @param {number[]} minPt
         * @param {number} size
         */
        var makeOctreeBlock = (minPt, size) => {
            var min = new math_vector.Vector3(minPt[0], minPt[1], minPt[2]);
            var max = new math_vector.Vector3(minPt[0] + size, minPt[1] + size, minPt[2] + size);
            return new octreeBlock.OctreeBlock(min, max, undefined, undefined, undefined, NOP)
        };

    }

}

/**
 * Core scene/engine initialization and disposal.
 * Extracted from the monolithic renderer so the lifecycle is isolated here.
 */
class RenderingCore {

    /**
     * @param {import('./index.js').Rendering} rendering
     * @param {import('./index.js').RenderingOptions} opts
     * @param {HTMLCanvasElement} canvas
     */
    constructor(rendering, opts, canvas) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering;
        /** RAF id used while polling scene readiness */
        /** @type {number | null} */ this._sceneReadyPollId = null;
        this._initScene(opts, canvas);
    }


    /**
     * Wire up Babylon Engine, Scene, octree, camera holder, and readiness tracking.
     * @param {import('./index.js').RenderingOptions} opts
     * @param {HTMLCanvasElement} canvas
     */
    _initScene(opts, canvas) {
        var rendering = this.rendering;

        // Engine/scene creation
        rendering.engine = new engine.Engine(canvas, opts.antiAlias, {
            preserveDrawingBuffer: opts.preserveDrawingBuffer,
        });
        var scene$1 = new scene.Scene(rendering.engine);
        rendering.scene = scene$1;
        // remove built-in listeners - noa installs its own input handling
        scene$1.detachControl();

        // disable expensive features noa doesn't use
        scene$1.performancePriority = scene.ScenePerformancePriority.Intermediate;
        scene$1.autoClear = true;
        scene$1.skipPointerMovePicking = true;

        // octree manager handles chunk/static vs dynamic mesh registration
        var blockSize = Math.round(opts.octreeBlockSize);
        rendering._octreeManager = new SceneOctreeManager(rendering, blockSize);

        // camera holder/camera (camera parent collects rotations)
        rendering._cameraHolder = new transformNode.TransformNode('camHolder', scene$1);
        rendering.camera = new freeCamera.FreeCamera('camera', new math_vector.Vector3(0, 0, 0), scene$1);
        rendering.camera.parent = rendering._cameraHolder;
        rendering.camera.minZ = .01;

        // apply defaults
        scene$1.clearColor = math_color.Color4.FromArray(opts.clearColor);
        scene$1.ambientColor = math_color.Color3.FromArray(opts.ambientColor);

        // Set up scene readiness tracking AFTER all initial scene setup
        // NOTE: Babylon's onReadyObservable and executeWhenReady fire BEFORE shaders
        // are actually compiled. We must poll scene.isReady() to ensure true readiness.
        var self = this;
        rendering.sceneReady = new Promise((resolve) => {
            if (scene$1.isReady()) {
                rendering._sceneIsReady = true;
                resolve();
                return
            }

            // Poll for scene.isReady() using requestAnimationFrame
            // This ensures we wait for actual shader compilation, not just queued resources
            var pollCount = 0;
            var maxPolls = 300; // ~5 seconds at 60fps

            function pollReady() {
                // Clear pending ID since we're now executing
                self._sceneReadyPollId = null;
                // Stop polling if disposed
                if (rendering._disposed) return
                pollCount++;
                if (scene$1.isReady()) {
                    rendering._sceneIsReady = true;
                    // Call any queued callbacks
                    for (var cb of rendering._sceneReadyCallbacks) {
                        try { cb(); } catch (e) { console.error('[noa] sceneReady callback error:', e); }
                    }
                    rendering._sceneReadyCallbacks = [];
                    resolve();
                } else if (pollCount >= maxPolls) {
                    // Timeout - resolve anyway to prevent hanging, but log warning
                    console.warn('[noa] Scene ready timeout after', pollCount, 'polls - proceeding anyway');
                    console.warn('[noa] scene.isReady():', scene$1.isReady());
                    rendering._sceneIsReady = true;
                    for (var cb of rendering._sceneReadyCallbacks) {
                        try { cb(); } catch (e) { console.error('[noa] sceneReady callback error:', e); }
                    }
                    rendering._sceneReadyCallbacks = [];
                    resolve();
                } else {
                    // Keep polling - store ID for potential cancellation
                    self._sceneReadyPollId = requestAnimationFrame(pollReady);
                }
            }

            // Start polling on next frame (give Babylon a chance to queue resources)
            self._sceneReadyPollId = requestAnimationFrame(pollReady);
        });
    }


    /** Dispose the engine/scene and cancel readiness polling */
    dispose() {
        var rendering = this.rendering;

        // Cancel any pending scene ready polling
        if (this._sceneReadyPollId !== null) {
            cancelAnimationFrame(this._sceneReadyPollId);
            this._sceneReadyPollId = null;
        }

        // Clear scene ready callbacks to prevent memory leaks
        rendering._sceneReadyCallbacks = [];
        rendering._sceneIsReady = false;

        if (rendering.scene) {
            rendering.scene.meshes.slice().forEach(mesh => {
                if (!mesh.isDisposed()) mesh.dispose();
            });
            rendering.scene.dispose();
            rendering.scene = null;
        }
        if (rendering.engine) {
            rendering.engine.stopRenderLoop();
            rendering.engine.dispose();
            rendering.engine = null;
        }
    }
}

/**
 * Light setup and helpers for the main directional/hemispheric lighting.
 * Keeps Babylon-specific light tweaks out of the main Rendering class.
 */
class RenderingLighting {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering, opts) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering;
        this._initLight(opts);
    }

    /** Initialize the default directional light from options */
    _initLight(opts) {
        var rendering = this.rendering;
        var scene = rendering.scene;

        var lightVec = math_vector.Vector3.FromArray(opts.lightVector);
        rendering.light = new directionalLight.DirectionalLight('light', lightVec, scene);
        rendering.light.diffuse = math_color.Color3.FromArray(opts.lightDiffuse);
        rendering.light.specular = math_color.Color3.FromArray(opts.lightSpecular);
    }

    /**
     * Clean up disposed meshes from the main light's excludedMeshes array.
     * This prevents memory leaks when meshes are disposed without explicit cleanup.
     */
    tick(_dt) {
        var light = this.rendering.light;
        if (!light || !light.excludedMeshes || light.excludedMeshes.length === 0) return
        var validMeshes = light.excludedMeshes.filter(function (m) {
            return m && !m.isDisposed()
        });
        if (validMeshes.length !== light.excludedMeshes.length) {
            light.excludedMeshes = validMeshes;
        }
    }

    /**
     * Allow callers to tweak or disable the built-in directional light.
     * @param {object} opts
     * @param {import('@babylonjs/core').Vector3} [opts.direction]
     * @param {number} [opts.intensity]
     * @param {import('@babylonjs/core').Color3} [opts.diffuse]
     * @param {import('@babylonjs/core').Color3} [opts.specular]
     */
    setMainLightOptions(opts) {
        var light = this.rendering.light;
        if (!light) return
        if (opts.direction) light.direction = opts.direction;
        if (opts.intensity !== undefined) light.intensity = opts.intensity;
        if (opts.diffuse) light.diffuse = opts.diffuse;
        if (opts.specular) light.specular = opts.specular;
    }

    /**
     * Exclude a mesh (and optionally descendants) from the main directional light.
     * @param {import('@babylonjs/core').Mesh} mesh
     * @param {boolean} [includeDescendants]
     */
    excludeMesh(mesh, includeDescendants = true) {
        var light = this.rendering.light;
        if (!light || !mesh) return
        var targets = [mesh];
        if (includeDescendants && typeof mesh.getChildMeshes === 'function') {
            targets = targets.concat(mesh.getChildMeshes(false));
        }
        targets.forEach(m => {
            if (light.excludedMeshes.indexOf(m) === -1) {
                light.excludedMeshes.push(m);
            }
        });
    }

    /**
     * Re-include a mesh (and optionally descendants) so it receives the main light again.
     * @param {import('@babylonjs/core').Mesh} mesh
     * @param {boolean} [includeDescendants]
     */
    includeMesh(mesh, includeDescendants = true) {
        var light = this.rendering.light;
        if (!light || !mesh) return
        var targets = [mesh];
        if (includeDescendants && typeof mesh.getChildMeshes === 'function') {
            targets = targets.concat(mesh.getChildMeshes(false));
        }
        targets.forEach(m => {
            var idx = light.excludedMeshes.indexOf(m);
            if (idx >= 0) light.excludedMeshes.splice(idx, 1);
        });
    }

    /**
     * Create a new light in the scene.
     * @param {'directional' | 'hemispheric'} type
     * @param {string} name
     * @returns {import('@babylonjs/core').DirectionalLight | import('@babylonjs/core').HemisphericLight}
     */
    createLight(type, name) {
        var scene = this.rendering.getScene();
        if (type === 'directional') {
            return new directionalLight.DirectionalLight(name, new math_vector.Vector3(0, -1, 0), scene)
        } else if (type === 'hemispheric') {
            return new hemisphericLight.HemisphericLight(name, new math_vector.Vector3(0, 1, 0), scene)
        }
        throw new Error('Unknown light type: ' + type)
    }
}

// Mesh management helpers (octree registration, visibility)
class RenderingMeshes {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering;
    }


    /**
     * Register a mesh with noa's octree/selection system so it participates in rendering.
     * Handles Babylon quirks (LOD map, bounding info) before registration.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [isStatic]
     * @param {number[] | null} [pos]
     * @param {import('../chunk').Chunk | null} [containingChunk]
     */
    addMeshToScene(mesh, isStatic = false, pos = null, containingChunk = null) {
        var rendering = this.rendering;
        if (!mesh.metadata) mesh.metadata = {};

        // Babylon 8 expects meshes to have a _currentLOD map; ensure it exists for all meshes
        var internalInfo = /** @type {any} */ ((mesh)._internalAbstractMeshDataInfo || {});
        if (!internalInfo._currentLOD) {
            internalInfo._currentLOD = new Map();
        }
        /** @type {any} */ (mesh)._internalAbstractMeshDataInfo = internalInfo;

        // Ensure bounding info exists to avoid Babylon transparent sorting errors
        var bi = mesh.getBoundingInfo && mesh.getBoundingInfo();
        if (!bi || !bi.boundingSphere) {
            // Hide meshes without boundingInfo to prevent render errors
            mesh.isVisible = false;
            return
        }

        // Ensure submeshes have valid boundingInfo for Babylon's transparent mesh sorting
        // SubMesh.getBoundingInfo() returns: IsGlobal || hasThinInstances ? mesh.getBoundingInfo() : _boundingInfo
        // For most meshes, IsGlobal is read-only and hasThinInstances is false, so it returns _boundingInfo
        // which may be null. Fix by setting _boundingInfo on each submesh.
        if (mesh.subMeshes && mesh.subMeshes.length > 0) {
            for (var i = 0; i < mesh.subMeshes.length; i++) {
                var sm = mesh.subMeshes[i];
                // @ts-ignore private Babylon field needed for transparent sorting
                if (!sm._boundingInfo) sm._boundingInfo = bi;
            }
        }

        // Already registered? just make sure it's visible and bail
        if (mesh.metadata[addedToSceneFlag]) {
            rendering._octreeManager.setMeshVisibility(mesh, true);
            return
        }
        mesh.metadata[addedToSceneFlag] = true;

        // If unparented, move from world coords into local coords before adding
        if (!mesh.parent) {
            if (!pos) pos = mesh.position.asArray();
            var lpos = rendering.noa.globalToLocal(pos, null, []);
            mesh.position.fromArray(lpos);
        }

        // Register with the octree; ensure cleanup on disposal
        rendering._octreeManager.addMesh(mesh, isStatic, pos, containingChunk);
        mesh.onDisposeObservable.add(() => {
            rendering._octreeManager.removeMesh(mesh);
            mesh.metadata[addedToSceneFlag] = false;
        });
    }


    /**
     * Remove a mesh from noa's scene management without disposing it.
     * Use this to temporarily remove a mesh or transfer it to different management.
     * The mesh can be re-added later with addMeshToScene.
     *
     * Note: The onDisposeObservable handler added by addMeshToScene will remain,
     * but it's safe - removeMesh is idempotent and the flag prevents double-processing.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     */
    removeMeshFromScene(mesh) {
        if (!mesh.metadata) return
        if (!mesh.metadata[addedToSceneFlag]) return
        this.rendering._octreeManager.removeMesh(mesh);
        mesh.metadata[addedToSceneFlag] = false;
    }


    /**
     * Toggle mesh visibility while keeping its registration intact.
     * If the mesh was never registered, optionally add it when making visible.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [visible]
     */
    setMeshVisibility(mesh, visible = false) {
        if (!mesh.metadata) mesh.metadata = {};
        if (mesh.metadata[addedToSceneFlag]) {
            this.rendering._octreeManager.setMeshVisibility(mesh, visible);
        } else {
            if (visible) this.addMeshToScene(mesh);
        }
    }
}

/** Metadata flag used to mark meshes added to noa's managed scene */
var addedToSceneFlag = 'noa_added_to_scene';

/**
 * @typedef {object} StandardMaterialOptions
 * @property {number[] | import('@babylonjs/core').Color3} [diffuseColor]
 * @property {number[] | import('@babylonjs/core').Color3} [emissiveColor]
 * @property {number[] | import('@babylonjs/core').Color3} [specularColor]
 * @property {number} [specularPower]
 * @property {number} [alpha]
 * @property {boolean} [wireframe]
 * @property {boolean} [backFaceCulling]
 * @property {number} [maxSimultaneousLights]
 */

/**
 * @typedef {object} ShaderMaterialOptions
 * @property {string[]} [attributes]
 * @property {string[]} [uniforms]
 * @property {string[]} [samplers]
 * @property {string[]} [defines]
 * @property {string[]} [uniformBuffers]
 * @property {boolean} [needInstancing]
 * @property {boolean} [needAlphaBlending]
 * @property {boolean} [backFaceCulling]
 * @property {number} [alphaMode]
 */

/**
 * Material factory helpers.
 * Keeps Babylon material creation details isolated from the main renderer.
 */
class RenderingMaterials {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering;
    }

    /**
     * Access to Babylon.js MeshBuilder for creating primitives.
     * All methods require the scene as the last argument.
     *
     * @example
     * const scene = noa.rendering.getScene()
     * const box = noa.rendering.meshBuilder.CreateBox('myBox', { size: 1 }, scene)
     */
    get meshBuilder() {
        return meshBuilder.MeshBuilder
    }

    /**
     * Create a default StandardMaterial:
     * flat, nonspecular, fully reflects diffuse and ambient light
     */
    makeStandardMaterial(name) {
        var mat = new standardMaterial.StandardMaterial(name, this.rendering.scene);
        mat.specularColor.copyFromFloats(0, 0, 0);
        mat.ambientColor.copyFromFloats(1, 1, 1);
        mat.diffuseColor.copyFromFloats(1, 1, 1);
        return mat
    }

    /**
     * Create a StandardMaterial with common options.
     * This is a convenience factory - the returned material is NOT tracked internally.
     * Caller is responsible for disposal.
     * @param {string} name
     * @param {StandardMaterialOptions} [options]
     * @returns {import('@babylonjs/core').StandardMaterial}
     */
    createStandardMaterial(name, options) {
        options = options || {};
        var mat = new standardMaterial.StandardMaterial(name, this.rendering.scene);

        // Helper to convert [r,g,b] array to Color3 or pass through existing Color3
        function toColor3(val, fallback) {
            if (!val) return fallback
            if (val.r !== undefined) return val
            return new math_color.Color3(val[0], val[1], val[2])
        }

        mat.diffuseColor = toColor3(options.diffuseColor, new math_color.Color3(1, 1, 1));
        mat.emissiveColor = toColor3(options.emissiveColor, new math_color.Color3(0, 0, 0));
        mat.specularColor = toColor3(options.specularColor, new math_color.Color3(0, 0, 0));
        mat.ambientColor = new math_color.Color3(1, 1, 1);

        if (options.specularPower !== undefined) mat.specularPower = options.specularPower;
        if (options.alpha !== undefined) mat.alpha = options.alpha;
        if (options.wireframe !== undefined) mat.wireframe = options.wireframe;
        if (options.backFaceCulling !== undefined) mat.backFaceCulling = options.backFaceCulling;
        if (options.maxSimultaneousLights !== undefined) mat.maxSimultaneousLights = options.maxSimultaneousLights;

        return mat
    }

    /**
     * Create a ShaderMaterial from inline GLSL source code.
     * This is a convenience factory - the returned material is NOT tracked internally.
     * Caller is responsible for disposal.
     * @param {string} name
     * @param {string} vertexSource
     * @param {string} fragmentSource
     * @param {ShaderMaterialOptions} [options]
     * @returns {import('@babylonjs/core').ShaderMaterial}
     */
    createShaderMaterial(name, vertexSource, fragmentSource, options) {
        options = options || {};
        var attributes = options.attributes ? options.attributes.slice() : ['position', 'normal'];
        var uniforms = options.uniforms ? options.uniforms.slice() : ['world', 'viewProjection'];

        // Add instancing attributes if requested
        if (options.needInstancing) {
            if (attributes.indexOf('world0') === -1) attributes.push('world0');
            if (attributes.indexOf('world1') === -1) attributes.push('world1');
            if (attributes.indexOf('world2') === -1) attributes.push('world2');
            if (attributes.indexOf('world3') === -1) attributes.push('world3');
        }

        var shaderOptions = {
            attributes: attributes,
            uniforms: uniforms,
            samplers: options.samplers || [],
            defines: options.defines || [],
        };
        if (options.uniformBuffers) {
            shaderOptions.uniformBuffers = options.uniformBuffers;
        }

        var mat = new shaderMaterial.ShaderMaterial(name, this.rendering.scene, {
            vertexElement: undefined,
            fragmentElement: undefined,
            vertexSource: vertexSource,
            fragmentSource: fragmentSource,
        }, shaderOptions);

        // Apply common options
        if (options.backFaceCulling !== undefined) {
            mat.backFaceCulling = options.backFaceCulling;
        } else {
            mat.backFaceCulling = true;
        }

        if (options.alphaMode !== undefined) {
            mat.alphaMode = options.alphaMode;
        }

        if (options.needAlphaBlending) {
            mat.needAlphaBlending = function () { return true };
        }

        return mat
    }
}

/**
 * @typedef {object} LoadModelOptions
 * @property {number | [number, number, number]} [scale]
 * @property {boolean} [convertToStandard]
 * @property {(material: import('@babylonjs/core').Material, mesh: import('@babylonjs/core').AbstractMesh) => import('@babylonjs/core').Material} [onMaterialLoaded]
 * @property {boolean} [registerMeshes]
 */

/**
 * @typedef {object} LoadedModel
 * @property {import('@babylonjs/core').AbstractMesh} rootMesh
 * @property {import('@babylonjs/core').AbstractMesh[]} meshes
 * @property {import('@babylonjs/core').Skeleton[]} skeletons
 * @property {import('@babylonjs/core').AnimationGroup[]} animationGroups
 * @property {() => void} cleanup
 */

// Model loading and material conversion helpers
class RenderingModels {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering;
    }

    /**
     * Load a GLB/glTF model and register its meshes with noa.
     *
     * MEMORY: The returned cleanup function MUST be called when the model is no longer
     * needed. This function holds no internal references to loaded models.
     *
     * @param {string} url
     * @param {LoadModelOptions} [options]
     * @returns {Promise<LoadedModel>}
     */
    async loadModel(url, options) {
        options = options || {};
        var rendering = this.rendering;
        var scene = rendering.scene;
        var registerMeshes = options.registerMeshes !== false;
        /** @type {import('@babylonjs/core').AbstractMesh[]} */
        var meshes = [];
        /** @type {import('@babylonjs/core').Skeleton[]} */
        var skeletons = [];
        /** @type {import('@babylonjs/core').AnimationGroup[]} */
        var animationGroups = [];
        /** @type {import('@babylonjs/core').AbstractMesh | null} */
        var rootMesh = null;
        /** @type {(() => void) | null} */
        var cleanupFn = null;
        /** @type {import('@babylonjs/core').Material[] | null} */
        var oldMaterials = [];

        function disposeOldMaterials() {
            if (!oldMaterials) return
            for (var i = 0; i < oldMaterials.length; i++) {
                try { oldMaterials[i].dispose(); } catch (e) { }
            }
            oldMaterials = null;
        }

        // Dispose Babylon resources allocated during load
        function disposeLoadedResources() {
            for (var i = 0; i < animationGroups.length; i++) {
                var ag = animationGroups[i];
                if (ag) {
                    try { ag.dispose(); } catch (e) { }
                }
            }
            for (var j = 0; j < skeletons.length; j++) {
                var sk = skeletons[j];
                if (sk) {
                    try { sk.dispose(); } catch (e) { }
                }
            }
            for (var k = 0; k < meshes.length; k++) {
                var mesh = meshes[k];
                if (mesh && !mesh.isDisposed()) {
                    try { mesh.dispose(); } catch (e) { }
                }
            }
        }

        try {
            // Load the model; Babylon returns a bundle of meshes/skeletons/animation groups
            var result = await sceneLoader.SceneLoader.ImportMeshAsync('', '', url, scene);

            meshes = result.meshes || [];
            skeletons = result.skeletons || [];
            animationGroups = result.animationGroups || [];

            if (meshes.length === 0) {
                throw new Error('No meshes found in model: ' + url)
            }

            rootMesh = meshes[0];

            if (options.scale !== undefined) {
                var s = options.scale;
                if (typeof s === 'number') {
                    rootMesh.scaling.setAll(s);
                } else {
                    rootMesh.scaling.set(s[0], s[1], s[2]);
                }
            }

            // Material conversion pipeline:
            //  - caller-provided callback wins
            //  - otherwise optional PBR -> StandardMaterial conversion for noa defaults
            if (options.onMaterialLoaded) {
                meshes.forEach(function (mesh) {
                    if (mesh.material && mesh.name !== '__root__') {
                        var oldMat = mesh.material;
                        var newMat = options.onMaterialLoaded(oldMat, mesh);
                        if (newMat && newMat !== oldMat) {
                            mesh.material = newMat;
                            oldMaterials.push(oldMat);
                        }
                    }
                });
            } else if (options.convertToStandard) {
                meshes.forEach(function (mesh) {
                    if (mesh.material && mesh.name !== '__root__') {
                        var oldMat = mesh.material;
                        var newMat = new standardMaterial.StandardMaterial(oldMat.name + '_std', scene);

                        var baseColor = extractPBRColor(oldMat);
                        if (baseColor) {
                            newMat.diffuseColor = new math_color.Color3(baseColor.r, baseColor.g, baseColor.b);
                        } else {
                            newMat.diffuseColor = new math_color.Color3(0.6, 0.6, 0.6);
                        }

                        newMat.specularColor = new math_color.Color3(0.1, 0.1, 0.1);
                        newMat.ambientColor = new math_color.Color3(1, 1, 1);

                        mesh.material = newMat;
                        oldMaterials.push(oldMat);
                    }
                });
            }

            // Dispose old materials after conversion (don't hold references)
            disposeOldMaterials();

            // Register meshes with noa if requested
            if (registerMeshes) {
                meshes.forEach(function (mesh) {
                    // Only register meshes with valid boundingInfo
                    var bi = mesh.getBoundingInfo && mesh.getBoundingInfo();
                    if (bi && bi.boundingSphere) {
                        rendering.addMeshToScene(mesh);
                    } else {
                        // Hide meshes without boundingInfo to prevent render errors
                        mesh.isVisible = false;
                    }
                });
            }

            // Create cleanup function that releases ALL references
            cleanupFn = function () {
                disposeLoadedResources();
            };

            return {
                rootMesh: rootMesh,
                meshes: meshes,
                skeletons: skeletons,
                animationGroups: animationGroups,
                cleanup: cleanupFn,
            }
        } catch (err) {
            disposeOldMaterials();
            if (cleanupFn) {
                try { cleanupFn(); } catch (cleanupErr) { }
            } else {
                disposeLoadedResources();
            }
            console.error('[noa] Failed to load model:', url, err);
            throw err
        }
    }
}


/**
 * Extract base color from a PBR material using runtime property detection.
 * Works with PBRMaterial and PBRMetallicRoughnessMaterial.
 * @param {import('@babylonjs/core').Material} mat
 * @returns {{r: number, g: number, b: number} | null}
 */
function extractPBRColor(mat) {
    // Check for PBR material properties at runtime
    if ('_albedoColor' in mat && mat._albedoColor) {
        return /** @type {{r: number, g: number, b: number}} */ (mat._albedoColor)
    }
    if ('albedoColor' in mat && mat.albedoColor) {
        return /** @type {{r: number, g: number, b: number}} */ (mat.albedoColor)
    }
    if ('baseColor' in mat && mat.baseColor) {
        return /** @type {{r: number, g: number, b: number}} */ (mat.baseColor)
    }
    return null
}

/**
 * Coordinate conversion and origin rebasing helpers.
 *
 * noa uses a "rebasing" system to prevent floating-point precision issues.
 * When the player moves far from (0,0,0), noa shifts everything to keep
 * the player near the origin in "local" coordinates.
 *
 *   - WORLD coords: Absolute positions in the game world
 *   - LOCAL coords: Positions relative to the current origin offset (what Babylon renders)
 *
 *   Relationship: local = world - worldOriginOffset
 *                 world = local + worldOriginOffset
 */
class RenderingCoords {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering;
    }

    /**
     * Convert world coordinates to local (rendering) coordinates.
     * Use this when setting mesh.position for meshes registered with noa.
     */
    worldToLocal(x, y, z) {
        var off = this.rendering.noa.worldOriginOffset;
        return [x - off[0], y - off[1], z - off[2]]
    }

    /**
     * Cached world-to-local conversion for hot paths.
     * Use this in per-frame updates to avoid GC pressure.
     * WARNING: Returns shared internal array - do not store the result!
     * @param {number[]} [out] - Optional output array to use instead of cache
     */
    worldToLocalCached(x, y, z, out) {
        var off = this.rendering.noa.worldOriginOffset;
        out = out || _cachedLocalCoords;
        out[0] = x - off[0];
        out[1] = y - off[1];
        out[2] = z - off[2];
        return out
    }

    /**
     * Convert local (rendering) coordinates to world coordinates.
     * Use this when you need the "real" world position of a mesh.
     */
    localToWorld(x, y, z) {
        var off = this.rendering.noa.worldOriginOffset;
        return [x + off[0], y + off[1], z + off[2]]
    }

    /**
     * Cached local-to-world conversion for hot paths.
     * Use this in per-frame updates to avoid GC pressure.
     * WARNING: Returns shared internal array - do not store the result!
     * @param {number[]} [out] - Optional output array to use instead of cache
     */
    localToWorldCached(x, y, z, out) {
        var off = this.rendering.noa.worldOriginOffset;
        out = out || _cachedWorldCoords;
        out[0] = x + off[0];
        out[1] = y + off[1];
        out[2] = z + off[2];
        return out
    }

    /** Set a mesh position using world coordinates (converts internally). */
    setMeshWorldPosition(mesh, x, y, z) {
        var local = this.worldToLocalCached(x, y, z);
        mesh.position.set(local[0], local[1], local[2]);
    }

    /** Get a mesh's world position (converted from local coords). */
    getMeshWorldPosition(mesh) {
        var pos = mesh.position;
        return this.localToWorld(pos.x, pos.y, pos.z)
    }

    /**
     * Cached variant of getMeshWorldPosition for hot paths.
     * WARNING: Returns shared internal array - do not store the result!
     */
    getMeshWorldPositionCached(mesh, out) {
        var pos = mesh.position;
        return this.localToWorldCached(pos.x, pos.y, pos.z, out || _cachedMeshWorldPos)
    }

    /** Copy of the current world origin offset. */
    getWorldOriginOffset() {
        var off = this.rendering.noa.worldOriginOffset;
        return [off[0], off[1], off[2]]
    }

    /**
     * Cached world origin offset for hot paths.
     * WARNING: Returns shared internal array - do not store the result!
     */
    getWorldOriginOffsetCached(out) {
        var off = this.rendering.noa.worldOriginOffset;
        out = out || _cachedOriginOffset;
        out[0] = off[0];
        out[1] = off[1];
        out[2] = off[2];
        return out
    }

    /**
     * Update a shader material's world origin offset uniform.
     * Call this each frame for shaders that need world coordinates.
     *
     * In your shader, recover world coords like:
     *   float worldX = localPos.x + worldOriginOffset.x;
     */
    updateShaderWorldOrigin(material, uniformName) {
        var off = this.rendering.noa.worldOriginOffset;
        _shaderOffsetVec.set(off[0], off[1], off[2]);
        material.setVector3(uniformName || 'worldOriginOffset', _shaderOffsetVec);
    }

    /**
     * Change world origin offset, and rebase everything with a position.
     * Shifts all unparented meshes and updates octree blocks.
     * @param {number[]} delta
     * @internal
     */
    _rebaseOrigin(delta) {
        var rendering = this.rendering;
        _rebaseVec.set(delta[0], delta[1], delta[2]);
        var dvec = _rebaseVec;

        rendering.scene.meshes.forEach(mesh => {
            // parented meshes don't live in the world coord system
            if (mesh.parent) return

            // move each mesh by delta (even though most are managed by components)
            mesh.position.subtractInPlace(dvec);

            if (mesh.isWorldMatrixFrozen) {
                // paradoxically this unfreezes, then re-freezes the matrix
                mesh.freezeWorldMatrix();
            }
        });

        // updates position of all octree blocks
        rendering._octreeManager.rebase(dvec);
    }
}

// Cached arrays for coordinate conversion hot paths
var _cachedLocalCoords = [0, 0, 0];
var _cachedWorldCoords = [0, 0, 0];
var _cachedMeshWorldPos = [0, 0, 0];
var _cachedOriginOffset = [0, 0, 0];
var _shaderOffsetVec = new math_vector.Vector3(0, 0, 0);
// Cached Vector3 for origin rebasing to avoid per-rebase allocation
var _rebaseVec = new math_vector.Vector3(0, 0, 0);

/**
 * Camera update and view overlay helpers.
 * Manages camera holder (a node that accumulates rotations) and
 * the fullscreen plane for overlaying effects (e.g. underwater tint).
 */
class RenderingCamera {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering, opts) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering;
        /** block id at current camera location used to toggle overlay */
        this._camLocBlock = 0;
        this._initCameraOverlay(opts);
    }

    /**
     * Create the fullscreen plane used for underwater/overlay effects.
     * This plane obscures the camera - for overlaying an effect on the whole view.
     */
    _initCameraOverlay(_opts) {
        var rendering = this.rendering;
        var scene = rendering.scene;
        // plane obscuring the camera - for overlaying an effect on the whole view
        rendering._camScreen = planeBuilder.CreatePlane('camScreen', { size: 10 }, scene);
        rendering.addMeshToScene(rendering._camScreen);
        rendering._camScreen.position.z = .1;
        rendering._camScreen.parent = rendering.camera;
        rendering._camScreenMat = rendering.makeStandardMaterial('camera_screen_mat');
        rendering._camScreen.material = rendering._camScreenMat;
        rendering._camScreen.setEnabled(false);
        rendering._camScreenMat.freeze();
    }

    /**
     * Updates camera position/rotation to match settings from noa.camera.
     * Also applies screen effect when camera is inside a transparent voxel.
     */
    updateCameraForRender() {
        var rendering = this.rendering;
        // camera holder accumulates rotations, camera offset handles zoom
        var cam = rendering.noa.camera;
        var tgtLoc = cam._localGetTargetPosition();
        rendering._cameraHolder.position.copyFromFloats(tgtLoc[0], tgtLoc[1], tgtLoc[2]);
        rendering._cameraHolder.rotation.x = cam.pitch;
        rendering._cameraHolder.rotation.y = cam.heading;
        rendering.camera.position.z = -cam.currentZoom;

        // applies screen effect when camera is inside a transparent voxel
        var cloc = cam._localGetPosition();
        var off = rendering.noa.worldOriginOffset;
        var cx = Math.floor(cloc[0] + off[0]);
        var cy = Math.floor(cloc[1] + off[1]);
        var cz = Math.floor(cloc[2] + off[2]);
        var id = rendering.noa.getBlock(cx, cy, cz);
        this._checkCameraEffect(id);
    }

    /**
     * If camera's current location block id has alpha color (e.g. water),
     * apply/remove an effect on the fullscreen overlay plane.
     */
    _checkCameraEffect(id) {
        var rendering = this.rendering;
        if (id === this._camLocBlock) return
        if (id === 0) {
            rendering._camScreen.setEnabled(false);
        } else {
            var mat = rendering._camScreenMat;
            if (!mat) return
            var matId = rendering.noa.registry.getBlockFaceMaterial(id, 0);
            if (matId) {
                var matData = rendering.noa.registry.getMaterialData(matId);
                var col = matData.color;
                var alpha = matData.alpha;
                if (col && alpha && alpha < 1) {
                    mat.diffuseColor.set(0, 0, 0);
                    mat.ambientColor.set(col[0], col[1], col[2]);
                    mat.alpha = alpha;
                    rendering._camScreen.setEnabled(true);
                }
            }
        }
        this._camLocBlock = id;
    }
}

// FPS overlay hook (populated by setUpFPS when enabled)
var fps_hook = function () { };

/** Create a small FPS overlay for quick perf inspection */
function setUpFPS() {
    var div = document.createElement('div');
    div.id = 'noa_fps';
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.right = '0';
    div.style.zIndex = '0';
    div.style.color = 'white';
    div.style.backgroundColor = 'rgba(0,0,0,0.5)';
    div.style.font = '14px monospace';
    div.style.textAlign = 'center';
    div.style.minWidth = '2em';
    div.style.margin = '4px';
    document.body.appendChild(div);
    var every = 1000;
    var ct = 0;
    var longest = 0;
    var start = performance.now();
    var last = start;
    fps_hook = function () {
        ct++;
        var nt = performance.now();
        if (nt - last > longest) longest = nt - last;
        last = nt;
        if (nt - start < every) return
        var fps = Math.round(ct / (nt - start) * 1000);
        var min = Math.round(1 / longest * 1000);
        div.innerHTML = fps + '<br>' + min;
        ct = 0;
        longest = 0;
        start = nt;
    };
}

/**
 * Misc helpers used by the renderer: picking, highlight geometry, debug checks.
 */
class RenderingUtils {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering) {
        this.rendering = rendering;
        /** @type {import('@babylonjs/core').Mesh | null} */ this._highlightMesh = null;
        this._pickOriginVec = new math_vector.Vector3(0, 0, 0);
        this._pickDirectionVec = new math_vector.Vector3(0, 0, 1);
        this._pickRay = new ray.Ray(this._pickOriginVec, this._pickDirectionVec, 1);
        /** @type {(mesh: import('@babylonjs/core').AbstractMesh) => boolean} */
        this._terrainPickPredicate = (mesh) => mesh.metadata && mesh.metadata.noa_chunk_terrain_mesh;
    }

    /**
     * Pick terrain from the camera position along the camera direction.
     * @param {number} [distance=-1]
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainFromCamera(distance = -1) {
        if (!this.rendering.scene || !this.rendering.noa || !this.rendering.noa.camera) return null
        var origin = this.rendering.noa.camera.getPosition();
        var dir = this.rendering.noa.camera.getDirection();
        return this.pickTerrainWithRay(origin, dir, distance, false)
    }

    /**
     * Cast a ray for terrain picking from an origin/direction.
     * @param {number[]} origin world or local coordinates
     * @param {number[]} direction direction vector
     * @param {number} [distance=-1]
     * @param {boolean} [originIsLocal=false]
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainWithRay(origin, direction, distance = -1, originIsLocal = false) {
        var rendering = this.rendering;
        if (!rendering.scene) return null
        var originVec = this._pickOriginVec;
        if (originIsLocal) {
            originVec.copyFromFloats(origin[0], origin[1], origin[2]);
        } else {
            var off = rendering.noa.worldOriginOffset;
            originVec.copyFromFloats(origin[0] - off[0], origin[1] - off[1], origin[2] - off[2]);
        }
        var dirVec = this._pickDirectionVec;
        dirVec.copyFromFloats(direction[0], direction[1], direction[2]);
        dirVec.normalize();
        var ray = this._pickRay;
        ray.origin.copyFrom(originVec);
        ray.direction.copyFrom(dirVec);
        ray.length = (distance > 0) ? distance : rendering.noa.blockTestDistance;
        return rendering.scene.pickWithRay(ray, this._terrainPickPredicate)
    }

    /**
     * Draw or hide the translucent block-face highlight used by the selector.
     * @param {boolean} show
     * @param {number[]} posArr world coords of the targeted block position
     * @param {number[]} normArr face normal (length 3) pointing outward
     */
    highlightBlockFace(show, posArr, normArr) {
        var m = this._getHighlightMesh();
        if (show) {
            // floored local coords for highlight mesh
            this.rendering.noa.globalToLocal(posArr, null, hlpos);
            // offset to avoid z-fighting, bigger when camera is far away
            var dist = glVec3.dist(this.rendering.noa.camera._localGetPosition(), hlpos);
            var slop = 0.001 + 0.001 * dist;
            for (var i = 0; i < 3; i++) {
                if (normArr[i] === 0) {
                    hlpos[i] += 0.5;
                } else {
                    hlpos[i] += (normArr[i] > 0) ? 1 + slop : -slop;
                }
            }
            m.position.copyFromFloats(hlpos[0], hlpos[1], hlpos[2]);
            m.rotation.x = (normArr[1]) ? Math.PI / 2 : 0;
            m.rotation.y = (normArr[0]) ? Math.PI / 2 : 0;
        }
        m.setEnabled(show);
    }

    /** Lazily create the highlight mesh+outline pair */
    _getHighlightMesh() {
        if (!this._highlightMesh) {
            var rendering = this.rendering;
            var mesh = planeBuilder.CreatePlane('highlight', { size: 1.0 }, rendering.scene);
            var hlm = rendering.makeStandardMaterial('block_highlight_mat');
            hlm.backFaceCulling = false;
            hlm.emissiveColor = new math_color.Color3(1, 1, 1);
            hlm.alpha = 0.2;
            hlm.freeze();
            mesh.material = hlm;

            // Outline for readability against bright scenes
            var s = 0.5;
            var lines = linesBuilder.CreateLines('hightlightLines', {
                points: [
                    new math_vector.Vector3(s, s, 0),
                    new math_vector.Vector3(s, -s, 0),
                    new math_vector.Vector3(-s, -s, 0),
                    new math_vector.Vector3(-s, s, 0),
                    new math_vector.Vector3(s, s, 0)
                ]
            }, rendering.scene);
            lines.color = new math_color.Color3(1, 1, 1);
            lines.parent = mesh;

            rendering.addMeshToScene(mesh);
            rendering.addMeshToScene(lines);
            this._highlightMesh = mesh;
        }
        return this._highlightMesh
    }

    /*
     *      Sanity checks:
     */

    /** Debug helper to sanity-check scene/octree/mesh/material state */
    debug_SceneCheck() {
        var meshes = this.rendering.scene.meshes;
        var octree = this.rendering.scene._selectionOctree;
        var dyns = octree.dynamicContent;
        var octs = [];
        var numOcts = 0;
        var numSubs = 0;
        var mats = this.rendering.scene.materials;
        var allmats = [];
        mats.forEach(mat => {
            // @ts-ignore
            if (mat.subMaterials) mat.subMaterials.forEach(mat => allmats.push(mat));
            else allmats.push(mat);
        });
        octree.blocks.forEach(function (block) {
            numOcts++;
            block.entries.forEach(m => octs.push(m));
        });
        meshes.forEach(function (m) {
            if (m.isDisposed()) warn(m, 'disposed mesh in scene');
            if (empty(m)) return
            if (missing(m, dyns, octs)) warn(m, 'non-empty mesh missing from octree');
            if (!m.material) { warn(m, 'non-empty scene mesh with no material'); return }
            numSubs += (m.subMeshes) ? m.subMeshes.length : 1;
            // @ts-ignore
            var mats = m.material.subMaterials || [m.material];
            mats.forEach(function (mat) {
                if (missing(mat, mats)) warn(mat, 'mesh material not in scene');
            });
        });
        var unusedMats = [];
        allmats.forEach(mat => {
            var used = false;
            meshes.forEach(mesh => {
                if (mesh.material === mat) used = true;
                if (!mesh.material) return
                // @ts-ignore
                var mats = mesh.material.subMaterials || [mesh.material];
                if (mats.includes(mat)) used = true;
            });
            if (!used) unusedMats.push(mat.name);
        });
        if (unusedMats.length) {
            console.warn('Materials unused by any mesh: ', unusedMats.join(', '));
        }
        dyns.forEach(function (m) {
            if (missing(m, meshes)) warn(m, 'octree/dynamic mesh not in scene');
        });
        octs.forEach(function (m) {
            if (missing(m, meshes)) warn(m, 'octree block mesh not in scene');
        });
        var avgPerOct = Math.round(10 * octs.length / numOcts) / 10;
        console.log('meshes - octree:', octs.length, '  dynamic:', dyns.length,
            '   subMeshes:', numSubs,
            '   avg meshes/octreeBlock:', avgPerOct);

        function warn(obj, msg) { console.warn(obj.name + ' --- ' + msg); }
        function empty(mesh) { return (mesh.getIndices().length === 0) }
        function missing(obj, list1, list2) {
            if (!obj) return false
            if (list1.includes(obj)) return false
            if (list2 && list2.includes(obj)) return false
            return true
        }
        return 'done.'
    }

    /** Debug helper to log mesh counts grouped by name prefixes */
    debug_MeshCount() {
        var ct = {};
        this.rendering.scene.meshes.forEach(m => {
            var n = m.name || '';
            n = n.replace(/-\d+.*/, '#');
            n = n.replace(/\d+.*/, '#');
            n = n.replace(/(rotHolder|camHolder|camScreen)/, 'rendering use');
            n = n.replace(/atlas sprite .*/, 'atlas sprites');
            ct[n] = ct[n] || 0;
            ct[n]++;
        });
        for (var s in ct) console.log('   ' + (ct[s] + '       ').substr(0, 7) + s);
    }

    dispose() {
        this._highlightMesh = null;
    }
}

/** @type {number[]} */ // Scratch vector used when positioning highlight mesh
var hlpos = [];

// Babylon 8 expects materials to expose needAlphaTestingForMesh; add a backward-compatible shim
if (typeof material.Material.prototype.needAlphaTestingForMesh !== 'function') {
    material.Material.prototype.needAlphaTestingForMesh = function (mesh) {
        // @ts-ignore older materials expose needAlphaTesting
        return (typeof this.needAlphaTesting === 'function') ? this.needAlphaTesting() : false
    };
}


var defaults = {
    showFPS: false,
    antiAlias: true,
    clearColor: [0.8, 0.9, 1],
    ambientColor: [0.5, 0.5, 0.5],
    lightDiffuse: [1, 1, 1],
    lightSpecular: [1, 1, 1],
    lightVector: [1, -1, 0.5],
    useAO: true,
    AOmultipliers: [0.93, 0.8, 0.5],
    reverseAOmultiplier: 1.0,
    preserveDrawingBuffer: true,
    octreeBlockSize: 2,
    renderOnResize: true,
};
var _cachedHighlightPos = [0, 0, 0];
var _cachedHighlightNorm = [0, 0, 0];

/**
 * Rendering configuration passed in via the Engine constructor.
 * Options here intentionally mirror the historical monolithic renderer defaults.
 * @typedef {object} RenderingOptions
 * @property {boolean} [showFPS]
 * @property {boolean} [antiAlias]
 * @property {[number, number, number]} [clearColor]
 * @property {[number, number, number]} [ambientColor]
 * @property {[number, number, number]} [lightDiffuse]
 * @property {[number, number, number]} [lightSpecular]
 * @property {[number, number, number]} [lightVector]
 * @property {boolean} [useAO]
 * @property {[number, number, number]} [AOmultipliers]
 * @property {number} [reverseAOmultiplier]
 * @property {boolean} [preserveDrawingBuffer]
 * @property {number} [octreeBlockSize]
 * @property {boolean} [renderOnResize]
 */


/**
 * `noa.rendering` - Manages all rendering and Babylon scene objects.
 *
 * The following options may be provided via the main Engine constructor:
 * ```js
 * {
 *     showFPS: false,
 *     antiAlias: true,
 *     clearColor: [0.8, 0.9, 1],
 *     ambientColor: [0.5, 0.5, 0.5],
 *     lightDiffuse: [1, 1, 1],
 *     lightSpecular: [1, 1, 1],
 *     lightVector: [1, -1, 0.5],
 *     useAO: true,
 *     AOmultipliers: [0.93, 0.8, 0.5],
 *     reverseAOmultiplier: 1.0,
 *     preserveDrawingBuffer: true,
 *     octreeBlockSize: 2,
 *     renderOnResize: true,
 * }
 * ```
 */
class Rendering {

    /**
     * @internal
     * @param {import('../../index.js').Engine} noa
     * @param {RenderingOptions} opts
     * @param {HTMLCanvasElement} canvas
    */
    constructor(noa, opts, canvas) {
        opts = Object.assign({}, defaults, opts);
        /** Primary noa engine handle */
        /** @internal */ this.noa = noa;

        // settings and basic config used throughout rendering helpers
        /** Whether to redraw the screen when the game is resized while paused */
        this.renderOnResize = !!opts.renderOnResize;
        /** @internal */ this.useAO = !!opts.useAO;
        /** @internal */ this.aoVals = opts.AOmultipliers;
        /** @internal */ this.revAoVal = opts.reverseAOmultiplier;
        /** @internal */ this.meshingCutoffTime = 6; // ms budget for meshing batches
        /** @internal */ this._disposed = false;

        // Babylon handles initialized by RenderingCore
        /** @type {import('@babylonjs/core').Engine | null} */ this.engine = null;
        /** @type {import('@babylonjs/core').Scene | null} */ this.scene = null;
        /** @type {import('@babylonjs/core').DirectionalLight | null} */ this.light = null;
        /** @type {import('@babylonjs/core').FreeCamera | null} */ this.camera = null;
        /** @internal legacy hook for highlight mesh (managed by RenderingUtils) */ this._highlightMesh = null;
        /** @type {import('../sceneOctreeManager.js').SceneOctreeManager | null} */ this._octreeManager = null;
        /** @type {import('@babylonjs/core').TransformNode | null} */ this._cameraHolder = null;
        /** @type {import('@babylonjs/core').Mesh | null} */ this._camScreen = null;
        /** @type {import('@babylonjs/core').StandardMaterial | null} */ this._camScreenMat = null;
        /** @internal */ this._errorLogged = false;

        // scene readiness tracking
        /** @internal */ this._sceneIsReady = false;
        /** @internal */ this._sceneReadyCallbacks = /** @type {(() => void)[]} */([]);
        /** Promise that resolves when the Babylon scene reports ready */
        /** @type {Promise<void> | null} */ this.sceneReady = null; // set by core

        // core scene setup
        this._core = new RenderingCore(this, opts, canvas);

        // feature modules (each encapsulates a concern formerly bundled in rendering.js)
        /** @internal */ this._lighting = new RenderingLighting(this, opts);
        /** @internal */ this._meshes = new RenderingMeshes(this);
        /** @internal */ this._materials = new RenderingMaterials(this);
        /** @internal */ this._models = new RenderingModels(this);
        /** @internal */ this._coords = new RenderingCoords(this);
        /** @internal */ this._utils = new RenderingUtils(this);
        /** @internal */ this._camera = new RenderingCamera(this, opts);

        // for debugging
        if (opts.showFPS) setUpFPS();
    }


    /*
     *   PUBLIC API
     */

    /** The Babylon `scene` object representing the game world. */
    getScene() { return this.scene }

    /**
     * Whether the Babylon scene has finished initializing (including shader compilation).
     * Check this when you need synchronous access to Babylon objects.
     */
    isSceneReady() { return this._sceneIsReady }

    onSceneReady(callback) {
        if (typeof callback !== 'function') return
        if (this._sceneIsReady) {
            try { callback(); } catch (e) { console.error('[noa] onSceneReady callback error:', e); }
        } else {
            this._sceneReadyCallbacks.push(callback);
        }
    }

    /**
     * Allow callers to tweak or disable the built-in directional light.
     * @param {object} opts
     * @param {import('@babylonjs/core').Vector3} [opts.direction]
     * @param {number} [opts.intensity]
     * @param {import('@babylonjs/core').Color3} [opts.diffuse]
     * @param {import('@babylonjs/core').Color3} [opts.specular]
     */
    setMainLightOptions(opts) { this._lighting.setMainLightOptions(opts); }

    /** Exclude a mesh (and optionally its descendants) from the main directional light */
    excludeMeshFromMainLight(mesh, includeDescendants = true) {
        this._lighting.excludeMesh(mesh, includeDescendants);
    }

    /** Re-include a mesh (and optionally its descendants) in the main directional light */
    includeMeshInMainLight(mesh, includeDescendants = true) {
        this._lighting.includeMesh(mesh, includeDescendants);
    }

    /** Create an ad-hoc directional or hemispheric light in the scene */
    createLight(type, name) { return this._lighting.createLight(type, name) }

    /** @internal */
    tick(dt) { this._lighting.tick(dt); }


    /**
     * @internal
     * Per-frame render loop: updates camera, validates mesh bounds to avoid Babylon crashes,
     * executes Babylon render, and records simple profiling hooks.
     */
    render() {
        this._camera.updateCameraForRender();
        this.engine.beginFrame();

        // Validate bounding info before render to avoid Babylon errors
        this.scene.meshes.forEach(mesh => {
            if (!mesh.metadata) mesh.metadata = {};
            if (mesh.metadata._noaBoundingChecked) return
            var bi = null;
            try { bi = mesh.getBoundingInfo && mesh.getBoundingInfo(); } catch (e) { }
            if (!bi || !bi.boundingSphere) {
                mesh.isVisible = false;
                console.log('[noa] Hidden mesh without boundingInfo:', mesh.name);
            }
            mesh.metadata._noaBoundingChecked = true;
        });

        try {
            this.scene.render();
        } catch (e) {
            if (e.message && e.message.includes('boundingSphere') && !this._errorLogged) {
                this._errorLogged = true;
                console.error('[noa] boundingSphere error! Checking all meshes and submeshes...');
                this.scene.meshes.forEach((mesh, i) => {
                    var bi = null;
                    try { bi = mesh.getBoundingInfo && mesh.getBoundingInfo(); } catch (e2) { }
                    if (!bi || !bi.boundingSphere) {
                        console.error('[noa] BAD MESH:', i, mesh.name, 'bi:', bi);
                    }
                    if (mesh.subMeshes) {
                        mesh.subMeshes.forEach((sm, j) => {
                            var smBi = null;
                            try { smBi = sm.getBoundingInfo && sm.getBoundingInfo(); } catch (e2) { }
                            if (!smBi || !smBi.boundingSphere) {
                                console.error('[noa] BAD SUBMESH:', mesh.name, 'submesh', j, 'bi:', smBi);
                            }
                        });
                    }
                });
            }
            throw e
        }
        fps_hook();
        this.engine.endFrame();
    }


    /** @internal */
    postRender() { /* hook for post-render effects if needed */ }


    /**
     * Dispose Babylon resources and clear internal references.
     * Safe to call multiple times.
     */
    dispose() {
        if (this._disposed) return
        this._disposed = true;
        this._utils.dispose();
        this._core.dispose();
        this.light = null;
        this.camera = null;
        this._highlightMesh = null;
    }


    /**
     * Resize the Babylon engine/scene. When paused and renderOnResize is true,
     * force a single render to keep the paused frame up to date.
     * @internal
     */
    resize() {
        this.engine.resize();
        if (this.noa._paused && this.renderOnResize) {
            this.scene.render();
        }
    }


    /**
     * Pick terrain from the camera position along the camera direction.
     * @param {number} [distance=-1] optional max distance; defaults to blockTestDistance
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainFromCamera(distance = -1) { return this._utils.pickTerrainFromCamera(distance) }

    /**
     * Cast a ray for terrain picking from an origin/direction.
     * @param {number[]} origin world or local coords
     * @param {number[]} direction unit-ish direction vector
     * @param {number} [distance=-1] optional max distance
     * @param {boolean} [originIsLocal=false] whether origin is already local coords
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainWithRay(origin, direction, distance = -1, originIsLocal = false) {
        return this._utils.pickTerrainWithRay(origin, direction, distance, originIsLocal)
    }

    /**
     * Draw or hide the translucent block-face highlight used by the selector.
     * @param {boolean} show
     * @param {number[]} [posArr] world coords of the targeted block position
     * @param {number[]} [normArr] face normal (length 3) pointing outward
     */
    highlightBlockFace(show, posArr = _cachedHighlightPos, normArr = _cachedHighlightNorm) {
        return this._utils.highlightBlockFace(show, posArr, normArr)
    }


    /**
     * Adds a mesh to the engine's selection/octree logic so that it renders.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [isStatic]
     * @param {number[] | null} [pos]
     * @param {import('../chunk').Chunk | null} [containingChunk]
     */
    addMeshToScene(mesh, isStatic = false, pos = null, containingChunk = null) {
        return this._meshes.addMeshToScene(mesh, isStatic, pos, containingChunk)
    }

    /**
     * Remove a mesh from noa's scene management without disposing it.
     * Mesh can be re-added later with addMeshToScene.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     */
    removeMeshFromScene(mesh) { return this._meshes.removeMeshFromScene(mesh) }

    /**
     * Toggle visibility of a mesh without disposing/removing it.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [visible]
     */
    setMeshVisibility(mesh, visible = false) { return this._meshes.setMeshVisibility(mesh, visible) }


    /** Create a default flat non-specular material */
    makeStandardMaterial(name) { return this._materials.makeStandardMaterial(name) }

    /** Access to Babylon MeshBuilder */
    get meshBuilder() { return this._materials.meshBuilder }

    /** Convenience factory for StandardMaterial with common options */
    createStandardMaterial(name, options) { return this._materials.createStandardMaterial(name, options) }

    /** Convenience factory for ShaderMaterial from inline GLSL */
    createShaderMaterial(name, vertexSource, fragmentSource, options) {
        return this._materials.createShaderMaterial(name, vertexSource, fragmentSource, options)
    }


    /**
     * Load a GLB/glTF model and register its meshes with noa.
     * @param {string} url
     * @param {import('./renderingModels.js').LoadModelOptions} [options]
     */
    async loadModel(url, options) { return this._models.loadModel(url, options) }


    /** Convert world coordinates to local (rendering) coordinates */
    worldToLocal(x, y, z) { return this._coords.worldToLocal(x, y, z) }
    /** Cached world-to-local conversion for hot paths */
    worldToLocalCached(x, y, z, out) { return this._coords.worldToLocalCached(x, y, z, out) }
    /** Convert local (rendering) coordinates to world coordinates */
    localToWorld(x, y, z) { return this._coords.localToWorld(x, y, z) }
    /** Cached local-to-world conversion for hot paths */
    localToWorldCached(x, y, z, out) { return this._coords.localToWorldCached(x, y, z, out) }
    /** Set a mesh position using world coordinates */
    setMeshWorldPosition(mesh, x, y, z) { return this._coords.setMeshWorldPosition(mesh, x, y, z) }
    /** Get a mesh's world position */
    getMeshWorldPosition(mesh) { return this._coords.getMeshWorldPosition(mesh) }
    /** Cached variant of getMeshWorldPosition */
    getMeshWorldPositionCached(mesh, out) { return this._coords.getMeshWorldPositionCached(mesh, out) }
    /** Copy of current world origin offset */
    getWorldOriginOffset() { return this._coords.getWorldOriginOffset() }
    /** Cached world origin offset */
    getWorldOriginOffsetCached(out) { return this._coords.getWorldOriginOffsetCached(out) }
    /** Push world origin offset into a shader uniform */
    updateShaderWorldOrigin(material, uniformName) { return this._coords.updateShaderWorldOrigin(material, uniformName) }


    /** @internal */
    _rebaseOrigin(delta) { return this._coords._rebaseOrigin(delta) }

    /** @internal */
    prepareChunkForRendering(chunk) { /* currently unused */ }

    /** @internal */
    disposeChunkForRendering(chunk) { /* currently unused */ }

    /** @internal */
    debug_SceneCheck() { return this._utils.debug_SceneCheck() }

    /** @internal */
    debug_MeshCount() { return this._utils.debug_MeshCount() }
}

/*
 *    RIGID BODY - internal data structure
 *  Only AABB bodies right now. Someday will likely need spheres?
*/

class RigidBody {
    constructor(_aabb, mass, friction, restitution, gravMult, onCollide, autoStep) {
        this.aabb = new AABB(_aabb.base, _aabb.vec); // clone
        this.mass = mass;
        this.friction = friction;
        this.restitution = restitution;
        this.gravityMultiplier = gravMult;
        this.onCollide = onCollide;
        this.autoStep = !!autoStep;
        this.airDrag = -1;   // overrides global airDrag when >= 0
        this.fluidDrag = -1; // overrides global fluidDrag when >= 0
        this.onStep = null;

        // internal state
        this.velocity = vec3.create();
        this.resting = [0, 0, 0];
        this.inFluid = false;

        // internals
        /** @internal */
        this._ratioInFluid = 0;
        /** @internal */
        this._forces = vec3.create();
        /** @internal */
        this._impulses = vec3.create();
        /** @internal */
        this._sleepFrameCount = 10 | 0;
    }

    setPosition(p) {
        vec3.subtract(p, p, this.aabb.base);
        this.aabb.translate(p);
        this._markActive();
    }
    getPosition() {
        return vec3.clone(this.aabb.base)
    }
    applyForce(f) {
        vec3.add(this._forces, this._forces, f);
        this._markActive();
    }
    applyImpulse(i) {
        vec3.add(this._impulses, this._impulses, i);
        this._markActive();
    }

    /** @internal */
    _markActive() {
        this._sleepFrameCount = 10 | 0;
    }



    // temp
    atRestX() { return this.resting[0] }
    atRestY() { return this.resting[1] }
    atRestZ() { return this.resting[2] }
}

function DefaultOptions() {
    this.airDrag = 0.1;
    this.fluidDrag = 0.4;
    this.fluidDensity = 2.0;
    this.gravity = [0, -10, 0];
    this.minBounceImpulse = .5; // lowest collision impulse that bounces
}




/**
 *          Voxel Physics Engine
 * 
 * Models a world of rigid bodies, to be integrated against
 * solid or liquid voxel terrain.
 * 
 * Takes `testSolid(x,y,z)` function to query block solidity
 * Takes `testFluid(x,y,z)` function to query if a block is a fluid
 *  
 * The `options` argument can take the following params:
 * 
 * ```js
 * {
 *     airDrag: 0.1,
 *     fluidDrag: 0.4,
 *     fluidDensity: 2.0,
 *     gravity: [0, -10, 0],
 *     minBounceImpulse: .5, // lowest collision impulse that bounces
 * }
 * ```
 * 
 * @param {(x:number, y:number, z:number) => boolean} testSolid
 * @param {(x:number, y:number, z:number) => boolean} testFluid
 * 
*/
function Physics$1(opts, testSolid, testFluid) {
    opts = Object.assign(new DefaultOptions(), opts);

    this.gravity = opts.gravity || [0, -10, 0];
    this.airDrag = opts.airDrag || 0.1;
    this.fluidDensity = opts.fluidDensity || 2.0;
    this.fluidDrag = opts.fluidDrag || 0.4;
    this.minBounceImpulse = opts.minBounceImpulse;
    this.bodies = [];

    // collision function - TODO: abstract this into a setter?
    this.testSolid = testSolid;
    this.testFluid = testFluid;
}


/** 
 * Adds a physics body to the simulation
 * @returns {RigidBody}
*/
Physics$1.prototype.addBody = function (_aabb, mass, friction,
    restitution, gravMult, onCollide) {
    _aabb = _aabb || new AABB([0, 0, 0], [1, 1, 1]);
    if (typeof mass == 'undefined') mass = 1;
    if (typeof friction == 'undefined') friction = 1;
    if (typeof restitution == 'undefined') restitution = 0;
    if (typeof gravMult == 'undefined') gravMult = 1;
    var b = new RigidBody(_aabb, mass, friction, restitution, gravMult, onCollide);
    this.bodies.push(b);
    return b
};

/** Removes a body, by direct reference */
Physics$1.prototype.removeBody = function (b) {
    var i = this.bodies.indexOf(b);
    if (i < 0) return undefined
    this.bodies.splice(i, 1);
    b.aabb = b.onCollide = null;
};




/*
 *    PHYSICS AND COLLISIONS
*/

var a = vec3.create();
var dv = vec3.create();
var dx = vec3.create();
var impacts = vec3.create();
var oldResting = vec3.create();


/* Ticks the simulation forwards in time. */
Physics$1.prototype.tick = function (dt) {
    // convert dt to seconds
    dt = dt / 1000;
    var noGravity = equals(0, vec3.squaredLength(this.gravity));
    this.bodies.forEach(b => iterateBody(this, b, dt, noGravity));
};



/*
 *    PER-BODY MAIN PHYSICS ROUTINE
*/

function iterateBody(self, b, dt, noGravity) {
    vec3.copy(oldResting, b.resting);

    // treat bodies with <= mass as static
    if (b.mass <= 0) {
        vec3.set(b.velocity, 0, 0, 0);
        vec3.set(b._forces, 0, 0, 0);
        vec3.set(b._impulses, 0, 0, 0);
        return
    }

    // skip bodies if static or no velocity/forces/impulses
    var localNoGrav = noGravity || (b.gravityMultiplier === 0);
    if (bodyAsleep(self, b, dt, localNoGrav)) return
    b._sleepFrameCount--;

    // check if under water, if so apply buoyancy and drag forces
    applyFluidForces(self, b);

    // debug hooks
    sanityCheck(b._forces);
    sanityCheck(b._impulses);
    sanityCheck(b.velocity);
    sanityCheck(b.resting);

    // semi-implicit Euler integration

    // a = f/m + gravity*gravityMultiplier
    vec3.scale(a, b._forces, 1 / b.mass);
    vec3.scaleAndAdd(a, a, self.gravity, b.gravityMultiplier);

    // dv = i/m + a*dt
    // v1 = v0 + dv
    vec3.scale(dv, b._impulses, 1 / b.mass);
    vec3.scaleAndAdd(dv, dv, a, dt);
    vec3.add(b.velocity, b.velocity, dv);

    // apply friction based on change in velocity this frame
    if (b.friction) {
        applyFrictionByAxis(0, b, dv);
        applyFrictionByAxis(1, b, dv);
        applyFrictionByAxis(2, b, dv);
    }

    // linear air or fluid friction - effectively v *= drag
    // body settings override global settings
    var drag = (b.airDrag >= 0) ? b.airDrag : self.airDrag;
    if (b.inFluid) {
        drag = (b.fluidDrag >= 0) ? b.fluidDrag : self.fluidDrag;
        drag *= 1 - (1 - b.ratioInFluid) ** 2;
    }
    var mult = Math.max(1 - drag * dt / b.mass, 0);
    vec3.scale(b.velocity, b.velocity, mult);

    // x1-x0 = v1*dt
    vec3.scale(dx, b.velocity, dt);

    // clear forces and impulses for next timestep
    vec3.set(b._forces, 0, 0, 0);
    vec3.set(b._impulses, 0, 0, 0);

    // cache old position for use in autostepping
    if (b.autoStep) {
        cloneAABB(tmpBox, b.aabb);
    }

    // sweeps aabb along dx and accounts for collisions
    processCollisions(self, b.aabb, dx, b.resting);

    // if autostep, and on ground, run collisions again with stepped up aabb
    if (b.autoStep) {
        tryAutoStepping(self, b, tmpBox, dx);
    }

    // Collision impacts. b.resting shows which axes had collisions:
    for (var i = 0; i < 3; ++i) {
        impacts[i] = 0;
        if (b.resting[i]) {
            // count impact only if wasn't collided last frame
            if (!oldResting[i]) impacts[i] = -b.velocity[i];
            b.velocity[i] = 0;
        }
    }
    var mag = vec3.length(impacts);
    if (mag > .001) { // epsilon
        // send collision event - allows client to optionally change
        // body's restitution depending on what terrain it hit
        // event argument is impulse J = m * dv
        vec3.scale(impacts, impacts, b.mass);
        if (b.onCollide) b.onCollide(impacts);

        // bounce depending on restitution and minBounceImpulse
        if (b.restitution > 0 && mag > self.minBounceImpulse) {
            vec3.scale(impacts, impacts, b.restitution);
            b.applyImpulse(impacts);
        }
    }


    // sleep check
    var vsq = vec3.squaredLength(b.velocity);
    if (vsq > 1e-5) b._markActive();
}








/*
 *    FLUIDS
*/

function applyFluidForces(self, body) {
    // First pass at handling fluids. Assumes fluids are settled
    //   thus, only check at corner of body, and only from bottom up
    var box = body.aabb;
    var cx = Math.floor(box.base[0]);
    var cz = Math.floor(box.base[2]);
    var y0 = Math.floor(box.base[1]);
    var y1 = Math.floor(box.max[1]);

    if (!self.testFluid(cx, y0, cz)) {
        body.inFluid = false;
        body.ratioInFluid = 0;
        return
    }

    // body is in a fluid - find out how much of body is submerged
    var submerged = 1;
    var cy = y0 + 1;
    while (cy <= y1 && self.testFluid(cx, cy, cz)) {
        submerged++;
        cy++;
    }
    var fluidLevel = y0 + submerged;
    var heightInFluid = fluidLevel - box.base[1];
    var ratioInFluid = heightInFluid / box.vec[1];
    if (ratioInFluid > 1) ratioInFluid = 1;
    var vol = box.vec[0] * box.vec[1] * box.vec[2];
    var displaced = vol * ratioInFluid;
    // bouyant force = -gravity * fluidDensity * volumeDisplaced
    var f = _fluidVec;
    vec3.scale(f, self.gravity, -self.fluidDensity * displaced);
    body.applyForce(f);

    body.inFluid = true;
    body.ratioInFluid = ratioInFluid;
}

var _fluidVec = vec3.create();





/*
 *    FRICTION
*/


function applyFrictionByAxis(axis, body, dvel) {
    // friction applies only if moving into a touched surface
    var restDir = body.resting[axis];
    var vNormal = dvel[axis];
    if (restDir === 0) return
    if (restDir * vNormal <= 0) return

    // current vel lateral to friction axis
    vec3.copy(lateralVel, body.velocity);
    lateralVel[axis] = 0;
    var vCurr = vec3.length(lateralVel);
    if (equals(vCurr, 0)) return

    // treat current change in velocity as the result of a pseudoforce
    //        Fpseudo = m*dv/dt
    // Base friction force on normal component of the pseudoforce
    //        Ff = u * Fnormal
    //        Ff = u * m * dvnormal / dt
    // change in velocity due to friction force
    //        dvF = dt * Ff / m
    //            = dt * (u * m * dvnormal / dt) / m
    //            = u * dvnormal
    var dvMax = Math.abs(body.friction * vNormal);

    // decrease lateral vel by dvMax (or clamp to zero)
    var scaler = (vCurr > dvMax) ? (vCurr - dvMax) / vCurr : 0;
    body.velocity[(axis + 1) % 3] *= scaler;
    body.velocity[(axis + 2) % 3] *= scaler;
}
var lateralVel = vec3.create();






/*
 *    COLLISION HANDLER
*/

// sweep aabb along velocity vector and set resting vector
function processCollisions(self, box, velocity, resting) {
    vec3.set(resting, 0, 0, 0);
    return sweep$3(self.testSolid, box, velocity, function (dist, axis, dir, vec) {
        resting[axis] = dir;
        vec[axis] = 0;
    })
}





/*
 *    AUTO-STEPPING
*/

var tmpBox = new AABB([], []);
var tmpResting = vec3.create();
var targetPos = vec3.create();
var upvec = vec3.create();
var leftover = vec3.create();

function tryAutoStepping(self, b, oldBox, dx) {
    if (b.resting[1] >= 0 && !b.inFluid) return

    // // direction movement was blocked before trying a step
    var xBlocked = (b.resting[0] !== 0);
    var zBlocked = (b.resting[2] !== 0);
    if (!(xBlocked || zBlocked)) return

    // continue autostepping only if headed sufficiently into obstruction
    var ratio = Math.abs(dx[0] / dx[2]);
    var cutoff = 4;
    if (!xBlocked && ratio > cutoff) return
    if (!zBlocked && ratio < 1 / cutoff) return

    // original target position before being obstructed
    vec3.add(targetPos, oldBox.base, dx);

    // move towards the target until the first X/Z collision
    var getVoxels = self.testSolid;
    sweep$3(getVoxels, oldBox, dx, function (dist, axis, dir, vec) {
        if (axis === 1) vec[axis] = 0;
        else return true
    });

    var y = b.aabb.base[1];
    var ydist = Math.floor(y + 1.001) - y;
    vec3.set(upvec, 0, ydist, 0);
    var collided = false;
    // sweep up, bailing on any obstruction
    sweep$3(getVoxels, oldBox, upvec, function (dist, axis, dir, vec) {
        collided = true;
        return true
    });
    if (collided) return // could't move upwards

    // now move in X/Z however far was left over before hitting the obstruction
    vec3.subtract(leftover, targetPos, oldBox.base);
    leftover[1] = 0;
    processCollisions(self, oldBox, leftover, tmpResting);

    // bail if no movement happened in the originally blocked direction
    if (xBlocked && !equals(oldBox.base[0], targetPos[0])) return
    if (zBlocked && !equals(oldBox.base[2], targetPos[2])) return

    // done - oldBox is now at the target autostepped position
    cloneAABB(b.aabb, oldBox);
    b.resting[0] = tmpResting[0];
    b.resting[2] = tmpResting[2];
    if (b.onStep) b.onStep();
}





/*
 *    SLEEP CHECK
*/

function bodyAsleep(self, body, dt, noGravity) {
    if (body._sleepFrameCount > 0) return false
    // without gravity bodies stay asleep until a force/impulse wakes them up
    if (noGravity) return true
    // otherwise check body is resting against something
    // i.e. sweep along by distance d = 1/2 g*t^2
    // and check there's still a collision
    var isResting = false;
    var gmult = 0.5 * dt * dt * body.gravityMultiplier;
    vec3.scale(sleepVec, self.gravity, gmult);
    sweep$3(self.testSolid, body.aabb, sleepVec, function () {
        isResting = true;
        return true
    }, true);
    return isResting
}
var sleepVec = vec3.create();





function equals(a, b) { return Math.abs(a - b) < 1e-5 }

function cloneAABB(tgt, src) {
    for (var i = 0; i < 3; i++) {
        tgt.base[i] = src.base[i];
        tgt.max[i] = src.max[i];
        tgt.vec[i] = src.vec[i];
    }
}



var sanityCheck = function (v) { };

var defaultOptions$2 = {
    gravity: [0, -10, 0],
    airDrag: 0.1,
};

/**
 * `noa.physics` - Wrapper module for the physics engine.
 * 
 * This module extends 
 * [voxel-physics-engine](https://github.com/fenomas/voxel-physics-engine),
 * so turn on "Inherited" to see its APIs here, or view the base module 
 * for full docs.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * 
 * ```js
 * {
 *     gravity: [0, -10, 0],
 *     airDrag: 0.1,
 *     fluidDrag: 0.4,
 *     fluidDensity: 2.0,
 *     minBounceImpulse: .5,      // cutoff for a bounce to occur
 * }
 * ```
*/

class Physics extends Physics$1 {

    /** 
     * @internal 
     * @param {import('../index').Engine} noa
    */
    constructor(noa, opts) {
        opts = Object.assign({}, defaultOptions$2, opts);
        var world = noa.world;
        var solidLookup = noa.registry._solidityLookup;
        var fluidLookup = noa.registry._fluidityLookup;

        // physics engine runs in offset coords, so voxel getters need to match
        var offset = noa.worldOriginOffset;

        var blockGetter = (x, y, z) => {
            var id = world.getBlockID(x + offset[0], y + offset[1], z + offset[2]);
            return solidLookup[id]
        };
        var isFluidGetter = (x, y, z) => {
            var id = world.getBlockID(x + offset[0], y + offset[1], z + offset[2]);
            return fluidLookup[id]
        };

        super(opts, blockGetter, isFluidGetter);
    }

}

/* 
 * 
 *   Chunk
 * 
 *  Stores and manages voxel ids and flags for each voxel within chunk
 * 
 */





/*
 *
 *    Chunk constructor
 *
 */

/** @param {import('../index').Engine} noa */
function Chunk(noa, requestID, ci, cj, ck, size, dataArray, fillVoxelID = -1) {
    this.noa = noa;
    this.isDisposed = false;

    // arbitrary data passed in by client when generating world
    this.userData = null;

    // voxel data and properties
    this.requestID = requestID;     // id sent to game client
    this.voxels = dataArray;
    this.i = ci;
    this.j = cj;
    this.k = ck;
    this.size = size;
    this.x = ci * size;
    this.y = cj * size;
    this.z = ck * size;
    this.pos = [this.x, this.y, this.z];

    // flags to track if things need re-meshing
    this._terrainDirty = false;
    this._objectsDirty = false;

    // inits state of terrain / object meshing
    this._terrainMeshes = [];
    noa._terrainMesher.initChunk(this);
    noa._objectMesher.initChunk(this);

    this._isFull = false;
    this._isEmpty = false;

    this._wholeLayerVoxel = Array(size).fill(-1);
    if (fillVoxelID >= 0) {
        this.voxels.data.fill(fillVoxelID, 0, this.voxels.size);
        this._wholeLayerVoxel.fill(fillVoxelID);
    }

    // references to neighboring chunks, if they exist (filled in by `world`)
    var narr = Array.from(Array(27), () => null);
    this._neighbors = ndarray(narr, [3, 3, 3]).lo(1, 1, 1);
    this._neighbors.set(0, 0, 0, this);
    this._neighborCount = 0;
    this._timesMeshed = 0;

    // location queue of voxels in this chunk with block handlers (assume it's rare)
    /** @internal */
    this._blockHandlerLocs = new LocationQueue();

    // passes through voxel contents, calling block handlers etc.
    scanVoxelData(this);
}


// expose logic internally to create and update the voxel data array
Chunk._createVoxelArray = function (size) {
    var arr = new Uint16Array(size * size * size);
    return ndarray(arr, [size, size, size])
};

Chunk.prototype._updateVoxelArray = function (dataArray, fillVoxelID = -1) {
    // dispose current object blocks
    callAllBlockHandlers(this, 'onUnload');
    this.noa._objectMesher.disposeChunk(this);
    this.noa._terrainMesher.disposeChunk(this);
    this.voxels = dataArray;
    this._terrainDirty = false;
    this._objectsDirty = false;
    this._blockHandlerLocs.empty();
    this.noa._objectMesher.initChunk(this);
    this.noa._terrainMesher.initChunk(this);

    if (fillVoxelID >= 0) {
        this._wholeLayerVoxel.fill(fillVoxelID);
    } else {
        this._wholeLayerVoxel.fill(-1);
    }

    scanVoxelData(this);
};








/*
 *
 *    Chunk API
 *
 */

// get/set deal with block IDs, so that this class acts like an ndarray

Chunk.prototype.get = function (i, j, k) {
    return this.voxels.get(i, j, k)
};

Chunk.prototype.getSolidityAt = function (i, j, k) {
    var solidLookup = this.noa.registry._solidityLookup;
    return solidLookup[this.voxels.get(i, j, k)]
};

Chunk.prototype.set = function (i, j, k, newID) {
    var oldID = this.voxels.get(i, j, k);
    if (newID === oldID) return

    // update voxel data
    this.voxels.set(i, j, k, newID);

    // lookup tables from registry, etc
    var solidLookup = this.noa.registry._solidityLookup;
    var objectLookup = this.noa.registry._objectLookup;
    var opaqueLookup = this.noa.registry._opacityLookup;
    var handlerLookup = this.noa.registry._blockHandlerLookup;

    // track invariants about chunk data
    if (!opaqueLookup[newID]) this._isFull = false;
    if (newID !== 0) this._isEmpty = false;
    if (this._wholeLayerVoxel[j] !== newID) this._wholeLayerVoxel[j] = -1;

    // voxel lifecycle handling
    var hold = handlerLookup[oldID];
    var hnew = handlerLookup[newID];
    if (hold) callBlockHandler(this, hold, 'onUnset', i, j, k);
    if (hnew) {
        callBlockHandler(this, hnew, 'onSet', i, j, k);
        this._blockHandlerLocs.add(i, j, k);
    } else {
        this._blockHandlerLocs.remove(i, j, k);
    }

    // track object block states
    var objMesher = this.noa._objectMesher;
    var objOld = objectLookup[oldID];
    var objNew = objectLookup[newID];
    if (objOld) objMesher.setObjectBlock(this, 0, i, j, k);
    if (objNew) objMesher.setObjectBlock(this, newID, i, j, k);

    // decide dirtiness states
    var solidityChanged = (solidLookup[oldID] !== solidLookup[newID]);
    var opacityChanged = (opaqueLookup[oldID] !== opaqueLookup[newID]);
    var wasTerrain = !objOld && (oldID !== 0);
    var nowTerrain = !objNew && (newID !== 0);

    if (objOld || objNew) this._objectsDirty = true;
    if (solidityChanged || opacityChanged || wasTerrain || nowTerrain) {
        this._terrainDirty = true;
    }

    if (this._terrainDirty || this._objectsDirty) {
        this.noa.world._queueChunkForRemesh(this);
    }

    // neighbors only affected if solidity or opacity changed on an edge
    if (solidityChanged || opacityChanged) {
        var edge = this.size - 1;
        var imin = (i === 0) ? -1 : 0;
        var jmin = (j === 0) ? -1 : 0;
        var kmin = (k === 0) ? -1 : 0;
        var imax = (i === edge) ? 1 : 0;
        var jmax = (j === edge) ? 1 : 0;
        var kmax = (k === edge) ? 1 : 0;
        for (var ni = imin; ni <= imax; ni++) {
            for (var nj = jmin; nj <= jmax; nj++) {
                for (var nk = kmin; nk <= kmax; nk++) {
                    if ((ni | nj | nk) === 0) continue
                    var nab = this._neighbors.get(ni, nj, nk);
                    if (!nab) continue
                    nab._terrainDirty = true;
                    this.noa.world._queueChunkForRemesh(nab);
                }
            }
        }
    }
};



// helper to call handler of a given type at a particular xyz
function callBlockHandler(chunk, handlers, type, i, j, k) {
    var handler = handlers[type];
    if (!handler) return
    handler(chunk.x + i, chunk.y + j, chunk.z + k);
}


// gets called by World when this chunk has been queued for remeshing
Chunk.prototype.updateMeshes = function () {
    if (this._terrainDirty) {
        this.noa._terrainMesher.meshChunk(this);
        this._timesMeshed++;
        this._terrainDirty = false;
    }
    if (this._objectsDirty) {
        this.noa._objectMesher.buildObjectMeshes();
        this._objectsDirty = false;
    }
};












/*
 * 
 *      Init
 * 
 *  Scans voxel data, processing object blocks and setting chunk flags
 * 
*/

function scanVoxelData(chunk) {
    var voxels = chunk.voxels;
    var data = voxels.data;
    var len = voxels.shape[0];
    var opaqueLookup = chunk.noa.registry._opacityLookup;
    var handlerLookup = chunk.noa.registry._blockHandlerLookup;
    var objectLookup = chunk.noa.registry._objectLookup;
    var plainLookup = chunk.noa.registry._blockIsPlainLookup;
    var objMesher = chunk.noa._objectMesher;

    // flags for tracking if chunk is entirely opaque or transparent
    var fullyOpaque = true;
    var fullyAir = true;

    // scan vertically..
    for (var j = 0; j < len; ++j) {

        // fastest case where whole layer is air/dirt/etc
        var layerID = chunk._wholeLayerVoxel[j];
        if (layerID >= 0 && !objMesher[layerID] && !handlerLookup[layerID]) {
            if (!opaqueLookup[layerID]) fullyOpaque = false;
            if (layerID !== 0) fullyAir = false;
            continue
        }

        var constantID = voxels.get(0, j, 0);

        for (var i = 0; i < len; ++i) {
            var index = voxels.index(i, j, 0);
            for (var k = 0; k < len; ++k, ++index) {
                var id = data[index];

                // detect constant layer ID if there is one
                if (constantID >= 0 && id !== constantID) constantID = -1;

                // most common cases: air block...
                if (id === 0) {
                    fullyOpaque = false;
                    continue
                }
                // ...or plain boring block (no mesh, handlers, etc)
                if (plainLookup[id]) {
                    fullyAir = false;
                    continue
                }
                // otherwise check opacity, object mesh, and handlers
                fullyOpaque = fullyOpaque && opaqueLookup[id];
                fullyAir = false;
                if (objectLookup[id]) {
                    objMesher.setObjectBlock(chunk, id, i, j, k);
                    chunk._objectsDirty = true;
                }
                var handlers = handlerLookup[id];
                if (handlers) {
                    chunk._blockHandlerLocs.add(i, j, k);
                    callBlockHandler(chunk, handlers, 'onLoad', i, j, k);
                }
            }
        }

        if (constantID >= 0) chunk._wholeLayerVoxel[j] = constantID;
    }

    chunk._isFull = fullyOpaque;
    chunk._isEmpty = fullyAir;
    chunk._terrainDirty = !chunk._isEmpty;
}










// dispose function - just clears properties and references

Chunk.prototype.dispose = function () {
    // look through the data for onUnload handlers
    callAllBlockHandlers(this, 'onUnload');
    this._blockHandlerLocs.empty();

    // let meshers dispose their stuff
    this.noa._objectMesher.disposeChunk(this);
    this.noa._terrainMesher.disposeChunk(this);

    // apparently there's no way to dispose typed arrays, so just null everything
    this.voxels.data = null;
    this.voxels = null;
    this._neighbors.data = null;
    this._neighbors = null;

    this.isDisposed = true;
    this.noa = null;
};



// helper to call a given handler for all blocks in the chunk
function callAllBlockHandlers(chunk, type) {
    var voxels = chunk.voxels;
    var handlerLookup = chunk.noa.registry._blockHandlerLookup;
    chunk._blockHandlerLocs.arr.forEach(([i, j, k]) => {
        var id = voxels.get(i, j, k);
        callBlockHandler(chunk, handlerLookup[id], type, i, j, k);
    });
}

/**
 * Coordinate conversion utilities for chunk/local coordinate transforms.
 * Provides factory functions that return optimized converters based on chunk size.
 * @module worldCoords
 */

/**
 * Coordinate converter function type - converts world coords to chunk indices
 * @typedef {function(number, number, number): [number, number, number]} CoordsToChunkIndexesFn
 */

/**
 * Coordinate converter function type - converts world coords to local chunk coords
 * @typedef {function(number, number, number): [number, number, number]} CoordsToChunkLocalsFn
 */


/**
 * Creates a function to convert world coordinates to chunk indices.
 * Returns an optimized bit-shifting version when chunk size is a power of two.
 *
 * @param {number} chunkSize - Size of chunks in each dimension
 * @returns {CoordsToChunkIndexesFn}
 */
function createCoordsToChunkIndexes(chunkSize) {
    var powerOfTwo = ((chunkSize & chunkSize - 1) === 0);
    if (powerOfTwo) {
        var shift = Math.log2(chunkSize) | 0;
        return function chunkCoordsToIndexesPowerOfTwo(x, y, z) {
            return [(x >> shift) | 0, (y >> shift) | 0, (z >> shift) | 0]
        }
    }
    var cs = chunkSize;
    return function chunkCoordsToIndexesGeneral(x, y, z) {
        return [Math.floor(x / cs) | 0, Math.floor(y / cs) | 0, Math.floor(z / cs) | 0]
    }
}


/**
 * Creates a function to convert world coordinates to local chunk coordinates.
 * Returns an optimized bit-masking version when chunk size is a power of two.
 *
 * @param {number} chunkSize - Size of chunks in each dimension
 * @returns {CoordsToChunkLocalsFn}
 */
function createCoordsToChunkLocals(chunkSize) {
    var powerOfTwo = ((chunkSize & chunkSize - 1) === 0);
    if (powerOfTwo) {
        var mask = (chunkSize - 1) | 0;
        return function chunkCoordsToLocalsPowerOfTwo(x, y, z) {
            return [(x & mask) | 0, (y & mask) | 0, (z & mask) | 0]
        }
    }
    var cs = chunkSize;
    return function chunkCoordsToLocalsGeneral(x, y, z) {
        var i = (x % cs) | 0; if (i < 0) i += cs;
        var j = (y % cs) | 0; if (j < 0) j += cs;
        var k = (z % cs) | 0; if (k < 0) k += cs;
        return [i, j, k]
    }
}

/**
 * Core state initialization and storage management for World module.
 * @module worldCore
 */



/**
 * Core state and storage management class.
 */
class WorldCore {
    /**
     * @param {import('./index.js').World} world
     * @param {import('./worldUtils.js').WorldOptions} opts
     */
    constructor(world, opts) {
        /** @type {import('./index.js').World} */
        this.world = world;

        // Init internal chunk queues:

        /** All chunks existing in any queue
         * @type {LocationQueue} */
        world._chunksKnown = new LocationQueue();

        /** In range but not yet requested from client
         * @type {LocationQueue} */
        world._chunksToRequest = new LocationQueue();

        /** Known to have invalid data (wrong world, eg)
         * @type {LocationQueue} */
        world._chunksInvalidated = new LocationQueue();

        /** Out of range, and waiting to be removed
         * @type {LocationQueue} */
        world._chunksToRemove = new LocationQueue();

        /** Requested, awaiting data event from client
         * @type {LocationQueue} */
        world._chunksPending = new LocationQueue();

        /** Has data, waiting to be (re-)meshed
         * @type {LocationQueue} */
        world._chunksToMesh = new LocationQueue();

        /** Priority queue for chunks to re-mesh
         * @type {LocationQueue} */
        world._chunksToMeshFirst = new LocationQueue();

        /** A queue of chunk locations, rather than chunk references.
         * Has only the positive 1/16 quadrant, sorted (reverse order!)
         * @type {LocationQueue} */
        world._chunksSortedLocs = new LocationQueue();

        // chunks stored in a data structure for quick lookup
        // note that the hash wraps around every 1024 chunk indexes!!
        // i.e. two chunks that far apart can't be loaded at the same time
        /** @type {ChunkStorage} */
        world._storage = new ChunkStorage();

        // coordinate converter functions - create optimized versions based on chunk size
        var cs = opts.chunkSize;
        world._coordsToChunkIndexes = createCoordsToChunkIndexes(cs);
        world._coordsToChunkLocals = createCoordsToChunkLocals(cs);

        // when chunk size is a power of two, store optimization values
        var powerOfTwo = ((cs & cs - 1) === 0);
        if (powerOfTwo) {
            /** @internal */
            world._coordShiftBits = Math.log2(cs) | 0;
            /** @internal */
            world._coordMask = (cs - 1) | 0;
        }
    }

    /**
     * Get chunk by indexes from storage.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     * @returns {import('../chunk.js').Chunk|null}
     */
    getChunkByIndexes(i, j, k) {
        return this.world._storage.getChunkByIndexes(i, j, k)
    }

    /**
     * Store chunk by indexes.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     * @param {import('../chunk.js').Chunk} chunk
     */
    storeChunkByIndexes(i, j, k, chunk) {
        this.world._storage.storeChunkByIndexes(i, j, k, chunk);
    }

    /**
     * Remove chunk from storage by indexes.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     */
    removeChunkByIndexes(i, j, k) {
        this.world._storage.removeChunkByIndexes(i, j, k);
    }
}

/**
 * Voxel/block access API for World module.
 * Handles getting and setting block data at world coordinates.
 * @module worldVoxels
 */

/**
 * Voxel access class providing block get/set operations.
 */
class WorldVoxels {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world;
    }

    /**
     * Get the block ID at the given world coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {number}
     */
    getBlockID(x = 0, y = 0, z = 0) {
        var world = this.world;
        var [ci, cj, ck] = world._coordsToChunkIndexes(x, y, z);
        var chunk = world._storage.getChunkByIndexes(ci, cj, ck);
        if (!chunk) return 0
        var [i, j, k] = world._coordsToChunkLocals(x, y, z);
        return chunk.voxels.get(i, j, k)
    }

    /**
     * Get whether the block at the given coordinates is solid.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockSolidity(x = 0, y = 0, z = 0) {
        var world = this.world;
        var [ci, cj, ck] = world._coordsToChunkIndexes(x, y, z);
        var chunk = world._storage.getChunkByIndexes(ci, cj, ck);
        if (!chunk) return false
        var [i, j, k] = world._coordsToChunkLocals(x, y, z);
        return !!chunk.getSolidityAt(i, j, k)
    }

    /**
     * Get the opacity of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockOpacity(x = 0, y = 0, z = 0) {
        var id = this.getBlockID(x, y, z);
        return this.world.noa.registry.getBlockOpacity(id)
    }

    /**
     * Get the fluidity of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockFluidity(x = 0, y = 0, z = 0) {
        var id = this.getBlockID(x, y, z);
        return this.world.noa.registry.getBlockFluidity(id)
    }

    /**
     * Get the properties object of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {object}
     */
    getBlockProperties(x = 0, y = 0, z = 0) {
        var id = this.getBlockID(x, y, z);
        return this.world.noa.registry.getBlockProps(id)
    }

    /**
     * Set the block ID at the given world coordinates.
     * @param {number} [id=0]
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    setBlockID(id = 0, x = 0, y = 0, z = 0) {
        var world = this.world;
        var [ci, cj, ck] = world._coordsToChunkIndexes(x, y, z);
        var chunk = world._storage.getChunkByIndexes(ci, cj, ck);
        if (!chunk) return
        var [i, j, k] = world._coordsToChunkLocals(x, y, z);
        return chunk.set(i, j, k, id)
    }

    /**
     * Check if the given AABB is unobstructed (no solid blocks).
     * @param {{ base: number[], max: number[] }} box - AABB with base and max coordinates
     * @returns {boolean}
     */
    isBoxUnobstructed(box) {
        var base = box.base;
        var max = box.max;
        for (var i = Math.floor(base[0]); i < max[0] + 1; i++) {
            for (var j = Math.floor(base[1]); j < max[1] + 1; j++) {
                for (var k = Math.floor(base[2]); k < max[2] + 1; k++) {
                    if (this.getBlockSolidity(i, j, k)) return false
                }
            }
        }
        return true
    }
}

/**
 * Async chunk generator registration and handling.
 * @module worldChunkGen
 */


/**
 * Result from async chunk generator
 * @typedef {object} ChunkGeneratorResult
 * @property {*} voxelData - ndarray of voxel data
 * @property {*} [userData] - optional user data attached to chunk
 * @property {number} [fillVoxelID] - optional fill ID for uniform chunks
 */

/**
 * Async chunk generator function signature
 * @callback ChunkGeneratorFunction
 * @param {number} x - Chunk world x coordinate
 * @param {number} y - Chunk world y coordinate
 * @param {number} z - Chunk world z coordinate
 * @param {number} requestID - Unique request identifier
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @returns {Promise<ChunkGeneratorResult|null>} Generated chunk data or null
 */


/**
 * Handles async chunk generator registration and execution.
 */
class WorldChunkGen {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world;

        /** @type {ChunkGeneratorFunction|null} */
        this._asyncChunkGenerator = null;

        /** @type {Map<string, AbortController>} requestID -> AbortController */
        this._asyncChunkAbortControllers = new Map();

        /** @type {Map<string, Promise<void>>} requestID -> Promise */
        this._asyncChunkPromises = new Map();
    }

    /**
     * Whether an async generator is registered.
     * @returns {boolean}
     */
    hasAsyncGenerator() {
        return !!this._asyncChunkGenerator
    }

    /**
     * Register an async chunk generator function. When registered, this function
     * will be called instead of emitting `worldDataNeeded` events.
     *
     * The generator function receives:
     * - `x, y, z`: World coordinates of chunk origin
     * - `chunkSize`: Size of chunk in each dimension
     * - `signal`: AbortSignal that fires if chunk is cancelled (left view range)
     *
     * It should return a Promise that resolves to either:
     * - An object `{ voxelData, userData?, fillVoxelID? }` where voxelData is an ndarray
     * - Or `null` to indicate the chunk should be empty (all air)
     *
     * @param {ChunkGeneratorFunction} generatorFn
     * @example
     * ```js
     * noa.world.registerChunkGenerator(async (x, y, z, chunkSize, signal) => {
     *   // Check for cancellation
     *   if (signal.aborted) return null
     *
     *   // Generate or fetch chunk data
     *   const voxelData = await generateChunk(x, y, z, chunkSize)
     *
     *   // Can check signal periodically during long operations
     *   if (signal.aborted) return null
     *
     *   return { voxelData }
     * })
     * ```
     */
    registerChunkGenerator(generatorFn) {
        var world = this.world;
        this._asyncChunkGenerator = generatorFn;

        // Re-request any chunks that were requested before the generator was registered
        // These would have emitted worldDataNeeded events with no handler
        var pendingCount = world._chunksPending.count();
        if (pendingCount > 0) {
            console.log(`[noa:world] Re-requesting ${pendingCount} pending chunks`);
            var pending = world._chunksPending.arr.slice(); // copy array
            world._chunksPending.empty();
            pending.forEach((loc) => {
                world._lifecycle.requestNewChunk(loc[0], loc[1], loc[2]);
            });
        }
    }

    /**
     * Handle async chunk generation for a specific request.
     * @param {string} requestID
     * @param {number} x - World X coordinate of chunk origin
     * @param {number} y - World Y coordinate of chunk origin
     * @param {number} z - World Z coordinate of chunk origin
     * @param {string} worldName - Current world name for validation
     */
    requestNewChunkAsync(requestID, x, y, z, worldName) {
        var world = this.world;
        var self = this;

        // Create abort controller for this request
        var abortController = new AbortController();
        this._asyncChunkAbortControllers.set(requestID, abortController);

        var promise = this._asyncChunkGenerator(x, y, z, world._chunkSize, abortController.signal)
            .then(result => {
                // Only clean up if this is still the active request for this chunk
                // (prevents race where chunk removed & re-requested before promise resolves)
                if (self._asyncChunkAbortControllers.get(requestID) === abortController) {
                    self._asyncChunkAbortControllers.delete(requestID);
                    self._asyncChunkPromises.delete(requestID);
                }

                // Check if aborted or world changed
                if (abortController.signal.aborted) return
                if (worldName !== world.noa.worldName) return

                // Handle null result (empty chunk) - create empty array on demand
                if (result === null) {
                    var emptyArr = Chunk._createVoxelArray(world._chunkSize);
                    world._lifecycle.setChunkDataInternal(requestID, emptyArr, null, 0);
                    return
                }

                // Handle result with voxelData
                var { voxelData, userData, fillVoxelID } = result;
                if (voxelData) {
                    world._lifecycle.setChunkDataInternal(requestID, voxelData, userData || null, fillVoxelID ?? -1);
                } else {
                    // No voxel data provided, treat as empty - create array on demand
                    var fallbackArr = Chunk._createVoxelArray(world._chunkSize);
                    world._lifecycle.setChunkDataInternal(requestID, fallbackArr, userData || null, 0);
                }
            })
            .catch(err => {
                // Only clean up if this is still the active request for this chunk
                if (self._asyncChunkAbortControllers.get(requestID) === abortController) {
                    self._asyncChunkAbortControllers.delete(requestID);
                    self._asyncChunkPromises.delete(requestID);
                }

                // Don't log abort errors - they're expected
                if (err.name === 'AbortError') return

                console.error(`[noa] Async chunk generation failed for ${requestID}:`, err);
                // On error, create empty chunk as fallback to prevent permanent holes
                var errorArr = Chunk._createVoxelArray(world._chunkSize);
                world._lifecycle.setChunkDataInternal(requestID, errorArr, null, 0);
            });

        this._asyncChunkPromises.set(requestID, promise);
    }

    /**
     * Cancel an async chunk request by ID.
     * @param {string} requestID
     */
    cancelAsyncRequest(requestID) {
        var abortController = this._asyncChunkAbortControllers.get(requestID);
        if (abortController) {
            abortController.abort();
            this._asyncChunkAbortControllers.delete(requestID);
            this._asyncChunkPromises.delete(requestID);
        }
    }

    /**
     * Cancel all pending async chunk requests.
     */
    cancelAllAsyncRequests() {
        for (var [requestID, abortController] of this._asyncChunkAbortControllers) {
            abortController.abort();
        }
        this._asyncChunkAbortControllers.clear();
        this._asyncChunkPromises.clear();
    }
}

/**
 * Chunk loading distance and world bounds configuration.
 * @module worldBounds
 */

/**
 * World bounds configuration object
 * @typedef {object} WorldBoundsConfig
 * @property {number} minX - Minimum chunk X index (inclusive)
 * @property {number} maxX - Maximum chunk X index (inclusive)
 * @property {number} minY - Minimum chunk Y index (inclusive)
 * @property {number} maxY - Maximum chunk Y index (inclusive)
 * @property {number} minZ - Minimum chunk Z index (inclusive)
 * @property {number} maxZ - Maximum chunk Z index (inclusive)
 */

/**
 * Distance test function type
 * @typedef {function(number, number, number): boolean} DistanceTestFn
 */

/**
 * Baked world loader interface
 * @typedef {object} BakedWorldLoader
 * @property {function(): {minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number, chunkSize?: number}} getWorldBounds
 */


/**
 * Makes a function to check if an (i,j,k) is within a sphere/ellipse of given size.
 * @param {number} xsize - Horizontal radius
 * @param {number} ysize - Vertical radius
 * @returns {DistanceTestFn}
 */
function makeDistanceTestFunction(xsize, ysize) {
    var asq = xsize * xsize;
    var bsq = ysize * ysize;
    // spherical case
    if (xsize === ysize) return (i, j, k) => (i * i + j * j + k * k <= asq)
    // otherwise do clipped spheres for now
    if (xsize > ysize) return (i, j, k) => {
        if (Math.abs(j) > ysize) return false
        return (i * i + j * j + k * k <= asq)
    }
    return (i, j, k) => {
        var dxsq = i * i + k * k;
        if (dxsq > asq) return false
        return (dxsq + j * j <= bsq)
    }
}


/**
 * Handles chunk loading distance configuration and world bounds.
 */
class WorldBounds {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world;
    }

    /**
     * Sets the distances within which to load new chunks, and beyond which
     * to unload them. Generally you want the remove distance to be somewhat
     * farther, so that moving back and forth across the same chunk border doesn't
     * keep loading/unloading the same distant chunks.
     *
     * Both arguments can be numbers (number of voxels), or arrays like:
     * `[horiz, vert]` specifying different horizontal and vertical distances.
     * @param {number | number[]} [addDist=2]
     * @param {number | number[]} [remDist=3]
     */
    setAddRemoveDistance(addDist = 2, remDist = 3) {
        var world = this.world;
        var addArr = Array.isArray(addDist) ? addDist : [addDist, addDist];
        var remArr = Array.isArray(remDist) ? remDist : [remDist, remDist];
        var minGap = 1;
        if (remArr[0] < addArr[0] + minGap) remArr[0] = addArr[0] + minGap;
        if (remArr[1] < addArr[1] + minGap) remArr[1] = addArr[1] + minGap;
        world._chunkAddDistance = addArr;
        world._chunkRemoveDistance = remArr;
        // rebuild chunk distance functions and add search locations
        world._addDistanceFn = makeDistanceTestFunction(addArr[0], addArr[1]);
        world._remDistanceFn = makeDistanceTestFunction(remArr[0], remArr[1]);
        world._chunksSortedLocs.empty();
        // this queue holds only 1/16th the search space: i=0..max, j=0..i, k=0..max
        for (var i = 0; i <= addArr[0]; i++) {
            for (var k = 0; k <= i; k++) {
                for (var j = 0; j <= addArr[1]; j++) {
                    if (!world._addDistanceFn(i, j, k)) continue
                    world._chunksSortedLocs.add(i, j, k);
                }
            }
        }
        // resets state of nearby chunk search
        world._prevSortingFn = null;
        world._chunkAddSearchFrom = 0;
    }

    /**
     * Set finite world bounds in chunk indices. Chunks outside these bounds will not be
     * loaded or generated, creating a bounded world. Set to null to return to infinite world.
     *
     * @param {number|null|undefined} minX - Minimum chunk X index (inclusive), or null/undefined to clear
     * @param {number} [maxX] - Maximum chunk X index (inclusive)
     * @param {number} [minY] - Minimum chunk Y index (inclusive)
     * @param {number} [maxY] - Maximum chunk Y index (inclusive)
     * @param {number} [minZ] - Minimum chunk Z index (inclusive)
     * @param {number} [maxZ] - Maximum chunk Z index (inclusive)
     * @example
     * ```js
     * // Set world bounds to a 10x5x10 chunk region centered at origin
     * noa.world.setWorldBounds(-5, 4, -2, 2, -5, 4)
     * // Clear bounds for infinite world
     * noa.world.setWorldBounds(null)
     * ```
     */
    setWorldBounds(minX, maxX, minY, maxY, minZ, maxZ) {
        var world = this.world;
        if (minX === null || minX === undefined) {
            world._worldBounds = null;
            console.log('[noa] World bounds cleared - infinite world enabled');
            return
        }
        world._worldBounds = { minX, maxX, minY, maxY, minZ, maxZ };
        console.log('[noa] World bounds set: ' +
            'X=[' + minX + ',' + maxX + '], ' +
            'Y=[' + minY + ',' + maxY + '], ' +
            'Z=[' + minZ + ',' + maxZ + ']');
    }

    /**
     * Automatically configure chunk load/unload distances based on a baked world's bounds
     * and the player's spawn position. This ensures all chunks within the baked area
     * are loadable from the spawn point, avoiding procedural generation overhead
     * and reducing memory usage.
     *
     * @param {BakedWorldLoader} loader - A loaded BakedWorldLoader instance
     * @param {[number, number, number]} [spawnPosition] - Player spawn position in world coordinates
     * @param {object} [options] - Optional configuration
     * @param {number} [options.buffer=1] - Extra chunks to load beyond minimum required
     * @example
     * ```js
     * const loader = new BakedWorldLoader()
     * await loader.loadFromURL('/world.noaworld')
     * // Configure based on spawn position with extra buffer for smoother loading
     * noa.world.setAddRemoveDistanceFromBakedWorld(loader, [15, 5, 0], { buffer: 2 })
     * ```
     */
    setAddRemoveDistanceFromBakedWorld(loader, spawnPosition, options) {
        var world = this.world;
        if (!loader || typeof loader.getWorldBounds !== 'function') {
            console.warn('[noa] Invalid loader passed to setAddRemoveDistanceFromBakedWorld');
            return
        }

        var bounds = loader.getWorldBounds();

        // Validate bounds object
        if (!bounds ||
            typeof bounds.minX !== 'number' || typeof bounds.maxX !== 'number' ||
            typeof bounds.minY !== 'number' || typeof bounds.maxY !== 'number' ||
            typeof bounds.minZ !== 'number' || typeof bounds.maxZ !== 'number') {
            console.warn('[noa] Invalid bounds returned from loader.getWorldBounds()');
            return
        }

        var chunkSize = bounds.chunkSize || world._chunkSize;
        var buffer = (options && typeof options.buffer === 'number') ? options.buffer : 1;

        // Default spawn to origin if not provided
        var spawnX = (spawnPosition && spawnPosition[0]) || 0;
        var spawnY = (spawnPosition && spawnPosition[1]) || 0;
        var spawnZ = (spawnPosition && spawnPosition[2]) || 0;

        // Convert spawn position to chunk indices
        var spawnChunkX = Math.floor(spawnX / chunkSize);
        var spawnChunkY = Math.floor(spawnY / chunkSize);
        var spawnChunkZ = Math.floor(spawnZ / chunkSize);

        // Calculate distance from spawn chunk to each bound of the baked world
        var distToMinX = Math.abs(spawnChunkX - bounds.minX);
        var distToMaxX = Math.abs(spawnChunkX - bounds.maxX);
        var distToMinZ = Math.abs(spawnChunkZ - bounds.minZ);
        var distToMaxZ = Math.abs(spawnChunkZ - bounds.maxZ);
        var distToMinY = Math.abs(spawnChunkY - bounds.minY);
        var distToMaxY = Math.abs(spawnChunkY - bounds.maxY);

        // Calculate diagonal distance to corners (spherical loading needs radius to cover rectangular bounds)
        // Using sqrt(maxX² + maxZ²) ensures the loading sphere encompasses all corners of the world
        var maxDistX = Math.max(distToMinX, distToMaxX);
        var maxDistZ = Math.max(distToMinZ, distToMaxZ);
        var maxHoriz = Math.ceil(Math.sqrt(maxDistX * maxDistX + maxDistZ * maxDistZ));
        var maxVert = Math.max(distToMinY, distToMaxY);

        // Add buffer for smoother chunk loading when player moves around
        maxHoriz = maxHoriz + buffer;
        maxVert = maxVert + buffer;

        // Ensure minimum distance of 1 chunk to always load something
        maxHoriz = Math.max(1, maxHoriz);
        maxVert = Math.max(1, maxVert);

        // Warn if distances are unusually large (potential memory issue)
        if (maxHoriz > 20 || maxVert > 10) {
            console.warn('[noa] Large chunk distances configured (add=[' + maxHoriz + ',' + maxVert + ']). ' +
                'This may use significant memory. Consider spawning closer to center of baked world.');
        }

        // Set distances with +1 buffer for remove distance (hysteresis)
        this.setAddRemoveDistance([maxHoriz, maxVert], [maxHoriz + 1, maxVert + 1]);

        console.log('[noa] Auto-configured chunk distances from baked world: ' +
            'spawn chunk=[' + spawnChunkX + ',' + spawnChunkY + ',' + spawnChunkZ + '], ' +
            'add=[' + maxHoriz + ',' + maxVert + '], ' +
            'remove=[' + (maxHoriz + 1) + ',' + (maxVert + 1) + ']');
    }

    /**
     * Check if chunk indices are within world bounds.
     * @param {number} i - Chunk X index
     * @param {number} j - Chunk Y index
     * @param {number} k - Chunk Z index
     * @returns {boolean}
     */
    isInWorldBounds(i, j, k) {
        var bounds = this.world._worldBounds;
        if (!bounds) return true
        return (i >= bounds.minX && i <= bounds.maxX &&
                j >= bounds.minY && j <= bounds.maxY &&
                k >= bounds.minZ && k <= bounds.maxZ)
    }
}

/**
 * Utility functions and default options for World module.
 * @module worldUtils
 */

/**
 * @typedef {object} WorldOptions
 * @property {number} [chunkSize=24]
 * @property {number|[number,number]} [chunkAddDistance=[2,2]] - [horizontal, vertical] or single number
 * @property {number|[number,number]} [chunkRemoveDistance=[3,3]] - [horizontal, vertical] or single number
 * @property {boolean} [worldGenWhilePaused=false]
 * @property {boolean} [manuallyControlChunkLoading=false]
 */

/** @type {WorldOptions} */
var defaultOptions$1 = {
    chunkSize: 24,
    chunkAddDistance: [2, 2],           // [horizontal, vertical]
    chunkRemoveDistance: [3, 3],        // [horizontal, vertical]
    worldGenWhilePaused: false,
    manuallyControlChunkLoading: false,
};


/**
 * Chunk sorting distance function type
 * @callback ChunkSortingDistFn
 * @param {number} i - Chunk i offset from player
 * @param {number} j - Chunk j offset from player
 * @param {number} k - Chunk k offset from player
 * @returns {number} Distance value for sorting
 */

/**
 * Default distance function for chunk sorting - squared Euclidean distance
 * @type {ChunkSortingDistFn}
 */
var defaultSortDistance = (i, j, k) => (i * i) + (j * j) + (k * k);


/**
 * Sorts a queue DESCENDING by distance from player position, unless reversed.
 * @param {import('./index.js').World} world
 * @param {import('../util.js').LocationQueue} queue
 * @param {number} [pi] - Player chunk i index (defaults to current position)
 * @param {number} [pj] - Player chunk j index
 * @param {number} [pk] - Player chunk k index
 * @param {boolean} [reverse=false] - Sort ascending instead of descending
 */
function sortQueueByDistanceFrom(world, queue, pi, pj, pk, reverse = false) {
    var distFn = world.chunkSortingDistFn || defaultSortDistance;
    var localDist = (i, j, k) => distFn(pi - i, pj - j, pk - k);
    if (pi === undefined) {
        var pos = world.noa.entities.getPosition(world.noa.playerEntity);
        var indexes = world._coordsToChunkIndexes(pos[0], pos[1], pos[2]);
        pi = indexes[0];
        pj = indexes[1];
        pk = indexes[2];
    }
    queue.sortByDistance(localDist, reverse);
}

/**
 * Chunk queue management and processing.
 * Handles scanning for chunks to add/remove and processing work queues.
 * @module worldQueues
 */



/**
 * Handles chunk queue management and processing.
 */
class WorldQueues {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world;

        // Module-level state for incremental scanning
        /** @internal */
        this._removeCheckIndex = 0;
        /** @internal */
        this._meshCheckIndex = 0;
    }

    /**
     * Get chunk indexes of where the player is.
     * @returns {[number, number, number]}
     */
    getPlayerChunkIndexes() {
        var world = this.world;
        var pos = world.noa.entities.getPosition(world.noa.playerEntity);
        return world._coordsToChunkIndexes(pos[0], pos[1], pos[2])
    }

    /**
     * Get chunk object by world coordinates.
     * @internal
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {import('../chunk.js').Chunk|null}
     */
    getChunkByCoords(x = 0, y = 0, z = 0) {
        // let internal modules request a chunk object
        var world = this.world;
        var [i, j, k] = world._coordsToChunkIndexes(x, y, z);
        return world._storage.getChunkByIndexes(i, j, k)
    }

    /**
     * Internal accessor for chunks to queue themselves for remeshing
     * after their data changes.
     * @param {import('../chunk.js').Chunk} chunk
     */
    queueChunkForRemesh(chunk) {
        this.possiblyQueueChunkForMeshing(chunk);
    }

    /**
     * Gradually scan neighborhood chunk locs; add missing ones to "toRequest".
     * @param {number} ci - Player chunk X index
     * @param {number} cj - Player chunk Y index
     * @param {number} ck - Player chunk Z index
     */
    findChunksToRequest(ci, cj, ck) {
        var world = this.world;
        var toRequest = world._chunksToRequest;
        var numQueued = toRequest.count();
        var maxQueued = 50;
        if (numQueued >= maxQueued) return

        // handle changes to chunk sorting function
        var sortDistFn = world.chunkSortingDistFn || defaultSortDistance;
        if (sortDistFn !== world._prevSortingFn) {
            sortQueueByDistanceFrom(world, world._chunksSortedLocs, 0, 0, 0, true);
            world._prevSortingFn = sortDistFn;
        }

        // consume the pre-sorted positions array, checking each loc and
        // its reflections for locations that need to be added to request queue
        var locsArr = world._chunksSortedLocs.arr;
        var ix = world._chunkAddSearchFrom;
        var maxIter = Math.min(20, locsArr.length / 10);
        for (var ct = 0; ct < maxIter; ct++) {
            var [di, dj, dk] = locsArr[ix++ % locsArr.length];
            this._checkReflectedLocations(ci, cj, ck, di, dj, dk);
            if (toRequest.count() >= maxQueued) break
        }

        // only advance start point if nothing is invalidated,
        // so that nearby chunks stay at high priority in that case
        if (world._chunksInvalidated.isEmpty()) {
            world._chunkAddSearchFrom = ix % locsArr.length;
        }

        // queue should be mostly sorted, but may not have been empty
        sortQueueByDistanceFrom(world, toRequest, ci, cj, ck, false);
    }

    /**
     * Helpers for checking whether to add a location, and reflections of it.
     * @param {number} ci
     * @param {number} cj
     * @param {number} ck
     * @param {number} i
     * @param {number} j
     * @param {number} k
     */
    _checkReflectedLocations(ci, cj, ck, i, j, k) {
        this._checkOneLocation(ci + i, cj + j, ck + k);
        if (i !== k) this._checkOneLocation(ci + k, cj + j, ck + i);
        if (i > 0) this._checkReflectedLocations(ci, cj, ck, -i, j, k);
        if (j > 0) this._checkReflectedLocations(ci, cj, ck, i, -j, k);
        if (k > 0) this._checkReflectedLocations(ci, cj, ck, i, j, -k);
    }

    /**
     * Finally, the logic for each reflected location checked.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     */
    _checkOneLocation(i, j, k) {
        var world = this.world;
        if (world._chunksKnown.includes(i, j, k)) return
        // Check world bounds - skip chunks outside finite world
        var bounds = world._worldBounds;
        if (bounds) {
            if (i < bounds.minX || i > bounds.maxX ||
                j < bounds.minY || j > bounds.maxY ||
                k < bounds.minZ || k > bounds.maxZ) return
        }
        world._chunksKnown.add(i, j, k);
        world._chunksToRequest.add(i, j, k, true);
    }

    /**
     * Incrementally scan known chunks for any that are no longer in range.
     * Assume that the order they're removed in isn't very important.
     * @param {number} ci - Player chunk X index
     * @param {number} cj - Player chunk Y index
     * @param {number} ck - Player chunk Z index
     */
    findDistantChunksToRemove(ci, cj, ck) {
        var world = this.world;
        var distCheck = world._remDistanceFn;
        var toRemove = world._chunksToRemove;
        var numQueued = toRemove.count() + world._chunksInvalidated.count();
        var maxQueued = 50;
        if (numQueued >= maxQueued) return

        var knownArr = world._chunksKnown.arr;
        if (knownArr.length === 0) return
        var maxIter = Math.min(100, knownArr.length / 10);
        var found = false;
        for (var ct = 0; ct < maxIter; ct++) {
            var [i, j, k] = knownArr[this._removeCheckIndex++ % knownArr.length];
            if (toRemove.includes(i, j, k)) continue
            if (distCheck(i - ci, j - cj, k - ck)) continue
            // flag chunk for removal and remove it from work queues
            world._chunksToRemove.add(i, j, k);
            world._chunksToRequest.remove(i, j, k);
            world._chunksToMesh.remove(i, j, k);
            world._chunksToMeshFirst.remove(i, j, k);
            found = true;
            numQueued++;
            if (numQueued > maxQueued) break
        }
        this._removeCheckIndex = this._removeCheckIndex % knownArr.length;
        if (found) sortQueueByDistanceFrom(world, toRemove, ci, cj, ck);
    }

    /**
     * Incrementally look for chunks that could be re-meshed.
     */
    findChunksToMesh() {
        var world = this.world;
        var maxQueued = 10;
        var numQueued = world._chunksToMesh.count() + world._chunksToMeshFirst.count();
        if (numQueued > maxQueued) return
        var knownArr = world._chunksKnown.arr;
        if (knownArr.length === 0) return
        var maxIter = Math.min(50, knownArr.length / 10);
        for (var ct = 0; ct < maxIter; ct++) {
            var [i, j, k] = knownArr[this._meshCheckIndex++ % knownArr.length];
            var chunk = world._storage.getChunkByIndexes(i, j, k);
            if (!chunk) continue
            var res = this.possiblyQueueChunkForMeshing(chunk);
            if (res) numQueued++;
            if (numQueued > maxQueued) break
        }
        this._meshCheckIndex %= knownArr.length;
    }

    /**
     * Invalidate chunks overlapping the given AABB.
     * @param {{ base: number[], max: number[] }} box
     */
    invalidateChunksInBox(box) {
        var world = this.world;
        var min = world._coordsToChunkIndexes(box.base[0], box.base[1], box.base[2]);
        var max = world._coordsToChunkIndexes(box.max[0], box.max[1], box.max[2]);
        for (var i = 0; i < 3; i++) {
            if (!Number.isFinite(box.base[i])) min[i] = box.base[i];
            if (!Number.isFinite(box.max[i])) max[i] = box.max[i];
        }
        world._chunksKnown.forEach(loc => {
            var [i, j, k] = loc;
            if (i < min[0] || i >= max[0]) return
            if (j < min[1] || j >= max[1]) return
            if (k < min[2] || k >= max[2]) return
            world._chunksInvalidated.add(i, j, k);
            world._chunksToRemove.remove(i, j, k);
            world._chunksToRequest.remove(i, j, k);
            world._chunksToMesh.remove(i, j, k);
            world._chunksToMeshFirst.remove(i, j, k);
        });
    }

    /**
     * When current world changes - empty work queues and mark all for removal.
     */
    markAllChunksInvalid() {
        var world = this.world;

        // Cancel all pending async chunk requests
        world._chunkGen.cancelAllAsyncRequests();

        world._chunksInvalidated.copyFrom(world._chunksKnown);
        world._chunksToRemove.empty();
        world._chunksToRequest.empty();
        world._chunksToMesh.empty();
        world._chunksToMeshFirst.empty();
        sortQueueByDistanceFrom(world, world._chunksInvalidated);
    }

    /**
     * Run through chunk tracking queues looking for work to do next.
     * @returns {boolean} - True if queue is empty
     */
    processRequestQueue() {
        var world = this.world;
        var toRequest = world._chunksToRequest;
        if (toRequest.isEmpty()) return true
        // skip if too many outstanding requests, or if meshing queue is full
        var pending = world._chunksPending.count();
        var toMesh = world._chunksToMesh.count();
        if (pending >= world.maxChunksPendingCreation) return true
        if (toMesh >= world.maxChunksPendingMeshing) return true
        var [i, j, k] = toRequest.pop();
        world._lifecycle.requestNewChunk(i, j, k);
        return toRequest.isEmpty()
    }

    /**
     * Process the remove queue.
     * @returns {boolean} - True if queue is empty
     */
    processRemoveQueue() {
        var world = this.world;
        var queue = world._chunksInvalidated;
        if (queue.isEmpty()) queue = world._chunksToRemove;
        if (queue.isEmpty()) return true
        var [i, j, k] = queue.pop();
        world._lifecycle.removeChunk(i, j, k);
        return (queue.isEmpty())
    }

    /**
     * Process chunks waiting to be meshed.
     * @param {boolean} firstOnly - Only process high-priority queue
     * @returns {boolean} - True if done (for breaking out of processing loop)
     */
    processMeshingQueue(firstOnly) {
        var world = this.world;
        var queue = world._chunksToMeshFirst;
        if (queue.isEmpty() && !firstOnly) queue = world._chunksToMesh;
        if (queue.isEmpty()) return true
        var [i, j, k] = queue.pop();
        if (world._chunksToRemove.includes(i, j, k)) return false
        var chunk = world._storage.getChunkByIndexes(i, j, k);
        if (chunk) world._lifecycle.doChunkRemesh(chunk);
        return false
    }

    /**
     * Check if chunk should be queued for meshing and queue if so.
     * @param {import('../chunk.js').Chunk} chunk
     * @returns {boolean} - True if chunk was queued
     */
    possiblyQueueChunkForMeshing(chunk) {
        var world = this.world;
        if (!(chunk._terrainDirty || chunk._objectsDirty)) return false
        if (chunk._neighborCount < world.minNeighborsToMesh) return false
        if (world._chunksToMesh.includes(chunk.i, chunk.j, chunk.k)) return false
        if (world._chunksToMeshFirst.includes(chunk.i, chunk.j, chunk.k)) return false
        var queue = (chunk._neighborCount === 26) ?
            world._chunksToMeshFirst : world._chunksToMesh;
        queue.add(chunk.i, chunk.j, chunk.k);
        world._sortMeshQueueEvery++;
        if (world._sortMeshQueueEvery > 20) {
            sortQueueByDistanceFrom(world, queue);
            world._sortMeshQueueEvery = 0;
        }
        return true
    }
}

/**
 * Debug reporting and profiling utilities for World module.
 * @module worldDebug
 */


// Profiling configuration - set > 0 to enable
var PROFILE_EVERY = 0;          // ticks

/** Profile hook for world tick timing */
var profile_hook = makeProfileHook(PROFILE_EVERY, 'world ticks:');

/**
 * Creates a profiling hook for chunk queue flow monitoring.
 * @param {number} every - Log every N ticks (0 to disable)
 * @returns {function(string, import('./index.js').World=): void}
 */
function createProfileQueuesHook(every) {
    return () => { }
}

/** Profile hook for chunk queue flow monitoring */
var profile_queues_hook = createProfileQueuesHook();


/**
 * Debug reporting class for World diagnostics.
 */
class WorldDebug {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world;
    }

    /** @internal */
    report() {
        var world = this.world;
        console.log('World report - playerChunkLoaded: ', world.playerChunkLoaded);
        this._report('  known:     ', world._chunksKnown.arr, true);
        this._report('  to request:', world._chunksToRequest.arr, false);
        this._report('  to remove: ', world._chunksToRemove.arr, false);
        this._report('  invalid:   ', world._chunksInvalidated.arr, false);
        this._report('  creating:  ', world._chunksPending.arr, false);
        this._report('  to mesh:   ', world._chunksToMesh.arr, false);
        this._report('  mesh 1st:  ', world._chunksToMeshFirst.arr, false);
    }

    /**
     * @param {string} name
     * @param {[number, number, number][]} arr
     * @param {boolean} ext
     */
    _report(name, arr, ext) {
        var world = this.world;
        var full = 0,
            empty = 0,
            exist = 0,
            surrounded = 0,
            remeshes = /** @type {number[]} */ ([]);
        arr.forEach(loc => {
            var chunk = world._storage.getChunkByIndexes(loc[0], loc[1], loc[2]);
            if (!chunk) return
            exist++;
            remeshes.push(chunk._timesMeshed);
            if (chunk._isFull) full++;
            if (chunk._isEmpty) empty++;
            if (chunk._neighborCount === 26) surrounded++;
        });
        var out = arr.length.toString().padEnd(8);
        out += ('exist: ' + exist).padEnd(12);
        out += ('full: ' + full).padEnd(12);
        out += ('empty: ' + empty).padEnd(12);
        out += ('surr: ' + surrounded).padEnd(12);
        if (ext) {
            var sum = remeshes.reduce((acc, val) => acc + val, 0);
            var max = remeshes.reduce((acc, val) => Math.max(acc, val), 0);
            var min = remeshes.reduce((acc, val) => Math.min(acc, val), 0);
            out += 'times meshed: avg ' + (sum / exist).toFixed(2);
            out += '  max ' + max;
            out += '  min ' + min;
        }
        console.log(name, out);
    }
}

/**
 * Chunk lifecycle management - creation, data setting, removal, meshing.
 * @module worldLifecycle
 */


/** Error message for manual chunk loading API */
var manualErr = 'Set `noa.world.manuallyControlChunkLoading` if you need this API';


/**
 * Handles chunk lifecycle operations.
 */
class WorldLifecycle {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world;
    }

    /**
     * Tells noa to discard voxel data within a given `AABB` (e.g. because
     * the game client received updated data from a server).
     * The engine will mark all affected chunks for removal, and will later emit
     * new `worldDataNeeded` events (if the chunk is still in draw range).
     * @param {{ base: number[], max: number[] }} box
     */
    invalidateVoxelsInAABB(box) {
        this.world._queues.invalidateChunksInBox(box);
    }

    /**
     * When manually controlling chunk loading, tells the engine that the
     * chunk containing the specified (x,y,z) needs to be created and loaded.
     * > Note: throws unless `noa.world.manuallyControlChunkLoading` is set.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyLoadChunk(x = 0, y = 0, z = 0) {
        var world = this.world;
        if (!world.manuallyControlChunkLoading) throw manualErr
        var [i, j, k] = world._coordsToChunkIndexes(x, y, z);
        world._chunksKnown.add(i, j, k);
        world._chunksToRequest.add(i, j, k);
    }

    /**
     * When manually controlling chunk loading, tells the engine that the
     * chunk containing the specified (x,y,z) needs to be unloaded and disposed.
     * > Note: throws unless `noa.world.manuallyControlChunkLoading` is set.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyUnloadChunk(x = 0, y = 0, z = 0) {
        var world = this.world;
        if (!world.manuallyControlChunkLoading) throw manualErr
        var [i, j, k] = world._coordsToChunkIndexes(x, y, z);
        world._chunksToRemove.add(i, j, k);
        world._chunksToMesh.remove(i, j, k);
        world._chunksToRequest.remove(i, j, k);
        world._chunksToMeshFirst.remove(i, j, k);
    }

    /**
     * Returns whether the initial chunk load has completed.
     * This becomes true when all initially requested chunks are loaded and meshed
     * (when both pending and mesh queues are empty for the first time).
     * @returns {boolean}
     */
    isInitialLoadComplete() {
        return this.world._initialLoadComplete
    }

    /**
     * Clients should call this after creating a chunk's worth of data (as an ndarray).
     * If userData is passed in it will be attached to the chunk.
     * @param {string} id - the string specified when the chunk was requested
     * @param {*} array - an ndarray of voxel data
     * @param {*} [userData=null] - an arbitrary value for game client use
     * @param {number} [fillVoxelID=-1] - specify a voxel ID here if you want to signify that
     * the entire chunk should be solidly filled with that voxel (e.g. `0` for air).
     * If you do this, the voxel array data will be overwritten and the engine will
     * take a fast path through some initialization steps.
     */
    setChunkData(id, array, userData = null, fillVoxelID = -1) {
        this.setChunkDataInternal(id, array, userData, fillVoxelID);
    }

    /**
     * Create chunk object and request voxel data from client.
     * @param {number} i - Chunk X index
     * @param {number} j - Chunk Y index
     * @param {number} k - Chunk Z index
     */
    requestNewChunk(i, j, k) {
        var world = this.world;
        var size = world._chunkSize;
        var worldName = world.noa.worldName;
        var requestID = [i, j, k, worldName].join('|');
        var x = i * size;
        var y = j * size;
        var z = k * size;
        world._chunksPending.add(i, j, k);

        // If async generator is registered, use it instead of events
        // Async generators provide their own voxelData, so we don't pre-allocate
        if (world._chunkGen.hasAsyncGenerator()) {
            world._chunkGen.requestNewChunkAsync(requestID, x, y, z, worldName);
        } else {
            // Event-based API needs pre-allocated array for client to fill
            var dataArr = Chunk._createVoxelArray(world._chunkSize);
            world.emit('worldDataNeeded', requestID, dataArr, x, y, z, worldName);
        }
        profile_queues_hook('request');
    }

    /**
     * Called when client sets a chunk's voxel data.
     * If userData is passed in it will be attached to the chunk.
     * @param {string} reqID
     * @param {*} array
     * @param {*} userData
     * @param {number} fillVoxelID
     */
    setChunkDataInternal(reqID, array, userData, fillVoxelID) {
        var world = this.world;
        var arr = reqID.split('|');
        var i = parseInt(arr.shift());
        var j = parseInt(arr.shift());
        var k = parseInt(arr.shift());
        var worldName = arr.join('|');
        world._chunksPending.remove(i, j, k);
        // discard data if it's for a world that's no longer current
        if (worldName !== world.noa.worldName) return
        // discard if chunk is no longer needed
        if (!world._chunksKnown.includes(i, j, k)) return
        if (world._chunksToRemove.includes(i, j, k)) return

        var chunk = world._storage.getChunkByIndexes(i, j, k);
        if (!chunk) {
            // if chunk doesn't exist, create and init
            var size = world._chunkSize;
            chunk = new Chunk(world.noa, reqID, i, j, k, size, array, fillVoxelID);
            world._storage.storeChunkByIndexes(i, j, k, chunk);
            chunk.userData = userData;
            world.noa.rendering.prepareChunkForRendering(chunk);
            world.emit('chunkAdded', chunk);
        } else {
            // else we're updating data for an existing chunk
            chunk._updateVoxelArray(array, fillVoxelID);
        }
        // chunk can now be meshed, and ping neighbors
        world._queues.possiblyQueueChunkForMeshing(chunk);
        this.updateNeighborsOfChunk(i, j, k, chunk);

        profile_queues_hook('receive');
    }

    /**
     * Remove a chunk that wound up in the remove queue.
     * @param {number} i - Chunk X index
     * @param {number} j - Chunk Y index
     * @param {number} k - Chunk Z index
     */
    removeChunk(i, j, k) {
        var world = this.world;
        var chunk = world._storage.getChunkByIndexes(i, j, k);

        // Cancel any pending async generation for this chunk
        var worldName = world.noa.worldName;
        var requestID = [i, j, k, worldName].join('|');
        world._chunkGen.cancelAsyncRequest(requestID);

        if (chunk) {
            world.emit('chunkBeingRemoved', chunk.requestID, chunk.voxels, chunk.userData);
            world.noa.rendering.disposeChunkForRendering(chunk);
            chunk.dispose();
            profile_queues_hook('dispose');
            this.updateNeighborsOfChunk(i, j, k, null);
        }

        world._storage.removeChunkByIndexes(i, j, k);
        world._chunksKnown.remove(i, j, k);
        world._chunksToMesh.remove(i, j, k);
        world._chunksToRemove.remove(i, j, k);
        world._chunksToMeshFirst.remove(i, j, k);
        world._chunksPending.remove(i, j, k);
    }

    /**
     * Remesh a chunk.
     * @param {import('../chunk.js').Chunk} chunk
     */
    doChunkRemesh(chunk) {
        var world = this.world;
        world._chunksToMesh.remove(chunk.i, chunk.j, chunk.k);
        world._chunksToMeshFirst.remove(chunk.i, chunk.j, chunk.k);
        chunk.updateMeshes();
        profile_queues_hook('mesh');
    }

    /**
     * Keep neighbor data updated when chunk is added or removed.
     * @param {number} ci - Chunk X index
     * @param {number} cj - Chunk Y index
     * @param {number} ck - Chunk Z index
     * @param {import('../chunk.js').Chunk|null} chunk - The chunk or null if removed
     */
    updateNeighborsOfChunk(ci, cj, ck, chunk) {
        var world = this.world;
        var terrainChanged = (!chunk) || (chunk && !chunk._isEmpty);
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                for (var k = -1; k <= 1; k++) {
                    if ((i | j | k) === 0) continue
                    var neighbor = world._storage.getChunkByIndexes(ci + i, cj + j, ck + k);
                    if (!neighbor) continue
                    // flag neighbor, assume terrain needs remeshing
                    if (terrainChanged) neighbor._terrainDirty = true;
                    // update neighbor counts and references, both ways
                    if (chunk && !chunk._neighbors.get(i, j, k)) {
                        chunk._neighborCount++;
                        chunk._neighbors.set(i, j, k, neighbor);
                    }
                    var nabRef = neighbor._neighbors.get(-i, -j, -k);
                    if (chunk && !nabRef) {
                        neighbor._neighborCount++;
                        neighbor._neighbors.set(-i, -j, -k, chunk);
                        // immediately queue neighbor if it's surrounded
                        if (neighbor._neighborCount === 26) {
                            world._queues.possiblyQueueChunkForMeshing(neighbor);
                        }
                    }
                    if (!chunk && nabRef) {
                        neighbor._neighborCount--;
                        neighbor._neighbors.set(-i, -j, -k, null);
                    }
                }
            }
        }
    }
}

/**
 * World module - manages world data, chunks, voxels.
 * @module world
 */



/**
 * `noa.world` - manages world data, chunks, voxels.
 *
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * ```js
 * var defaultOptions = {
 *   chunkSize: 24,
 *   chunkAddDistance: [2, 2],           // [horizontal, vertical]
 *   chunkRemoveDistance: [3, 3],        // [horizontal, vertical]
 *   worldGenWhilePaused: false,
 *   manuallyControlChunkLoading: false,
 * }
 * ```
 *
 * **Events:**
 *  + `worldDataNeeded = (requestID, dataArr, x, y, z, worldName)`
 *    Alerts client that a new chunk of world data is needed.
 *  + `playerEnteredChunk => (i, j, k)`
 *    Fires when player enters a new chunk
 *  + `chunkAdded => (chunk)`
 *    Fires after a new chunk object is added to the world
 *  + `chunkBeingRemoved = (requestID, dataArr, userData)`
 *    Fires before a chunk is removed from world
 *  + `initialLoadComplete => ()`
 *    Fires once when all initially requested chunks are loaded and meshed
 */
class World extends EventEmitter {

    /**
     * @internal
     * @param {import('../../index.js').Engine} noa
     * @param {import('./worldUtils.js').WorldOptions} opts
     */
    constructor(noa, opts) {
        super();
        opts = Object.assign({}, defaultOptions$1, opts);

        /** @internal */
        this.noa = noa;

        /** @internal */
        this.playerChunkLoaded = false;

        /**
         * Whether the initial chunk load has completed.
         * Becomes true when all initially requested chunks are loaded and meshed.
         * @type {boolean}
         */
        this._initialLoadComplete = false;

        /** @internal */
        this.Chunk = Chunk; // expose this class for ...reasons

        /**
         * Game clients should set this if they need to manually control
         * which chunks to load and unload. When set, client should call
         * `noa.world.manuallyLoadChunk` / `manuallyUnloadChunk` as needed.
         */
        this.manuallyControlChunkLoading = !!opts.manuallyControlChunkLoading;

        /**
         * Defining this function sets a custom order in which to create chunks.
         * The function should look like:
         * ```js
         *   (i, j, k) => 1 // return a smaller number for chunks to process first
         * ```
         * @type {import('./worldUtils.js').ChunkSortingDistFn|null}
         */
        this.chunkSortingDistFn = null;

        /**
         * Set this higher to cause chunks not to mesh until they have some neighbors.
         * Max legal value is 26 (each chunk will mesh only when all neighbors are present)
         */
        this.minNeighborsToMesh = 6;

        /** When true, worldgen queues will keep running if engine is paused. */
        this.worldGenWhilePaused = !!opts.worldGenWhilePaused;

        /** Limit the size of internal chunk processing queues
         * @type {number}
         */
        this.maxChunksPendingCreation = 50;

        /** Limit the size of internal chunk processing queues
         * @type {number}
         */
        this.maxChunksPendingMeshing = 50;

        /** Cutoff (in ms) of time spent each **tick**
         * @type {number}
         */
        this.maxProcessingPerTick = 5;

        /** Cutoff (in ms) of time spent each **render**
         * @type {number}
         */
        this.maxProcessingPerRender = 3;

        // Internal state

        /** @internal */
        this._chunkSize = opts.chunkSize;
        /** @internal */
        this._chunkAddDistance = [2, 2];
        /** @internal */
        this._chunkRemoveDistance = [3, 3];
        /** @internal */
        this._addDistanceFn = null;
        /** @internal */
        this._remDistanceFn = null;
        /** @internal */
        this._prevWorldName = '';
        /** @internal */
        this._prevPlayerChunkHash = 0;
        /** @internal */
        this._chunkAddSearchFrom = 0;
        /** @internal */
        this._prevSortingFn = null;
        /** @internal */
        this._sortMeshQueueEvery = 0;
        /** @internal World bounds in chunk indices - null means infinite world
         * @type {import('./worldBounds.js').WorldBoundsConfig|null} */
        this._worldBounds = null;

        // These will be initialized by WorldCore
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksKnown = null;
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksToRequest = null;
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksInvalidated = null;
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksToRemove = null;
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksPending = null;
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksToMesh = null;
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksToMeshFirst = null;
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksSortedLocs = null;
        /** @internal @type {import('../util.js').ChunkStorage} */
        this._storage = null;
        /** @internal @type {function(number, number, number): [number, number, number]} */
        this._coordsToChunkIndexes = null;
        /** @internal @type {function(number, number, number): [number, number, number]} */
        this._coordsToChunkLocals = null;
        /** @internal @type {number} - bit shift for power-of-two chunk sizes */
        this._coordShiftBits = 0;
        /** @internal @type {number} - bit mask for power-of-two chunk sizes */
        this._coordMask = 0;

        // Initialize sub-modules
        /** @internal */
        this._core = new WorldCore(this, opts);
        /** @internal */
        this._voxels = new WorldVoxels(this);
        /** @internal */
        this._chunkGen = new WorldChunkGen(this);
        /** @internal */
        this._bounds = new WorldBounds(this);
        /** @internal */
        this._queues = new WorldQueues(this);
        /** @internal */
        this._lifecycle = new WorldLifecycle(this);
        /** @internal */
        this._debug = new WorldDebug(this);

        // Apply initial distances (after queues are initialized)
        this.setAddRemoveDistance(opts.chunkAddDistance, opts.chunkRemoveDistance);
    }


    // ============ VOXEL API ============

    /**
     * Get the block ID at the given world coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {number}
     */
    getBlockID(x, y, z) { return this._voxels.getBlockID(x, y, z) }

    /**
     * Get whether the block at the given coordinates is solid.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockSolidity(x, y, z) { return this._voxels.getBlockSolidity(x, y, z) }

    /**
     * Get the opacity of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockOpacity(x, y, z) { return this._voxels.getBlockOpacity(x, y, z) }

    /**
     * Get the fluidity of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockFluidity(x, y, z) { return this._voxels.getBlockFluidity(x, y, z) }

    /**
     * Get the properties object of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {object}
     */
    getBlockProperties(x, y, z) { return this._voxels.getBlockProperties(x, y, z) }

    /**
     * Set the block ID at the given world coordinates.
     * @param {number} [id=0]
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    setBlockID(id, x, y, z) { return this._voxels.setBlockID(id, x, y, z) }

    /**
     * Check if the given AABB is unobstructed (no solid blocks).
     * @param {{ base: number[], max: number[] }} box
     * @returns {boolean}
     */
    isBoxUnobstructed(box) { return this._voxels.isBoxUnobstructed(box) }


    // ============ CHUNK GENERATOR ============

    /**
     * Register an async chunk generator function.
     * @param {import('./worldChunkGen.js').ChunkGeneratorFunction} generatorFn
     */
    registerChunkGenerator(generatorFn) { return this._chunkGen.registerChunkGenerator(generatorFn) }


    // ============ BOUNDS & DISTANCE ============

    /**
     * Sets the distances within which to load new chunks, and beyond which to unload them.
     * @param {number | number[]} [addDist=2]
     * @param {number | number[]} [remDist=3]
     */
    setAddRemoveDistance(addDist, remDist) { return this._bounds.setAddRemoveDistance(addDist, remDist) }

    /**
     * Set finite world bounds in chunk indices.
     * @param {number|null|undefined} minX
     * @param {number} [maxX]
     * @param {number} [minY]
     * @param {number} [maxY]
     * @param {number} [minZ]
     * @param {number} [maxZ]
     */
    setWorldBounds(minX, maxX, minY, maxY, minZ, maxZ) { return this._bounds.setWorldBounds(minX, maxX, minY, maxY, minZ, maxZ) }

    /**
     * Automatically configure chunk load/unload distances based on a baked world's bounds.
     * @param {import('./worldBounds.js').BakedWorldLoader} loader
     * @param {[number, number, number]} [spawnPosition]
     * @param {object} [options]
     */
    setAddRemoveDistanceFromBakedWorld(loader, spawnPosition, options) { return this._bounds.setAddRemoveDistanceFromBakedWorld(loader, spawnPosition, options) }


    // ============ LIFECYCLE ============

    /**
     * Tells noa to discard voxel data within a given AABB.
     * @param {{ base: number[], max: number[] }} box
     */
    invalidateVoxelsInAABB(box) { return this._lifecycle.invalidateVoxelsInAABB(box) }

    /**
     * When manually controlling chunk loading, request a chunk to be loaded.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyLoadChunk(x, y, z) { return this._lifecycle.manuallyLoadChunk(x, y, z) }

    /**
     * When manually controlling chunk loading, request a chunk to be unloaded.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyUnloadChunk(x, y, z) { return this._lifecycle.manuallyUnloadChunk(x, y, z) }

    /**
     * Clients should call this after creating a chunk's worth of data.
     * @param {string} id
     * @param {*} array
     * @param {*} [userData=null]
     * @param {number} [fillVoxelID=-1]
     */
    setChunkData(id, array, userData, fillVoxelID) { return this._lifecycle.setChunkData(id, array, userData, fillVoxelID) }

    /**
     * Returns whether the initial chunk load has completed.
     * @returns {boolean}
     */
    isInitialLoadComplete() { return this._lifecycle.isInitialLoadComplete() }


    // ============ INTERNAL API ============

    /**
     * @internal
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {import('../chunk.js').Chunk|null}
     */
    _getChunkByCoords(x, y, z) { return this._queues.getChunkByCoords(x, y, z) }

    /**
     * @internal
     * @param {import('../chunk.js').Chunk} chunk
     */
    _queueChunkForRemesh(chunk) { return this._queues.queueChunkForRemesh(chunk) }


    // ============ DEBUG ============

    /** @internal */
    report() { return this._debug.report() }


    // ============ TICK/RENDER/DISPOSE ============

    /** @internal */
    tick() {
        var tickStartTime = performance.now();

        // get indexes of player's current chunk, and has it changed since last tick?
        var [ci, cj, ck] = this._queues.getPlayerChunkIndexes();
        var chunkLocHash = locationHasher(ci, cj, ck);
        var changedChunks = (chunkLocHash !== this._prevPlayerChunkHash);
        if (changedChunks) {
            this.emit('playerEnteredChunk', ci, cj, ck);
            this._prevPlayerChunkHash = chunkLocHash;
            this._chunkAddSearchFrom = 0;
        }

        // if world has changed, invalidate everything and ping
        // removals queue so that player's chunk gets loaded back quickly
        if (this._prevWorldName !== this.noa.worldName) {
            if (!this.manuallyControlChunkLoading) {
                this._queues.markAllChunksInvalid();
                this._chunkAddSearchFrom = 0;
                this._queues.processRemoveQueue();
            }
            this._prevWorldName = this.noa.worldName;
        }

        profile_hook('start');
        profile_queues_hook('start');

        // scan for chunks to add/remove (unless client handles manually)
        if (!this.manuallyControlChunkLoading) {
            this._queues.findDistantChunksToRemove(ci, cj, ck);
            profile_hook('remQueue');
            this._queues.findChunksToRequest(ci, cj, ck);
            profile_hook('addQueue');
        }

        // possibly scan for additions to meshing queue if it's empty
        this._queues.findChunksToMesh();

        // process (create or mesh) some chunks, up to max iteration time
        var t = performance.now();
        var t1 = tickStartTime + (this.maxProcessingPerTick || 0);
        if (t < t1) t1 = t + 1;
        var done1 = false;
        var done2 = false;
        var done3 = false;
        while (t < t1) {
            if (!done1) {
                done1 = this._queues.processRemoveQueue();
                profile_hook('removes');
            }
            if (!done2) {
                done2 = this._queues.processRequestQueue();
                profile_hook('requests');
            }
            if (!done3) {
                done3 = this._queues.processMeshingQueue(false);
                profile_hook('meshes');
            }
            if (done1 && done2 && done3) break
            t = performance.now();
        }

        // track whether the player's local chunk is loaded and ready or not
        var pChunk = this._storage.getChunkByIndexes(ci, cj, ck);
        this.playerChunkLoaded = !!pChunk;

        // check for initial load completion (all queues empty for first time)
        if (!this._initialLoadComplete) {
            var pendingEmpty = this._chunksPending.isEmpty();
            var toMeshEmpty = this._chunksToMesh.isEmpty();
            var toMeshFirstEmpty = this._chunksToMeshFirst.isEmpty();
            var hasLoadedChunks = !this._chunksKnown.isEmpty();

            if (pendingEmpty && toMeshEmpty && toMeshFirstEmpty && hasLoadedChunks) {
                this._initialLoadComplete = true;
                this.emit('initialLoadComplete');
            }
        }

        profile_queues_hook('end', this);
        profile_hook('end');
    }

    /** @internal */
    render() {
        // on render, quickly process the high-priority meshing queue
        // to help avoid flashes of background while neighboring chunks update
        var t = performance.now();
        var t1 = t + this.maxProcessingPerRender;
        while (t < t1) {
            var done = this._queues.processMeshingQueue(true);
            if (done) break
            t = performance.now();
        }
    }

    /** Dispose world resources and cancel pending async operations */
    dispose() {
        // Cancel all pending async chunk requests
        this._chunkGen.cancelAllAsyncRequests();

        // Clear all queues
        this._chunksKnown.empty();
        this._chunksToRequest.empty();
        this._chunksInvalidated.empty();
        this._chunksToRemove.empty();
        this._chunksPending.empty();
        this._chunksToMesh.empty();
        this._chunksToMeshFirst.empty();
        this._chunksSortedLocs.empty();

        // Reset initial load state for potential reuse
        this._initialLoadComplete = false;

        // Dispose all chunks
        var hash = this._storage.hash;
        for (var key in hash) {
            var chunk = hash[key];
            if (chunk && typeof chunk.dispose === 'function') {
                chunk.dispose();
            }
            delete hash[key];
        }

        this.removeAllListeners();
        this.noa = null;
    }
}

/**
 * Shadow instance tracking.
 * Manages Map of textId -> shadow data.
 */

/**
 * @typedef {object} ShadowData
 * @property {object} textHandle - Reference to text handle
 * @property {object} shadow - Babylon InstancedMesh
 * @property {object} opts - Shadow options
 * @property {number} width - Shadow width
 * @property {number} depth - Shadow depth
 * @property {number} centerOffsetX - X offset from mesh origin
 * @property {number} centerOffsetZ - Z offset from mesh origin
 */

class ShadowInstances {
    constructor() {
        /** @type {Map<number, ShadowData>} */
        this._instances = new Map();
    }

    /**
     * Get shadow data by text ID.
     * @param {number} textId
     * @returns {ShadowData|undefined}
     */
    get(textId) {
        return this._instances.get(textId)
    }

    /**
     * Check if shadow exists for text ID.
     * @param {number} textId
     * @returns {boolean}
     */
    has(textId) {
        return this._instances.has(textId)
    }

    /**
     * Set shadow data for text ID.
     * @param {number} textId
     * @param {ShadowData} data
     */
    set(textId, data) {
        this._instances.set(textId, data);
    }

    /**
     * Delete shadow data for text ID.
     * @param {number} textId
     * @returns {boolean}
     */
    delete(textId) {
        return this._instances.delete(textId)
    }

    /**
     * Get iterator over all entries.
     * @returns {IterableIterator<[number, ShadowData]>}
     */
    entries() {
        return this._instances.entries()
    }

    /**
     * Get iterator over all keys (text IDs).
     * @returns {IterableIterator<number>}
     */
    keys() {
        return this._instances.keys()
    }

    /**
     * Get number of shadows.
     * @returns {number}
     */
    get size() {
        return this._instances.size
    }

    /**
     * Clear all instances.
     */
    clear() {
        this._instances.clear();
    }

    /**
     * Iterate over entries with forEach.
     * @param {(value: ShadowData, key: number, map: Map<number, ShadowData>) => void} callback
     */
    forEach(callback) {
        this._instances.forEach(callback);
    }
}

/**
 * Shadow resource creation and management.
 * Creates shared disc mesh, material, and texture for text shadows.
 */

/**
 * @typedef {object} ShadowResourcesResult
 * @property {object} sourceMesh - Source disc mesh for instancing
 * @property {object} material - Shadow material
 * @property {object|null} texture - Radial opacity texture
 */

/**
 * Create all shadow resources.
 * @param {object} scene - Babylon scene
 * @param {object} rendering - noa.rendering reference
 * @param {number} opacity - Shadow opacity
 * @returns {ShadowResourcesResult}
 */
function createShadowResources(scene, rendering, opacity) {
    // Create source disc mesh
    var sourceMesh = discBuilder.CreateDisc('text_shadow_source', {
        radius: 0.5,
        tessellation: 16,
    }, scene);
    sourceMesh.rotation.x = Math.PI / 2;

    // Create shadow material
    var material = rendering.makeStandardMaterial('text_shadow_mat');
    material.diffuseColor.set(0, 0, 0);
    material.ambientColor.set(0, 0, 0);
    material.emissiveColor.set(0, 0, 0);
    material.specularColor.set(0, 0, 0);
    material.disableLighting = true;  // Prevent shadow reacting to scene ambient
    material.backFaceCulling = false;
    material.alpha = opacity;

    // Create radial texture for soft edges
    var texture = createShadowTexture(scene);
    if (texture) {
        texture.hasAlpha = true;
        material.opacityTexture = texture;
    }

    material.freeze();
    sourceMesh.material = material;

    // Fix Babylon.js 8 SubMesh.getBoundingInfo() issue
    fixBoundingInfo(sourceMesh);

    // Hide source mesh
    rendering.setMeshVisibility(sourceMesh, false);

    return { sourceMesh, material, texture }
}

/**
 * Create radial gradient texture for shadow soft edges.
 * @param {object} scene - Babylon scene
 * @returns {object|null}
 */
function createShadowTexture(scene) {
    try {
        var size = 128;
        var texture$1 = new dynamicTexture.DynamicTexture('text_shadow_texture', { width: size, height: size }, scene, false, texture.Texture.BILINEAR_SAMPLINGMODE);
        var ctx = texture$1.getContext();
        if (ctx) {
            var half = size / 2;
            var gradient = ctx.createRadialGradient(half, half, half * 0.2, half, half, half);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.clearRect(0, 0, size, size);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
            texture$1.update(false);
        }
        texture$1.wrapU = texture.Texture.CLAMP_ADDRESSMODE;
        texture$1.wrapV = texture.Texture.CLAMP_ADDRESSMODE;
        return texture$1
    } catch (err) {
        return null
    }
}

/**
 * Fix Babylon.js 8 SubMesh.getBoundingInfo() issue.
 * @param {object} mesh - Babylon mesh
 */
function fixBoundingInfo(mesh) {
    mesh.refreshBoundingInfo();
    var bi = mesh.getBoundingInfo();
    if (mesh.subMeshes && bi) {
        mesh.subMeshes.forEach(sm => {
            /** @type {any} */ (sm)._boundingInfo = bi;
        });
    }
}

/**
 * Dispose all shadow resources.
 * @param {object} rendering - noa.rendering reference
 * @param {object|null} sourceMesh
 * @param {object|null} material
 * @param {object|null} texture
 */
function disposeShadowResources(rendering, sourceMesh, material, texture) {
    if (sourceMesh) {
        rendering.removeMeshFromScene(sourceMesh);
        sourceMesh.dispose();
    }
    if (material) {
        material.dispose();
    }
    if (texture) {
        texture.dispose();
    }
}

/**
 * Update material opacity (unfreezes and refreezes).
 * @param {object} material - Shadow material
 * @param {number} opacity - New opacity value
 */
function updateMaterialOpacity(material, opacity) {
    if (!material) return
    material.unfreeze();
    material.alpha = opacity;
    material.freeze();
}

/**
 * Shadow measurement utilities.
 * Extracts dimensions from text mesh bounding box.
 */

/**
 * @typedef {object} MeshMetrics
 * @property {number} width - Shadow width
 * @property {number} depth - Shadow depth
 * @property {number} centerOffsetX - X offset from mesh origin to visual center
 * @property {number} centerOffsetZ - Z offset from mesh origin to visual center
 */

/**
 * Measure text mesh to get shadow dimensions.
 * @param {object} mesh - Babylon mesh
 * @returns {MeshMetrics}
 */
function measureTextMesh(mesh) {
    var width = 1;
    var depth = 0.3;
    var centerOffsetX = 0;
    var centerOffsetZ = 0;

    mesh.computeWorldMatrix(true);
    mesh.refreshBoundingInfo();
    var boundingInfo = mesh.getBoundingInfo();
    if (boundingInfo && boundingInfo.boundingBox) {
        var bb = boundingInfo.boundingBox;
        width = Math.max(0.5, bb.extendSize.x * 2);
        depth = Math.max(0.2, bb.extendSize.z * 2, width * 0.15);

        // Compute offset from mesh origin to visual center in SCENE coords
        // This is constant and doesn't change with rebase
        centerOffsetX = bb.centerWorld.x - mesh.position.x;
        centerOffsetZ = bb.centerWorld.z - mesh.position.z;
    }

    return { width, depth, centerOffsetX, centerOffsetZ }
}

/**
 * Per-frame shadow update logic.
 * Handles raycasting and shadow positioning.
 */

var down = glVec3.fromValues(0, -1, 0);

/**
 * Update all shadow positions for a frame.
 * @param {object} noa - noa engine reference
 * @param {import('./ShadowInstances').ShadowInstances} instances - Shadow instances
 * @returns {number[]} - List of text IDs to remove (disposed)
 */
function updateShadows(noa, instances) {
    var toRemove = [];

    for (var [id, data] of instances.entries()) {
        var textMesh = data.textHandle.mesh;
        if (!textMesh || data.textHandle._disposed) {
            toRemove.push(id);
            continue
        }

        // Use mesh.position (properly rebased) + stored center offset
        // This avoids centerWorld which has timing issues after rebase
        var pos = textMesh.position;
        var localX = pos.x + data.centerOffsetX;
        var localY = pos.y;
        var localZ = pos.z + data.centerOffsetZ;

        // Raycast down to find ground
        var pickPos = [localX, localY, localZ];
        var result = noa._localPick(pickPos, down, data.opts.maxDistance);

        if (!result) {
            data.shadow.setEnabled(false);
            continue
        }

        // Convert ground Y from world to local
        var localGroundY = result.position[1] - noa.worldOriginOffset[1];
        var height = localY - localGroundY;

        // Fade out when too high
        var heightFade = 1 - Math.min(height / data.opts.maxDistance, 1);
        if (heightFade < 0.05) {
            data.shadow.setEnabled(false);
            continue
        }

        // Position and scale shadow
        var blur = data.opts.blur;
        var scaleFactor = 0.75 + heightFade * 0.25;

        data.shadow.position.x = localX;
        data.shadow.position.y = localGroundY + 0.02 + blur * 0.01;
        data.shadow.position.z = localZ;

        data.shadow.scaling.x = data.width * (0.9 + blur * 0.6) * scaleFactor;
        data.shadow.scaling.z = data.depth * (0.5 + blur * 0.5) * scaleFactor;
        data.shadow.setEnabled(true);
    }

    return toRemove
}

/**
 * TextShadowManager - Simple shadow system for 3D text
 *
 * Follows the same pattern as the entity shadow component:
 * - Use mesh.position directly (already in local coords)
 * - Raycast down to find ground
 * - Position shadow at ground level
 * - No complex coordinate conversions
 */



/**
 * @typedef {object} TextShadowOptions
 * @property {boolean} [enabled=true] - Whether shadows are enabled
 * @property {number} [blur=0.5] - Shadow blur/softness (0-1)
 * @property {number} [opacity=0.4] - Shadow opacity (0-1)
 * @property {number} [maxDistance=10] - Max raycast distance to find ground
 */


/**
 * Manages shadows for text instances.
 */
class TextShadowManager {

    /**
     * @param {import('../../../index').Engine} noa
     */
    constructor(noa) {
        /** @internal */
        this.noa = noa;

        /** @internal - Source disc mesh for instancing */
        this._sourceMesh = null;

        /** @internal - Shared shadow material */
        this._shadowMat = null;

        /** @internal - Radial opacity texture */
        this._shadowTexture = null;

        /** @internal - Shadow instance tracking */
        this._instances = new ShadowInstances();

        /** @internal - Whether manager is initialized */
        this._initialized = false;

        /** Default shadow options */
        this.defaultOptions = {
            enabled: true,
            blur: 0.5,
            opacity: 0.4,
            maxDistance: 10,
        };
    }


    /**
     * Initialize the shadow manager (call after scene is ready)
     */
    initialize() {
        if (this._initialized) return
        this._initialized = true;

        var scene = this.noa.rendering.getScene();
        var resources = createShadowResources(scene, this.noa.rendering, this.defaultOptions.opacity);

        this._sourceMesh = resources.sourceMesh;
        this._shadowMat = resources.material;
        this._shadowTexture = resources.texture;
    }


    /**
     * Update default options
     * @param {Partial<TextShadowOptions>} opts
     */
    setDefaults(opts) {
        Object.assign(this.defaultOptions, opts);
        if (opts.opacity !== undefined) {
            updateMaterialOpacity(this._shadowMat, opts.opacity);
        }
    }


    /**
     * Create shadow for a text handle
     * @param {object} textHandle
     * @param {TextShadowOptions|boolean} [options]
     */
    createShadowsForText(textHandle, options = {}) {
        this._createOrUpdateShadow(textHandle, options);
    }


    /**
     * Re-measure/update the shadow for a text handle (e.g. when content changes)
     * @param {object} textHandle
     * @param {TextShadowOptions|boolean} [options]
     */
    refreshShadowsForText(textHandle, options = {}) {
        this._createOrUpdateShadow(textHandle, options);
    }


    /** @internal */
    _createOrUpdateShadow(textHandle, options) {
        if (!this._initialized) this.initialize();
        if (options === false) {
            this.removeShadows(textHandle._id);
            return
        }

        var opts = Object.assign({}, this.defaultOptions, options);
        if (!opts.enabled) {
            this.removeShadows(textHandle._id);
            return
        }

        var mesh = textHandle.mesh;
        if (!mesh) {
            this.removeShadows(textHandle._id);
            return
        }

        var metrics = measureTextMesh(mesh);
        var existing = this._instances.get(textHandle._id);
        if (existing) {
            existing.opts = opts;
            existing.width = metrics.width;
            existing.depth = metrics.depth;
            existing.centerOffsetX = metrics.centerOffsetX;
            existing.centerOffsetZ = metrics.centerOffsetZ;
            existing.textHandle = textHandle;
            return
        }

        // Create shadow instance
        var shadow = this._sourceMesh.createInstance('text_shadow_' + textHandle._id);
        shadow.setEnabled(false);
        this.noa.rendering.addMeshToScene(shadow);

        if (shadow.onDisposeObservable) {
            shadow.onDisposeObservable.add(() => {
                this._instances.delete(textHandle._id);
            });
        }

        // Fix Babylon.js 8 SubMesh issue
        fixBoundingInfo(shadow);

        this._instances.set(textHandle._id, {
            textHandle,
            shadow,
            opts,
            width: metrics.width,
            depth: metrics.depth,
            centerOffsetX: metrics.centerOffsetX,
            centerOffsetZ: metrics.centerOffsetZ,
        });
    }


    /**
     * Update all shadows (call each frame)
     */
    updateShadows() {
        if (!this._initialized) return

        var toRemove = updateShadows(this.noa, this._instances);

        // Cleanup disposed texts
        for (var i = 0; i < toRemove.length; i++) {
            this.removeShadows(toRemove[i]);
        }
    }


    /**
     * Remove shadows for a text instance
     * @param {number} textId
     */
    removeShadows(textId) {
        var data = this._instances.get(textId);
        if (!data) return

        if (data.shadow) {
            this.noa.rendering.removeMeshFromScene(data.shadow);
            data.shadow.dispose();
        }
        this._instances.delete(textId);
    }


    /**
     * Check if shadows exist for a text instance
     * @param {number} textId
     * @returns {boolean}
     */
    hasShadows(textId) {
        return this._instances.has(textId)
    }


    /**
     * @internal
     * Called by noa when world origin is rebased.
     * @param {number[]} delta
     */
    _rebaseOrigin(delta) {
        // No action needed - we use mesh.position directly which is
        // already rebased by the rendering system
    }


    /**
     * Dispose all shadows and cleanup
     */
    dispose() {
        for (var id of this._instances.keys()) {
            this.removeShadows(id);
        }
        this._instances.clear();

        disposeShadowResources(this.noa.rendering, this._sourceMesh, this._shadowMat, this._shadowTexture);
        this._sourceMesh = null;
        this._shadowMat = null;
        this._shadowTexture = null;
        this._initialized = false;
    }
}

/**
 * Light direction presets for camera-relative text lighting.
 * Azimuth: horizontal offset from camera forward (degrees)
 * Elevation: vertical offset from horizontal (degrees, negative = from above)
 */

var PRESETS = {
    'above-front': { azimuth: 0, elevation: -45 },      // Classic readability
    'headlamp': { azimuth: 0, elevation: 0 },           // From camera position
    'above-left': { azimuth: -45, elevation: -45 },     // Dramatic left shadows
    'above-right': { azimuth: 45, elevation: -45 },     // Dramatic right shadows
};

/**
 * Get available preset names including 'custom'
 * @returns {string[]}
 */
function getPresetNames() {
    return [...Object.keys(PRESETS), 'custom']
}

/**
 * Validate and normalize a preset name.
 * @param {string} preset - Preset name to validate
 * @returns {string} - Valid preset name (defaults to 'above-front' if invalid)
 */
function validatePreset(preset) {
    if (preset === 'custom') return preset
    if (PRESETS[preset]) return preset
    console.warn('[noa.text] Unknown preset:', preset, '- using above-front');
    return 'above-front'
}

/**
 * Get offsets for a preset or custom values.
 * @param {string} preset - Current preset name
 * @param {number} customAzimuth - Custom azimuth value
 * @param {number} customElevation - Custom elevation value
 * @returns {{azimuth: number, elevation: number}}
 */
function getOffsets(preset, customAzimuth, customElevation) {
    if (preset === 'custom') {
        return { azimuth: customAzimuth, elevation: customElevation }
    }
    return PRESETS[preset] || PRESETS['above-front']
}

/**
 * Factory for creating and configuring text lighting.
 */

/**
 * @typedef {object} LightConfig
 * @property {number} intensity - Light intensity
 * @property {Color3} diffuse - Diffuse color
 * @property {Color3} specular - Specular color
 * @property {number} ambientIntensity - Ambient light intensity
 * @property {Color3} ambientColor - Ambient light color
 */

/**
 * @typedef {object} CreatedLights
 * @property {DirectionalLight} textLight - Main directional light
 * @property {HemisphericLight} textAmbient - Ambient fill light
 */

/**
 * Create the text lighting setup.
 * @param {object} scene - Babylon scene
 * @param {LightConfig} config - Light configuration
 * @returns {CreatedLights}
 */
function createLights(scene, config) {
    // Create directional text light (camera-relative)
    var textLight = new directionalLight.DirectionalLight('textLight', new math_vector.Vector3(0, -1, 0.5), scene);
    textLight.intensity = config.intensity;
    textLight.diffuse = config.diffuse.clone();
    textLight.specular = config.specular.clone();
    // Initially, no meshes are included (empty array means light affects nothing)
    textLight.includedOnlyMeshes = [];

    // Create text-specific ambient/fill light
    var textAmbient = new hemisphericLight.HemisphericLight('textAmbient', new math_vector.Vector3(0, 1, 0), scene);
    textAmbient.intensity = config.ambientIntensity;
    textAmbient.diffuse = config.ambientColor.clone();
    textAmbient.groundColor = new math_color.Color3(0.1, 0.1, 0.1);
    textAmbient.specular = new math_color.Color3(0, 0, 0);
    textAmbient.includedOnlyMeshes = [];

    return { textLight, textAmbient }
}

/**
 * Dispose lights and clean up.
 * @param {DirectionalLight|null} textLight
 * @param {HemisphericLight|null} textAmbient
 */
function disposeLights(textLight, textAmbient) {
    if (textLight) {
        textLight.dispose();
    }
    if (textAmbient) {
        textAmbient.dispose();
    }
}

/**
 * Add mesh to light's includedOnlyMeshes array if not already present.
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 */
function addMeshToLight(light, mesh) {
    if (!light || !mesh || !light.includedOnlyMeshes) return
    if (light.includedOnlyMeshes.indexOf(mesh) === -1) {
        light.includedOnlyMeshes.push(mesh);
    }
}

/**
 * Remove mesh from light's includedOnlyMeshes array.
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 */
function removeMeshFromLight(light, mesh) {
    if (!light || !mesh || !light.includedOnlyMeshes) return
    var idx = light.includedOnlyMeshes.indexOf(mesh);
    if (idx >= 0) {
        light.includedOnlyMeshes.splice(idx, 1);
    }
}

/**
 * Registry for tracking text meshes and their LOD state.
 * Provides efficient mesh management for the lighting system.
 */

class MeshRegistry {
    constructor() {
        /** @type {Set<import('@babylonjs/core').Mesh>} */
        this._allMeshes = new Set();
        /** @type {WeakMap<import('@babylonjs/core').Mesh, boolean>} */
        this._lodState = new WeakMap();
    }

    /**
     * Check if mesh is registered.
     * @param {object} mesh
     * @returns {boolean}
     */
    has(mesh) {
        return this._allMeshes.has(mesh)
    }

    /**
     * Add a mesh to the registry.
     * @param {object} mesh
     */
    add(mesh) {
        if (mesh) {
            this._allMeshes.add(mesh);
        }
    }

    /**
     * Remove a mesh from the registry.
     * @param {object} mesh
     */
    remove(mesh) {
        if (mesh) {
            this._allMeshes.delete(mesh);
            this._lodState.delete(mesh);
        }
    }

    /**
     * Get the LOD state for a mesh (true = using text light).
     * @param {object} mesh
     * @returns {boolean}
     */
    getLODState(mesh) {
        return this._lodState.get(mesh) || false
    }

    /**
     * Set the LOD state for a mesh.
     * @param {object} mesh
     * @param {boolean} usingTextLight
     */
    setLODState(mesh, usingTextLight) {
        this._lodState.set(mesh, usingTextLight);
    }

    /**
     * Get iterator for all meshes.
     * @returns {IterableIterator<object>}
     */
    [Symbol.iterator]() {
        return this._allMeshes[Symbol.iterator]()
    }

    /**
     * Get the number of registered meshes.
     * @returns {number}
     */
    get size() {
        return this._allMeshes.size
    }

    /**
     * Clear all meshes from the registry.
     */
    clear() {
        this._allMeshes.clear();
    }

    /**
     * Remove disposed meshes from the registry.
     * Returns list of removed meshes.
     * @returns {object[]}
     */
    pruneDisposed() {
        var removed = [];
        for (var mesh of this._allMeshes) {
            if (mesh.isDisposed && mesh.isDisposed()) {
                removed.push(mesh);
            }
        }
        for (var m of removed) {
            this._allMeshes.delete(m);
        }
        return removed
    }
}

/**
 * Manages scene light isolation for text meshes.
 * Ensures new lights added to the scene don't affect text meshes using camera-relative lighting.
 */

/**
 * Register an observer for new scene lights.
 * @param {object} scene - Babylon scene
 * @param {Function} onNewLight - Callback for new lights
 * @returns {object} Observer reference for cleanup
 */
function registerSceneLightObserver(scene, onNewLight) {
    if (!scene) return null
    return scene.onNewLightAddedObservable.add(onNewLight)
}

/**
 * Unregister the scene light observer.
 * @param {object} scene - Babylon scene
 * @param {object} observer - Observer reference
 */
function unregisterSceneLightObserver(scene, observer) {
    if (scene && observer) {
        scene.onNewLightAddedObservable.remove(observer);
    }
}

/**
 * Check if a light should be ignored for isolation purposes.
 * @param {object} light - Babylon light
 * @param {object} textLight - Text directional light
 * @param {object} textAmbient - Text ambient light
 * @returns {boolean}
 */
function shouldIgnoreLight(light, textLight, textAmbient) {
    if (!light) return true
    if (light === textLight) return true
    if (light === textAmbient) return true
    if (light.name === 'characterKey') return true
    return false
}

/**
 * Exclude a mesh from a light.
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
function excludeMeshFromLight(light, mesh, textLight, textAmbient) {
    if (!light || !mesh) return
    if (shouldIgnoreLight(light, textLight, textAmbient)) return

    if (!light.excludedMeshes) {
        light.excludedMeshes = [];
    }
    if (light.excludedMeshes.indexOf(mesh) === -1) {
        light.excludedMeshes.push(mesh);
    }
}

/**
 * Include a mesh in a light (remove from excludedMeshes).
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
function includeMeshInLight(light, mesh, textLight, textAmbient) {
    if (!light || !mesh) return
    if (shouldIgnoreLight(light, textLight, textAmbient)) return

    if (light.excludedMeshes) {
        var idx = light.excludedMeshes.indexOf(mesh);
        if (idx >= 0) {
            light.excludedMeshes.splice(idx, 1);
        }
    }
}

/**
 * Exclude mesh from all world lights in a scene.
 * @param {object} scene - Babylon scene
 * @param {object} mesh - Mesh to exclude
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
function excludeMeshFromAllWorldLights(scene, mesh, textLight, textAmbient) {
    if (!scene) return
    for (var light of scene.lights) {
        excludeMeshFromLight(light, mesh, textLight, textAmbient);
    }
}

/**
 * Include mesh in all world lights in a scene.
 * @param {object} scene - Babylon scene
 * @param {object} mesh - Mesh to include
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
function includeMeshInAllWorldLights(scene, mesh, textLight, textAmbient) {
    if (!scene) return
    for (var light of scene.lights) {
        includeMeshInLight(light, mesh, textLight, textAmbient);
    }
}

/**
 * Camera-relative direction calculations for text lighting.
 * Handles azimuth/elevation rotation math with reusable vectors.
 * Includes smoothing to prevent jitter on distant text.
 */

var DEG_TO_RAD = Math.PI / 180;

// Reusable vectors for calculations (avoid per-frame allocations)
var _tempForward = new math_vector.Vector3();
var _tempRight = new math_vector.Vector3();
var _tempTargetDir = new math_vector.Vector3();
var _tempQuat = new math_vector.Quaternion();

// Smoothed direction state (persists across frames)
// Initialized to a sensible default (down-forward)
var _smoothedDir = new math_vector.Vector3(0, -0.7, 0.7);
_smoothedDir.normalize();

// Default smoothing factor (0-1, lower = smoother)
var DEFAULT_SMOOTHING = 0.15;

/**
 * Update light direction based on camera orientation and offset angles.
 * Uses interpolation to smooth direction changes and prevent jitter.
 *
 * @param {object} light - Babylon DirectionalLight
 * @param {object} camera - noa camera instance
 * @param {number} azimuth - Horizontal offset in degrees
 * @param {number} elevation - Vertical offset in degrees
 * @param {number} [smoothing=0.15] - Smoothing factor (0-1). Lower = smoother. 1 = instant.
 */
function updateLightDirection(light, camera, azimuth, elevation, smoothing) {
    if (!light || !camera) return

    smoothing = smoothing !== undefined ? smoothing : DEFAULT_SMOOTHING;

    // Get camera forward direction (vec3 array)
    var camDir = camera.getDirection();
    _tempForward.copyFromFloats(camDir[0], camDir[1], camDir[2]);

    var azRad = azimuth * DEG_TO_RAD;
    var elRad = elevation * DEG_TO_RAD;

    // Calculate right vector (cross of up and forward)
    math_vector.Vector3.CrossToRef(math_vector.Vector3.Up(), _tempForward, _tempRight);
    _tempRight.normalize();

    // Start with forward direction for target calculation
    _tempTargetDir.copyFrom(_tempForward);

    // Rotate by azimuth around world Y axis
    if (azRad !== 0) {
        math_vector.Quaternion.RotationAxisToRef(math_vector.Vector3.Up(), azRad, _tempQuat);
        _tempTargetDir.rotateByQuaternionToRef(_tempQuat, _tempTargetDir);
    }

    // Rotate by elevation around camera's right axis
    if (elRad !== 0) {
        math_vector.Quaternion.RotationAxisToRef(_tempRight, elRad, _tempQuat);
        _tempTargetDir.rotateByQuaternionToRef(_tempQuat, _tempTargetDir);
    }

    // Smooth the light direction by interpolating toward target
    // This prevents jitter caused by rapid camera/position changes
    math_vector.Vector3.LerpToRef(_smoothedDir, _tempTargetDir, smoothing, _smoothedDir);
    _smoothedDir.normalize();

    // Babylon directional lights expect direction of incoming light
    light.direction.copyFrom(_smoothedDir);
}

/**
 * Reset the smoothed direction to a specific value.
 * Useful when teleporting or resetting the camera.
 * @param {Vector3} [direction] - Direction to reset to (defaults to down-forward)
 */
function resetSmoothedDirection(direction) {
    {
        _smoothedDir.copyFromFloats(0, -0.7, 0.7);
    }
    _smoothedDir.normalize();
}

/**
 * Calculate squared distance between camera position (array) and mesh position (Vector3).
 * @param {number[]} camPos - Camera position [x, y, z]
 * @param {object} meshPos - Mesh position (Vector3-like with x, y, z)
 * @returns {number}
 */
function distanceSquared(camPos, meshPos) {
    var dx = camPos[0] - meshPos.x;
    var dy = camPos[1] - meshPos.y;
    var dz = camPos[2] - meshPos.z;
    return dx * dx + dy * dy + dz * dz
}

/**
 * Namespaced logger utility for the text subsystem.
 * Provides consistent prefix for all text-related console output.
 */

const PREFIX = '[noa.text]';

function log(...args) {
    console.log(PREFIX, ...args);
}

function warn(...args) {
    console.warn(PREFIX, ...args);
}

function error(...args) {
    console.error(PREFIX, ...args);
}

/**
 * TextLighting - Camera-relative lighting system for 3D text
 *
 * Creates a dedicated DirectionalLight that follows the camera,
 * ensuring consistent edge definition on extruded text from all viewing angles.
 * Critical for dyslexic accessibility.
 */



/**
 * TextLighting manages a camera-relative light for all text meshes.
 *
 * Usage:
 * - Text system creates this automatically
 * - Meshes are registered via addTextMesh() when text is created
 * - Light direction updates each frame based on camera angle + preset/custom offsets
 * - LOD switching moves distant text to world lighting for performance
 */
class TextLighting {

    /**
     * @param {import('../../../index').Engine} noa - The noa engine instance
     * @param {object} [opts] - Configuration options
     */
    constructor(noa, opts = {}) {
        /** @internal */
        this.noa = noa;
        /** @internal */
        this._disposed = false;

        // Configuration
        /** Whether camera-relative lighting is enabled */
        this._enabled = opts.enabled !== false;
        /** Current preset name */
        this._preset = opts.preset || 'custom';
        /** Custom azimuth offset (degrees) - used when preset is 'custom' */
        this._customAzimuth = opts.customAzimuthDeg || 0;
        /** Custom elevation offset (degrees) - used when preset is 'custom' */
        this._customElevation = opts.customElevationDeg !== undefined ? opts.customElevationDeg : -84;
        /** Light intensity */
        this._intensity = opts.intensity !== undefined ? opts.intensity : 0.8;
        /** Distance beyond which text falls back to world lighting */
        this._lodDistance = opts.lodDistance || 50;
        /** Hysteresis buffer to prevent LOD flickering */
        this._lodHysteresis = opts.lodHysteresis || 5;

        // Light colors
        this._diffuse = opts.diffuse || new math_color.Color3(1, 1, 1);
        this._specular = opts.specular || new math_color.Color3(0.1, 0.1, 0.1);

        // Scene ambient isolation - when true, text materials have ambient zeroed
        this._isolateFromSceneAmbient = opts.isolateFromSceneAmbient ?? false;

        // Text-specific ambient light settings
        this._ambientIntensity = opts.ambientIntensity !== undefined ? opts.ambientIntensity : 0.2;
        this._ambientColor = opts.ambientColor || new math_color.Color3(1, 1, 1);

        // Lights (created when scene ready)
        /** @type {import('@babylonjs/core').DirectionalLight|null} */
        this._textLight = null;
        /** @type {import('@babylonjs/core').HemisphericLight|null} */
        this._textAmbient = null;

        // Mesh registry
        this._meshRegistry = new MeshRegistry();
        this._meshDisposeObservers = new WeakMap();

        // Scene light observer
        this._sceneLightObserver = null;

        // Squared distances for faster comparisons
        this._lodDistanceSq = this._lodDistance * this._lodDistance;

        // Reset smoothed direction to avoid inheriting state across engine lifecycles
        resetSmoothedDirection();

        // Initialize light when scene is ready
        this._initWhenReady();
    }


    /** @internal */
    _initWhenReady() {
        this.noa.rendering.onSceneReady(() => {
            if (this._disposed) return
            this._createLight();
        });
    }


    /** @internal */
    _createLight() {
        var scene = this.noa.rendering.getScene();
        if (!scene) return

        var lights = createLights(scene, {
            intensity: this._intensity,
            diffuse: this._diffuse,
            specular: this._specular,
            ambientIntensity: this._ambientIntensity,
            ambientColor: this._ambientColor
        });

        this._textLight = lights.textLight;
        this._textAmbient = lights.textAmbient;

        // Watch for new scene lights
        this._sceneLightObserver = registerSceneLightObserver(scene, (light) => {
            this._handleNewSceneLight(light);
        });

        // Process any meshes that were registered before the light was created
        if (this._enabled) {
            for (var mesh of this._meshRegistry) {
                var camPos = this.noa.camera.getPosition();
                var meshPos = mesh.absolutePosition || mesh.position;
                var distSq = distanceSquared(camPos, meshPos);
                if (distSq < this._lodDistanceSq) {
                    this._switchToTextLight(mesh);
                }
            }
        }

        log('TextLighting initialized with preset:', this._preset, 'isolateFromSceneAmbient:', this._isolateFromSceneAmbient);
    }


    /**
     * Get the text light (for external configuration)
     * @returns {import('@babylonjs/core').DirectionalLight|null}
     */
    getLight() {
        return this._textLight
    }


    /**
     * Enable or disable camera-relative text lighting.
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this._enabled = enabled;
        if (!enabled) {
            // Move all meshes to world lighting
            for (var mesh of this._meshRegistry) {
                this._switchToWorldLight(mesh);
            }
        } else {
            // Move nearby meshes back to text light
            this._updateAllMeshLOD();
        }
    }


    /**
     * Check if camera-relative lighting is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this._enabled
    }


    /**
     * Set the lighting preset
     * @param {'above-front' | 'headlamp' | 'above-left' | 'above-right' | 'custom'} preset
     */
    setPreset(preset) {
        this._preset = validatePreset(preset);
    }


    /**
     * Get the current preset
     * @returns {string}
     */
    getPreset() {
        return this._preset
    }


    /**
     * Get available preset names
     * @returns {string[]}
     */
    getPresetNames() {
        return getPresetNames()
    }


    /**
     * Set custom azimuth and elevation offsets (for 'custom' preset mode)
     * @param {number} azimuthDeg - Horizontal offset in degrees (-180 to 180)
     * @param {number} elevationDeg - Vertical offset in degrees (-89 to 89)
     */
    setOffsets(azimuthDeg, elevationDeg) {
        this._customAzimuth = azimuthDeg;
        this._customElevation = elevationDeg;
    }


    /**
     * Get current offsets
     * @returns {{azimuth: number, elevation: number}}
     */
    getOffsets() {
        return getOffsets(this._preset, this._customAzimuth, this._customElevation)
    }


    /**
     * Set light intensity
     * @param {number} intensity
     */
    setIntensity(intensity) {
        this._intensity = intensity;
        if (this._textLight) {
            this._textLight.intensity = intensity;
        }
    }


    /**
     * Get light intensity
     * @returns {number}
     */
    getIntensity() {
        return this._intensity
    }


    /**
     * Set LOD distance threshold
     * @param {number} distance - Distance in world units
     */
    setLODDistance(distance) {
        this._lodDistance = distance;
        this._lodDistanceSq = distance * distance;
    }


    /**
     * Get LOD distance threshold
     * @returns {number}
     */
    getLODDistance() {
        return this._lodDistance
    }


    /**
     * Set whether text should be isolated from scene ambient color.
     * @param {boolean} isolated
     */
    setIsolateFromSceneAmbient(isolated) {
        this._isolateFromSceneAmbient = isolated;
    }


    /**
     * Check if text is isolated from scene ambient color
     * @returns {boolean}
     */
    isIsolatedFromSceneAmbient() {
        return this._isolateFromSceneAmbient
    }


    /**
     * Set text-specific ambient light intensity
     * @param {number} intensity
     */
    setAmbientIntensity(intensity) {
        this._ambientIntensity = intensity;
        if (this._textAmbient) {
            this._textAmbient.intensity = intensity;
        }
    }


    /**
     * Get text-specific ambient light intensity
     * @returns {number}
     */
    getAmbientIntensity() {
        return this._ambientIntensity
    }


    /**
     * Register a text mesh with the lighting system.
     * @param {import('@babylonjs/core').Mesh} mesh
     */
    addTextMesh(mesh) {
        if (!mesh || this._meshRegistry.has(mesh)) return

        this._meshRegistry.add(mesh);

        if (mesh.onDisposeObservable) {
            var obs = mesh.onDisposeObservable.add(() => {
                this.removeTextMesh(mesh);
            });
            this._meshDisposeObservers.set(mesh, obs);
        }

        // Start with text light if enabled and within LOD distance
        if (this._enabled && this._textLight) {
            var camPos = this.noa.camera.getPosition();
            var meshPos = mesh.absolutePosition || mesh.position;
            var distSq = distanceSquared(camPos, meshPos);

            if (distSq < this._lodDistanceSq) {
                this._switchToTextLight(mesh);
            } else {
                this._switchToWorldLight(mesh);
            }
        }
    }


    /**
     * Unregister a text mesh from the lighting system.
     * @param {import('@babylonjs/core').Mesh} mesh
     */
    removeTextMesh(mesh) {
        if (!mesh) return

        this._meshRegistry.remove(mesh);

        var obs = this._meshDisposeObservers.get(mesh);
        if (obs && mesh.onDisposeObservable) {
            mesh.onDisposeObservable.remove(obs);
        }
        this._meshDisposeObservers.delete(mesh);

        // Remove from text light's includedOnlyMeshes
        removeMeshFromLight(this._textLight, mesh);

        // Remove from text ambient's includedOnlyMeshes
        removeMeshFromLight(this._textAmbient, mesh);

        // Re-include in main light (cleanup)
        this.noa.rendering.includeMeshInMainLight(mesh, false);

        var scene = this.noa.rendering.getScene();
        includeMeshInAllWorldLights(scene, mesh, this._textLight, this._textAmbient);
    }


    /**
     * Per-frame update. Updates light direction and handles LOD switching.
     */
    update() {
        if (this._disposed || !this._textLight || !this._enabled) return

        // Update light direction based on camera
        var offsets = this.getOffsets();
        updateLightDirection(this._textLight, this.noa.camera, offsets.azimuth, offsets.elevation);

        // Update LOD for all meshes
        this._updateAllMeshLOD();
    }


    /** @internal */
    _updateAllMeshLOD() {
        if (!this._enabled || !this._textLight) return

        var camPos = this.noa.camera.getPosition();
        var lod = this._lodDistance;
        var hyst = this._lodHysteresis;
        var highSq = (lod + hyst) * (lod + hyst);
        var low = Math.max(lod - hyst, 0);
        var lowSq = low * low;

        // Prune disposed meshes
        var pruned = this._meshRegistry.pruneDisposed();
        for (var removedMesh of pruned) {
            this.removeTextMesh(removedMesh);
        }

        for (var mesh of this._meshRegistry) {
            var meshPos = mesh.absolutePosition || mesh.position;
            var distSq = distanceSquared(camPos, meshPos);
            var usingTextLight = this._meshRegistry.getLODState(mesh);

            if (usingTextLight) {
                // Switch to world lighting beyond (lod + hysteresis)
                if (distSq > highSq) {
                    this._switchToWorldLight(mesh);
                }
            } else {
                // Switch back to text lighting inside (lod - hysteresis)
                if (distSq < lowSq) {
                    this._switchToTextLight(mesh);
                }
            }
        }
    }


    /** @internal */
    _switchToTextLight(mesh) {
        if (!this._textLight || !mesh) return
        if (this._meshRegistry.getLODState(mesh)) return // Already using text light

        // Add to text light's includedOnlyMeshes
        addMeshToLight(this._textLight, mesh);

        // Add to text ambient's includedOnlyMeshes
        addMeshToLight(this._textAmbient, mesh);

        // Exclude from main world light (sun)
        this.noa.rendering.excludeMeshFromMainLight(mesh, false);

        // Exclude from all other scene lights
        var scene = this.noa.rendering.getScene();
        excludeMeshFromAllWorldLights(scene, mesh, this._textLight, this._textAmbient);

        this._meshRegistry.setLODState(mesh, true);
    }


    /** @internal */
    _switchToWorldLight(mesh) {
        if (!mesh) return
        if (!this._meshRegistry.getLODState(mesh)) return // Already using world light

        // Remove from text light's includedOnlyMeshes
        removeMeshFromLight(this._textLight, mesh);

        // Remove from text ambient's includedOnlyMeshes
        removeMeshFromLight(this._textAmbient, mesh);

        // Re-include in main world light
        this.noa.rendering.includeMeshInMainLight(mesh, false);

        // Re-include in all other scene lights
        var scene = this.noa.rendering.getScene();
        includeMeshInAllWorldLights(scene, mesh, this._textLight, this._textAmbient);

        this._meshRegistry.setLODState(mesh, false);
    }


    /** @internal */
    _handleNewSceneLight(light) {
        if (!light) return
        if (light === this._textLight) return
        if (light === this._textAmbient) return
        if (light.name === 'characterKey') return

        for (var mesh of this._meshRegistry) {
            if (this._meshRegistry.getLODState(mesh)) {
                excludeMeshFromLight(light, mesh, this._textLight, this._textAmbient);
            }
        }
    }


    /**
     * Dispose the lighting system
     */
    dispose() {
        if (this._disposed) return
        this._disposed = true;

        // Clear all mesh registrations and re-include in world lights
        var scene = this.noa.rendering.getScene();
        for (var mesh of this._meshRegistry) {
            this.removeTextMesh(mesh);
        }
        this._meshRegistry.clear();

        // Dispose the lights
        disposeLights(this._textLight, this._textAmbient);
        this._textLight = null;
        this._textAmbient = null;

        // Reset smoothed direction so future instances start from a known state
        resetSmoothedDirection();

        // Unsubscribe observer
        unregisterSceneLightObserver(scene, this._sceneLightObserver);
        this._sceneLightObserver = null;

        log('TextLighting disposed');
    }
}

/**
 * Manages initialization state and deferred callbacks for the text subsystem.
 * Centralizes ready/failed state tracking and callback handling.
 */
class ReadyState {
    constructor() {
        /** Whether text system is available and initialized */
        this.ready = false;
        /** Whether initialization permanently failed (e.g., meshwriter missing) */
        this.initFailed = false;
        /** @internal Deferred callbacks waiting for initialization */
        this._callbacks = [];
    }

    /**
     * Mark the system as ready and flush callbacks.
     */
    setReady() {
        this.ready = true;
        this.initFailed = false;
        this._flush();
    }

    /**
     * Mark initialization as permanently failed.
     * Clears any pending callbacks.
     */
    setFailed() {
        this.ready = false;
        this.initFailed = true;
        this._callbacks.length = 0;
    }

    /**
     * Reset state (for dispose).
     */
    reset() {
        this.ready = false;
        this.initFailed = false;
        this._callbacks.length = 0;
    }

    /**
     * Register a callback to run when ready.
     * If already ready, fires immediately.
     * If failed, does nothing.
     * @param {Function} callback
     */
    onReady(callback) {
        if (typeof callback !== 'function') return
        if (this.ready) {
            this._safeCall(callback);
            return
        }
        if (this.initFailed) return
        this._callbacks.push(callback);
    }

    /**
     * @internal Execute all pending callbacks.
     */
    _flush() {
        if (!this._callbacks.length) return
        var callbacks = this._callbacks.slice();
        this._callbacks.length = 0;
        callbacks.forEach((cb) => this._safeCall(cb));
    }

    /**
     * @internal Execute callback with error handling.
     * @param {Function} callback
     */
    _safeCall(callback) {
        try {
            callback();
        } catch (err) {
            error('onReady callback error:', err);
        }
    }
}

/**
 * Default options for the text subsystem.
 */

/** Constructor defaults for Text class */
var CONSTRUCTOR_DEFAULTS = {
    defaultFont: 'Helvetica',
    scale: 1,
    enabled: true,
};

/**
 * Default options for text creation.
 * @param {object} constructorOpts - Options from Text constructor
 * @returns {object} Default text creation options
 */
function createDefaultOptions(constructorOpts) {
    return {
        font: constructorOpts.defaultFont,
        fontWeight: null,  // null = no weight suffix, number = append to font name (e.g., 'Atkinson-500')
        scale: constructorOpts.scale,
        letterHeight: 1,
        letterThickness: 0.1,
        color: '#FFFFFF',
        alpha: 1,
        /** @type {'left' | 'center' | 'right'} */
        anchor: /** @type {'center'} */ ('center'),
        /** If true, disables lighting (only emissive color shows) */
        emissiveOnly: false,
        /** Material colors - diffuse affects lit surfaces, ambient affects shadowed areas */
        diffuseColor: null,  // null = auto-derive for contrast (if autoContrast enabled)
        ambientColor: null,  // null = auto-derive for contrast (if autoContrast enabled)
        specularColor: null, // null = use meshwriter default (#000000)
        /** If true, text material is affected by scene fog (default: true) */
        fogEnabled: true,
        /** Shadow options - true = use manager defaults, object = override, false = disable */
        shadow: true,
        /** If true, auto-derive diffuse/ambient colors for WCAG contrast when only color is provided */
        autoContrast: true,
        /** If true and colors are provided, adjust them to meet WCAG contrast requirements */
        highContrast: false,
        /** Target WCAG contrast ratio (4.5 = AA normal, 7 = AAA) */
        contrastLevel: 4.5,
        /** If true, use camera-relative lighting instead of world lighting (disables Fresnel) */
        useCameraLight: true,
    }
}

/**
 * Handles lazy loading of the meshwriter module and font registration.
 * Encapsulates the optional dependency pattern.
 */

/**
 * @typedef {object} MeshWriterResult
 * @property {object} Writer - MeshWriter instance (created via createAsync)
 * @property {Function} registerFont - Font registration function
 * @property {object} MeshWriter - MeshWriter module reference
 * @property {object|null} contrastUtils - Color contrast utilities or null
 */

/**
 * Load and initialize MeshWriter with the default font.
 * @param {object} scene - Babylon scene
 * @param {object} opts - Options { scale }
 * @returns {Promise<MeshWriterResult>}
 * @throws {Error} If meshwriter is not available
 */
async function loadMeshWriter(scene, opts) {
    // Dynamic import to handle optional dependency
    var meshwriter = await import('meshwriter-cudu');
    var { MeshWriter, registerFont } = meshwriter;

    // Import and register default font
    try {
        var helvetica = await import('meshwriter-cudu/fonts/helvetica');
        registerFont('Helvetica', helvetica.default);
    } catch (e) {
        warn('Could not load default Helvetica font:', e);
    }

    // Create MeshWriter instance (async for Babylon 8 CSG2)
    var Writer = await MeshWriter.createAsync(scene, { scale: opts.scale });

    // Extract color contrast utilities
    var contrastUtils = null;
    try {
        contrastUtils = {
            deriveEdgeColors: meshwriter.deriveEdgeColors,
            adjustForContrast: meshwriter.adjustForContrast,
            hexToRgb: meshwriter.hexToRgb
        };
    } catch (e) {
        warn('Color contrast utilities not available:', e.message);
    }

    log('Text subsystem initialized');

    return {
        Writer,
        registerFont,
        MeshWriter,
        contrastUtils
    }
}

/**
 * Handle for managing a text instance.
 * Provides methods to modify and dispose the text.
 */
class TextHandle {

    /**
     * @internal
     * @param {object} config - Configuration object
     * @param {Function} config.removeText - Callback to remove from registry
     * @param {Function} config.removeShadows - Callback to remove shadows
     * @param {Function} config.removeFromLighting - Callback to remove from lighting
     * @param {Function} config.removeMeshFromScene - Callback to remove mesh from scene
     * @param {number} id - Unique ID
     * @param {object} textInstance - MeshWriter text instance
     * @param {import('@babylonjs/core').Mesh} mesh - Babylon mesh
     * @param {string} content - Text content
     * @param {object} options - Creation options
     * @param {import('@babylonjs/core').Mesh|null} [faceMesh] - Optional emissive face mesh
     */
    constructor(config, id, textInstance, mesh, content, options, faceMesh = null) {
        /** @internal */
        this._config = config;
        /** @internal */
        this._id = id;
        /** @internal */
        this._textInstance = textInstance;
        /** @internal */
        this._disposed = false;
        /** @internal */
        this._billboard = false;
        /** @internal */
        this._options = options;
        /** @internal */
        this._meshDisposeObserver = null;

        /** The Babylon mesh for this text */
        this.mesh = mesh;
        /** Optional emissive face mesh (child of mesh) */
        this.faceMesh = faceMesh || null;
        /** The text content */
        this.content = content;

        if (this.mesh && this.mesh.onDisposeObservable) {
            this._meshDisposeObserver = this.mesh.onDisposeObservable.add(() => {
                this._handleExternalMeshDispose();
            });
        }
    }

    /**
     * Set the text color
     * @param {string} color - Hex color string (e.g., '#FF0000')
     */
    setColor(color) {
        if (this._disposed) return
        this._textInstance.setColor(color);
    }

    /**
     * Set the text alpha/transparency
     * @param {number} alpha - Transparency value (0-1)
     */
    setAlpha(alpha) {
        if (this._disposed) return
        this._textInstance.setAlpha(alpha);
    }

    /**
     * Get the underlying Babylon mesh
     * @returns {import('@babylonjs/core').Mesh}
     */
    getMesh() {
        return this.mesh
    }

    /**
     * Get the emissive face mesh if available.
     * @returns {import('@babylonjs/core').Mesh|null}
     */
    getFaceMesh() {
        return this.faceMesh
    }

    /** Dispose this text instance and clean up resources */
    dispose() {
        this._disposeInternal(false);
    }

    /** @internal */
    _handleExternalMeshDispose() {
        this._disposeInternal(true);
    }

    /** @internal */
    _disposeInternal(meshAlreadyDisposed) {
        if (this._disposed) return
        this._disposed = true;

        if (this.mesh && this._meshDisposeObserver && this.mesh.onDisposeObservable) {
            this.mesh.onDisposeObservable.remove(this._meshDisposeObserver);
            this._meshDisposeObserver = null;
        }

        if (this.mesh) {
            this._config.removeFromLighting(this.mesh);
        }
        // Face mesh is NOT in lighting system (it's emissive/self-lit)

        if (this._textInstance && typeof this._textInstance.dispose === 'function') {
            try {
                this._textInstance.dispose();
            } catch (err) {
                warn('Failed to dispose text instance:', err);
            }
        }

        if (this.mesh) {
            try {
                this._config.removeMeshFromScene(this.mesh);
            } catch (err) {
                // ignore - mesh may not be registered
            }
            if (!meshAlreadyDisposed && typeof this.mesh.dispose === 'function') {
                var disposed = false;
                if (typeof this.mesh.isDisposed === 'function') {
                    try {
                        disposed = this.mesh.isDisposed();
                    } catch (err) {
                        disposed = false;
                    }
                }
                if (!disposed) {
                    try {
                        this.mesh.dispose();
                    } catch (err) {
                        warn('Failed to dispose text mesh:', err);
                    }
                }
            }
        }

        // Dispose face mesh (now unparented, so dispose separately)
        if (this.faceMesh) {
            try {
                this._config.removeMeshFromScene(this.faceMesh);
            } catch (err) {
                // ignore - mesh may not be registered
            }
            if (!meshAlreadyDisposed && typeof this.faceMesh.dispose === 'function') {
                var faceDisposed = false;
                if (typeof this.faceMesh.isDisposed === 'function') {
                    try {
                        faceDisposed = this.faceMesh.isDisposed();
                    } catch (err) {
                        faceDisposed = false;
                    }
                }
                if (!faceDisposed) {
                    try {
                        this.faceMesh.dispose();
                    } catch (err) {
                        warn('Failed to dispose face mesh:', err);
                    }
                }
            }
        }

        // Remove shadows
        this._config.removeShadows(this._id);

        // Remove from registry
        this._config.removeText(this._id);

        this._textInstance = null;
        this.mesh = null;
        this.faceMesh = null;
    }
}

/**
 * Handles color processing and material configuration for text meshes.
 * Centralizes contrast color derivation and Fresnel setup.
 */

/**
 * Process color options for contrast requirements.
 * @param {object} opts - Text options
 * @param {object|null} contrastUtils - Color utilities from meshwriter
 * @returns {{emissive: string, diffuse: string|null, ambient: string|null}}
 */
function processContrastColors(opts, contrastUtils) {
    var emissive = opts.color;
    var diffuse = opts.diffuseColor;
    var ambient = opts.ambientColor;

    // If contrast utilities aren't available, pass through unchanged
    if (!contrastUtils) {
        return { emissive, diffuse, ambient }
    }

    // Case 1: User provided only emissive, autoContrast is enabled
    // Auto-derive diffuse and ambient for high contrast
    // Note: deriveEdgeColors may also return a modified emissive for the inverted approach
    if (opts.autoContrast && !diffuse && !ambient) {
        var derived = contrastUtils.deriveEdgeColors(emissive, opts.contrastLevel);
        return {
            emissive: derived.emissive || emissive,
            diffuse: derived.diffuse,
            ambient: derived.ambient
        }
    }

    // Case 2: User provided colors + highContrast flag
    // Adjust colors to meet WCAG contrast requirements
    if (opts.highContrast && (diffuse || ambient)) {
        var adjusted = contrastUtils.adjustForContrast({
            emissive: emissive,
            diffuse: diffuse || '#404040',
            ambient: ambient || '#202020'
        }, {
            targetContrast: opts.contrastLevel,
            edgeRange: 0.4,
            faceRange: 0.1
        });
        return {
            emissive: adjusted.emissive,
            diffuse: adjusted.diffuse,
            ambient: adjusted.ambient
        }
    }

    // Case 3: Pass through unchanged
    return { emissive, diffuse, ambient }
}

/**
 * Configure material for text mesh with Fresnel and contrast settings.
 * @param {object} material - Babylon StandardMaterial
 * @param {object} opts - Text options
 * @param {boolean} usingCameraLight - Whether camera-relative lighting is active
 * @param {boolean} isolatedFromSceneAmbient - Whether to zero ambient
 * @param {object|null} contrastUtils - Color utilities from meshwriter
 * @param {{processedColors?: {emissive: string, diffuse: string|null, ambient: string|null}, hasFaceMesh?: boolean}} [extra]
 */
function configureMaterial(material, opts, usingCameraLight, isolatedFromSceneAmbient, contrastUtils, extra = {}) {
    if (!material) return

    // Always render both faces so 3D extrusion stays visible
    material.backFaceCulling = false;

    var hasFaceMesh = !!extra.hasFaceMesh;

    if (opts.autoContrast && !hasFaceMesh) {
        // Use Fresnel-based emissive even when camera lighting is active.
        // This keeps front faces bright for dyslexic readability while allowing
        // physical lights to continue adding depth to the edges.
        material.emissiveFresnelParameters = new fresnelParameters.FresnelParameters();
        material.emissiveFresnelParameters.bias = 0;
        material.emissiveFresnelParameters.power = usingCameraLight ? 2.5 : 4;

        var brightColor = contrastUtils ? contrastUtils.hexToRgb(opts.color) : { r: 1, g: 0.843, b: 0 };
        var darkColor = { r: 0.12, g: 0.1, b: 0 };
        var brighten = usingCameraLight ? 1.15 : 1;

        material.emissiveFresnelParameters.leftColor = new math_color.Color3(
            Math.min(1, brightColor.r * brighten),
            Math.min(1, brightColor.g * brighten),
            Math.min(1, brightColor.b * brighten)
        );
        material.emissiveFresnelParameters.rightColor = new math_color.Color3(darkColor.r, darkColor.g, darkColor.b);
        material.emissiveColor = new math_color.Color3(0, 0, 0);
    } else if (hasFaceMesh && !opts.emissiveOnly) {
        // With a dedicated face mesh, the rim should respond strictly to lights.
        material.emissiveFresnelParameters = null;
        material.emissiveColor = new math_color.Color3(0, 0, 0);
    }

    if (usingCameraLight && isolatedFromSceneAmbient) {
        material.ambientColor = new math_color.Color3(0, 0, 0);
    }
}

/**
 * Factory functions for creating text meshes.
 * Encapsulates mesh creation logic separate from the Text class.
 */

/**
 * Create a 3D text mesh at a world position.
 * @param {object} params - Creation parameters
 * @param {string} params.content - Text string to render
 * @param {object} params.options - Merged options
 * @param {object} params.Writer - MeshWriter instance
 * @param {object} params.noa - Engine reference
 * @param {object|null} params.textLighting - TextLighting instance
 * @param {object} params.shadowManager - TextShadowManager instance
 * @param {object|null} params.contrastUtils - Color contrast utilities
 * @param {number} params.nextId - Next unique ID
 * @param {Function} params.registerHandle - Callback to register handle
 * @param {Function} params.removeText - Callback to remove text
 * @returns {{handle: TextHandle, nextId: number}|null}
 */
function createWorldText(params) {
    var { content, options: opts, Writer, noa, textLighting, shadowManager, contrastUtils, nextId, registerHandle, removeText } = params;

    var position = opts.position || [0, 0, 0];

    // Process colors for contrast requirements
    var processedColors = processContrastColors(opts, contrastUtils);

    // Build colors object for meshwriter (only include non-null values)
    var colors = {};
    if (processedColors.diffuse) colors.diffuse = processedColors.diffuse;
    if (processedColors.ambient) colors.ambient = processedColors.ambient;
    if (opts.specularColor) colors.specular = opts.specularColor;

    // Resolve font name with weight suffix if fontWeight is provided
    // e.g., font='Atkinson', fontWeight=500 -> 'Atkinson-500'
    var resolvedFont = opts.font;
    if (opts.fontWeight != null) {
        resolvedFont = opts.font + '-' + opts.fontWeight;
    }

    // Create meshwriter text instance
    // Use original color (opts.color) for MeshWriter - the face mesh needs the bright color.
    // The rim material gets configured separately by configureMaterial() below.
    var writerOpts = {
        'font-family': resolvedFont,
        'letter-height': opts.letterHeight,
        'letter-thickness': opts.letterThickness,
        'color': opts.color,
        'alpha': opts.alpha,
        'anchor': opts.anchor,
        'emissive-only': opts.emissiveOnly,
        'fog-enabled': opts.fogEnabled,
        'colors': Object.keys(colors).length > 0 ? colors : undefined,
        'position': { x: 0, y: 0, z: 0 }
    };
    // Add spacing options if provided (for dyslexia-friendly text)
    if (opts.letterSpacing != null) writerOpts['letter-spacing'] = opts.letterSpacing;
    if (opts.wordSpacing != null) writerOpts['word-spacing'] = opts.wordSpacing;

    var textInstance = new Writer(content, writerOpts);

    var mesh = textInstance.getMesh();
    var faceMesh = (typeof textInstance.getFaceMesh === 'function')
        ? textInstance.getFaceMesh()
        : null;

    if (!mesh) {
        warn('Failed to create text mesh');
        return null
    }

    // Determine if we're using camera-relative lighting
    var usingCameraLight = opts.useCameraLight && textLighting && textLighting.isEnabled();

    // Configure material for contrast and lighting
    var material = textInstance.getMaterial();
    var isolatedFromSceneAmbient = textLighting && textLighting.isIsolatedFromSceneAmbient();

    configureMaterial(material, opts, usingCameraLight, isolatedFromSceneAmbient, contrastUtils, {
        hasFaceMesh: !!faceMesh
    });

    // Add rim mesh to noa scene management
    noa.rendering.addMeshToScene(mesh, false, position);

    // Position rim mesh in world (convert global to local)
    var localPos = noa.globalToLocal(position, null, []);
    mesh.position.copyFromFloats(localPos[0], localPos[1], localPos[2]);

    // Text renders in XZ plane by default, rotate to be vertical (upright)
    mesh.rotation.x = -Math.PI / 2;

    // Handle face mesh - unparent and add to scene separately
    // Face mesh must be in noa's scene management to render properly
    if (faceMesh) {
        // Unparent face mesh (meshwriter parents it to rim by default)
        faceMesh.parent = null;

        // Position face mesh same as rim
        faceMesh.position.copyFrom(mesh.position);
        faceMesh.rotation.copyFrom(mesh.rotation);

        // Tiny Z offset to prevent z-fighting (after rotation, local Y becomes world -Z)
        // Negative Z moves face toward camera; keep minimal to avoid visible gap
        faceMesh.position.z -= 0.0005;

        // Add face mesh to noa scene management
        var faceGlobalPos = [
            position[0],
            position[1],
            position[2] - 0.0005
        ];
        noa.rendering.addMeshToScene(faceMesh, false, faceGlobalPos);
    }

    // Register rim mesh with camera-relative lighting system
    // Face mesh is NOT added - it has disableLighting=true (emissive/self-lit)
    if (usingCameraLight && textLighting) {
        textLighting.addTextMesh(mesh);
    }

    // Create handle for management
    var id = nextId;
    var handleConfig = {
        removeText: removeText,
        removeShadows: (textId) => shadowManager.removeShadows(textId),
        removeFromLighting: (m) => {
            if (textLighting) textLighting.removeTextMesh(m);
        },
        removeMeshFromScene: (m) => noa.rendering.removeMeshFromScene(m)
    };
    var handle = new TextHandle(handleConfig, id, textInstance, mesh, content, opts, faceMesh);
    registerHandle(id, handle);

    // Create shadows if enabled
    var shadowOptions = opts.shadow;
    if (shadowOptions !== false) {
        var resolvedShadowOpts = (shadowOptions === true || shadowOptions === undefined)
            ? undefined
            : shadowOptions;
        shadowManager.createShadowsForText(handle, resolvedShadowOpts);
    }

    return { handle, nextId: id + 1 }
}

/**
 * Create billboarded text that always faces the camera.
 * @param {object} params - Same as createWorldText
 * @returns {{handle: TextHandle, nextId: number}|null}
 */
function createBillboardText(params) {
    var result = createWorldText(params);
    if (result && result.handle) {
        result.handle._billboard = true;
        result.handle.mesh.billboardMode = 7; // BABYLON.Mesh.BILLBOARDMODE_ALL
    }
    return result
}

/**
 * Update text content (dispose old, create new).
 * @param {TextHandle} handle - Existing text handle
 * @param {string} newContent - New text content
 * @param {object} noa - Engine reference
 * @param {object} createParams - Base params for create functions (without content/options)
 * @returns {TextHandle|null}
 */
function updateText(handle, newContent, noa, createParams) {
    if (!handle || handle._disposed) return null

    // Preserve position and options
    var mesh = handle.mesh;
    var position = [
        mesh.position.x + noa.worldOriginOffset[0],
        mesh.position.y + noa.worldOriginOffset[1],
        mesh.position.z + noa.worldOriginOffset[2],
    ];
    var rotation = mesh.rotation.clone();
    var wasBillboard = handle._billboard;
    var options = Object.assign({}, handle._options, { position });

    // Dispose old
    handle.dispose();

    // Create new
    var params = Object.assign({}, createParams, { content: newContent, options });
    var result = wasBillboard ? createBillboardText(params) : createWorldText(params);

    if (result && result.handle && rotation) {
        result.handle.mesh.rotation.copyFrom(rotation);
    }

    return result ? result.handle : null
}

/**
 * `noa.text` - 3D text rendering subsystem (optional)
 *
 * Provides factory methods for creating 3D text meshes in the world.
 * Uses meshwriter-cudu for text-to-mesh conversion with Babylon.js.
 *
 * This module is optional - it only initializes if meshwriter is available.
 * If meshwriter is not installed, `noa.text.ready` will be false and
 * text creation methods will return null.
 *
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * ```js
 * {
 *     defaultFont: 'Helvetica',
 *     scale: 1,
 *     enabled: true,
 * }
 * ```
 */
class Text {

    /**
     * @internal
     * @param {import('../../index').Engine} noa
     * @param {object} opts
     */
    constructor(noa, opts) {
        opts = Object.assign({}, CONSTRUCTOR_DEFAULTS, opts);

        /** @internal */
        this.noa = noa;

        /** @internal - Manages ready/failed state */
        this._readyState = new ReadyState();

        /** @internal */
        this._disposed = false;

        /** @internal - MeshWriter constructor (set after init) */
        this._Writer = null;

        /** @internal - registerFont function from meshwriter */
        this._registerFont = null;

        /** @internal - MeshWriter module reference */
        this._MeshWriter = null;

        /** @internal - Registry of active text instances for cleanup */
        this._activeTexts = new Map();

        /** @internal - Next unique ID for text instances */
        this._nextId = 1;

        /** @internal - Shadow manager for text shadows */
        this._shadowManager = new TextShadowManager(noa);

        /** @internal - Render observer for shadow updates */
        this._renderObserver = null;

        /** @internal - Color contrast utilities from meshwriter */
        this._contrastUtils = null;

        /** @internal - Camera-relative lighting manager for text */
        this._textLighting = null;

        /** @internal - TextLighting options from constructor */
        this._textLightingOpts = opts.textLighting || {};

        /** Default options for text creation */
        this.defaultOptions = createDefaultOptions(opts);

        // Attempt lazy initialization when scene is ready
        if (opts.enabled) {
            this._initWhenReady();
        }
    }

    /** Whether text system is available and initialized */
    get ready() {
        return this._readyState.ready
    }

    /** Whether initialization permanently failed (e.g., meshwriter missing) */
    get initFailed() {
        return this._readyState.initFailed
    }

    /** @internal */
    _initWhenReady() {
        const onSceneReady = async () => {
            if (this._disposed || this.ready || this.initFailed) return
            await this._initialize();
        };
        this.noa.rendering.onSceneReady(onSceneReady);
    }

    /** @internal */
    async _initialize() {
        if (this._disposed || this.ready || this.initFailed) return
        try {
            var scene = this.noa.rendering.getScene();
            if (!scene) return
            var result = await loadMeshWriter(scene, { scale: this.defaultOptions.scale });

            if (this._disposed) {
                return
            }

            this._Writer = result.Writer;
            this._registerFont = result.registerFont;
            this._MeshWriter = result.MeshWriter;
            this._contrastUtils = result.contrastUtils;

            // Initialize shadow manager
            this._shadowManager.initialize();

            // Initialize camera-relative text lighting BEFORE marking ready
            // so it's available when onReady callbacks fire
            this._textLighting = new TextLighting(this.noa, this._textLightingOpts);

            this._readyState.setReady();

            // Set up render observer for shadow updates and text lighting
            this._renderObserver = scene.onBeforeRenderObservable.add(() => {
                this._shadowManager.updateShadows();
                if (this._textLighting) {
                    this._textLighting.update();
                }
            });
        } catch (e) {
            warn('MeshWriter not available, text features disabled:', e.message);
            this._readyState.setFailed();
        }
    }


    /**
     * Register a callback to run when the text system becomes ready.
     * If initialization already completed, the callback fires immediately.
     */
    onReady(callback) {
        this._readyState.onReady(callback);
    }


    /**
     * Register a font for use with text rendering.
     * Fonts must be registered before they can be used.
     *
     * @example
     * ```js
     * import jura from 'meshwriter-cudu/fonts/jura'
     * noa.text.registerFont('Jura', jura)
     * ```
     *
     * @param {string} name - Font name to register
     * @param {object} fontData - Font data (FontSpec object) from meshwriter-cudu/fonts
     */
    registerFont(name, fontData) {
        if (!this._registerFont) {
            warn('Cannot register font - text system not initialized');
            return
        }
        this._registerFont(name, fontData);
    }


    /**
     * Load a built-in font by filename (without importing meshwriter-cudu directly).
     * Returns a promise that resolves with the font data.
     *
     * **WARNING: This does NOT work in browser environments!**
     * Bundlers (Vite, webpack) cannot resolve dynamic imports with variable paths.
     * For browsers, use static imports instead:
     * ```js
     * import fontData from 'meshwriter-cudu/fonts/atkinson-hyperlegible-next'
     * noa.text.registerFont('Atkinson', fontData)
     * ```
     *
     * This method is only useful in Node.js environments (server-side rendering, tools).
     *
     * @param {string} fontFile - Built-in font filename (e.g., 'helvetica', 'atkinson-hyperlegible-next', 'jura')
     * @returns {Promise<object>} Font data object
     */
    async loadFont(fontFile) {
        if (this._disposed || this.initFailed || !this.ready || !this._registerFont) {
            warn('Cannot load font - text system not ready or disposed');
            return null
        }

        try {
            var fontModule = await import(`meshwriter-cudu/fonts/${fontFile}`);
            return fontModule.default
        } catch (e) {
            warn('Failed to load font:', fontFile, e.message);
            throw e
        }
    }


    /**
     * Load and register a built-in font in one step.
     * Convenience method that combines loadFont() and registerFont().
     *
     * **WARNING: This does NOT work in browser environments!**
     * See loadFont() documentation for details.
     *
     * For browsers, use static imports:
     * ```js
     * import fontData from 'meshwriter-cudu/fonts/atkinson-hyperlegible-next'
     * noa.text.registerFont('Atkinson', fontData)
     * ```
     *
     * @param {string} name - Name to register the font as
     * @param {string} fontFile - Built-in font filename (e.g., 'atkinson-hyperlegible-next')
     */
    async loadAndRegisterFont(name, fontFile) {
        if (this._disposed || this.initFailed || !this.ready || !this._registerFont) {
            warn('Cannot load/register font - text system not ready or disposed');
            return
        }

        var fontData = await this.loadFont(fontFile);
        if (!fontData) return
        this.registerFont(name, fontData);
        log('Font registered:', name, 'from', fontFile);
    }


    /**
     * Create 3D text mesh at a world position.
     * Returns a TextHandle for manipulation and disposal.
     *
     * @example
     * ```js
     * const sign = noa.text.createWorldText('Welcome!', {
     *     position: [100, 10, 50],
     *     letterHeight: 2,
     *     color: '#8B4513',
     * })
     * sign.mesh.rotation.y = Math.PI / 4
     * ```
     *
     * @param {string} content - Text string to render
     * @param {TextOptions} [options] - Text options
     * @returns {TextHandle|null} - Handle for the text, or null if not ready
     */
    createWorldText(content, options = {}) {
        if (this.initFailed) return null
        if (!this.ready || !this._Writer) {
            warn('Text system not ready');
            return null
        }

        var opts = Object.assign({}, this.defaultOptions, options);
        var result = createWorldText({
            content,
            options: opts,
            Writer: this._Writer,
            noa: this.noa,
            textLighting: this._textLighting,
            shadowManager: this._shadowManager,
            contrastUtils: this._contrastUtils,
            nextId: this._nextId,
            registerHandle: (id, handle) => this._activeTexts.set(id, handle),
            removeText: (id) => this._activeTexts.delete(id)
        });

        if (result) {
            this._nextId = result.nextId;
            return result.handle
        }
        return null
    }


    /**
     * Create billboarded text that always faces the camera.
     * Useful for entity labels and floating names.
     *
     * @example
     * ```js
     * const label = noa.text.createBillboardText('Player Name', {
     *     position: [10, 5, 10],
     *     letterHeight: 0.5,
     *     color: '#FFFF00',
     * })
     * ```
     *
     * @param {string} content - Text string
     * @param {TextOptions} [options] - Same as createWorldText
     * @returns {TextHandle|null}
     */
    createBillboardText(content, options = {}) {
        if (this.initFailed) return null
        if (!this.ready || !this._Writer) {
            warn('Text system not ready');
            return null
        }

        var opts = Object.assign({}, this.defaultOptions, options);
        var result = createBillboardText({
            content,
            options: opts,
            Writer: this._Writer,
            noa: this.noa,
            textLighting: this._textLighting,
            shadowManager: this._shadowManager,
            contrastUtils: this._contrastUtils,
            nextId: this._nextId,
            registerHandle: (id, handle) => this._activeTexts.set(id, handle),
            removeText: (id) => this._activeTexts.delete(id)
        });

        if (result) {
            this._nextId = result.nextId;
            return result.handle
        }
        return null
    }


    /**
     * Update text content (dispose old, create new).
     * MeshWriter doesn't support in-place updates, so this recreates the mesh.
     * Position, rotation, and options are preserved.
     *
     * @example
     * ```js
     * const newHandle = noa.text.updateText(oldHandle, 'New text content')
     * ```
     *
     * @param {TextHandle} handle - Existing text handle
     * @param {string} newContent - New text content
     * @returns {TextHandle|null} - New handle (old is disposed)
     */
    updateText(handle, newContent) {
        if (this.initFailed) return null
        if (!this.ready || !this._Writer) {
            warn('Text system not ready');
            return null
        }

        var createParams = {
            Writer: this._Writer,
            noa: this.noa,
            textLighting: this._textLighting,
            shadowManager: this._shadowManager,
            contrastUtils: this._contrastUtils,
            nextId: this._nextId,
            registerHandle: (id, h) => this._activeTexts.set(id, h),
            removeText: (id) => this._activeTexts.delete(id)
        };

        var newHandle = updateText(handle, newContent, this.noa, createParams);

        // Update nextId if a new handle was created
        if (newHandle) {
            this._nextId++;
        }

        return newHandle
    }


    /**
     * Get the shadow manager for configuring shadow defaults.
     * Useful for dev panel integration.
     * @returns {TextShadowManager}
     */
    getShadowManager() {
        return this._shadowManager
    }


    /**
     * Get the text lighting manager for configuring camera-relative lighting.
     * Useful for dev panel integration.
     * @returns {TextLighting|null}
     */
    getTextLighting() {
        return this._textLighting
    }


    /** Dispose all text and cleanup */
    dispose() {
        if (this._disposed) return
        this._disposed = true;

        // Remove render observer
        if (this._renderObserver) {
            var scene = this.noa.rendering.getScene();
            if (scene && scene.onBeforeRenderObservable) {
                scene.onBeforeRenderObservable.remove(this._renderObserver);
            }
            this._renderObserver = null;
        }

        // Dispose all active texts
        for (var handle of this._activeTexts.values()) {
            handle.dispose();
        }
        this._activeTexts.clear();

        // Dispose shadow manager
        this._shadowManager.dispose();

        // Dispose text lighting manager
        if (this._textLighting) {
            this._textLighting.dispose();
            this._textLighting = null;
        }

        this._Writer = null;
        this._registerFont = null;
        this._MeshWriter = null;
        this._readyState.reset();
    }
}


/**
 * @typedef {object} TextOptions
 * @property {number[]} [position] - World position [x, y, z]
 * @property {string} [font] - Font family name (default: 'Helvetica')
 * @property {number} [fontWeight] - Font weight (appended to font name, e.g., font='Atkinson', fontWeight=500 -> 'Atkinson-500')
 * @property {number} [letterHeight] - Height of letters in world units (default: 1)
 * @property {number} [letterThickness] - Depth of letters (default: 0.1)
 * @property {number} [letterSpacing] - Extra space between letters in world units (added after kerning, default: 0)
 * @property {number} [wordSpacing] - Extra space for word boundaries in world units (added to spaces, default: 0)
 * @property {string} [color] - Hex color string for emissive/face color (default: '#FFFFFF')
 * @property {number} [alpha] - Transparency 0-1 (default: 1)
 * @property {string} [anchor] - 'left', 'center', or 'right' (default: 'center')
 * @property {boolean} [emissiveOnly] - If true, disables lighting (only emissive color shows)
 * @property {string} [diffuseColor] - Hex color for diffuse/lit surfaces (auto-derived if null and autoContrast enabled)
 * @property {string} [ambientColor] - Hex color for ambient/shadow areas (auto-derived if null and autoContrast enabled)
 * @property {string} [specularColor] - Hex color for specular highlights (default: '#000000')
 * @property {boolean} [fogEnabled] - If true, text is affected by scene fog (default: true)
 * @property {object|boolean} [shadow] - Shadow options, true for defaults, or false to disable shadows
 * @property {boolean} [shadow.enabled] - Enable shadows (default: true)
 * @property {number} [shadow.blur] - Shadow blur/softness 0-1 (default: 0.5)
 * @property {boolean} [shadow.merged] - Use single merged shadow vs per-letter (default: true)
 * @property {number} [shadow.opacity] - Shadow opacity 0-1 (default: 0.4)
 * @property {boolean} [autoContrast] - Auto-derive edge colors for WCAG contrast (default: true)
 * @property {boolean} [highContrast] - Adjust provided colors to meet WCAG contrast (default: false)
 * @property {number} [contrastLevel] - Target WCAG contrast ratio, 4.5=AA, 7=AAA (default: 4.5)
 */

/**
 * Apply a pre-rotation and an animation rotation on top of a bone's rest rotation.
 * This expects GLB bones to have linked TransformNodes.
 */
function applyBoneRotation(transform, restRotation, preRotation, animRotation) {
  const pre = preRotation ? preRotation : math_vector.Quaternion.Identity();
  const anim = animRotation ? animRotation : math_vector.Quaternion.Identity();
  transform.rotationQuaternion = restRotation.multiply(pre).multiply(anim);
}

/**
 * Convenience to build a quaternion from an axis/angle in radians.
 */
function qAxis(axis, angle) {
  return math_vector.Quaternion.RotationAxis(axis, angle)
}

/**
 * Builds inward roll/yaw mirroring per side.
 * side: 'left' | 'right'
 */
function shoulderPreRotation(side, down, out, rollIn, yawIn) {
  // Axes per Homer guide:
  // Down = forward -, Out = up -, Roll in = forward (same sign both?), Yaw in = up (mirrored)
  const sign = side === 'left' ? 1 : -1;
  const rotDown = qAxis(math_vector.Vector3.Forward(), -down);
  const rotOut = qAxis(math_vector.Vector3.Up(), -out);
  const rotRoll = qAxis(math_vector.Vector3.Forward(), rollIn);
  const rotYaw = qAxis(math_vector.Vector3.Up(), yawIn * sign);
  return rotDown.multiply(rotOut).multiply(rotRoll).multiply(rotYaw)
}

var skeletonUtils = /*#__PURE__*/Object.freeze({
	__proto__: null,
	applyBoneRotation: applyBoneRotation,
	qAxis: qAxis,
	shoulderPreRotation: shoulderPreRotation
});

var version$1 = "0.35.0";
var packageJSON = {
	version: version$1};

var version = packageJSON.version;


var defaultOptions = {
    debug: false,
    silent: false,
    silentBabylon: false,
    playerHeight: 1.8,
    playerWidth: 0.6,
    playerStart: [0, 10, 0],
    playerAutoStep: false,
    playerShadowComponent: true,
    tickRate: 30,           // ticks per second
    maxRenderRate: 0,       // max FPS, 0 for uncapped 
    blockTestDistance: 10,
    stickyPointerLock: true,
    dragCameraOutsidePointerLock: true,
    stickyFullscreen: false,
    skipDefaultHighlighting: false,
    originRebaseDistance: 25,
};


/**
 * Main engine class.  
 * Takes an object full of optional settings as a parameter.
 * 
 * ```js
 * import { Engine } from 'cudu'
 * var noa = new Engine({
 *    debug: false,
 * })
 * ```
 * 
 * Note that the options object is also passed to noa's 
 * child modules ({@link Rendering}, {@link Container}, etc).
 * See docs for each module for their options.
 * 
*/

class Engine extends eventsExports.EventEmitter {

    /**
     * The core Engine constructor uses the following options:
     * 
     * ```js
     * var defaultOptions = {
     *    debug: false,
     *    silent: false,
     *    playerHeight: 1.8,
     *    playerWidth: 0.6,
     *    playerStart: [0, 10, 0],
     *    playerAutoStep: false,
     *    playerShadowComponent: true,
     *    tickRate: 30,           // ticks per second
     *    maxRenderRate: 0,       // max FPS, 0 for uncapped 
     *    blockTestDistance: 10,
     *    stickyPointerLock: true,
     *    dragCameraOutsidePointerLock: true,
     *    stickyFullscreen: false,
     *    skipDefaultHighlighting: false,
     *    originRebaseDistance: 25,
     * }
     * ```
     * 
     * **Events:**
     *  + `tick => (dt)`  
     *    Tick update, `dt` is (fixed) tick duration in ms
     *  + `beforeRender => (dt)`  
     *    `dt` is the time (in ms) since the most recent tick
     *  + `afterRender => (dt)`  
     *    `dt` is the time (in ms) since the most recent tick
     *  + `targetBlockChanged => (blockInfo)`  
     *    Emitted each time the user's targeted world block changes
     *  + `addingTerrainMesh => (mesh)`  
     *    Alerts client about a terrain mesh being added to the scene
     *  + `removingTerrainMesh => (mesh)`  
     *    Alerts client before a terrain mesh is removed.
    */
    constructor(opts = {}) {
        super();
        opts = Object.assign({}, defaultOptions, opts);
        if (opts.dragCameraOutsidePointerLock && typeof opts.sensitivityMultOutsidePointerlock !== 'number') {
            opts.sensitivityMultOutsidePointerlock = 1;
        }

        /** Version string, e.g. `"0.25.4"` */
        this.version = version;
        if (!opts.silent) {
            var debugstr = (opts.debug) ? ' (debug)' : '';
            console.log(`cudu v${this.version}${debugstr}`);
        }

        /** @internal */
        this._paused = false;
        /** @internal */
        this._disposed = false;

        /** @internal */
        this._originRebaseDistance = opts.originRebaseDistance;

        // world origin offset, used throughout engine for origin rebasing
        /** @internal */
        this.worldOriginOffset = [0, 0, 0];

        // how far engine is into the current tick. Updated each render.
        /** @internal */
        this.positionInCurrentTick = 0;

        /** 
         * String identifier for the current world. 
         * It's safe to ignore this if your game has only one level/world. 
        */
        this.worldName = 'default';

        /**
         * Multiplier for how fast time moves. Setting this to a value other than 
         * `1` will make the game speed up or slow down. This can significantly 
         * affect how core systems behave (particularly physics!).
        */
        this.timeScale = 1;

        /** Child module for managing the game's container, canvas, etc. */
        this.container = new Container(this, opts);

        /** The game's tick rate (number of ticks per second) 
         * @type {number}
         * @readonly 
        */
        this.tickRate = this.container._shell.tickRate;
        Object.defineProperty(this, 'tickRate', {
            get: () => this.container._shell.tickRate
        });

        /** The game's max framerate (use `0` for uncapped)
         * @type {number}
         */
        this.maxRenderRate = this.container._shell.maxRenderRate;
        Object.defineProperty(this, 'maxRenderRate', {
            get: () => this.container._shell.maxRenderRate,
            set: (v) => { this.container._shell.maxRenderRate = v || 0; },
        });


        /** Manages key and mouse input bindings */
        this.inputs = new Inputs(this, opts, this.container.element);

        /** A registry where voxel/material properties are managed */
        this.registry = new Registry(this, opts);

        /** Manages the world, chunks, and all voxel data */
        this.world = new World(this, opts);

        var _consoleLog = console.log;
        if (opts.silentBabylon) console.log = () => { };

        /** Rendering manager */
        this.rendering = new Rendering(this, opts, this.container.canvas);

        if (opts.silentBabylon) console.log = _consoleLog;

        /** 3D text rendering subsystem (optional - requires meshwriter) */
        this.text = new Text(this, opts);

        /** Physics engine - solves collisions, properties, etc. */
        this.physics = new Physics(this, opts);

        /** Entity manager / Entity Component System (ECS) */
        this.entities = new Entities(this, opts);

        /** Alias to `noa.entities` */
        this.ents = this.entities;
        var ents = this.entities;

        /** Entity id for the player entity */
        this.playerEntity = ents.add(
            opts.playerStart, // starting location
            opts.playerWidth, opts.playerHeight,
            null, null, // no mesh for now, no meshOffset, 
            true, opts.playerShadowComponent,
        );

        // make player entity it collide with terrain and other entities
        ents.addComponent(this.playerEntity, ents.names.collideTerrain);
        ents.addComponent(this.playerEntity, ents.names.collideEntities);

        // adjust default physics parameters
        var body = ents.getPhysics(this.playerEntity).body;
        body.gravityMultiplier = 2; // less floaty
        body.autoStep = opts.playerAutoStep; // auto step onto blocks

        // input component - sets entity's movement state from key inputs
        ents.addComponent(this.playerEntity, ents.names.receivesInputs);

        // add a component to make player mesh fade out when zooming in
        ents.addComponent(this.playerEntity, ents.names.fadeOnZoom);

        // movement component - applies movement forces
        ents.addComponent(this.playerEntity, ents.names.movement, {
            airJumps: 1
        });

        /** Manages the game's camera, view angle, sensitivity, etc. */
        this.camera = new Camera(this, opts);

        /** How far to check for a solid voxel the player is currently looking at 
         * @type {number}
        */
        this.blockTestDistance = opts.blockTestDistance;

        /** 
         * Callback to determine which voxels can be targeted. 
         * Defaults to a solidity check, but can be overridden with arbitrary logic.
         * @type {(blockID: number) => boolean} 
        */
        this.blockTargetIdCheck = this.registry.getBlockSolidity;

        /** 
         * Dynamically updated object describing the currently targeted block.
         * @type {null | { 
         *      blockID:number,
         *      position: number[],
         *      normal: number[],
         *      adjacent: number[],
         * }} 
        */
        this.targetedBlock = null;

        // add a default block highlighting function
        if (!opts.skipDefaultHighlighting) {
            // the default listener, defined onto noa in case people want to remove it later
            this.defaultBlockHighlightFunction = (tgt) => {
                if (tgt) {
                    this.rendering.highlightBlockFace(true, tgt.position, tgt.normal);
                } else {
                    this.rendering.highlightBlockFace(false);
                }
            };
            this.on('targetBlockChanged', this.defaultBlockHighlightFunction);
        }


        /*
         *
         *      Various internals...
         *
        */

        /** @internal */
        this._terrainMesher = new TerrainMesher(this);

        /** @internal */
        this._objectMesher = new ObjectMesher(this);

        /** @internal */
        this._targetedBlockDat = {
            blockID: 0,
            position: glVec3.create(),
            normal: glVec3.create(),
            adjacent: glVec3.create(),
        };

        /** @internal */
        this._prevTargetHash = 0;


        /** @internal */
        this._pickPos = glVec3.create();

        /** @internal */
        this._pickResult = {
            _localPosition: glVec3.create(),
            position: [0, 0, 0],
            normal: [0, 0, 0],
        };

        /** @internal */
        this._pickTestFunction = null;

        /** @internal */
        this._pickTestVoxel = (x, y, z) => {
            var off = this.worldOriginOffset;
            var id = this.world.getBlockID(x + off[0], y + off[1], z + off[2]);
            var fn = this._pickTestFunction || this.registry.getBlockSolidity;
            return fn(id)
        };





        this._cleanupDebugGlobals = null;

        // temp hacks for development
        if (opts.debug) {
            // expose often-used classes
            /** @internal */
            this.vec3 = vec3$1;
            /** @internal */
            this.ndarray = ndarray;
            /** @internal */
            this.skeletonUtils = skeletonUtils;
            // gameplay tweaks
            ents.getMovement(1).airJumps = 999;
            // decorate window while making TS happy
            var win = /** @type {any} */ (window);
            win.noa = this;
            win.vec3 = vec3$1;
            win.ndarray = ndarray;
            win.scene = this.rendering.scene;
            win.skeletonUtils = skeletonUtils;
            this._cleanupDebugGlobals = () => {
                if (win.noa === this) delete win.noa;
                if (win.vec3 === vec3$1) delete win.vec3;
                if (win.ndarray === ndarray) delete win.ndarray;
                if (win.scene === this.rendering.scene) delete win.scene;
                if (win.skeletonUtils === skeletonUtils) delete win.skeletonUtils;
            };
        }

        // Ensure a global hook exists for external debug pose tools (used by consumer games)
        // Safe to initialize even outside debug mode; ignored if already set by the app.
        if (typeof window !== 'undefined') {
            var w = /** @type {any} */ (window);
            if (!w.__animationDebugPose) {
                w.__animationDebugPose = { enabled: false };
            }
            if (!w.getDebugPose) {
                w.getDebugPose = function () {
                    return w.__animationDebugPose
                };
            }
        }

        // add hooks to throw helpful errors when using deprecated methods
        deprecateStuff(this);
    }



    /*
     *
     *
     *              Core Engine APIs
     *
     *
    */

    /**
     * Tick function, called by container module at a fixed timestep. 
     * Clients should not normally need to call this manually.
     * @internal
    */

    tick(dt) {
        if (this._disposed) return
        dt *= this.timeScale || 1;

        // note dt is a fixed value, not an observed delay
        if (this._paused) {
            if (this.world.worldGenWhilePaused) this.world.tick();
            return
        }
        checkWorldOffset(this);
        this.world.tick(); // chunk creation/removal
        if (!this.world.playerChunkLoaded) {
            // when waiting on worldgen, just tick the meshing queue and exit
            this.rendering.tick(dt);
            return
        }
        this.physics.tick(dt); // iterates physics
        this._objectMesher.tick(); // rebuild objects if needed
        this.rendering.tick(dt); // does deferred chunk meshing
        updateBlockTargets(this); // finds targeted blocks, and highlights one if needed
        this.entities.tick(dt); // runs all entity systems
        this.emit('tick', dt);
        // clear accumulated scroll inputs (mouseMove is cleared on render)
        var pst = this.inputs.pointerState;
        pst.scrollx = pst.scrolly = pst.scrollz = 0;
    }




    /**
     * Render function, called every animation frame. Emits #beforeRender(dt), #afterRender(dt) 
     * where dt is the time in ms *since the last tick*.
     * Clients should not normally need to call this manually.
     * @internal
    */
    render(dt, framePart) {
        if (this._disposed) return
        dt *= this.timeScale || 1;

        // note: framePart is how far we are into the current tick
        // dt is the *actual* time (ms) since last render, for
        // animating things that aren't tied to game tick rate

        // frame position - for rendering movement between ticks
        this.positionInCurrentTick = framePart;

        // when paused, just optionally ping worldgen, then exit
        if (this._paused) {
            if (this.world.worldGenWhilePaused) this.world.render();
            return
        }

        // rotate camera per user inputs - specific rules for this in `camera`
        this.camera.applyInputsToCamera();

        // brief run through meshing queue
        this.world.render();

        // entity render systems
        this.camera.updateBeforeEntityRenderSystems(dt);
        this.entities.render(dt);
        this.camera.updateAfterEntityRenderSystems();

        // events and render
        this.emit('beforeRender', dt);

        this.rendering.render();
        this.rendering.postRender();

        this.emit('afterRender', dt);

        // clear accumulated mouseMove inputs (scroll inputs cleared on render)
        this.inputs.pointerState.dx = this.inputs.pointerState.dy = 0;
    }




    /** Pausing the engine will also stop render/tick events, etc. */
    setPaused(paused = false) {
        this._paused = !!paused;
        // when unpausing, clear any built-up mouse inputs
        if (!paused) {
            this.inputs.pointerState.dx = this.inputs.pointerState.dy = 0;
        }
    }

    /** 
     * Get the voxel ID at the specified position
    */
    getBlock(x, y = 0, z = 0) {
        if (x.length) return this.world.getBlockID(x[0], x[1], x[2])
        return this.world.getBlockID(x, y, z)
    }

    /** 
     * Sets the voxel ID at the specified position. 
     * Does not check whether any entities are in the way! 
     */
    setBlock(id, x, y = 0, z = 0) {
        if (x.length) return this.world.setBlockID(id, x[0], x[1], x[2])
        return this.world.setBlockID(id, x, y, z)
    }

    /**
     * Adds a block, unless there's an entity in the way.
    */
    addBlock(id, x, y = 0, z = 0) {
        // add a new terrain block, if nothing blocks the terrain there
        if (x.length) {
            if (this.entities.isTerrainBlocked(x[0], x[1], x[2])) return
            this.world.setBlockID(id, x[0], x[1], x[2]);
            return id
        } else {
            if (this.entities.isTerrainBlocked(x, y, z)) return
            this.world.setBlockID(id, x, y, z);
            return id
        }
    }




    /** Dispose all engine resources and detach DOM/global hooks */
    dispose() {
        if (this._disposed) return
        this._disposed = true;
        this.setPaused(true);

        if (this.defaultBlockHighlightFunction) {
            this.off('targetBlockChanged', this.defaultBlockHighlightFunction);
        }
        if (this._cleanupDebugGlobals) {
            this._cleanupDebugGlobals();
            this._cleanupDebugGlobals = null;
        }

        if (this.inputs && typeof this.inputs.dispose === 'function') {
            this.inputs.dispose();
        }
        if (this.rendering && typeof this.rendering.dispose === 'function') {
            this.rendering.dispose();
        }
        if (this.text && typeof this.text.dispose === 'function') {
            this.text.dispose();
        }
        if (this.container && typeof this.container.dispose === 'function') {
            this.container.dispose();
        }
        if (this.entities && typeof this.entities.dispose === 'function') {
            this.entities.dispose();
        }
        if (this.world && typeof this.world.dispose === 'function') {
            this.world.dispose();
        }

        if (typeof window !== 'undefined') {
            var win = /** @type {any} */ (window);
            if (win.noa === this) delete win.noa;
        }

        this.inputs = null;
        this.rendering = null;
        this.text = null;
        this.container = null;
        this.entities = null;
        this.world = null;
        this.physics = null;
    }







    /*
     *              Rebasing local <-> global coords
    */


    /** 
     * Precisely converts a world position to the current internal 
     * local frame of reference.
     * 
     * See `/docs/positions.md` for more info.
     * 
     * Params: 
     *  * `global`: input position in global coords
     *  * `globalPrecise`: (optional) sub-voxel offset to the global position
     *  * `local`: output array which will receive the result
     */
    globalToLocal(global, globalPrecise, local) {
        var off = this.worldOriginOffset;
        if (globalPrecise) {
            for (var i = 0; i < 3; i++) {
                var coord = global[i] - off[i];
                coord += globalPrecise[i];
                local[i] = coord;
            }
            return local
        } else {
            return glVec3.sub(local, global, off)
        }
    }

    /** 
     * Precisely converts a world position to the current internal 
     * local frame of reference.
     * 
     * See `/docs/positions.md` for more info.
     * 
     * Params: 
     *  * `local`: input array of local coords
     *  * `global`: output array which receives the result
     *  * `globalPrecise`: (optional) sub-voxel offset to the output global position
     * 
     * If both output arrays are passed in, `global` will get int values and 
     * `globalPrecise` will get fractional parts. If only one array is passed in,
     * `global` will get the whole output position.
    */
    localToGlobal(local, global, globalPrecise = null) {
        var off = this.worldOriginOffset;
        if (globalPrecise) {
            for (var i = 0; i < 3; i++) {
                var floored = Math.floor(local[i]);
                global[i] = floored + off[i];
                globalPrecise[i] = local[i] - floored;
            }
            return global
        } else {
            return glVec3.add(global, local, off)
        }
    }




    /*
     *              Picking / raycasting
    */

    /**
     * Raycast through the world, returning a result object for any non-air block
     * 
     * See `/docs/positions.md` for info on working with precise positions.
     * 
     * @param {number[]} pos where to pick from (default: player's eye pos)
     * @param {number[]} dir direction to pick along (default: camera vector)
     * @param {number} dist pick distance (default: `noa.blockTestDistance`)
     * @param {(id:number) => boolean} blockTestFunction which voxel IDs can be picked (default: any solid voxel)
    */
    pick(pos = null, dir = null, dist = -1, blockTestFunction = null) {
        if (dist === 0) return null
        // input position to local coords, if any
        var pickPos = this._pickPos;
        if (pos) {
            this.globalToLocal(pos, null, pickPos);
            pos = pickPos;
        }
        var internal = this._localPick(pos, dir, dist, blockTestFunction);
        return internal ? clonePickResult(internal) : null
    }


    /**
     * @internal
     * Do a raycast in local coords. 
     * See `/docs/positions.md` for more info.
     * @param {number[]} pos where to pick from (default: player's eye pos)
     * @param {number[]} dir direction to pick along (default: camera vector)
     * @param {number} dist pick distance (default: `noa.blockTestDistance`)
     * @param {(id:number) => boolean} blockTestFunction which voxel IDs can be picked (default: any solid voxel)
     * @returns { null | {
     *      position: number[],
     *      normal: number[],
     *      _localPosition: number[],
     * }}
     */
    _localPick(pos = null, dir = null, dist = -1, blockTestFunction = null) {
        // do a raycast in local coords - result obj will be in global coords
        if (dist === 0) return null
        var testFn = blockTestFunction || this.registry.getBlockSolidity;
        this._pickTestFunction = testFn;
        if (!pos) pos = this.camera._localGetTargetPosition();
        dir = dir || this.camera.getDirection();
        dist = dist || -1;
        if (dist < 0) dist = this.blockTestDistance;
        var result = this._pickResult;
        var rpos = result._localPosition;
        var rnorm = result.normal;
        var hit = raycast(this._pickTestVoxel, pos, dir, dist, rpos, rnorm);
        this._pickTestFunction = null;
        if (!hit) return null
        // position is right on a voxel border - adjust it so that flooring works reliably
        // adjust along normal direction, i.e. away from the block struck
        glVec3.scaleAndAdd(rpos, rpos, rnorm, 0.01);
        // add global result
        this.localToGlobal(rpos, result.position);
        return result
    }

}


function clonePickResult(res) {
    return {
        position: res.position.slice(),
        normal: res.normal.slice(),
        _localPosition: glVec3.clone(res._localPosition),
    }
}


/*
 * 
 * 
 * 
 *                  INTERNAL HELPERS
 * 
 * 
 * 
 * 
*/




/*
 *
 *      rebase world origin offset around the player if necessary
 *
*/
function checkWorldOffset(noa) {
    var lpos = noa.ents.getPositionData(noa.playerEntity)._localPosition;
    var cutoff = noa._originRebaseDistance;
    var lposLen2 = Number(glVec3.sqrLen(lpos));
    if (lposLen2 < cutoff * cutoff) return
    var delta = [];
    for (var i = 0; i < 3; i++) {
        delta[i] = Math.floor(lpos[i]);
        noa.worldOriginOffset[i] += delta[i];
    }
    noa.rendering._rebaseOrigin(delta);
    noa.entities._rebaseOrigin(delta);
    noa._objectMesher._rebaseOrigin(delta);
    // Notify text shadow manager if it exists
    if (noa.text && noa.text._shadowManager) {
        noa.text._shadowManager._rebaseOrigin(delta);
    }
}





// Each frame, by default pick along the player's view vector
// and tell rendering to highlight the struck block face
function updateBlockTargets(noa) {
    var newhash = 0;
    var blockIdFn = noa.blockTargetIdCheck || noa.registry.getBlockSolidity;
    var result = noa._localPick(null, null, null, blockIdFn);
    if (result) {
        var dat = noa._targetedBlockDat;
        // pick stops just shy of voxel boundary, so floored pos is the adjacent voxel
        glVec3.floor(dat.adjacent, result.position);
        glVec3.copy(dat.normal, result.normal);
        glVec3.sub(dat.position, dat.adjacent, dat.normal);
        dat.blockID = noa.world.getBlockID(dat.position[0], dat.position[1], dat.position[2]);
        noa.targetedBlock = dat;
        // arbitrary hash so we know when the targeted blockID/pos/face changes
        var pos = dat.position, norm = dat.normal;
        var x = locationHasher(pos[0] + dat.blockID, pos[1], pos[2]);
        x ^= locationHasher(norm[0], norm[1] + dat.blockID, norm[2]);
        newhash = x;
    } else {
        noa.targetedBlock = null;
    }
    if (newhash != noa._prevTargetHash) {
        noa.emit('targetBlockChanged', noa.targetedBlock);
        noa._prevTargetHash = newhash;
    }
}



/*
 * 
 *  add some hooks for guidance on removed APIs
 * 
 */

function deprecateStuff(noa) {
    var ver = `0.27`;
    var dep = (loc, name, msg) => {
        var throwFn = () => { throw `This property changed in ${ver} - ${msg}` };
        Object.defineProperty(loc, name, { get: throwFn, set: throwFn });
    };
    dep(noa, 'getPlayerEyePosition', 'to get the camera/player offset see API docs for `noa.camera.cameraTarget`');
    dep(noa, 'setPlayerEyePosition', 'to set the camera/player offset see API docs for `noa.camera.cameraTarget`');
    dep(noa, 'getPlayerPosition', 'use `noa.ents.getPosition(noa.playerEntity)` or similar');
    dep(noa, 'getCameraVector', 'use `noa.camera.getDirection`');
    dep(noa, 'getPlayerMesh', 'use `noa.ents.getMeshData(noa.playerEntity).mesh` or similar');
    dep(noa, 'playerBody', 'use `noa.ents.getPhysicsBody(noa.playerEntity)`');
    dep(noa.rendering, 'zoomDistance', 'use `noa.camera.zoomDistance`');
    dep(noa.rendering, '_currentZoom', 'use `noa.camera.currentZoom`');
    dep(noa.rendering, '_cameraZoomSpeed', 'use `noa.camera.zoomSpeed`');
    dep(noa.rendering, 'getCameraVector', 'use `noa.camera.getDirection`');
    dep(noa.rendering, 'getCameraPosition', 'use `noa.camera.getLocalPosition`');
    dep(noa.rendering, 'getCameraRotation', 'use `noa.camera.heading` and `noa.camera.pitch`');
    dep(noa.rendering, 'setCameraRotation', 'to customize camera behavior see API docs for `noa.camera`');
    ver = '0.28';
    dep(noa.rendering, 'makeMeshInstance', 'removed, use Babylon\'s `mesh.createInstance`');
    dep(noa.world, '_maxChunksPendingCreation', 'use `maxChunksPendingCreation` (no "_")');
    dep(noa.world, '_maxChunksPendingMeshing', 'use `maxChunksPendingMeshing` (no "_")');
    dep(noa.world, '_maxProcessingPerTick', 'use `maxProcessingPerTick` (no "_")');
    dep(noa.world, '_maxProcessingPerRender', 'use `maxProcessingPerRender` (no "_")');
    ver = '0.29';
    dep(noa, '_constants', 'removed, voxel IDs are no longer packed with bit flags');
    ver = '0.30';
    dep(noa, '_tickRate', 'tickRate is now at `noa.tickRate`');
    dep(noa.container, '_tickRate', 'tickRate is now at `noa.tickRate`');
    ver = '0.31';
    dep(noa.world, 'chunkSize', 'effectively an internal, so changed to `_chunkSize`');
    dep(noa.world, 'chunkAddDistance', 'set this with `noa.world.setAddRemoveDistance`');
    dep(noa.world, 'chunkRemoveDistance', 'set this with `noa.world.setAddRemoveDistance`');
    ver = '0.33';
    dep(noa.rendering, 'postMaterialCreationHook', 'Removed - use mesh post-creation hook instead`');
}

Object.defineProperty(exports, "CreateDisc", {
	enumerable: true,
	get: function () { return discBuilder.CreateDisc; }
});
Object.defineProperty(exports, "TransformNode", {
	enumerable: true,
	get: function () { return transformNode.TransformNode; }
});
Object.defineProperty(exports, "Texture", {
	enumerable: true,
	get: function () { return texture.Texture; }
});
Object.defineProperty(exports, "Mesh", {
	enumerable: true,
	get: function () { return mesh.Mesh; }
});
Object.defineProperty(exports, "VertexData", {
	enumerable: true,
	get: function () { return mesh_vertexData.VertexData; }
});
Object.defineProperty(exports, "Quaternion", {
	enumerable: true,
	get: function () { return math_vector.Quaternion; }
});
Object.defineProperty(exports, "Vector3", {
	enumerable: true,
	get: function () { return math_vector.Vector3; }
});
Object.defineProperty(exports, "Scene", {
	enumerable: true,
	get: function () { return scene.Scene; }
});
Object.defineProperty(exports, "Color3", {
	enumerable: true,
	get: function () { return math_color.Color3; }
});
Object.defineProperty(exports, "Color4", {
	enumerable: true,
	get: function () { return math_color.Color4; }
});
Object.defineProperty(exports, "DirectionalLight", {
	enumerable: true,
	get: function () { return directionalLight.DirectionalLight; }
});
Object.defineProperty(exports, "HemisphericLight", {
	enumerable: true,
	get: function () { return hemisphericLight.HemisphericLight; }
});
Object.defineProperty(exports, "MeshBuilder", {
	enumerable: true,
	get: function () { return meshBuilder.MeshBuilder; }
});
Object.defineProperty(exports, "StandardMaterial", {
	enumerable: true,
	get: function () { return standardMaterial.StandardMaterial; }
});
Object.defineProperty(exports, "ShaderMaterial", {
	enumerable: true,
	get: function () { return shaderMaterial.ShaderMaterial; }
});
Object.defineProperty(exports, "SceneLoader", {
	enumerable: true,
	get: function () { return sceneLoader.SceneLoader; }
});
Object.defineProperty(exports, "CreatePlane", {
	enumerable: true,
	get: function () { return planeBuilder.CreatePlane; }
});
Object.defineProperty(exports, "CreateLines", {
	enumerable: true,
	get: function () { return linesBuilder.CreateLines; }
});
Object.defineProperty(exports, "Material", {
	enumerable: true,
	get: function () { return material.Material; }
});
Object.defineProperty(exports, "InstancedMesh", {
	enumerable: true,
	get: function () { return instancedMesh.InstancedMesh; }
});
Object.defineProperty(exports, "CreateBox", {
	enumerable: true,
	get: function () { return boxBuilder.CreateBox; }
});
Object.defineProperty(exports, "CreateCylinder", {
	enumerable: true,
	get: function () { return cylinderBuilder.CreateCylinder; }
});
Object.defineProperty(exports, "CreateSphere", {
	enumerable: true,
	get: function () { return sphereBuilder.CreateSphere; }
});
Object.defineProperty(exports, "Skeleton", {
	enumerable: true,
	get: function () { return skeleton.Skeleton; }
});
Object.defineProperty(exports, "Animation", {
	enumerable: true,
	get: function () { return animation.Animation; }
});
Object.defineProperty(exports, "AnimationGroup", {
	enumerable: true,
	get: function () { return animationGroup.AnimationGroup; }
});
exports.Engine = Engine;
//# sourceMappingURL=noa.cjs.js.map
