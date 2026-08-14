export type WhatsAppStatus = "active" | "placeholder";
export type MessagingStatus = "active" | "missing_identifier";

export interface PhoneItem {
  label: string;
  number: string;
  tel: string;
}

export interface AddressItem {
  city: string;
  fullAddress: string;
  mapUrl: string;
  /** Optional Google Maps embed URL (src for the office map iframe). */
  embedUrl?: string;
}

export interface ContactWhatsApp {
  status: WhatsAppStatus;
  number: string;
  fallbackMessage: string;
}

export interface MessagingChannel {
  id: string;
  label: string;
  status: MessagingStatus;
  url: string;
  number: string;
  note: string;
}

export interface ContactsContent {
  phones: PhoneItem[];
  fax: string;
  email: string;
  website: string;
  addresses: AddressItem[];
  workingHours: string;
  whatsapp: ContactWhatsApp;
  messaging: MessagingChannel[];
}

export interface CompanyHistoryItem {
  year: string;
  description: string;
}

export interface HseApproach {
  environmentIntro: string;
  environment: string[];
  employeeSafetyIntro: string;
  employeeSafety: string[];
}

export interface CompanyContent {
  name: string;
  shortName: string;
  tagline: string;
  introduction: string;
  about: string;
  policy: string;
  policyItems: string[];
  policySummary: string;
  mission: string[];
  vision: string;
  values: string[];
  hseApproach: HseApproach;
  standards: string[];
  foundedAt: string;
  legalType: string;
  history: CompanyHistoryItem[];
  organizationalStructure: string;
  organizationalChart: {
    ceo: string;
    units: string[];
  };
}

export interface ServiceItem {
  id: string;
  title: string;
  summary: string;
  details: string[];
  category: string;
  highlights: string[];
  notes: string;
  image: string;
  /** When true, the service has a dedicated detail page at /services/<id>/. */
  detailPage?: boolean;
  /** Opening copy for the detail page: scope, methods and audience. */
  detailIntro?: string;
  /** Real project ids (projects.json) that support this service. */
  relatedProjectIds?: string[];
  /** Referenced certificates from certifications.json (ids). */
  qualificationCertificateIds?: number[];
  managementCertificateIds?: number[];
  documentIds?: number[];
  licenseIds?: number[];
}

export interface ProjectItem {
  id: string;
  title: string;
  client: string;
}

export interface QualificationCertificate {
  id: number;
  title: string;
  issuer: string;
  validity: string;
  description: string;
}

export interface ManagementCertificate {
  id: number;
  title: string;
  issuer: string;
  validity: string;
  note: string;
}

export interface LicenseItem {
  id: number;
  title: string;
  issuer: string;
  validity: string;
}

export interface CertificateDocument {
  id: number;
  title: string;
  issuer: string;
  validity: string;
  image: string;
  alt: string;
}

export interface CertificatesContent {
  qualificationNote: string;
  qualificationCertificates: QualificationCertificate[];
  managementCertificates: ManagementCertificate[];
  licenses: LicenseItem[];
  documents: CertificateDocument[];
}
