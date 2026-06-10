import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const jsonPath = path.join(root, 'src/config/lockedCopy.json');
export const LOCKED_PITCH_LAB_COPY = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
