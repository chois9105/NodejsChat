//Rooms.js
$(function () {
	$("pre[name='rlist']").click(function(){
		//alert($(this).html());
		$("#this_room").val($(this).html());
		RoomForm.submit();
	});
	
});