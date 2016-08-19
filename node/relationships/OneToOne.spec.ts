import * as mockery from 'mockery';
import * as chai from 'chai';
import * as sinon from 'sinon';

import * as classTypes from '../DataContract.spec.class';
import * as mockConnect from '../../mocks/connect';

import {Sequelize} from '../../mocks/Sequelize';

describe('node/relationships/OneToOne', function() {
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

	describe('A Side', function () {
		it('Returns null when there is no data', function () {
			const a: classTypes.OneToOneA = new classes.OneToOneA();
			const fetch = a.b.fetch();
			return chai.expect(fetch).to.eventually.equal(null);
		});

		it('Returns the object when there is data', function () {
			instance.get.withArgs('id').returns(0);
			mockConnect.model.findOne.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const a: classTypes.OneToOneA = new classes.OneToOneA(instance);
			const fetch = a.b.fetch();

			return Promise.all([
				chai.expect(fetch).to.eventually.not.equal(null),
				fetch.then((result) => {
					chai.expect(result).to.be.an.instanceof(classes.OneToOneB);

					const args = mockConnect.model.findOne.args;
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

		it('Sets with new objects', function () {
			instance.get.withArgs('id').returns(0);
			mockConnect.model.create.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const a: classTypes.OneToOneA = new classes.OneToOneA();
			a.b.set(new classes.OneToOneB()).then(() => {
				return a.save().then(
					() => {
						const args = mockConnect.model.create.args;
						chai.expect(args).to.deep.equal(
							[
								[{
									OneToOneBId: 0
								}]
							]
						);
					}
				);
			});
		});

		it('Sets with new a object', function () {
			instance.get.withArgs('id').returns(0);
			mockConnect.model.create.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const a: classTypes.OneToOneA = new classes.OneToOneA();
			a.b.set(new classes.OneToOneB(instance)).then(() => {
				return a.save().then(
					() => {
						const args = mockConnect.model.create.args;
						chai.expect(args).to.deep.equal(
							[
								[{
									OneToOneBId: 0
								}]
							]
						);
					}
				);
			});
		});

		it('Sets with existing objects', function () {
			instance.get.withArgs('id').returns(0);
			mockConnect.model.create.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const a: classTypes.OneToOneA = new classes.OneToOneA(instance);
			a.b.set(new classes.OneToOneB(instance)).then(() => {
				return a.save().then(
					() => {
						const args = mockConnect.model.create.args;
						chai.expect(args).to.deep.equal(
							[
								[{
									OneToOneBId: 0
								}]
							]
						);
					}
				);
			});
		});

		it('Updates old objects', function () {
			instance.get.withArgs('id').returns(0);
			mockConnect.model.create.returns(Promise.resolve(instance));
			instance.get.withArgs('OneToOneBId').returns(0);
			mockConnect.model.findOne.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const a: classTypes.OneToOneA = new classes.OneToOneA(instance);
			const b1: classTypes.OneToOneB = new classes.OneToOneB(instance);
			const b2: classTypes.OneToOneB = new classes.OneToOneB(instance);
			return a.b.set(b1)
				.then(() => Promise.all([
					a.save(),
					b1.save()
				]))
				.then(() => a.b.set(b2))
				.then(() => Promise.all([
					a.save(),
					b2.save()
				]))
				.then(() => {
					const args = mockConnect.model.create.args;
					chai.expect(args).to.deep.equal([]);
					chai.expect(instance.save.args.length).to.equal(8);
				});
		});

		it('Does add to a create when set', function () {
			instance.get.withArgs('id').returns(0);
			mockConnect.model.create.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const a: classTypes.OneToOneA = new classes.OneToOneA(instance);
			return a.b.set(new classes.OneToOneB()).then(() => {
				return a.save().then(() => {
					const args = mockConnect.model.create.args;
					chai.expect(args).to.deep.equal([
						[ {
							OneToOneBId: 0
						} ]
					]);
				});
			});
		});
	});

	describe('B Side', function () {
		it('Returns null when there is no data', function () {
			const b: classTypes.OneToOneB = new classes.OneToOneB();
			const fetch = b.a.fetch();
			return chai.expect(fetch).to.eventually.equal(null);
		});

		it('Returns the object when there is data', function () {
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

		it('Is not included in the json', function () {
			instance.get.withArgs('OneToOneBId').returns(0);
			mockConnect.model.findOne.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const b: classTypes.OneToOneB = new classes.OneToOneB(instance);
			return b.a.fetch().then(() => {
				const obj = JSON.parse(b.serialize());
				chai.expect(Object.getOwnPropertyNames(obj)).to.deep.equal([
					'createdAt',
					'updatedAt'
				]);
			});
		});

		it('Does not add to a create when not set', function () {
			instance.get.withArgs('OneToOneBId').returns(0);
			mockConnect.model.create.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const b: classTypes.OneToOneB = new classes.OneToOneB();
			return b.save().then(() => {
				const args = mockConnect.model.create.args;
				chai.expect(args).to.deep.equal([
					[ {} ]
				]);
			});
		});

		it('Does add to a create when set (existing)', function () {
			instance.get.withArgs('id').returns(0);
			mockConnect.model.create.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const b: classTypes.OneToOneB = new classes.OneToOneB();
			b.a.set(new classes.OneToOneA(instance));
			return b.save().then(() => {
				const args = mockConnect.model.create.args;
				chai.expect(args).to.deep.equal([
					[ {
						OneToOneBId: 0
					} ]
				]);
			});
		});

		it('Does add to a create when set (new)', function () {
			instance.get.withArgs('id').returns(0);
			mockConnect.model.create.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const b: classTypes.OneToOneB = new classes.OneToOneB();
			return b.a.set(new classes.OneToOneA())
				.then(() => b.save())
				.then(() => {
					const args = mockConnect.model.create.args;
					chai.expect(args).to.deep.equal([
						[ {} ],
						[ {
							OneToOneBId: 0
						} ]
					]);
				});
		});

		it('Does add to a create when set (null)', function () {
			instance.get.withArgs('id').returns(0);
			mockConnect.model.create.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const b: classTypes.OneToOneB = new classes.OneToOneB();
			b.a.set(null);
			return b.save().then(() => {
				const args = mockConnect.model.create.args;
				chai.expect(args).to.deep.equal([
					[ {
						OneToOneBId: null
					} ]
				]);
			});
		});

		it('Sets the base model when set', function () {
			instance.get.withArgs('id').returns(0);
			mockConnect.model.create.returns(Promise.resolve(instance));
			instance.save.returns(Promise.resolve(instance));
			(<any> mockConnect.model).name = 'OneToOneB';

			const b: classTypes.OneToOneB = new classes.OneToOneB(instance);
			const setPromise = b.a.set(new classes.OneToOneA(instance));
			return setPromise.then(() => {
				const args = instance.set.args;
				chai.expect(args).to.deep.equal([
					[ 'OneToOneBId', 0 ]
				]);
			});
		});

		after(function() {
			mockery.deregisterAll();
			mockery.disable();
		});

	});
});
