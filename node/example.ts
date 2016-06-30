import {DataContract, DataConnection, register, field} from 'tanjentjs-ts-orm/node';

export class UserContract extends DataContract {
	@field()
	public username: string;
}

@register('core')
export class User extends DataConnection<UserContract> {
	protected getContract() {
		return UserContract;
	}
}
