import * as mockery from 'mockery';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mockConnect from '../mocks/connect';

describe('node/http', function() {
	let http: any;
	let connect: any;
	let object: any;
	const responseData: any = {
		setHeader: sinon.stub(),
		statusCode: 0
	};

	before(function() {
		mockery.enable();
		mockery.registerAllowables([
			'./http',
			'./DataConnection',
			'./DataConnection.spec.class',
			'./DataContract.spec.class',
			'./DataContract',
			'./field',
			'./relationships',
			'./OneToOne',
			'../shared/DataObject',
			'../shared/Types',
			'./connect',
			'moment',
			'debug',
			'continuation-local-storage'
		]);

		connect = require('./connect');

		connect.connect('a', 'b', 'c');

		require('./DataConnection.spec.class');
		http = require('./http');
	});

	beforeEach(function () {
		mockConnect.reset(connect);

		object = {
			destroy: sinon.stub(),
			get: sinon.stub(),
			save: sinon.stub(),
			set: sinon.stub()
		};

		object.destroy.returns(Promise.resolve());
		object.save.returns(Promise.resolve());
		object.get.returns(43);

		mockConnect.model.findById.withArgs(43).returns(Promise.resolve(object));
		mockConnect.model.create.returns(Promise.resolve(object));
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

		it('returns 404 for missing ids', function () {
			getRequest.url += 'test.NoProp/1';
			const response = http.HTTP.handle(getRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(404);
				}),
				chai.expect(response).to.eventually.equal('Resource Not Found')
			]);
		});

		it('returns 200 with data for working ids', function () {
			const parse = (data: string) => JSON.parse(data);
			getRequest.url += 'test.NoProp/43';
			const response = http.HTTP.handle(getRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(200);
				}),
				chai.expect(response.then(parse)).to.eventually.have.property('id', 43),
				chai.expect(response.then(parse)).to.eventually.have.property('createdAt'),
				chai.expect(response.then(parse)).to.eventually.have.property('updatedAt')
			]);
		});

		it('returns 200 with data for working ids and hides properties', function () {
			getRequest.url += 'test.HiddenProp/43';
			const response = http.HTTP.handle(getRequest, responseData);
			const parsedResponse = response.then((data: string) => JSON.parse(data));
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(200);
				}),
				chai.expect(parsedResponse).to.eventually.have.property('id', 43),
				chai.expect(parsedResponse).to.eventually.have.property('stringy', 43),
				chai.expect(parsedResponse).to.not.eventually.have.property('hideMe'),
				chai.expect(parsedResponse).to.eventually.have.property('createdAt'),
				chai.expect(parsedResponse).to.eventually.have.property('updatedAt')
			]);
		});

		it('returns 404 with data for hidden objects', function () {
			getRequest.url += 'test.NoPropHidden/43';
			const response = http.HTTP.handle(getRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(404);
				}),
				chai.expect(response).to.eventually.equal('Resource Not Found')
			]);
		});
	});

	describe('put', function () {
		const putRequest = {
			method: 'PUT',
			on: sinon.stub(),
			url: ''
		};

		beforeEach(function () {
			putRequest.url = '/orm/';

			putRequest.on.withArgs('data').callsArgWith(1, '{}');
			putRequest.on.withArgs('end').callsArg(1);
		});

		it('errors when given a bad class', function () {
			putRequest.url += 'badClass/0';

			const response = http.HTTP.handle(putRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(404);
				}),
				chai.expect(response).to.eventually.equal('Resource Not Found')
			]);
		});

		it('returns 404 for missing ids', function () {
			putRequest.url += 'test.NoProp/1';
			const response = http.HTTP.handle(putRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(404);
				}),
				chai.expect(response).to.eventually.equal('Resource Not Found')
			]);
		});

		it('returns 200 for working ids and updates the data (existing)', function () {
			const parse = (data: string) => JSON.parse(data);
			putRequest.url += 'test.StringProp/43';
			putRequest.on.withArgs('data').callsArgWith(1, '{"stringy":"asdasd"}');
			const response = http.HTTP.handle(putRequest, responseData);
			return Promise.all([
				response.then(() => chai.expect(responseData.statusCode).to.equal(200)),
				chai.expect(response.then(parse)).to.eventually.have.property('id', 43),
				chai.expect(response.then(parse)).to.eventually.have.property('createdAt'),
				chai.expect(response.then(parse)).to.eventually.have.property('updatedAt'),
				response.then(() => chai.expect(object.save.called).to.be.true),
				response.then(() =>
					chai.expect(object.set.getCall(0).args).to.deep.equal(['stringy', 'asdasd'])
				)
			]);
		});

		it('returns 200 for working ids and updates the data (new)', function () {
			const parse = (data: string) => JSON.parse(data);
			putRequest.url += 'test.StringProp';
			putRequest.on.withArgs('data').callsArgWith(1, '{"stringy":"asdasd"}');
			const response = http.HTTP.handle(putRequest, responseData);
			return Promise.all([
				response.then(() => chai.expect(responseData.statusCode).to.equal(200)),
				chai.expect(response.then(parse)).to.eventually.have.property('id', 43),
				chai.expect(response.then(parse)).to.eventually.have.property('createdAt'),
				chai.expect(response.then(parse)).to.eventually.have.property('updatedAt'),
				response.then(() => chai.expect(mockConnect.model.create.called).to.be.true),
				response.then(() =>
					chai.expect(mockConnect.model.create.getCall(0).args).to.deep.equal([{'stringy': 'asdasd'}])
				)
			]);
		});

		it('errors on bad json', function () {
			putRequest.url += 'test.StringProp/43';
			putRequest.on.withArgs('data').callsArgWith(1, '{');
			const response = http.HTTP.handle(putRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(412);
				}),
				chai.expect(response).to.eventually.include('"Malformed JSON Details:')
			]);
		});

		it('errors on failed save', function () {
			putRequest.url += 'test.StringProp/43';
			object.save.returns(Promise.reject(''));
			const response = http.HTTP.handle(putRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(412);
				}),
				chai.expect(response).to.eventually.equal('"Save Failed"')
			]);
		});

		it('explodes on exceptions', function () {
			putRequest.url += 'test.StringProp/43';
			putRequest.on.withArgs('data').callsArgWith(1, '{"stringy": "123123"}');
			const oldLogger = connect.logger;
			delete connect.logger;
			const response = http.HTTP.handle(putRequest, responseData);
			return Promise.all([
				chai.expect(response).to.eventually.be.rejected
			]).then(() => connect.logger = oldLogger, (e) => {
				connect.logger = oldLogger;
				return Promise.reject(e);
			});
		});
	});

	describe('post', function () {
		const postRequest = {
			method: 'POST',
			on: sinon.stub(),
			url: ''
		};

		beforeEach(function () {
			postRequest.url = '/orm/';

			postRequest.on.withArgs('data').callsArgWith(1, '{}');
			postRequest.on.withArgs('end').callsArg(1);
		});

		it('searches', function () {
			postRequest.url += 'test.StringProp';
			postRequest.on.withArgs('data').callsArgWith(1, '{"where": {"stringy":"asdasd"}}');
			const response = http.HTTP.handle(postRequest, responseData);
			return Promise.all([
				chai.expect(response).to.eventually.equal('[]'),
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(200);
				}),
				response.then(() => chai.expect(mockConnect.model.findAll.called).to.be.true),
				response.then(() =>
					chai.expect(mockConnect.model.findAll.getCall(0).args).to.deep.equal([{
						"include": [
							{
								"all": true
							}
						],
						"where": {
							"stringy": "asdasd"
						}
					}])
				)
			]);
		});

		it('errors when given a bad class', function () {
			postRequest.url += 'badClass';

			const response = http.HTTP.handle(postRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(404);
				}),
				chai.expect(response).to.eventually.equal('Resource Not Found')
			]);
		});

		it('errors on bad json', function () {
			postRequest.url += 'test.StringProp';
			postRequest.on.withArgs('data').callsArgWith(1, '{');
			const response = http.HTTP.handle(postRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(412);
				}),
				chai.expect(response).to.eventually.include('"Malformed JSON Details:')
			]);
		});

		it('explodes on exceptions', function () {
			postRequest.url += 'test.StringProp';
			delete mockConnect.model.findAll;
			const response = http.HTTP.handle(postRequest, responseData);
			return Promise.all([
				chai.expect(response).to.eventually.be.rejected
			]);
		});
	});

	describe('delete', function () {
		const deleteRequest = {
			method: 'DELETE',
			url: ''
		};

		beforeEach(function () {
			deleteRequest.url = '/orm/';
		});

		it('errors when given a bad class', function () {
			deleteRequest.url += 'badClass/0';

			const response = http.HTTP.handle(deleteRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(404);
				}),
				chai.expect(response).to.eventually.equal('Resource Not Found')
			]);
		});

		it('returns 404 for missing ids', function () {
			deleteRequest.url += 'test.NoProp/1';
			const response = http.HTTP.handle(deleteRequest, responseData);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(404);
				}),
				chai.expect(response).to.eventually.equal('"Resource Not Found"')
			]);
		});

		it('returns 200 for working ids', function () {
			deleteRequest.url += 'test.NoProp/43';
			const response = http.HTTP.handle(deleteRequest, responseData).then(
				(data: string) => JSON.parse(data)
			);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(200);
				})
			]);
		});

		it('handles failure', function () {
			deleteRequest.url += 'test.NoProp/43';
			object.destroy.returns(Promise.reject(''));
			const response = http.HTTP.handle(deleteRequest, responseData).then(
				(data: string) => JSON.parse(data)
			);
			return Promise.all([
				response.then(() => {
					chai.expect(responseData.statusCode).to.equal(412);
				}),
				chai.expect(response).to.eventually.equal('Delete Failed')
			]);
		});
	});

	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
});
