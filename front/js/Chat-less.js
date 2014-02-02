

$(function () {
 var socket = io.connect("http://"+location.host);

  $(document).on('click','.Room',function(){ 
    var data = {"room":$(this).html()};
    socket.emit('ChangeRoom', data);
    move_slide(2); 
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
      alert("ee");
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
      $("#RoomList").append("<li class='Room' id='"+data.room_list[i].id+"'>"+data.room_list[i].name+"</li>");
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
      
      $("#area_chat").append('<div class="message-box"><div class="picture left"><img src="https://lh3.googleusercontent.com/-QDJ4kAyQVz0/AAAAAAAAAAI/AAAAAAAAAAA/M7wANYrPEmE/s46-c-k-no/photo.jpg" ><span class="time"></span></div><div class="message-left"><span>'+client_data.nick+'</span><pre>'+client_data.msg+'</pre></div></div>');

    	//$("#area_chat").append("<tr><td class='chats-id'></td><td class='chats-name'><pre class='chats-name-pre'>"+client_data.nick+"</pre></td><td><pre>"+client_data.msg+"</pre></td></tr>");
    	$("#area_chat").scrollTo("100%",120);



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
        marginLeft: num * (-350) + "px"
        }, 500, function() {
        // Animation complete.
    });
} 