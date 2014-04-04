
$(function () {


 var socket = io.connect("http://"+location.host);

  $(document).on('click touchstart','.Room',function(){ 
    var data = {"room":$(this).attr("id")};
    socket.emit('ChangeRoom', data);

     // transition will generate bug if RoomName is focused
     setTimeout(function(){
        move_slide('next'); 
     },100);
    $("#area_chat").html("");
  });

// login btn 
    $("#btn_login").click(function(e){
      e.preventDefault();
      //var nick = Math.floor((Math.random()*100000)+1);
      var nick = $("#txt_nick").val(); 
      if(nick === ""){
        alert('Insert nickname.');
        return;
      }

      $("#myid").html(nick);
      socket.emit('ctsSetNick', { nick: nick }); 

     // transition will generate bug if txt_nick is focused  
      setTimeout(function(){
        move_slide('next');
      },100);
      
    });

    // add room btn
    $("#add_room").click(function(){  
      if($("#RoomName").val() === ""){
        alert('Insert roomname.');
        return;
      } 
      var RoomData = {"id":"1","name":$("#RoomName").val()};
      socket.emit('CreateRoom', RoomData);
    });


  socket.on('send_room_list', function (data) { 
    //if(data.stat == 'connected') 
    //data.room_list
    $("#RoomList").html("");
    for(var i=0,j=data.room_list.length;i<j;i++){
      $("#RoomList").append("<a class='Room list-group-item' id='"+data.room_list[i]._id+"'>"+data.room_list[i].name+"</a>");
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

      var receivedTime = '<small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span> 12 mins ago </small>'; 
      var receivedMsg = '<p>' + client_data.msg + '</p>'
      var chatHeader = '<div class="header"> <strong class="primary-font">' + client_data.nick + '</strong>' + receivedTime + '</header>';
      var chatHeaderWrapper = '<div class="chat-body clearfix">' +  chatHeader + receivedMsg + '</div>'
      var chatUserImg = '<span class="chat-img pull-left"><img src="http://placehold.it/50/55C1E7/fff&amp;text=U" alt="User Avatar" class="img-circle"> </span>';
      var msgWrapper = '<li class="left clearfix">' + chatUserImg + chatHeaderWrapper + '</li>';

      $('#area_chat').append(msgWrapper);
      $(".area_chat_div").scrollTo("110%",180);

    });



    socket.on('stm', function (client_data) {

      console.log(client_data);

      var receivedTime = '<small class="text-muted"><span class="glyphicon glyphicon-time"></span> 13 mins ago </small>'; 
      var receivedMsg = '<p>' + client_data.msg + '</p>'
      var chatHeader = '<div class="header">' + receivedTime + '<strong class="pull-right primary-font">' + client_data.nick + '</strong></header>';
      var chatHeaderWrapper = '<div class="chat-body clearfix">' +  chatHeader + receivedMsg + '</div>'
      var chatUserImg = '<span class="chat-img pull-right"><img src="http://placehold.it/50/FA6F57/fff&amp;text=ME" alt="User Avatar" class="img-circle"></span>';
      var msgWrapper = '<li class="right clearfix">' + chatUserImg + chatHeaderWrapper + '</li>';

      $('#area_chat').append(msgWrapper);
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

  $(document).on('click touchstart','.btnPrivate',function(){
    $("#sendWho").html("To "+$(this).attr("id"));

    var data={};
  	data['private'] = $(this).attr("id");
  	data['msg'] = $("#msg").val();
  	data['nick'] = $("#myid").html();
  	socket.emit('ctp', data);

  });

}) 

var move_slide = function(direction){
  if(direction == 'next'){
    $('a.right').click();    
  }else if(direction == 'prev'){
    $('a.left').click();
  }else{
    return;
  }

}




 