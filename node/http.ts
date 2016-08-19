import * as http from 'http';

import { DataContract } from './DataContract';
import { DataConnection } from './DataConnection';
import { registeredClasses } from '../shared/DataObject';
import { logger } from './connect';

export class HTTP {
	public static handle(
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		class_idx: number = 2
	): Promise<string> {
		const urlData = requestData.url.split('/');
		const id_idx = class_idx + 1;
		const idx: string = urlData[class_idx];

		responseData.statusCode = 500;
		responseData.setHeader('content-type', 'application/json');

		if (idx) {
			let id: number = urlData[id_idx] && Number.parseInt(urlData[id_idx], 10);
			// tslint:disable-next-line:triple-equals
			if ((<any> id) != urlData[id_idx]) {
				id = undefined;
			}

			let contract: DataConnection<DataContract>;
			if (HTTP.initialized[idx]) {
				contract = HTTP.initialized[idx];
			} else if (registeredClasses[idx]) {
				const hidden = Reflect.getMetadata('ORM:apiHidden', registeredClasses[idx]);
				logger.info('http', registeredClasses[idx].name, 'hidden', hidden);

				if (!hidden) {
					logger.debug('http', 'Creating ', registeredClasses[idx].name);

					HTTP.initialized[idx] = new registeredClasses[idx]();
					contract = HTTP.initialized[idx];
				}
			}

			if (requestData.method === 'GET' && id !== undefined) {
				if (contract) {
					return HTTP.GET(id, requestData, responseData, contract);
				} else {
					return HTTP.respondNotFound(responseData);
				}
			} else if (requestData.method === 'POST' && id === undefined) {
				if (contract) {
					return HTTP.POST(requestData, responseData, contract);
				} else {
					return HTTP.respondNotFound(responseData);
				}
			} else if (requestData.method === 'PUT') {
				if (contract) {
					return HTTP.PUT(id, requestData, responseData, contract);
				} else {
					return HTTP.respondNotFound(responseData);
				}
			} else if (requestData.method === 'DELETE' && id !== undefined) {
				if (contract) {
					return HTTP.DELETE(id, requestData, responseData, contract);
				} else {
					return HTTP.respondNotFound(responseData);
				}
			} else {
				return HTTP.respondNotAllowed(responseData);
			}
		} else {
			return HTTP.respondNotAllowed(responseData);
		}
	}

	private static initialized: Map<String, DataConnection<DataContract>> =
		new Map<String, DataConnection<DataContract>>();

	private static GET(
		id: number,
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		contract: DataConnection<DataContract>
	): Promise<string> {
		return contract.fetch(id).then(
			(data: DataContract) => HTTP.respondOk(responseData, data.serialize()),
			() => HTTP.respondNotFound(responseData)
		);
	}

	private static POST(
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		contract: DataConnection<DataContract>
	): Promise<string> {
		return HTTP.fetchBody(requestData, responseData)
			.then((bodyData: any) => {
				return contract.search(bodyData);
			})
			.then((results: DataContract[]) => {
				return HTTP.respondOk(responseData, JSON.stringify(results));
			})
			.catch((err: any) => {
				if (err.message && err.message === 'Malformed JSON') {
					responseData.statusCode = 412;
					return '"Malformed JSON Details: ' + err.error.message + '"';
				} else {
					return Promise.reject(err);
				}
			});
	}

	private static PUT(
		id: number,
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		contract: DataConnection<DataContract>
	): Promise<string> {
		let dataPromise: Promise<DataContract>;
		if (id !== undefined) {
			dataPromise = contract.fetch(id);
		} else {
			dataPromise = new Promise<DataContract>((resolve) => {
				return resolve(contract.create());
			});
		}
		return dataPromise.then(
			(data: DataContract) => {
				return HTTP.fetchBody(requestData, responseData)
					.then((bodyData: any) => {
						try {
							data.loadData(bodyData);
							return data.save().then(() => {
								return HTTP.respondOk(responseData, data.serialize());
							}, () => {
								responseData.statusCode = 412;
								return '"Save Failed"';
							});
						} catch (e) {
							return <Promise<any>> Promise.reject(e);
						}
					})
					.catch((err: any) => {
						if (err.message && err.message === 'Malformed JSON') {
							responseData.statusCode = 412;
							return '"Malformed JSON Details: ' + err.error.message + '"';
						} else {
							return Promise.reject(err);
						}
					});
			},
			() => HTTP.respondNotFound(responseData)
		);
	}

	private static DELETE(
		id: number,
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		contract: DataConnection<DataContract>
	): Promise<string> {
		return contract.fetch(id).then((data: DataContract) => {
			return data.delete().then(
				() => HTTP.respondOk(responseData, '"Delete Success"'),
				() => {
					responseData.statusCode = 412;
					return '"Delete Failed"';
				}
			);
		}, () => {
			responseData.statusCode = 404;
			return '"Resource Not Found"';
		});
	}

	private static respondNotAllowed(responseData: http.ServerResponse): Promise<string> {
		responseData.statusCode = 405;
		return Promise.resolve('Method Not Allowed');
	}

	private static respondNotFound(responseData: http.ServerResponse): Promise<string> {
		responseData.statusCode = 404;
		return Promise.resolve('Resource Not Found');
	}

	private static respondOk(responseData: http.ServerResponse, data?: string): Promise<string> {
		responseData.statusCode = 200;
		return Promise.resolve(data);
	}

	private static fetchBody(requestData: http.IncomingMessage, responseData: http.ServerResponse): Promise<String> {
		return new Promise((resolve, reject) => {
			let body: string = '';
			let bodyData: any;

			requestData.on('data', function (data) {
				body += data;
			});
			requestData.on('end', () => {
				try {
					bodyData = JSON.parse(body);
				} catch (e) {
					reject({error: e, message: 'Malformed JSON'});
				}
				if (bodyData) {
					resolve(bodyData);
				}
			});
		});
	}
}
