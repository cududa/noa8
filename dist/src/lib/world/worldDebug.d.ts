/** Profile hook for world tick timing */
export const profile_hook: (state: any) => void;
/** Profile hook for chunk queue flow monitoring */
export const profile_queues_hook: (arg0: string, arg1?: import("./index.js").World | undefined) => void;
/**
 * Debug reporting class for World diagnostics.
 */
export class WorldDebug {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world: import("./index.js").World);
    /** @type {import('./index.js').World} */
    world: import("./index.js").World;
    /** @internal */
    report(): void;
    /**
     * @param {string} name
     * @param {[number, number, number][]} arr
     * @param {boolean} ext
     */
    _report(name: string, arr: [number, number, number][], ext: boolean): void;
}
