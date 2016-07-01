import * as mockery from 'mockery';
import * as chai from 'chai';
import * as classTypes from './DataConnection.spec.class';
import * as moment from 'moment';
import * as sinon from 'sinon';
import * as sequelize from 'sequelize';

import {Sequelize, Model} from '../mocks/Sequelize';

describe('node/DataConnection', function() {
	let connect: any;
	let classes: any;
	let model: any;

	before(function(){
		mockery.enable();
		mockery.registerMock('sequelize', Sequelize);
		mockery.registerAllowables([
			'./connect',
			'./DataContract',
			'./DataConnection',
			'./DataContract.spec.class',
			'./DataConnection.spec.class',
			'./field',
			'../shared/field',
			'../shared/Types',
			'./Types',
			'moment',
			'lodash',
			'bunyan',
			'os',
			'fs',
			'util',
			'assert',
			'events',
			'stream'
		]);

		connect = require('./connect');
		connect.connect('a', 'b', 'c');

		classes = require('./DataConnection.spec.class');
	});

	beforeEach(function () {
		model = {
			sync: sinon.stub()
		};

		connect.connection.define.returns(model);
	});

	describe('constructor', function() {
		beforeEach(function () {
			connect.connection.define.reset();
		});

		describe('noProp', function () {
			let current: classTypes.NoProp;

			beforeEach(function () {
				current = new classes.NoProp();
			});

			it('defines the connection', function () {
				const calls = connect.connection.define.getCalls();

				chai.expect(calls.length).to.equal(1);
				chai.expect(calls[0].args).to.deep.equal([
					"NoProp",
					{},
					{
						"freezeTableName": true
					}
				]);
			});
		});

		describe('stringProp', function () {
			let current: classTypes.StringProp;

			beforeEach(function () {
				current = new classes.StringProp();
			});

			it('defines the connection', function () {
				const calls = connect.connection.define.getCalls();

				chai.expect(calls.length).to.equal(1);
				chai.expect(calls[0].args).to.deep.equal([
					"StringProp",
					{
						"stringy": {
							type: sequelize.STRING
						}
					},
					{
						"freezeTableName": true
					}
				]);
			});
		});

		describe('floatProp', function () {
			let current: classTypes.FloatProp;

			beforeEach(function () {
				current = new classes.FloatProp();
			});

			it('defines the connection', function () {
				const calls = connect.connection.define.getCalls();

				chai.expect(calls.length).to.equal(1);
				chai.expect(calls[0].args).to.deep.equal([
					"FloatProp",
					{
						"floaty": {
							type: sequelize.FLOAT
						}
					},
					{
						"freezeTableName": true
					}
				]);
			});
		});

		describe('intProp', function () {
			let current: classTypes.IntProp;

			beforeEach(function () {
				current = new classes.IntProp();
			});

			it('defines the connection', function () {
				const calls = connect.connection.define.getCalls();

				chai.expect(calls.length).to.equal(1);
				chai.expect(calls[0].args).to.deep.equal([
					"IntProp",
					{
						"inty": {
							type: sequelize.INTEGER
						}
					},
					{
						"freezeTableName": true
					}
				]);
			});
		});

		describe('dateProp', function () {
			let current: classTypes.DateProp;

			beforeEach(function () {
				current = new classes.DateProp();
			});

			it('defines the connection', function () {
				const calls = connect.connection.define.getCalls();

				chai.expect(calls.length).to.equal(1);
				chai.expect(calls[0].args).to.deep.equal([
					"DateProp",
					{
						"dateThing": {
							type: sequelize.DATE
						}
					},
					{
						"freezeTableName": true
					}
				]);
			});
		});
	});


	describe('noProp', function () {
		let current: classTypes.NoProp;

		beforeEach(function () {
			current = new classes.NoProp();
		});

		it('creates', function () {
			const thing = current.create();
			chai.expect(thing).to.not.be.null;
		});
	});

	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
});
