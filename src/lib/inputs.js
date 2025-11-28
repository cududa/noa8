import { EventEmitter } from 'events'

var defaultOptions = {
    preventDefaults: false,
    stopPropagation: false,
    allowContextMenu: false,
    disabled: false,
}

var defaultBindings = {
    "forward": ["KeyW", "ArrowUp"],
    "backward": ["KeyS", "ArrowDown"],
    "left": ["KeyA", "ArrowLeft"],
    "right": ["KeyD", "ArrowRight"],
    "fire": ["Mouse1"],
    "mid-fire": ["Mouse2", "KeyQ"],
    "alt-fire": ["Mouse3", "KeyE"],
    "jump": ["Space"],
}

/**
 * Lightweight re-implementation of the `game-inputs` module used earlier by noa.
 * Adds deterministic cleanup so instances can be garbage-collected safely.
 */
class GameInputsLike {

    constructor(domElement, options) {
        var opts = Object.assign({}, defaultOptions, options || {})
        this.version = 'noa-inputs'
        this.element = domElement || document
        this.preventDefaults = !!opts.preventDefaults
        this.stopPropagation = !!opts.stopPropagation
        this.allowContextMenu = !!opts.allowContextMenu
        this.disabled = !!opts.disabled

        this.filterEvents = (ev, bindingName) => true

        this.down = new EventEmitter()
        this.up = new EventEmitter()

        this.state = {}
        this.pointerState = {
            dx: 0,
            dy: 0,
            scrollx: 0,
            scrolly: 0,
            scrollz: 0,
        }
        this.pressCount = {}
        this.releaseCount = {}

        this._keyBindmap = {}
        this._keyStates = {}
        this._bindPressCount = {}
        this._touches = { lastX: 0, lastY: 0, currID: null }
        this._pressedDuringMeta = {}
        this._domListeners = []

        if (document.readyState !== 'loading') {
            initEvents(this)
        } else {
            var onReady = () => initEvents(this)
            this._trackDomListener(document, 'DOMContentLoaded', onReady, { once: true })
        }
    }

    bind(bindingName, ...keys) {
        keys.forEach(code => {
            var bindings = this._keyBindmap[code] || []
            if (bindings.includes(bindingName)) return
            bindings.push(bindingName)
            this._keyBindmap[code] = bindings
        })
        this.state[bindingName] = !!this.state[bindingName]
        this.pressCount[bindingName] = this.pressCount[bindingName] || 0
        this.releaseCount[bindingName] = this.releaseCount[bindingName] || 0
    }

    unbind(bindingName) {
        for (var code in this._keyBindmap) {
            var bindings = this._keyBindmap[code]
            var i = bindings.indexOf(bindingName)
            if (i > -1) bindings.splice(i, 1)
        }
    }

    getBindings() {
        var res = {}
        for (var code in this._keyBindmap) {
            var bindings = this._keyBindmap[code]
            bindings.forEach(bindingName => {
                res[bindingName] = res[bindingName] || []
                res[bindingName].push(code)
            })
        }
        return res
    }

    tick() {
        zeroAllProperties(this.pointerState)
        zeroAllProperties(this.pressCount)
        zeroAllProperties(this.releaseCount)
    }

    dispose() {
        while (this._domListeners.length) {
            var entry = this._domListeners.pop()
            entry.target.removeEventListener(entry.type, entry.handler, entry.options)
        }
        this.down.removeAllListeners()
        this.up.removeAllListeners()
        this.element = null
    }

    _trackDomListener(target, type, handler, options) {
        target.addEventListener(type, handler, options)
        this._domListeners.push({ target, type, handler, options })
    }
}

export class Inputs extends GameInputsLike {
    constructor(noa, opts = {}, element) {
        super(element, opts)
        var bindings = cloneBindings(opts.bindings || defaultBindings)
        for (var name in bindings) {
            this.bind(name, ...bindings[name])
        }
    }
}

function cloneBindings(map) {
    var res = {}
    for (var name in map) {
        var val = map[name]
        if (Array.isArray(val)) res[name] = val.slice()
        else res[name] = [val]
    }
    return res
}

function zeroAllProperties(obj) {
    for (var key in obj) obj[key] = 0
}

