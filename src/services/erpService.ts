/**
 * TaskFlow Official ERP Service Abstraction
 * 
 * Provides safe launching to the official JECRC University MasterSoft ERP portal.
 * Prepared for future institutional REST API integration with MasterSoft.
 * 
 * Security Notice:
 * - Does NOT store or prompt for user passwords
 * - Does NOT attempt unauthorized reverse-engineering or scraping
 * - Never bypasses institutional security or CAPTCHA
 */

export const JECRC_ERP_PORTAL_URL = 'https://jecrc.mastersofterp.in/';

export interface ERPServiceStatus {
  connected: boolean;
  portalUrl: string;
  statusText: string;
  provider: string;
  futureNotice: string;
}

export interface IERPService {
  openERP: () => void;
  getAssignments: () => Promise<never>;
  getSubmissionStatus: (assignmentId: string) => Promise<never>;
  uploadAssignment: (assignmentId: string, file: File) => Promise<never>;
  getStatus: () => ERPServiceStatus;
}

export const erpService: IERPService = {
  /**
   * Opens the official JECRC University MasterSoft ERP portal in a secure external tab
   */
  openERP: () => {
    if (typeof window !== 'undefined') {
      window.open(JECRC_ERP_PORTAL_URL, '_blank', 'noopener,noreferrer');
    }
  },

  /**
   * Future institutional API stub: Fetches assignments from ERP
   */
  getAssignments: async () => {
    throw new Error('Direct ERP sync is unavailable. Official API access from JECRC/MasterSoft is required.');
  },

  /**
   * Future institutional API stub: Fetches submission verification status
   */
  getSubmissionStatus: async (_assignmentId: string) => {
    throw new Error('Direct submission status sync is unavailable. Official API access from JECRC/MasterSoft is required.');
  },

  /**
   * Future institutional API stub: Direct document upload to ERP
   */
  uploadAssignment: async (_assignmentId: string, _file: File) => {
    throw new Error('Direct ERP upload is unavailable without institutional API authentication.');
  },

  /**
   * Returns current connection & readiness status
   */
  getStatus: (): ERPServiceStatus => ({
    connected: true,
    portalUrl: JECRC_ERP_PORTAL_URL,
    statusText: 'ERP launcher connected',
    provider: 'MasterSoft ERP (JECRC University)',
    futureNotice: 'Direct ERP sync requires official API access from JECRC/MasterSoft.',
  }),
};
