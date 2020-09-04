import { Injectable } from "@angular/core";
import {
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
	HttpResponse
} from "@angular/common/http";

// Add RxJS observable
import { Observable,of } from "rxjs";

import "rxjs/add/operator/do";
import "rxjs/observable/of";
import { share } from 'rxjs/operators';


// Add the service we created in Step 1
import { CacheRegistrationService } from "./cache-registration.service";

@Injectable()
export class UriCachingInterceptor implements HttpInterceptor {
	private cachedData = new Map<string, any>();

	constructor(private cacheRegistrationService: CacheRegistrationService) {
	}

	public intercept(httpRequest: HttpRequest<any>, handler: HttpHandler) {
		// Don't cache if
		// 1. It's not a GET request
		// 2. If URI is not supposed to be cached
		if (httpRequest.method !== "GET" ||
			!this.cacheRegistrationService.addedToCache(httpRequest.url)) {
			return handler.handle(httpRequest);
		}

		// Also leave scope of resetting already cached data for a URI
		if (httpRequest.headers.get("reset-cache")) {
			this.cachedData.delete(httpRequest.urlWithParams);
		}

		// Checked if there is cached data for this URI
		const lastResponse = this.cachedData.get(httpRequest.urlWithParams);
		if (lastResponse) {
			// In case of parallel requests to same URI,
			// return the request already in progress
			// otherwise return the last cached data
			return (lastResponse instanceof Observable)
				? lastResponse : of(lastResponse.clone());
		}

		// If the request of going through for first time
		// then let the request proceed and cache the response
		const requestHandle = handler.handle(httpRequest).do((stateEvent) => {
			if (stateEvent instanceof HttpResponse) {
				this.cachedData.set(
					httpRequest.urlWithParams,
					stateEvent.clone()
				);
			}
		}).pipe(share());

		// Meanwhile cache the request Observable to handle parallel request
		this.cachedData.set(httpRequest.urlWithParams, requestHandle);

		return requestHandle;
	}
}