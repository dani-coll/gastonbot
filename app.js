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

var inMemoryStorage = new builder.MemoryBotStorage();

var intervalSet = false;

bot.set('storage', inMemoryStorage)

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
        var gif = results.gif;

        var message = 'EESSAAA!!! Buscando gifs de chicas, digoo de  %s';

        session.send(message, gif);

        // Async search
        Store.searchGif(gif)
            .then(function (gifs) {
                // args

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


bot.dialog('help', [
    function (session, results) {

        var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments([new builder.HeroCard()
                            .title("El Mesías Gastón siempre a su servicio")
                            .images([new builder.CardImage().url('https://image.ibb.co/dYCBGw/gaston_mesias.jpg')])
                    ])
        session.send(message);
        message = 'Prueba a poner "muestrame un gif de gatitos" por ejemplo';

        session.send(message);
        session.endDialog();
    }
]).triggerAction({
    matches: 'help',
    onInterrupted: function (session) {
        session.send('Conexión interrumpida');
        session.endDialog()
    }
});


bot.dialog('hello', [
    function (session, results) {

        var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments([new builder.HeroCard()
                            .images([new builder.CardImage().url('https://image.ibb.co/fSyOUG/IMG_20180112_WA0001.jpg')])
                    ])
        session.send(message);
        session.send("HEY PIBE COMO ANDÁS? Justo me pillas en el gym, pero pídeme lo que quieras")
        session.endDialog()
        if(!intervalSet)  {
            intervalSet = true;
            setInterval(() => {
                var date = new Date();
                var hour = date.getHours();
                var minutes = date.getMinutes();
                if(hour == 10 && minutes == 30) session.send("Boludo, recuerda pedir comida en las encarnas")
                if(hour == 11 && minutes == 25) session.send("CHUIII, CHUIII, CHUIII, Nostrum en 5 minutos, quien se viene?")
    
                var randomMessages = [
                    "Tranquilo, todavia no es hora de ir al nostrum",
                    "Esta noche salimos",
                    "Eh, te gusta la noche?",
                    "Que viva el fuuuuuuuuutbol",
                    "VIVA EL VINO DE CARTÓN",
                    "PARÁ, PARÁ",
                    "Mandale recuerdos a pere Benegol",
                    "Pere Benedetto!",
                    "Ese Piquéeee",
                    "Un Ping pong?"
                ]
                var number = Math.random() * (9 - 0) + 0;
                session.send(randomMessages[Math.floor(number)])
    
            }, 30000);
        }
    
    }
]).triggerAction({
    matches: 'hello',
    onInterrupted: function (session) {
        session.send('Conexión interrumpida');
        session.endDialog()
    }
});

bot.dialog('singSomething', [
    function (session, results) {
        return new builder.AudioCard(session)
        .title('I am your father')
        .subtitle('Star Wars: Episode V - The Empire Strikes Back')
        .text('The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film\'s story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.')
        .image(builder.CardImage.create(session, 'https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg'))
        .media([
            { url: 'http://www.wavlist.com/movies/004/father.wav' }
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://en.wikipedia.org/wiki/The_Empire_Strikes_Back', 'Read More')
        ]);
        // console.log("singing")
        
        // try {
        //     return new builder.AudioCard(session)
        //     .title('Aquí tenés la cansión')
        //     .subtitle('Pere benegoool!!!!')
        //     .media([
        //         { url: 'http://www.wavlist.com/movies/004/father.wav' }
        //     ]);
        // } catch (error) {
        //     console.log(error)
        // }
    }
]).triggerAction({
    matches: 'singSomething',
    onInterrupted: function (session) {
        session.send('Conexión interrumpida');
        session.endDialog()
    }
});

bot.dialog('nostrum', [
    function (session, results) {
        session.send("CHUIIIII! Cada día a las 11:30, NO PODÉS FALTAR");
        session.endDialog();
    }
]).triggerAction({
    matches: 'nostrum',
    onInterrupted: function (session) {
        session.send('Conexión interrumpida');
        session.endDialog()
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
        .images([new builder.CardImage().url(gif.image)]);
}