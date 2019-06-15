import Router from 'koa-router';
import songStore from './store';
import userStore from "../auth/store";
import {URL} from "url";
const ObjectId = require('mongodb').ObjectID;
export const router = new Router();

// GET songs by page, limit, title, artist or contains
router.get('/', async (ctx) => {
    let page = 1;
    let limit = 10;
    let contains = null;
    let songs  = [];
    const response = ctx.response;
    const url = new URL(`http://localhost:8100${ctx.url}`);
    if (url.searchParams.get('title') && url.searchParams.get('artist')) {
        let title = url.searchParams.get('title');
        let artist = url.searchParams.get('artist');
        let song = await songStore.findOne({"artist": artist, "title": title});
        response.body = {song};
        response.status = 200; // ok
        return;
    }
    if (url.searchParams.get('contains')) contains = url.searchParams.get('contains');
    if (url.searchParams.get('page')) page = parseInt(url.searchParams.get('page'));
    if (url.searchParams.get('limit')) limit = parseInt(url.searchParams.get('limit'));
    if (!contains) songs = await songStore.findPaginated({}, page, limit);
    else songs = await songStore.findPaginated({ $or: [ { "artist": { "$regex": contains, "$options": "i" } }, { "title": { "$regex": contains, "$options": "i" } }] }, page, limit);
    console.log(songs);
    const size = await songStore.size();
    const more = size > page*limit;
    response.body = {songs, more};
    response.status = 200; // ok
});

// GET song by id
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

// GET recommendations for song
router.get('/:id/recommendations', async (ctx) => {
    const song = await songStore.findOne({_id: new ObjectId(ctx.params.id)});
    const recommendations = await songStore.findRecommendations({ "songs": { $elemMatch: { "artist": song.artist, "title": song.title } } });
    const response = ctx.response;
    if (song) {
        response.body = { song, recommendations: recommendations.songs};
        response.status = 200; // ok
    } else {
        response.status = 404; // not found
    }
});

// GET user's playlist
router.get('/playlist/:username', async (ctx) => {
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
    } catch (err) {
        response.body = {issue: [{error: err.message}]};
        response.status = 400; // bad request
    }
};

// POST for add song
router.post('/', async (ctx) => await createSong(ctx.request.body, ctx.response));

// POST for add song to users playlist
router.post('/playlist/:username', async(ctx) => {
    console.log("add");
    const user = await userStore.findOne({username: ctx.params.username});
    console.log(user, "user");
    const songToAdd = ctx.request.body;
    console.log(songToAdd, "toAdd");
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

// POST for update song
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

// DELETE for delete song by id
router.del('/:id', async (ctx) => {
    await songStore.remove({_id: ctx.params.id});
    ctx.response.status = 204; // no content
});
