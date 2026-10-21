import type { Request, Response } from 'express';
import { existsSync } from 'node:fs';
import XLSX from 'xlsx';
import path from 'path';
import { AppError } from '../lib/AppError.js';

const ALLOWED_EXT = ['.xlsx', '.xls'];

export const UploadXLSX = (req: Request, res: Response) => {
  const { name } = req.params;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  // 1) strip any path separators.
  const safe = path.basename(name);
  // 2) confine resolution to the uploads directory.
  const root = path.resolve(process.cwd(), 'uploads');
  const full = path.resolve(root, safe);
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new AppError(400, 'Invalid file path');
  }
  // 3) extension allowlist.
  if (!ALLOWED_EXT.includes(path.extname(safe).toLowerCase())) {
    throw new AppError(400, 'Invalid file type');
  }
  // 4) missing file -> 404 (not a 500 that leaks the path).
  if (!existsSync(full)) {
    throw new AppError(404, 'File not found');
  }

  const workbook = XLSX.readFile(full);
  const jsonData: Record<string, unknown> = {};

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    jsonData[sheetName] = XLSX.utils.sheet_to_json(worksheet!);
  });

  // Success body shape (bare { [sheetName]: rows[] }) is unchanged for authorized callers.
  res.json(jsonData);
};
