import { MedusaRequest, MedusaResponse } from '@medusajs/medusa';
import { unlinkSync } from 'fs';
import { ensureDir, readdirSync } from 'fs-extra';
import { join } from 'path';

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<MedusaResponse> {
  const uploadPath = join(__dirname, '..', '..', '..', '..', 'uploads/banners/');
  try {
    await ensureDir(uploadPath);
    const files = readdirSync(uploadPath);
    if (files.length !== 0) {
      return res.status(200).json({ fileList: files });
    } else {
      return res.status(500).json({ fileList: null });
    }
  } catch (error) {
    console.error('ERROR en get upload path en banner list', error);
    return res.status(500).json({ fileList: null });
  }
}
export async function DELETE(req: MedusaRequest, res: MedusaResponse): Promise<MedusaResponse> {
  console.log('en delete method para images');
  const uploadPath = join(__dirname, '..', '..', '..', '..', 'uploads/banners/');
  try {
    await ensureDir(uploadPath);
    const files = readdirSync(uploadPath);
    const del = unlinkSync(`${uploadPath}/${req.query.image}`);

    console.log(`Files in dir ${uploadPath}: ${files}||| query: ${req.query.image}`);
    const f = files.find((item) => {
      item === req.query.image;
    });
    if (f === undefined) {
      console.log('Archivo elimiando con exito');
      return res.status(200).json({ fileList: files });
    } else {
      console.log('Problema al Eliminar el archivo', req.query.image);
      return res.status(500).json({ fileList: files });
    }
  } catch (error) {
    console.error('ERROR en get upload path en banner list', error);
    return res.status(500).json({ fileList: null });
  }
}

export const AUTHENTICATE = false;
