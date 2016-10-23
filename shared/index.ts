import { OpaqueToken } from '@angular/core';

export * from './BaseContract';
export * from './BaseConnection';
export * from './ConnectionWorker';
export * from './Field';
export * from './RemoteKeys';
export * from './ForeignKey';
export * from './Logger';
export { Fetchable } from './Fetchable';
export let API_BASE = new OpaqueToken('API_BASE');
