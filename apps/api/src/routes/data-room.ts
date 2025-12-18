/**
 * Data Room routes
 * Admin endpoint for managing data room access (restricted to lballanti.lb@gmail.com)
 * Public endpoint for authorized investors to view data room
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { eq, desc, and } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db/index.js';
import { dataRoomAccess, dataRoomDocuments, dataRoomAccessLog } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { errors } from '../middleware/error-handler.js';
import { logger } from '../utils/logger.js';

// Configure multer for file uploads
const DATAROOM_PATH = process.env.DATAROOM_PATH || '/var/www/vhosts/nexlify.io/dataroom';

// Ensure dataroom directory exists
if (!fs.existsSync(DATAROOM_PATH)) {
  fs.mkdirSync(DATAROOM_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || 'other';
    const categoryPath = path.join(DATAROOM_PATH, category);
    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath, { recursive: true });
    }
    cb(null, categoryPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
    }
  },
});

export const dataRoomRoutes = Router();

// Admin email whitelist
const ADMIN_EMAILS = ['lballanti.lb@gmail.com'];

// Validation schemas
const grantAccessSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
  investorInquiryId: z.string().uuid().optional(),
  accessLevel: z.enum(['view', 'download', 'full']).optional().default('view'),
  expiresAt: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
});

const updateAccessSchema = z.object({
  accessLevel: z.enum(['view', 'download', 'full']).optional(),
  status: z.enum(['pending', 'active', 'revoked', 'expired']).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  notes: z.string().max(2000).optional(),
});

const createDocumentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  category: z.enum(['financials', 'legal', 'corporate', 'technical', 'market', 'team', 'other']),
  filePath: z.string().min(1).max(500),
  fileSize: z.number().optional(),
  mimeType: z.string().max(100).optional(),
  version: z.string().max(20).optional().default('1.0'),
  sortOrder: z.number().optional().default(0),
});

const updateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  category: z.enum(['financials', 'legal', 'corporate', 'technical', 'market', 'team', 'other']).optional(),
  version: z.string().max(20).optional(),
  sortOrder: z.number().optional(),
});

// =============================================================================
// ADMIN ENDPOINTS (restricted to lballanti.lb@gmail.com)
// =============================================================================

/**
 * GET /api/data-room/admin/access
 * List all data room access grants
 */
