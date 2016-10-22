import {Types} from "./Types";
import {BaseConnection} from "./BaseConnection";

let appRoot: string[] = null;

export function setAppRoot(root: string | string[]) {
	if (!Array.isArray(root)) {
		root = <any> [root];
	}

	appRoot = <any> root;
}

function extractPath(stackLine: string) {
	let splitStack = stackLine.split(':')
	let path = splitStack.splice(0, splitStack.length - 2).join(':');
	if (path.match(/\(/)) {
		path = path.split('(')[1];
	} else {
		const pathArr = path.split(' ');
		path = pathArr[pathArr.length - 1];
	}
	return path;
}

function notAtSource(stackLine) {
	if (stackLine === 'Error') {
		return true;
	}
	const path = extractPath(stackLine);
	if (
		path.match(/shared\/Field[.][jt]s$/) ||
		path.match(/reflect-metadata\/[^\/]+[.]js$/)
	) {
		return true;
	}
	return false;
}

function stripAppRoot(path) {
	// tslint:ignore-next-line:forin
	for (const i in appRoot) {
		if (path.substring(0, appRoot[i].length) === appRoot[i]) {
			return path.substring(appRoot[i].length).replace(/^[/]*/, '');
		}
	}

	return path;
}

export function Field(type?: Types) {
	return (target, propertyName: string) => {
		// Build the object's "name" if it doesn't exist
		if (!Reflect.getMetadata('name', target.constructor)) {
			const stack = (<any> new Error()).stack.replace(/\r/g, '').split('\n');
			let pathLocation = 0;
			while (notAtSource(stack[pathLocation])) {
				pathLocation++;
			}
			let path = extractPath(stack[pathLocation]);
			if (appRoot === null) {
				throw Error('You must set the appRoot!');
			}
			path = stripAppRoot(path).replace(/[/]/g, '$').replace(/[.][tj]s$/, '');
			Reflect.defineMetadata('name', path, target.constructor);
		}

		// Update the fields array with the info about this field
		const jsType: any = Reflect.getMetadata('design:type', target, propertyName);
		switch (jsType.name) {
			case 'String':
				type = Types.string;
				break;
			case 'Number':
				type = Types.float;
				break;
			case 'Object':
				throw new TypeError('Automatic mapping of Objects is unsupported');
			default:
				throw new TypeError('Unknown js type found! ' + jsType.name);
		}

		const fields = Reflect.getMetadata('fields', target.constructor) || {};
		fields[propertyName] = {
			type: type
		};
		Reflect.defineMetadata('fields', fields, target.constructor);

		// Delete property.
		if (delete target[propertyName]) {
			// Create new property with getter and setter
			Object.defineProperty(target, propertyName, {
				configurable: false,
				enumerable: true,
				get: function () {
					return (<BaseConnection<any>> this.parent).getField(this, propertyName);
				},
				set: function(value: any) {
					return (<BaseConnection<any>> this.parent).setField(this, propertyName, value);
				}
			});
		}
	};
}
