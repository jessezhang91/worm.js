import { CompositeField, Field, FieldExclusion, Filter, JoinManyField, Orm } from "../core";
import { normalizeExclusivity } from "./field";

export type JoinFieldsBuilder<J extends Orm> = (orm: J) => Array<Field<J, any> | CompositeField | JoinManyField<any, J> | Orm>;
export interface JoinThroughBuilder<O extends Orm> {
	ref: string | symbol;
	builder: JoinExpressionBuilder<O>;
}

export type JoinExpressionBuilder<O> = (o: O, ...orms: Orm[]) => Filter;
export type JoinExpressionBuilder2<O1, O2> = (o1: O1, o2: O2) => Filter;
export type JoinExpressionBuilder3<O1, O2, O3> = (o1: O1, o2: O2, o3: O3) => Filter;
export type JoinExpressionBuilder4<O1, O2, O3, O4> = (o1: O1, o2: O2, o3: O3, o4: O4) => Filter;
export type JoinExpressionBuilder5<O1, O2, O3, O4, O5> = (o1: O1, o2: O2, o3: O3, o4: O4, o5: O5, ...orms: Orm[]) => Filter;

export type JoinOrmAuthBuilder<A, O> = (auth: A, o: O, ...orms: Orm[]) => Filter | undefined;
export type JoinOrmAuthBuilder2<A, O1, O2> = (auth: A, o1: O1, o2: O2) => Filter | undefined;
export type JoinOrmAuthBuilder3<A, O1, O2, O3> = (auth: A, o1: O1, o2: O2, o3: O3) => Filter | undefined;
export type JoinOrmAuthBuilder4<A, O1, O2, O3, O4> = (auth: A, o1: O1, o2: O2, o3: O3, o4: O4) => Filter | undefined;
export type JoinOrmAuthBuilder5<A, O1, O2, O3, O4, O5> = (auth: A, o1: O1, o2: O2, o3: O3, o4: O4, o5: O5, ...orms: Orm[]) => Filter | undefined;

export abstract class JoinDefinition<O, J> {
	ref: string | symbol;
	exclusivity: FieldExclusion;
	abstract fieldsBuilder?: JoinFieldsBuilder<O | J>;
	abstract throughBuilders: Array<JoinThroughBuilder<O | J>>;
	abstract onBuilder: JoinExpressionBuilder<O | J>;
	abstract authBuilder?: JoinOrmAuthBuilder<any, O | J>;

	constructor(ref: string | symbol, exclusivity: FieldExclusion) {
		this.ref = ref;
		this.exclusivity = exclusivity;
	}

	abstract fields(fieldsBuilder: JoinFieldsBuilder<O | J>): this;
	abstract through(ref: string | symbol, builder: JoinExpressionBuilder<O | J>): JoinDefinition<O, J>;
	abstract on(builder: JoinExpressionBuilder<O | J>): this;
	abstract withAuth<A>(builder: JoinOrmAuthBuilder<A, O | J>): this;
}
export interface JoinDefinition2<O, J> extends JoinDefinition<O, J> {
	through<T1 extends Orm>(ref: string | symbol, builder: JoinExpressionBuilder2<O, T1>): JoinDefinition3<O, T1, J>;
	on(builder: JoinExpressionBuilder2<O, J>): this;
	withAuth<A>(builder: JoinOrmAuthBuilder2<A, O, J>): this;
}
export interface JoinDefinition3<O, T1, J> extends JoinDefinition<O, J> {
	through<T2 extends Orm>(ref: string | symbol, builder: JoinExpressionBuilder3<O, T1, T2>): JoinDefinition4<O, T1, T2, J>;
	on(builder: JoinExpressionBuilder3<O, T1, J>): this;
	withAuth<A>(builder: JoinOrmAuthBuilder3<A, O, T1, J>): this;
}
export interface JoinDefinition4<O, T1, T2, J> extends JoinDefinition<O, J> {
	through<T3 extends Orm>(ref: string | symbol, builder: JoinExpressionBuilder4<O, T1, T2, T3>): JoinDefinition5<O, T1, T2, T3, J>;
	on(builder: JoinExpressionBuilder4<O, T1, T2, J>): this;
	withAuth<A>(builder: JoinOrmAuthBuilder4<A, O, T1, T2, J>): this;
}
export interface JoinDefinition5<O, T1, T2, T3, J> extends JoinDefinition<O, J> {
	through<T4 extends Orm>(ref: string | symbol, builder: JoinExpressionBuilder5<O, T1, T2, T3, T4>): JoinDefinition5<O, T1, T2, T3, J>;
	on(builder: JoinExpressionBuilder5<O, T1, T2, T3, J>): this;
	withAuth<A>(builder: JoinOrmAuthBuilder5<A, O, T1, T2, T3, J>): this;
}

