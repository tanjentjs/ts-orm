import * as mockery from 'mockery';
import * as chai from 'chai';
import * as sequelize from 'sequelize';
import * as sinon from 'sinon';

import * as classTypes from '../DataContract.spec.class';
import * as mockConnect from '../../mocks/connect';

import {Sequelize} from '../../mocks/Sequelize';

describe('node/DataContract', function() {
	let connect: any;
	let classes: any;
	let instance: {
		get: any
	};

	before(function(){
		mockery.enable();
		mockery.registerMock('sequelize', Sequelize);
		mockery.registerAllowables([
			'../connect',
			'./connect',
			'./DataContract',
			'../DataContract.spec.class',
			'./field',
			'../shared/field',
			'../shared/Types',
			'./Types',
			'./relationships',
			'./OneToOne',
			'moment',
			'lodash',
			'debug'
		]);

		connect = require('../connect');
		connect.connect('a', 'b', 'c');

		classes = require('../DataContract.spec.class');
	});

	beforeEach(function () {
		mockConnect.reset(connect);
		instance = {
			get: sinon.stub()
		};
	});

	it('Creates the Relationships', function () {
		return Promise.all([
			classes.OneToOneA.getSequelizeModel(),
			classes.OneToOneB.getSequelizeModel()
		]).then((models) => {
			const modelA = models[0];
			const modelB = models[1];
			const hasCalls = mockConnect.model.hasOne.getCalls();
			const belongsCalls = mockConnect.model.belongsTo.getCalls();

			chai.expect(hasCalls.length).to.equal(2);
			chai.expect(hasCalls[0].args[0]).to.equal(modelB);
			chai.expect(hasCalls[1].args[0]).to.equal(modelB);
			chai.expect(belongsCalls.length).to.equal(2);
			chai.expect(belongsCalls[0].args[0]).to.equal(modelA);
			chai.expect(belongsCalls[1].args[0]).to.equal(modelA);
		});
	});

	it('Returns null on the A side when there is no data', function () {
		const a: classTypes.OneToOneA = new classes.OneToOneA();
		const fetch = a.b.fetch();
		return chai.expect(fetch).to.eventually.equal(null);
	});
	it('Returns null on the B side when there is no data', function () {
		const b: classTypes.OneToOneB = new classes.OneToOneB();
		const fetch = b.a.fetch();
		return chai.expect(fetch).to.eventually.equal(null);
	});

	it('Returns the object on the A side when there is data', function () {
		instance.get.withArgs('id').returns(0);
		mockConnect.model.findOne.returns(Promise.resolve(instance));
		(<any> mockConnect.model).name = 'OneToOneB';

		const a: classTypes.OneToOneA = new classes.OneToOneA(instance);
		const fetch = a.b.fetch();

		return Promise.all([
			chai.expect(fetch).to.eventually.not.equal(null),
			fetch.then((result) => {
				chai.expect(result).to.be.an.instanceof(classes.OneToOneB);

				const args = mockConnect.model.findOne.args
				chai.expect(args).to.deep.equal([
					[
						{
							'where': {
								'OneToOneBId': 0
							}
						}
					]
				]);
			})
		]);
	});

	it('Returns the object on the B side when there is data', function () {
		instance.get.withArgs('OneToOneBId').returns(0);
		mockConnect.model.findOne.returns(Promise.resolve(instance));
		(<any> mockConnect.model).name = 'OneToOneB';

		const b: classTypes.OneToOneB = new classes.OneToOneB(instance);
		const fetch = b.a.fetch();

		return Promise.all([
			chai.expect(fetch).to.eventually.not.equal(null),
			fetch.then((result) => {
				chai.expect(result).to.be.an.instanceof(classes.OneToOneA);

				const args = mockConnect.model.findById.args;
				chai.expect(args).to.deep.equal([
					[0]
				]);
			})
		]);
	});

	it('Works on multiple requests', function () {
		instance.get.withArgs('OneToOneBId').returns(0);
		mockConnect.model.findOne.returns(Promise.resolve(instance));
		(<any> mockConnect.model).name = 'OneToOneB';

		const b: classTypes.OneToOneB = new classes.OneToOneB(instance);
		const fetch = b.a.fetch();

		return Promise.all([
			chai.expect(fetch).to.eventually.not.equal(null),
			fetch.then((result) => {
				chai.expect(result).to.be.an.instanceof(classes.OneToOneA);

				const args = mockConnect.model.findById.args;
				chai.expect(args).to.deep.equal([
					[0]
				]);

				const fetch2 = b.a.fetch();

				return Promise.all([
					chai.expect(fetch2).to.eventually.not.equal(null),
					fetch2.then((result2) => {
						chai.expect(result2).to.be.an.instanceof(classes.OneToOneA);

						const args2 = mockConnect.model.findById.args;
						chai.expect(args2).to.deep.equal(
							[
								[0]
							]
						);
					})
				]);
			})
		]);
	});

	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
});
