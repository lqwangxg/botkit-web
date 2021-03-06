module.exports = function(webserver, controller) {

    webserver.post('/botkit/receive', function(req, res) {

        // respond to Slack that the webhook has been received.
        res.status(200);

        // Now, pass the webhook into be processed
        controller.handleWebhookPayload(req, res);

    });

}
