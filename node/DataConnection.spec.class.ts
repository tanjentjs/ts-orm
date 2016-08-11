import {DataConnection} from './DataConnection';
import {register} from '../shared/DataObject';
import * as Contracts from './DataContract.spec.class';

@register('test')
export class NoProp extends DataConnection<Contracts.NoProp> {
	protected getContract() {
		return Contracts.NoProp;
	}
}

@register('test', true)
export class NoPropHidden extends DataConnection<Contracts.NoProp> {
	protected getContract() {
		return Contracts.NoProp;
	}
}

@register('test')
export class StringProp extends DataConnection<Contracts.StringProp> {
	protected getContract() {
		return Contracts.StringProp;
	}
}

@register('test')
export class HiddenProp extends DataConnection<Contracts.HiddenProp> {
	protected getContract() {
		return Contracts.HiddenProp;
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

export class BigIntProp extends DataConnection<Contracts.BigIntProp> {
	protected getContract() {
		return Contracts.BigIntProp;
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

export class OneToOneA extends DataConnection<Contracts.OneToOneA> {
	protected getContract() {
		return Contracts.OneToOneA;
	}
}

export class OneToOneB extends DataConnection<Contracts.OneToOneB> {
	protected getContract() {
		return Contracts.OneToOneB;
	}
}
