import * as sequelize from 'sequelize';

import {DataContract, IDataContractConstruct, getFieldsSources} from '../DataContract';
import {Relationship} from "./Relationship";
import {ManyToOne} from "./ManyToOne";

export class OneToOne<T extends DataContract> extends Relationship<T, T> {

	public static fetch<U extends DataContract>(
		from: DataContract,
		target: IDataContractConstruct<U>
	): Promise<U> {
		if ((<IDataContractConstruct<any>> from.constructor).isFirst(target)) {
			// If we are first and have the ID column the logic is identical to the many side of a many to one relationship
			return ManyToOne.fetch<U>(from, target);
		}
		return Promise.all(
			[
				target.getSequelizeModel(),
				(<any> from.constructor).getSequelizeModel()
			]
		).then((models: sequelize.Model<any, any>[]): U | Promise<U> => {
			const targetModel: sequelize.Model<any, any> = models[0];
			const fromModel: sequelize.Model<any, any> = models[1];
			try {
				const idName: string = (<any> fromModel).name + 'Id';
				const condition = {where: {}};
				condition.where[idName] = from.id;
				return targetModel.findOne(<any> condition).then(
					(data) => {
						if (data) {
							return new target(data);
						}
						return null;
					}
				);
			} catch (e) {
				/* istanbul ignore next */
				return <any> Promise.reject(e);
			}
		});
	}

	public static addRelationship(
		src: IDataContractConstruct<any>,
		srcModel: sequelize.Model<any, any>,
		dest: IDataContractConstruct<any>,
		destModel: sequelize.Model<any, any>
	): void {
		if (src.isFirst(dest)) {
			srcModel.belongsTo(destModel);
			destModel.hasOne(srcModel);
		} else {
			destModel.belongsTo(destModel);
			srcModel.hasOne(destModel);
		}
	}

	/** Note: This will only be set after a new value is set to this object and isFirst returns true */
	private idName: string = null;

	public setField(returnObj, reqSrc: getFieldsSources): any {
		if (reqSrc === getFieldsSources.save && this.idName) {
			if (this.currentValue) {
				returnObj[this.idName] = this.currentValue.id;
			} else {
				returnObj[this.idName] = null;
			}
		}
		return returnObj;
	}

	protected internalSet(newModel: T, updateRelated: boolean): Promise<any | void> {

		if ((<IDataContractConstruct<any>> this.parent.constructor).isFirst(this.target())) {
			return this.target().getSequelizeModel().then(
				(targetModel: sequelize.Model<any, any>) => {
					try {
						this.idName = (<any> targetModel).name + 'Id';

						if ((<any> this.parent).instance) {
							(<any> this.parent).instance.set(this.idName, newModel && newModel.id);
						}

						if (!newModel.createdAt) { // If the passed model is new
							this.needsIds.push(newModel);
						}
						if (updateRelated) {
							const rel: OneToOne<DataContract> = newModel[this.getConnectedName()];
							return rel
									.internalSet(this.parent, false)
									.then(() => {
										rel.currentValue = this.parent;
									});
						}
					} catch (e) {
						/* istanbul ignore next */
						return Promise.reject(e);
					}
				}
			);
		} else if (updateRelated) {
			return (<any> Promise).all(
				[
					(<any> this.parent.constructor).getSequelizeModel(),
					this.fetch()
				]
			).then((items): Promise<void | any> => {
				try {
					const promises: Promise<any>[] = [];
					const oldModel: T = items[1];

					if (oldModel) {
						const rel: OneToOne<DataContract> = oldModel[this.getConnectedName()];
						promises.push(
							rel
								.internalSet(this.parent, false)
								.then(() => {
									rel.currentValue = this.parent;
								})
						);
						this.needsSave.push(newModel);
					}

					if (newModel) {
						const rel: OneToOne<DataContract> = newModel[this.getConnectedName()];
						promises.push(
								rel
								.internalSet(this.parent, false)
								.then(() => {
									rel.currentValue = this.parent;
								})
						);
						this.needsSave.push(newModel);
					}
					return Promise.all(promises);
				} catch (e) {
					/* istanbul ignore next */
					return Promise.reject(e);
				}
			});
		} else {
			this.currentValue = newModel;
			return Promise.resolve();
		}
	}

	protected getValue(): Promise<T> {
		return OneToOne.fetch<T>(this.parent, this.target());
	}
}
