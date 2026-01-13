export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

export const formatStudentId = (id) => {
  if (!id) return '';
  return id.toUpperCase();
};

export const formatCTC = (ctc) => {
  if (!ctc) return 'Not specified';
  return `₹${ctc} LPA`;
};

export const formatCTCRange = (min, max) => {
  if (!min) return 'Not specified';
  if (!max || min === max) return formatCTC(min);
  return `₹${min} - ₹${max} LPA`;
};

export const formatName = (firstName, lastName) => {
  if (!firstName && !lastName) return 'Unknown';
  return `${firstName || ''} ${lastName || ''}`.trim();
};

export const formatAddress = (address) => {
  if (!address) return '';
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.pincode) parts.push(address.pincode);
  if (address.country) parts.push(address.country);
  return parts.join(', ');
};

export const formatList = (items, maxDisplay = 3) => {
  if (!items || items.length === 0) return 'None';
  if (items.length <= maxDisplay) return items.join(', ');
  const displayed = items.slice(0, maxDisplay).join(', ');
  const remaining = items.length - maxDisplay;
  return `${displayed} +${remaining} more`;
};

export const formatCompactNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalizeFirst(word))
    .join(' ');
};
