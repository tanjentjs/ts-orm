import { IDataContract } from '../shared/DataObject';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import * as moment from 'moment';

import {Types} from '../shared/Types';

import {field} from './field';
import {AuthHandler} from './AuthHandler';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';

export abstract class DataContract implements IDataContract {
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

	public save(): Promise<this> {
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
				return this;
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

export function getOptions(): RequestOptions {
	const headers: Headers = new Headers();
	headers.set('accept', 'application/json');

	return new RequestOptions({
		headers: headers
	});
}
