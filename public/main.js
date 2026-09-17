(function () {
  var form = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  var tabs = document.querySelectorAll('.tab');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

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

      var sendRequest = function (requestBody) {
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
