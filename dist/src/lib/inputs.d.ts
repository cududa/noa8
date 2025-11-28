export class Inputs extends GameInputsLike {
    constructor(noa: any, opts: {}, element: any);
}
/**
 * Lightweight re-implementation of the `game-inputs` module used earlier by noa.
 * Adds deterministic cleanup so instances can be garbage-collected safely.
 */
declare class GameInputsLike {
    constructor(domElement: any, options: any);
    version: string;
    element: any;
    preventDefaults: boolean;
    stopPropagation: boolean;
    allowContextMenu: boolean;
    disabled: boolean;
    filterEvents: (ev: any, bindingName: any) => boolean;
    down: EventEmitter;
    up: EventEmitter;
    state: {};
    pointerState: {
        dx: number;
        dy: number;
        scrollx: number;
        scrolly: number;
        scrollz: number;
    };
    pressCount: {};
    releaseCount: {};
    _keyBindmap: {};
    _keyStates: {};
    _bindPressCount: {};
    _touches: {
        lastX: number;
        lastY: number;
        currID: any;
    };
    _pressedDuringMeta: {};
    _domListeners: any[];
    bind(bindingName: any, ...keys: any[]): void;
    unbind(bindingName: any): void;
    getBindings(): {};
    tick(): void;
    dispose(): void;
    _trackDomListener(target: any, type: any, handler: any, options: any): void;
}
import { EventEmitter } from 'events';
export {};
