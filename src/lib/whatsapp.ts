export interface WhatsAppFormPayload {
  fullName: string;
  companyName: string;
  phone: string;
  subject: string;
  message: string;
}

/** Digits-only deep link: https://wa.me/<digits> */
export const waMeHref = (number: string): string => {
  const digits = number.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
};

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
  const text = encodeURIComponent(buildWhatsAppMessage(payload));
  return `${waMeHref(number)}?text=${text}`;
};
