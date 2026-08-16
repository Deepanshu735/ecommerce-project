// service/validation kahin se bhi ye throw kar sakte hain, express 5 khud errorHandler tak pahuncha dega
export const httpError = (status, message) =>
  Object.assign(new Error(message), { status });

export const notFound = (req, res) =>
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });

// ponytail: 4 args wala signature zaroori hai, warna express ise normal middleware samjhega
export const errorHandler = (err, req, res, next) => {
  const status = err.status ?? 500;
  if (status === 500) console.error(err); // unexpected hi log karo, 400/404 noise nahi
  res.status(status).json({ error: err.message });
};
