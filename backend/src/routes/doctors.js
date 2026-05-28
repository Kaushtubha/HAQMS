const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const { search, specialization } = req.query;
    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (specialization && specialization !== 'All') {
      where.specialty = { equals: specialization, mode: 'insensitive' };
    }
    const doctors = await prisma.doctor.findMany({ where });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

router.get('/stats', authenticate, async (req, res) => {
  try {
    const [totalDoctors, surgeonsCount, averageFee, highestExperience] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({ where: { department: 'Surgery' } }),
      prisma.doctor.aggregate({ _avg: { consultationFee: true } }),
      prisma.doctor.aggregate({ _max: { experience: true } }),
    ]);
    res.json({
      success: true,
      data: {
        total: totalDoctors,
        surgeons: surgeonsCount,
        averageFee: Math.round(averageFee._avg.consultationFee || 0),
        maxExperience: highestExperience._max.experience || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor stats' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { id: req.params.id } });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

module.exports = router;
