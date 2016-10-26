import {BaseConnection} from './BaseConnection';
import {IFieldConfig} from "./Field";
import {Types} from "./Types";

export type BaseContractConstruct<T extends BaseContract> = new (parent: BaseConnection<T>) => T;

export abstract  class BaseContract {
	// This is used by the connection workers to store data about this element
	public _connectionStorage = {};
	constructor(private parent: BaseConnection<BaseContract>) {}

	public get id(): number {
		return this.parent.getField(this, 'id');
	}

	public save(): Promise<this> {
		return this.parent.save(this);
	}

	public toJSON() {
		const fields: IFieldConfig[] = Reflect.getMetadata('fields', this.constructor);
		const ret: any = {};
		// tslint:ignore-next-line:forin
		for (const i in fields) {
			if (
				fields[i].type !== Types.foreignKey &&
				fields[i].type !== Types.remoteKey &&
				fields[i].type !== Types.remoteKeys
			) {
				ret[i] = this[i];
			}
		}
		ret.id = this.id;
		return ret;
	}
}
