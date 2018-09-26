// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    console.log(data[i].saved)
    let saveState="Save";
    if(data[i].saved==true)saveState="Saved";
    else saveState="Save";
    // Display the apropos information on the page
    //$("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    // $("#articles").append("<button type='button'  data-id='" + data[i]._id + "'class='btn btn-primary'>Save</button>");
    if(data[i].saved==false)
    {
      $("#articles").append(
      `<div class="card" style="width: 36rem;">
      
      <div class="card-body">
        <h5 class="card-title">${data[i].title}</h5>
        <a href="${data[i].link}" target="_blank">${data[i].link}</a><br>
        <a href="#" data-id= ${data[i]._id} class="btn btn-primary">${saveState}</a>
        <a href="#" data-id= ${data[i]._id} class="btn btn-secondary" type="submit">Note</a>
        <hr>
      </div>
    </div>`)
  }
  }
  for (var i = 0; i < data.length; i++) {
    console.log(data[i].saved)
    let saveState="Save";
    if(data[i].saved==true)saveState="Saved";
    else saveState="Save";
    // Display the apropos information on the page
    //$("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    // $("#articles").append("<button type='button'  data-id='" + data[i]._id + "'class='btn btn-primary'>Save</button>");
    if(data[i].saved==true)
  {  
    $("#saved").append(
      `<div class="card" style="width: 36rem;">
      
      <div class="card-body">
        <h5 class="card-title">${data[i].title}</h5>
        <a href="${data[i].link}" target="_blank">${data[i].link}</a><br>
        <a href="#" data-id= ${data[i]._id} class="btn btn-danger">Remove from Saved</a>
        <a href="#" data-id= ${data[i]._id} class="btn btn-secondary" type="submit">Note</a>
        <hr>
      </div>
    </div>`)
  }
  }
});


// Whenever someone clicks a p tag
$(document).on("click", ".btn-secondary", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

$(document).on("click", ".btn-info", function(){
  //var thisId = $(this).attr("data-id");
  //console.log(thisId);
  $.ajax({
    method: "GET",
    url: "/saved/"
   
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      //$("#notes").empty();
    });
});
$(document).on("click", ".btn-primary", function(){
  var thisId = $(this).attr("data-id");
  //console.log(thisId);
  $.ajax({
    method: "POST",
    url: "/save/" + thisId,
    data: {
      // Value taken from title input
      saved: true,
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      //$("#notes").empty();
    });
    location.reload();
});
$(document).on("click", ".btn-danger", function(){
  var thisId = $(this).attr("data-id");
  //console.log(thisId);
  $.ajax({
    method: "POST",
    url: "/unsave/" + thisId,
    data: {
      // Value taken from title input
      saved: false,
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      //$("#notes").empty();
    });
    location.reload();
});
// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
