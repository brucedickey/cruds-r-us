const indexURL  = 'https://www.mecallapi.com/api/users';
const createURL = 'https://www.mecallapi.com/api/users/create';
const readURL   = 'https://www.mecallapi.com/api/users/';        // Append {id}
const updateURL = 'https://www.mecallapi.com/api/users/update';
const deleteURL = 'https://www.mecallapi.com/api/users/delete';
const avatarURL = 'https://www.mecallapi.com/users/cat.png'

function onOpenDisplayDetailsModal(id) {
  fetch(readURL + `${id}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'ok') {
        const person = data.user;

        $('#details-first-name').text(person.fname);
        $('#details-last-name').text(person.lname);
        $('#details-email').text(person.email);
        $('#details-id').text('Id: ' + person.id);
        $('#details-avatar').attr("src", person.avatar);

        $('#details-person-modal').modal('show');
      } else {
        alert(data.message);
      }
    });
}

function onOpenEditPersonModal(id) {
  const fname = $(`tr[data-id='${id}'] .person-fname`).text();
  const lname = $(`tr[data-id='${id}'] .person-lname`).text();
  const email = $(`tr[data-id='${id}'] .person-email`).text();

  // Set initial form values
  $('#update-first-name').val(fname);
  $('#update-last-name').val(lname);
  $('#update-email').val(email);
  $('#update-id').data('id', id);

  $('#update-person-modal').modal('show');
}

function onUpdatePerson() {
  const firstName = $('#update-first-name').val();
  const lastName  = $('#update-last-name').val();
  const email     = $('#update-email').val();
  const id        = $('#update-id').data('id');

  if (!validatePerson(firstName, lastName, email)) return false;

  updatePerson(firstName, lastName, email, id);
}

function updatePerson(firstName, lastName, email, id) {
  const person = {
    "id":       id,
    "fname":    firstName,
    "lname":    lastName,
    "username": email,   // In the mecallapi API, username and email are aliases of each other
    "email":    email,
    "avatar":   avatarURL
  };
  const options = {
    method: 'PUT',
    body: JSON.stringify(person),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  fetch(updateURL, options)
    .then(res => res.json())
    .then(res => {
      if (res.status === 'ok') {
        $("#update-person-modal .btn-close").click();

        getPeople();   // Data round trip; UI to show person updated

      } else {
        alert(res.message);
      }
    });
}

function onOpenDeletePersonModal(id) {
  const fname = $(`tr[data-id='${id}'] .person-fname`).text();
  const lname = $(`tr[data-id='${id}'] .person-lname`).text();

  const confirmationStr = `<span data-id='${id}'>Confirm you want to delete ${fname} ${lname}.</span>`;

  $('#delete-modal-body').html(confirmationStr);
  $('#delete-person-modal').modal('show');
}

function onDeletePerson() {
  const id     = $("#delete-modal-body span").data('id');
  const person = {
    "id": id
  };
  const options = {
    method: 'DELETE',
    body: JSON.stringify(person),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  fetch(deleteURL, options)
    .then(res => res.json())
    .then(res => {
      if (res.status === 'ok') {
        $("#delete-person-modal .btn-close").click();

        getPeople();   // Data round trip; UI to show person deleted

      } else {
        alert(res.message);
      }
    });
}

function validatePerson(firstName, lastName, email) {
  // A simplistic and incomplete email regex
  const emailRegex = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,20}$/i;

  if (firstName.trim() == '' ) {
    alert('Please enter your first name.');
    $('#add-first-name').focus();
    return false;
  } else if (lastName.trim() == '' ) {
    alert('Please enter your last name.');
    $('#add-last-name').focus();
    return false;
  } else if (email.trim() == '' ) {
      alert('Please enter your email address.');
      $('#add-email').focus();
      return false;
  } else if (email.trim() != '' && !emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      $('#add-email').focus();
      return false;
  }
  return true;
}

function postNewPerson(firstName, lastName, email) {
  const person = {
    "fname":    firstName,
    "lname":    lastName,
    "username": email,   // In the mecallapi API, username and email are aliases of each other
    "email":    email,
    "avatar":   avatarURL
  };
  const options = {
    method: 'POST',
    body: JSON.stringify(person),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  fetch(createURL, options)
    .then(res => res.json())
    .then(res => {
      if (res.status === 'ok') {
        $("#add-person-modal .btn-close").click();

        getPeople();   // Data round trip; UI to show new person added

      } else {
        alert(res.message);
      }
    });
}

function onSubmitNewPerson() {
  const firstName = $('#add-first-name').val();
  const lastName  = $('#add-last-name').val();
  const email     = $('#add-email').val();

  if (!validatePerson(firstName, lastName, email)) return false;

  postNewPerson(firstName, lastName, email);
}

function onAddPerson() {
  $('#add-first-name').val('');
  $('#add-last-name').val('');
  $('#add-email').val('');

  $('#add-person-modal').modal('show');
}

function displayPersonListRow(personData, index, peopleArray) {
  // The mecallapi API provides the email in the `username` field
  const id            = personData.id;
  const personRowHTML = $(`
  <tr data-id="${id}">
    <td>${id}</td>
    <td class="person-fname">${personData.fname}</td>
    <td class="person-lname">${personData.lname}</td>
    <td class="person-email">${personData.username}</td>
    <td>
      <button class="btn btn-primary btn-sm" title="Display details" onclick="onOpenDisplayDetailsModal(${id})"><i class="bi bi-eye"></i></button>

      <button class="btn btn-primary btn-sm" title="Edit" onclick="onOpenEditPersonModal(${id})"><i class="bi bi-pencil-square"></i></button>

      <button class="btn btn-danger btn-sm" title="Delete" onclick="onOpenDeletePersonModal(${id})"><i class="bi bi-trash"></i></button>
    </td>
  </tr>
  `);
  $('#people-list').append(personRowHTML);
}

function displayPeopleList(listData) {
  $('#people-list').empty();
  const reversedListData = listData.reverse();   // Place new people on top
  reversedListData.forEach(displayPersonListRow);
}

function getPeople() {
  fetch(indexURL)
    .then(response => response.json())
    .then(data => displayPeopleList(data));
}

$(function() {
  getPeople();
});
