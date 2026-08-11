import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// To test the API, I would need a valid auth token.
// The problem must be in the logic I just read.
