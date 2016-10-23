// tslint:disable:interface-name

// TODO: Use the typescript extensability to replace this
// TODO: Support dates
export type replaceWithActual = string | number;

// TODO: Use the typescript extensability to generate the type info.
// This will replace
//      field:string with the actual fields
//      replaceWithActual with the actual type of the field
export interface WhereOptions<T> {
	[field: string]: (
		replaceWithActual |
		And<replaceWithActual> |
		Or<replaceWithActual> |
		Array<replaceWithActual>
	);
}

export interface FieldWhereOptions<T> {
	$ne: T | FieldWhereOptions<T>;
	$in: Array<T> | Literal<T>;
	$not: T;
	$notIn: Array<T>;
	$gte: T;
	$gt: T;
	$lte: T;
	$lt: T;

	// TODO: Begin hide these for non string types
	$like: string;
	$iLike: string;
	$ilike: string;
	$notLike: string;
	$notILike: string;
	// TODO: End hide these for non string types

	// TODO: Begin hide these for string types
	$between: [T, T];
	$notBetween: [T, T];
	// TODO: End hide these for string types
}

export interface Literal<T> {
	val: T;
}

export type And<T> = FieldWhereOptions<T>

export interface Or<T> {
	$or: FieldWhereOptions<T>;
}
