import * as http from 'http';
import { Injectable } from '@angular/core';

import { HttpHelper } from '../HttpHelper';
import { Session } from '../Session';
import { getInjector } from '../Injector';
import { DataConnection, DataContract } from './DataObject';
import { registeredClasses } from '../../shared/ORM/DataObject';

@Injectable()
export class HTTP {
	constructor(
		private session: Session
	) {}

	public handle(
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse
	): void {
		const urlData = requestData.url.split('/');
		const idx: string = urlData[2];

		if (idx) {
			let id: number = urlData[4] && Number.parseInt(urlData[4], 10);
			// tslint:disable-next-line:triple-equals
			if ((<any> id) != urlData[4]) {
				id = undefined;
			}

			let contract: DataConnection<DataContract>;
			try {
				contract = getInjector().get(registeredClasses[idx]);
			} catch (e) { /* */ }

			let sessionLoad = Promise.resolve();
			if (requestData.headers.authorization) {
				const authHeader = requestData.headers.authorization.split(' ');
				if (authHeader[0] === 'JWT' && authHeader.length === 2) {
					sessionLoad = this.session.loadJWT(authHeader[1]);
				}
			}

			sessionLoad.then(() => {
				if (requestData.method === 'GET' && id) {
					if (contract) {
						this.GET(id, requestData, responseData, contract);
					} else {
						this.respondNotFound(responseData);
					}
				} else if (requestData.method === 'POST' && !id) {
					if (contract) {
						this.POST(requestData, responseData, contract);
					} else {
						this.respondNotFound(responseData);
					}
				} else if (requestData.method === 'PUT') {
					if (contract) {
						this.PUT(id, requestData, responseData, contract);
					} else {
						this.respondNotFound(responseData);
					}
				} else if (requestData.method === 'DELETE' && id) {
					if (contract) {
						this.DELETE(id, requestData, responseData, contract);
					} else {
						this.respondNotFound(responseData);
					}
				} else {
					this.respondNotAllowed(responseData);
				}
			});
		}
	}

	private GET(
		id: number,
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		contract: DataConnection<DataContract>
	): void {
		contract.fetch(id).then(
			(data: DataContract) => this.respondOk(responseData, data.serialize()),
			() => this.respondNotFound(responseData)
		);
	}

	private POST(
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		contract: DataConnection<DataContract>
	) {
		HttpHelper.fetchBody(requestData, responseData)
			.then((bodyData: any) => {
				return contract.search(bodyData);
			})
			.then((results: DataContract[]) => {
				this.respondOk(responseData, JSON.stringify(results));
			});
	}

	private PUT(
		id: number,
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		contract: DataConnection<DataContract>
	) {
		let dataPromise: Promise<DataContract>;
		if (id) {
			dataPromise = contract.fetch(id);
		} else {
			dataPromise = new Promise<DataContract>((resolve) => {
				return resolve(contract.create());
			});
		}
		dataPromise.then(
			(data: DataContract) => {
				HttpHelper.fetchBody(requestData, responseData)
					.then((bodyData: any) => {
						data.loadData(bodyData);
						data.save().then(() => {
							responseData.end(data.serialize());
						}, () => {
							responseData.statusCode = 412;
							responseData.end('Save Failed');
						});
					});
			},
			() => this.respondNotFound(responseData)
		);
	}

	private DELETE(
		id: number,
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		contract: DataConnection<DataContract>
	) {
		contract.fetch(id).then((data: DataContract) => {
			data.delete().then(
				() => this.respondOk(responseData),
				() => {
					responseData.statusCode = 412;
					responseData.end('Delete Failed');
				}
			);
		}, () => {
			responseData.statusCode = 404;
			responseData.end('Resource Not Found');
		});
	}

	private respondNotAllowed(responseData: http.ServerResponse) {
		responseData.statusCode = 405;
		responseData.end('Method Not Allowed');
	}

	private respondNotFound(responseData: http.ServerResponse) {
		responseData.statusCode = 404;
		responseData.end('Resource Not Found');
	}

	private respondOk(responseData: http.ServerResponse, data?: string) {
		responseData.setHeader('content-type', 'application/json');
		this.session.getJWT().then((token: string) => {
			responseData.setHeader('jwt-token', token);
			responseData.statusCode = 200;
			responseData.end(data || '');
		});
	}
}
