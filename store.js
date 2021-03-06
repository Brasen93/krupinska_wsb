const uuid = require('uuid')
const storage = require('azure-storage')
const service = storage.createTableService()
const table = 'tasks'

const init = async () => (
  new Promise((resolve, reject) => {
    service.createTableIfNotExists(table, (error, result, response) => {
      !error ? resolve() : reject()
    })
  })
)

const createTask = async (title, description) => (
  new Promise((resolve, reject) => {
    const generator = storage.TableUtilities.entityGenerator
    const task = {
      PartitionKey: generator.String('task'),
      RowKey: generator.String(uuid.v4()),
      title,
      description,
      status: 'open',
      date: generator.DateTime(new Date(Date.now()))
    }

    service.insertEntity(table, task, (error, result, response) => {
      !error ? resolve() : reject()
    })
  })
)

const listTasks = async () => (
  new Promise((resolve, reject) => {
    const query = new storage.TableQuery()
      .select(['RowKey', 'title','description', 'status', 'date'])
      .where('PartitionKey eq ?', 'task')

    service.queryEntities(table, query, null, (error, result, response) => {
      !error ? resolve(result.entries.map((entry) => ({
        id: entry.RowKey._,
        title: entry.title._,
        description: entry.description._,
        status: entry.status._,
        date: entry.date._
      }))) : reject()
    })
  })
)

const updateTaskStatus = async (id, status) => (
  new Promise((resolve, reject) => {
    const generator = storage.TableUtilities.entityGenerator
    const task = {
      PartitionKey: generator.String('task'),
      RowKey: generator.String(id),
      status,
      date: generator.DateTime(new Date(Date.now()))
    }

    service.mergeEntity(table, task, (error, result, response) => {
      !error ? resolve() : reject()
    })
  })
)

const deleteTask = async (partitionKey, rowKey) => (
    new Promise((resolve, reject) => {
        const task = {
            PartitionKey: {'_' : partitionKey},
            RowKey: {'_' : rowKey.toString()}
        }

        service.deleteEntity(table, task, (error, result, response) => {
            !error ? resolve() : reject()
        })
    })
)

module.exports = {
  init,
  createTask,
  listTasks,
  updateTaskStatus,
  deleteTask
}
