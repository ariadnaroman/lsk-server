import {db} from '../index';

export class SongStore {
    constructor() {
    }

    async find(props) {
        this.store = db.collection('songs');
        return this.store.find(props).toArray();
    }

    async findOne(props) {
        this.store = db.collection('songs');
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