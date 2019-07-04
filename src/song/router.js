import Router from 'koa-router';
import songStore from './store';
import userStore from "../auth/store";
import {URL} from "url";
import {getUnique} from "../utils/utils";

const ObjectId = require('mongodb').ObjectID;
export const router = new Router();

// GET songs by page, limit, title, artist or contains
router.get('/', async (ctx) => {
    let page = 1;
    let limit = 20;
    let contains = null;
    let songs = [];
    const response = ctx.response;
    const url = new URL(`http://localhost:8100${ctx.url}`);
    if (url.searchParams.get('title') && url.searchParams.get('artist')) {
        let title = url.searchParams.get('title');
        let artist = url.searchParams.get('artist');
        let song = await songStore.findOne({"artist_name": artist, "track_name": title});
        response.body = {song};
        response.status = 200; // ok
        return;
    }
    if (url.searchParams.get('contains')) contains = url.searchParams.get('contains');
    if (url.searchParams.get('page')) page = parseInt(url.searchParams.get('page'));
    if (url.searchParams.get('limit')) limit = parseInt(url.searchParams.get('limit'));
    if (!contains) songs = await songStore.findPaginated({}, page, limit);
    else songs = await songStore.findPaginated({
        $or: [{
            "artist_name": {
                "$regex": contains,
                "$options": "i"
            }
        }, {"track_name": {"$regex": contains, "$options": "i"}}]
    }, page, limit);
    console.log(songs);
    const size = await songStore.size();
    const more = size > page * limit;
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
    let top10recommendations = [];
    const cluster = await songStore.findRecommendations({"mapped": {$elemMatch: {"track_id": ctx.params.id}}});
    // console.log(cluster, "cluster");
    const list = getUnique(cluster.mapped, "track_id");
    // console.log(list, "list");
    const searchedSong = list.find(s => s.track_id === ctx.params.id);
    let songsWithSameGenre = list.filter(s => s.genre === searchedSong.genre && s.track_id !== ctx.params.id);
    // console.log(songsWithSameGenre, "songsWithSameGenre");
    top10recommendations.push(...songsWithSameGenre.slice(0, 10));
    // console.log(top10recommendations,"top10recommendations")
    let i = 1;
    while (top10recommendations.length < 10 && i <= 10) {
        //let otherSongs = list.filter(s => s.genre !== searchedSong.genre);
        //top10recommendations.push(...otherSongs.slice(0, 10 - top10recommendations.length));
        const coordinates = cluster.coordinates;
        const x = parseInt(coordinates.x);
        const y = parseInt(coordinates.y);
        const cluster1 = await songStore.findRecommendations({"coordinates": {"x": x - i, "y": y - i}});
        const cluster2 = await songStore.findRecommendations({"coordinates": {"x": x + i, "y": y + i}});
        const cluster3 = await songStore.findRecommendations({"coordinates": {"x": x - i, "y": y + i}});
        const cluster4 = await songStore.findRecommendations({"coordinates": {"x": x + i, "y": y - i}});
        const cluster5 = await songStore.findRecommendations({"coordinates": {"x": x, "y": y + i}});
        const cluster6 = await songStore.findRecommendations({"coordinates": {"x": x, "y": y - i}});
        const cluster7 = await songStore.findRecommendations({"coordinates": {"x": x - i, "y": y}});
        const cluster8 = await songStore.findRecommendations({"coordinates": {"x": x + i, "y": y}});
        let ngh = [];
        ngh = cluster1 && cluster1.mapped ? ngh.concat(cluster1.mapped) : ngh;
        ngh = cluster2 && cluster2.mapped ? ngh.concat(cluster2.mapped) : ngh;
        ngh = cluster3 && cluster3.mapped ? ngh.concat(cluster3.mapped) : ngh;
        ngh = cluster4 && cluster4.mapped ? ngh.concat(cluster4.mapped) : ngh;
        ngh = cluster5 && cluster5.mapped ? ngh.concat(cluster5.mapped) : ngh;
        ngh = cluster6 && cluster6.mapped ? ngh.concat(cluster6.mapped) : ngh;
        ngh = cluster7 && cluster7.mapped ? ngh.concat(cluster7.mapped) : ngh;
        ngh = cluster8 && cluster8.mapped ? ngh.concat(cluster8.mapped) : ngh;
        ngh = getUnique(ngh, "track_id");
        let songsWithSameGenre2 = ngh.filter(s => s.genre === searchedSong.genre);
        // console.log(songsWithSameGenre2, "songsWithSameGenre2");
        top10recommendations.push(...songsWithSameGenre2.slice(0, 10 - top10recommendations.length));
        i++;
    }
    console.log(top10recommendations, "top10recommendations")
    console.log("Needed ", i, "iterations!")
    let response = ctx.response;
    if (cluster.mapped) {
        if (i <= 10) {
            response.body = {song: searchedSong, recommendations: top10recommendations};
            response.status = 200; // ok
        } else {
            let firstlist = list.filter(s => s.track_id !== ctx.params.id).slice(0, 10);
            if (firstlist.length > 0) {
                response.body = {song: searchedSong, recommendations: firstlist};
                response.status = 200;
            } else {
                response.status = 400;
            }
        }

    } else {
        response.status = 404; // not found
    }
});

// GET user's playlist
router.get('/:username/playlist', async (ctx) => {
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

// POST for add/delete song to users playlist
router.post('/:username/playlist', async (ctx) => {
    console.log("add");
    const user = await userStore.findOne({username: ctx.params.username});
    console.log(user, "user");
    const songToAdd = ctx.request.body.songToAdd;
    const songToDelete = ctx.request.body.songToDelete;
    const response = ctx.response;
    if (songToAdd) {
        console.log(songToAdd, "toAdd");
        try {
            if (user.songs && user.songs.length !== 0) {
                console.log("not empty", user.songs);
                user.songs.push(songToAdd);
                await userStore.updateOne({"_id": new ObjectId(user._id)}, {$set: {"songs": user.songs}});
                response.body = user.songs;
                response.status = 200; // ok
            } else {
                console.log("empty")
                user.songs = [songToAdd];
                console.log(user)
                await userStore.updateOne({"_id": new ObjectId(user._id)}, {$set: {"songs": user.songs}});
                response.body = user.songs;
                response.status = 200; // ok
            }
        } catch (e) {
            console.log(e);
        }
    } else if (songToDelete) {
        console.log(songToDelete, "toDelete");
        try {
            if (user.songs && user.songs.length !== 0) {
                console.log("not empty", user.songs);
                user.songs = user.songs.filter(s => s.track_id !== songToDelete.track_id);
                await userStore.updateOne({"_id": new ObjectId(user._id)}, {$set: {"songs": user.songs}});
            }
            response.body = user.songs;
            response.status = 200; // ok
        } catch (e) {
            console.log(e);
            response.status = 500;
        }
    } else {
        response.status = 400; //bad request
    }
});

