// DO NOT REMOVE THIS IMPORT it is required for this file to function
// tslint:disable-next-line:no-unused-variable
import * as reflectMetadata from 'reflect-metadata';
import * as sequelize from 'sequelize';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as bunyan from 'bunyan';

import { field } from './field';
import { Types } from '../shared/Types';
import { IDataConnection, IDataContract, registeredClasses } from '../shared/DataObject';
import { connection } from './connect';

const logger = bunyan.createLogger({name: "ORM/DataObject"});

export function getInject() {
	return Array.from(registeredClasses.values());
}

export abstract class DataContract implements IDataContract {
	private get fields(): string[] {
		return Reflect.getMetadata('ORM:fields', this);
	}

	@field()
	public id: number;
	@field(Types.dateTimeTz)
	public createdAt: moment.Moment;
	@field(Types.dateTimeTz)
	public updatedAt: moment.Moment;

	constructor(
		private instance: any,
		private model: sequelize.Model<any, any>
	) {}

	public loadData(data: any): void {
		const fields: string[] = this.fields;
		for (const i in fields) {
			if (data[fields[i]] !== undefined) {
				// TODO: validation
				const type: Types = Reflect.getMetadata("ORM:type", this, fields[i]);
				switch (type) {
					case(Types.dateTimeTz):
						this[fields[i]] = moment(data[fields[i]]);
						break;
					default:
						this[fields[i]] = data[fields[i]];
				}
			}
		}
	}

	public serialize(): string {
		return JSON.stringify(this.toJSON());
	}

	public save(): Promise<void> {
		if (this.instance) {
			return this.instance.save();
		} else {
			return this.model.create(this.getFields()).then((sqlData: any) => {
				this.instance = sqlData;
			});
		}
	}

	public delete(): Promise<void> {
		if (this.instance) {
			return this.instance.destroy();
		} else {
			return <any> Promise.resolve();
		}
	}

	private toJSON(): any {
		const returnObj: any = this.getFields();
		returnObj.id = this.id;
		returnObj.createdAt = this.createdAt && this.createdAt.toISOString();
		returnObj.updatedAt = this.updatedAt && this.updatedAt.toISOString();
		return returnObj;
	}

	private getFields(): any {
		const returnObj: any = {};
		const fields: string[] = this.fields;
		_.forEach(fields, (fieldName: string) => {
			const value: any = this[fieldName];
			const type: Types = Reflect.getMetadata("ORM:type", this, fieldName);
			switch (type) {
				case(Types.dateTimeTz):
					returnObj[fieldName] = value.toISOString();
					break;
				default:
					returnObj[fieldName] = value;
			}
		});
		return returnObj;
	}
}

export abstract class DataConnection<T extends DataContract> implements IDataConnection<T> {

	private static syncedModels: {
		[modelName: string]: sequelize.Model<any, any>;
	} = {};

	private _dummyContract: T = null;
	private get dummyContract(): T {
		if (!this._dummyContract) {
			this._dummyContract = new (this.getContract())(null, null);
		}
		return this._dummyContract;
	}

	private _fields: string[] = [];
	private get fields(): string[] {
		if (!this._fields.length) {
			this._fields = Reflect.getMetadata('ORM:fields', this.dummyContract);
		}
		return this._fields;
	}

	private _promise: Promise<any> = null;
	public get promise(): Promise<any> {
		return this._promise;
	}

	// This is used in some of the decorators
	// tslint:disable-next-line:no-unused-variable
	private instance: any = null;

	private get model(): sequelize.Model<any, any> {
		return DataConnection.syncedModels[(<any> this.constructor).name];
	}
	private set model(val: sequelize.Model<any, any>) {
		DataConnection.syncedModels[(<any> this.constructor).name] = val;
		// TODO make updates more graceful
		val.sync();
	}

	constructor(injector?: any) {
		let className = (<any> this.constructor).name;

		if (!this.model) {
			const model: any = {};
			const fields: string[] = this.fields;
			_.forEach(fields, (fieldName) => {
				const type: Types = Reflect.getMetadata(
					"ORM:type",
					this.dummyContract,
					fieldName
				);

				switch (type) {
					case Types.string:
						model[fieldName] = {
							type: sequelize.STRING
						};
						break;
					case Types.float:
						model[fieldName] = {
							type: sequelize.FLOAT
						};
						break;
					case Types.integer:
						model[fieldName] = {
							type: sequelize.INTEGER
						};
						break;
					default:
						logger.error('Field of unknown type found!', {
							fieldName: fieldName,
							fieldType: type
						});
						break;
				}
			});
			this.model = connection.define(
				className,
				model,
				{
					freezeTableName: true // Model tableName will be the same as the model name
				}
			);
		}
	}

	public fetch(id: number): Promise<T> {
		return new Promise((res, rej) => {
			this.model.findById(id).then(res, rej);
		}).then((sqlData: any): Promise<T> | T => {
			if ( sqlData === null ) {
				return <any> Promise.reject('Not Found');
			} else {
				return new (this.getContract())(sqlData, this.model);
			}
		});
	}

	public create(): T {
		return new (this.getContract())(null, this.model);
	}

	public search(
		criteria: sequelize.WhereOptions | Array<sequelize.col | sequelize.and | sequelize.or | string>
	): Promise<T[]> {
		return new Promise((resolve, reject) => {
			this.model
				.findAll({
					include: [{ all: true }],
					where: criteria
				})
				.then((data: any[]) => {
					let ret: T[] = [];
					_.forEach(data, (value: any) => {
						ret.push(new (this.getContract())(value, this.model));
					});
					resolve(ret);
				}, reject);
		});
	}

	/**
	 * This feeds the data contract into the system
	 */
	protected abstract getContract(): new(
		instance: any,
		model: sequelize.Model<any, any>
	) => T;
}
