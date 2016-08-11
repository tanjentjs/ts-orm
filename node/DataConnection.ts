// DO NOT REMOVE THIS IMPORT it is required for this file to function
// tslint:disable-next-line:no-unused-variable
import * as reflectMetadata from 'reflect-metadata';
import * as sequelize from 'sequelize';
import * as _ from 'lodash';

import { IDataConnection } from '../shared/DataObject';
import { DataContract, IDataContractConstruct } from './DataContract';

export abstract class DataConnection<T extends DataContract> implements IDataConnection<T> {

	private _dummyContract: T = null;
	private get dummyContract(): T {
		if (!this._dummyContract) {
			this._dummyContract = new (this.getContract())(null);
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

	private get model(): Promise<sequelize.Model<any, any>> {
		return this.getContract().getSequelizeModel();
	}

	// This is used in some of the decorators
	// tslint:disable-next-line:no-unused-variable
	private instance: any = null;

	constructor(injector?: any) {
		// Load the model once to make sure it gets created at initialization
		// instead of when it's first acted upon
		this.getContract().getSequelizeModel();
	}

	public fetch(id: number): Promise<T> {
		return this.model.then((model) => model.findById(id))
			.then((sqlData: any): Promise<T> | T => {
				if ( sqlData === null ) {
					return <any> Promise.reject('Not Found');
				} else {
					return new (this.getContract())(sqlData);
				}
			});
	}

	public create(): T {
		return new (this.getContract())(null);
	}

	public search(
		criteria: sequelize.WhereOptions | Array<sequelize.col | sequelize.and | sequelize.or | string>
	): Promise<T[]> {
		return <any> this.model
			.then((model) => model.findAll({
				include: [{ all: true }],
				where: criteria
			}))
			.then((data: any[]) => {
				let ret: T[] = [];
				_.forEach(data, (value: any) => {
					ret.push(new (this.getContract())(value));
				});
				return ret;
			});
	}

	/**
	 * This feeds the data contract into the system
	 */
	protected abstract getContract(): IDataContractConstruct<any>;
}
