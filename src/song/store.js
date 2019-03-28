import dataStore from 'nedb-promise';

export class SongStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(song) {
    let songTitle = song.title;
    if (!songTitle) { // validation
      throw new Error('Missing title property')
    }
    let songArtist = song.artist;
    if (!songArtist) { // validation
      throw new Error('Missing artist property')
    }
    return this.store.insert(song);
  };
  
  async update(props, song) {
    return this.store.update(props, song);
  }
  
  async remove(props) {
    return this.store.remove(props);
  }
}

export default new SongStore({ filename: './db/songs.json', autoload: true });