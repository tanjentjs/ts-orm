// DO NOT REMOVE THIS IMPORT it is required for this file to function
// tslint:disable-next-line:no-unused-variable
import * as reflectMetadata from 'reflect-metadata';
import * as moment from 'moment';

import {field as sharedField} from '../../shared/field';
import {Types} from '../../shared/Types';
import {OneToOne} from './OneToOne';
import {DataContract, IDataContractConstruct} from '../DataContract';

export function relatedField<T extends DataContract>(
	RelatedType: () => IDataContractConstruct<T>,
	hidden: boolean = false
): (target: any, key: string) => any {
	return function relatedField(target: any, key: string) {
		const JsType: any = Reflect.getMetadata('design:type', target, key);

		let type: Types = undefined;

		switch (JsType) {
			case(OneToOne):
				type = Types.relationshipOneToOne;
				break;
			/* istanbul ignore next */
			default:
				throw new TypeError('Unknown js type found! ' + JsType.name);
		}

		const getter = function () {
			if (!this['_' + key]) {
				this['_' + key] = new JsType(this, RelatedType);
			}
			return this['_' + key];
		};
		const setter = () => { /* */ };

		sharedField(
			target,
			key,
			{
				getter: getter,
				setter: setter
			},
			type
		);

		Reflect.defineMetadata('ORM:hidden', hidden, target, key);

		return {
			getter: getter,
			setter: setter
		};
	};
}
