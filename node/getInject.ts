import { registeredClasses } from '../shared/DataObject';

export function getInject() {
	return Array.from(registeredClasses.values());
}
