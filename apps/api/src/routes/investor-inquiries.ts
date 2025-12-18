/**
 * Investor Inquiries routes
 * Public endpoint for landing page contact form
 * Admin endpoint for viewing inquiries (restricted to lballanti.lb@gmail.com)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { investorInquiries } from '../db/schema.js';
import { sendInvestorInquiryNotification } from '../services/email.js';
import { authMiddleware } from '../middleware/auth.js';
import { errors } from '../middleware/error-handler.js';
import { logger } from '../utils/logger.js';

export const investorInquiriesRoutes = Router();

// Admin email whitelist
const ADMIN_EMAILS = ['lballanti.lb@gmail.com'];

// Validation schema for inquiry submission
const inquirySchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(6).max(50),
  company: z.string().max(255).optional(),
  country: z.string().min(2).max(10),
  investorType: z.enum([
    'institutional',
    'professional',
    'experienced',
    'high_net_worth',
    'family_office',
    'other',
  ]),
  investmentRange: z.enum(['100k-250k', '250k-500k', '500k-1m', '1m+']).optional(),
  message: z.string().max(5000).optional(),
  isQualified: z.boolean(),
  understandsRisks: z.boolean(),
  understandsStructure: z.boolean(),
  acceptsPrivacy: z.boolean(),
  acceptsContact: z.boolean().optional().default(false),
});

// Validation for status update
const updateStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'rejected', 'converted']),
  notes: z.string().max(5000).optional(),
});

/**
 * POST /api/investor-inquiries
 * Public endpoint - submit a new investor inquiry
 */
investorInquiriesRoutes.post('/', async (req, res, next) => {
  try {
    const data = inquirySchema.parse(req.body);

    // Validate required declarations
    if (!data.isQualified || !data.understandsRisks || !data.understandsStructure || !data.acceptsPrivacy) {
      throw errors.badRequest('Todas las declaraciones obligatorias deben ser aceptadas');
    }

    const id = uuid();
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString().split(',')[0] || null;
    const userAgent = req.headers['user-agent'] || null;

    // Insert into database
    await db.insert(investorInquiries).values({
      id,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company || null,
      country: data.country,
      investor_type: data.investorType,
      investment_range: data.investmentRange || null,
      message: data.message || null,
      is_qualified: data.isQualified,
      understands_risks: data.understandsRisks,
      understands_structure: data.understandsStructure,
      accepts_privacy: data.acceptsPrivacy,
      accepts_contact: data.acceptsContact || false,
      status: 'new',
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    logger.info('New investor inquiry submitted', {
      id,
      email: data.email,
      investorType: data.investorType,
    });

    // Send email notification (async, don't wait)
    sendInvestorInquiryNotification(data).catch((err) => {
      logger.error('Failed to send investor inquiry notification', { error: err.message, id });
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud enviada correctamente. Nos pondremos en contacto contigo pronto.',
      id,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/investor-inquiries
 * Admin endpoint - list all investor inquiries
 * Restricted to lballanti.lb@gmail.com
 */
investorInquiriesRoutes.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authorized
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para ver esta información');
    }

    const inquiries = await db
      .select()
      .from(investorInquiries)
      .orderBy(desc(investorInquiries.created_at));

    res.json({
      total: inquiries.length,
      inquiries: inquiries.map((i) => ({
        id: i.id,
        firstName: i.first_name,
        lastName: i.last_name,
        email: i.email,
        phone: i.phone,
        company: i.company,
        country: i.country,
        investorType: i.investor_type,
        investmentRange: i.investment_range,
        message: i.message,
        isQualified: i.is_qualified,
        understandsRisks: i.understands_risks,
        understandsStructure: i.understands_structure,
        acceptsPrivacy: i.accepts_privacy,
        acceptsContact: i.accepts_contact,
        status: i.status,
        notes: i.notes,
        ipAddress: i.ip_address,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/investor-inquiries/:id
 * Admin endpoint - get single investor inquiry
 */
investorInquiriesRoutes.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para ver esta información');
    }

    const [inquiry] = await db
      .select()
      .from(investorInquiries)
      .where(eq(investorInquiries.id, req.params.id))
      .limit(1);

    if (!inquiry) {
      throw errors.notFound('Consulta no encontrada');
    }

    res.json({
      id: inquiry.id,
      firstName: inquiry.first_name,
      lastName: inquiry.last_name,
      email: inquiry.email,
      phone: inquiry.phone,
      company: inquiry.company,
      country: inquiry.country,
      investorType: inquiry.investor_type,
      investmentRange: inquiry.investment_range,
      message: inquiry.message,
      isQualified: inquiry.is_qualified,
      understandsRisks: inquiry.understands_risks,
      understandsStructure: inquiry.understands_structure,
      acceptsPrivacy: inquiry.accepts_privacy,
      acceptsContact: inquiry.accepts_contact,
      status: inquiry.status,
      notes: inquiry.notes,
      ipAddress: inquiry.ip_address,
      userAgent: inquiry.user_agent,
      createdAt: inquiry.created_at,
      updatedAt: inquiry.updated_at,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/investor-inquiries/:id
 * Admin endpoint - update inquiry status/notes
 */
investorInquiriesRoutes.patch('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para modificar esta información');
    }

    const data = updateStatusSchema.parse(req.body);

    const [existing] = await db
      .select()
      .from(investorInquiries)
      .where(eq(investorInquiries.id, req.params.id))
      .limit(1);

    if (!existing) {
      throw errors.notFound('Consulta no encontrada');
    }

    await db
      .update(investorInquiries)
      .set({
        status: data.status,
        notes: data.notes !== undefined ? data.notes : existing.notes,
      })
      .where(eq(investorInquiries.id, req.params.id));

    logger.info('Investor inquiry updated', {
      id: req.params.id,
      status: data.status,
      updatedBy: req.user.email,
    });

    res.json({
      success: true,
      message: 'Consulta actualizada correctamente',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/investor-inquiries/:id
 * Admin endpoint - delete an inquiry
 */
investorInquiriesRoutes.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
      throw errors.forbidden('No tienes permisos para eliminar esta información');
    }

    const [existing] = await db
      .select()
      .from(investorInquiries)
      .where(eq(investorInquiries.id, req.params.id))
      .limit(1);

    if (!existing) {
      throw errors.notFound('Consulta no encontrada');
    }

    await db.delete(investorInquiries).where(eq(investorInquiries.id, req.params.id));

    logger.info('Investor inquiry deleted', {
      id: req.params.id,
      deletedBy: req.user.email,
    });

    res.json({
      success: true,
      message: 'Consulta eliminada correctamente',
    });
  } catch (error) {
    next(error);
  }
});
