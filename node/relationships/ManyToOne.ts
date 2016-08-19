import * as sequelize from 'sequelize';

import {DataContract, IDataContractConstruct, getFieldsSources} from '../DataContract';
import {Relationship} from "./Relationship";

export class ManyToOne<T extends DataContract> extends Relationship<T, T> {
	public static fetch<U extends DataContract>(
		from: DataContract,
		target: IDataContractConstruct<U>
	): Promise<U> {
		return target.getSequelizeModel()
			.then((targetModel: sequelize.Model<any, any>): U | Promise<U> => {
				try {
					const idName: string = (<any> targetModel).name + 'Id';
					if ((<any> from).instance) {
						const id: number = (<any> from).instance.get(idName);

						if (id !== null && id !== undefined) {
							return targetModel.findById(id).then(
								(data) => {
									return new target(data);
								}
							);
						}
					}
					return null;
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
		srcModel.belongsTo(destModel);
		destModel.hasMany(srcModel);
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
						// TODO
					}
				} catch (e) {
					/* istanbul ignore next */
					return Promise.reject(e);
				}
			}
		);
	}

	protected getValue(): Promise<T> {
		return ManyToOne.fetch<T>(this.parent, this.target());
	}
}
