import {DataContract} from './DataContract';
import {field} from './field';
import {Types} from '../shared/Types';

import * as moment from 'moment';

export class NoProp extends DataContract {}
export class StringProp extends DataContract {
	@field()
	public stringy: string;
}
export class DateProp extends DataContract {
	@field(Types.dateTimeTz)
	public dateThing: moment.Moment;
}
