import * as mockery from 'mockery';
import * as chai from 'chai';
import * as classTypes from './DataContract.spec.class';
import * as moment from 'moment';
import * as sinon from 'sinon';
import * as mockConnect from '../mocks/connect';

import {Sequelize, Model} from '../mocks/Sequelize';

describe('node/DataContract', function() {
	let connect: any;
	let classes: any;

	before(function(){
		mockery.enable();
		mockery.registerMock('sequelize', Sequelize);
		mockery.registerAllowables([
			'./connect',
			'./DataContract',
			'./DataContract.spec.class',
			'./field',
			'../shared/field',
			'../shared/Types',
			'./Types',
			'./relationships',
			'./OneToOne',
			'./relationships/OneToOne',
			'./relationships/OneToMany',
			'./relationships/ManyToOne',
			'./relatedField',
			'moment',
			'lodash',
			'debug'
		]);

		connect = require('./connect');
		connect.connect('a', 'b', 'c');

		classes = require('./DataContract.spec.class');

		mockConnect.reset(connect);
	});

	describe('existing', function() {
		let model: Model<any, any>;
		let instance: any;

		beforeEach(function () {
			model = new Model('existing');
			instance = {
				destroy: sinon.stub(),
				get: sinon.stub(),
				save: sinon.stub(),
				set: sinon.stub()
			};
			instance.destroy.returns(Promise.resolve());
			instance.save.returns(Promise.resolve());
		});

		describe('noProp', function () {
			let current: classTypes.NoProp;

			beforeEach(function () {
				current = new classes.NoProp(instance, model);
			});

			it('saves', function () {
				return current.save().then(() => {
					chai.expect(instance.save.getCalls().length).to.equal(1);
				});
			});

			it('destroys', function () {
				current.delete();
				chai.expect(instance.destroy.getCalls().length).to.equal(1);
			});
		});

		describe('stringProp', function() {
			let current: classTypes.StringProp;

			beforeEach(function () {
				current = new classes.StringProp(instance, model);
			});

			it('updates the model', function () {
				current.stringy = 'thingy';
				const calls = instance.set.getCalls();
				chai.expect(calls.length).to.equal(1);
				chai.expect(calls[0].args).to.deep.equal(['stringy', 'thingy']);
			});

			it('fetches from the model', function () {
				instance.get.withArgs('stringy').returns('thingy');
				chai.expect(current.stringy).to.equal('thingy');
			});
		});

		describe('dateProp', function() {
			let current: classTypes.DateProp;
			const isoDate = '2016-07-01T18:25:06.094Z';

			beforeEach(function () {
				current = new classes.DateProp(instance, model);
			});

			it('updates the model', function () {
				current.dateThing = moment(isoDate);
				const calls = instance.set.getCalls();
				chai.expect(calls.length).to.equal(1);
				chai.expect(calls[0].args).to.deep.equal(['dateThing', isoDate]);
			});

			it('fetches from the model', function () {
				instance.get.withArgs('dateThing').returns(isoDate);
				chai.expect(current.dateThing.toISOString()).to.equal(isoDate);
			});

			it('handles invalid dates', function () {
				current.dateThing = moment.invalid();
				const calls = instance.set.getCalls();
				chai.expect(calls.length).to.equal(1);
				chai.expect(calls[0].args).to.deep.equal(['dateThing', null]);
			});

			it('handles bad assigns', function () {
				current.dateThing = <any> 'Invalid Date';
				const calls = instance.set.getCalls();
				chai.expect(calls.length).to.equal(1);
				chai.expect(calls[0].args).to.deep.equal(['dateThing', null]);
			});
		});
	});

	describe('new', function() {
		let model: Model<any, any>;

		beforeEach(function () {
			model = new Model('new');
		});

		describe('noProp', function () {
			let current: classTypes.NoProp;

			beforeEach(function () {
				current = new classes.NoProp(null, model);
			});

			describe('serialize', function () {
				it('empty object', function () {
					chai.expect(current.serialize()).to.equal('{}');
				});

				it('id', function () {
					current.id = 0;
					chai.expect(current.serialize()).to.equal('{"id":0}');
				});

				it('dates in iso format', function () {
					const isoDate = '2016-07-01T18:25:06.094Z';
					const isoDate2 = '2016-07-02T18:25:06.094Z';
					current.createdAt = moment(isoDate);
					current.updatedAt = moment(isoDate2);
					chai.expect(current.serialize()).to.equal(
						'{' +
						'"createdAt":"' + isoDate + '",' +
						'"updatedAt":"' + isoDate2 + '"' +
						'}'
					);
				});
			});

			describe('save', function () {
				it('creates an object', function () {
					model.create.returns(Promise.resolve({}));

					current.save().then(() => {
						const calls = model.create.getCalls();
						chai.expect(calls.length).to.equal(1);
						chai.expect(calls[0].args).to.deep.equal([{}]);
					});
				});
			});

			describe('delete', function () {
				it('returns a resolved promise', function () {
					return current.delete();
				});
			});
		});

		describe('stringProp', function() {
			let current: classTypes.StringProp;

			beforeEach(function () {
				current = new classes.StringProp(null, model);
			});

			describe('serialize', function () {
				it('empty object', function () {
					chai.expect(current.serialize()).to.equal('{}');
				});

				it('value', function () {
					current.stringy = 'stuff';
					chai.expect(current.serialize()).to.equal('{"stringy":"stuff"}');
				});
			});

			describe('loadData', function () {
				it('loads data', function () {
					current.loadData({stringy: 'thingy'});
					chai.expect(current.stringy).to.equal('thingy');
				});
			});
		});

		describe('dateProp', function() {
			let current: classTypes.DateProp;

			beforeEach(function () {
				current = new classes.DateProp(null, model);
			});

			describe('serialize', function () {
				it('empty object', function () {
					chai.expect(current.serialize()).to.equal('{}');
				});

				it('value', function () {
					const isoDate = '2016-07-01T18:25:06.094Z';
					current.dateThing = moment(isoDate);
					chai.expect(current.serialize())
						.to.equal('{"dateThing":"' + isoDate + '"}');
				});
			});

			describe('loadData', function () {
				it('loads data', function () {
					const isoDate = '2016-07-01T18:25:06.094Z';
					current.loadData({dateThing: isoDate});
					chai.expect(current.dateThing.toISOString()).to.equal(isoDate);
				});
			});
		});
	});

	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
});
