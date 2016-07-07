import * as mockery from 'mockery';
import * as chai from 'chai';
import * as classTypes from './DataConnection.spec.class';
import * as sinon from 'sinon';
import * as sequelize from 'sequelize';

import {Sequelize} from '../mocks/Sequelize';

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
			findAll: sinon.stub(),
			findById: sinon.stub(),
			sync: sinon.stub()
		};

		model.findById.withArgs(42).returns(Promise.resolve({id: 42}));
		model.findById.returns(Promise.resolve(null));
		model.findAll.withArgs({
			include: [{ all: true }],
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
		model.findAll.returns(Promise.resolve([]));
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

		describe('badProp', function () {

			it('throws an error', function () {
				chai.expect(() => {
					const a = new classes.BadProp();
					a.create();
				}).to.throw(TypeError);
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
