


function resize_chat(){
  var win = $(window);
      fr = $("#frames");
      //fr.css({"-webkit-transform":"translate("+(win.width()/2-fr.width()/2)+"px,"+(win.height()/2-fr.height()/2)+"px) scale("+win.width()/fr.width()+","+win.height()/fr.height()+")"});
      // horizental resize
      
      fr.css({"left":win.width()/2-fr.width()/2,
        "transform":"scale("+win.width()/fr.width()+","+win.width()/fr.width()+")",
        "-ms-transform":"scale("+win.width()/fr.width()+","+win.width()/fr.width()+")",
        "-webkit-transform":"scale("+win.width()/fr.width()+","+win.width()/fr.width()+")"
      }).css({"top":win.height()/2-fr.height()/2});
    
}

$(window).resize(function(){
resize_chat();
});


$(function () {

  resize_chat();
 var socket = io.connect("http://"+location.host);

  $(document).on('click','.Room',function(){ 
    var data = {"room":$(this).attr("id")};
    socket.emit('ChangeRoom', data);

    move_slide(2); 
    $("#area_chat").html("");

  });

  $("#btn_disconnect").click(function(){ 
    var data = {"data":"data"};
    socket.emit('leaveRoom');
    move_slide(1);
  });

// login btn 
    $("#btn_login").click(function(){
      //var nick = Math.floor((Math.random()*100000)+1);
      var nick = $("#txt_nick").val();
      $("#myid").html(nick);
      socket.emit('ctsSetNick', { nick: nick }); 

      move_slide(1); 
    });

    // toggle room name box 
    $("#toggle_room_box, p[name='toggle_room_box']").click(function (){
      $("#RoomName").val("");
      $("div[name='create_room_text'],div[name='create_room_box']").toggle();
      $("#RoomName").focus();
    });

    // add room btn
    $("#add_room").click(function(){ 
      var RoomData = {"id":"1","name":$("#RoomName").val()};
      socket.emit('CreateRoom', RoomData);
      $("#toggle_room_box, p[name='toggle_room_box']").click();
    });


//when connected...
  socket.on('con', function (data) {
  	//if(data.stat == 'connected') 

    $("#frames").show('slow');

    $("#myid").css("color","green");
  }); 

  socket.on('send_room_list', function (data) { 
    //if(data.stat == 'connected') 
    //data.room_list
    $("#RoomList").html("");
    for(var i=0,j=data.room_list.length;i<j;i++){
      $("#RoomList").append("<li class='Room' id='"+data.room_list[i]._id+"'>"+data.room_list[i].name+"</li>");
    }
  }); 



//get user list.
  socket.on('usrs', function (data) {
  	$("#userList").html("");
  	for(var i=0; i<data.length; i++){
  		var id=data[i].id,
  		    nick=data[i].nick;
      if(socket.socket.sessionid != id)
  		$("#userList").append("<tr><td class='userList-name' name='"+id+"'>"+nick+"<div id='"+id+"' class='btnPrivate'>private</div></td></tr>");
  	}
    $("#btn_userList_cnt").html(data.length);
  }); 

//get msg
    socket.on('stc', function (client_data) {
      $("#area_chat").append('<tr><td><div class="message-box"><div class="picture left"><img src="https://lh3.googleusercontent.com/-QDJ4kAyQVz0/AAAAAAAAAAI/AAAAAAAAAAA/M7wANYrPEmE/s46-c-k-no/photo.jpg" ><span class="time"></span></div><div class="message-left"><span style="display:block;">'+client_data.nick+'</span><pre>'+client_data.msg+'</pre></div></div></td></tr>');
    	$(".area_chat_div").scrollTo("110%",180);
    });

    socket.on('stm', function (client_data) {
      $("#area_chat").append('<tr><td><div class="asdf"><div class="message-box right"><div class="picture right"><img src="https://lh3.googleusercontent.com/-QDJ4kAyQVz0/AAAAAAAAAAI/AAAAAAAAAAA/M7wANYrPEmE/s46-c-k-no/photo.jpg" ><span class="time"></span></div><div class="message-right"><span style="display:block;">'+client_data.nick+'</span><pre>'+client_data.msg+'</pre></div></div></div></td></tr>');
      $(".area_chat_div").scrollTo("110%",180);
    });
 
    socket.on('stl', function (client_data) {
      var img_src = "http://maps.googleapis.com/maps/api/staticmap?center="+client_data.lat+","+client_data.long+"&zoom=18&size=200x200&sensor=false&markers="+client_data.lat+","+client_data.long;

      $("#area_chat").append('<tr><td><div class="message-box"><div class="picture left"><img src="https://lh3.googleusercontent.com/-QDJ4kAyQVz0/AAAAAAAAAAI/AAAAAAAAAAA/M7wANYrPEmE/s46-c-k-no/photo.jpg" ><span class="time"></span></div><div class="message-left"><table><tr><td><span style="display:block;">'+client_data.nick+'</span></td></tr><tr><td><img src="'+img_src+'"></td></tr></table></div></div></td></tr>');
      $(".area_chat_div").scrollTo( {top:'+=300px', left:''}, 180 );
    }); 
    socket.on('stlm', function (client_data) {
      var img_src = "http://maps.googleapis.com/maps/api/staticmap?center="+client_data.lat+","+client_data.long+"&zoom=18&size=200x200&sensor=false&markers="+client_data.lat+","+client_data.long;
      $("#area_chat").append('<tr><td><div class="asdf"><div class="message-box right"><div class="picture right"><img src="https://lh3.googleusercontent.com/-QDJ4kAyQVz0/AAAAAAAAAAI/AAAAAAAAAAA/M7wANYrPEmE/s46-c-k-no/photo.jpg" ><span class="time"></span></div><div class="message-right"><table><tr><td><span clas="right" style="display:block;">'+client_data.nick+'</span></td></tr><tr><td><img src="'+img_src+'"></td></tr></table></div></div></div></td></tr>');
      $(".area_chat_div").scrollTo( {top:'+=300px', left:''}, 180 );
    }); 
                      
  $("#my_location").click(function(){

      if (!navigator.geolocation){
        alert('Geolocation is not supported by your browser');
        return;
      }
      function success(position) {
        var geo = {"nick":$("#myid").html(),"lat":position.coords.latitude,"long":position.coords.longitude};
        socket.emit('ctl', geo);
      };
      function error() {
        alert('Unable to retrieve your location');
      };
      //output.innerHTML = "<p>Locating…</p>";
      navigator.geolocation.getCurrentPosition(success, error);

  });


 //send btn click
  $("#sendBtn").click(function () {  
  	var data={};
  	data['nick'] = $("#myid").html();
  	data['msg'] = $("#msg").val();
    socket.emit('cts', data); 
    $("#msg").val("");
    return false;
  }); 

  $("#btn_userList").click(function(){

    $("#area_userList").toggle("slow");
  });

  $(document).on('mouseenter','.userList-name',function(){
    $("#"+$(this).attr('name')).show('fast');
  });

  $(document).on('mouseleave','.userList-name',function(){
    $("#"+$(this).attr('name')).hide('fast');
  });

  $(document).on('click','.btnPrivate',function(){
    $("#sendWho").html("To "+$(this).attr("id"));

    var data={};
  	data['private'] = $(this).attr("id");
  	data['msg'] = $("#msg").val();
  	data['nick'] = $("#myid").html();
  	socket.emit('ctp', data);

  });

  //////////////////////////////////////////////////////////////////////////////

}) 


var move_slide  = function(num){
    $( "#slide" ).animate({
        marginLeft: num * (-$(".slideBox").css("width").split("px")[0]) + "px"
        }, 500, function() {
        // Animation complete.
    });
} 
 