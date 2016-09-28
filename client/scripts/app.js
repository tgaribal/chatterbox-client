// YOUR CODE HERE:


class ChatterBox {
  constructor() {
    this.currentRoom = 'lobby';
    this.allRooms = new Set();
    this.addedRooms = new Set();
    this.addedMessages = {};
    this.server = 'https://api.parse.com/1/classes/messages?order=-createdAt';
    this.messagesByUser = {};
    this.friendSet = new Set();

  }

  init () {

    this.fetch();

    $('.submit').click((e) => {
      this.handleSubmit();
      //$('.submit').reset();
    });

    setInterval( () => {
      this.fetch();
    }, 1000);

    $('#roomSelect').on('change', (e) => {
      this.currentRoom = $('#roomSelect').val();
      this.clearMessages();
      this.fetch();
    });

    $('.new-room').on('click', () => {
      var newRoom = prompt('Name your New Room');
      this.renderRoom(newRoom);
      $('#roomSelect').val(newRoom);
      this.currentRoom = newRoom;
      this.clearMessages();
      this.fetch();
    });
  }

  filter (attribute, value) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: this.server,
      type: 'GET',
      contentType: 'application/json',
      success: (data) => {
        for (var i = data.results.length - 1; i >= 0; i--) {
          var ourResult = data.results[i];
          cleanMessage(ourResult);
          this.allRooms.add(ourResult.roomname);
          this.renderRoom(ourResult.roomname);
          var id = ourResult.objectId;
          if ( !(id in this.addedMessages)) {
            this.addedMessages[id] = ourResult;
            if (ourResult[attribute] === value) {
              this.renderMessage(ourResult);
            }
            this.addedMessages[id] = ourResult;
          } else {
            this.updateTime(ourResult);
          }
        }
      },
      error: (data) => {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to receive message', data);
      }

    });

  }


  fetch () {
    this.filter('roomname', this.currentRoom);
  }

  handleSubmit () {
    var messageObj = this.createMessage();
    this.send(messageObj);
  }

  clearMessages () {
    $('#chats').empty();
    this.addedMessages = {};
    this.messagesByUser = {};
  }

  renderRoom (room) {
    if ( !this.addedRooms.has(room) ) {
      var optionString = `<option value="${room}">${room}</option>`;
      $('#roomSelect').append(optionString);
      this.addedRooms.add(room);
    }
  }

  updateTime (messageObj) {
    var currentTime = new Date();
    var time = msToTime(currentTime - new Date(messageObj.createdAt));

  }
  renderMessage (messageObj) {
    var currentTime = new Date();
    var time = msToTime(currentTime - new Date(messageObj.createdAt));


    var div1 = wrapDiv(messageObj.text, 'text');
    var div2 = wrapDiv(messageObj.username + ':', 'username');
    var div3 = wrapDiv(time, 'createdAt');


    var bigDiv = wrapDiv(div2 + div1 + div3, 'chat');
    var lastAdded;
    
    $('#chats').prepend(bigDiv);
    lastAdded = $('#chats .username').first();


    var $text = lastAdded.next('.text');

    var user = messageObj.username;
    if (this.friendSet.has(user)) {
      if ($text.text()) {
        $text.addClass('friend');
      }
    }
    this.messagesByUser[user] = this.messagesByUser[user] || [];
    this.messagesByUser[user].push($text);


    var ourContext = this;
    lastAdded.on('click', function () {
      var user = $(this).text().slice(0, -1);
      if (!ourContext.friendSet.has(user)) {
        ourContext.friendSet.add(user);
      } else {
        ourContext.friendSet.delete(user);
      }
      var arr = ourContext.messagesByUser[user];
      if (!arr || !arr.length) {
        return;
      }
      for (var i = 0; i < arr.length; i ++) {
        if (arr[i].text()) {
          arr[i].toggleClass('friend');
        }
      }
    });
  }


  createMessage () {
    var message = $('.create-message').val();
    var messageObj = {};
    messageObj.text = message;
    messageObj.roomname = this.currentRoom;
    messageObj.username = this.getUserName();
    console.log(messageObj);
    return messageObj;
  }

  send (messageObj) {
    var messageJSON = JSON.stringify(messageObj);
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'https://api.parse.com/1/classes/messages',
      type: 'POST',
      data: messageJSON,
      contentType: 'application/json',
      success: (data) => {
        console.log('chatterbox: Message sent');
      },
      error: (data) => {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to createMessage message', data);
      }
    });
    this.fetch();
  }

  getUserName () {
    var userName = window.location.search.slice(10);
    return userName;
  }
}

var wrapDiv = (text, className) => {
  var output = '<div';
  if (className) {
    output += ' class=' + className;
  }
  output += '>';
  output += text + '</div>';
  return output;
};

var cleanMessage = (messageObj) => {
  var keys2clean = ['text', 'username', 'roomname'];
  for (var i = 0; i < keys2clean.length; i ++) {
    messageObj[keys2clean[i]] = stringClean(messageObj[keys2clean[i]]);
  }
};

var stringClean = (string) => {
  if (string === undefined) {
    return 'notUndefined';
  }
  var newString = '';
  for (var i = 0; i < string.length; i++) {
    var char = string[i];
    if (char === '/') {
      newString += '&#x2F;';
    } else if (char === '&') {
      newString += '&amp;';
    } else if (char === '<') {
      newString += '&lt;';
    } else if (char === '>') {
      newString += '&gt;';
    } else if (char === '"') {
      newString += '&quot;';
    } else if (char === '\'') {
      newString += '&#x27;';
    } else {
      newString += char;
    }
  }
  return newString;
};

var msToTime = (s) => {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  if (hrs > 0) {
    return (hrs + ' hours ago');
  } else if (mins > 0) {
    return (mins + ' minutes ago');
  } else {
    return (secs + ' seconds ago');
  }
};

var app = new ChatterBox();
$(document).ready( () => {
  app.init();
});
/*

$.ajax({
  // This is the url you should use to communicate with the parse API server.
  url: 'https://api.parse.com/1/classes/messages',
  type: 'POST',
  data: JSON.stringify(message),
  contentType: 'application/json',
  success: function (data) {
    console.log('chatterbox: Message sent');
  },
  error: function (data) {
    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
    console.error('chatterbox: Failed to createMessage message', data);
  }
});

*/