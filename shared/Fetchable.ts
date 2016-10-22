import { Injectable } from '@angular/core';
import { BaseConnection } from "./BaseConnection";

export const fetchables = {};

export function Fetchable() {
	const injectable = Injectable();
	return function (
		target: Function,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		const contract = (<any> target).prototype.getContract();
		const name = Reflect.getMetadata('name', contract);
		fetchables[name] = target;
		injectable(target, propertyKey, descriptor);
	};
}
