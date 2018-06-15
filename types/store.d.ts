/**
 * @module Store
 * @license MIT
 * @see https://github.com/jamiebuilds/unstated/blob/master/src/unstated.js
 */
/// <reference types="react" />
declare type Updater = React.ComponentState | ((prevState: React.ComponentState) => React.ComponentState);
/**
 * @class Store
 */
export default class Store {
    [key: string]: any;
    private '<state>';
    private readonly '<listeners>';
    /**
     * @function blacklist
     * @param prop
     */
    static blacklist(prop: string): boolean;
    /**
     * @constructor
     * @param defaultState
     */
    constructor(defaultState?: React.ComponentState);
    readonly state: React.ComponentState;
    /**
     * @method setState
     * @param updater
     * @param callback
     */
    setState(updater: Updater, callback?: () => void): Promise<void>;
    /**
     * @method subscribe
     * @param fn
     */
    subscribe(fn: () => void): void;
    /**
     * @method unsubscribe
     * @param fn
     */
    unsubscribe(fn: () => void): void;
}
export {};
