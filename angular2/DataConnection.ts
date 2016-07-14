import { IDataConnection } from '../shared/DataObject';
import { Http, Response } from '@angular/http';
import { Injector } from '@angular/core';
import * as _ from 'lodash';

import {AuthHandler} from './AuthHandler';
import {DataContract, getOptions} from './DataContract';

export abstract class DataConnection<T extends DataContract> implements IDataConnection<T> {
	private http: Http = this.injector && this.injector.get(Http);
	private auth: AuthHandler = this.injector && this.injector.get(AuthHandler);

	constructor(private injector?: Injector) {
		if (!this.injector) {
			throw 'You must pass in the angular injector!';
		}
	}

	private get baseUri(): string {
		const registered = Reflect.getMetadata('ORM:registeredIndex', this.constructor);
		return '/object/' + registered;
	}

	public fetch(id: number): Promise<T> {
		return this.http
			.get(
				this.baseUri + '/' + id,
				this.auth.setOptions(getOptions())
			)
			.map((res: Response) => this.auth.handleResponse(res))
			.map((res: Response) => {
				const body = res.json();
				return new (this.getContract())(
					this.http,
					this.auth,
					this.baseUri,
					body
				);
			}).toPromise();
	}

	public create(): T {
		return new (this.getContract())(this.http, this.auth, this.baseUri);
	}

	public search(criteria: any): Promise<T[]> {
		return this
			.http
			.post(
				this.baseUri,
				JSON.stringify(criteria),
				this.auth.setOptions(getOptions())
			)
			.map((res: Response) => this.auth.handleResponse(res))
			.map((res: Response) => {
				const ret: T[] = [];
				const data: any[] = res.json();
				_.each(data, (value: any) => {
					ret.push(new (this.getContract())(
						this.http,
						this.auth,
						this.baseUri,
						value
					));
				});
				return ret;
			})
			.toPromise();
	}

	/**
	 * This feeds the data contract into the system
	 */
	protected abstract getContract(): new(
		http: Http,
		auth: AuthHandler,
		baseUri: string,
		data?: any
	) => T;
}