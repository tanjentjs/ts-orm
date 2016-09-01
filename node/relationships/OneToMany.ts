import * as sequelize from 'sequelize';

import {DataContract, IDataContractConstruct} from '../DataContract';
import {Relationship} from "./Relationship";
import {ManyToOne} from "./ManyToOne";

export class OneToMany<T extends DataContract> extends Relationship<T, T[]> {
	public static fetch<U extends DataContract>(
		from: DataContract,
		target: IDataContractConstruct<U>
	): Promise<U[]> {
		return target.getSequelizeModel()
			.then((targetModel: sequelize.Model<any, any>): U[] | Promise<U[] | void> => {
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
					return Promise.reject(e);
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

	protected internalSet(newModel: T[], updateRelated: boolean): Promise<any | void> {
		if (updateRelated) {
			return this.target().getSequelizeModel().then(
				(targetModel: sequelize.Model<any, any>): Promise<any | void> => {
					try {
						const promises: Promise<any>[] = [];

						// tslint:disable-next-line:forin
						for (const i in this.currentValue) {
							promises.push(
								(<ManyToOne<DataContract>> this.currentValue[i][this.getConnectedName()])
									.set(null)
							);
						}
						// tslint:disable-next-line:forin
						for (const i in newModel) {
							promises.push(
								this.currentValue[i][this.getConnectedName()].internalSet(this.parent, false).then(() => {
									this.currentValue[i][this.getConnectedName()].currentValue = this.parent;
								})
							);
						}

						return Promise.all(promises);
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
