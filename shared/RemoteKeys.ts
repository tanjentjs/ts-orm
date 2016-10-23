import {BaseContract} from "./BaseContract";
import {BaseConnection} from "./BaseConnection";

export class RemoteKeys<T extends BaseContract> {
	constructor(
		private contract: BaseContract,
		private connection: BaseConnection<BaseContract>,
		private field: string,
		private remoteFeld: string,
		private destType: new (...args: any[]) => T
	) { /* */ }

	public fetch(): Promise<T[]> {
		return this.connection.fetchMany<T>(this.contract, this.destType, this.field, this.remoteFeld);
	}
	public add(item: T): Promise<void> {
		return this.connection.addRelated(this.contract, item, this.destType, this.remoteFeld);
	}
	public remove(item: T): Promise<void> {
		return this.connection.removeRelated(this.contract, item, this.destType, this.remoteFeld);
	}
}