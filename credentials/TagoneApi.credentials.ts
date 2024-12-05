import type {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

export class TagoneApi implements ICredentialType {
	name = 'tagoneApi';
	displayName = 'TagOne API';
	// documentationUrl = 'https://doc.evolution-api.com/pt';

	properties: INodeProperties[] = [
		{
			displayName: 'URL Odata',
			name: 'odataUrl',
			type: 'string',
			description: 'URL da API Odata do TagOne',
			default: '',
			placeholder: 'https://dominio.tagone.com.br/odata',
		},
		{
			displayName: 'Usuário',
			name: 'username',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Senha',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Cookie',
			name: 'cookie',
			type: 'hidden',
			default: '',
			typeOptions: {
				expirable: true,
			},
		},
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		const odataUrl = credentials.odataUrl as string;
		const resp = await this.helpers.httpRequest({
			method: 'GET',
			url: `${odataUrl}/Usuario/Login(UserName='${credentials.username}',PassWord='${credentials.password}',Remember=true)`,
			returnFullResponse: true,
		});
		return { cookie: resp.headers['set-cookie'] };
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Cookie: '={{$credentials.cookie}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.odataUrl}}',
			url: '/Usuario/GetLoggedClaims',
		},
	};
}
