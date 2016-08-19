import {Types} from './Types';

export interface IActions {
	getter: () => any;
	setter: (newVal: any) => any;
}

export function field(target: any, key: string, actions: IActions, type?: Types) {
	// property value
	if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
		let fields = Reflect.getMetadata('ORM:fields', target);
		fields = fields || [];
		fields.push(key);
		Reflect.defineMetadata('ORM:fields', fields, target);
	}

	// Delete property.
	if (delete target[key]) {
		// Create new property with getter and setter
		Object.defineProperty(target, key, {
			configurable: false,
			enumerable: true,
			get: actions.getter,
			set: actions.setter
		});

		if (!type) {
			const jsType: any = Reflect.getMetadata('design:type', target, key);
			switch (jsType.name) {
				case 'String':
					type = Types.string;
					break;
				case 'Number':
					type = Types.float;
					break;
				/* istanbul ignore next */
				case 'Object':
					throw new TypeError('Automatic mapping of Objects is unsupported');
				/* istanbul ignore next */
				default:
					throw new TypeError('Unknown js type found! ' + jsType.name);
			}
		}
		Reflect.defineMetadata("ORM:type", type, target, key);
	}
}
