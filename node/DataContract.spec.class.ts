import {DataContract} from './DataContract';
import {OneToOne, relatedField} from './relationships';
import {field} from './field';
import {Types} from '../shared/Types';

import * as moment from 'moment';

class BaseContract extends DataContract {
	public static moduleName = 'test';
}

export class NoProp extends BaseContract {}
export class StringProp extends BaseContract {
	@field()
	public stringy: string;
}
export class HiddenProp extends BaseContract {
	@field()
	public stringy: string;
	@field(Types.string, true)
	public hideMe: string;
}
export class FloatProp extends BaseContract {
	@field()
	public floaty: number;
}
export class IntProp extends BaseContract {
	@field(Types.integer)
	public inty: number;
}
export class BigIntProp extends BaseContract {
	@field(Types.bigInt)
	public inty: number;
}
export class DateProp extends BaseContract {
	@field(Types.dateTimeTz)
	public dateThing: moment.Moment;
}
export class BadProp extends BaseContract {
	@field(<any> 'a')
	public dateThing: moment.Moment;
}

export class OneToOneA extends BaseContract {
	@relatedField(() => OneToOneB)
	public b: OneToOne<OneToOneB>;
}

export class OneToOneB extends BaseContract {
	@relatedField(() => OneToOneA)
	public a: OneToOne<OneToOneA>;
}
