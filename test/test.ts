import {BaseContract} from "../shared/BaseContract";
import {BaseConnection} from "../shared/BaseConnection";
import {Field} from "../shared/Field";
export class UserContract extends BaseContract {
	@Field()
	public username: string;
}

export class User extends BaseConnection<UserContract> {
	protected getContract() { return UserContract; };
}
