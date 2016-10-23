import {Injectable} from '@angular/core';

@Injectable()
export abstract class Logger {
	public abstract error(message: string);
}
