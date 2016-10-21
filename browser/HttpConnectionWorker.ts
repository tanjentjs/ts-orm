import {ConnectionWorker} from "../shared/ConnectionWorker";
import { Injectable, Inject }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { BaseConnection } from "../shared/BaseConnection";
import { BaseContractConstruct, BaseContract } from "../shared/BaseContract";
import { WhereOptions } from "../shared/WhereTypes";
import {API_BASE} from "../shared/index";

@Injectable()
export class SequelizeConnectionWorker extends ConnectionWorker {
	constructor (
		private http: Http,
		@Inject(API_BASE) private API_BASE: string
	) { super(); }

	// TODO: figure out the typing for initial
	public create<T extends BaseContract>(
		initial: any,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T> {
		return Promise.reject();
	}

	public save<T extends BaseContract>(
		contract: T,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T> {
		return Promise.reject();
	}

	public find<T extends BaseContract>(
		where: WhereOptions<T>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T> {
		return Promise.reject();
	}

	public findAll<T extends BaseContract>(
		where: WhereOptions<T>,
		parent: BaseConnection<T>,
		type: BaseContractConstruct<T>
	): Promise<T[]> {
		return Promise.reject();
	}

	public getField<T extends BaseContract>(contract: T, field: string): any {
		return null;
	}
	public setField<T extends BaseContract>(contract: T, field: string, value: any): any {
		return null;
	}
}