import "reflect-metadata";
import { Injectable } from '@angular/core';

export const fetchables = {};

export function Fetchable() {
	const injectable = Injectable();
	return function (
		target: Function
	) {
		const contract = (<any> target).prototype.getContract();
		const name = Reflect.getMetadata('name', contract);
		fetchables[name] = target;
		injectable(target);
	};
}
