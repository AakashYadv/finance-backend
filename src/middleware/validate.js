function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateDate(d) {
  return !isNaN(new Date(d).getTime());
}

function validateUser(data, isUpdate = false) {
  const errors = [];
  if (!isUpdate) {
    if (!data.name || data.name.trim().length < 2) errors.push("name must be at least 2 characters");
    if (!data.email || !validateEmail(data.email)) errors.push("valid email is required");
    if (!data.password || data.password.length < 6) errors.push("password must be at least 6 characters");
    if (!["viewer", "analyst", "admin"].includes(data.role)) errors.push("role must be viewer, analyst, or admin");
  } else {
    if (data.name !== undefined && data.name.trim().length < 2) errors.push("name must be at least 2 characters");
    if (data.email !== undefined && !validateEmail(data.email)) errors.push("valid email is required");
    if (data.role !== undefined && !["viewer", "analyst", "admin"].includes(data.role))
      errors.push("role must be viewer, analyst, or admin");
    if (data.status !== undefined && !["active", "inactive"].includes(data.status))
      errors.push("status must be active or inactive");
  }
  return errors;
}

function validateRecord(data, isUpdate = false) {
  const errors = [];
  if (!isUpdate) {
    if (data.amount === undefined || isNaN(Number(data.amount)) || Number(data.amount) <= 0)
      errors.push("amount must be a positive number");
    if (!["income", "expense"].includes(data.type)) errors.push("type must be income or expense");
    if (!data.category || !data.category.trim()) errors.push("category is required");
    if (!data.date || !validateDate(data.date)) errors.push("valid date is required (YYYY-MM-DD)");
  } else {
    if (data.amount !== undefined && (isNaN(Number(data.amount)) || Number(data.amount) <= 0))
      errors.push("amount must be a positive number");
    if (data.type !== undefined && !["income", "expense"].includes(data.type))
      errors.push("type must be income or expense");
    if (data.date !== undefined && !validateDate(data.date)) errors.push("valid date is required");
  }
  return errors;
}

function handleValidation(errors, res) {
  if (errors.length > 0) {
    res.status(400).json({ error: "Validation failed", details: errors });
    return true;
  }
  return false;
}

module.exports = { validateUser, validateRecord, handleValidation };
