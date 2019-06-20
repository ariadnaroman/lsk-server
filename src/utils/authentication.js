const crypto = require('crypto');

export function generateSalt() {
    return crypto.randomBytes(8).toString('hex').slice(0, 16);
}

export function sha512EncryptPassword(password) {
    const salt  = generateSalt();
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return {
        password: hash.digest('hex'),
        salt: salt
    };
}

export function sha512EncryptPasswordWithSalt(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return {
        password: hash.digest('hex'),
        salt: salt
    };
}

export function passwordMatch(dbPassword, salt, password) {
    const encryptedPassword = sha512EncryptPasswordWithSalt(password, salt).password;
    return dbPassword === encryptedPassword;
}

const algorithm = 'aes-256-cbc';

export function decrypt(password) {
    let iv = Buffer.from(password.iv, 'hex');
    let key = Buffer.from(password.key, 'hex');
    let encryptedText = Buffer.from(password.password, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
