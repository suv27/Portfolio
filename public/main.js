(function () {
  var form = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  var tabs = document.querySelectorAll('.tab');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var isGithubPages = /github\.io/i.test(window.location.hostname || '');

      var nameInput = form.querySelector('#name');
      var emailInput = form.querySelector('#email');
      var companyInput = form.querySelector('#company');
      var messageInput = form.querySelector('#message');
      var honeypot = form.querySelector('[name="website"]');

      var payload = {
        name: nameInput ? nameInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        company: companyInput ? companyInput.value.trim() : '',
        message: messageInput ? messageInput.value.trim() : '',
        website: honeypot ? honeypot.value.trim() : ''
      };

      if (formStatus) {
        formStatus.textContent = 'Validating secure transmission...';
      }

      var fallbackToMailto = function () {
        var recipient = 'urenav33@gmail.com';
        var subject = encodeURIComponent('Portfolio inquiry from ' + (nameInput ? nameInput.value.trim() || 'Website Visitor' : 'Website Visitor'));
        var company = companyInput ? companyInput.value.trim() : '';
        var body = [
          'Name: ' + (nameInput ? nameInput.value.trim() : ''),
          'Email: ' + (emailInput ? emailInput.value.trim() : ''),
          company ? 'Company: ' + company : '',
          '',
          'Message:',
          messageInput ? messageInput.value.trim() : ''
        ].filter(Boolean).join('\n');

        window.location.href = 'mailto:' + recipient + '?subject=' + subject + '&body=' + encodeURIComponent(body);
        if (formStatus) {
          formStatus.textContent = 'Opening your mail app to send the message.';
        }
      };

      var sendRequest = function (requestBody) {
        if (isGithubPages) {
          form.reset();
          fallbackToMailto();
          return;
        }

        if (typeof window.fetch === 'function') {
          fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          })
            .then(function (response) {
              return response.json().then(function (data) {
                if (!response.ok) {
                  throw new Error(data.error || 'Unable to send the message.');
                }
                return data;
              });
            })
            .then(function () {
              form.reset();
              if (formStatus) {
                formStatus.textContent = 'Secure message transmitted successfully.';
              }
            })
            .catch(function (error) {
              if (formStatus) {
                if (isGithubPages || (error && error.message && /Failed to fetch|NetworkError|404/i.test(error.message))) {
                  form.reset();
                  fallbackToMailto();
                  return;
                }

                formStatus.textContent = error && error.message ? error.message : 'Something went wrong.';
              }
            });
          return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/contact', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4) {
            return;
          }

          var response = {};
          try {
            response = JSON.parse(xhr.responseText || '{}');
          } catch (e) {
            response = {};
          }

          if (xhr.status >= 200 && xhr.status < 300) {
            form.reset();
            if (formStatus) {
              formStatus.textContent = 'Secure message transmitted successfully.';
            }
            return;
          }

          if (isGithubPages || xhr.status === 404) {
            form.reset();
            fallbackToMailto();
            return;
          }

          if (formStatus) {
            formStatus.textContent = response.error || 'Unable to send the message.';
          }
        };

        xhr.send(JSON.stringify(requestBody));
      };

      sendRequest(payload);
    });
  }

  if (tabs && tabs.length) {
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener('click', function () {
        Array.prototype.forEach.call(tabs, function (item) {
          item.classList.toggle('active', item === tab);
        });
      });
    });
  }
})();
