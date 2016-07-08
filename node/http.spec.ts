import * as mockery from 'mockery';
import * as chai from 'chai';
import * as sinon from 'sinon';

describe('node/DataContract', function() {
	let http: any;
	const responseData: any = {
		setHeader: sinon.stub(),
		statusCode: 0
	};

	before(function(){
		mockery.enable();
		mockery.registerAllowables([
			'./http',
			'./DataConnection.spec.class',
			'../shared/DataObject'
		]);

		require('./DataConnection.spec.class');
		http = require('./http');
	});

	describe('get', function () {
		const getRequest = {
			method: 'GET',
			url: ''
		};

		beforeEach(function () {
			getRequest.url = '/orm/';
		});

		it('errors when given a bad class', function () {
			getRequest.url += 'badClass/0';

			const response = http.HTTP.handle(getRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(404);
				}),
				chai.expect(response).to.eventually.equal('Resource Not Found')
			]);
		});

		it('disallows string ids', function () {
			getRequest.url += 'badClass/sldkfasdgf';

			const response = http.HTTP.handle(getRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(405);
				}),
				chai.expect(response).to.eventually.equal('Method Not Allowed')
			]);
		});

		it('disallows classless access', function () {
			getRequest.url = '/orm';
			const response = http.HTTP.handle(getRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(405);
				}),
				chai.expect(response).to.eventually.equal('Method Not Allowed')
			]);
		});
	});

	// it('returns injectables', function() {
	// 	chai.expect(getInject.getInject()).to.deep.equal(['a', 'b']);
	// });

	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
});
