import { Router, RequestHandler } from 'express'
import { validate } from '../middleware/validate'
import { createItemSchema, updateItemSchema } from '../schemas/item.schema'
import { AppDataSource } from '../config/database'
import { SecureItem } from '../entities/SecureItem'
import { authenticateToken } from '../middleware/auth'
import { AppError } from '../middleware/error'
import { AuthenticatedRequest, AuthenticatedRequestHandler } from '../types/custom'

const router = Router()
const itemRepository = AppDataSource.getRepository(SecureItem)

router.use(authenticateToken)

// Create item
const createItem: RequestHandler = async (req, res, next) => {
  try {
    const { title, content, category } = req.body
    const user = (req as AuthenticatedRequest).user

    const item = new SecureItem()
    item.title = title
    item.encryptedContent = content
    item.category = category
    item.user = user

    await itemRepository.save(item)
    res.status(201).json(item)
  } catch (error) {
    next(error)
  }
}

// Get all items
const getAllItems: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user
    const items = await itemRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    })

    // Transform dates to ISO strings for consistent handling
    const transformedItems = items.map(item => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }))

    res.json(transformedItems)
  } catch (error) {
    next(error)
  }
}

// Get single item
const getItem: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user
    const item = await itemRepository.findOne({
      where: { id: req.params.id, user: { id: user.id } },
    })

    if (!item) {
      throw new AppError(404, 'Item not found')
    }

    res.json(item)
  } catch (error) {
    next(error)
  }
}

// Update item
const updateItem: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user
    const item = await itemRepository.findOne({
      where: { id: req.params.id, user: { id: user.id } },
    })

    if (!item) {
      throw new AppError(404, 'Item not found')
    }

    // Map content to encryptedContent if it exists
    const updateData = { ...req.body }
    if (updateData.content) {
      updateData.encryptedContent = updateData.content
      delete updateData.content
    }

    Object.assign(item, updateData)
    await itemRepository.save(item)
    res.json(item)
  } catch (error) {
    next(error)
  }
}

// Delete item
const deleteItem: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user
    const item = await itemRepository.findOne({
      where: { id: req.params.id, user: { id: user.id } },
    })

    if (!item) {
      throw new AppError(404, 'Item not found')
    }

    await itemRepository.remove(item)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

// Route definitions
router.post('/', validate(createItemSchema), createItem)
router.get('/', getAllItems)
router.get('/:id', getItem)
router.patch('/:id', validate(updateItemSchema), updateItem)
router.delete('/:id', deleteItem)

export default router 