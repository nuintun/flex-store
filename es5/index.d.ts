/**
 * @module index
 * @license MIT
 * @see https://reactjs.org/docs/context.html
 */
import React from 'react';
import Store from './store';
declare type StoreContext = {
    store: Store;
    context: React.Context<React.ComponentState>;
};
/**
 * @function create
 * @param defaultState
 * @param updater
 */
export declare function create(defaultState?: React.ComponentState, updater?: {
    [key: string]: () => void;
}): StoreContext;
/**
 * @function mount
 * @param store
 * @param mapToProp
 */
export declare function mount({ store, context }: StoreContext, mapToProp?: string): (Component: React.ComponentClass<any> | React.StatelessComponent<any>) => React.ComponentType<React.Props<any> & React.ClassAttributes<any>>;
/**
 * @function connect
 * @param store
 * @param mapToProp
 */
export declare function connect(store: StoreContext, mapToProp?: string): (Component: React.ComponentClass<any> | React.StatelessComponent<any>) => React.ComponentType<React.Props<any> & React.ClassAttributes<any>>;
export {};
