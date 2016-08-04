import * as sequelize from 'sequelize';

import {DataContract, IDataContractConstruct} from '../DataContract';
import {connection} from '../connect';

export class RelationshipCache {
	private static cache: sequelize.Model<any, any>[] = [];

	public static get<
		T extends DataContract,
		U extends DataContract
	>(
		obj1: IDataContractConstruct<T>,
		obj2: IDataContractConstruct<U>
	): sequelize.Model<any, any> {
		const names = [];

		names[0] = Reflect.getMetadata('ORM:dbId', obj1);
		names[1] = Reflect.getMetadata('ORM:dbId', obj2);

		names.sort();

		const modelName = names[0] + '-' + names[1];

		if (!RelationshipCache.cache[modelName]) {
			const model = {};
			model[names[0]] = {
				type: sequelize.INTEGER
			};
			model[names[1]] = {
				type: sequelize.INTEGER
			};

			RelationshipCache.cache[modelName] = connection.define(names[0] + '-' + names[1], model);
			RelationshipCache.cache[modelName].sync();
		}

		return RelationshipCache.cache[modelName];
	}
}
