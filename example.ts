import {Fetchable} from "./shared/Fetchable";
require('reflect-metadata');
require('sqlite3');
import {BaseConnection, BaseContract, Field, setAppRoot} from "./shared";
import {SequelizeConnectionWorker, connect} from "./node/SequelizeConnectionWorker";
import { ServerModule as AngularServerModule } from '@angular/platform-server';

setAppRoot(__dirname);

import {User as TestUser} from './test/test';

export class UserContract extends BaseContract {
	@Field()
	public username: string;
}

@Fetchable()
export class User extends BaseConnection<UserContract> {
	protected getContract() { return UserContract; };
}

import { NgModule }      from '@angular/core';

@NgModule({
	imports: [ AngularServerModule ],
	providers: [ User ]
})
export class ServerModule {}
@NgModule({
	imports: [ ServerModule ],
	providers: [ User ],
	bootstrap: []
})
export class AppModule {
	constructor() { /* */ }
	public ngDoBootstrap() { /* */ }
}

connect('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',

	pool: {
		max: 5,
		min: 0,
		idle: 10000
	},

	// SQLite only
	storage: ':memory'
});
const user = new User(new SequelizeConnectionWorker());
user.create({
	username: 'test1'
}).then((v) => {
	console.log(v.username);
	v.username = 'test3';
	return v.save();
}).then((v) => {
	console.log(v.username);
});
const testuser = new TestUser(new SequelizeConnectionWorker());
testuser.create({
	username: 'test2'
}).then((v) => console.log(v.username));
