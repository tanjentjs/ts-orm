import * as Sequelize from 'sequelize';
import {Injectable, Injector} from '@angular/core';

import {ConnectionWorker} from '../shared/ConnectionWorker';
import {BaseContract, BaseContractConstruct} from '../shared/BaseContract';
import {BaseConnection} from "../shared/BaseConnection";
import {WhereOptions} from "../shared/WhereTypes";
import {Types} from "../shared/Types";
import {IFieldConfig} from "../shared/Field";
import {fetchables} from "../shared/Fetchable";

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

	constructor(private injector: Injector) {}

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

	public fetchMany<T extends BaseContract, U extends BaseContract>(
		contract: T,
		destType: BaseContractConstruct<U>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<U[]> {}

	public fetchOne<T extends BaseContract, U extends BaseContract>(
		contract: T,
		destType: BaseContractConstruct<U>,
		field: string,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<U> {
		return this.getModel(destType)
			.then((model) => model.findById((<IStorage> contract._connectionStorage).instance[field]))
			.then(this.createContractFn(
				this.injector.get(fetchables[this.getName(destType)]),
				destType
			));
	}

	public addRelated<T extends BaseContract, U extends BaseContract>(
		contract: T,
		addContract: U,
		destType: BaseContractConstruct<T>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<void> {}

	public removeRelated<T extends BaseContract, U extends BaseContract>(
		contract: T,
		remContract: U,
		destType: BaseContractConstruct<T>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<void> {}

	public setRelated<T extends BaseContract, U extends BaseContract>(
		contract: T,
		setContract: U,
		field: string,
		destType: BaseContractConstruct<T>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<void> {
		(<IStorage> contract._connectionStorage).instance[field] = setContract.id;
		return contract.save().then(() => { /* */ });
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
			if (!newInstance) {
				return Promise.reject('Failed to find instance! (' + parent.constructor.name + ')');
			} else {
				const ret = new type(parent);
				(<IStorage> ret._connectionStorage).instance = newInstance;
				return this.getModel(type).then((model) => {
					(<IStorage> ret._connectionStorage).model = model;
					return ret;
				};
			}
		};
	}

	private getModel<T extends BaseContract>(type: BaseContractConstruct<T>): Promise<Sequelize.Model> {
		if (!this.models[this.getName(type)]) {
			const fields: IFieldConfig[] = Reflect.getMetadata('fields', type) || {};
			const sequelizeFields = {};
			const relatedPromises = [];

			// tslint:ignore-next-line:forin
			for (const i in fields) {
				sequelizeFields[i] = {};

				switch (fields[i].type) {
					case Types.string:
						sequelizeFields[i].type = Sequelize.STRING;
						break;
					case Types.foreignKey:
						relatedPromises.push(this.getModel(fields[i].related())
							.then((relatedModel: Sequelize.Model) => {
								sequelizeFields[i] = {
									type: Sequelize.DataTypes.INTEGER,
									references: relatedModel.getTableName(),
									referencesKey: "id"
								};
							}));
						break;
					case Types.remoteKeys:
						delete sequelizeFields[i];
						break; // The one side does not contain the config info
					default:
						throw new Error(fields[i].type + ' is not supported');
				}
			}

			return Promise.all(relatedPromises)
				.then(() => {
					const definition = sequelize.define(this.getName(type), sequelizeFields);
					this.models[this.getName(type)] = definition;
					return definition.sync().then(() => definition);
				});
		}
		return Promise.resolve(this.models[this.getName(type)]);
	}

	private getName<T extends BaseContract>(type: BaseContractConstruct<T>): string {
		return Reflect.getMetadata('name', type);
	}
}
