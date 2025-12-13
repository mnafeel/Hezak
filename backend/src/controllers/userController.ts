import { Request, Response } from 'express';
import { listUsers, getUserById } from '../services/userService';
import { serializeUser } from '../utils/userSerializers';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await listUsers();
    const serialized = users.map(serializeUser);
    
    // Filter out invalid users (missing required fields)
    const validUsers = serialized.filter((user) => 
      user && 
      user.id && 
      user.name && 
      typeof user.name === 'string' && 
      user.name.trim() !== '' &&
      user.name !== 'Invalid User' &&
      user.email && 
      typeof user.email === 'string' && 
      user.email.trim() !== '' &&
      user.email !== 'invalid@example.com'
    );
    
    if (serialized.length !== validUsers.length) {
      console.warn(`Filtered out ${serialized.length - validUsers.length} invalid user(s) from response`);
    }
    
    res.json(validUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }
    const user = await getUserById(id);
    const serialized = serializeUser(user);
    res.json(serialized);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
};

