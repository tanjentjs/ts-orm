import * as Sequelize from 'sequelize';
import {Injectable} from '@angular/core';

import {ConnectionWorker} from '../shared/ConnectionWorker';
import {BaseContract, BaseContractConstruct} from '../shared/BaseContract';
import {BaseConnection} from "../shared/BaseConnection";
import {WhereOptions} from "../shared/WhereTypes";
import {Types} from "../shared/Types";

export type SaveOptions = Sequelize.InstanceSaveOptions;

export interface IStorage {
	model: Sequelize.Model;
	instance: Sequelize.Instance;
}

let sequelize: Sequelize.Sequelize;

export function connect(
	database: string,
	username: string,
	password: string,
	options: Sequelize.Options
) {
	sequelize = new Sequelize(database, username, password, options);
}

@Injectable()
export class SequelizeConnectionWorker extends ConnectionWorker {
	private models = {};

	// TODO: figure out the typing for initial
	public create<T extends BaseContract>(
		initial: any,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T> {
		return this.getModel(type)
			.then((model) => model.create(initial))
			.then(this.createContractFn(parent, type));
	}

	public save<T extends BaseContract>(
		contract: T,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T> {
		return (<IStorage> contract._connectionStorage)
			.instance
			.save()
			.then(this.updateContractFn(contract));
	}

	public delete<T extends BaseContract>(
		contract: T,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T[]> {
		return (<IStorage> contract._connectionStorage)
			.instance
			.destroy();
	}

	public find<T extends BaseContract>(
		where: WhereOptions<T>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T> {
		return this.getModel(type)
			.then((model) => model.find(where))
			.then(this.createContractFn(parent, type));
	}

	public findAll<T extends BaseContract>(
		where: WhereOptions<T>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T[]> {
		return this.getModel(type)
			.then((model) => model.findAll(where))
			.then((instances: Sequelize.Instance[]) => {
				const ret: T[] = [];
				const createContract = this.createContractFn(parent, type);

				// tslint:disable-next-line:forin
				for (const i in instances) {
					ret.push(createContract(instances[i]));
				}

				return Promise.all(ret);
			});
	}

	public findById<T extends BaseContract>(
		id: number,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T[]> {
		return this.getModel(type)
			.then((model) => model.findById(id))
			.then(this.createContractFn(parent, type));
	}

	public getField<T extends BaseContract>(contract: T, field: string): any {
		return (<IStorage> contract._connectionStorage).instance[field];
	}

	public setField<T extends BaseContract>(contract: T, field: string, value: any): any {
		return (<IStorage> contract._connectionStorage).instance[field] = value;
	}

	private updateContractFn<T extends BaseContract>(contract: T): (newInstance: Sequelize.Instance) => T {
		return (newInstance: Sequelize.Instance): T => {
			(<IStorage> contract._connectionStorage).instance = newInstance;
			return contract;
		};
	}

	private createContractFn<T extends BaseContract>(
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): (newInstance: Sequelize.Instance) => Promise<T> {
		return (newInstance: Sequelize.Instance) => {
			const ret = new type(parent);
			(<IStorage> ret._connectionStorage).instance = newInstance;
			return this.getModel(type).then((model) => {
				(<IStorage> ret._connectionStorage).model = model;
				return ret;
			};
		};
	}

	private getModel<T extends BaseContract>(type: BaseContractConstruct<T>): Promise<Sequelize.Model> {
		if (!this.models[this.getName(type)]) {
			const fields = Reflect.getMetadata('fields', type) || {};
			const sequelizeFields = {};

			// tslint:ignore-next-line:forin
			for (const i in fields) {
				sequelizeFields[i] = {};

				switch (fields[i].type) {
					case Types.string:
						sequelizeFields[i].type = Sequelize.STRING;
						break;
					default:
						throw new Error(fields[i].type + ' is not supported');
				}
			}

			const definition = sequelize.define(this.getName(type), sequelizeFields);
			this.models[type] = definition;
			return definition.sync().then(() => definition);
		}
		return Promise.resolve(this.models[this.getName(type)]);
	}

	private getName<T extends BaseContract>(type: BaseContractConstruct<T>): string {
		return Reflect.getMetadata('name', type);
	}
}
