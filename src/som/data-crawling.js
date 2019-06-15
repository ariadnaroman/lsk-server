const music = require('musicmatch')({apikey:"af1fc88e612443a67756c0c8d6a272d0"});
const Algorithmia = require("algorithmia");

music.matcherTrack({q_artist:"arctic monkeys", q_track:"do i wanna know"})
    .then(function(data){
        // console.log(data.message.body.track.track_id);
        const id = data.message.body.track.track_id;
        music.trackSnippet({track_id:id})
            .then(function(data){
                console.log(data.message.body.snippet.snippet_body);
                const input = data.message.body.snippet.snippet_body;
                Algorithmia.client("simGfC+xtJpBbd37Ge9spoVP2m21")
                    .algo("nlp/Doc2Vec/0.6.0?timeout=300") // timeout is optional
                    .pipe(input)
                    .then(function(response) {
                        console.log(response.get());
                    });
            }).catch(function(err){
            console.log(err);
        })
    }).catch(function(err){
    console.log(err);
})