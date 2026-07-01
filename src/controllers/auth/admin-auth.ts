import { Request, Response } from 'express';

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    // TODO: အနာဂတ်တွင် Password စစ်ခြင်းနှင့် JWT Token ထုတ်ခြင်းများ ရေးမည်
    res.json({ status: 'OK', message: 'I am admin login from Controller' });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
  }
};