const bdMobileRegex = /^01[3-9]\d{8}$/;

export const normalizeBangladeshPhone = (value: string): string => {
  let phone = value.trim().replace(/[\s-]/g, "");

  if (!phone) return "";

  if (phone.startsWith("+880")) {
    phone = `0${phone.slice(4)}`;
  } else if (phone.startsWith("880")) {
    phone = `0${phone.slice(3)}`;
  }

  return phone;
};

export const isValidBangladeshPhone = (value: string): boolean => {
  const phone = normalizeBangladeshPhone(value);

  if (!phone) return true;

  return bdMobileRegex.test(phone);
};

export const bangladeshPhoneFormatMessage =
  "Phone number must be a valid Bangladesh mobile number. Example: 01712345678 or +8801712345678.";