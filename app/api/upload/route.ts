import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { handleApiError, createSuccessResponse, ValidationError } from '@/lib/api-utils';

/**
 * Allowed file types and their MIME types
 */
const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  // Images
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  gif: ['image/gif'],
  webp: ['image/webp'],
  // Documents (optional, for future use)
  pdf: ['application/pdf'],
};

/**
 * Maximum file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Maximum number of files per upload
 */
const MAX_FILES_PER_UPLOAD = 10;

/**
 * Validate file type based on extension and MIME type
 */
function validateFileType(file: File): { valid: boolean; extension: string } {
  const fileName = file.name.toLowerCase();
  const extension = fileName.split('.').pop() || '';
  const mimeType = file.type.toLowerCase();

  // Check if extension is allowed
  if (!ALLOWED_FILE_TYPES[extension]) {
    return { valid: false, extension };
  }

  // Check if MIME type matches expected types for the extension
  const allowedMimeTypes = ALLOWED_FILE_TYPES[extension];
  if (!allowedMimeTypes.includes(mimeType)) {
    return { valid: false, extension };
  }

  return { valid: true, extension };
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove any path components
  const baseName = filename.split(/[/\\]/).pop() || 'file';
  // Remove any non-alphanumeric characters except dots and hyphens
  return baseName.replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * POST /api/upload
 * Upload images to server (local storage)
 * In production, use cloud storage like AWS S3, Cloudinary, or UploadThing
 *
 * Security features:
 * - File type validation (whitelist approach)
 * - MIME type verification
 * - File size limit
 * - Filename sanitization
 * - Maximum files per upload limit
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    // Validate files exist
    if (!files || files.length === 0) {
      throw new ValidationError('No files provided');
    }

    // Validate file count
    if (files.length > MAX_FILES_PER_UPLOAD) {
      throw new ValidationError(
        `Too many files. Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload`
      );
    }

    const uploadedFiles: { url: string; filename: string; originalName: string }[] = [];
    const errors: { filename: string; error: string }[] = [];

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push({
          filename: file.name,
          error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        });
        continue;
      }

      // Validate file size is not zero
      if (file.size === 0) {
        errors.push({
          filename: file.name,
          error: 'Empty file not allowed',
        });
        continue;
      }

      // Validate file type
      const { valid, extension } = validateFileType(file);
      if (!valid) {
        errors.push({
          filename: file.name,
          error: `File type not allowed. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`,
        });
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Additional validation: check magic bytes for common image types
        if (!validateMagicBytes(buffer, extension)) {
          errors.push({
            filename: file.name,
            error: 'File content does not match its extension',
          });
          continue;
        }

        // Generate unique filename with sanitization
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 10);
        const sanitizedOriginalName = sanitizeFilename(file.name);
        const filename = `${timestamp}-${randomString}-${sanitizedOriginalName}`;
        const filepath = join(uploadDir, filename);

        // Write file to disk
        await writeFile(filepath, buffer);

        uploadedFiles.push({
          url: `/uploads/${filename}`,
          filename,
          originalName: file.name,
        });
      } catch (fileError) {
        errors.push({
          filename: file.name,
          error: 'Failed to process file',
        });
      }
    }

    // If no files were uploaded successfully
    if (uploadedFiles.length === 0 && errors.length > 0) {
      throw new ValidationError('All files failed validation', {
        errors: JSON.stringify(errors),
      });
    }

    return createSuccessResponse({
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return handleApiError(error, 'Upload');
  }
}

/**
 * Validate file content using magic bytes (file signatures)
 */
function validateMagicBytes(buffer: Buffer, extension: string): boolean {
  if (buffer.length < 8) return false;

  const signatures: Record<string, number[][]> = {
    jpg: [[0xff, 0xd8, 0xff]],
    jpeg: [[0xff, 0xd8, 0xff]],
    png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    gif: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
    webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF header, need to also check for WEBP
    pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  };

  const expectedSignatures = signatures[extension];
  if (!expectedSignatures) return true; // Unknown extension, skip validation

  for (const signature of expectedSignatures) {
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      // Additional check for WebP
      if (extension === 'webp') {
        const webpMarker = buffer.slice(8, 12).toString('ascii');
        return webpMarker === 'WEBP';
      }
      return true;
    }
  }

  return false;
}
