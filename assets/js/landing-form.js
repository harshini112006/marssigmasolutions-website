/* Enquiry form for the unlisted service landing pages.
   Submissions go through Web3Forms (https://web3forms.com), which emails them to the
   address the access key was created for (marssigmasolutions@gmail.com).

   The access key below is public by design and safe to keep in the page. */
var WEB3FORMS_ACCESS_KEY = '15f6afff-0bce-47e8-b941-2d11d57c1b72';

(function () {
  var form = document.getElementById('enquiry');
  if (!form) return;
  var status = form.querySelector('.lp-form__status');
  var btn = form.querySelector('button[type=submit]');
  var msgs = { name: 'Please enter your name.', phone: 'Please enter a valid phone number.', email: 'Please enter a valid company email.', company: 'Please enter your company name.', city: 'Please enter your city.' };
  var FAIL = 'Sorry, your enquiry could not be sent just now. Please try again in a moment, or call us on +91 94440 84652.';

  function check(input) {
    var err = input.parentNode.querySelector('.lp-field__err');
    var v = input.value.trim();
    var ok = v !== '' && input.checkValidity() && (input.name !== 'phone' || /^[0-9+()\-\s]{7,20}$/.test(v));
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (err) err.textContent = ok ? '' : msgs[input.name] || 'Please fill in this field.';
    return ok;
  }
  var inputs = form.querySelectorAll('.lp-field input');
  inputs.forEach(function (i) { i.addEventListener('blur', function () { if (i.value) check(i); }); });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var valid = true, first = null;
    inputs.forEach(function (i) { if (!check(i)) { valid = false; first = first || i; } });
    if (!valid) { first.focus(); status.textContent = ''; return; }

    var f = {};
    new FormData(form).forEach(function (v, k) { f[k] = String(v).trim(); });
    if (f.website) { location.href = form.getAttribute('data-thanks') || location.href; return; } // spam bot

    if (!/^[0-9a-f-]{30,}$/i.test(WEB3FORMS_ACCESS_KEY)) {
      console.warn('[enquiry] Web3Forms access key is not set in assets/js/landing-form.js');
      status.className = 'lp-form__status is-warn'; status.textContent = FAIL; return;
    }
    var data = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: 'Enquiry: ' + f.service + ' - ' + f.company,
      from_name: 'Mars Sigma Website',
      replyto: f.email,
      'Service': f.service, 'Name': f.name, 'Phone number': f.phone, 'Company email': f.email,
      'Company name': f.company, 'City': f.city, 'Page': location.pathname
    };
    btn.disabled = true; form.classList.add('is-sending');
    status.className = 'lp-form__status'; status.textContent = 'Sending your enquiry...';
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.success === true) {
          status.className = 'lp-form__status is-ok';
          status.textContent = 'Thank you. Your enquiry has been sent.';
          var next = form.getAttribute('data-thanks');
          if (next) { location.href = next + (next.indexOf('?') < 0 ? '?' : '&') + 'name=' + encodeURIComponent(f.name.split(' ')[0].slice(0, 40)); return; }
          form.reset(); form.classList.add('is-sent');
        } else { throw new Error((res.j && res.j.message) || ('HTTP ' + res.status)); }
      })
      .catch(function (err) {
        console.warn('[enquiry] not sent:', err && err.message);
        status.className = 'lp-form__status is-warn'; status.textContent = FAIL;
      })
      .then(function () { btn.disabled = false; form.classList.remove('is-sending'); });
  });
})();
