import * as moment from 'moment';

import {field as sharedField} from '../shared/field';
import {Types} from '../shared/Types';

export function field(type?: Types): (target: any, key: string) => any {
	return function field(target: any, key: string) {
		target['_' + key] = target[key];

		// property getter
		const getter = function fieldGetter(): any {
			if (this.instance) {
				if (!this['_' + key]) {
					switch (type) {
						case(Types.dateTimeTz):
							this['_' + key] = moment(this.instance.get(key));
							break;
						default:
							this['_' + key] = this.instance.get(key);
					}
				}
			}
			return this['_' + key];
		};

		// property setter
		const setter = function fieldSetter(newVal: any): any {
			if (this.instance) {
				switch (type) {
					case(Types.dateTimeTz):
						this.instance.set(key, newVal.toISOString());
						break;
					default:
						this.instance.set(key, newVal);
				}
				this['_' + key] = undefined;
			} else {
				this['_' + key] = newVal;
			}
			return newVal;
		};

		sharedField(
			target,
			key,
			{
				getter: getter,
				setter: setter
			},
			type
		);

		return {
			get: getter,
			set: setter
		};
	};
}