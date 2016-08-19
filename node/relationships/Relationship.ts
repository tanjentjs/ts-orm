import {DataContract, IDataContractConstruct} from '../DataContract';

export abstract class Relationship<T extends DataContract, U> {
	protected currentValue: U = null;

	protected needsIds: DataContract[] = [];
	protected needsSave: DataContract[] = [];

	private connectedName: string = null;

	public constructor(
		protected parent: DataContract,
		protected target: () => IDataContractConstruct<T>
	) { }

	public fetch(): Promise<U> {
		if (this.currentValue) {
			return Promise.resolve(this.currentValue);
		}
		return this.getValue().then((result) => {
			this.currentValue = result;
			return result;
		});
	}

	public set(newModel: U): Promise<void> {
		return this.internalSet(newModel, true).then(() => {
			this.currentValue = newModel;
		});
	}

	public seedIds(): Promise<any> {
		const savePromises: Promise<any>[] = [];

		// tslint:disable-next-line:forin
		for (const i in this.needsIds) {
			savePromises.push((<any> this.needsIds[i]).internalSave(false));
		}
		this.needsIds = [];

		return Promise.all(savePromises);
	}

	public saveRelated(): Promise<any> {
		const savePromises: Promise<any>[] = [];

		// tslint:disable-next-line:forin
		for (const i in this.needsSave) {
			savePromises.push(this.needsSave[i].save());
		}
		this.needsSave = [];

		return Promise.all(savePromises).then(
			() => { /* */ }
		);
	}

	protected getConnectedName(): string {
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

	protected abstract getValue(): Promise<U>;
	protected abstract internalSet(newModel: U, updateRelated: boolean): Promise<any | void>;
}