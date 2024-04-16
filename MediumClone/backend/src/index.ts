import { Hono } from 'hono';
import v1 from './routes/v1';

const app = new Hono();

app.get('/health', (c) => {
  return c.json({
    health: 'OK',
  });
});

app.route('/api/v1', v1);

export default app;
