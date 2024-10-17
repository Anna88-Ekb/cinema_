import fs from 'fs';
import path from 'path'; 
import {__dirname} from './__dirname.js';
export const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));