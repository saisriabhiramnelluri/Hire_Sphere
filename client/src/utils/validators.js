export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) {
    return 'Phone number is required';
  }
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid 10-digit phone number';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validateCGPA = (cgpa) => {
  if (!cgpa && cgpa !== 0) {
    return 'CGPA is required';
  }
  const cgpaNum = parseFloat(cgpa);
  if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
    return 'CGPA must be between 0 and 10';
  }
  return null;
};

export const validatePercentage = (percentage, fieldName = 'Percentage') => {
  if (!percentage && percentage !== 0) {
    return `${fieldName} is required`;
  }
  const percentNum = parseFloat(percentage);
  if (isNaN(percentNum) || percentNum < 0 || percentNum > 100) {
    return `${fieldName} must be between 0 and 100`;
  }
  return null;
};

export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return `${fieldName} is required`;
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `Please enter a valid ${fieldName.toLowerCase()}`;
  }
  return null;
};

export const validateFutureDate = (date, fieldName = 'Date') => {
  const dateError = validateDate(date, fieldName);
  if (dateError) return dateError;

  const dateObj = new Date(date);
  const now = new Date();
  if (dateObj <= now) {
    return `${fieldName} must be in the future`;
  }
  return null;
};

export const validateFileSize = (file, maxSizeMB = 5) => {
  if (!file) {
    return 'Please select a file';
  }
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must not exceed ${maxSizeMB}MB`;
  }
  return null;
};

export const validateFileType = (file, allowedTypes = []) => {
  if (!file) {
    return 'Please select a file';
  }
  if (allowedTypes.length === 0) {
    return null;
  }
  const fileType = file.type;
  if (!allowedTypes.includes(fileType)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  return null;
};

export const validateArray = (array, fieldName = 'This field', minLength = 1) => {
  if (!array || !Array.isArray(array)) {
    return `${fieldName} is required`;
  }
  if (array.length < minLength) {
    return `Please select at least ${minLength} ${fieldName.toLowerCase()}`;
  }
  return null;
};

export const validateURL = (url, fieldName = 'URL') => {
  if (!url) {
    return null;
  }
  try {
    new URL(url);
    return null;
  } catch (error) {
    return `Please enter a valid ${fieldName}`;
  }
};
