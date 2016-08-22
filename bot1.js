var restify = require('restify');
var msRest = require('ms-rest');
var connector = require('botconnector');

var server = restify.createServer();
server.use(restify.authorizationParser());
server.use(restify.bodyParser());

/*
 * AppSecretには「Primary app secret」の値を入れればOKです！
 */
var appId = process.env.appId || 'e0ea1799-1459-4049-ac48-62e3d8f41cf2';
var appSecret = process.env.appSecret || 'xCVHk7X3jN3wHWhq5aLYDqP';
var credentials = new msRest.BasicAuthenticationCredentials(appId, appSecret);

/*
 * サンプル中とのコードと異なる部分。
 * 第2引数に「リクエストの認証」を入れていますが、EndpointがHTTPの場合は認証が渡ってきません。
 */
server.post('/v1/messages', function (req, res) {
    var msg = req.body;
    if (/^delay/i.test(msg.text)) {
        setTimeout(function () {
            var reply = { 
                replyToMessageId: msg.id,
                to: msg.from,
                from: msg.to,
                text: 'I heard "' + msg.text.substring(6) + '"'
            };
            sendMessage(reply);
        }, 5000);
        res.send({ text: 'ok... sending reply in 5 seconds.' })
    } else {
        res.send({ text: 'I heard "' + msg.text + '". Say "delay {msg}" to send with a 5 second delay.' })
    }
});

server.listen(process.env.PORT || 8080, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

function sendMessage(msg, cb) {
    var client = new connector(credentials);
    var options = { customHeaders: {'Ocp-Apim-Subscription-Key': credentials.password}};
    client.messages.sendMessage(msg, options, function (err, result, request, response) {
        if (!err && response && response.statusCode >= 400) {
            err = new Error('Message rejected with "' + response.statusMessage + '"');
        }
        if (cb) {
            cb(err);
        }
    });
}