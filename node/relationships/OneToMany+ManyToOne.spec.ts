import * as mockery from 'mockery';
import * as chai from 'chai';
import * as sinon from 'sinon';

import * as classTypes from '../DataContract.spec.class';
import * as mockConnect from '../../mocks/connect';

import {Sequelize} from '../../mocks/Sequelize';

describe('node/relationships/OneToMany+ManyToOne', function() {
	let connect: any;
	let classes: any;
	let instance: {
		get: any,
		set: any,
		save: any
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
			'./relationships/OneToOne',
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
			get: sinon.stub(),
			save: sinon.stub().returns(Promise.resolve()),
			set: sinon.stub()
		};
	});

	it('Creates the Relationships', function () {
		return Promise.all([
			classes.OneToManyA.getSequelizeModel(),
			classes.ManyToOneA.getSequelizeModel()
		]).then((models) => {
			const modelA = models[0];
			const modelB = models[1];
			const hasCalls = mockConnect.model.hasMany.getCalls();
			const belongsCalls = mockConnect.model.belongsTo.getCalls();

			chai.expect(hasCalls.length).to.equal(2);
			chai.expect(hasCalls[0].args[0]).to.equal(modelB);
			chai.expect(hasCalls[1].args[0]).to.equal(modelB);
			chai.expect(belongsCalls.length).to.equal(2);
			chai.expect(belongsCalls[0].args[0]).to.equal(modelA);
			chai.expect(belongsCalls[1].args[0]).to.equal(modelA);
		});
	});

	describe('Case A, Reciprocal Relationship', function () {
		let One: classTypes.OneToManyA;
		let Many: classTypes.ManyToOneA;

		beforeEach(function () {
			One = new classes.OneToManyA();
			Many = new classes.ManyToOneA();
		});

		// it('Sets from the One side', function () {
		// 	instance.get.withArgs('id').returns(0);
		//
		// 	One.a.set(Many).then(() => {
		// 		return a.save().then(
		// 			() => {
		// 				const args = mockConnect.model.create.args;
		// 				chai.expect(args).to.deep.equal(
		// 					[
		// 						[{
		// 							OneToOneBId: 0
		// 						}]
		// 					]
		// 				);
		// 			}
		// 		);
		// });
	});
});
