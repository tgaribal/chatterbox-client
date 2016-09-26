// YOUR CODE HERE:


var ChatterBox = function () {

};


ChatterBox.prototype.init = function () {

};

ChatterBox.prototype.displayRoomMessages = function(roomname) {
  var ourContext = this;
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/messages',
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      for (var i = 0; i < data.results.length; i++) {
        ourContext.displayMessage(data.results[i]);
      }
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to receive message', data);
    }

  });
};

ChatterBox.prototype.displayMessage = function (messageObj) {
  var div1 = wrapDiv(messageObj.text);
  var div2 = wrapDiv(messageObj.username + ':', 'username');

  var bigDiv = wrapDiv(div2 + div1, 'chat');

  $('#chats').append(bigDiv);
};

var app = new ChatterBox();

app.displayRoomMessages('lobby');


var wrapDiv = function (text, className) {
  var output = '<div';
  if (className) {
    output += ' class=' + className;
  }
  output += '>';
  output += text + '</div>';
  return output;
};


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