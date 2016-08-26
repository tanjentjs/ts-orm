import * as mockery from 'mockery';
import * as chai from 'chai';
import * as classTypes from './DataConnection.spec.class';
import * as sequelize from 'sequelize';
import * as mockConnect from '../mocks/connect';

import {Sequelize} from '../mocks/Sequelize';

describe('node/DataConnection', function() {
	let connect: any;
	let classes: any;

	before(function(){
		mockery.enable();
		mockery.registerMock('sequelize', Sequelize);
		mockery.registerAllowables([
			'./connect',
			'../connect',
			'./DataContract',
			'../DataContract',
			'./DataConnection',
			'./DataContract.spec.class',
			'./DataConnection.spec.class',
			'../shared/DataObject',
			'./field',
			'../shared/field',
			'../shared/Types',
			'../../shared/field',
			'../../shared/Types',
			'./Types',
			'./relationships',
			'./relatedField',
			'./relationships/OneToOne',
			'./OneToOne',
			'./relationships/ManyToOne',
			'./ManyToOne',
			'./Relationship',
			'moment',
			'lodash',
			'os',
			'fs',
			'util',
			'assert',
			'events',
			'stream',
			'debug'
		]);

		connect = require('./connect');
		connect.connect('a', 'b', 'c');

		classes = require('./DataConnection.spec.class');
	});

	beforeEach(function () {
		mockConnect.reset(connect);

		mockConnect.model.findById.withArgs(42).returns(Promise.resolve({
			get: () => 42
		}));
		mockConnect.model.findAll.withArgs({
			include: [{all: true}],
			where: {
				find: true
			}
		}).returns(Promise.resolve([
			{
				get: () => 40
			},
			{
				get: () => 41
			},
			{
				get: () => 42
			}
		]));
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
					"testNoProp",
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
					"testStringProp",
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
					"testFloatProp",
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
					"testIntProp",
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

		describe('bigIntProp', function () {
			let current: classTypes.BigIntProp;

			beforeEach(function () {
				current = new classes.BigIntProp();
			});

			it('defines the connection', function () {
				const calls = connect.connection.define.getCalls();

				chai.expect(calls.length).to.equal(1);
				chai.expect(calls[0].args).to.deep.equal([
					"testBigIntProp",
					{
						"inty": {
							type: sequelize.BIGINT
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
					"testDateProp",
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

		describe('badProp', function () {

			it('throws an error', function () {
				const a = new classes.BadProp();
				return chai.expect(a.fetch(5)).to.eventually.be.rejectedWith(TypeError);
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

		it('rejects on bad ids', function () {
			return chai.expect(current.fetch(40)).to.eventually.be.rejectedWith('Not Found');
		});

		it('resolves on good ids', function () {
			return chai.expect(current.fetch(42)).to.eventually.be.fulfilled;
		});

		it('returns empty', function () {
			return chai.expect(current.search({
				find: false
			})).to.eventually.deep.equal([]);
		});

		it('returns full', function () {
			return chai.expect(current.search({
				find: true
			})).to.eventually.have.deep.property('[2].id', 42);
		});
	});

	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
});
