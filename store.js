var Promise = require('bluebird');

module.exports = {
    searchGif: function (gif) {
        console.log("promise")

        return new Promise(function (resolve) {
            console.log("searchgifstore")
            // Filling the hotels results manually just for demo purposes
            var gifs = [];
            gifs.push({
                name: gif,
                image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=Gif&w=500&h=260'
            });
    
            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(gifs); }, 1000);
        });
    }
};