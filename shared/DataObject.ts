import * as moment from 'moment';

export interface IDataContract {
	id: number;
	createdAt: moment.Moment;
	updatedAt: moment.Moment;

	save(): Promise<void>;
	delete(): Promise<void>;
}

export interface IDataConnection<T extends IDataContract> {
	fetch(id: number): Promise<T>;
	create(): T;
	search(criteria: any): Promise<T[]>;
}

export type registeredClassMap = Map<String, new (...a: any[]) => IDataConnection<IDataContract>>;

export const registeredClasses: registeredClassMap =
	new Map<String, new (...b: any[]) => IDataConnection<IDataContract>>();

/**
 * This registers the class with the API ORM system
 */
export function register(moduleId: string) {
	return (target: new (...args: any[]) => IDataConnection<IDataContract>): any => {
		const idx = moduleId + '.' + (<any> target).name;
		registeredClasses[idx] = target;
		Reflect.defineMetadata('ORM:registeredIndex', idx, target);
	};
}
