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

@register('test')
export class StringProp extends DataConnection<Contracts.StringProp> {
	constructor(injector?: Injector) { super(injector); }
	protected getContract() {
		return Contracts.StringProp;
	}
}

@register('test')
export class DateProp extends DataConnection<Contracts.DateProp> {
	constructor(injector?: Injector) { super(injector); }
	protected getContract() {
		return Contracts.DateProp;
	}
}
