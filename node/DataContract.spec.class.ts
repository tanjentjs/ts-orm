import {DataContract} from './DataContract';
import {OneToOne, relatedField} from './relationships';
import {field} from './field';
import {Types} from '../shared/Types';
import {register} from '../shared/DataObject';

import * as moment from 'moment';

export class NoProp extends DataContract {}
export class StringProp extends DataContract {
	@field()
	public stringy: string;
}
export class HiddenProp extends DataContract {
	@field()
	public stringy: string;
	@field(Types.string, true)
	public hideMe: string;
}
export class FloatProp extends DataContract {
	@field()
	public floaty: number;
}
export class IntProp extends DataContract {
	@field(Types.integer)
	public inty: number;
}
export class BigIntProp extends DataContract {
	@field(Types.bigInt)
	public inty: number;
}
export class DateProp extends DataContract {
	@field(Types.dateTimeTz)
	public dateThing: moment.Moment;
}
export class BadProp extends DataContract {
	@field(<any> 'a')
	public dateThing: moment.Moment;
}

@register('test')
export class OneToOneA extends DataContract {
	@relatedField(() => OneToOneB)
	public b: OneToOne<OneToOneB>;
}

@register('test')
export class OneToOneB extends DataContract {
	@relatedField(() => OneToOneA)
	public a: OneToOne<OneToOneA>;
}
