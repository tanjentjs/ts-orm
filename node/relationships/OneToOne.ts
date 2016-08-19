import * as sequelize from 'sequelize';

import {DataContract, IDataContractConstruct, getFieldsSources} from '../DataContract';

export class OneToOne<T extends DataContract> {

	public static fetch<U extends DataContract>(
		from: DataContract,
		target: IDataContractConstruct<U>
	): Promise<U> {
		return Promise.all(
			[
				target.getSequelizeModel(),
				(<any> from.constructor).getSequelizeModel()
			]
		).then((models: sequelize.Model<any, any>[]): U | Promise<U> => {
			const targetModel: sequelize.Model<any, any> = models[0];
			const fromModel: sequelize.Model<any, any> = models[1];
			try {
				if ((<IDataContractConstruct<any>> from.constructor).isFirst(target)) {
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
				} else {
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
				}
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

	private connectedName: string = null;
	private currentValue: T = null;
	/** Note: This will only be set after a new value is set to this object and isFirst returns true */
	private idName: string = null;
	private changedModels: DataContract[] = [];

	public constructor(
		private parent: DataContract,
		private target: () => IDataContractConstruct<T>
	) { }

	public fetch(): Promise<T> {
		if (this.currentValue) {
			return Promise.resolve(this.currentValue);
		}
		return OneToOne.fetch<T>(this.parent, this.target()).then((result) => {
			this.currentValue = result;
			return result;
		});
	}

	public set(newModel: T): Promise<void> {
		return this.internalSet(newModel, true);
	}

	public save(): Promise<void> {
		const savePromises: Promise<any>[] = [];

		if ((<IDataContractConstruct<any>> this.parent.constructor).isFirst(this.target())) {
			// tslint:disable-next-line:forin
			for (const i in this.changedModels) {
				savePromises.push(this.changedModels[i].internalSave(false));
			}
		} else {
			// tslint:disable-next-line:forin
			for (const i in this.changedModels) {
				savePromises.push(this.changedModels[i].save());
			}
		}

		return Promise.all(savePromises).then(
			() => { /* */ }
		);
	}

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

	private getConnectedName(): string {
		if (!this.connectedName) {
			const proto = this.target().prototype;
			for (const field in proto) {
				if (
					proto.hasOwnProperty(field) &&
					Reflect.hasOwnMetadata('ORM:relatedType', proto, field) &&
					Reflect.getOwnMetadata('ORM:relatedType', proto, field)() === this.parent.constructor
				) {
					this.connectedName = field;
					return field;
				}
			}
		}
		return this.connectedName;
	}

	private internalSet(newModel: T, updateRelated: boolean): Promise<void> {

		if ((<IDataContractConstruct<any>> this.parent.constructor).isFirst(this.target())) {
			return this.target().getSequelizeModel().then(
				(targetModel: sequelize.Model<any, any>) => {
					try {
						this.idName = (<any> targetModel).name + 'Id';

						if ((<any> this.parent).instance) {
							(<any> this.parent).instance.set(this.idName, newModel && newModel.id);
						}

						this.currentValue = newModel;

						if (!newModel.createdAt) { // If the passed model is new
							// Mark it as changed so we can get the ID later
							this.changedModels.push(newModel);
						}
						return (<OneToOne<DataContract>> newModel[this.getConnectedName()]).internalSet(this.parent, false);
					} catch (e) {
						/* istanbul ignore next */
						return Promise.reject(e);
					}
				}
			);
		} else if (updateRelated) {
			return Promise.all(
				[
					(<any> this.parent.constructor).getSequelizeModel(),
					this.fetch()
				]
			).then(
				(items) => {
					try {
						const promises: Promise<any>[] = [];
						const fromModel: sequelize.Model<any, any> = items[0];
						const oldModel: T = items[1];

						const idName: string = (<any> fromModel).name + 'Id';

						if (oldModel) {
							promises.push(
								(<OneToOne<DataContract>> oldModel[this.getConnectedName()])
									.internalSet(this.parent, false)
							);
							(<any> oldModel).instance.set(idName, null);
							this.changedModels.push(oldModel);
						}

						if (newModel) {
							promises.push(
								(<OneToOne<DataContract>> newModel[this.getConnectedName()])
									.internalSet(this.parent, false)
							);
							this.changedModels.push(newModel);
							this.currentValue = newModel;
						}
						return Promise.all(promises).then(() => { /* */ });
					} catch (e) {
						/* istanbul ignore next */
						return Promise.reject(e);
					}
				}
			);
		} else {
			this.currentValue = newModel;
			return Promise.resolve();
		}
	}
}
