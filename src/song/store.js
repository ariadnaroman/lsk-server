import {db} from '../index';
// const fs = require('fs');
// const readline = require('readline');


export class SongStore {
    constructor() {
    }

    async find(props) {
        this.store = db.collection('songs');
        // let a = 0;
        // const line = fs.readFileSync('clusters1.txt', 'utf8');
        // let songs = line.split(",");
        // for (let song of songs) {
        //     a = a + 1;
        //     const artist = song.split("#")[0];
        //     const title = song.split("#")[1];
        //     await this.store.insertOne({artist, title});
        // }
        // console.log(a);
        // const rl = readline.createInterface({
        //     input: fs.createReadStream('clusters.txt')
        // });
        //
        // rl.on('line', async (line) => {
        //     this.store = db.collection('clusters');
        //     let songs = line.split(",");
        //     let cluster = [];
        //     for (let song of songs) {
        //         const artist = song.split("#")[0];
        //         const title = song.split("#")[1];
        //         cluster.push({artist, title});
        //     }
        //     await this.store.insertOne({songs: cluster});
        // });
        return this.store.find(props).toArray();
    }

    async findOne(props) {
        this.store = db.collection('songs');
        return this.store.findOne(props);
    }

    async findRecommendations(props) {
        this.store = db.collection('clusters');
        return this.store.findOne(props);
    }

    async insert(song) {
        this.store = db.collection('songs');
        let songTitle = song.title;
        if (!songTitle) { // validation
            throw new Error('Missing title property')
        }
        let songArtist = song.artist;
        if (!songArtist) { // validation
            throw new Error('Missing artist property')
        }
        return this.store.insertOne(song);
    };

    async update(props, song) {
        this.store = db.collection('songs');
        return this.store.updateOne(props, song);
    }

    async remove(props) {
        this.store = db.collection('songs');
        return this.store.remove(props);
    }
}

export default new SongStore();