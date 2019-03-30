import {db} from '../index';

export class UserStore {
    constructor() {
    }

    async findOne(props) {
        this.store = db.collection('users');
        return this.store.findOne(props);
    }

    async insert(user) {
        this.store = db.collection('users');
        return this.store.insertOne(user);
    };

    async update(props, user) {
        this.store = db.collection('users');
        return this.store.updateOne(props, user);
    }
}

export default new UserStore();