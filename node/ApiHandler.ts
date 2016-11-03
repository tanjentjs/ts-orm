import * as express from 'express';
import {Injector, Inject, Injectable} from '@angular/core';
import {API_BASE} from '../shared/index';
import {fetchables} from '../shared/Fetchable';
import {BaseConnection} from '../shared/BaseConnection';
import {BaseContract} from '../shared/BaseContract';
import {ForeignKey} from '../shared/ForeignKey';
import {RemoteKeys} from '../shared/RemoteKeys';
import {RemoteKey} from '../shared/RemoteKey';
import {Logger} from '../shared/Logger';

@Injectable()
export class ApiHandler {
	constructor(
		private injector: Injector,
		@Inject(API_BASE) private API_BASE: string,
		@Inject(Logger) private logger: Logger
	) { /* */ }

	public handle(req: express.Request, res: express.Response) {
		if (req.method !== 'POST') {
			res.status(401).send(JSON.stringify({
				message: 'You must use post when interacting with this api'
			}));
			return;
		}
		let url: string | string[] = req.baseUrl;
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
					this.handleSave(res, inputs, object);
				} else if (url[1] === 'delete') {
					this.handleDelete(res, inputs, object);
				} else if (url[1] === 'setRelated') {
					this.handleSetRelated(res, inputs, object);
				} else if (url[1] === 'fetchOne') {
					this.handleFetchOne(res, inputs, object);
				} else if (url[1] === 'fetchOneRemote') {
					this.handleFetchOneRemote(res, inputs, object);
				} else if (url[1] === 'fetchMany') {
					this.handleFetchMany(res, inputs, object);
				} else {
					// TODO: security sanitization of inputs
					inputs.push(res);
					inputs.push(req);
					Promise.resolve(action.apply(object, inputs)).then(
						(result) => {
							res.send(JSON.stringify(result || {}));
						}
					).catch(this.return500.bind(this, res));
				}
			}
		}
	}

	private handleSave(res, inputs, object) {
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
							try {
								obj[i] = inputs[0][i];
							} catch (e) {
								if (!(e instanceof TypeError)) {
									throw e;
								}
							}
						}
					}

					return obj.save();
				}
			).then(
				(result) => {
					res.send(JSON.stringify(result));
				}
			).catch(this.return500.bind(this, res));
		}
	}

	private handleDelete(res, inputs, object) {
		object.findById(inputs[0]).then((obj: BaseContract) => {
			return object.delete(obj).then(() => res.status(200).send());
		}).catch(this.return500.bind(this, res));
	}

	private handleSetRelated(res, inputs, object: BaseConnection<BaseContract>) {
		const cls2 = fetchables[inputs[3]];
		const object2: BaseConnection<BaseContract> = this.injector.get(cls2);

		Promise.all([
			object.findById(inputs[0]),
			object2.findById(inputs[1])
		]).then((objs: BaseContract[]) => {
			return object.setRelated(objs[0], objs[1], inputs[2], object2.getContract()).then(() => res.status(200).send({}));
		}).catch(this.return500.bind(this, res));
	}

	private handleFetchOne(res, inputs, object: BaseConnection<BaseContract>) {
		object.findById(inputs[0]).then((obj: BaseContract) => {
			return (<ForeignKey<BaseContract>> obj[inputs[1]]).fetch();
		}).then((data) => res.status(200).send(data)).catch(this.return500.bind(this, res));
	}

	private handleFetchMany(res, inputs, object: BaseConnection<BaseContract>) {
		object.findById(inputs[0]).then((obj: BaseContract) => {
			return (<RemoteKeys<BaseContract>> obj[inputs[1]]).fetch();
		}).then((data) => res.status(200).send(data)).catch(this.return500.bind(this, res));
	}

	private handleFetchOneRemote(res, inputs, object: BaseConnection<BaseContract>) {
		object.findById(inputs[0]).then((obj: BaseContract) => {
			return (<RemoteKey<BaseContract>> obj[inputs[1]]).fetch();
		}).then((data) => res.status(200).send(data)).catch(this.return500.bind(this, res));
	}

	private return500(res, err) {
		this.logger.error(err);
		res.status(500).send(JSON.stringify({
			message: 'An error has occured, check the logs'
		}));
	}
}
