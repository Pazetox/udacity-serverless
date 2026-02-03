import { v4 } from 'uuid'
import { TodosDataAccess } from '../dataLayer/todosDataAccess.mjs'

const todoDataAccess = new TodosDataAccess()

export const create = async (req, userId) => 
{
    const todoId = v4()
    return await todoDataAccess.createItem({
        todoId,
        name: req.name,
        userId,
        done: false,
        createdAt: new Date().toISOString(),
        dueDate: req.dueDate
    })
}

export const update = async (req, todoId, userId) => 
{
    return await todoDataAccess.updateItem({
        todoId,
        name: req.name,
        dueDate: req.dueDate,
        done: req.done,
        userId
    })
}

export const deleteItem = async (todoId, userId) => {
    return await todoDataAccess.deleteItem(todoId, userId)
}

export const getTodos = async (userId) => {
    return await todoDataAccess.getListOfTodo(userId)
}