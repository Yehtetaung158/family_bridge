// src/controllers/user-auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../services/prisma';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, parentPhone, telegramChatId } = req.body;

    if (!name || !email || !password || !parentPhone) {
      res.status(400).json({ status: 'Error', message: 'Required fields are missing' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { parentPhone: parentPhone }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ status: 'Error', message: 'Email or Parent Phone already registered' });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        parentPhone,
        telegramChatId: telegramChatId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        parentPhone: true,
        createdAt: true
      }
    });

    res.status(201).json({
      status: 'OK',
      message: 'User registered successfully!',
      data: newUser
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ status: 'Error', message: 'Required fields are missing' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, parentPhone: true, createdAt: true, passwordHash: true }
    });

    if (!user) {
      res.status(404).json({ status: 'Error', message: 'User not found' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ status: 'Error', message: 'Invalid password' });
      return;
    }

    const { passwordHash, ...userWithoutHash } = user;
    const token = jwt.sign(
      { userId: userWithoutHash.id, email: userWithoutHash.email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'OK',
      message: 'User logged in successfully!',
      data: userWithoutHash,
      token,
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
  }
};