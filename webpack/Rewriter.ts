
export class Rewriter {
	constructor(private destType: string) { }

	public apply (compiler) {
		compiler.plugin('normal-module-factory', (moduleFactory) => {
			moduleFactory.plugin('before-resolve', (data, cb) => {
				if (data.request.match('tanjentjs-ts-orm/node')) {
					data.request = data.request.replace('tanjentjs-ts-orm/node', 'tanjentjs-ts-orm/' + this.destType);
				}
				cb(null, data);
			});
		});
	}
}
