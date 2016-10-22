import {BaseContract} from './BaseContract';
import {WhereOptions} from './WhereTypes';
import {ConnectionWorker} from './ConnectionWorker';

export abstract class BaseConnection<T extends BaseContract> {
	constructor(private worker: ConnectionWorker) {}

	// TODO: figure out the typing for initial
	public create(initial: any): Promise<T> {
		return this.worker.create(initial, this, this.getContract());
	}

	public save(contract: T): Promise<T> {
		return this.worker.save(contract, this, this.getContract());
	}

	public delete(contract: T): Promise<T[]> {
		return this.worker.delete(contract, this, this.getContract());
	}

	public find(where: WhereOptions<T>): Promise<T> {
		return this.worker.find(where, this, this.getContract());
	}

	public findAll(where: WhereOptions<T>): Promise<T[]> {
		return this.worker.findAll<T>(where, this, this.getContract());
	}

	public findById(id: number): Promise<T[]> {
		return this.worker.findById(id, this, this.getContract());
	}

	public getField(contract: T, field: string): any {
		return this.worker.getField(contract, field);
	}

	public setField(contract: T, field: string, value: any): any {
		return this.worker.setField(contract, field, value);
	}

	protected abstract getContract(): new (...args: any[]) => T;
}
