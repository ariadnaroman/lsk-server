import Router from 'koa-router';
import songStore from './store';
import userStore from "../auth/store";
const ObjectId = require('mongodb').ObjectID;

export const router = new Router();

router.get('/', async (ctx) => {
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    const response = ctx.response;
    response.body = await songStore.find({});
    response.status = 200; // ok
});

router.get('/:id', async (ctx) => {
    const song = await songStore.findOne({_id: new ObjectId(ctx.params.id)});
    const response = ctx.response;
    if (song) {
        response.body = song;
        response.status = 200; // ok
    } else {
        response.status = 404; // not found
    }
});

router.get('/:id/recommendations', async (ctx) => {
    const song = await songStore.findOne({_id: new ObjectId(ctx.params.id)});
    const songs = await songStore.findRecommendations({ "songs": { $elemMatch: { "artist": song.artist, "title": song.title } } });
    const response = ctx.response;
    if (song) {
        response.body = songs;
        response.status = 200; // ok
    } else {
        response.status = 404; // not found
    }
});

router.get('/username/:username', async (ctx) => {
    const user = await userStore.findOne({username: ctx.params.username});
    const response = ctx.response;
    if (user.songs) {
        response.body = user.songs;
        response.status = 200; // ok
    } else {
        user.songs = [];
        await userStore.update({_id: user._id}, user);
        response.body = user.songs;
        response.status = 200; // ok
    }
});

const createSong = async (song, response) => {
    try {
        const songDetails = await songStore.insert(song);
        response.body = songDetails;
        console.log("SONG ADDED: ", songDetails)
        response.status = 201; // created
        io.on("song-added", (args) => {
            console.log("HELLOOOOOOOOOOOOOO")
        });
        io.on("error", (err) => {
            console.log("ERROR: ", err);
        });
        io.emit("song-added", {
            title: songDetails["title"],
            artist: songDetails["artist"],
            _id: songDetails["_id"]
        });
        console.log("EMIT!!!");

    } catch (err) {
        response.body = {issue: [{error: err.message}]};
        response.status = 400; // bad request
    }
};

router.post('/', async (ctx) => await createSong(ctx.request.body, ctx.response));

router.post('/username/:username', async(ctx) => {
    console.log("add");
    const user = await userStore.findOne({username: ctx.params.username});
    console.log(user, "user");
    const songToAdd = ctx.request.body;
    console.log(songToAdd, "toAdd");
    if (songToAdd._id.includes("offline")) {
        const songFromDb = await songStore.findOne({artist: songToAdd.artist, title: songToAdd.title});
        console.log(songFromDb, "actually this is to add");
        songToAdd._id = songFromDb._id;
    }
    console.log(songToAdd, "this is the final add");
    const response = ctx.response;
    if (user.songs && user.songs.length !== 0) {
        console.log("not empty");
        user.songs = user.songs.concat(songToAdd);
        console.log(user);
        await userStore.update({_id: user._id}, user);
        response.body = user.songs;
        response.status = 200; // ok
    } else {
        console.log("empty")
        user.songs = [songToAdd];
        console.log(user)
        await userStore.update({_id: user._id}, user);
        response.body = user.songs;
        response.status = 200; // ok
    }
});

router.put('/:id', async (ctx) => {
    const song = ctx.request.body;
    const id = ctx.params.id;
    const songId = song._id;
    const response = ctx.response;
    if (songId && songId !== id) {
        response.body = {issue: [{error: 'Param id and body _id should be the same'}]};
        response.status = 400; // bad request
        return;
    }
    if (!songId) {
        await createSong(song, response);
    } else {
        const updatedCount = await songStore.update({_id: id}, song);
        if (updatedCount === 1) {
            response.body = song;
            response.status = 200; // ok
        } else {
            response.body = {issue: [{error: 'Resource no longer exists'}]};
            response.status = 405; // method not allowed
        }
    }
});

router.del('/:id', async (ctx) => {
    await songStore.remove({_id: ctx.params.id});
    ctx.response.status = 204; // no content
});