export class JoinOneDefinition<O extends Orm, J extends Orm> extends JoinDefinition<O, J> implements JoinDefinition2<O, J> {
	fieldsBuilder?: JoinFieldsBuilder<J>;
	throughBuilders: Array<JoinThroughBuilder<O>> = [];
	onBuilder: JoinExpressionBuilder<O>;
	authBuilder?: JoinOrmAuthBuilder<any, O>;

	fields(fieldsBuilder: JoinFieldsBuilder<J>): this {
		this.fieldsBuilder = fieldsBuilder;
		return this;
	}

	through<T1 extends Orm>(ref: string | symbol, builder: JoinExpressionBuilder2<O, T1>): JoinDefinition3<O, T1, J> {
		this.throughBuilders.push({
			ref: ref,
			builder: builder
		});
		return this as any as JoinDefinition3<O, T1, J>;
	}

	on(builder: JoinExpressionBuilder2<O, J>): this {
		this.onBuilder = builder;
		return this;
	}

	withAuth<A>(builder: JoinOrmAuthBuilder2<A, O, J>): this {
		this.authBuilder = builder;
		return this;
	}
}

export class JoinManyDefinition<O extends Orm, J extends Orm> extends JoinDefinition<J, O> implements JoinDefinition2<J, O> {
	fieldsBuilder?: JoinFieldsBuilder<J>;
	throughBuilders: Array<JoinThroughBuilder<J>> = [];
	onBuilder: JoinExpressionBuilder<J>;
	authBuilder?: JoinOrmAuthBuilder<any, J>;

	fields(fieldsBuilder: JoinFieldsBuilder<J>): this {
		this.fieldsBuilder = fieldsBuilder;
		return this;
	}

	through<T1 extends Orm>(ref: string | symbol, builder: JoinExpressionBuilder2<J, T1>): JoinDefinition3<J, T1, O> {
		this.throughBuilders.push({
			ref: ref,
			builder: builder
		});
		return this as any as JoinDefinition3<J, T1, O>;
	}

	on(builder: JoinExpressionBuilder2<J, O>): this {
		this.onBuilder = builder;
		return this;
	}

	withAuth<A>(builder: JoinOrmAuthBuilder2<A, J, O>): this {
		this.authBuilder = builder;
		return this;
	}
}

export type JoinOneDefiner<O extends Orm> = <J extends Orm>(ref: string | symbol, exclusivity?: FieldExclusion | boolean) => JoinOneDefinition<O, J>;
export type JoinManyDefiner<O extends Orm> = <J extends Orm>(ref: string | symbol, exclusivity?: FieldExclusion | boolean) => JoinManyDefinition<O, J>;
export interface JoinDefinitions<O extends Orm> {
	One: JoinOneDefiner<O>;
	Many: JoinManyDefiner<O>;
}
export const joinDefinitions: JoinDefinitions<Orm> = {
	One: (ref: string | symbol, exclusivity?: FieldExclusion | boolean) => {
		return new JoinOneDefinition<Orm, Orm>(ref, normalizeExclusivity(exclusivity, FieldExclusion.EXCLUDE));
	},
	Many: (ref: string | symbol, exclusivity?: FieldExclusion | boolean) => {
		return new JoinManyDefinition<Orm, Orm>(ref, normalizeExclusivity(exclusivity, FieldExclusion.EXCLUDE));
	}
};
