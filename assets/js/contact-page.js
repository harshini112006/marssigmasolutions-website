/**
 * Contact page: buttons elsewhere on the site link here with ?topic=<option value>,
 * which preselects the enquiry. The site has no mail backend, so sending opens
 * the visitor's email app with the message filled in.
 */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const topic = form.elements.topic;
  const wanted = new URLSearchParams(location.search).get('topic');
  if (wanted && [...topic.options].some(o => o.value === wanted)) topic.value = wanted;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const { name, email, company, message } = form.elements;
    const lines = [
      message.value.trim(),
      '',
      `Name: ${name.value.trim()}`,
      `Email: ${email.value.trim()}`,
    ];
    if (company.value.trim()) lines.push(`Company: ${company.value.trim()}`);
    const subject = encodeURIComponent(topic.value);
    const body = encodeURIComponent(lines.join('\r\n'));
    window.location.href = `mailto:info@marssigma.com?subject=${subject}&body=${body}`;
    document.getElementById('ctFormNote').textContent =
      'Your email app should now be open. If it did not open, please write to us at info@marssigma.com.';
  });
})();
