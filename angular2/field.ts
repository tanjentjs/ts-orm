import * as moment from 'moment';

import {field as sharedField} from '../shared/field';
import {Types} from '../shared/Types';

export function field(type?: Types): (target: any, key: string) => any {
	return function field(target: any, key: string) {
		let val = target[key];

		// property getter
		const getter = function () {
			if (!val) {
				switch (type) {
					case(Types.dateTimeTz):
						val = moment(this.data[key]);
						break;
					default:
						val = this.data[key];
				}
			}
			return val;
		};

		// property setter
		const setter = function (newVal) {
			val = newVal;
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
