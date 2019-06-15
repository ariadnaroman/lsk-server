// const fs = require('fs');
// const readline = require('readline');

// const MongoClient = require('mongodb').MongoClient;
// let db = {};
// let dbClient;
//
// // assign the client from MongoClient
// MongoClient
//     .connect('mongodb://localhost:27017', { useNewUrlParser: true, poolSize: 10 })
//     .then(client => {
//         console.log("opened");
//         db = client.db('alaska');
//         dbClient = client;
//
//
//         extractData(db);//.then((vec) => {
//         //     console.log(vec.length, "****");
//         // }, (err) => console.log(err)).catch((err) => console.log(err));
//         // console.log(vec.length);
//
//
//     })
//     .catch(error => console.error(error));
//
// // listen for the signal interruption (ctrl-c)
// process.on('SIGINT', () => {
//     console.log("closed");
//     dbClient.close();
//     process.exit();
// });
//
// function extractData(db) {
//     // let vec = [];
//     // // const store = db.collection('attributes');
//     //
//     // const rl = readline.createInterface({
//     //     input: fs.createReadStream('SpotifyFeatures.csv')
//     // });
//     //
//     // rl.on('line', (line) => {
//     //     console.log(line)
//     //     let attributes = line.split(",");
//     //     const genre = attributes[0];
//     //     const artist_name = attributes[1];
//     //     const track_name = attributes[2];
//     //     const track_id = attributes[3];
//     //     const popularity = attributes[4];
//     //     const acousticness = attributes[5];
//     //     const danceability = attributes[6];
//     //     const duration_ms = attributes[7];
//     //     const energy = attributes[8];
//     //     const instrumentalness = attributes[9];
//     //     const key = attributes[10];
//     //     const liveness = attributes[11];
//     //     const loudness = attributes[12];
//     //     const mode = attributes[13];
//     //     const speechiness = attributes[14];
//     //     const tempo = attributes[15];
//     //     const time_signature = attributes[16];
//     //     const valence = attributes[17];
//     //     vec.push({genre, artist_name, track_name, track_id, popularity, acousticness, danceability,
//     //              duration_ms, energy, instrumentalness, key, liveness, loudness, mode, speechiness, tempo, time_signature, valence});
//     //     console.log(vec.length);
//     //     // await store.insertOne({genre, artist_name, track_name, track_id, popularity, acousticness, danceability,
//     //     //     duration_ms, energy, instrumentalness, key, liveness, loudness, mode, speechiness, tempo, time_signature, valence});
//     // });
//     //
//     // return vec;
//     let vec = [];
//     const fs = require('fs');
//     const papa = require('papaparse');
//     const file = fs.createReadStream('SpotifyFeatures.csv');
//     let count = 0; // cache the running count
//     papa.parse(file, {
//         worker: true, // Don't bog down the main thread if its a big file
//         step: function(result) {
//             console.log(result.data[0].length);
//             vec.push(result.data[0]);
//         },
//         complete: function(results, file) {
//             console.log(vec.length, "******")
//             console.log(vec);
//         }
//     });
// }

