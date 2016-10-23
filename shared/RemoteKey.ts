import {BaseContract} from "./BaseContract";
import {BaseConnection} from "./BaseConnection";

export class RemoteKey<T extends BaseContract> {
	constructor(
		private contract: BaseContract,
		private connection: BaseConnection<BaseContract>,
		private field: string,
		private remoteField: string,
		private destType: new (...args: any[]) => T
	) { /* */ }

	public fetch(): Promise<T> {
		return this.connection.fetchOneRemote<T>(this.contract, this.destType, this.field, this.remoteField);
	}
	public set(item: T): Promise<void> {
		return this.fetch()
			.then((oldItem: T) => this.connection.removeRelated(this.contract, oldItem, this.destType, this.remoteField))
			.then(() => this.connection.addRelated(this.contract, item, this.destType, this.remoteField));
	}
}
