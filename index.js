const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');
const { performBackup } = require('./utils/backup');
const { checkIntegrity } = require('./utils/integrity');

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

class Database {
  constructor(databaseFilePath, options = {}) {
    const defaultOptions = {
      backupEnabled: true,
      backupInterval: '1d',
      backupPath: path.join(__dirname, 'backups'),
      saveToFile: true,
    };
    this.options = { ...defaultOptions, ...options };
    this.databaseFilePath = databaseFilePath;
    this.database = {};
    this.indexes = {};
    this.events = {};
    this.loadFromFile();
    this.setupBackup();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(this.databaseFilePath)) {
        const data = fs.readFileSync(this.databaseFilePath, 'utf8');
        this.database = JSON.parse(data);
        console.log('Banco de dados carregado de arquivo:', this.databaseFilePath);
        this.buildIndexes();
      } else {
        console.log('Criando novo banco de dados...');
        this.saveToFile();
      }
    } catch (error) {
      console.error('Erro ao carregar banco de dados:', error);
    }
  }

  saveToFile() {
    if (!this.options.saveToFile) {
      return;
    }
    try {
      fs.writeFileSync(this.databaseFilePath, JSON.stringify(this.database, null, 2), 'utf8');
      console.log('Banco de dados salvo em arquivo:', this.databaseFilePath);
    } catch (error) {
      console.error('Erro ao salvar banco de dados:', error);
    }
  }

  setupBackup() {
    if (this.options.backupEnabled) {
      setInterval(() => {
        performBackup(this.database, this.options.backupPath);
      }, this.getBackupInterval());
    }
  }

  getBackupInterval() {
    const matches = this.options.backupInterval.match(/^(\d+)([smhd])$/);
    if (!matches) {
      throw new Error('Intervalo de backup inválido');
    }

    const amount = parseInt(matches[1]);
    const unit = matches[2];

    switch (unit) {
      case 's':
        return amount * 1000; // segundos
      case 'm':
        return amount * 60 * 1000; // minutos
      case 'h':
        return amount * 60 * 60 * 1000; // horas
      case 'd':
        return amount * 24 * 60 * 60 * 1000; // dias
      default:
        throw new Error('Intervalo de backup inválido');
    }
  }

  generateUniqueId() {
    return uuidv4();
  }

  createCollection(collectionName) {
    if (!this.database[collectionName]) {
      this.database[collectionName] = [];
      this.indexes[collectionName] = {};
    }
  }

  buildIndexes() {
    for (const collectionName in this.database) {
      if (this.database.hasOwnProperty(collectionName)) {
        this.indexes[collectionName] = {};
        this.database[collectionName].forEach(doc => {
          for (const key in doc) {
            if (doc.hasOwnProperty(key)) {
              if (!this.indexes[collectionName][key]) {
                this.indexes[collectionName][key] = new Map();
              }
              this.indexes[collectionName][key].set(doc[key], doc);
            }
          }
        });
      }
    }
  }

  insertDocument(collectionName, document) {
    if (!document.id) {
      document.id = this.generateUniqueId();
    }
    if (!this.database[collectionName]) {
      this.createCollection(collectionName);
    }
    this.database[collectionName].push(document);
    this.indexDocument(collectionName, document);
    this.emit('documentInserted', { collectionName, document });
    this.saveChanges();
  }

  indexDocument(collectionName, document) {
    for (const key in document) {
      if (document.hasOwnProperty(key)) {
        if (!this.indexes[collectionName][key]) {
          this.indexes[collectionName][key] = new Map();
        }
        this.indexes[collectionName][key].set(document[key], document);
      }
    }
  }

  findDocuments(collectionName, filter = {}) {
    if (!this.database[collectionName]) {
      return [];
    }
    let result = this.database[collectionName];
    for (const key in filter) {
      if (filter.hasOwnProperty(key) && this.indexes[collectionName][key]) {
        const value = filter[key];
        if (this.indexes[collectionName][key].has(value)) {
          result = result.filter(doc => doc[key] === value);
        } else {
          return [];
        }
      }
    }
    return result;
  }

  updateDocument(collectionName, filter, update) {
    if (!this.database[collectionName]) {
      return null;
    }
    const collection = this.database[collectionName];
    const docIndex = collection.findIndex(doc => {
      for (let key in filter) {
        if (doc[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });

    if (docIndex !== -1) {
      const updatedDoc = { ...collection[docIndex], ...update };
      collection[docIndex] = updatedDoc;
      this.indexDocument(collectionName, updatedDoc);
      this.emit('documentUpdated', { collectionName, filter, update });
      this.saveChanges();
      return updatedDoc;
    } else {
      return null;
    }
  }

  deleteDocument(collectionName, filter) {
    if (!this.database[collectionName]) {
      return null;
    }
    const collection = this.database[collectionName];
    const docIndex = collection.findIndex(doc => {
      for (let key in filter) {
        if (doc[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });

    if (docIndex !== -1) {
      const deletedDoc = collection.splice(docIndex, 1)[0];
      this.removeDocumentFromIndex(collectionName, deletedDoc);
      this.emit('documentDeleted', { collectionName, filter });
      this.saveChanges();
      return deletedDoc;
    } else {
      return null;
    }
  }

  removeDocumentFromIndex(collectionName, document) {
    for (const key in document) {
      if (document.hasOwnProperty(key) && this.indexes[collectionName][key]) {
        this.indexes[collectionName][key].delete(document[key]);
      }
    }
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event, ...args) {
    const listeners = this.events[event];
    if (listeners) {
      listeners.forEach(listener => {
        listener(...args);
      });
    }
  }

  saveChanges() {
    this.saveToFile();
    checkIntegrity(this.database);
  }
}

module.exports = Database;