const matrix  = [
        [18,0.972,0.36,176797,0.201,0.028,3,0.133,-19.794,1,0.0581,131.798,0.369,"Opera","Giacomo Puccini","Madama Butterfly / Act 1: ... E soffitto e pareti","7MfmRBvqaW0I6UTxXnad8p"],
        [10,0.935,0.168,266184,0.47,0.0204,0,0.363,-8.415,1,0.0383,75.126,0.0696,"Opera","Giacomo Puccini","Turandot / Act 2: Gloriagloriao vincitore","7pBo1GDhIysyUMFXiDVoON"],
        [17,0.961,0.25,288573,0.00605,0,2,0.12,-33.44,1,0.048,76.493,0.038,"Opera","Giuseppe Verdi","RigolettoAct IV: Venti scudi hai tu detto?","02mvYZX5aKNzdqEo6jF20m"],
        [19,0.985,0.142,629760,0.058,0.146,2,0.0969,-23.625,1,0.0493,172.935,0.0382,"Opera","Giuseppe Verdi","Don Carlo / Act 4: Ella giammai m'amò!","03TW0jwGMGhUabAjOpB1T9"],
        [20,0.99,0.211,334720,0.064,0.0196,8,0.073,-20.666,1,0.0534,81.403,0.04,"Opera","Giuseppe Verdi","D'amor sull'ali rosee","0G75cCcf6vBSnMFFkVW9pq"],
        [13,0.98,0.341,646813,0.16,0.0146,2,0.113,-19.753,1,0.0575,171.444,0.3,"Opera","Georges Bizet","Waxman : Carmen Fantasie","10gPtjlpTS9Uq6EUQuGljt"],
        [19,0.975,0.109,963440,0.018,0.791,6,0.0712,-26.778,1,0.0399,82.178,0.0359,"Opera","Giuseppe Verdi","4 Pezzi sacri: No. 4. Te Deum","1iayQ9XmNJL2F0S0zjdNST"],
        [20,0.951,0.169,417987,0.178,0.185,0,0.665,-21.589,0,0.054,65.995,0.112,"Opera","Vincenzo Bellini","I puritani: Ah! per sempre io ti perdei - Bel sogno beato (Live)","297JkKwa74ayxAz38hXMeb"],
        [16,0.968,0.25,373480,0.12,4.92E-05,11,0.0865,-21.205,1,0.0654,73.433,0.0384,"Opera","Léo Delibes","LakméAct INo. 2: ViensMallika... Sous le dôme épais (Flower Duet)","3Eu8Qqq7vv0UsNWf0mWTmZ"],
        [20,0.978,0.18,521640,0.167,0.235,11,0.105,-19.212,1,0.043,81.348,0.032,"Opera","Richard Wagner","Tristan und IsoldeWWV. 90Act III: Mild und leise (Liebestod)","3QwZLLBxuUlDgRhNqEQW9z"],
        [17,0.987,0.154,103827,0.0948,0.505,9,0.0701,-19.569,0,0.0417,65.363,0.0392,"Opera","Georges Bizet","Carmen: Act I: 'Carmen! sur tes pas nous nous pressons tous!","3W2KxQd1u8v1UOCsWn1qyV"],
        [12,0.968,0.518,74107,0.0834,0,0,0.244,-28.472,1,0.0724,110.867,0.618,"Opera","Giuseppe Verdi","FalstaffAct I Scene 2: Alice. Meg. Nannetta","3ZuEvBlO6F8iArGPdnkD8x"],
        [19,0.953,0.0685,247757,0.0864,0.877,9,0.247,-20.449,1,0.0381,75.841,0.0388,"Opera","Giacomo Puccini","Turandot / Act 1: Perché tarda la luna? (Coro)","46GsTkeUgN1nYhv4NPBx6F"],
        [15,0.973,0.16,300685,0.121,1.22E-05,1,0.113,-19.373,1,0.0458,173.651,0.0613,"Opera","Giuseppe Verdi","O terraaddio; addio valle di pianti","4Fx2s0qn4s4KEPiNTDXKRL"],
        [16,0.991,0.234,257040,0.236,0.657,0,0.127,-19.226,1,0.0532,83.559,0.115,"Opera","Georges Bizet","Bizet: Carmen: Non! Tu ne m'aimes pas! - Act Two","4Mb2XoVuyQK6yAbcbUKOk0"],
        [17,0.974,0.0891,653000,0.0486,0.92,9,0.0763,-25.831,1,0.0403,85.885,0.029,"Opera","Richard Wagner","LohengrinWWV 75: Prelude to Act I","4mOuVk8A69BS1D8FBLOyt8"],
        [16,0.99,0.321,339933,0.336,0.286,7,0.359,-17.688,1,0.0677,109.962,0.308,"Opera","Georges Bizet","Bizet: Carmen: Hola! Carmen! Hola! Hola! - Act Two","4v4nQkmWVvHdJCOltOET4T"],
        [18,0.988,0.176,270693,0.123,7.78E-05,1,0.0823,-16.237,1,0.0459,82.558,0.0674,"Opera","Giacomo Puccini","Madama ButterflyAct II: Un bel di vedremo","5ngGqPApX9w5vTNIOZmHEZ"],
        [14,0.961,0.147,211880,0.0333,0.0112,4,0.14,-23.409,1,0.045,85.291,0.0593,"Opera","Giacomo Puccini","Puccini : La rondine : Act 3 Dimmi che vuoi seguirmi [Ruggero]","5q5bTF4FwndETJuaprz8GE"],
        [17,0.929,0.181,444907,0.0375,0.000423,10,0.111,-24.623,0,0.0548,81.396,0.0386,"Opera","Giuseppe Verdi","Requiem: XVI. Libera MeDies IraeRequiem Aeternam","6ExvIqyqDDtxtCsXbRpr7i"],
        [18,0.976,0.518,81773,0.143,0,7,0.405,-21.551,1,0.172,83.512,0.391,"Opera","Georges Bizet","CarmenAct I: No.3 bis Récit: C'est bien làn'est-ce pas? (Zuniga/Don José)","6V6ZwnhvlFPRkTzmuPWkcu"],
        [15,0.926,0.223,438267,0.172,0.142,11,0.149,-18.235,1,0.0419,90.402,0.0348,"Opera","Richard Wagner","Tristan und IsoldeWWV 90 / Act 3: Mild und leise wie er lächelt (Isoldes Liebestod)","6aeoyoYjAptLrWzJkJpCgi"],
        [16,0.966,0.279,85120,0.0549,0.00113,3,0.393,-25.069,1,0.0371,136.904,0.0837,"Opera","Richard Wagner","Das RheingoldWWV 86AScene 1: Weia! Waga! Wogedu Welle","75XnflzyreWomyyY7xTTvZ"],
        [17,0.959,0.216,222029,0.079,0.0265,1,0.154,-25.789,1,0.0393,84.51,0.0374,"Opera","Giacomo Puccini","Madama Butterfly / Act 1: Ecco. Son giunte al sommo del pendio","7Eq2Jr9SNLoGHxwoouJ2rp"],
        [16,0.987,0.293,410000,0.151,0.0398,0,0.219,-24.395,1,0.0652,91.085,0.152,"Opera","Georges Bizet","Bizet: Carmen: Ecouteecoutecompagnonecoute! - Act Three","7sXR2q4FuSKOAPYvmmBjh3"],
        [21,0.945,0.153,206107,0.131,0.892,7,0.316,-21.035,0,0.0396,142.93,0.095,"Opera","Tomaso Albinoni","Oboe Concerto in B-Flat 1Op. 9No. 11: II. Adagio","3OVRK6RqHozP7g0lKf2zYk"],
        [13,0.842,0.443,190080,0.314,2.02E-06,10,0.072,-15.755,1,0.0459,98.964,0.916,"Opera","Tomaso Albinoni","Sonata A Violino Solo Di Me Tomaso Albinoni Coposta Per Il Signor Pisendel In BbS. 32: Allegro","5cWDNT7ErG3Bf7QkdAsiO5"],
        [14,0.99,0.452,88067,0.0148,0,7,0.0919,-27.107,1,0.037,88.035,0.709,"Opera","Teresa Berganza","El majo discreto","0oJqy24a8mylnrvMLH6a3h"],
        [22,0.796,0.553,126667,0.33,0.968,8,0.136,-15.236,0,0.0298,138.935,0.486,"Opera","Jean-Baptiste Lully","Idylle sur la paix: Air pour Madame la Dauphine","3X9bhmsGK5FmDbjl4Reylz"],
        [12,0.726,0.383,51800,0.183,0.156,0,0.402,-19.151,1,0.0373,83.148,0.923,"Opera","Jean-Baptiste Lully","Flore: Entree pour les Jardiniers et quatre Galants","238W4SRnP0hKcNv80X3gOl"],
        [21,0.937,0.47,118400,0.185,0.00659,6,0.13,-19.131,0,0.0418,85.095,0.812,"Opera","Jean-Philippe Rameau","Les Indes galantes: Air des Sauvages","2qE1t7sWiTDmLvGNQe57xc"],
        [15,0.872,0.367,347000,0.349,0.74,1,0.1,-15.256,1,0.0532,127.044,0.244,"Opera","Jean-Philippe Rameau","Zaïs : Overture","4FsQwrARZW4QFj3wwxRdWb"],
        [21,0.882,0.398,179573,0.247,0.53,5,0.0929,-16.073,0,0.0374,116.834,0.399,"Opera","Jean-Baptiste Lully","Le Bourgeois GentilhommeLWV 43: Ouverture (1670)","6jnm0rXkGlaDTR7T6wNPZi"],
        [20,0.972,0.377,160467,0.159,8.25E-05,0,0.111,-14.26,1,0.0514,84.973,0.22,"Opera","Anne Sofie von Otter","I Want To Vanish","7MXD7LWhcgXXLgZXxmwzVO"],
        [13,0.852,0.304,187120,0.262,0,7,0.243,-16.491,0,0.0558,174.419,0.864,"Opera","Tomaso Albinoni","Sonata In G 0 For Violin And ContinuoSo 33: Corrente: Allegro","3HriuKEnu0tBnmdxGcd3e4"],
        [17,0.905,0.13,192933,0.158,0.854,5,0.143,-20.086,1,0.0408,89.574,0.0394,"Opera","Pietro Mascagni","Cavalleria Rusticana: Intermezzo - Instrumental","3hdaiDeFLgdGFoWnBtpbpm"],
        [16,0.98,0.162,190533,0.0683,0.0154,10,0.144,-20.84,0,0.0495,170.663,0.0759,"Opera","Jean-Baptiste Lully","Exaudiat te Dominus (Psalm 19): Domine salvum","7aU88CeEVXqVmzz2XpnCzB"],
        [14,0.835,0.452,98867,0.0937,0,7,0.239,-19.132,0,0.0336,94.786,0.735,"Opera","Tomaso Albinoni","Sonata In G 0 For Violin And ContinuoSo 33: Gavotta: Allegro","1EucK98ZgRz5VJ1n2L1DFP"],
        [22,0.946,0.271,481427,0.119,0.000301,2,0.104,-18.565,0,0.0362,106.52,0.105,"Opera","Christina Pluhar","Pluhar: Orfeo ChamánAct 4: Esta barca (NahualOrfeo)","1RSUMUdAQCi0pKm0isjoGz"],
        [14,0.917,0.397,366227,0.106,0.648,11,0.102,-18.175,1,0.0418,113.442,0.178,"Opera","Jean-Philippe Rameau","La naissance d'Osiris: Overture","3tJq9Wg5Uf76lN8b4gEfVs"],
        [12,0.994,0.357,203667,0.0195,0.00122,2,0.0998,-24.396,0,0.0399,87.467,0.185,"Opera","Alessandro Scarlatti","Sento nel core","6w8eTjCWYbXODykmI3SM2t"],
        [14,0.94,0.521,129027,0.0552,1.84E-06,10,0.0525,-25.604,1,0.0602,107.851,0.502,"Opera","Alessandro Scarlatti","Le violette","1mprqOk9miI3Ohznbk6S3W"],
        [22,0.927,0.396,126920,0.175,9.11E-05,2,0.114,-17.765,0,0.0306,105.824,0.302,"Opera","Christina Pluhar","Pluhar: Orfeo ChamánAct 4: Sigue bbiendo (NahualOrfeo)","7yrUqkN8xPb7VfFG9sq7vu"],
        [8,0.966,0.358,601133,0.0428,0.000268,4,0.0831,-22.055,0,0.0499,111.143,0.04,"Opera","Geminiano Giacomelli","Merope: Sposanon mi conosci","3En11E0NJfavi6IBRq38Ge"],
        [12,0.728,0.495,43800,0.144,0.987,9,0.124,-21.167,1,0.0722,145.9,0.739,"Opera","Adolphe Adam","Giselle: Act I: Pesante","10GQtz5SUrRc25bBH8OKFU"],
        [8,0.917,0.143,553840,0.086,0.889,5,0.0877,-20.13,1,0.0359,140.013,0.0386,"Opera","Engelbert Humperdinck","Humperdinck: Hänsel und Gretel / Act 2 - Pantomime","3Y2wSrPtJFmJU7bU7nCq3k"],
        [12,0.885,0.0741,187667,0.0783,0.969,2,0.138,-24.206,1,0.042,80.56,0.0353,"Opera","Engelbert Humperdinck","Hänsel und Gretel: Children's Prayer - Instrumental","06F0br63zWGYgjGw7QS9uU"],
        [14,0.906,0.498,67360,0.457,0.792,5,0.036,-15.277,1,0.0781,87.832,0.289,"Opera","Daniel Auber","Grand Pas Classique: Variation for the Male Dancer","48D8POUWuZIwOpMYyEg4gd"],
        [16,0.967,0.0901,187227,0.00763,0.00495,7,0.0917,-34.765,1,0.0461,86.148,0.0327,"Opera","Engelbert Humperdinck","Humperdinck : Hänsel und Gretel : Act 2 Abends will ich schlafen gehn [HänselGretel]","0MzOsRk9B77RRb203yBzYD"],
        [13,0.982,0.306,134733,0.127,0.0415,11,0.081,-16.609,1,0.0493,84.199,0.136,"Opera","Antonio Sartorio","Sartorio: L'OrfeoAct 3: Orfeo tu dormi? (Euridice)","1t4kOWyKAoUZuKPbLp0P0O"],
        [10,0.98,0.141,148947,0.0608,0.797,2,0.633,-27.6,1,0.0481,67.228,0.0343,"Opera","Engelbert Humperdinck","Act 2: Evening Prayer","7a6a1FfFxTiKfzkQYPRJzZ"],
        [13,0.595,0.328,151960,0.429,0.0525,2,0.341,-12.036,1,0.032,112.568,0.617,"Opera","Georges Bizet","Prélude from Carmen - Vocal","6WcNPGsSMfVwPqzm4i32dY"],
        [14,0.955,0.386,163907,0.534,4.75E-05,11,0.639,-10.005,0,0.049,130.384,0.233,"Opera","Giacomo Puccini","Wagner: TurandotSC 91: Act I: Gira la cote","2Ou7jLB1FHMuGHtSMWa1Up"],
        [17,0.989,0.202,301107,0.159,0.467,4,0.164,-20.008,0,0.0572,80.67,0.0599,"Opera","Alfredo Catalani","Catalani: La Wally: Ebben?... Ne andro lontana - Act One","1AwcD5nGN44qqQmXfDC9mB"],
        [20,0.933,0.318,206267,0.382,0.000328,1,0.0937,-14.781,1,0.0737,141.931,0.372,"Opera","Anna Netrebko","Die Csárdásfürstin / Act 1: Heiaheiain den Bergen ist mein Heimatland","1NIO3xww2fsF6T5Ml3JIhz"],
        [20,0.955,0.247,467320,0.105,0.000138,7,0.116,-15.079,0,0.0446,78.684,0.134,"Opera","Francesco Cavalli","Cavalli / Arr Pluhar: L'Ormindo: L'Armonia (Prologo)","2npBG4tlLGWjeIIh50QU9b"],
        [22,0.988,0.286,173973,0.207,4.34E-06,7,0.102,-11.775,1,0.0344,89.743,0.181,"Opera","Alfredo Kraus","Lejos de Ti","4kWZ4m2sIzSrimuXXnkk9i"],
        [15,0.979,0.431,125706,0.00585,0.0123,8,0.0969,-28.477,1,0.0372,129.751,0.196,"Opera","Adolphe Adam","No. 8 Pas de Deux (Giselle & Albrecht)","4nQRAJHyYp24ET8aLPFnto"],
        [10,0.934,0.423,119760,0.227,0.0113,5,0.121,-18.352,1,0.0421,58.836,0.318,"Opera","Gaetano Donizetti","L'elisir d'amore / Act 1: Bel conforto","6fPhE9XKt59OfqitvMRh6Z"],
        [8,0.943,0.267,144080,0.286,0.00067,8,0.116,-12.064,1,0.0404,69.04,0.0586,"Opera","Lesley Garrett","O Mio Babbino Caro","0cxXdpPflXI6XpU3wwX0yZ"],
        [20,0.987,0.257,415160,0.0509,0.00512,2,0.0989,-22.473,0,0.0469,89.542,0.0347,"Opera","Arrigo Boito","Mefistofele: L'altra notte in fondo al mare","219DfTJcYnSEmDt2Trb1bo"],
        [15,0.848,0.219,140360,0.0116,0.846,3,0.197,-21.376,1,0.0347,83.247,0.106,"Opera","Adolphe Adam","Giselle: Act I - Overture","3QKJkzoRJ46tEZY8Rx2prq"],
        [12,0.901,0.287,526000,0.019,0.495,2,0.0697,-28.636,1,0.0417,104.05,0.0902,"Opera","Adolphe Adam","Giselle: Act I: La chasse (The Hunt)","45otluXIST1gEUGyc0UFvb"],
        [17,0.961,0.368,323333,0.113,0.00538,3,0.0844,-18.277,0,0.0641,109.342,0.113,"Opera","Gaetano Donizetti","Lucrezia Borgia / Act 2: Era desso il figlio mio","5jGJVJJXu7Z32Y1y5bdGYZ"],
        [20,0.978,0.247,265760,0.153,0.0166,4,0.112,-19.111,1,0.0453,85.653,0.0366,"Opera","Alfredo Catalani","Catalani: La WallyAct 1: Ebben? ... Ne andrò lontana (La Wally)","6QClFHodi0bn270djdVbLk"],
        [7,0.911,0.135,182560,0.0332,0.872,0,0.108,-29.62,1,0.0467,66.043,0.1,"Opera","Philharmonia Orchestra","The Big Muddy","0E5uVSHoTaS58tO687lEbg"],
        [10,0.986,0.267,176000,0.26,0.108,1,0.104,-18.137,1,0.0796,66.384,0.189,"Opera","Gaetano Donizetti","Don Pasquale / Act 1: Bella siccome un angelo","5ChWvnR6dzHKgFP7R4yxuI"],
        [13,0.91,0.327,86893,0.0161,0.00926,7,0.167,-36.409,1,0.0415,134.98,0.075,"Opera","Adolphe Adam","Giselle: No. 3 - Allegro non troppo","5z0Coo00PbJ1u8iWuleUCS"],
        [19,0.918,0.28,228680,0.294,0.0017,1,0.0888,-14.753,1,0.0322,94.522,0.502,"Opera","José Carreras","The Impossible Dream - From The Man of La Mancha","6kiEh1xj80odDVe7Sq9QNY"],
        [8,0.923,0.312,71053,0.038,0.684,2,0.0796,-28.851,1,0.0456,85.316,0.284,"Opera","Philharmonia Orchestra","Chronicles Of Narnia - Mr.tumnus' Tune","1JB5RWmmhapi4uKy0MCNwM"],
        [22,0.987,0.274,273387,0.0984,0.000717,1,0.0854,-17.253,1,0.0421,84.002,0.0783,"Opera","Anna Netrebko","Madama Butterfly / Act 2: Un bel dì vedremo","2xnxEkKnKgoYbHiJa2xuVV"],
        [14,0.926,0.446,98200,0.0157,0.00157,8,0.0789,-25.392,1,0.0343,141.769,0.0897,"Opera","Adolphe Adam","Giselle: No. 4a - Allegro un peu Loure","4pReYHhvSHexcJ1VimVlhL"],
        [21,0.986,0.309,225733,0.157,0.00185,3,0.377,-13.388,1,0.0446,80.107,0.265,"Opera","Mario del Monaco","Cavalleria rusticana: Mammaquel vino generoso","5Oy8X1jUJgQy34F5aBvCo9"],
        [19,0.97,0.163,354613,0.0376,0.507,5,0.096,-22.158,0,0.0489,76.299,0.0425,"Opera","Gaetano Donizetti","La Fille du RégimentAct IScene 11: Air de Marie Il faut partir (Arr. for Piano & Viola)","6Zvqn2oCtHQWNj1xyWSIP5"]
];
const fs = require('fs');
fs.writeFile("test", matrix, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});