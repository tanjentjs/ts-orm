import * as Sequelize from 'sequelize';
import * as debug from 'debug';

export const cls: any = require('continuation-local-storage').createNamespace('ts-orm');
(<any> Sequelize).cls = cls;

import {ILogger} from './ILogger';

export let connection: any;
export let logger: ILogger;

/* istanbul ignore next */
class DefaultLogger implements ILogger {
	private debugs = {};
	private infos = {};

	public debug(module: string, ...args: any[]): void {
		if (!this.debugs[module]) {
			this.debugs[module] = debug('ts-orm:' + module);
			this.debugs[module].log = console.log.bind(console);
		}
		this.debugs[module].apply(console, args);
	}
	public info(module: string, ...args: any[]): void {
		if (!this.infos[module]) {
			this.infos[module] = debug('ts-orm-info:' + module);
			this.infos[module].log = console.info.bind(console);
		}
		this.infos[module].apply(console, args);
	}
}

export function connect(
	database: string,
	username: string,
	password: string,
	options?: Sequelize.Options,
	loggerIn: ILogger = new DefaultLogger()
) {
	if (!options) {
		options = {};
	}
	options.logging = loggerIn.info.bind(loggerIn, 'sequelize');

	connection = new Sequelize(database, username, password, options);
	logger = loggerIn;
}

export function beginTransaction(callback: () => Promise<any>): Promise<any> {
	return connection.transaction(() => {
		return callback();
	});
}
