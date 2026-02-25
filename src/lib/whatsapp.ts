export interface WhatsAppFormPayload {
  fullName: string;
  companyName: string;
  phone: string;
  subject: string;
  message: string;
}

export const buildWhatsAppMessage = (payload: WhatsAppFormPayload): string => {
  return [
    "سلام وقت بخیر،",
    "",
    `نام: ${payload.fullName || "-"}`,
    `نام شرکت: ${payload.companyName || "-"}`,
    `شماره تماس: ${payload.phone || "-"}`,
    `موضوع: ${payload.subject || "-"}`,
    "متن پیام:",
    payload.message || "-",
  ].join("\n");
};

export const buildWhatsAppUrl = (number: string, payload: WhatsAppFormPayload): string => {
  const normalized = number.replace(/[^\d]/g, "");
  const text = encodeURIComponent(buildWhatsAppMessage(payload));
  return `https://wa.me/${normalized}?text=${text}`;
};
