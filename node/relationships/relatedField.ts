// DO NOT REMOVE THIS IMPORT it is required for this file to function
// tslint:disable-next-line:no-unused-variable
import * as reflectMetadata from 'reflect-metadata';

import {field as sharedField} from '../../shared/field';
import {Types} from '../../shared/Types';
import {OneToOne} from './OneToOne';
import {DataContract, IDataContractConstruct} from '../DataContract';
import {ManyToOne} from './ManyToOne';
import {OneToMany} from './OneToMany';

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
			case(ManyToOne):
				type = Types.relationshipManyToOne;
				break;
			case(OneToMany):
				type = Types.relationshipOneToMany;
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
		/* istanbul ignore next */
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
		Reflect.defineMetadata('ORM:relatedType', RelatedType, target, key);

		return {
			getter: getter,
			setter: setter
		};
	};
}
