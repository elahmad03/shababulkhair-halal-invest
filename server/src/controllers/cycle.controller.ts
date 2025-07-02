// src/controllers/cycle.controller.ts

import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const createCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, startDate, endDate } = req.body;

    const cycle = await prisma.cycle.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isOpen: true,
      },
    });

    res.status(201).json({ message: 'Cycle created successfully', cycle });
  } catch (error) {
    console.error('Create Cycle Error:', error);
    res.status(500).json({ message: 'Failed to create cycle' });
  }
};

export const closeCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cycleId } = req.params;

    const updated = await prisma.cycle.update({
      where: { id: cycleId },
      data: { isOpen: false },
    });

    res.json({ message: 'Cycle closed successfully', updated });
  } catch (error) {
    console.error('Close Cycle Error:', error);
    res.status(500).json({ message: 'Failed to close cycle' });
  }
};
