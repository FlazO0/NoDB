const express = require('express');
const path = require('path');
const Database = require('..'); // Assumindo que o Database NoDB está no mesmo diretório

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do banco de dados
const database = new Database('database.json', {
  backupEnabled: true,
  backupInterval: '1d',
  backupPath: path.join(__dirname, 'backups'),
  saveToFile: true,
});

// Middleware para o body parser (para POST requests)
app.use(express.json());

// Endpoint para exibir formulário HTML básico
app.get('/', (req, res) => {
  const html = `
    <html>
    <head><title>Formulário de Usuário</title></head>
    <body>
      <h1>Formulário de Usuário</h1>
      <form action="/users" method="post">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required><br><br>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required><br><br>
        <button type="submit">Enviar</button>
      </form>
    </body>
    </html>
  `;
  res.send(html);
});

// Endpoint para listar todos os usuários
app.get('/users', (req, res) => {
  const users = database.findDocuments('users', {});
  res.json(users);
});

// Endpoint para inserir um novo usuário
app.post('/users', (req, res) => {
  const newUser = req.body;
  database.insertDocument('users', newUser);
  res.redirect('/users');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor Express rodando na porta ${PORT}`);
});
