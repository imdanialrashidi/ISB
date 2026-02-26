export type ProjectStatus = "in_progress" | "completed";
export type WhatsAppStatus = "active" | "placeholder";

export interface PhoneItem {
  label: string;
  number: string;
  tel: string;
}

export interface AddressItem {
  city: string;
  fullAddress: string;
  mapUrl: string;
}

export interface ContactWhatsApp {
  status: WhatsAppStatus;
  number: string;
  fallbackMessage: string;
}

export interface ContactsContent {
  phones: PhoneItem[];
  fax: string;
  email: string;
  website: string;
  addresses: AddressItem[];
  workingHours: string;
  whatsapp: ContactWhatsApp;
}

export interface CompanyHistoryItem {
  year: string;
  description: string;
}

export interface HseApproach {
  environment: string[];
  employeeSafety: string[];
}

export interface CompanyContent {
  name: string;
  shortName: string;
  tagline: string;
  introduction: string;
  about: string;
  policy: string;
  mission: string[];
  objectives: string[];
  responsibilities: string[];
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
    technicalManager: string;
    chairperson: string;
    boardMembers: string[];
    units: string[];
    regionalExperts: string[];
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
}

export interface ProjectItem {
  id: string;
  title: string;
  client: string;
  location: string | null;
  startDateFa: string;
  endDateFa: string | null;
  status: ProjectStatus;
  summary: string;
  tags: string[];
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

export interface CertificatesContent {
  qualificationNote: string;
  qualificationCertificates: QualificationCertificate[];
  managementCertificates: ManagementCertificate[];
  ceoCertificates: ManagementCertificate[];
  licenses: LicenseItem[];
}
