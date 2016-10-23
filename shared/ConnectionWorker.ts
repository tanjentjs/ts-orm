import {Injectable} from '@angular/core';

import {BaseContract, BaseContractConstruct} from './BaseContract';
import {WhereOptions} from './WhereTypes';
import {BaseConnection} from './BaseConnection';

@Injectable()
export abstract class ConnectionWorker {
	// TODO: figure out the typing for initial
	public abstract create<T extends BaseContract>(
		initial: any,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T>;
	public abstract save<T extends BaseContract>(
		contract: T,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T>;
	public abstract delete<T extends BaseContract>(
		contract: T,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T[]>;
	public abstract find<T extends BaseContract>(
		where: WhereOptions<T>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T>;
	public abstract findAll<T extends BaseContract>(
		where: WhereOptions<T>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T[]>;
	public abstract findById<T extends BaseContract>(
		id: number,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T>;
	public abstract fetchMany<T extends BaseContract, U extends BaseContract>(
		contract: T,
		destType: BaseContractConstruct<T>,
		remoteFeld: string,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<U[]>;
	public abstract fetchOne<T extends BaseContract, U extends BaseContract>(
		contract: T,
		destType: BaseContractConstruct<U>,
		field: string,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<U>;
	public abstract fetchOneRemote<T extends BaseContract, U extends BaseContract>(
		contract: T,
		destType: BaseContractConstruct<U>,
		field: string,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<U>;
	public abstract addRelated<T extends BaseContract, U extends BaseContract>(
		contract: T,
		addContract: U,
		remoteFeld: string,
		destType: BaseContractConstruct<U>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<void>;
	public abstract removeRelated<T extends BaseContract, U extends BaseContract>(
		contract: T,
		remContract: U,
		remoteFeld: string,
		destType: BaseContractConstruct<T>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<void>;
	public abstract setRelated<T extends BaseContract, U extends BaseContract>(
		contract: T,
		setContract: U,
		field: string,
		destType: BaseContractConstruct<T>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<void>;
	public abstract getField<T extends BaseContract>(contract: T, field: string): any;
	public abstract setField<T extends BaseContract>(contract: T, field: string, value: any): any;
}
