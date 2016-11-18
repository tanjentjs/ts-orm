import {BaseConnection} from './BaseConnection';
import {IFieldConfig} from "./Field";
import {Types} from "./Types";
import {ForeignKey} from "./ForeignKey";

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
				fields[i].type !== Types.remoteKeys &&
				!fields[i].noApi
			) {
				ret[i] = this[i];
			} else if (fields[i].type === Types.foreignKey && !fields[i].noApi) {
				ret[i] = (<ForeignKey<any>> this[i]).id;
			}
		}
		ret.id = this.id;
		return ret;
	}
}
