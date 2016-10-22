import * as http from 'http';
import {Injector, Inject} from '@angular/core';
import {API_BASE} from '../shared/index';
import {fetchables} from '../shared/Fetchable';
import {BaseConnection} from "../shared/BaseConnection";
import {BaseContract} from "../shared/BaseContract";

function censor(censor) {
	var i = 0;

	return function(key, value) {
		if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
			return '[Circular]';

		if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
			return '[Unknown]';

		++i; // so we know we aren't using the original object anymore

		return value;
	}
}

export class ApiHandler {
	constructor(
		private injector: Injector,
		@Inject(API_BASE) private API_BASE: string
	) { /* */ }
	public handle(req: http.Request, res: http.Response) {
		if (req.method !== 'POST') {
			res.status(401).send(JSON.stringify({
				message: 'You must use post when interacting with this api'
			}));
			return;
		}
		let url = req.baseUrl;
		if (url.substring(0, this.API_BASE.length) === this.API_BASE) {
			url = url.substring(this.API_BASE.length).replace(/^[/]/, '');
		}
		url = url.split('/');
		const cls = fetchables[url[0]];
		if (!cls) {
			res.status(404).send(JSON.stringify({
				message: 'Object type \'' + url[0] + '\' does not exist'
			}));
		} else {
			const object: BaseConnection<BaseContract> = this.injector.get(cls);
			if (!object[url[1]] || (typeof object[url[1]]) !== 'function') {
				res.status(401).send(JSON.stringify({
					message: 'That action is not allowed!'
				}));
			} else {
				const action = object[url[1]];

				let inputs: any[] = req.body;

				if (!Array.isArray(inputs)) {
					inputs = [inputs];
				}

				if (url[1] === 'save') {
					if (inputs[0] === undefined || inputs[0].id === undefined) {
						res.status(412).send(JSON.stringify({
							message: 'You must send an object with an id property'
						}));
					} else {
						object.findById(inputs[0].id).then(
							(obj: BaseContract) => {
								// tsline:ignore-next-line:forin
								for (const i in inputs[0]) {
									if (i !== 'id') {
										obj[i] = inputs[0][i];
									}
								}

								return obj.save();
							}
						).then(
							(result) => {
								res.send(JSON.stringify(result, censor(result)));
							}
						).catch((err) => {
							console.error(err);
							res.status(500).send(JSON.stringify({
								message: 'An error has occured, check the logs'
							}));
						});
					}
				} else if (url[1] === 'delete') {
					object.findById(inputs[0]).then((obj: BaseContract) => {
						return object.delete(obj).then(() => res.status(200).send());
					}).catch((err) => {
						console.error(err);
						res.status(500).send(JSON.stringify({
							message: 'An error has occured, check the logs'
						}));
					});
				} else {
					// TODO: security sanitization of inputs
					Promise.resolve(action.apply(object, inputs)).then(
						(result) => {
							res.send(JSON.stringify(result, censor(result)));
						}
					).catch((err) => {
						console.error(err);
						res.status(500).send(JSON.stringify({
							message: 'An error has occured, check the logs'
						}));
					});
				}
			}
		}
	}
}
