import {BaseConnection} from './BaseConnection';

export type BaseContractConstruct<T extends BaseContract> = (parent: BaseConnection<T>) => T;

export abstract  class BaseContract {
	// This is used by the connection workers to store data about this element
	public _connectionStorage = {};
	constructor(private parent: BaseConnection<BaseContract>) {}
	public save(): this {
		return this.parent.save(this);
	}
}
