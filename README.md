
## NoDB - Banco de Dados NoSQL em Node.js

NoDB é um banco de dados NoSQL desenvolvido em Node.js, projetado para oferecer uma solução eficiente e flexível para armazenamento e gerenciamento de dados.

#### Instalação

Para começar a utilizar o NoDB, siga estes passos simples:

1. Clone o repositório ou faça o download do código-fonte.
2. Instale as dependências necessárias com `npm install`.

#### Configuração

Você pode configurar o comportamento do NoDB através das seguintes opções:

```javascript
const database = new Database("database.json", {
    backupEnabled: true,
    backupInterval: '1d',
    backupPath: "path/to/backups",
    saveToFile: true,
});
```

- `backupEnabled`: Habilita ou desabilita o sistema de backup automático.
- `backupInterval`: Intervalo de tempo entre os backups automáticos (exemplo: `'1d'` para um backup a cada dia).
- `backupPath`: Caminho onde os backups serão armazenados.
- `saveToFile`: Habilita ou desabilita a persistência de dados em arquivo.

#### Métodos

##### `generateUniqueId()`

Gera um UUID v4 único para uso como ID de documento.

Exemplo de uso:

```javascript
const id = database.generateUniqueId();
console.log(id); // Output: '3ec33c14-7f8a-4a21-b85e-1f9a460f2f9b'
```

##### `insertDocument(collectionName, document)`

Insere um documento na coleção especificada.

Exemplo de uso:

```javascript
const newUser = {
  username: 'joao',
  email: 'joao@email.com',
};

database.insertDocument('users', newUser);
```

##### `findDocuments(collectionName, filter)`

Busca documentos na coleção especificada baseado no filtro fornecido.

Exemplo de uso:

```javascript
const filteredUsers = database.findDocuments('users', { username: 'joao' });
console.log(filteredUsers);
```

##### `updateDocument(collectionName, filter, update)`

Atualiza um documento na coleção especificada baseado no filtro fornecido.

Exemplo de uso:

```javascript
const updateFilter = { username: 'joao' };
const updateData = { email: 'novo_email@email.com' };

const updatedUser = database.updateDocument('users', updateFilter, updateData);
```

##### `deleteDocument(collectionName, filter)`

Remove um documento na coleção especificada baseado no filtro fornecido.

Exemplo de uso:

```javascript
const deleteFilter = { username: 'joao' };

const deletedUser = database.deleteDocument('users', deleteFilter);
console.log('Usuário deletado:', deletedUser);
```

#### Eventos

O sistema de eventos permite que você registre ouvintes para serem notificados sobre a inserção, atualização ou remoção de documentos. Exemplo de uso:

```javascript
database.on('documentInserted', ({ collectionName, document }) => {
  console.log(`Novo documento inserido na coleção ${collectionName}:`, document);
});
```

#### Backup Automático

O NoDB suporta backups automáticos configuráveis. Os backups são realizados de acordo com o intervalo configurado (`backupInterval`) e armazenados no diretório especificado (`backupPath`). Exemplo de configuração:

```javascript
const database = new Database("database.json", {
    backupEnabled: true,
    backupInterval: '1d',
    backupPath: "path/to/backups",
    saveToFile: true,
});
```

#### Funcionalidades Atuais e Possíveis Futuras Atualizações

| Funcionalidade                  | Descrição                                                                                                                                                           | Status            |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| Backup Automático                | Sistema de backup automático configurável para manter a integridade dos dados.                                                                                      | Implementado      |
| Eventos                          | Capacidade de registrar e receber notificações sobre operações de documentos.                                                                                       | Implementado      |
| Métodos CRUD                    | Operações básicas de criação, leitura, atualização e exclusão de documentos.                                                                                        | Implementado      |
| Sistema de ID único              | Geração automática de IDs únicos para documentos.                                                                                                                   | Implementado      |
| Configurações Flexíveis          | Configuração via arquivo de opções para personalização do comportamento do banco de dados.                                                                          | Implementado      |
|                              |                                                                                                                                                                     |                   |
| Suporte a Servidor               | Expansão para suportar execução como um serviço/servidor de banco de dados, não apenas local.                                                                       | Futura Atualização|
| Suporte a Autenticação           | Integração direta com sistemas de autenticação via JWT (JSON Web Tokens) ou Bcrypt para segurança avançada.                                                         | Futura Atualização|
| Sistema de Filtro Melhorado      | Aprimoramento das funcionalidades de busca e filtro para consultas mais complexas e eficientes.                                                                    | Futura Atualização|
| Painel de Administração          | Desenvolvimento de um painel de administração com gráficos de desempenho, estatísticas e monitoramento em tempo real.                                               | Futura Atualização|
---

#### Considerações Finais

NoDB é uma solução robusta e flexível para suas necessidades de armazenamento de dados NoSQL em aplicações Node.js. Com funcionalidades atuais poderosas e um roadmap claro para futuras atualizações, NoDB é ideal para projetos que exigem escalabilidade, segurança e personalização.
