/**
 * Email Service
 * Handles sending emails via SMTP
 */

import nodemailer from 'nodemailer';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: 'nexlify.io',
  port: 465,
  secure: true, // SSL/TLS
  auth: {
    user: 'noreply@nexlify.io',
    pass: 'Ak7o!6tN0G',
  },
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    logger.error('Email transporter error', { error: error.message });
  } else {
    logger.info('Email transporter ready');
  }
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: '"Nexlify" <noreply@nexlify.io>',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    logger.info('Email sent', { messageId: info.messageId, to: options.to });
    return true;
  } catch (error) {
    logger.error('Failed to send email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      to: options.to
    });
    return false;
  }
}

/**
 * Send investor inquiry notification to admin
 */
export async function sendInvestorInquiryNotification(inquiry: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  country: string;
  investorType: string;
  investmentRange?: string;
  message?: string;
  isQualified: boolean;
  understandsRisks: boolean;
  understandsStructure: boolean;
  acceptsPrivacy: boolean;
  acceptsContact: boolean;
}): Promise<boolean> {
  const investorTypeLabels: Record<string, string> = {
    institutional: 'Inversor Institucional',
    professional: 'Inversor Profesional',
    experienced: 'Inversor Experimentado',
    high_net_worth: 'Alto Patrimonio',
    family_office: 'Family Office',
    other: 'Otro',
  };

  const investmentRangeLabels: Record<string, string> = {
    '100k-250k': '100.000€ - 250.000€',
    '250k-500k': '250.000€ - 500.000€',
    '500k-1m': '500.000€ - 1.000.000€',
    '1m+': 'Más de 1.000.000€',
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: 600; color: #374151; display: block; margin-bottom: 4px; }
    .value { color: #111827; }
    .declaration { padding: 10px; background: ${inquiry.isQualified ? '#d1fae5' : '#fee2e2'}; border-radius: 6px; margin-bottom: 10px; }
    .declaration.ok { background: #d1fae5; color: #065f46; }
    .declaration.no { background: #fee2e2; color: #991b1b; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Nueva Consulta de Inversor</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Se ha recibido una nueva solicitud desde la landing de inversores</p>
    </div>
    <div class="content">
      <h2 style="margin-top: 0; color: #111827;">Datos del Contacto</h2>

      <div class="field">
        <span class="label">Nombre completo</span>
        <span class="value">${inquiry.firstName} ${inquiry.lastName}</span>
      </div>

      <div class="field">
        <span class="label">Email</span>
        <span class="value"><a href="mailto:${inquiry.email}">${inquiry.email}</a></span>
      </div>

      <div class="field">
        <span class="label">Teléfono</span>
        <span class="value">${inquiry.phone}</span>
      </div>

      ${inquiry.company ? `
      <div class="field">
        <span class="label">Empresa</span>
        <span class="value">${inquiry.company}</span>
      </div>
      ` : ''}

      <div class="field">
        <span class="label">País</span>
        <span class="value">${inquiry.country}</span>
      </div>

      <hr>

      <h2 style="color: #111827;">Perfil de Inversor</h2>

      <div class="field">
        <span class="label">Tipo de inversor</span>
        <span class="value">${investorTypeLabels[inquiry.investorType] || inquiry.investorType}</span>
      </div>

      ${inquiry.investmentRange ? `
      <div class="field">
        <span class="label">Rango de inversión</span>
        <span class="value">${investmentRangeLabels[inquiry.investmentRange] || inquiry.investmentRange}</span>
      </div>
      ` : ''}

      ${inquiry.message ? `
      <div class="field">
        <span class="label">Mensaje</span>
        <span class="value">${inquiry.message.replace(/\n/g, '<br>')}</span>
      </div>
      ` : ''}

      <hr>

      <h2 style="color: #111827;">Declaraciones</h2>

      <div class="declaration ${inquiry.isQualified ? 'ok' : 'no'}">
        ${inquiry.isQualified ? '✓' : '✗'} Declara ser inversor cualificado
      </div>

      <div class="declaration ${inquiry.understandsRisks ? 'ok' : 'no'}">
        ${inquiry.understandsRisks ? '✓' : '✗'} Comprende los riesgos de la inversión
      </div>

      <div class="declaration ${inquiry.understandsStructure ? 'ok' : 'no'}">
        ${inquiry.understandsStructure ? '✓' : '✗'} Comprende la estructura tokenizada
      </div>

      <div class="declaration ${inquiry.acceptsPrivacy ? 'ok' : 'no'}">
        ${inquiry.acceptsPrivacy ? '✓' : '✗'} Acepta la política de privacidad
      </div>

      <div class="declaration ${inquiry.acceptsContact ? 'ok' : 'no'}">
        ${inquiry.acceptsContact ? '✓' : '✗'} Acepta recibir comunicaciones comerciales
      </div>

      <hr>

      <p style="font-size: 12px; color: #6b7280; margin-bottom: 0;">
        Este email ha sido generado automáticamente por el sistema de Nexlify.
        La información de este formulario ha sido guardada en la base de datos.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Nueva Consulta de Inversor
==========================

Datos del Contacto:
- Nombre: ${inquiry.firstName} ${inquiry.lastName}
- Email: ${inquiry.email}
- Teléfono: ${inquiry.phone}
${inquiry.company ? `- Empresa: ${inquiry.company}` : ''}
- País: ${inquiry.country}

Perfil de Inversor:
- Tipo: ${investorTypeLabels[inquiry.investorType] || inquiry.investorType}
${inquiry.investmentRange ? `- Rango de inversión: ${investmentRangeLabels[inquiry.investmentRange] || inquiry.investmentRange}` : ''}
${inquiry.message ? `- Mensaje: ${inquiry.message}` : ''}

Declaraciones:
- Inversor cualificado: ${inquiry.isQualified ? 'Sí' : 'No'}
- Comprende riesgos: ${inquiry.understandsRisks ? 'Sí' : 'No'}
- Comprende estructura: ${inquiry.understandsStructure ? 'Sí' : 'No'}
- Acepta privacidad: ${inquiry.acceptsPrivacy ? 'Sí' : 'No'}
- Acepta comunicaciones: ${inquiry.acceptsContact ? 'Sí' : 'No'}
  `;

  return sendEmail({
    to: 'lballanti.lb@gmail.com',
    subject: `[Nexlify] Nueva consulta de inversor: ${inquiry.firstName} ${inquiry.lastName}`,
    html,
    text,
    replyTo: inquiry.email,
  });
}