function initEvents(inputs) {
    var keyDown = onKeyEvent.bind(null, inputs, true)
    var keyUp = onKeyEvent.bind(null, inputs, false)
    inputs._trackDomListener(window, 'keydown', keyDown, false)
    inputs._trackDomListener(window, 'keyup', keyUp, false)

    var pointerOpts = { passive: true }
    if (window.PointerEvent) {
        var down = onPointerEvent.bind(null, inputs, true)
        var up = onPointerEvent.bind(null, inputs, false)
        var move = onPointerMove.bind(null, inputs)
        inputs._trackDomListener(inputs.element, 'pointerdown', down, pointerOpts)
        inputs._trackDomListener(window.document, 'pointerup', up, pointerOpts)
        inputs._trackDomListener(inputs.element, 'pointermove', move, pointerOpts)
    } else {
        var mDown = onPointerEvent.bind(null, inputs, true)
        var mUp = onPointerEvent.bind(null, inputs, false)
        var mMove = onPointerMove.bind(null, inputs)
        inputs._trackDomListener(inputs.element, 'mousedown', mDown, pointerOpts)
        inputs._trackDomListener(window.document, 'mouseup', mUp, pointerOpts)
        inputs._trackDomListener(inputs.element, 'mousemove', mMove, pointerOpts)
    }
    inputs._trackDomListener(inputs.element, 'wheel', onWheelEvent.bind(null, inputs), pointerOpts)
    inputs._trackDomListener(inputs.element, 'contextmenu', onContextMenu.bind(null, inputs), false)

    inputs._trackDomListener(window, 'blur', onWindowBlur.bind(null, inputs), false)
}

function onKeyEvent(inputs, nowDown, ev) {
    handleKeyEvent(ev.code, nowDown, inputs, ev)
    workaroundMacBug(nowDown, inputs, ev)
}

function onPointerEvent(inputs, nowDown, ev) {
    if ('pointerId' in ev) {
        if (nowDown) {
            if (inputs._touches.currID !== null) return
            inputs._touches.currID = ev.pointerId
        } else {
            if (inputs._touches.currID !== ev.pointerId) return
            inputs._touches.currID = null
        }
    }
    var button = ('button' in ev) ? (ev.button + 1) : 1
    handleKeyEvent('Mouse' + button, nowDown, inputs, ev)
    return false
}

function onPointerMove(inputs, ev) {
    if ('pointerId' in ev && inputs._touches.currID !== null) {
        if (inputs._touches.currID !== ev.pointerId) return
    }
    var dx = ev.movementX || ev.mozMovementX || 0
    var dy = ev.movementY || ev.mozMovementY || 0
    inputs.pointerState.dx += dx
    inputs.pointerState.dy += dy
}

function onWheelEvent(inputs, ev) {
    var scale = 1
    switch (ev.deltaMode) {
        case 0: scale = 1; break
        case 1: scale = 12; break
        case 2:
            scale = inputs.element.clientHeight || window.innerHeight
            break
    }
    inputs.pointerState.scrollx += (ev.deltaX || 0) * scale
    inputs.pointerState.scrolly += (ev.deltaY || 0) * scale
    inputs.pointerState.scrollz += (ev.deltaZ || 0) * scale
}

function onContextMenu(inputs, ev) {
    if (!inputs.allowContextMenu) {
        ev.preventDefault()
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
        })
    }
}

function handleKeyEvent(code, nowDown, inputs, ev) {
    var bindings = inputs._keyBindmap[code]
    if (!bindings) return

    var prevState = inputs._keyStates[code]
    if (XOR(prevState, nowDown)) {
        inputs._keyStates[code] = nowDown
        bindings.forEach(bindingName => {
            var allow = (inputs.filterEvents) ? inputs.filterEvents(ev, bindingName) : true
            if (!allow) return
            handleBindingEvent(bindingName, nowDown, inputs, ev)
        })
    }

    if (!('button' in ev)) {
        if (inputs.preventDefaults && !ev.defaultPrevented) ev.preventDefault()
        if (inputs.stopPropagation) ev.stopPropagation()
    }
}

function handleBindingEvent(bindingName, pressed, inputs, ev) {
    var counter = (pressed) ? inputs.pressCount : inputs.releaseCount
    counter[bindingName] = (counter[bindingName] || 0) + 1
    var ct = inputs._bindPressCount[bindingName] || 0
    ct += pressed ? 1 : -1
    if (ct < 0) ct = 0
    inputs._bindPressCount[bindingName] = ct

    var currstate = inputs.state[bindingName]
    if (XOR(currstate, ct)) {
        inputs.state[bindingName] = (ct > 0)
        var emitter = pressed ? inputs.down : inputs.up
        if (!inputs.disabled) emitter.emit(bindingName, ev)
    }
}

function XOR(a, b) {
    return a ? !b : b
}

function workaroundMacBug(down, inputs, ev) {
    var isMeta = /^Meta/.test(ev.code)
    if (ev.metaKey && !isMeta && down) {
        inputs._pressedDuringMeta[ev.code] = true
    } else if (isMeta && !down) {
        for (var code in inputs._pressedDuringMeta) {
            if (!inputs._keyStates[code]) continue
            if (/^Mouse\d/.test(code)) continue
            handleKeyEvent(code, false, inputs, {
                code: code,
                note: `This is a mocked KeyboardEvent made by the 'noa-inputs' module`,
                preventDefault: () => { },
                stopPropagation: () => { },
            })
        }
        inputs._pressedDuringMeta = {}
    }
}
