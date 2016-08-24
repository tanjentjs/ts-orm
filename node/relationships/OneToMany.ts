import * as sequelize from 'sequelize';

import {DataContract, IDataContractConstruct, getFieldsSources} from '../DataContract';
import {Relationship} from "./Relationship";

export class OneToMany<T extends DataContract> extends Relationship<T, T[]> {
	public static fetch<U extends DataContract>(
		from: DataContract,
		target: IDataContractConstruct<U>
	): Promise<U[]> {
		return target.getSequelizeModel()
			.then((targetModel: sequelize.Model<any, any>): U[] | Promise<U[]> => {
				try {
					const idName: string = (<any> targetModel).name + 'Id';
					const where: any = {};
					where[idName] = from.id;
					return targetModel.findAll({where: where}).then(
						(data: any[]) => {
							const ret: U[] = [];

							// tslint:disable-next-line:forin
							for (const i in data) {
								ret.push(new target(data[i]));
							}
							return ret;
						}
					);
				} catch (e) {
					/* istanbul ignore next */
					return <any> Promise.reject(e);
				}
			});
	}

	public static addRelationship(
		srcModel: sequelize.Model<any, any>,
		destModel: sequelize.Model<any, any>
	): void {
		destModel.belongsTo(destModel);
		srcModel.hasMany(srcModel);
	}

	/** Note: This will only be set after a new value is set to this object and isFirst returns true */
	private idName: string = null;

	protected internalSet(newModel: T[], updateRelated: boolean): Promise<any | void> {
		if (updateRelated) {
			return this.target().getSequelizeModel().then(
				(targetModel: sequelize.Model<any, any>) => {
					try {
						// TODO

						if (updateRelated) {
							// TODO
						}
					} catch (e) {
						/* istanbul ignore next */
						return Promise.reject(e);
					}
				}
			);
		} else {
			return Promise.resolve();
		}
	}

	protected getValue(): Promise<T[]> {
		return OneToMany.fetch<T>(this.parent, this.target());
	}
}
