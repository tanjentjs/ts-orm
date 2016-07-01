// DO NOT REMOVE THIS IMPORT it is required for this file to function
// tslint:disable-next-line:no-unused-variable
import * as reflectMetadata from 'reflect-metadata';
import * as sequelize from 'sequelize';
import * as moment from 'moment';
import * as _ from 'lodash';

import { field } from './field';
import { Types } from '../shared/Types';
import { IDataContract } from '../shared/DataObject';

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
					returnObj[fieldName] = value && value.toISOString();
					break;
				default:
					returnObj[fieldName] = value;
			}
		});
		return returnObj;
	}
}
