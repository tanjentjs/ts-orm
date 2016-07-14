// DO NOT REMOVE THIS IMPORT it is required for this file to function
// tslint:disable-next-line:no-unused-variable
import * as reflectMetadata from 'reflect-metadata';
import * as sequelize from 'sequelize';
import * as _ from 'lodash';

import { Types } from '../shared/Types';
import { IDataConnection } from '../shared/DataObject';
import { connection } from './connect';
import {DataContract} from './DataContract';

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
					case Types.bigInt:
						model[fieldName] = {
							type: sequelize.BIGINT
						};
						break;
					case Types.dateTimeTz:
						model[fieldName] = {
							type: sequelize.DATE
						};
						break;
					case Types.dateTimeTz:
						model[fieldName] = {
							type: sequelize.DATE
						};
						break;
					default:
						throw new TypeError(
							'Field of unknown type found! ' +
							'Field Name:' + fieldName + ' ' +
							'Field Type: ' + type
						);
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
		return this.model.findById(id)
			.then((sqlData: any): Promise<T> | T => {
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
		return <any> this.model
			.findAll({
				include: [{ all: true }],
				where: criteria
			})
			.then((data: any[]) => {
				let ret: T[] = [];
				_.forEach(data, (value: any) => {
					ret.push(new (this.getContract())(value, this.model));
				});
				return ret;
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
