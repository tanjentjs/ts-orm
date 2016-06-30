import { Response, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthHandler {
	public handleResponse(res: Response): Response {
		return res;
	}

	public setOptions(options: RequestOptions): RequestOptions {
		return options;
	}
}
