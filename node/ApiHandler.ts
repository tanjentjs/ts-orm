import * as http from 'http';
import {Injector, Inject} from '@angular/core';
import {API_BASE} from '../shared/index';
import {fetchables} from '../shared/Fetchable';

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
		const cls = fetchables.getValue(url[0]);
		if (!cls) {
			res.status(404).send(JSON.stringify({
				message: 'Object type \'' + url[0] + '\' does not exist'
			}));
		} else {
			const object = this.injector.get(cls);
			if (!object[url[1]] || (typeof object[url[1]]) !== 'function') {
				res.status(401).send(JSON.stringify({
					message: 'That action is not allowed!'
				}));
			} else {
				const action = object[url[1]];

				let inputs = req.body;

				if (!Array.isArray(inputs)) {
					inputs = [inputs];
				}

				// TODO: security sanitization of inputs
				// TODO: handle errors
				Promise.resolve(action.apply(object, inputs)).then((result) => {
					res.send(JSON.stringify(result, censor(result)));
				});
			}
		}
	}
}
