# TagOne

## TagOne Custom

Executa uma requisição à API OData do TagOne.

### Parâmetros

- Método: Método HTTP a ser utilizado na requisição.
- Endpoint: URL do recurso (depois do "/odata").
- OdataQuery: Objeto JSON que contém os parâmetros da consulta OData.

### OdataQuery

É um objeto JSON que contém os parâmetros de uma consulta OData.

Propriedades:
- $expand: string ou objeto que contém as propriedades que devem ser expandidas.
- $select: string ou array de strings que contém as propriedades que devem ser retornadas.
- $filter: string ou array de strings que contém as condições que devem ser aplicadas.
- $orderby: string ou array de strings que contém as propriedades que devem ser ordenadas.
- $top (número): limita a quantidade de registros retornados.
- $skip (número): quantidade de registros que devem ser ignorados/pulados. Útil para paginação.
- $count (booleano): indica se a contagem de registros deve ser retornada.

Exemplo 1: Utilizando arrays e objetos
```json
{
	"$expand": {
		"Cliente": {
			"$select": ["Id", "Nome"]
		},
		"Produtos": {}
	},
	"$select": ["Id", "Nome", "Data"],
	"$filter": ["Id eq 1", "Nome eq 'João'"],
	"$orderby": ["Data desc"],
	"$top": 10,
	"$skip": 0,
	"$count": true
}
```

Exemplo 2: Utilizando strings ao invés de arrays
```json
{
	"$expand": "Cliente, Produtos",
	"$select": "Id, Nome, Data",
	"$filter": "Id eq 1 and Nome eq 'João'",
	"$orderby": "Data desc",
	"$top": 10,
	"$skip": 0,
	"$count": true
}
```

