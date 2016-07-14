import { IDataContract } from '../shared/DataObject';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import * as moment from 'moment';

import {Types} from '../shared/Types';

import {field} from './field';
import {AuthHandler} from './AuthHandler';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';

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
