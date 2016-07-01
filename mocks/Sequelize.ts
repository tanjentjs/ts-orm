import * as sinon from 'sinon';
import * as sequelize from 'sequelize';

export class Sequelize implements sequelize.SequelizeStaticAndInstance {
	public Utils: typeof sequelize.Utils;
	public Promise;
	public QueryTypes: sequelize.QueryTypes;
	public Validator: any;
	public Model: sequelize.Model<any, any>;
	public Transaction: sequelize.TransactionStatic;
	public Deferrable: sequelize.Deferrable;
	public Instance: sequelize.Instance<any, any>;
	public Error: sequelize.BaseError;
	public ValidationError: sequelize.ValidationError;
	public ValidationErrorItem: sequelize.ValidationErrorItem;
	public DatabaseError: sequelize.DatabaseError;
	public TimeoutError: sequelize.TimeoutError;
	public UniqueConstraintError: sequelize.UniqueConstraintError;
	public ExclusionConstraintError: sequelize.ExclusionConstraintError;
	public ForeignKeyConstraintError: sequelize.ForeignKeyConstraintError;
	public ConnectionError: sequelize.ConnectionError;
	public ConnectionRefusedError: sequelize.ConnectionRefusedError;
	public AccessDeniedError: sequelize.AccessDeniedError;
	public HostNotFoundError: sequelize.HostNotFoundError;
	public HostNotReachableError: sequelize.HostNotReachableError;
	public InvalidConnectionError: sequelize.InvalidConnectionError;
	public ConnectionTimedOutError: sequelize.ConnectionTimedOutError;

	public fn: sinon.SinonStub = sinon.stub();
	public col: sinon.SinonStub = sinon.stub();
	public cast: sinon.SinonStub = sinon.stub();
	public literal: sinon.SinonStub = sinon.stub();
	public asIs: sinon.SinonStub = sinon.stub();
	public and: sinon.SinonStub = sinon.stub();
	public or: sinon.SinonStub = sinon.stub();
	public json: sinon.SinonStub = sinon.stub();
	public where: sinon.SinonStub = sinon.stub();
	public condition: sinon.SinonStub = sinon.stub();
	public define: sinon.SinonStub = sinon.stub();

	constructor(
		public database,
		public username,
		public password,
		public options
	) { }
}

export class Model<TInstance, TAttributes> implements sequelize.Model<TInstance, TAttributes> {
	public Instance: sinon.SinonStub = sinon.stub();
	public removeAttribute: sinon.SinonStub = sinon.stub();
	public sync: sinon.SinonStub = sinon.stub();
	public drop: sinon.SinonStub = sinon.stub();
	public schema: sinon.SinonStub = sinon.stub();
	public getTableName: sinon.SinonStub = sinon.stub();
	public scope: sinon.SinonStub = sinon.stub();
	public findAll: sinon.SinonStub = sinon.stub();
	public all: sinon.SinonStub = sinon.stub();
	public findById: sinon.SinonStub = sinon.stub();
	public findByPrimary: sinon.SinonStub = sinon.stub();
	public findOne: sinon.SinonStub = sinon.stub();
	public find: sinon.SinonStub = sinon.stub();
	public aggregate: sinon.SinonStub = sinon.stub();
	public count: sinon.SinonStub = sinon.stub();
	public findAndCount: sinon.SinonStub = sinon.stub();
	public findAndCountAll: sinon.SinonStub = sinon.stub();
	public max: sinon.SinonStub = sinon.stub();
	public min: sinon.SinonStub = sinon.stub();
	public sum: sinon.SinonStub = sinon.stub();
	public build: sinon.SinonStub = sinon.stub();
	public bulkBuild: sinon.SinonStub = sinon.stub();
	public create: sinon.SinonStub = sinon.stub();
	public findOrInitialize: sinon.SinonStub = sinon.stub();
	public findOrBuild: sinon.SinonStub = sinon.stub();
	public findOrCreate: sinon.SinonStub = sinon.stub();
	public upsert: sinon.SinonStub = sinon.stub();
	public insertOrUpdate: sinon.SinonStub = sinon.stub();
	public bulkCreate: sinon.SinonStub = sinon.stub();
	public truncate: sinon.SinonStub = sinon.stub();
	public destroy: sinon.SinonStub = sinon.stub();
	public restore: sinon.SinonStub = sinon.stub();
	public update: sinon.SinonStub = sinon.stub();
	public describe: sinon.SinonStub = sinon.stub();
	public unscoped: sinon.SinonStub = sinon.stub();
	public addHook: sinon.SinonStub = sinon.stub();
	public hook: sinon.SinonStub = sinon.stub();
	public removeHook: sinon.SinonStub = sinon.stub();
	public hasHook: sinon.SinonStub = sinon.stub();
	public hasHooks: sinon.SinonStub = sinon.stub();
	public beforeValidate: sinon.SinonStub = sinon.stub();
	public afterValidate: sinon.SinonStub = sinon.stub();
	public beforeCreate: sinon.SinonStub = sinon.stub();
	public afterCreate: sinon.SinonStub = sinon.stub();
	public beforeDestroy: sinon.SinonStub = sinon.stub();
	public beforeDelete: sinon.SinonStub = sinon.stub();
	public afterDestroy: sinon.SinonStub = sinon.stub();
	public afterDelete: sinon.SinonStub = sinon.stub();
	public beforeUpdate: sinon.SinonStub = sinon.stub();
	public afterUpdate: sinon.SinonStub = sinon.stub();
	public beforeBulkCreate: sinon.SinonStub = sinon.stub();
	public afterBulkCreate: sinon.SinonStub = sinon.stub();
	public beforeBulkDestroy: sinon.SinonStub = sinon.stub();
	public beforeBulkDelete: sinon.SinonStub = sinon.stub();
	public afterBulkDestroy: sinon.SinonStub = sinon.stub();
	public afterBulkDelete: sinon.SinonStub = sinon.stub();
	public beforeBulkUpdate: sinon.SinonStub = sinon.stub();
	public afterBulkUpdate: sinon.SinonStub = sinon.stub();
	public beforeFind: sinon.SinonStub = sinon.stub();
	public beforeFindAfterExpandIncludeAll: sinon.SinonStub = sinon.stub();
	public beforeFindAfterOptions: sinon.SinonStub = sinon.stub();
	public afterFind: sinon.SinonStub = sinon.stub();
	public beforeDefine: sinon.SinonStub = sinon.stub();
	public afterDefine: sinon.SinonStub = sinon.stub();
	public beforeInit: sinon.SinonStub = sinon.stub();
	public afterInit: sinon.SinonStub = sinon.stub();
	public beforeBulkSync: sinon.SinonStub = sinon.stub();
	public afterBulkSync: sinon.SinonStub = sinon.stub();
	public beforeSync: sinon.SinonStub = sinon.stub();
	public afterSync: sinon.SinonStub = sinon.stub();
	public hasOne: sinon.SinonStub = sinon.stub();
	public belongsTo: sinon.SinonStub = sinon.stub();
	public hasMany: sinon.SinonStub = sinon.stub();
	public belongsToMany: sinon.SinonStub = sinon.stub();

	constructor(public tableName: string) {}
}
