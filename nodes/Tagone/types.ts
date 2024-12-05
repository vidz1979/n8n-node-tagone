import Joi from 'joi';

export interface TagoneMessage {
	ID?: string;
	Tipo?: string;
	Icon?: string;
	Title?: string;
	Message?: string;
}

export interface KeysValues {
	Keys: string[];
	Values: string[];
}

export type LoggedClaims = Record<string, string>;

export type OdataExpand = Record<string, OdataQuery> | string;
export type OdataSelect = string[] | string;
export type OdataFilter = string[] | string;
export type OdataOrderBy = string[] | string;

export type OdataQuery = {
	$expand?: OdataExpand;
	$select?: OdataSelect;
	$filter?: OdataFilter;
	$orderby?: OdataOrderBy;
	$top?: number;
	$skip?: number;
	$count?: boolean;
	$apply?: string;
};

export type PaginatedResult<T> = {
	data: T[];
	meta: {
		count: number;
		pages: number;
		page: number;
		filter?: OdataFilter;
		sort?: OdataOrderBy;
	};
};

export const odataQuerySchema = Joi.object<OdataQuery>({
	$expand: Joi.alternatives(Joi.object().pattern(Joi.string(), Joi.link('/')), Joi.string()),
	$select: Joi.alternatives(Joi.array().items(Joi.string()), Joi.string()),
	$filter: Joi.alternatives(Joi.array().items(Joi.string()), Joi.string()),
	$orderby: Joi.alternatives(Joi.array().items(Joi.string()), Joi.string()),
	$top: Joi.number(),
	$skip: Joi.number(),
	$count: Joi.boolean(),
	$apply: Joi.string(),
});
