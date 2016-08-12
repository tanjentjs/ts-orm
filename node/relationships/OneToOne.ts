import * as sequelize from 'sequelize';

import { DataContract, IDataContractConstruct } from '../DataContract';

export class OneToOne<T extends DataContract> {

	public static fetch<U extends DataContract>(from: DataContract,
	                                            target: IDataContractConstruct<U>): Promise<U> {
		return Promise.all(
			[
				target.getSequelizeModel(),
				(<any> from.constructor).getSequelizeModel()
			]
		).then(
			(models: sequelize.Model<any, any>[]) => {
				const targetModel: sequelize.Model<any, any> = models[0];
				const fromModel: sequelize.Model<any, any> = models[1];
				if ((<IDataContractConstruct<any>> from.constructor).isFirst(target)) {
					const idName: string = (<any> targetModel).name + 'Id';
					const id: number = (<any> from).instance.get(idName);

					if (id) {
						return targetModel.findById(id).then(
							(data) => {
								return new target(data);
							}
						);
					}
					return null;
				} else {
					const idName: string = (<any> fromModel).name + 'Id';
					const condition = {where: {}};
					condition.where[idName] = from.id;
					return targetModel.findOne(<any> condition).then(
						(data) => {
							if (!data) {
								return null;
							}
							return new target(data);
						}
					);
				}
			}
		);
	}

	public static addRelationship(src: IDataContractConstruct<any>,
	                              srcModel: sequelize.Model<any, any>,
	                              dest: IDataContractConstruct<any>,
	                              destModel: sequelize.Model<any, any>): void {
		if (src.isFirst(dest)) {
			srcModel.belongsTo(destModel);
			destModel.hasOne(srcModel);
		} else {
			destModel.belongsTo(destModel);
			srcModel.hasOne(destModel);
		}
	}

	private currentValue: T = null;
	private changedModels: DataContract[];

	public constructor(private parent: DataContract,
	                   private target: () => IDataContractConstruct<T>) {
	}

	public fetch(): Promise<T> {
		if (this.currentValue) {
			return Promise.resolve(this.currentValue);
		}
		return OneToOne.fetch<T>(this.parent, this.target());
	}

	public set(newModel: T): Promise<void> {
		// TODO: set the other side's relationship object

		if ((<IDataContractConstruct<any>> this.parent.constructor).isFirst(this.target())) {
			return this.target().getSequelizeModel().then(
				(targetModel: sequelize.Model<any, any>) => {
					const idName: string = (<any> targetModel).name + 'Id';

					(<any> this.parent).instance.set(idName, newModel.id);
					this.currentValue = newModel;
				}
			);
		} else {
			return Promise.all(
				[
					(<any> this.parent.constructor).getSequelizeModel(),
					this.fetch()
				]
			).then(
				(items) => {
					const fromModel: sequelize.Model<any, any> = items[0];
					const oldModel: T = items[1];

					const idName: string = (<any> fromModel).name + 'Id';

					(<any> oldModel).instance.set(idName, null);
					this.changedModels.push(oldModel);

					(<any> newModel).instance.set(idName, this.parent.id);
					this.changedModels.push(newModel);
					this.currentValue = newModel;
				}
			);
		}
	}

	public save(): Promise<void> {
		const savePromises: Promise<any>[] = [];

		// tslint:disable-next-line:forin
		for (const i in this.changedModels) {
			savePromises.push(this.changedModels[i].save());
		}

		return Promise.all(savePromises).then(
			() => { /* */ }
		);
	}
}
