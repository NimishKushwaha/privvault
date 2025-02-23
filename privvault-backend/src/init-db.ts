import 'dotenv/config'
import { AppDataSource } from './config/database'
import { User } from './entities/User'

async function initializeDatabase() {
  try {
    await AppDataSource.initialize()
    console.log('Database connection initialized')

    // Drop existing tables and recreate
    await AppDataSource.synchronize(true)
    console.log('Database schema synchronized')

    // Create admin user
    const userRepository = AppDataSource.getRepository(User)
    const admin = new User()
    admin.email = 'admin@privvault.com'
    await admin.setPassword('admin123')
    await userRepository.save(admin)
    console.log('Admin user created')

    process.exit(0)
  } catch (error) {
    console.error('Error during initialization:', error)
    process.exit(1)
  }
}

initializeDatabase() 