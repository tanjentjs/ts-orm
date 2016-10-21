import { Injectable } from '@angular/core';
import { BaseConnection } from "./BaseConnection";
import * as Collections from 'typescript-collections';

export const fetchables = new Collections.Dictionary<string, BaseConnection<any>>();

export function Fetchable() {
	const injectable = Injectable();
	return function (
		target: BaseConnection<any>,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		const contract = (<any> target).prototype.getContract();
		const name = Reflect.getMetadata('name', contract);
		fetchables.setValue(name, target);
		injectable(target, propertyKey, descriptor);
	};
}
