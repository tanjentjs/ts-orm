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

	public findById(id: number): Promise<T> {
		return this.worker.findById(id, this, this.getContract());
	}

	public fetchMany<U extends BaseContract>(contract: T, destType, field: string, remoteFeld: string): Promise<U[]> {
		return this.worker.fetchMany(contract, destType, field, remoteFeld, this, this.getContract());
	}

	public fetchOne<U extends BaseContract>(contract: T, destType, field: string): Promise<U> {
		return this.worker.fetchOne(contract, destType, field, this, this.getContract());
	}

	public fetchOneRemote<U extends BaseContract>(contract: T, destType, field: string, remoteField: string): Promise<U> {
		return this.worker.fetchOneRemote(contract, destType, field, remoteField, this, this.getContract());
	}

	public addRelated<U extends BaseContract>(contract: T, addContract: U, destType, remoteFeld: string): Promise<void> {
		return this.worker.addRelated(contract, addContract, remoteFeld, destType, this, this.getContract());
	}

	public removeRelated<U extends BaseContract>(contract: T, remContract: U, destType, remoteFeld: string): Promise<void> {
		return this.worker.removeRelated(contract, remContract, remoteFeld, destType, this, this.getContract());
	}

	public setRelated<U extends BaseContract>(contract: T, setContract: U, field: string, destType): Promise<void> {
		return this.worker.setRelated(contract, setContract, field, destType, this, this.getContract());
	}

	public getField(contract: T, field: string): any {
		return this.worker.getField(contract, field);
	}

	public setField(contract: T, field: string, value: any): any {
		return this.worker.setField(contract, field, value);
	}

	public abstract getContract(): new (...args: any[]) => T;
}
