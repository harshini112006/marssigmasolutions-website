// Vercel serverless function: emails landing-page enquiries to the company Gmail inbox.
// The mail is sent through that Gmail account's own SMTP, so no third-party form service
// or activation email is involved.
//
// Set these in Vercel (Project > Settings > Environment Variables), then redeploy:
//   GMAIL_USER          the Gmail address that sends and receives, e.g. marssigmasolutions@gmail.com
//   GMAIL_APP_PASSWORD  a 16-character Google App Password for that account (not the normal password)
//   ENQUIRY_TO          optional: where enquiries go (defaults to GMAIL_USER; comma-separate several)
// Without GMAIL_USER / GMAIL_APP_PASSWORD it answers 503 and the page shows its error message.

const nodemailer = require('nodemailer');

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
const oneLine = (s) => String(s).replace(/[\r\n]+/g, ' ');

function validate(body) {
  const data = {};
  const errors = {};
  for (const [key, f] of Object.entries(FIELDS)) {
    const v = typeof body[key] === 'string' ? body[key].trim() : '';
    if (!v) errors[key] = `${f.label} is required.`;
    else if (v.length > f.max) errors[key] = `${f.label} is too long.`;
    data[key] = oneLine(v);
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = 'Company email is not valid.';
  if (data.phone && !/^[0-9+()\-\s]{7,20}$/.test(data.phone)) errors.phone = 'Phone number is not valid.';
  const service = typeof body.service === 'string' ? body.service.trim() : '';
  data.service = SERVICES.includes(service) ? service : 'General enquiry';
  data.page = typeof body.page === 'string' ? oneLine(body.page).slice(0, 120) : '';
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

  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!user || !pass) {
    console.error('Enquiry not sent: GMAIL_USER / GMAIL_APP_PASSWORD are not set.');
    return res.status(503).json({ error: 'Email sending is not configured.' });
  }
  const to = (process.env.ENQUIRY_TO || user).split(',').map((s) => s.trim()).filter(Boolean);

  const rows = Object.entries(FIELDS)
    .map(([k, f]) => `<tr><td style="padding:6px 16px 6px 0;color:#5B6B84">${f.label}</td><td style="padding:6px 0;color:#0B1F3A"><b>${esc(data[k])}</b></td></tr>`)
    .join('');
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px">
<h2 style="color:#7D1B2C;margin:0 0 6px">New enquiry: ${esc(data.service)}</h2>
<p style="color:#3B4A62;margin:0 0 14px">Sent from the ${esc(data.service)} landing page${data.page ? ` (${esc(data.page)})` : ''}.</p>
<table>${rows}</table>
<p style="color:#5B6B84;margin:16px 0 0;font-size:13px">Reply to this email to answer ${esc(data.name)} directly.</p></div>`;
  const text = `New enquiry: ${data.service}\n\n` + Object.entries(FIELDS).map(([k, f]) => `${f.label}: ${data[k]}`).join('\n');

  try {
    const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    await transport.sendMail({
      from: { name: 'Mars Sigma Website', address: user },
      to,
      replyTo: { name: data.name, address: data.email },
      subject: `Enquiry: ${data.service} - ${data.company}`,
      html,
      text,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Gmail send failed:', err && (err.response || err.message));
    return res.status(502).json({ error: 'Could not send the enquiry.' });
  }
};
