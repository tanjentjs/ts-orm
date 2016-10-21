import * as Sequelize from 'sequelize';
import {Types} from "./Types";
import {BaseConnection} from "./BaseConnection";
import * as Collections from 'typescript-collections';

let appRoot: string = null;

export function setAppRoot(root: string) {
	appRoot = root;
}

function extractPath(stackLine: string) {
	let path = stackLine.split(':')[0];
	if (path.match(/\(/)) {
		path = path.split('(')[1];
	} else {
		path = path.split(' ');
		path = path[path.length - 1];
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

export function Field(type?: Types) {
	return (target, propertyName: string) => {
		// Build the object's "name" if it doesn't exist
		if (!Reflect.getMetadata('name', target.constructor)) {
			const stack = new Error().stack.replace(/\r/g, '').split('\n');
			let pathLocation = 0;
			while (notAtSource(stack[pathLocation])) {
				pathLocation++;
			}
			let path = extractPath(stack[pathLocation]);
			if (appRoot === null) {
				throw Error('You must set the appRoot!');
			}
			if (path.substring(0, appRoot.length) === appRoot) {
				path = path.substring(appRoot.length).replace(/^[/]*/, '');
			}
			path = path.replace(/[/]/g, '$').replace(/[.][tj]s$/, '');
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
