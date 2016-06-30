import { IDataConnection, IDataContract, register as sharedRegister } from '../shared/DataObject';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import * as moment from 'moment';
import * as _ from 'lodash';

import {Types} from '../shared/Types';

import {field} from './field';
import {AuthHandler} from './AuthHandler';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import { Inject, Injectable } from '@angular/core';

export abstract class DataContract implements IDataContract {
	private get fields(): string[] {
		return Reflect.getMetadata('ORM:fields', this);
	}

	@field()
	public id: number;
	@field(Types.dateTimeTz)
	public createdAt: moment.Moment;
	@field(Types.dateTimeTz)
	public updatedAt: moment.Moment;

	constructor(
		private http: Http,
		private auth: AuthHandler,
		private baseUri: string,
		private data: any = {}
	) {}

	public save(): Promise<void> {
		// TODO: optimistic locking
		let request: Observable<Response>;
		if (this.id) {
			request = this.http.put(
				this.baseUri + '/' + this.id,
				JSON.stringify(this.data),
				this.auth.setOptions(getOptions())
			);
		} else {
			request = this.http.put(
				this.baseUri,
				JSON.stringify(this.data),
				this.auth.setOptions(getOptions())
			);
		}
		return request
			.map((res: Response) => this.auth.handleResponse(res))
			.map((res: Response) => {
				this.data = res.json();
			})
			.toPromise();
	}

	public delete(): Promise<void> {
		return this.http
			.delete(
				this.baseUri + '/' + this.id,
				this.auth.setOptions(getOptions())
			)
			.map((res: Response) => this.auth.handleResponse(res))
			.toPromise()
			.then(() => { /* */ });
	}
}

export abstract class DataConnection<T extends DataContract> implements IDataConnection<T> {
	private http: Http = this.injector && this.injector.get(Http);
	private auth: AuthHandler = this.injector && this.injector.get(AuthHandler);

	constructor(private injector?: Injector) {
		if(!this.injector) {
			throw 'You must pass in the angular injector!';
		}
	}

	private get baseUri(): string {
		const registered = Reflect.getMetadata('ORM:registeredIndex', this.constructor);
		return '/object/' + registered;
	}

	public fetch(id: number): Promise<T> {
		try {
			console.log(this.auth.setOptions(getOptions()));
		}catch(e) {
			console.log(e);
		}
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
					body || { }
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

function getOptions(): RequestOptions {
	const headers: Headers = new Headers();
	headers.set('accept', 'application/json');

	return new RequestOptions({
		headers: headers
	});
}