dataRoomRoutes.get('/admin/access', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para ver esta informacion');
    }

    const accessList = await db
      .select()
      .from(dataRoomAccess)
      .orderBy(desc(dataRoomAccess.created_at));

    res.json({
      total: accessList.length,
      access: accessList.map((a) => ({
        id: a.id,
        email: a.email,
        name: a.name,
        company: a.company,
        investorInquiryId: a.investor_inquiry_id,
        accessLevel: a.access_level,
        status: a.status,
        invitedBy: a.invited_by,
        lastAccess: a.last_access,
        expiresAt: a.expires_at,
        notes: a.notes,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/data-room/admin/access
 * Grant data room access to an email
 */
dataRoomRoutes.post('/admin/access', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para gestionar accesos');
    }

    const data = grantAccessSchema.parse(req.body);

    // Check if email already has access
    const [existing] = await db
      .select()
      .from(dataRoomAccess)
      .where(eq(dataRoomAccess.email, data.email.toLowerCase()))
      .limit(1);

    if (existing) {
      throw errors.conflict('Este email ya tiene acceso al Data Room');
    }

    const id = uuid();
    await db.insert(dataRoomAccess).values({
      id,
      email: data.email.toLowerCase(),
      name: data.name || null,
      company: data.company || null,
      investor_inquiry_id: data.investorInquiryId || null,
      access_level: data.accessLevel,
      status: 'active',
      invited_by: req.user.email,
      expires_at: data.expiresAt ? new Date(data.expiresAt) : null,
      notes: data.notes || null,
    });

    logger.info('Data room access granted', {
      id,
      email: data.email,
      grantedBy: req.user.email,
    });

    res.status(201).json({
      success: true,
      message: 'Acceso concedido correctamente',
      id,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/data-room/admin/access/:id
 * Update data room access
 */
dataRoomRoutes.patch('/admin/access/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para modificar accesos');
    }

    const data = updateAccessSchema.parse(req.body);

    const [existing] = await db
      .select()
      .from(dataRoomAccess)
      .where(eq(dataRoomAccess.id, req.params.id))
      .limit(1);

    if (!existing) {
      throw errors.notFound('Acceso no encontrado');
    }

    const updateData: Record<string, unknown> = {};
    if (data.accessLevel) updateData.access_level = data.accessLevel;
    if (data.status) updateData.status = data.status;
    if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.notes !== undefined) updateData.notes = data.notes;

    await db
      .update(dataRoomAccess)
      .set(updateData)
      .where(eq(dataRoomAccess.id, req.params.id));

    logger.info('Data room access updated', {
      id: req.params.id,
      changes: data,
      updatedBy: req.user.email,
    });

    res.json({
      success: true,
      message: 'Acceso actualizado correctamente',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/data-room/admin/access/:id
 * Revoke data room access
 */
dataRoomRoutes.delete('/admin/access/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para eliminar accesos');
    }

    const [existing] = await db
      .select()
      .from(dataRoomAccess)
      .where(eq(dataRoomAccess.id, req.params.id))
      .limit(1);

    if (!existing) {
      throw errors.notFound('Acceso no encontrado');
    }

    await db.delete(dataRoomAccess).where(eq(dataRoomAccess.id, req.params.id));

    logger.info('Data room access revoked', {
      id: req.params.id,
      email: existing.email,
      revokedBy: req.user.email,
    });

    res.json({
      success: true,
      message: 'Acceso revocado correctamente',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/data-room/admin/documents
 * List all documents (admin view)
 */
dataRoomRoutes.get('/admin/documents', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para ver los documentos');
    }

    const documents = await db
      .select()
      .from(dataRoomDocuments)
      .orderBy(dataRoomDocuments.category, dataRoomDocuments.sort_order);

    res.json({
      total: documents.length,
      documents: documents.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        filePath: d.file_path,
        fileSize: d.file_size,
        mimeType: d.mime_type,
        version: d.version,
        isPublic: d.is_public,
        sortOrder: d.sort_order,
        uploadedBy: d.uploaded_by,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/data-room/admin/documents
 * Upload and create a new document
 */
dataRoomRoutes.post(
  '/admin/documents',
  authMiddleware,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
        throw errors.forbidden('No tienes permisos para crear documentos');
      }

      if (!req.file) {
        throw errors.badRequest('No se ha proporcionado ningún archivo');
      }

      const { name, description, category, version } = req.body;

      if (!name || !category) {
        throw errors.badRequest('Nombre y categoría son requeridos');
      }

      // File path relative to dataroom directory
      const filePath = `${category}/${req.file.filename}`;

      const id = uuid();
      await db.insert(dataRoomDocuments).values({
        id,
        name,
        description: description || null,
        category,
        file_path: filePath,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        version: version || '1.0',
        sort_order: 0,
        uploaded_by: req.user.email,
      });

      logger.info('Data room document uploaded', {
        id,
        name,
        category,
        filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        createdBy: req.user.email,
      });

      res.status(201).json({
        success: true,
        message: 'Documento subido correctamente',
        document: {
          id,
          name,
          description,
          category,
          filePath,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          version: version || '1.0',
          sortOrder: 0,
          uploadedBy: req.user.email,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/data-room/admin/documents/:id
 * Update a document
 */
dataRoomRoutes.patch('/admin/documents/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para modificar documentos');
    }

    const data = updateDocumentSchema.parse(req.body);

    const [existing] = await db
      .select()
      .from(dataRoomDocuments)
      .where(eq(dataRoomDocuments.id, req.params.id))
      .limit(1);

    if (!existing) {
      throw errors.notFound('Documento no encontrado');
    }

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category) updateData.category = data.category;
    if (data.version) updateData.version = data.version;
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

    await db
      .update(dataRoomDocuments)
      .set(updateData)
      .where(eq(dataRoomDocuments.id, req.params.id));

    logger.info('Data room document updated', {
      id: req.params.id,
      changes: data,
      updatedBy: req.user.email,
    });

    res.json({
      success: true,
      message: 'Documento actualizado correctamente',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/data-room/admin/documents/:id
 * Delete a document
 */
dataRoomRoutes.delete('/admin/documents/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para eliminar documentos');
    }

    const [existing] = await db
      .select()
      .from(dataRoomDocuments)
      .where(eq(dataRoomDocuments.id, req.params.id))
      .limit(1);

    if (!existing) {
      throw errors.notFound('Documento no encontrado');
    }

    // Delete related access logs first
    await db.delete(dataRoomAccessLog).where(eq(dataRoomAccessLog.document_id, req.params.id));

    // Delete the document
    await db.delete(dataRoomDocuments).where(eq(dataRoomDocuments.id, req.params.id));

    logger.info('Data room document deleted', {
      id: req.params.id,
      name: existing.name,
      deletedBy: req.user.email,
    });

    res.json({
      success: true,
      message: 'Documento eliminado correctamente',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/data-room/admin/logs
 * View access logs
 */
dataRoomRoutes.get('/admin/logs', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para ver los logs');
    }

    const logs = await db
      .select()
      .from(dataRoomAccessLog)
      .orderBy(desc(dataRoomAccessLog.created_at))
      .limit(500);

    res.json({
      total: logs.length,
      logs: logs.map((l) => ({
        id: l.id,
        accessId: l.access_id,
        documentId: l.document_id,
        action: l.action,
        ipAddress: l.ip_address,
        createdAt: l.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// PUBLIC/INVESTOR ENDPOINTS
// =============================================================================

/**
 * GET /api/data-room/check-access
 * Check if current user has data room access
 */
dataRoomRoutes.get('/check-access', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw errors.unauthorized();
    }

    // Admin always has access
    if (ADMIN_EMAILS.includes(req.user.email)) {
      return res.json({
        hasAccess: true,
        isAdmin: true,
        accessLevel: 'full',
      });
    }

    const [access] = await db
      .select()
      .from(dataRoomAccess)
      .where(
        and(
          eq(dataRoomAccess.email, req.user.email.toLowerCase()),
          eq(dataRoomAccess.status, 'active')
        )
      )
      .limit(1);

    if (!access) {
      return res.json({
        hasAccess: false,
        isAdmin: false,
      });
    }

    // Check if expired
    if (access.expires_at && new Date(access.expires_at) < new Date()) {
      await db
        .update(dataRoomAccess)
        .set({ status: 'expired' })
        .where(eq(dataRoomAccess.id, access.id));

      return res.json({
        hasAccess: false,
        isAdmin: false,
        reason: 'expired',
      });
    }

    // Update last access
    await db
      .update(dataRoomAccess)
      .set({ last_access: new Date() })
      .where(eq(dataRoomAccess.id, access.id));

    res.json({
      hasAccess: true,
      isAdmin: false,
      accessLevel: access.access_level,
      expiresAt: access.expires_at,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/data-room/documents
 * Get list of data room documents for authorized users
 */
dataRoomRoutes.get('/documents', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw errors.unauthorized();
    }

    // Check access
    const isAdmin = ADMIN_EMAILS.includes(req.user.email);
    let accessLevel = 'full';

    if (!isAdmin) {
      const [access] = await db
        .select()
        .from(dataRoomAccess)
        .where(
          and(
            eq(dataRoomAccess.email, req.user.email.toLowerCase()),
            eq(dataRoomAccess.status, 'active')
          )
        )
        .limit(1);

      if (!access) {
        throw errors.forbidden('No tienes acceso al Data Room');
      }

      // Check expiration
      if (access.expires_at && new Date(access.expires_at) < new Date()) {
        throw errors.forbidden('Tu acceso al Data Room ha expirado');
      }

      accessLevel = access.access_level;

      // Log view action
      await db.insert(dataRoomAccessLog).values({
        id: uuid(),
        access_id: access.id,
        action: 'view',
        ip_address: req.ip || null,
        user_agent: req.headers['user-agent'] || null,
      });
    }

    const documents = await db
      .select()
      .from(dataRoomDocuments)
      .orderBy(dataRoomDocuments.category, dataRoomDocuments.sort_order);

    res.json({
      accessLevel,
      documents: documents.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        fileSize: d.file_size,
        mimeType: d.mime_type,
        version: d.version,
        createdAt: d.created_at,
        // Only include download URL if user has download or full access
        canDownload: accessLevel === 'download' || accessLevel === 'full',
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/data-room/documents/:id/view
 * View a document (opens inline in browser)
 */
dataRoomRoutes.get('/documents/:id/view', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw errors.unauthorized();
    }

    const isAdmin = ADMIN_EMAILS.includes(req.user.email);
    let accessId: string | null = null;

    if (!isAdmin) {
      const [access] = await db
        .select()
        .from(dataRoomAccess)
        .where(
          and(
            eq(dataRoomAccess.email, req.user.email.toLowerCase()),
            eq(dataRoomAccess.status, 'active')
          )
        )
        .limit(1);

      if (!access) {
        throw errors.forbidden('No tienes acceso al Data Room');
      }

      accessId = access.id;
    }

    const [document] = await db
      .select()
      .from(dataRoomDocuments)
      .where(eq(dataRoomDocuments.id, req.params.id))
      .limit(1);

    if (!document) {
      throw errors.notFound('Documento no encontrado');
    }

    // Log view action
    if (accessId) {
      await db.insert(dataRoomAccessLog).values({
        id: uuid(),
        access_id: accessId,
        document_id: document.id,
        action: 'view',
        ip_address: req.ip || null,
        user_agent: req.headers['user-agent'] || null,
      });
    }

    // Get the full file path
    const filePath = path.join(DATAROOM_PATH, document.file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw errors.notFound('Archivo no encontrado en el servidor');
    }

    // Set headers for inline viewing
    res.setHeader('Content-Type', document.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.name)}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/data-room/documents/:id/download
 * Download a document (forces download)
 */
dataRoomRoutes.get('/documents/:id/download', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw errors.unauthorized();
    }

    const isAdmin = ADMIN_EMAILS.includes(req.user.email);
    let accessId: string | null = null;

    if (!isAdmin) {
      const [access] = await db
        .select()
        .from(dataRoomAccess)
        .where(
          and(
            eq(dataRoomAccess.email, req.user.email.toLowerCase()),
            eq(dataRoomAccess.status, 'active')
          )
        )
        .limit(1);

      if (!access) {
        throw errors.forbidden('No tienes acceso al Data Room');
      }

      if (access.access_level === 'view') {
        throw errors.forbidden('No tienes permisos de descarga');
      }

      accessId = access.id;
    }

    const [document] = await db
      .select()
      .from(dataRoomDocuments)
      .where(eq(dataRoomDocuments.id, req.params.id))
      .limit(1);

    if (!document) {
      throw errors.notFound('Documento no encontrado');
    }

    // Log download action
    if (accessId) {
      await db.insert(dataRoomAccessLog).values({
        id: uuid(),
        access_id: accessId,
        document_id: document.id,
        action: 'download',
        ip_address: req.ip || null,
        user_agent: req.headers['user-agent'] || null,
      });
    }

    // Get the full file path
    const filePath = path.join(DATAROOM_PATH, document.file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw errors.notFound('Archivo no encontrado en el servidor');
    }

    // Get file extension for proper filename
    const ext = path.extname(document.file_path);
    const downloadName = document.name.endsWith(ext) ? document.name : `${document.name}${ext}`;

    // Set headers for download
    res.setHeader('Content-Type', document.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);

    if (document.file_size) {
      res.setHeader('Content-Length', document.file_size);
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});
