// Userlist data array for filling in info box
var userListData = [];
var thisUserObject;
var thisUserObject;

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();
    
    // Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

    // Update User link click
    $('#userList table tbody').on('click', 'td a.linkupdateuser', updateUserInput);

    // Update User link click
    $('#userList table tbody').on('click', 'td a.linkupdateuser', updateUserInput);

    // Add User button click
    $('#btnAddUser').on('click', addUser);

    // Update User button click
    $('#btnUpdateUser').on('click', updateUser);

});

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {

        // Stick our user data array into a userlist variable in the global object
        userListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' + this.username + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '<td><a href="#" class="linkupdateuser" rel="' + this._id + '">update</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
};

// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);

};

// Add User
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'location': $('#addUser fieldset input#inputUserLocation').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

// Enter user info to be updated
function updateUserInput(event) {
    event.preventDefault();

    // Show the table which will get current user data to edit
    document.getElementById('updateUser').style.visibility = 'visible';

    // Retrieve id from link rel attribute
    thisUserId = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem._id; }).indexOf(thisUserId);
    
    // Get our User Object
    thisUserObject = userListData[arrayPosition];

    // Fill placeholder with data of user to be updated
    $('#updateUser fieldset input#inputUserFullname').attr('placeholder', thisUserObject.fullname);
    $('#updateUser fieldset input#inputUserFullname').attr('name', 'fullname');
    $('#updateUser fieldset input#inputUserUsername').attr('placeholder', thisUserObject.username);
    $('#updateUser fieldset input#inputUserUsername').attr('name', 'username');
    $('#updateUser fieldset input#inputUserEmail').attr('placeholder', thisUserObject.email);
    $('#updateUser fieldset input#inputUserEmail').attr('name', 'email');
    $('#updateUser fieldset input#inputUserAge').attr('placeholder', thisUserObject.age);
    $('#updateUser fieldset input#inputUserAge').attr('name', 'age');
    $('#updateUser fieldset input#inputUserLocation').attr('placeholder', thisUserObject.location);
    $('#updateUser fieldset input#inputUserLocation').attr('name', 'location');
    $('#updateUser fieldset input#inputUserGender').attr('placeholder', thisUserObject.gender);
    $('#updateUser fieldset input#inputUserGender').attr('name', 'gender');


};

// Update User Info
function updateUser(event) {

    // basic check to see if any new information has been added.
    var changeCount = 0;

    $('#updateUser input').each(function(index, val) {
        if($(this).val() != '') { 
            changeCount++;
            // update the existing object with new data
            thisUserObject[$(this).attr('name')] = $(this).val();
        }
    });

    if(changeCount > 0) {
        //there is data to be updated
        //make ajax call
        $.ajax({
            type: 'PUT',
            data: thisUserObject,
            url: '/users/updateuser/' + thisUserId,
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
                    // Show the table which will get current user data to edit
                    document.getElementById('updateUser').style.visibility = 'hidden';
                    // TODO clear form
                    //document.getElementById('updateUser').value = '';
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });
    }

};










