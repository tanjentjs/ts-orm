import * as http from 'http';

import { DataConnection, DataContract } from './DataObject';
import { registeredClasses } from '../shared/DataObject';

export class HTTP {
	private static initialized: Map<String, DataConnection<DataContract>> =
		new Map<String, DataConnection<DataContract>>();

	public static handle(
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
	    class_idx: number = 2
	): void {
		const urlData = requestData.url.split('/');
		const id_idx = class_idx + 1;
		const idx: string = urlData[class_idx];

		if (idx) {
			let id: number = urlData[id_idx] && Number.parseInt(urlData[id_idx], 10);
			// tslint:disable-next-line:triple-equals
			if ((<any> id) != urlData[id_idx]) {
				id = undefined;
			}

			let contract: DataConnection<DataContract>;
			if (HTTP.initialized[idx]) {
				contract = HTTP.initialized[idx];
			} else if(registeredClasses[idx]) {
				HTTP.initialized[idx] = new registeredClasses[idx]();
				contract = HTTP.initialized[idx];
			}

			let sessionLoad = Promise.resolve();

			sessionLoad.then(() => {
				if (requestData.method === 'GET' && id) {
					if (contract) {
						HTTP.GET(id, requestData, responseData, contract);
					} else {
						HTTP.respondNotFound(responseData);
					}
				} else if (requestData.method === 'POST' && !id) {
					if (contract) {
						HTTP.POST(requestData, responseData, contract);
					} else {
						HTTP.respondNotFound(responseData);
					}
				} else if (requestData.method === 'PUT') {
					if (contract) {
						HTTP.PUT(id, requestData, responseData, contract);
					} else {
						HTTP.respondNotFound(responseData);
					}
				} else if (requestData.method === 'DELETE' && id) {
					if (contract) {
						HTTP.DELETE(id, requestData, responseData, contract);
					} else {
						HTTP.respondNotFound(responseData);
					}
				} else {
					HTTP.respondNotAllowed(responseData);
				}
			});
		}
	}

	private static GET(
		id: number,
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		contract: DataConnection<DataContract>
	): void {
		contract.fetch(id).then(
			(data: DataContract) => HTTP.respondOk(responseData, data.serialize()),
			() => HTTP.respondNotFound(responseData)
		);
	}

	private static POST(
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		contract: DataConnection<DataContract>
	) {
		HTTP.fetchBody(requestData, responseData)
			.then((bodyData: any) => {
				return contract.search(bodyData);
			})
			.then((results: DataContract[]) => {
				HTTP.respondOk(responseData, JSON.stringify(results));
			});
	}

	private static PUT(
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
				HTTP.fetchBody(requestData, responseData)
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
			() => HTTP.respondNotFound(responseData)
		);
	}

	private static DELETE(
		id: number,
		requestData: http.IncomingMessage,
		responseData: http.ServerResponse,
		contract: DataConnection<DataContract>
	) {
		contract.fetch(id).then((data: DataContract) => {
			data.delete().then(
				() => HTTP.respondOk(responseData),
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

	private static respondNotAllowed(responseData: http.ServerResponse) {
		responseData.statusCode = 405;
		responseData.end('Method Not Allowed');
	}

	private static respondNotFound(responseData: http.ServerResponse) {
		responseData.statusCode = 404;
		responseData.end('Resource Not Found');
	}

	private static respondOk(responseData: http.ServerResponse, data?: string) {
		responseData.setHeader('content-type', 'application/json');
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
					responseData.statusCode = 412;
					responseData.end('Malformed JSON');
					reject('Malformed JSON');
				}
				if (bodyData) {
					resolve(bodyData);
				}
			});
		});
	}
}
