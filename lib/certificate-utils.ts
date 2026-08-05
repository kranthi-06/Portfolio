import type { CertificateAsset } from "@/lib/generated-certificates";

export const categoryOrder = [
  "Internships",
  "Certifications",
  "Courses",
  "Workshops",
  "Webinars",
  "Hackathons",
  "Training Programs",
  "Achievements",
  "Badges",
  "Others",
] as const;

export function getCertificateCategories(certificates: CertificateAsset[]) {
  return categoryOrder.filter((category) => certificates.some((certificate) => certificate.category === category));
}
