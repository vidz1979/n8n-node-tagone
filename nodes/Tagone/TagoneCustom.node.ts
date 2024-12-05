import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { mountOdataQuery } from './utils';

export class TagoneCustom implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'TagOne Custom',
		name: 'tagoneCustom',
		group: ['transform'],
		version: 1,
		description: 'Requisição customizada para API do ERP TagOne',
		defaults: {
			name: 'TagOne Custom',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'tagoneApi',
				required: true,
			},
		],
		requestDefaults: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Método',
				name: 'method',
				type: 'options',
				options: [
					{
						name: 'GET',
						value: 'GET',
					},
					{
						name: 'POST',
						value: 'POST',
					},
					{
						name: 'DELETE',
						value: 'DELETE',
					},
				],
				default: 'GET',
				description: 'O método HTTP a ser utilizado',
			},
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'string',
				default: '',
				placeholder: '/Pessoa',
				description: 'O endpoint da API Odata do TagOne',
			},
			{
				displayName: 'Query Odata',
				name: 'odataQuery',
				type: 'json',
				placeholder: '{\n\t"$filter":"contains(Nome,\'João\')"\n}',
				default: '{}',
				description: 'Query Odata para manipulação dos dados',
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('tagoneApi');

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const method = this.getNodeParameter('method', itemIndex, 'GET');
				const endpoint = this.getNodeParameter('endpoint', itemIndex, '');
				const odataQueryParam = (
					this.getNodeParameter('odataQuery', itemIndex, '{}') as string
				).trim();
				// TODO: fazer validação da query Odata
				const odataQuery = JSON.parse(odataQueryParam ?? '{}');

				if (!odataQuery.$top) odataQuery.$top = 200;

				const urlQuery = `${credentials.odataUrl}${endpoint}` + mountOdataQuery(odataQuery);

				const requestOptions: IRequestOptions = {
					headers: {
						cookie: credentials.cookie,
					},
					method: method as any,
					uri: urlQuery,
				};

				const result = JSON.parse(await this.helpers.request(requestOptions));
				if (result['value'] && Array.isArray(result['value'])) {
					items[itemIndex].json = result['value'] as any;
				} else {
					items[itemIndex].json = result;
				}
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
