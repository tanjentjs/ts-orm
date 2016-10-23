import {BaseContract} from "./BaseContract";

export class ForeignKey<T extends BaseContract> {
	constructor(
		private contract: BaseContract,
		private connection: BaseConnection<BaseContract>,
		private field: string,
		private destType: new (...args: any[]) => T
	) { /* */ }

	public fetch(): Promise<T> {
		return this.connection.fetchOne<T>(this.contract, this.destType, this.field);
	}

	public set(item: T): Promise<void> {
		return this.connection.setRelated(this.contract, item, this.field, this.destType);
	}
}