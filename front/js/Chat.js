$(function () {
 var socket = io.connect("http://"+location.host);
 var nick = Math.floor((Math.random()*100000)+1);
	$("#myid").html(nick);

  var data = {"room":$("#RoomName").html()};
  socket.emit('ChangeRoom', data);

//when connected...
  socket.on('con', function (data) {
  	//if(data.stat == 'connected')
  	  //alert("connected"); 
    socket.emit('ctsSetNick', { nick: nick });
    $("#myid").css("color","green");
  }); 

//get user list.
  socket.on('usrs', function (data) {
  	$("#userList").html("");
  	for(var i=0; i<data.length; i++){
  		var id=data[i].id,
  		    nick=data[i].nick;
  		$("#userList").append("<tr><td class='userList-name' name='"+id+"'>"+nick+"<div id='"+id+"' class='btnPrivate'>private</div></td></tr>");
  	}
  	
  }); 

//get msg
    socket.on('stc', function (client_data) {
    	$("#chats").append("<tr><td class='chats-id'></td><td class='chats-name'><pre class='chats-name-pre'>"+client_data.nick+"</pre></td><td><pre>"+client_data.msg+"</pre></td></tr>");
    	$(".areaChat").scrollTo("100%",120);
    });


 //send btn click
  $("#sendBtn").click(function () {  
  	var data={};
  	data['nick'] = $("#myid").html();
  	data['msg'] = $("#msg").val();
    socket.emit('cts', data);
    return false;
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

