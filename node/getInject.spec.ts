import * as mockery from 'mockery';
import * as chai from 'chai';

describe('node/DataContract', function() {
	let getInject: any;

	before(function(){
		mockery.enable();
		mockery.registerMock('../shared/DataObject', {
			registeredClasses: new Map(<any> [['a', 'a'], ['b', 'b']])
		});
		mockery.registerAllowables([
			'./getInject'
		]);

		getInject = require('./getInject');
	});

	it('returns injectables', function() {
		chai.expect(getInject.getInject()).to.deep.equal(['a', 'b']);
	});

	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
});
