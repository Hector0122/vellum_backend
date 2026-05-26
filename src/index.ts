import 'dotenv/config';
import { env } from './config/env';
import app from './app';

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`[Vellum API] running on http://0.0.0.0:${env.PORT}`);
});
