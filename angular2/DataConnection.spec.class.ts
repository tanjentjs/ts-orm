import {DataConnection} from './DataConnection';
import {register} from '../shared/DataObject';
import { Injector } from '@angular/core';
import * as Contracts from './DataContract.spec.class';

@register('test')
export class NoProp extends DataConnection<Contracts.NoProp> {
	constructor(injector?: Injector) { super(injector); }
	protected getContract() {
		return Contracts.NoProp;
	}
}

@register('test')
export class NoInject extends DataConnection<Contracts.NoProp> {
	protected getContract() {
		return Contracts.NoProp;
	}
}

export class StringProp extends DataConnection<Contracts.StringProp> {
	protected getContract() {
		return Contracts.StringProp;
	}
}

export class FloatProp extends DataConnection<Contracts.FloatProp> {
	protected getContract() {
		return Contracts.FloatProp;
	}
}

export class IntProp extends DataConnection<Contracts.IntProp> {
	protected getContract() {
		return Contracts.IntProp;
	}
}

export class DateProp extends DataConnection<Contracts.DateProp> {
	protected getContract() {
		return Contracts.DateProp;
	}
}

export class BadProp extends DataConnection<Contracts.BadProp> {
	protected getContract() {
		return Contracts.BadProp;
	}
}
