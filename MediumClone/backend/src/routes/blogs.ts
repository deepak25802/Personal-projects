import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Hono } from 'hono';
import zod from 'zod';

const blogs = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();

blogs.post('/', async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const createSchema = zod.object({
    title: zod.string(),
    content: zod.string(),
  });
  const { success } = createSchema.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({
      message: 'Invalid input to create blog',
    });
  }

  try {
    const blog = await prisma.post.create({
      data: {
        author: {
          connect: {
            id: 1,
          },
        },
        title: body.title,
        content: body.content,
      },
    });

    return c.json({
      message: 'Created the blog post',
      id: blog.id,
    });
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error while creating the blog post',
    });
  }
});

blogs.put('/', async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const updateSchema = zod.object({
    title: zod.string(),
    content: zod.string(),
    id: zod.number(),
  });
  const { success } = updateSchema.safeParse(body);

  if (!success) {
    c.status(400);
    return c.json({
      message: 'Invalid input to create blog',
    });
  }

  try {
    const blog = await prisma.post.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    return c.json({
      message: 'Updated the blog post',
      id: blog.id,
    });
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error while creating the blog post',
    });
  }
});

blogs.get('/', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = await prisma.post.findMany();

    return c.json({
      blogs,
    });
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error while getting the blog posts',
    });
  }
});

blogs.get('/:id', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const id = parseInt(c.req.param().id);

  try {
    const blogs = await prisma.post.findMany({
      where: {
        author: {
          id: id,
        },
      },
    });

    return c.json({
      blogs,
    });
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error while getting the blog posts',
    });
  }
});

blogs.delete('/', async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const deleteSchema = zod.object({
    id: zod.number(),
  });
  const { success } = deleteSchema.safeParse(body);

  if (!success) {
    c.status(400);
    return c.json({
      message: 'Invalid input to create blog',
    });
  }

  try {
    await prisma.post.delete({
      where: {
        id: body.id,
      },
    });

    return c.json({
      message: 'Deleted the blog post',
    });
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error while deleting the blog post',
    });
  }
});

export default blogs;
