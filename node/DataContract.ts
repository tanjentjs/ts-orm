// DO NOT REMOVE THIS IMPORT it is required for this file to function
// tslint:disable-next-line:no-unused-variable
import * as reflectMetadata from 'reflect-metadata';
import * as sequelize from 'sequelize';
import * as moment from 'moment';
import * as _ from 'lodash';

import { field } from './field';
import { Types } from '../shared/Types';
import { IDataContract } from '../shared/DataObject';
import { logger } from './connect';

export interface IDataContractConstruct<T extends DataContract> {
	new (
		instance: any,
		model: sequelize.Model<any, any>
	): T;
	name?: string;
}

export abstract class DataContract implements IDataContract {
	// tslint:disable-next-line:no-unused-variable
	private static contract = true;

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
				const type: Types = Reflect.getMetadata('ORM:type', this, fields[i]);
				const hidden: boolean = Reflect.getMetadata('ORM:hidden', this, fields[i]);

				logger.info(
					'DataContract',
					(<any> this.constructor).name,
					'.',
					fields[i],
					'type',
					type,
					'hidden',
					hidden
				);

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

	public save(): Promise<this> {
		if (this.instance) {
			return this.instance.save().then(() => this);
		} else {
			return this.model.create(this.getFields()).then((sqlData: any) => {
				this.instance = sqlData;
				return this;
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

			const type: Types = Reflect.getMetadata('ORM:type', this, fieldName);
			const hidden: boolean = Reflect.getMetadata('ORM:hidden', this, fieldName);

			if (!hidden) {
				switch (type) {
					case(Types.dateTimeTz):
						returnObj[fieldName] = value && value.toISOString();
						break;
					default:
						returnObj[fieldName] = value;
				}
			}
		});
		return returnObj;
	}
}
