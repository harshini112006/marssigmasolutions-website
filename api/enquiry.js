// Vercel serverless function: emails landing-page enquiries to the company.
// Needs these environment variables in Vercel (Project → Settings → Environment Variables):
//   RESEND_API_KEY  – API key from https://resend.com (required)
//   ENQUIRY_FROM    – verified sender, e.g. "Mars Sigma Website <website@marssigma.com>"
//                     (defaults to Resend's test sender, which only delivers to the Resend account's own email)
//   ENQUIRY_TO      – where enquiries go (defaults to info@marssigma.com; comma-separate several)
// Without RESEND_API_KEY it answers 503 and the page falls back to the visitor's email app.

const FIELDS = {
  name: { label: 'Name', max: 80 },
  phone: { label: 'Phone number', max: 20 },
  email: { label: 'Company email', max: 120 },
  company: { label: 'Company name', max: 120 },
  city: { label: 'City', max: 80 },
};
const SERVICES = [
  'ISO 9001',
  'IATF 16949',
  'System Sustenance (AMC)',
  'IMS (ISO 9001 + ISO 14001 + ISO 45001)',
];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function validate(body) {
  const data = {};
  const errors = {};
  for (const [key, f] of Object.entries(FIELDS)) {
    const v = typeof body[key] === 'string' ? body[key].trim() : '';
    if (!v) errors[key] = `${f.label} is required.`;
    else if (v.length > f.max) errors[key] = `${f.label} is too long.`;
    data[key] = v;
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = 'Company email is not valid.';
  if (data.phone && !/^[0-9+()\-\s]{7,20}$/.test(data.phone)) errors.phone = 'Phone number is not valid.';
  const service = typeof body.service === 'string' ? body.service.trim() : '';
  data.service = SERVICES.includes(service) ? service : 'General enquiry';
  return { data, errors };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  // Honeypot: bots fill the hidden "website" field. Pretend success, send nothing.
  if (body.website) return res.status(200).json({ ok: true });

  const { data, errors } = validate(body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please check the form.', fields: errors });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ error: 'Email sending is not configured.' });

  const to = (process.env.ENQUIRY_TO || 'info@marssigma.com').split(',').map((s) => s.trim()).filter(Boolean);
  const from = process.env.ENQUIRY_FROM || 'Mars Sigma Website <onboarding@resend.dev>';
  const rows = Object.entries(FIELDS)
    .map(([k, f]) => `<tr><td style="padding:6px 14px 6px 0;color:#5B6B84">${f.label}</td><td style="padding:6px 0;color:#0B1F3A"><b>${esc(data[k])}</b></td></tr>`)
    .join('');
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px">
<h2 style="color:#7D1B2C;margin:0 0 6px">New enquiry: ${esc(data.service)}</h2>
<p style="color:#3B4A62;margin:0 0 14px">Sent from the ${esc(data.service)} landing page.</p>
<table>${rows}</table></div>`;
  const text = `New enquiry: ${data.service}\n\n` + Object.entries(FIELDS).map(([k, f]) => `${f.label}: ${data[k]}`).join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, reply_to: data.email, subject: `Enquiry: ${data.service} – ${data.company}`, html, text }),
    });
    if (!r.ok) {
      console.error('Resend error', r.status, await r.text().catch(() => ''));
      return res.status(502).json({ error: 'Could not send the enquiry.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Enquiry send failed', err);
    return res.status(502).json({ error: 'Could not send the enquiry.' });
  }
};
