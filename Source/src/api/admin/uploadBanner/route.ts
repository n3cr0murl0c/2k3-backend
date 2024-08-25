import { MedusaRequest, MedusaResponse } from '@medusajs/medusa';
import { randomUUID } from 'crypto';
import { readFile, readFileSync, writeFile, createWriteStream } from 'fs';
import { ensureDir } from 'fs-extra';
import { join } from 'path';

export async function POST(req, res, next): Promise<MedusaResponse> {
  const uploadPath = join(__dirname, '..', '..', '..', '..', 'uploads/banners/'); // Register the upload path
  ensureDir(uploadPath); // Make sure that he upload path exits
  try {
    req.pipe(req.busboy); // Pipe it trough busboy
    req.busboy.on('file', (fieldname, file, filename) => {
      //filename returns {filename, encoding, mimeType}
      console.log('====================================');
      console.log(`Upload of '${filename.filename}' started`);
      console.log('====================================');

      // Create a write stream of the new file
      const fstream = createWriteStream(join(uploadPath, filename.filename));
      // Pipe it trough
      file.pipe(fstream);

      // On finish of the upload
      fstream.on('close', () => {
        console.log('====================================');
        console.log(`Upload of ${uploadPath}/${filename.filename} finished`);
        console.log('====================================');
        // res.redirect("back");
      });
      return res.status(200).json({
        msg: `Upload of ${uploadPath}/'${filename.filename}' finished`,
      });
    });
  } catch (error) {
    console.error('Upload failed', error);
    return res.status(500).json({ msg: `Upload failed`, error: error });
  }
}
