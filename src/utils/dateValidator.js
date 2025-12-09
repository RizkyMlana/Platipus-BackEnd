export const validateEventTimes = (startTime, endTime) => {
  if (!startTime || !endTime) return { valid: false, message: 'Start & End time required' };

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start) || isNaN(end)) return { valid: false, message: 'Invalid date format' };
  if (end < start) return { valid: false, message: 'End time must be after start time' };
  if (start < new Date()) return { valid: false, message: 'Start time cannot be in the past' };

  return { valid: true };
};