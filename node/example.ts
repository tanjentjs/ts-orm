import {DataContract, DataConnection, register, field} from 'tanjentjs-ts-orm/node';
import { Injectable } from '@angular/core';

export class UserContract extends DataContract {
	@field()
	public username: string;
}

@Injectable()
@register('core')
export class User extends DataConnection<UserContract> {
	protected getContract() {
		return UserContract;
	}
}
