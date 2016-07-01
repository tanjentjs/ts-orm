import * as mockery from 'mockery';
import * as chai from 'chai';
import * as classTypes from './DataContract.spec.class';
import * as moment from 'moment';

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
			'moment',
			'lodash'
		]);

		connect = require('./connect');
		connect.connect('a', 'b', 'c');

		classes = require('./DataContract.spec.class');
	});
	describe('noProp new', function() {
		let current: classTypes.NoProp;

		beforeEach(function () {
			current = new classes.NoProp(null, new Model('NoProp'));
		});

		it('serializes to an empty object', function () {
			chai.expect(current.serialize()).to.equal('{}');
		});

		it('serializes the id', function () {
			current.id = 0;
			chai.expect(current.serialize()).to.equal('{"id":0}');
		});

		it('serializes the dates in iso format', function () {
			const isoDate = '2016-07-01T18:25:06.094Z';
			current.createdAt = moment(isoDate);
			chai.expect(current.serialize()).to.equal(
				'{"createdAt":"' + isoDate + '"}'
			);
		});
	});
	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
});
