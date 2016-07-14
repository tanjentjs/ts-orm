import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
require('source-map-support').install();

/**
 * This makes the "loading non-allowed module" warnings from mockery fatal
 */
const origwarn = console.warn;
console.warn = function(...args: any[]) {
	if (
		args.length === 1 &&
		args[0].startsWith &&
		args[0].startsWith('WARNING: loading non-allowed module:')
	) {
		chai.expect(args[0].replace('WARNING: loading non-allowed module: ', ''))
			.to.equal('', 'Loading non-allowed module');
	} else {
		origwarn.apply(console, args);
	}
};
