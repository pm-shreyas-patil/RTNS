var express=require('express'),
	app=express(),
	bodyParser=require('body-parser'),
	server=require('http').createServer(app),
	io=require('socket.io').listen(server),
	mysql=require('mysql'),
	connection=mysql.createConnection({
        	host        : '172.16.4.86',
	        user        : 'root',
	        password    : 'password',
	        database    : 'rtns',
	        port        : 3306
	});

connection.connect(function(err){
	if (err != null) {
		console.log("Mysql Connection Error"+err);
		process.exit(1);
	}
});

server.listen(3000);

app.use(bodyParser.json());

socketArray = [];
liveTokens={};
allowedTokens=[];


app.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
});

// This is where the notification API's reside to send out real time notifications
app.post('/notify',function(req,res){
	var userId = parseInt(req.body.username);
	var userType = parseInt(req.body.userType);
	var notificationId = parseInt(req.body.notificationId);
	var notificationTitle = req.body.notificationTitle;
	var notification = req.body.notificationAPI;
	var token = generateToken(userId,userType,notificationId);
	var delivered=0;
	var k = Object.keys(liveTokens);
	if (k.indexOf(""+token)>-1) {
		io.sockets.connected[liveTokens[""+token]].emit("data",{"title":userId,"url":notification});
		delivered=1;
	}
	// Update the notification DB
	//updateNotificationStatus(notificationTitle,delivered);	
	res.sendStatus(200);
});


/** Function to update the notification status, once it has been delivered**/
function updateNotificationStatus(notificationId,delivered){
        var query = connection.query('UPDATE notifications set delivered='+delivered+',attempted=1 where id=:NOTIFICATION_ID',{NOTIFICATION_ID:notificationId},function(err,rows){console.log(err);})};


io.sockets.on('connection',function(socket){
	socket.on('handshake-request',function(data){
		/** Register the widget
		Required fields 
		1. User ID
		2. User Type
		3. Widget Type
		4. Notifications Supported {}
		**/
		if (data.uid == null || data.utype == null || data.wtype ==null) {
			io.sockets.socket(socket.id).emit("Error","Not all fields are specified");
		} else {
			token=generateToken(data.uid,data.utype,data.notificationId);
			console.log('Registration Token :'+token);
			liveTokens[token]=socket.id;
			/*pendingNotifications = fetchPendingNotifications(token);
			for (var notification in pendingNotification ) {
				io.sockets.socket(socket.id).emit("data",{"title":notification.title,"url":notification.url});
			}*/
		}
	});
});



// NOTIFICATIONS DB RELATED OPERATIONS
//function fetchPendingNotifications(token) {
//};

/** Function to generate token **/
function generateToken(userId,userType,notificationType) {
        return parseInt(userId+userType+notificationType, 10);
};


var pollNotifications = function(){
	var query=connection.query('SELECT * from notifications where delivered!=1 and attempted=1',notification=[]);
	query.on('error',function(err){}).on('result',function(notification){}).on('end',function(){});
};
