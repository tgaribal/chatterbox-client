// YOUR CODE HERE:


class ChatterBox {
  constructor() {
    this.currentRoom = 'lobby';
    this.allRooms = new Set();
    this.addedRooms = new Set();
    this.addedMessages = {};

  }
  displayRoomMessages () {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'https://api.parse.com/1/classes/messages?order=-createdAt',
      type: 'GET',
      contentType: 'application/json',
      success: (data) => {
        for (var i = 0; i < data.results.length; i++) {
          var ourResult = data.results[i];
          this.allRooms.add(ourResult.roomname);
          var id = ourResult.objectId;
          if ( !(id in this.addedMessages)) {
            this.addedMessages[id] = ourResult;
            if (ourResult.roomname === this.currentRoom) {
              this.displayMessage(ourResult);
            }
            this.addedMessages[id] = ourResult;
          }
        }
        this.updateRooms();
      },
      error: (data) => {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to receive message', data);
      }

    });
  }
  init () {

    this.displayRoomMessages();

    $('.submit-button').click((e) => {
      this.createMessage();
    });

    setInterval( () => {
      this.displayRoomMessages();
    }, 1000);
  }

    
  updateRooms () {
    for (var room of this.allRooms) {
      if ( !this.addedRooms.has(room) ) {
        var optionString = `<option value="${room}">${room}</option>`;
        $('.room-choice').append(optionString);
        this.addedRooms.add(room);
      }
    }
  }
  displayMessage (messageObj) {
    var div1 = wrapDiv(messageObj.text);
    var div2 = wrapDiv(messageObj.username + ':', 'username');
    var div3 = wrapDiv(messageObj.createdAt + ':', 'createdAt');

    var bigDiv = wrapDiv(div2 + div1 + div3, 'chat');

    $('#chats').prepend(bigDiv);
  }
  createMessage () {
    var message = $('.create-message').val();
    var messageObj = this.generateMessage(message);
    var messageJSON = JSON.stringify(messageObj);
    console.log(messageObj);
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'https://api.parse.com/1/classes/messages',
      type: 'POST',
      data: messageJSON,
      contentType: 'application/json',
      success: (data) => {
        debugger;
        console.log('chatterbox: Message sent');
      },
      error: (data) => {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  }
  generateMessage (message) {
    var messageObj = {};
    messageObj.text = message;
    messageObj.roomname = this.currentRoom;
    messageObj.username = this.getUserName();
    //messageObj.createdAt = Date.now();
    return messageObj;
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
    console.error('chatterbox: Failed to send message', data);
  }
});

*/