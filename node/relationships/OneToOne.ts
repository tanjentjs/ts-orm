import { DataContract, IDataContractConstruct } from '../DataContract';
import { RelationshipCache } from './RelationshipCache';

export class OneToOne<T extends DataContract> {
	public static fetch<U extends DataContract>(from: DataContract, target: IDataContractConstruct<U>): Promise<U> {
		const model = RelationshipCache.get(<any> from.constructor, target);
		const dbId = Reflect.getMetadata('ORM:dbId', from);

		const where: any = {};
		where[dbId] = from.id;

		return model.findOne({
			where: where
		}).then((data) => {
			console.log(data);
		});
	}

	public constructor(private parent: DataContract, private target: () => IDataContractConstruct<T>) {}

	public fetch(): Promise<T> {
		return OneToOne.fetch<T>(this.parent, this.target());
	}

	public set(obj: T): Promise<void> {
		return null;
	}
}
