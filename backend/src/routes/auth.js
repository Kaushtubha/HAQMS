const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-secret-key-12345!!!';

router.post('/register', async (req, res) => {
try {
console.log('[DEBUG] Registering user with email:', req.body.email);

```
const { email, password, name, role } = req.body;

if (!email || !password || !name) {
  return res.status(400).json({ error: 'All fields are required' });
}

const existingUser = await prisma.user.findUnique({
  where: { email }
});

if (existingUser) {
  return res.status(400).json({ error: 'User already exists' });
}

const hashedPassword = await bcrypt.hash(password, 10);

const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    role: role || 'RECEPTIONIST'
  }
});

res.status(201).json({
  message: 'User registered successfully',
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
});
```

} catch (error) {
console.error('[REGISTER ERROR]', error);

```
res.status(500).json({
  error: 'Server error during registration',
  message: error.message
});
```

}
});

router.post('/login', async (req, res) => {
try {
console.log(`[AUTH] Login attempt for email: ${req.body.email}`);

```
const { email, password } = req.body;

if (!email || !password) {
  return res.status(400).json({
    error: 'Email and password required'
  });
}

const user = await prisma.user.findUnique({
  where: { email }
});

console.log('[DEBUG] User found:', !!user);

if (!user) {
  return res.status(401).json({
    error: 'Invalid credentials'
  });
}

console.log('[DEBUG] User role:', user.role);
console.log('[DEBUG] Password hash exists:', !!user.password);

const isMatch = await bcrypt.compare(password, user.password);

console.log('[DEBUG] Password match:', isMatch);

if (!isMatch) {
  return res.status(401).json({
    error: 'Invalid credentials'
  });
}

console.log('[DEBUG] JWT Secret exists:', !!JWT_SECRET);

const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  },
  JWT_SECRET,
  {
    expiresIn: '1d'
  }
);

console.log('[DEBUG] JWT generated successfully');

res.json({
  status: 'success',
  data: {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
});


} catch (error) {
console.error('[LOGIN ERROR]', error);
console.error('[LOGIN ERROR MESSAGE]', error.message);
console.error('[LOGIN ERROR STACK]', error.stack);


res.status(500).json({
  error: 'Internal Server Error',
  message: error.message
});


}
});

router.get('/me', authenticate, async (req, res) => {
try {
const user = await prisma.user.findUnique({
where: { id: req.user.id },
select: {
id: true,
email: true,
name: true,
role: true
}
});

```
if (!user) {
  return res.status(404).json({
    error: 'User not found'
  });
}

res.json(user);
```

} catch (error) {
console.error('[ME ERROR]', error);

```
res.status(500).json({
  error: 'Internal Server Error',
  message: error.message
});
```

}
});

module.exports = router;
