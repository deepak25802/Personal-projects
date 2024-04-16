import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Hono } from 'hono';
import zod from 'zod';
import { Jwt } from 'hono/utils/jwt';

const users = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

users.post('/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string().min(7),
  });

  try {
    const body = await c.req.json();
    const { success } = signupSchema.safeParse(body);
    if (!success) {
      c.status(400);
      return c.json({
        error: 'Bad request',
      });
    }

    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
      },
    });

    const token = await Jwt.sign(user, c.env.JWT_SECRET);
    return c.json({ token: token });
  } catch (error) {
    c.status(500);
    return c.json({ message: 'Error while signup' });
  }
});

users.post('/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const signinSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
  });

  try {
    const body = await c.req.json();
    const { success } = signinSchema.safeParse(body);

    if (!success) {
      c.status(400);
      return c.json({
        message: 'Wrong data sent to input',
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: body.username,
        password: body.password,
      },
    });

    if (!user) {
      c.status(401);
      return c.json({
        message: 'Not authorized',
      });
    }

    const token = await Jwt.sign(user, c.env.JWT_SECRET);
    return c.json({
      token: token,
    });
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error while signin',
    });
  }
});

export default users;
