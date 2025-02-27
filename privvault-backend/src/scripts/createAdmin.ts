import 'reflect-metadata'
import 'dotenv/config'
import { AppDataSource } from '../config/database'
import { User } from '../entities/User'

async function createAdminUser() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize()
    console.log('Database connection initialized')

    const userRepository = AppDataSource.getRepository(User)

    // Check if admin already exists
    const adminExists = await userRepository.findOne({
      where: { email: 'admin@privvault.com' }
    })

    if (adminExists) {
      console.log('Admin user already exists')
      process.exit(0)
    }

    // Create new admin user
    const admin = new User()
    admin.email = 'admin2@privvault.com'
    await admin.setPassword('admin123')
    await userRepository.save(admin)
    console.log('Admin user created successfully')

    process.exit(0)
  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  }
}

createAdminUser() 