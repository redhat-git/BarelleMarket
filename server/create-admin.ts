import { hashPassword } from './auth';
import { storage } from './storage';

async function createAdmin() {
  try {
    const hashedPassword = await hashPassword('Barelle 2025');
    
    const adminUser = await storage.createUser({
      email: 'davidvortex3@gmail.com',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Admin',
      role: 'admin'
    });
    
    console.log('Admin créé avec succès:', adminUser);
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error);
  }
}

createAdmin();