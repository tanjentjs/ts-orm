import {ReflectiveInjector, enableProdMode} from '@angular/core';
import {HTTP_PROVIDERS, BaseRequestOptions, Http, Response, ResponseOptions} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {AuthHandler} from './AuthHandler';

import * as chai from 'chai';
import * as moment from 'moment';

import {NoProp, DateProp, StringProp, NoInject} from './DataConnection.spec.class';
import {NoProp as NoPropContract, StringProp as StringPropContract} from './DataContract.spec.class';

enableProdMode();

describe('angular2/DataConnection', () => {

	let injector: ReflectiveInjector;
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
			StringProp,
			DateProp,
			NoInject,
			AuthHandler,
			MockBackend,
			BaseRequestOptions
		]);
		http = injector.get(Http);
		backend = injector.get(MockBackend);
	});

	it('dies without the injector', () => {
		chai.expect(() => injector.get(NoInject)).to.throw(Error);
	});

	describe('noProp', function () {
		let noProp: NoProp;

		beforeEach(() => {
			noProp = injector.get(NoProp);
		});

		it('fetches data', () => {
			backend.connections.subscribe((c: MockConnection) => {
				chai.expect(c.request.url).to.equal('/object/test.NoProp/42');
				c.mockRespond(new Response(new ResponseOptions({body: '{}'})));
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

				c.mockRespond(new Response(new ResponseOptions({body: '[{}]'})));
			});
			return noProp.search({'stuff': 'things'}).then((result: any) => {
				chai.expect(result).to.be.an('array');
				chai.expect(result.length).to.equal(1);
				chai.expect(result[0]).to.be.an.instanceof(NoPropContract);
			});
		});

		it('deletes', () => {
			let requestNum = 0;
			backend.connections.subscribe((c: MockConnection) => {
				chai.expect(c.request.url).to.equal('/object/test.NoProp/42');
				if (requestNum === 0) {
					chai.expect(c.request.method).to.equal(0); // GET
					c.mockRespond(new Response(new ResponseOptions({body: '{"id":"42"}'})));
				} else if (requestNum === 1) {
					chai.expect(c.request.method).to.equal(3); // DELETE
					c.mockRespond(new Response(new ResponseOptions({body: ''})));
				}
				requestNum++;
			});
			return chai.expect(noProp.fetch(42).then((r) => {
				return r.delete();
			})).to.eventually.be.fulfilled;
		});
	});

	describe('stringProp', function () {
		let stringProp: StringProp;

		beforeEach(() => {
			stringProp = injector.get(StringProp);
		});

		it('saves a new object', () => {
			const cur: StringPropContract = stringProp.create();

			cur.stringy = 'stuff';

			backend.connections.subscribe((c: MockConnection) => {
				chai.expect(c.request.url).to.equal('/object/test.StringProp');
				chai.expect(c.request.method).to.equal(2); // PUT
				chai.expect(c.request.getBody()).to.equal('{"stringy":"stuff"}');
				c.mockRespond(new Response(new ResponseOptions({body: '{"id":"45"}'})));
			});

			return chai.expect(cur.save()).to.eventually.have.property('id', '45');
		});

		it('saves an existing object', () => {

			let requestNum = 0;
			backend.connections.subscribe((c: MockConnection) => {
				chai.expect(c.request.url).to.equal('/object/test.StringProp/45');
				if (requestNum === 0) {
					chai.expect(c.request.method).to.equal(0); // GET
					c.mockRespond(new Response(new ResponseOptions({body: '{"id":"45"}'})));
				} else if (requestNum === 1) {
					chai.expect(c.request.method).to.equal(2); // PUT
					chai.expect(c.request.getBody()).to.equal('{"id":"45","stringy":"stuff"}');
					c.mockRespond(new Response(new ResponseOptions({body: '{"id":"45"}'})));
				}
				requestNum++;
			});
			return stringProp.fetch(45).then((cur: StringPropContract) => {
				cur.stringy = 'stuff';

				return chai.expect(cur.save()).to.eventually.be.fulfilled;
			});
		});
	});

	describe('dateProp', function () {
		let dateProp: DateProp;
		const dateString = '2016-07-14T19:08:43.279Z';

		beforeEach(() => {
			dateProp = injector.get(DateProp);
		});

		it('serializes dates', function () {
			const cur = dateProp.create();

			cur.dateThing = moment(dateString);

			backend.connections.subscribe((c: MockConnection) => {
				chai.expect(c.request.url).to.equal('/object/test.DateProp');
				chai.expect(c.request.method).to.equal(2); // PUT
				chai.expect(c.request.getBody()).to.equal('{"dateThing":"' + dateString + '"}');
				c.mockRespond(new Response(new ResponseOptions({body: '{"id":"41"}'})));
			});

			return chai.expect(cur.save()).to.eventually.have.property('id', '41');
		});

		it('deserializes dates', () => {
			backend.connections.subscribe((c: MockConnection) => {
				chai.expect(c.request.url).to.equal('/object/test.DateProp/41');
				c.mockRespond(new Response(new ResponseOptions({body: '{"id":"41","dateThing":"' + dateString + '"}'})));
			});
			return dateProp.fetch(41).then((c) => {
				chai.expect(c.dateThing.toISOString()).to.equal(dateString);
				chai.expect(moment.isMoment(c.dateThing)).to.be.true;
			});
		});
	});

	afterEach(() => {
		backend.resolveAllConnections();
		backend.verifyNoPendingRequests();
	});

});
