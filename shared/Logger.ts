import {Injectable} from '@angular/core';

// Based on winston.js

export interface ILeveledLogMethod {
	(msg: string): ILogger;
	(msg: string, meta: any): ILogger;
	(msg: string, ...meta: any[]): ILogger;
}

export interface ILogger {
	debug: ILeveledLogMethod;
	info: ILeveledLogMethod;
	warn: ILeveledLogMethod;
	error: ILeveledLogMethod;
}

@Injectable()
export abstract class Logger {
	public abstract get(loggerName: string);
}
