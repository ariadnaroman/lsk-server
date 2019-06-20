import Router from 'koa-router';
import userStore from './store';
import jwt from 'jsonwebtoken';
import {jwtConfig} from '../utils';
import {inspect} from "util"
import {decrypt, passwordMatch, sha512EncryptPassword} from "../utils/authentication";

export const router = new Router();

const createToken = (user) => {
    return jwt.sign({username: user.username}, jwtConfig.secret, {expiresIn: 60 * 60 * 60});
};

const createUser = async (user, response) => {
    try {
        const encrypted = sha512EncryptPassword(user.password);
        await userStore.insert({
            username: user.username,
            password: encrypted.password,
            salt: encrypted.salt
        });
        response.body = {
            token: createToken(user),
            user: {
                username: user.username,
                songs: []
            }
        };
        response.status = 201; // created
    } catch (err) {
        response.body = {issue: [{error: err.message}]};
        response.status = 400; // bad request
    }
};

router.post('/signup', async (ctx) => await createUser(ctx.request.body, ctx.response));

router.post('/login', async (ctx) => {
    try {
        const credentials = ctx.request.body;
        const response = ctx.response;
        const user = await userStore.findOne({username: credentials.username});
        if (user && passwordMatch(user.password, user.salt, credentials.password)) {
            response.body = {
                token: createToken(user),
                user: {
                    username: user.username,
                    songs: user.songs || []
                }
            };
            response.status = 201; // created
        } else {
            response.body = {issue: [{error: 'Invalid credentials'}]};
            response.status = 400; // bad request
        }
    } catch (err) {
        console.log(err);
    }


});
