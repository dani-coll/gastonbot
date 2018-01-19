// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var Store = require('./store');
var spellService = require('./spell-service');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
    console.log("listen")
});
// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session) {
    session.send('Dijiste \'%s\', verdad? Habláme en argentino o no entenderé un carajo. Teclea \'help\' si nesesitá ashuda al respecto.', session.message.text);
});

// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('searchGif', [
    function (session, args, next) {
        console.log("hola")
        // try extracting entities
        var gif = builder.EntityRecognizer.findEntity(args.intent.entities, 'typeGif');
        if (gif) {
            // gif entity detected, continue to next step
            next({ gif: gif.entity });
        } else {
            // no entities detected, ask user for a gif
            builder.Prompts.text(session, 'Pibe, si no espesificás el tipo de gif no puedo aser nada');
        }
    },
    function (session, results) {
        console.log("siuu")
        var gif = results.gif;

        var message = 'EESSAAA!!! Buscando gifs de chicas, digoo de  %s';

        session.send(message, gif);

        // Async search
        Store
            .searchGif(gif)
            .then(function (gifs) {
                // args
                session.send('LO VEO, LO VEO');

                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(gifs.map(gifAsAttachment));

                session.send(message);

                // End
                session.endDialog();
            });
    }
]).triggerAction({
    matches: 'searchGif',
    onInterrupted: function (session) {
        session.send('Conexión interrumpida');
    }
});

// Spell Check
if (process.env.IS_SPELL_CORRECTION_ENABLED === 'true') {
    console.log("spellcheck active")
    bot.use({
        botbuilder: function (session, next) {
            spellService
                .getCorrectedText(session.message.text)
                .then(function (text) {
                    session.message.text = text;
                    next();
                })
                .catch(function (error) {
                    console.error(error);
                    next();
                });
        }
    });
}

// Helpers
function gifAsAttachment(gif) {
    return new builder.HeroCard()
        .title(gif.name)
        .subtitle('Proporcionado por el pibe gastón')
        .images([new builder.CardImage().url(gif.image)])
        .buttons([
            new builder.CardAction()
                .title('Más detalles')
                .type('openUrl')
                .value('https://www.google.com/search?q=gif+de+' + encodeURIComponent(gif.name))
        ]);
}