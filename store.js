var Promise = require('bluebird');

const request = require('request');

module.exports = {
    searchGif: function (gif) {
        let url = 'https://www.googleapis.com/customsearch/v1?key=' + process.env.GOOGLE_API_KEY + '&cx=' + process.env.SEARCH_ENGINE_ID + '&q=gif+de+' + gif
        return this.request(url)
            .then((data) => {
                    var gifs = [];
                    gifs.push({
                        name: gif,
                        image: data.items[0].pagemap.metatags[0]['og:image']
                    });
                    return gifs
            })
            
        /*
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
        */
    },
    request: function (url) {
        return new Promise((resolve, reject) => {
            return request(url, {json: true}, (err, res, data) => {
                resolve (data)
            })
        })
    }
};