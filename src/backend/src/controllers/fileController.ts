import { Request, Response, NextFunction } from 'express';
import { fileService } from '../services/fileService';

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
      return;
    }

    const filepath = await fileService.saveUploadedImage(req.file);

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        filepath,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      message: 'File uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename } = req.params;
    const filepath = fileService.getVideoPath(filename);

    if (!(await fileService.videoExists(filename))) {
      res.status(404).json({
        success: false,
        error: 'File not found',
      });
      return;
    }

    res.sendFile(filepath);
  } catch (error) {
    next(error);
  }
};
