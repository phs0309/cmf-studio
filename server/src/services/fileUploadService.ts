import multer from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export class FileUploadService {
  private uploadDir: string;

  constructor() {
    // Use /tmp for uploads on Render (ephemeral but writable)
    this.uploadDir = process.env.NODE_ENV === 'production' 
      ? '/tmp/uploads'
      : join(__dirname, '..', '..', 'uploads');
    
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.originalname.split('.').pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for uploaded files
        fieldSize: 20 * 1024 * 1024, // 20MB limit for form fields (base64 images)
        fields: 10, // Max number of non-file fields
        files: 3, // Max number of file fields (originalImages)
      },
      fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'));
        }
      }
    });
  }

  public getFileUrl(filename: string, req: any): string {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/uploads/${filename}`;
  }

  public convertBase64ToFile(base64Data: string, filename: string): string {
    const fs = require('fs');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = join(this.uploadDir, filename);
    
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  public saveBase64Image(base64Data: string, prefix = 'image'): string {
    const fs = require('fs');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${prefix}-${uniqueSuffix}.png`;
    const filePath = join(this.uploadDir, filename);
    
    // Remove data:image/png;base64, prefix if present
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    fs.writeFileSync(filePath, buffer);
    return filename;
  }
}