import * as sinon from 'sinon';
import * as sequelize from './Sequelize';

const pristineModel = new sequelize.Model('');

export const model = new sequelize.Model('');

export function reset(connect: any) {
	for (const prop in pristineModel) {
		if (pristineModel[prop].name === 'proxy') {
			model[prop] = sinon.stub();
		}
	}

	model.findById.returns(Promise.resolve(null));

	model.findAll.returns(Promise.resolve([]));
	model.findOne.returns(Promise.resolve(null));

	connect.connection.define.returns(model);
}
