import * as sinon from 'sinon';

export const model = {
	create: sinon.stub(),
	findAll: sinon.stub(),
	findById: sinon.stub(),
	sync: sinon.stub()
};

export function reset(connect: any) {
	model.create = sinon.stub();

	model.findById = sinon.stub();
	model.findById.returns(Promise.resolve(null));


	model.findAll = sinon.stub();
	model.findAll.returns(Promise.resolve([]));

	model.sync = sinon.stub();

	connect.connection.define.returns(model);
}