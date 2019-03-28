import dataStore from 'nedb-promise';

export class UserStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(user) {
    //
    return this.store.insert(user);
  };

    async update(props, user) {
        return this.store.update(props, user);
    }
}

export default new UserStore({ filename: './db/users.json', autoload: true });