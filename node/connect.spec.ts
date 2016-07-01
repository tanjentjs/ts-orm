import * as mockery from 'mockery';
import * as chai from 'chai';

import {Sequelize} from '../mocks/Sequelize';

describe('node/connect', function() {
	let connect: any;

	before(function(){
		mockery.enable();
		mockery.registerMock('sequelize', Sequelize);
		mockery.registerAllowable('./connect');

		connect = require('./connect');
	});
	it('connects to the database', function(){
		const options = {
			'c': 'd'
		};
		connect.connect('a', 'b', 'c', options);
		chai.expect(connect.connection.database).to.equal('a');
		chai.expect(connect.connection.username).to.equal('b');
		chai.expect(connect.connection.password).to.equal('c');
		chai.expect(connect.connection.options).to.equal(options);
	});
	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
});
