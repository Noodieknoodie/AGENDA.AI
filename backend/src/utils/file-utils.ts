// backend/src/utils/file-utils.ts
import fs from 'fs-extra';
import path from 'path';

export function setupTempDirectory(): void {
  const uploadsDir = path.join(process.cwd(), 'temp/uploads');
  const outputDir = path.join(process.cwd(), 'temp/output');

  fs.ensureDirSync(uploadsDir);
  fs.ensureDirSync(outputDir);
}

export function createTempFilePath(prefix: string, extension: string): string {
  const tempDir = path.join(process.cwd(), 'temp');
  fs.ensureDirSync(tempDir);

  return path.join(tempDir, `${prefix}-${Date.now()}.${extension}`);
}