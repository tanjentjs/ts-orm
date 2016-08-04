export interface ILogger {
	debug(module: string, ...args: any[]): void;
	info(module: string, ...args: any[]): void;
}
