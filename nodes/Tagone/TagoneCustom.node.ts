import type {
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { mountOdataQuery } from './utils';
import { odataQuerySchema } from './types';

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
		documentationUrl: 'https://github.com/vidz1979/n8n-nodes-tagone/blob/master/DOC.md',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('tagoneApi');
		const returnData = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const method = this.getNodeParameter('method', itemIndex, 'GET') as IHttpRequestMethods;
			const endpoint = this.getNodeParameter('endpoint', itemIndex, '');
			const odataQueryString = this.getNodeParameter('odataQuery', itemIndex, '{}') as string;

			try {
				var odataQueryObj = JSON.parse(odataQueryString);
			} catch {
				throw new NodeOperationError(this.getNode(), `Invalid Odata Query: error parsing JSON`, {});
			}

			const { value: odataQuery, error } = odataQuerySchema.validate(odataQueryObj);

			if (error) {
				throw new NodeOperationError(this.getNode(), `Invalid Odata Query: ${error.message}`, {});
			}
			if (!odataQuery.$top) odataQuery.$top = 200;

			const requestOptions: IRequestOptions = {
				headers: {
					cookie: credentials.cookie,
				},
				method,
				uri: `${credentials.odataUrl}${endpoint}` + mountOdataQuery(odataQuery),
			};

			const response = await this.helpers.request(requestOptions);
			try {
				var result = JSON.parse(response);
			} catch {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid JSON response: error parsing JSON`,
					{},
				);
			}

			if (result['value'] && Array.isArray(result['value']) && !odataQuery.$count) {
				returnData.push(result['value']);
			} else {
				returnData.push(result);
			}
		}

		return returnData.map((data) => this.helpers.returnJsonArray(data));
	}
}
