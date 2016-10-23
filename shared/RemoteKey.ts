import {BaseContract} from "./BaseContract";
import {BaseConnection} from "./BaseConnection";

export class RemoteKey<T extends BaseContract> {
	constructor(
		private contract: BaseContract,
		private connection: BaseConnection<BaseContract>,
		private remoteField: string,
		private destType: new (...args: any[]) => T
	) { /* */ }

	public fetch(): Promise<T> {
		return this.connection.fetchOneRemote<T>(this.contract, this.destType, this.remoteField);
	}
	public add(item: T): Promise<void> {
		return this.connection.addRelated(this.contract, item, this.destType, this.remoteField);
	}
	public remove(item: T): Promise<void> {
		return this.connection.removeRelated(this.contract, item, this.destType, this.remoteField);
	}
}