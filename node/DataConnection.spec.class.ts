import {DataConnection} from './DataConnection';
import * as Contracts from './DataContract.spec.class';

export class NoProp extends DataConnection<Contracts.NoProp> {
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