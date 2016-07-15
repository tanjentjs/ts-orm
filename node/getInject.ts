import { registeredClasses, IDataConnection, IDataContract } from '../shared/DataObject';

export function getInject(): (new (...b: any[]) => IDataConnection<IDataContract>)[] {
	return Array.from(registeredClasses.values());
}
