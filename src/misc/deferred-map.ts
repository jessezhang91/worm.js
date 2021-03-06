export interface DeferredEntry<T> {
	promise: Promise<T>;
	resolve: (value: T | Promise<T>) => void;
	value?: T;
}

export class DeferredMap<K, V> {
	private map: Map<K, DeferredEntry<V>>;

	constructor() {
		this.map = new Map<K, DeferredEntry<V>>();
	}

	get(key: K): Promise<V> {
		let deferred: DeferredEntry<V> | undefined = this.map.get(key);
		if (deferred != null) {
			return deferred.promise;
		}

		let resolve: ((value: V | Promise<V>) => void) | undefined;
		let promise: Promise<V> = new Promise((r) => {
			resolve = r;
		});

		deferred = {
			promise: promise,
			resolve: resolve!
		};
		this.map.set(key, deferred);

		return promise;
	}

	getSync(key: K): V {
		let deferred: DeferredEntry<V> | undefined = this.map.get(key);
		if (deferred == null || deferred.value === undefined) {
			throw new Error(`Failed to retrieve '${ key }' synchronously`);
		}
		return deferred.value!;
	}

	getAwait(key: K, ms: number = 1000): Promise<V> {
		return new Promise<V>((resolve, reject) => {
			let timer: NodeJS.Timer = setTimeout(() => {
				// TODO: error
				reject(new Error(`Failed to retrieve '${ key }' in ${ ms }ms`));
			}, ms);

			this.get(key).then((val) => {
				clearTimeout(timer);
				resolve(val);
			}).catch((err) => {
				clearTimeout(timer);
				reject(err);
			});
		});
	}

	set(key: K, value: V | Promise<V>): void {
		if (!this.has(key)) {
			// force it to make the deferred structure
			this.get(key);
		}

		let deferred: DeferredEntry<V> = this.map.get(key)!;
		Promise.resolve(value).then((unwrappedValue) => {
			deferred.value = unwrappedValue;
			deferred.resolve(unwrappedValue);
		});
	}

	has(key: K): boolean {
		return this.map.has(key);
	}

	awaitAll(): Promise<void> {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				let promises: Array<Promise<any>> = Array.from(this.map.values()).map((entry) => entry.promise);
				Promise.all(promises).then(() => {
					resolve();
				});
			});
		});
	}

	clear(): void {
		this.map.clear();
	}
}
