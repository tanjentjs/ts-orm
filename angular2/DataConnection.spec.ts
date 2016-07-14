import {ReflectiveInjector, enableProdMode} from '@angular/core';
import {HTTP_PROVIDERS, BaseRequestOptions, Http, Response, ResponseOptions} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {AuthHandler} from './AuthHandler';

import * as sinon from 'sinon';
import * as chai from 'chai';

import {NoProp, NoInject} from './DataConnection.spec.class';
import {NoProp as NoPropContract} from './DataContract.spec.class';

enableProdMode();

describe('angular2/DataConnection', () => {

	let injector: ReflectiveInjector;
	let noProp: NoProp;
	let http: Http;
	let backend: MockBackend;

	beforeEach(() => {
		injector = ReflectiveInjector.resolveAndCreate([
			HTTP_PROVIDERS,
			{
				deps: [MockBackend, BaseRequestOptions],
				provide: Http,
				useFactory: (mbackend: MockBackend, defaultOptions: BaseRequestOptions) => {
					return new Http(mbackend, defaultOptions);
				}
			},
			NoProp,
			NoInject,
			AuthHandler,
			MockBackend,
			BaseRequestOptions
		]);
		noProp = injector.get(NoProp);
		http = injector.get(Http);
		backend = injector.get(MockBackend);
	});

	it('dies without the injector', () => {
		chai.expect(() => injector.get(NoInject)).to.throw(Error);
	});

	describe('noProp', function () {
		it('fetches data', () => {
			backend.connections.subscribe((c: MockConnection) => {
				chai.expect(c.request.url).to.equal('/object/test.NoProp/42');
				c.mockRespond(new Response(new ResponseOptions({body: {message: '{}'}})));
			});
			return chai.expect(noProp.fetch(42)).to.eventually.be.an.instanceof(NoPropContract);
		});

		it('creates', () => {
			return chai.expect(noProp.create()).be.an.instanceof(NoPropContract);
		});

		it('searches', () => {
			backend.connections.subscribe((c: MockConnection) => {
				chai.expect(c.request.url).to.equal('/object/test.NoProp');
				chai.expect(c.request.getBody()).to.equal('{"stuff":"things"}');

				c.mockRespond(new Response(new ResponseOptions({body: {message: '[{}]'}})))
			});
			return noProp.search({'stuff': 'things'}).then((result: any) => {
				chai.expect(result).to.be.an('array');
				chai.expect(result.length).to.equal(1);
				chai.expect(result[0]).to.be.an.instanceof(NoPropContract);
			})
		});
	});

	afterEach(() => {
		backend.resolveAllConnections();
		backend.verifyNoPendingRequests();
	});

});