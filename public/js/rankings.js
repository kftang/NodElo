/**
 * Created by kenyunot on 27/01/2017.
 */
 var removing = false;
 var winner;
function addPlayer() {
  //Form for the input
  var nameForm = document.createElement('form');
  //Input for entering name
  var nameInput = document.createElement('input');
  //Button for submitting name
  var submitFormButton = document.createElement('button');
  //Row to be inserted to table
  var newRow = document.createElement('tr');
  //td for the input
  var tdInput = document.createElement('td');
  //td for the button
  var tdButton = document.createElement('td');

  nameForm.setAttribute('id', 'nameform');
  nameForm.setAttribute('method', 'post');
  nameForm.appendChild(nameInput);

  nameInput.setAttribute('type', 'text');
  nameInput.setAttribute('name', 'addname');

  submitFormButton.setAttribute('type', 'submit');
  submitFormButton.setAttribute('form', 'nameform');
  submitFormButton.innerText = 'Add';

  newRow.appendChild(document.createElement('td'));
  newRow.appendChild(tdInput);
  newRow.appendChild(tdButton);
  newRow.appendChild(document.createElement('td'));
  newRow.setAttribute('id', 'newplayer');

  tdButton.appendChild(submitFormButton);
  tdInput.appendChild(nameForm);
  //Insert the new row into the table
  document.getElementsByTagName('table').item(0).appendChild(newRow);
  var newPlayerForm = document.createElement('form');
  newPlayerForm.setAttribute('method', 'post');
  var button = document.getElementsByClassName('add')[0];
  button.parentNode.removeChild(button);
}
function removePlayer() {
  if(!removing) {
    var removeHead = document.createElement('th');
    removeHead.innerText = 'Remove';
    document.getElementsByClassName('head').item(0).appendChild(removeHead);
    var players = document.getElementsByClassName('player');
    for(var i = 0; i < players.length; i++) {
      var element = players.item(i);
      var tdRemove = document.createElement('td');
      var removeForm = document.createElement('form');
      var removeButton = document.createElement('button');
      removeForm.setAttribute('method', 'post');
      removeButton.setAttribute('name', 'removename');
      removeButton.setAttribute('value', element.children.item(1).innerText);
      removeButton.innerText = 'Remove';
      removeForm.appendChild(removeButton);
      tdRemove.appendChild(removeForm);
      element.appendChild(tdRemove);
    }
    removing = true;
  }
}
function play(rank) {
  var buttons = document.getElementsByClassName('won');
  for(var i = 0; i < buttons.length; i++) {
    if(i == rank)
      continue;
    buttons.item(i).setAttribute('onclick', 'against(' + rank + ', ' + i + ')');
    buttons.item(i).innerText = document.getElementsByClassName('player').item(i).childNodes.item(1).innerText;
  }
  buttons.item(rank).parentNode.removeChild(buttons.item(rank));
}
function against(winner, loser) {
  document.body.innerHTML += '<form id="play" method="post"><input type="hidden" name="winner" value="' + winner + '"><input type="hidden" name="loser" value="' + loser + '"></form>'
  document.getElementById('play').submit();
  console.log(winner + ' won against ' + loser);
}
