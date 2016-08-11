import * as mockery from 'mockery';
import * as chai from 'chai';
import * as classTypes from '../DataContract.spec.class';
import * as mockConnect from '../../mocks/connect';

import {Sequelize} from '../../mocks/Sequelize';

describe('node/DataContract', function() {
	let connect: any;
	let classes: any;

	before(function(){
		mockery.enable();
		mockery.registerMock('sequelize', Sequelize);
		mockery.registerAllowables([
			'../connect',
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
		classes = require('../DataContract.spec.class');
	});

	beforeEach(function () {
		mockConnect.reset(connect);
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

	it('Fetches data from the A side', function () {
		const a: classTypes.OneToOneA = new classes.OneToOneA(mockConnect.model);
		a.b.fetch();
	});

	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
});
