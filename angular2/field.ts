import * as moment from 'moment';

import {field as sharedField} from '../shared/field';
import {Types} from '../shared/Types';

export function field(type?: Types): (target: any, key: string) => any {
	return function field(target: any, key: string) {
		// property getter
		const getter = function () {
			if (!this['_' + key]) {
				switch (type) {
					case(Types.dateTimeTz):
						this['_' + key] = moment(this.data[key]);
						break;
					default:
						this['_' + key] = this.data[key];
				}
			}
			return this['_' + key];
		};

		// property setter
		const setter = function (newVal) {
			this['_' + key] = newVal;
			switch (type) {
				case(Types.dateTimeTz):
					this.data[key] = newVal.toISOString();
					break;
				default:
					this.data[key] = newVal;
			}
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
