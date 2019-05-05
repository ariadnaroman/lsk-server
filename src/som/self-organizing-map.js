/**
 * Training function for the Self Organizing Map
 * @param inputPatterns: the input dataset; list of objects with a specified number of attributes
 * @param domain: the domain of the attributes; list of pairs [min,max], each pair corresponding to an attribute
 * @param iterMax: maximum number of iterations for the training
 * @param learnInitRate: initial value for learning rate
 * @param learningPercentage: value for learning percentage
 * @param neighbourhoodInitSize: initial value for the radius of the neighbourhood (number of units)
 * @param gridWidth: width value for the grid of the SOM
 * @param gridHeight: height value for the grid of the SOM
 * @param gridType: type of grid for SOM ('rectangular' or 'hexagonal')
 * @returns {Array} The function returns the codebook vectors, more exactly the Self Organizing Map: list of codebook vectors,
 * each codebook vector is an object of type  {coordinates: {x: integer, y: integer}, vector: list of values
 * for each attribute of the input pattern.
 */
function train(inputPatterns, domain, iterMax, learnInitRate, neighbourhoodInitSize, gridWidth, gridHeight, gridType) {
    let currentLearningRate = learnInitRate;
    let codebookVectors = initializeCodebookVectors(gridWidth, gridHeight, domain);
    // console.log(codebookVectors);
    for (let i = 1; i <= iterMax; i++) {
        // console.log("ITERATION ", i)
        const neighbourhoodSize = Math.round(calculateNeighbourhoodSize(i, iterMax, neighbourhoodInitSize));
        // console.log(neighbourhoodSize, "neighbourhoodsize");
        currentLearningRate = calculateLearningRate(learnInitRate, 0.9, i);
        // console.log(currentLearningRate, "currentLearningRate");
        const pattern = selectInputPattern(i, inputPatterns);
        const bmu = selectBestMatchingUnit(pattern, codebookVectors);
        let neighbourhood = [bmu];
        let neighbours = selectNeighbours(bmu, codebookVectors, gridType, neighbourhoodSize);
        neighbourhood.push(neighbours);
        for (let vector of neighbourhood) {
            for (let idx in vector['vector']) {
                vector['vector'][idx] = vector['vector'][idx] + currentLearningRate * (pattern[idx] - vector['vector'][idx]);
            }
        }
    }
    return codebookVectors;
}

/**
 * The function initializes the codebook vectors of the SOM with random values within the domain.
 * @param gridWidth: the width of the grid
 * @param gridHeight: the height of the grid
 * @param domain: the domain of the attributes; list of pairs [min,max], each pair corresponding to an attribute
 * @returns {Array} The function returns the codebook vectors initialized.
 */
function initializeCodebookVectors(gridWidth, gridHeight, domain) {
    let codebookVectors = [];
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            let codebookVector = {};
            codebookVector.coordinates = {x: i, y: j};
            codebookVector.vector = randomVector(domain);
            codebookVectors.push(codebookVector);
        }
    }
    return codebookVectors;
}

/**
 *  The function calculates the neighbourhood radius of the current iteration, based on the maximum number of iterations and the initial value of the neighbourhood size
 * @param iteration: the number of the step in the training
 * @param iterMax: the total number of steps in the training
 * @param neighbourhoodInitSize: initial value for the radius of the neighbourhood (number of units)
 * @returns {number} the value of the neighbourhood size
 */
function calculateNeighbourhoodSize(iteration, iterMax, neighbourhoodInitSize) {
    return neighbourhoodInitSize * (1.0 - (iteration / iterMax))
}

/**
 *  The function calculates the learning rate of the corresponding iteration, based on the learning percentage and the initial value of the learning rate
 * @param iteration: the number of the step in the training
 * @param learnInitRate: initial value for learning rate
 * @param learningPercentage: value for learning percentage
 * @returns {number} the value of the learning rate
 */
function calculateLearningRate(learnInitRate, learningPercentage, i) {
    return learnInitRate*Math.pow(i,Math.log2(learningPercentage));
}

function selectInputPattern(iteration, inputPatterns) {
    return inputPatterns[iteration % inputPatterns.length];
}

/**
 * The function selects the BMU of the codebook vectors for the given input pattern
 * @param pattern: the input dataset; list of objects with a specified number of attributes
 * @param codebookVectors: the codebook vectors of the Self Organizing Map grid
 * @returns the closest (in terms of euclidean distance) codebook vector to the input pattern
 */
function selectBestMatchingUnit(pattern, codebookVectors) {
    let bmu = null;
    let bmuDistance = null;
    console.log(pattern,"pattern");
    for (let codebookVector of codebookVectors) {
        let distance = euclidean_distance(codebookVector.vector, pattern);
        // console.log(distance,"distance");
        bmu = bmu === null || bmuDistance > distance ? codebookVector : bmu;
        bmuDistance = bmuDistance === null || bmuDistance > distance ? distance : bmuDistance;
    }
    console.log(bmu, "BMU");
    return bmu;
}

/**
 * The function calculates the euclidean distance between two vectors of the same length.
 * @param vector1: array of attributes
 * @param vector2: array of attributes
 * @returns number euclidean distance between the two vectors
 */
function euclidean_distance(vector1, vector2) {
    let sum = 0.0;
    for (let attribute in vector1) {
        sum += Math.pow(vector1[attribute] - vector2[attribute], 2);
    }
    return Math.sqrt(sum);
}

/**
 * The function computes the indexes of the neurons that belong to the neighbourhood of the given neuron.
 * @param x: Coordinate x of the neuron on the map
 * @param y: Coordinate y of the neuron on the map
 * @param neighbourhoodSize: the radius (measured in units) of the neighbourhood
 * @returns {Array} the list of objects {x, y} which contain the coordinates of the neurons of the neighbourhood
 */
function getHexagonIndexes(x, y, neighbourhoodSize) {
    let results = [];
    for (let i = x - neighbourhoodSize; i <= x + neighbourhoodSize; i++) {
        let start;
        let end;
        let dif = Math.abs(x - i);
        if (dif % 2 === 0) {
            start = y - neighbourhoodSize + dif / 2;
            end = y + neighbourhoodSize - dif / 2;
        } else {
            start = y - neighbourhoodSize + Math.floor(dif / 2);
            end = y + neighbourhoodSize - Math.floor(dif / 2) - 1;
        }
        for (let j = start; j <= end; j++) {
            results.push({x: i, y: j});
        }
    }
    return results;
}

/**
 * The function calculates the indexes of the neighbours of the BMU, based on the grid type and the neighbourhood size
 * @param bmu: the neuron for which the neighbourhood is computed
 * @param codebookVectors: the codebook vectors of the Self Organizing Map
 * @param gridType: type of grid for SOM ('rectangular' or 'hexagonal')
 * @param neighbourhoodSize: the radius (measured in units) of the neighbourhood
 */
function selectNeighbours(bmu, codebookVectors, gridType, neighbourhoodSize) {
    let neighbours = [];
    let x = bmu.coordinates.x;
    let y = bmu.coordinates.y;
    let xMin = x - neighbourhoodSize;
    let xMax = x + neighbourhoodSize;
    let yMin = y - neighbourhoodSize;
    let yMax = y + neighbourhoodSize;

    if (gridType === 'hexagonal') {
        let hexagonIndexes = getHexagonIndexes(x, y, neighbourhoodSize);
        let found = codebookVectors.find((element) => {
            let found2 = hexagonIndexes.find((element2) => {
                return element2.x === element.x && element2.y === element.y;
            });
            return found2 !== undefined;
        });
        if (found) neighbours.push(...found);
    } else {
        for (let codebookVector of codebookVectors) {
            if ((codebookVector.coordinates.x > xMin
                    && codebookVector.coordinates.x < xMax)
                || (codebookVector.coordinates.y > yMin
                    && codebookVector.coordinates.y < yMax)) {
                neighbours.push(codebookVector)
            }
        }
    }
    return neighbours;
}

function randomVector(domain) {
    let vector = [];
    for (let attribute in domain) {
        vector[attribute] = domain[attribute][0] + (domain[attribute][1] - domain[attribute][0]) * Math.random();
        if (domain[attribute][2] === 'integer') {
            vector[attribute] = Math.round(vector[attribute]);
        }
    }
    return vector;
}

function testNetwork() {
//     let inputPatterns = [
//         [0.62, 0.703, 2, -7.854, 1, 0.0836, 0.479, 0, 0.14, 0.559, 136.155, '00IrSynHsun7DpDrLkRIjM', 'Paul Simon', 'The Boy In the Bubble'],
//         [0.251, 0.781, 11, -12.834, 1, 0.0639, 0.00501, 0.59, 0.123, 0.215, 148.455, '00IW5PAKECNYdCfzseVJgM', 'King Diamond', 'The 7th Day of July 1777'],
//         [0.357, 0.653, 9, -5.554, 1, 0.0654, 0.0828, 0, 0.0844, 0.522, 176.647, '00qOE7OjRl0BpYiCiweZB2', 'Foreigner', 'Juke Box Hero'],
//         [0.235, 0.977, 6, 0.878, 1, 0.107, 0.00353, 0.00604, 0.172, 0.241, 152.952, '00sydAz6PeOxYzwG1dRIPi', 'The Stooges', 'Search and Destroy - Iggy Pop Mix'],
//         [0.142, 0.657, 1, -5.767, 1, 0.0423, 0.039, 0, 0.319, 0.0377, 179.119, '00SzIFHBVTpRonBTHnHuok', 'Chris Cornell', 'When Bad Does Good'],
//         [0.737, 0.658, 2, -9.176, 0, 0.263, 0.0445, 0.0000119, 0.0469, 0.901, 141.553, '017MqJmYtXUqURJJZZOYv3', 'The Police', 'Cant Stand Losing You'],
//         [0.517, 0.736, 4, -5.175, 0, 0.116, 0.0401, 0.0000659, 0.109, 0.447, 142.064, '01bMpqmvH031R417l3AQTA', 'Jack White', 'Another Way to Die'],
//         [0.324, 0.714, 4, -6.338, 1, 0.0453, 0.37, 0, 0.724, 0.296, 133.906, '01Mi9xc3nOoxuJWSptf7LY', 'Joe Cocker', 'We Are The World'],
//         [0.295, 0.995, 1, -4.423, 0, 0.2, 0.00052, 0.36, 0.127, 0.0376, 110.25, '01Mpj13vURSO3cCLprPt5T', 'Slayer', 'Raining Blood'],
//         [0.452, 0.955, 4, -6.517, 0, 0.0637, 0.000293, 0.000198, 0.175, 0.537, 94.717, '01MqEw2Y7knaImpcrTqlBH', 'Iron Maiden', '2 Minutes To Midnight - 1998 Remastered Version'],
//         [0.448, 0.767, 4, -6.391, 1, 0.0315, 0.0212, 0.0000257, 0.234, 0.254, 106.365, '01mWPCa4StT9u5gGBBdmWW', 'Mr. Big', 'Green-Tinted Sixties Mind - 2010 Remastered Version'],
//         [0.409, 0.766, 9, -8.028, 0, 0.0565, 0.000144, 0.361, 0.269, 0.783, 122.692, '01qNIJfMc14nxpOoM0Xwb0', 'Robin Trower', 'The Fool and Me - 2007 Remaster'],
//         [0.517, 0.582, 4, -6.055, 0, 0.0305, 0.345, 0.00132, 0.0871, 0.402, 138.793, '01U7AowXWVSzZ8K3LxAeED', 'Seals and Crofts', 'Diamond Girl'],
//         [0.501, 0.474, 5, -10.041, 1, 0.0386, 0.611, 0.0298, 0.0667, 0.35, 88.609, '01UYpHuzHi4eB9PAbDoPY2', 'Seals and Crofts', 'Summer Breeze'],
//         [0.282, 0.932, 9, -4.701, 1, 0.0387, 0.12, 0.0335, 0.0692, 0.536, 190.08, '01wsKcJ8ptqUmatpJlEGYj', 'Arcade Fire', 'Ready to Start'],
//         [0.395, 0.695, 6, -10.165, 0, 0.0491, 0.000453, 0.00301, 0.0754, 0.594, 158.676, '01X4vM5W2LBiBWRSY1O7TF', 'White Zombie', 'Soul-Crusher'],
//         [0.393, 0.78, 7, -4.771, 1, 0.0317, 0.00966, 0.0000137, 0.105, 0.204, 141.772, '01z3wyn02forxUQHEDAa0R', 'Creed', 'Whats This Life For'],
//         [0.498, 0.765, 9, -12.018, 1, 0.0505, 0.00535, 0.333, 0.417, 0.902, 174.637, '026VkpZ1VugOyUcbwnb5z1', 'James Gang', 'Cruisin Down The Highway'],
//         [0.259, 0.976, 2, -12.509, 1, 0.0708, 0.0000979, 0.546, 0.245, 0.132, 192.15, '0281QXjWBN307DR1nk03uk', 'Rose Tattoo', 'Astra Wally'],
//         [0.453, 0.213, 4, -13.656, 1, 0.0279, 0.554, 0.00000368, 0.0506, 0.0955, 64.177, '02gV5Zc9ctbZxD1uTNIok5', 'Harry Nilsson', 'Without You - Remastered'],
//         [0.535, 0.424, 9, -7.491, 1, 0.0314, 0.626, 0, 0.191, 0.539, 97.506, '02KpkaZbiutsR0ucxce4Sh', 'The Zombies', 'This Will Be Our Year'],
//         [0.395, 0.708, 5, -6.454, 1, 0.042, 0.275, 0.167, 0.105, 0.128, 135.909, '02PGQIhVMJMKwwPSe3ldHk', 'Coverdale/Page', 'Dont Leave Me This Way'],
//         [0.622, 0.964, 1, -4.314, 1, 0.0832, 0.0636, 0.0000103, 0.235, 0.609, 92.973, '03gsb1WnVQUuLqChBvzmoo', 'Everclear', 'AM Radio'],
//         [0.251, 0.976, 7, -10.412, 1, 0.084, 0.000291, 0.000563, 0.603, 0.0892, 172.294, '03MdJTsNPqVeh0N0aum2Kr', 'Dinosaur Jr.', 'The Wagon'],
//         [0.47, 0.644, 5, -5.93, 1, 0.039, 0.07, 0, 0.113, 0.569, 190.836, '03PaRiAykVfdMFoIU5oegN', 'Maximo Park', 'Books From Boxes (Radio Edit)'],
//         [0.485, 0.38, 3, -11.773, 1, 0.034, 0.829, 0, 0.103, 0.531, 92.933, '03VXrViYqJpdhuBEV0p0ak', 'Simon & Garfunkel', 'Homeward Bound'],
//         [0.384, 0.473, 6, -10.057, 0, 0.169, 0.134, 0.00446, 0.71, 0.694, 174.301, '03YnQeX4a6RLuGszur9Pgg', 'Big Brother & The Holding Company', 'Ball and Chain'],
//         [0.408, 0.612, 7, -8.98, 1, 0.0341, 0.0503, 0.00012, 0.387, 0.749, 112.579, '03YzZMXKGULPvZHFTXo104', 'Rainbow', 'Stone Cold'],
//         [0.675, 0.549, 9, -13.02, 1, 0.0335, 0.105, 0.0000718, 0.0533, 0.965, 134.771, '042v1NacbKJzCyi6nBme7T', 'Buffalo Springfield', 'Mr. Soul'],
//         [0.518, 0.738, 7, -5.615, 1, 0.0294, 0.0133, 0.0475, 0.101, 0.47, 110.456, '04b0B7xYiBljBRCG6bgllt', 'James', 'Shes A Star'],
//         [0.319, 0.309, 9, -11.944, 0, 0.0257, 0.822, 0.00000226, 0.0893, 0.339, 143.075, '04e1VQ69ll2TR5Jp8F2n5B', 'Nick Cave & The Bad Seeds', 'Henry Lee (feat. PJ Harvey) - 2011 Remastered Version'],
//         [0.284, 0.92, 3, -6.988, 0, 0.101, 0.00499, 0.00000745, 0.854, 0.524, 161.753, '04jt8ltrZY0Dh9nGwBazYH', 'Motörhead', 'Damage Case'],
//         [0.481, 0.88, 4, -4.55, 1, 0.0717, 0.00465, 0.0000602, 0.204, 0.289, 95.023, '04NGX0b5Tgs7VsErfn5OA1', 'Chevelle', 'Vitamin R (Leading Us Along)'],
//         [0.677, 0.743, 6, -5.876, 1, 0.0611, 0.0135, 0.00222, 0.0581, 0.469, 127.971, '04RcDL1mbjcVLMLqBOjkeX', 'The Kills', 'Future Starts Slow'],
//         [0.578, 0.786, 7, -6.549, 1, 0.0314, 0.0953, 0.00303, 0.0683, 0.697, 96.326, '04SU9LZQel0dTMjJJtBmkK', 'Yusuf / Cat Stevens', 'The First Cut Is The Deepest'],
//         [0.515, 0.912, 4, -8.547, 1, 0.0693, 0.00614, 0.177, 0.157, 0.596, 107.131, '04YoKLr1ys5pwz3YfFI0U5', 'George Thorogood & The Destroyers', 'Who Do You Love'],
//         [0.363, 0.713, 11, -7.418, 1, 0.0387, 0.00533, 0.0000062, 0.12, 0.716, 171.885, '056MbLQC2tKWakXhs4T2Ac', 'Saxon', 'Denim and Leather'],
//         [0.48, 0.613, 0, -10.787, 1, 0.321, 0.211, 0, 0.942, 0.598, 107.992, '05GTtG1ckPWfGOC0mHGJ0V', 'The J. Geils Band', 'Musta Got Lost - Live'],
//         [0.275, 0.528, 2, -11.084, 1, 0.0384, 0.187, 0.236, 0.116, 0.442, 164.905, '05l9N6SnERhSdH8XQR5TjK', 'Pavement', 'Spit on a Stranger'],
//         [0.498, 0.782, 7, -6.213, 1, 0.0329, 0.000223, 0.0117, 0.365, 0.189, 94.105, '05NCQz6oqduUipGoWjpncI', 'Filter', 'Where Do We Go From Here'],
//         [0.599, 0.79, 4, -3.58, 1, 0.043, 0.00257, 0.00181, 0.312, 0.961, 103.783, '05NYcsjJwOYq4jIiKPVj9p', 'The Black Crowes', 'Hard To Handle'],
//         [0.723, 0.49, 9, -14.745, 0, 0.0296, 0.111, 0.0946, 0.0923, 0.795, 129.012, '05oETzWbd4SI33qK2gbJfR', 'Fleetwood Mac', 'Rhiannon'],
//         [0.322, 0.265, 2, -13.398, 1, 0.0302, 0.0726, 0.34, 0.366, 0.207, 133.577, '05uGBKRCuePsf43Hfm0JwX', 'Pink Floyd', 'Brain Damage'],
//         [0.647, 0.776, 2, -8.924, 1, 0.066, 0.000646, 0.732, 0.0847, 0.959, 145.77, '05Yv5shaMJ0SZ0HTKmrEYl', 'Harry Nilsson', 'Jump into the Fire - Remastered'],
//         [0.315, 0.895, 2, -4.519, 1, 0.0924, 0.00216, 0.0000132, 0.0596, 0.432, 79.628, '069YqoVkrwNxnfWWj7k3Qk', 'Queensrÿche', 'Empire - Remastered/2003'],
//         [0.185, 0.995, 7, -3.362, 1, 0.139, 0.000135, 0.852, 0.133, 0.0556, 184.959, '06aCtrrExI18NgNwodjnql', 'Airbourne', 'Ready To Rock'],
//         [0.597, 0.554, 1, -3.771, 0, 0.0245, 0.0756, 0.0000203, 0.229, 0.693, 95.312, '06aMDKw1zNra92edkj2QrY', 'Razorlight', 'Golden Touch - Full Length'],
//         [0.673, 0.526, 2, -15.157, 0, 0.0527, 0.0391, 0.00313, 0.0443, 0.851, 90.67, '06dAFXkgM2OGAkGS3CxpEm', 'Pat Benatar', 'Love Is A Battlefield'],
//         [0.45, 0.731, 2, -11.959, 0, 0.0375, 0.0672, 0.0000843, 0.2, 0.782, 136.086, '06INDOpPQobI3WKdPVtugQ', 'Blackfoot', 'Teenage Idol'],
//         [0.502, 0.591, 7, -4.522, 1, 0.0242, 0.00585, 0.000019, 0.0725, 0.169, 81.782, '06iQLLK93Dlv7RcvzmZo2g', 'Third Eye Blind', 'Deep Inside of You - 2008 Version'],
//         [0.565, 0.849, 4, -5.313, 0, 0.0926, 0.000243, 0.00289, 0.0631, 0.758, 123.768, '06k5ZWQoJ44zNYlb49zBjc', 'Jack White', 'Over and Over and Over'],
//         [0.53, 0.864, 4, -3.323, 0, 0.0557, 0.0978, 0.00000312, 0.153, 0.85, 153.314, '06Qha323s06okpZ4LmMX7P', 'Franz Ferdinand', 'Love Illumination'],
//         [0.789, 0.501, 7, -9.064, 1, 0.0342, 0.761, 0, 0.181, 0.945, 120.214, '06YcuDoEZvMcxgzvtzJTz4', 'The Lovin Spoonful', 'Did You Ever Have to Make up Your Mind?'],
//         [0.586, 0.776, 8, -9.59, 1, 0.0525, 0.0611, 0.0577, 0.28, 0.776, 80.049, '076QGYUfb6olEKWsyBLXju', 'Stephen Stills', 'Song Of Love'],
//         [0.586, 0.782, 11, -10.052, 0, 0.235, 0.0142, 0.00102, 0.0673, 0.754, 80.753, '07AjyDeE85pDr4Dj8BzgWB', 'Jack White', 'Im Shakin'],
//         [0.419, 0.889, 8, -6.476, 0, 0.0485, 0.00259, 0.061, 0.0544, 0.468, 140.887, '07bez2zJyzKtokrozY6e6H', 'Yngwie Malmsteen', 'Seventh Sign'],
//         [0.541, 0.83, 9, -6.246, 1, 0.0316, 0.109, 0.701, 0.167, 0.711, 142.592, '07CyrZF9eVd02zzIse7tZA', 'The Cure', 'In Between Days - Remastered'],
//         [0.461, 0.168, 11, -16.225, 0, 0.042, 0.449, 0.886, 0.267, 0.309, 169.675, '07HF5tFmwh6ahN93JC6LmE', 'Kyuss', 'Space Cadet'],
//         [0.335, 0.716, 7, -7.02, 1, 0.0404, 0.0347, 0, 0.107, 0.303, 121.761, '07jUylEMp4LBOWZagde8tF', 'Stone Temple Pilots', 'Big Empty'],
//         [0.474, 0.508, 6, -6.845, 0, 0.0235, 0.316, 0, 0.166, 0.358, 77.31, '082KyGrUIooHcyyElugozU', 'Nazareth', 'Where Are You Now'],
//         [0.546, 0.852, 9, -5.726, 1, 0.0732, 0.198, 0.0000686, 0.207, 0.588, 122.764, '083EtVMSQFh38gIaisRD8j', 'Coverdale/Page', 'Shake My Tree'],
//         [0.691, 0.631, 2, -6.478, 1, 0.0368, 0.0483, 0.0000113, 0.104, 0.8, 92.004, '086myS9r57YsLbJpU0TgK9', 'Arctic Monkeys', 'Whyd You Only Call Me When Youre High?'],
//         [0.65, 0.866, 11, -3.713, 1, 0.0343, 0.0457, 0, 0.0682, 0.717, 115.001, '08JTB5hpXPCVPGJzic8E9e', 'The Wombats', 'Bee-Sting'],
//         [0.566, 0.521, 7, -11.824, 1, 0.0321, 0.514, 0.000288, 0.116, 0.468, 129.167, '08JVaI77aIffN0wNjTOG4b', 'Bad Company', 'Ready For Love - 2015 Remastered Version'],
//         [0.31, 0.7, 9, -5.678, 1, 0.047, 0.011, 0.00965, 0.0828, 0.763, 188.386, '08mG3Y1vljYA6bvDt4Wqkj', 'AC/DC', 'Back In Black'],
//         [0.855, 0.803, 4, -5.849, 0, 0.0316, 0.342, 0.00732, 0.0841, 0.962, 114.867, '08onVqQ8YicJ98Ycm1qoLf', 'Foreigner', 'Urgent'],
//         [0.199, 0.144, 7, -17.358, 1, 0.0339, 0.931, 0.879, 0.0394, 0.122, 73.047, '08QGWV2nWYOG60RMsVbMwA', 'David Gilmour', '5 A.M.'],
//         [0.401, 0.853, 4, -5.32, 0, 0.0589, 0.00626, 0.224, 0.334, 0.377, 138.024, '08QMa0YdlIYRY9peDOVCLe', 'The Raconteurs', 'Broken Boy Soldier'],
//         [0.604, 0.691, 7, -5.82, 1, 0.0597, 0.00195, 0.128, 0.113, 0.554, 81.492, '091QeYor0DTf2kdhkKk3xk', 'Miles Kane', 'Loaded'],
//         [0.269, 0.971, 7, -4.973, 1, 0.0931, 0.0055, 0.0353, 0.867, 0.275, 92.059, '092vsu0CMRtQCQeWCqGLBQ', 'Heaven & Hell', 'Neon Knights - Live'],
//         [0.217, 0.879, 10, -4.559, 1, 0.0803, 0.0000742, 0.11, 0.36, 0.517, 179.516, '09bhAUgGbKtw9NpIdnlIYZ', 'Them Crooked Vultures', 'Elephants'],
//         [0.448, 0.796, 2, -7.896, 1, 0.0283, 0.000274, 0.443, 0.171, 0.565, 97.178, '09hctAvAEUpm7MKl1RBK2j', 'Melvins', 'Revolve'],
//         [0.602, 0.353, 1, -12.587, 1, 0.0354, 0.781, 0, 0.175, 0.68, 156.921, '09jDQcg0LkTWH9NEVtYB43', 'The Mamas & The Papas', 'Snowqueen Of Texas'],
//         [0.506, 0.913, 3, -5.301, 1, 0.0512, 0.138, 0.000867, 0.135, 0.895, 151.182, '09JxX9P3dqSl0I3lDGrTie', 'The Presidents Of The United States Of America', 'Volcano'],
//         [0.576, 0.564, 8, -9.008, 0, 0.0456, 0.232, 0.00145, 0.0607, 0.449, 103.373, '09mVJXDiFRBynercNUPy7z', 'Robin Trower', 'Im out to Get You'],
//         [0.424, 0.632, 9, -7.243, 1, 0.0922, 0.021, 0.0117, 0.0545, 0.356, 97.694, '09QZAEmdbq28OaNyqTOEvY', 'The White Stripes', 'Icky Thump'],
//         [0.527, 0.766, 9, -5.217, 1, 0.0367, 0.0000681, 0.00541, 0.117, 0.341, 117.988, '09v3dFgd3YwrD0U5gkNaTg', 'White Lies', 'Farewell To The Fairground'],
//         [0.582, 0.635, 7, -12.794, 0, 0.0288, 0.0908, 0.411, 0.0579, 0.795, 90.689, '09WwqFDqX2zv8rlvf4xYAk', 'Primus', 'American Life'],
//         [0.531, 0.818, 1, -11.217, 0, 0.0957, 0.0772, 0.00132, 0.0464, 0.579, 133.838, '09xbhnZy04ek1kpq3SgHYi', 'Thin Lizzy', 'Rosalie'],
//         [0.385, 0.656, 11, -7.958, 0, 0.0387, 0.0114, 0, 0.067, 0.279, 135.662, '09XrY8NwLcYAxUWzNDrDX2', 'Mother Love Bone', 'Bloodshot Ruby'],
//         [0.608, 0.988, 0, -3.125, 1, 0.0579, 0.0000778, 0.00725, 0.06, 0.723, 100.176, '0a0W4xVPPoSNDrnQ3BsE7l', 'Metal Church', 'By the Numbers'],
//         [0.425, 0.666, 2, -6.835, 1, 0.177, 0.358, 0.000445, 0.135, 0.469, 182.541, '0A3JTAIflJc9Z7nbOVYlAh', 'Jack White', 'Connected By Love'],
//         [0.761, 0.63, 6, -6.68, 1, 0.041, 0.009, 0.00598, 0.0873, 0.663, 123.096, '0a70Tloqeldzv0Hp9CvgeT', 'The Vines', 'Leave Me Alone'],
//         [0.329, 0.974, 5, -3.009, 1, 0.0897, 0.000282, 0.000932, 0.767, 0.41, 152.123, '0a8pD243dhPtQkWvpAQpt7', 'The Darkness', 'Get Your Hands Off My Woman'],
//         [0.459, 0.871, 8, -5.093, 1, 0.0552, 0.0000974, 0.00193, 0.0292, 0.723, 170.108, '0acMrTpEeFnaH74f1Ueg2g', 'Black Stone Cherry', 'Cheaper To Drink Alone'],
//         [0.621, 0.341, 9, -11.447, 1, 0.049, 0.102, 0.0000778, 0.0652, 0.578, 98.554, '0aD8W0ChzDgEKpB1zsJ8zv', 'Tommy James & The Shondells', 'Crystal Blue Persuasion'],
//         [0.272, 0.281, 1, -7.634, 1, 0.0287, 0.388, 0.0000229, 0.158, 0.141, 89.914, '0AfIsqZ4gTUg9CwwW2jLeK', 'Stone Sour', 'Bother'],
//         [0.359, 0.992, 7, -3.229, 1, 0.0625, 0.0242, 0.00712, 0.0702, 0.95, 165.22, '0aiDlPZLQ0eGIA83Q4WqvY', 'The Hives', 'Two-Timing Touch and Broken Bones'],
//         [0.721, 0.805, 11, -5.049, 0, 0.0473, 0.0193, 0.000107, 0.342, 0.711, 120.009, '0AJhcuRl3i1FfPNr88ZScv', 'Kasabian', 'Youre in Love with a Psycho'],
//         [0.339, 0.772, 2, -6.958, 1, 0.0372, 0.0000449, 0.426, 0.0766, 0.515, 114.744, '0AKzN2r2bqEAzxYZFklLEw', 'Pavement', 'Frontwards (Remastered)'],
//         [0.643, 0.803, 1, -5.025, 1, 0.0434, 0.143, 0, 0.129, 0.654, 108.032, '0AOOAgfK0ICeYLXvzgauQe', 'The Wombats', 'Turn - ayokay Remix'],
//         [0.784, 0.459, 0, -10.446, 1, 0.0304, 0.763, 0.00000128, 0.0684, 0.931, 106.957, '0APt4t1Dab58sYmGQ4jgij', 'Carole King', 'Where You Lead'],
//         [0.48, 0.828, 1, -13.317, 1, 0.0601, 0.0921, 0.00229, 0.831, 0.212, 105.554, '0ASlBt3KdsnokRI137AbUl', 'Venom', 'In League with Satan - 7 Version'],
//         [0.523, 0.984, 11, -3.695, 0, 0.116, 0.0000186, 0.0175, 0.0553, 0.324, 120.004, '0AyDd6zoOYCIcXKauYzquH', 'Accept', 'Beat The Bastards'],
//         [0.386, 0.607, 10, -7.7, 1, 0.0261, 0.0112, 0.0000138, 0.088, 0.532, 147.207, '0aym2LBJBk9DAYuHHutrIl', 'The Beatles', 'Hey Jude - Remastered 2015'],
//         [0.552, 0.789, 9, -5.449, 1, 0.0242, 0.122, 0.00000498, 0.0874, 0.349, 93.938, '0aYzQjr1hq0qJwp45diy5M', 'Snow Patrol', 'Heal Me'],
//         [0.583, 0.833, 0, -8.29, 1, 0.0343, 0.0531, 0.0000557, 0.16, 0.81, 119.884, '0B1zVsLqmV9ibIFdNS5tGs', 'Todd Rundgren', 'I Saw the Light'],
//         [0.511, 0.786, 1, -6.284, 1, 0.0511, 0.00331, 0.812, 0.109, 0.675, 147.693, '0B6lYniEIc0TucsFBqCSWL', 'Pat Travers', 'Green Eyed Lady'],
//         [0.604, 0.68, 7, -8.642, 1, 0.0256, 0.145, 0, 0.346, 0.823, 95.703, '0b889dNiVBOUvnURFb9rcx', 'The Grass Roots', 'Dont Pull Your Love Out On Me Baby'],
//         [0.669, 0.703, 4, -5.789, 0, 0.0299, 0.06, 0.00147, 0.0623, 0.436, 109.48, '0b8eSsBka9epA2J0wnPMax', 'Glenn Frey', 'You Belong To The City'],
//         [0.756, 0.532, 9, -5.096, 1, 0.0764, 0.0948, 0.00000893, 0.111, 0.571, 172.096, '00762tXbSj2w2bQMVydJZn', 'RZA', 'Grits'],
//         [0.782, 0.562, 4, -13.24, 0, 0.267, 0.01, 0.0000533, 0.0864, 0.472, 102.789, '00afurcnhmX6AktJ19JIIt', 'Kris Kross', 'Lil Boys In Da Hood'],
//         [0.384, 0.909, 10, -4.26, 0, 0.524, 0.181, 0, 0.223, 0.542, 166.877, '00ANnYctEGGhcmOJ5omaj8', 'The Lox', 'Heaven or Hell'],
//         [0.687, 0.921, 7, -3.646, 1, 0.271, 0.0179, 0, 0.267, 0.349, 89.125, '00blYtuM22dQpn693F2BlC', 'Geto Boys', 'Still - Mixtape Version'],
//         [0.73, 0.934, 0, -3.724, 1, 0.0401, 0.0243, 0, 0.791, 0.865, 101.901, '00kjEDU91GM0bZ8uth5AUN', 'Paris', 'Guerrilla Funk'],
//         [0.557, 0.578, 8, -10.536, 0, 0.408, 0.0451, 0.000095, 0.356, 0.837, 205.368, '00lvlFUXcc2eeYknzUsHTF', 'FU-Schnickens', 'Sneakin Up On Ya'],
//         [0.9, 0.92, 7, -4.391, 1, 0.238, 0.0971, 0, 0.264, 0.424, 98.228, '00poNvWkHvFm5cmi3UhHwu', 'Stetsasonic', 'Just Say Stet'],
//         [0.29, 0.869, 9, -5.532, 1, 0.35, 0.0163, 0, 0.176, 0.606, 175.651, '012WsHQ7TZQ65yQCJZlQQ9', 'Fashawn', 'Something To Believe In'],
//         [0.796, 0.701, 7, -10.857, 1, 0.316, 0.178, 0.000238, 0.157, 0.475, 102.079, '01CuCSqlNItevX7F1GcopF', 'EPMD', 'So Wat Cha Sayin'],
//         [0.682, 0.717, 1, -3.682, 1, 0.246, 0.385, 0, 0.152, 0.507, 90.147, '01wKeKPgYxdPYA8rfMveYc', 'Isaiah Rashad', 'Shot You Down (feat. Jay Rock & ScHoolboy Q)'],
//         [0.525, 0.746, 7, -5.81, 1, 0.219, 0.175, 0, 0.323, 0.755, 173.544, '01zffoSenvp9JnSbl0UgMa', 'Statik Selektah', 'Put Jewels on It'],
//         [0.349, 0.946, 9, -2.026, 1, 0.499, 0.114, 0, 0.0647, 0.284, 76.222, '021cFTy0KsH6Kg3pfEpjbN', 'Slaughterhouse', 'Rescue Me'],
//         [0.76, 0.725, 5, -5.066, 0, 0.196, 0.00339, 0, 0.326, 0.463, 139.988, '027VaoGFyLFC0H8oJC7KcX', 'Young Buck', 'Too Rich'],
//         [0.663, 0.606, 5, -7.552, 1, 0.203, 0.579, 0, 0.217, 0.613, 79.721, '02BDSCfu9jBYvJ8LkUVttD', 'UGK', 'Hi Life'],
//         [0.695, 0.638, 2, -7.891, 0, 0.0458, 0.343, 0, 0.635, 0.701, 118.106, '02D9uD9WQb834Lb54xCvDS', 'Jodeci', 'Love U 4 Life'],
//         [0.66, 0.869, 5, -5.917, 0, 0.265, 0.0985, 0, 0.187, 0.652, 95.625, '02dwHTP8NS3rOaOWhg8j7V', 'Mase', '24 Hrs. To Live (feat. The Lox  Black Rob & DMX)'],
//         [0.598, 0.661, 1, -9.269, 0, 0.428, 0.00996, 0, 0.603, 0.549, 177.89, '02nH7HXbs3i9kdWef9or8E', 'Lost Boyz', 'Jeeps  Lex Coups  Bimaz & Benz'],
//         [0.84, 0.736, 11, -4.37, 0, 0.111, 0.0342, 0, 0.0572, 0.657, 75.997, '02OBEsgNfL0u9AGDUOIsDU', 'Yelawolf', 'Row Your Boat'],
//         [0.749, 0.816, 7, -5.621, 1, 0.299, 0.0596, 0, 0.0738, 0.59, 90.009, '02rlDATSROFtjqmvs1dBKr', 'Obie Trice', 'Snitch'],
//         [0.772, 0.837, 2, -3.745, 1, 0.213, 0.0524, 0, 0.585, 0.27, 160.024, '02sObHgWwieFWa9zWIi6gF', 'Vince Staples', 'Relay'],
//         [0.738, 0.581, 6, -8.069, 1, 0.299, 0.0466, 0, 0.0665, 0.502, 85.375, '02YPpAQEmCfrHKJrMEILYR', 'Organized Konfusion', 'They Dont Want It'],
//         [0.556, 0.485, 4, -4.477, 0, 0.263, 0.301, 0, 0.104, 0.359, 99.235, '03ei3y4ilLVo2iZCap6gtp', 'Masta Ace', 'Beautiful'],
//         [0.789, 0.753, 1, -6.728, 0, 0.394, 0.0794, 0, 0.0801, 0.744, 109.776, '03NIra3KSLDgnqgIiQJNow', 'D12', 'Shit On You'],
//         [0.491, 0.73, 11, -7.598, 0, 0.261, 0.0329, 0, 0.211, 0.364, 72.557, '03RFGnV87A5WMnFBwUguK1', 'DJ Drama', 'We Must Be Heard (feat. Ludacris  Willie The Kid & Busta Rhymes)'],
//         [0.76, 0.595, 1, -6.366, 1, 0.0391, 0.00544, 0, 0.241, 0.361, 131.497, '03tqyYWC9Um2ZqU0ZN849H', 'Waka Flocka Flame', 'No Hands (feat. Roscoe Dash and Wale)'],
//         [0.71, 0.775, 8, -8.616, 0, 0.289, 0.00874, 0, 0.114, 0.679, 170.174, '04C86Dp2EpKVVXXguwCi8y', 'Brotha Lynch Hung', 'Locc 2 Da Brain'],
//         [0.567, 0.648, 2, -6.854, 0, 0.38, 0.243, 0, 0.0946, 0.607, 85.388, '04IjVJzwhNPVQhUVw9IB5h', 'WC', '187 (feat. WC)'],
//         [0.573, 0.8, 6, -5.874, 0, 0.369, 0.0214, 0, 0.0561, 0.961, 168.838, '04k0JBAUF9C16hNzU52kxj', 'Elzhi', 'Detroit State of Mind'],
//         [0.813, 0.88, 4, -4.877, 0, 0.157, 0.0405, 0, 0.058, 0.811, 91.564, '04MxwdGiy3Ad4i7Mo475jD', 'Whodini', 'One Love'],
//         [0.813, 0.757, 1, -5.358, 1, 0.356, 0.516, 0, 0.363, 0.646, 92.996, '04Rz403IY7QUqgfrTWX6OU', 'Big L', 'Da Graveyard'],
//         [0.45, 0.556, 9, -5.877, 1, 0.067, 0.119, 0, 0.117, 0.135, 143.358, '058gdiBln6OADguG08GOaU', 'Lloyd', 'Tru'],
//         [0.654, 0.609, 1, -4.218, 1, 0.112, 0.0242, 0, 0.232, 0.554, 118.691, '05cj8ljKlAUYi1hjhLsRlz', 'The-Dream', 'Summer Body'],
//         [0.847, 0.598, 7, -2.862, 0, 0.266, 0.106, 0, 0.185, 0.782, 92.245, '05hkWet4uSl4uL4wGheXKW', 'Blackstreet', 'Fix'],
//         [0.765, 0.596, 4, -9.194, 0, 0.253, 0.452, 0, 0.0797, 0.544, 87.016, '05IxLsMvahEWy4mDSHgYGY', 'Group Home', 'Serious Rap Shit'],
//         [0.61, 0.54, 7, -8.909, 1, 0.0397, 0.00572, 0.869, 0.206, 0.927, 91.447, '05OgiLzbz7ohy2rBsSAuBs', 'Black Milk', '4 Blacks'],
//         [0.585, 0.707, 4, -6.804, 0, 0.0988, 0.229, 0, 0.23, 0.116, 80.147, '05Sasb9Ob3Ejc8fLy9KS2m', 'Skyzoo', 'Nodding Off'],
//         [0.727, 0.493, 9, -7.862, 1, 0.309, 0.169, 0, 0.103, 0.223, 82.473, '05v6w9fcXfhRjdcV3MxHFG', 'D12', 'Girls'],
//         [0.647, 0.751, 10, -10.782, 0, 0.368, 0.0138, 0.00000625, 0.068, 0.718, 173.783, '05WdvsIv2e0Zf2cZHhESrS', 'Pete Rock & C.L. Smooth', 'The Basement'],
//         [0.75, 0.906, 0, -5.028, 1, 0.0477, 0.0174, 0, 0.0551, 0.562, 135.96, '069VGijrAsQVSY9ihFv1Px', 'Yelawolf', 'Best Friend'],
//         [0.867, 0.68, 1, -5.508, 0, 0.229, 0.0679, 0, 0.0935, 0.591, 101.652, '06EmqZJolHpHSwNKLHVmqB', '112', 'Dance With Me Remix (feat. Beanie Sigel)'],
//         [0.568, 0.682, 8, -5.781, 1, 0.0439, 0.256, 0, 0.231, 0.366, 92.99, '06G1SCVVYRSDCFGMSnDvpv', 'Brandy', 'Right Here (Departed)'],
//         [0.869, 0.572, 5, -6.955, 0, 0.19, 0.0121, 0, 0.133, 0.553, 133.793, '06GZKoIc7zwrJQCZQGyT0Y', 'Birdman', 'Presidential'],
//         [0.84, 0.571, 1, -6.83, 0, 0.189, 0.233, 0.00149, 0.269, 0.26, 92.095, '06jRQ306cBeQlfkKD8RQ1r', 'Blahzay Blahzay', 'Dont Let This Rap Shit Fool You'],
//         [0.693, 0.548, 1, -7.234, 0, 0.3, 0.0874, 0.0000178, 0.119, 0.279, 87.828, '06kMGyiybLptwh9hkmhsV5', 'Big Pun', 'Punish Me (feat. Miss Jones)'],
//         [0.399, 0.712, 1, -6.477, 1, 0.417, 0.000479, 0.00177, 0.415, 0.488, 85.357, '06N0bvWT2JDBsNUdDfDzV1', 'Sean Price', 'Imperius Rex'],
//         [0.821, 0.622, 4, -9.341, 0, 0.308, 0.0364, 0.000443, 0.0707, 0.531, 91.525, '06R5vlqFZBrQ7O1g7SewK6', 'Erick Sermon', 'Reign'],
//         [0.67, 0.616, 10, -6.123, 1, 0.225, 0.573, 0, 0.0535, 0.523, 120.129, '06ZDLodo1UDVavc3MXREZ3', 'Jagged Edge', 'Walked Outta Heaven'],
//         [0.753, 0.66, 5, -6.542, 1, 0.133, 0.161, 0, 0.236, 0.182, 95.003, '07FkzikE6FuHIa8Ma7zJGc', 'NF', 'Lie'],
//         [0.635, 0.512, 2, -9.749, 1, 0.0911, 0.175, 0.0703, 0.35, 0.489, 89.479, '07fOfgvqHTXEFXIMlmIlYr', 'O.C.', 'Times Up'],
//         [0.677, 0.524, 6, -10.873, 0, 0.0462, 0.00573, 0.086, 0.102, 0.265, 100.007, '07L2b1rNFcywc0coZYUzeV', 'Mos Def', 'I Against I'],
//         [0.689, 0.925, 1, -4.658, 1, 0.248, 0.102, 0.000022, 0.0862, 0.552, 98.192, '083NbPKjyzaXqtpTR8soAK', 'Juvenile', 'Sets Go Up (feat. Wacko)'],
//         [0.62, 0.897, 1, -5.924, 1, 0.237, 0.0016, 0.000169, 0.713, 0.356, 90.15, '08EMGunAhP8KvUV3fhuqVV', 'Xzibit', 'LAX - Xplicit Album Version'],
//         [0.879, 0.546, 4, -5.709, 0, 0.263, 0.106, 0, 0.237, 0.54, 135.96, '08TchR5zJ1M9TgcGAYe4cd', 'D12', 'Pimp Like Me'],
//         [0.661, 0.493, 8, -8.485, 0, 0.0326, 0.217, 0, 0.0664, 0.201, 95.021, '08TTz3bxSStwQKxZ8bEJ8C', 'Blackstreet', 'Joy'],
//         [0.528, 0.748, 5, -7.578, 1, 0.307, 0.153, 0.00000136, 0.152, 0.761, 92.908, '098rPav6aCjiRDrpqwXA4x', 'Edo. G', 'Fast Lane (Vocal Version)'],
//         [0.715, 0.447, 10, -10.523, 0, 0.166, 0.216, 0.00107, 0.249, 0.417, 131.99, '09avKKLKXaJcbeaGTmLCOs', 'Ab-Soul', 'D.R.U.G.S.'],
//         [0.891, 0.66, 1, -8.19, 1, 0.178, 0.0521, 0.00579, 0.0843, 0.331, 96.551, '09EsEsxw91jxlbwgv0ihpL', 'Lords Of The Underground', 'From Da Bricks'],
//         [0.526, 0.919, 11, -4.702, 0, 0.32, 0.194, 0, 0.037, 0.704, 180.069, '09EyrQlZFXMjTWJAcJRVbm', 'Statik Selektah', '82 92 (feat. Mac Miller)'],
//         [0.863, 0.434, 6, -7.772, 0, 0.458, 0.214, 0, 0.124, 0.492, 90.033, '09JqVewH65h7iVrzhWxw4n', 'Large Professor', 'In The Sun'],
//         [0.764, 0.802, 1, -4.458, 1, 0.235, 0.0317, 0.00171, 0.114, 0.592, 152.934, '0aBsXZLJDvn0QWfcIqBXq8', 'Missy Elliott', 'Level Up (feat. Missy Elliott & Fatman Scoop) - Remix'],
//         [0.806, 0.494, 10, -9.973, 0, 0.0786, 0.278, 0.0000469, 0.0633, 0.861, 99.003, '0AcLrSfAEBQcUnHOTm5pXg', 'Montell Jordan', 'Get It On Tonite'],
//         [0.937, 0.843, 7, -6.922, 1, 0.272, 0.026, 0, 0.0832, 0.83, 99.761, '0AeWU0AgMsAgIrsjAhRxgW', 'KRS-One', 'Hush'],
//         [0.449, 0.667, 11, -8.092, 0, 0.308, 0.647, 0.00000637, 0.113, 0.085, 80.751, '0AFVQA2Ht64OzMAer4aQ8n', 'Action Bronson', 'White Bronco'],
//         [0.677, 0.525, 7, -9.404, 0, 0.0483, 0.224, 0, 0.172, 0.924, 87.042, '0ahRDzkKq0KEi7FRoHb0qk', '112', 'U Already Know'],
//         [0.662, 0.657, 4, -6.971, 0, 0.272, 0.00729, 0, 0.077, 0.301, 93.09, '0aiMtEJ8FARwe0AFuxBbvH', 'Tha Alkaholiks', 'The Next Level'],
//         [0.88, 0.544, 10, -6.121, 0, 0.301, 0.0461, 0, 0.117, 0.679, 95.926, '0aoHxg1dcxHSgMJFE4umoQ', 'Black Star', 'Hater Players'],
//         [0.88, 0.799, 1, -6.661, 1, 0.0736, 0.12, 0.00727, 0.054, 0.823, 100.833, '0aOsIzGU00MiyQ4oDa1qmm', 'Whodini', 'The Freaks Come out at Night (Re-Recorded)'],
//         [0.826, 0.729, 9, -12.588, 1, 0.0864, 0.00643, 0.0056, 0.0299, 0.9, 139.821, '0arnDdo9x0Fwz7N3x0ghur', 'Third Bass', 'Makin Me High'],
//         [0.424, 0.847, 1, -7.777, 0, 0.474, 0.198, 0, 0.237, 0.607, 79.882, '0ARVztksKgBK3yGUDw9NO1', 'DJ Drama', 'Cannon RMX (feat. Lil Wayne  Willie The Kid  Freeway & T.I.)'],
//         [0.812, 0.559, 4, -9.713, 1, 0.153, 0.0167, 0.0419, 0.345, 0.518, 138.412, '0aTcUqaGRIJIEWjJBWGkzm', 'Black Milk', 'Detroits New Dance Show'],
//         [0.658, 0.83, 1, -4.566, 1, 0.078, 0.0516, 0, 0.282, 0.479, 120.944, '0AU50oV3ypRPSxXqpmFGSd', 'CyHi The Prynce', 'Im Fine'],
//         [0.849, 0.499, 2, -7.872, 1, 0.271, 0.117, 0.0000497, 0.268, 0.504, 92.982, '0aULRU35N9kTj6O1xMULRR', 'Lil Kim', 'Magic Stick'],
//         [0.734, 0.637, 1, -7.839, 0, 0.215, 0.00712, 0.000556, 0.0647, 0.392, 88.193, '0awP7BRdUvnzBCaU9YOpiJ', 'MC Ren', 'Same Old Sh*t'],
//         [0.483, 0.676, 2, -7.942, 0, 0.405, 0.762, 0, 0.38, 0.673, 92.734, '0aXJxWdn9ZT3Z45n6idzEk', 'Elzhi', 'Medicine Man'],
//         [0.751, 0.597, 10, -8.777, 0, 0.104, 0.000563, 0.00676, 0.139, 0.382, 89.906, '0aym8qYWdIDmPLgJct0uyY', 'Blahzay Blahzay', 'Sendin Dem Back'],
//         [0.69, 0.827, 8, -4.264, 1, 0.232, 0.104, 0.00083, 0.274, 0.445, 94.859, '0B2ZuTLZnWQ6gz8RlNwBu1', 'Lloyd Banks', 'On Fire'],
//         [0.633, 0.764, 0, -7.212, 1, 0.323, 0.32, 0.0000034, 0.234, 0.522, 94.971, '0B8drtTSp68pZdkmVrG9ZA', 'Big Pun', 'Twinz (Deep Cover 98)'],
//         [0.908, 0.687, 5, -5.202, 0, 0.301, 0.416, 0, 0.12, 0.855, 92.889, '0Bb21NEv7yjSJ8ro2k2SZC', 'Xzibit', 'Dont Aproach Me'],
//         [0.853, 0.603, 1, -7.85, 1, 0.226, 0.14, 0, 0.0783, 0.546, 95.936, '0Bbd5inN2znpGQkxZbqmmU', 'Mack 10', 'Backyard Boogie'],
//         [0.797, 0.57, 1, -3.973, 1, 0.197, 0.161, 0, 0.0678, 0.677, 93.478, '0BcA0LiA9lpB4fHBbBBO50', 'Memphis Bleek', 'Infatuated'],
//         [0.713, 0.611, 1, -6.702, 0, 0.241, 0.314, 0, 0.117, 0.793, 140.061, '0BEaYkPp5PnclzQxbNgwmM', 'Chief Keef', 'Bouncin'],
//         [0.82, 0.547, 1, -6.029, 0, 0.199, 0.0211, 0, 0.087, 0.561, 77.122, '0BEXSL3fxsdC1NQFlMuLw8', 'Mack 10', 'Take A Hit'],
//         [0.784, 0.628, 1, -10.467, 1, 0.243, 0.00213, 0, 0.298, 0.552, 98.955, '0BFlwAsejBJnusEuza5jsl', 'Comptons Most Wanted', 'Hit the Floor'],
//         [0.721, 0.655, 6, -10.393, 1, 0.27, 0.0308, 0.00000737, 0.137, 0.528, 94.306, '0BkVRwdE4sEF95a0xiCaMF', 'Masta Ace Incorporated', 'U Cant Find Me'],
//         [0.805, 0.822, 11, -6.805, 0, 0.198, 0.149, 0, 0.115, 0.788, 107.579, '0bskKGZvp1HsNn6oD8Q8Jl', 'Leaders of the New School', 'Case Of The P.T.A.'],
//         [0.573, 0.738, 5, -5.855, 0, 0.283, 0.0517, 0.0000793, 0.12, 0.565, 207.852, '0BWve9OJvo7ONwfR36Ty6Z', 'Lupe Fiasco', 'WAV Files'],
//         [0.563, 0.861, 11, -7.448, 1, 0.343, 0.622, 0.00000486, 0.553, 0.798, 94.984, '0bY6SdYZcid3fzp7im837v', 'J-Live', 'Them Thats Not'],
//         [0.718, 0.773, 6, -6.512, 1, 0.426, 0.487, 0, 0.0926, 0.764, 74.857, '0c6DDLA4rsGGNXWZM5oZdS', 'KYLE', 'Doubt It'],
//         [0.799, 0.935, 1, -2.433, 1, 0.32, 0.174, 0, 0.375, 0.842, 141.957, '0C6TGlpffTuUdJfjB0U9mI', 'Bad Meets Evil', 'Welcome 2 Hell'],
//         [0.785, 0.576, 9, -6.385, 1, 0.28, 0.105, 0, 0.208, 0.537, 89.951, '0C7ejWNyzFO6kJvjjEy9NY', 'Jean Grae', 'Hold U'],
//         [0.551, 0.81, 11, -4.365, 1, 0.0344, 0.0155, 0, 0.169, 0.332, 73.464, '0CAJdthKDdRjB2h8YOguN6', 'T.I.', 'What You Know'],
//         [0.658, 0.76, 1, -3.578, 1, 0.172, 0.042, 0, 0.306, 0.205, 143.997, '0cG6z63opd1xEcaKaC1CKw', 'Slaughterhouse', 'R.N.S.'],
//         [0.775, 0.723, 0, -4.095, 1, 0.0468, 0.282, 0.000371, 0.126, 0.756, 104.991, '0cge96qsW6ifXppeiiRIGd', 'Snoop Dogg', 'How You Love Me (feat. Conor Maynard & Snoop Dogg)'],
//         [0.879, 0.901, 9, -5.961, 0, 0.279, 0.0262, 0.0000502, 0.326, 0.849, 140.651, '0CJ3Y3V6UQn5X7IjXDO3IO', 'Method Man', 'Cisco Kid'],
//         [0.879, 0.901, 9, -5.961, 0, 0.279, 0.0262, 0.0000502, 0.326, 0.849, 140.651, '0CJ3Y3V6UQn5X7IjXDO3IO', 'Redman', 'Cisco Kid'],
//         [0.881, 0.458, 7, -12.636, 1, 0.339, 0.308, 0.0000356, 0.107, 0.287, 98.033, '0CMO9nOUMmpJ1SBgvglfMa', 'Leaders of the New School', 'Spontaneous - 13 MCs Deep'],
//         [0.652, 0.671, 4, -5.376, 0, 0.315, 0.00402, 0.0000289, 0.598, 0.518, 159.963, '0cNJ3huiV99wvUN1tmQLTL', 'Lloyd Banks', 'Beamer  Benz  Or Bentley'],
//         [0.862, 0.873, 1, -3.522, 1, 0.118, 0.196, 0.00000915, 0.31, 0.861, 107.136, '0cOqhCU7krsvdKv6QhwVta', 'Whodini', 'Five Minutes of Funk'],
//         [0.587, 0.808, 3, -8.666, 0, 0.283, 0.37, 0, 0.256, 0.678, 94.095, '0cSJGFChou7M6u2ju9SWN1', 'Eric B. & Rakim', 'Microphone Fiend'],
//         [0.733, 0.861, 6, -4.47, 1, 0.344, 0.0655, 0.00000192, 0.452, 0.85, 91.232, '0CT9dRh7mbYKGCPLwIcVqH', 'DJ Clue', 'Ruff Ryders Anthem']
//
// ];
//     let domain = [
//         [0.0, 1.0, 'real'], //danceability
//         [0.0, 1.0, 'real'], //energy
//         [0, 11, 'integer'], //key
//         [-60, 0, 'real'], //loudness
//         [0, 1, 'integer'], //mode 0 or 1
//         [0.0, 1.0, 'real'], //speechiness
//         [0.0, 1.0, 'real'], //acousticness
//         [0.0, 1.0, 'real'], //instrumentalness
//         [0.0, 1.0, 'real'], //liveness
//         [0.0, 1.0, 'real'], //valence
//         [0, 2000, 'real'], //tempo
//     ];
    let matrix = [];
    let inputPatterns = [
        [5.1,3.5,1.4,0.2,'Iris-setosa'],
        [4.9,3.0,1.4,0.2,'Iris-setosa'],
        [4.7,3.2,1.3,0.2,'Iris-setosa'],
        [4.6,3.1,1.5,0.2,'Iris-setosa'],
        [5.0,3.6,1.4,0.2,'Iris-setosa'],
        [5.4,3.9,1.7,0.4,'Iris-setosa'],
        [4.6,3.4,1.4,0.3,'Iris-setosa'],
        [5.0,3.4,1.5,0.2,'Iris-setosa'],
        [4.4,2.9,1.4,0.2,'Iris-setosa'],
        [4.9,3.1,1.5,0.1,'Iris-setosa'],
        [5.4,3.7,1.5,0.2,'Iris-setosa'],
        [4.8,3.4,1.6,0.2,'Iris-setosa'],
        [4.8,3.0,1.4,0.1,'Iris-setosa'],
        [4.3,3.0,1.1,0.1,'Iris-setosa'],
        [5.8,4.0,1.2,0.2,'Iris-setosa'],
        [5.7,4.4,1.5,0.4,'Iris-setosa'],
        [5.4,3.9,1.3,0.4,'Iris-setosa'],
        [5.1,3.5,1.4,0.3,'Iris-setosa'],
        [5.7,3.8,1.7,0.3,'Iris-setosa'],
        [5.1,3.8,1.5,0.3,'Iris-setosa'],
        [5.4,3.4,1.7,0.2,'Iris-setosa'],
        [5.1,3.7,1.5,0.4,'Iris-setosa'],
        [4.6,3.6,1.0,0.2,'Iris-setosa'],
        [5.1,3.3,1.7,0.5,'Iris-setosa'],
        [4.8,3.4,1.9,0.2,'Iris-setosa'],
        [5.0,3.0,1.6,0.2,'Iris-setosa'],
        [5.0,3.4,1.6,0.4,'Iris-setosa'],
        [5.2,3.5,1.5,0.2,'Iris-setosa'],
        [5.2,3.4,1.4,0.2,'Iris-setosa'],
        [4.7,3.2,1.6,0.2,'Iris-setosa'],
        [4.8,3.1,1.6,0.2,'Iris-setosa'],
        [5.4,3.4,1.5,0.4,'Iris-setosa'],
        [5.2,4.1,1.5,0.1,'Iris-setosa'],
        [5.5,4.2,1.4,0.2,'Iris-setosa'],
        [4.9,3.1,1.5,0.2,'Iris-setosa'],
        [5.0,3.2,1.2,0.2,'Iris-setosa'],
        [5.5,3.5,1.3,0.2,'Iris-setosa'],
        [4.9,3.6,1.4,0.1,'Iris-setosa'],
        [4.4,3.0,1.3,0.2,'Iris-setosa'],
        [5.1,3.4,1.5,0.2,'Iris-setosa'],
        [5.0,3.5,1.3,0.3,'Iris-setosa'],
        [4.5,2.3,1.3,0.3,'Iris-setosa'],
        [4.4,3.2,1.3,0.2,'Iris-setosa'],
        [5.0,3.5,1.6,0.6,'Iris-setosa'],
        [5.1,3.8,1.9,0.4,'Iris-setosa'],
        [4.8,3.0,1.4,0.3,'Iris-setosa'],
        [5.1,3.8,1.6,0.2,'Iris-setosa'],
        [4.6,3.2,1.4,0.2,'Iris-setosa'],
        [5.3,3.7,1.5,0.2,'Iris-setosa'],
        [5.0,3.3,1.4,0.2,'Iris-setosa'],
        [7.0,3.2,4.7,1.4,'Iris-versicolor'],
        [6.4,3.2,4.5,1.5,'Iris-versicolor'],
        [6.9,3.1,4.9,1.5,'Iris-versicolor'],
        [5.5,2.3,4.0,1.3,'Iris-versicolor'],
        [6.5,2.8,4.6,1.5,'Iris-versicolor'],
        [5.7,2.8,4.5,1.3,'Iris-versicolor'],
        [6.3,3.3,4.7,1.6,'Iris-versicolor'],
        [4.9,2.4,3.3,1.0,'Iris-versicolor'],
        [6.6,2.9,4.6,1.3,'Iris-versicolor'],
        [5.2,2.7,3.9,1.4,'Iris-versicolor'],
        [5.0,2.0,3.5,1.0,'Iris-versicolor'],
        [5.9,3.0,4.2,1.5,'Iris-versicolor'],
        [6.0,2.2,4.0,1.0,'Iris-versicolor'],
        [6.1,2.9,4.7,1.4,'Iris-versicolor'],
        [5.6,2.9,3.6,1.3,'Iris-versicolor'],
        [6.7,3.1,4.4,1.4,'Iris-versicolor'],
        [5.6,3.0,4.5,1.5,'Iris-versicolor'],
        [5.8,2.7,4.1,1.0,'Iris-versicolor'],
        [6.2,2.2,4.5,1.5,'Iris-versicolor'],
        [5.6,2.5,3.9,1.1,'Iris-versicolor'],
        [5.9,3.2,4.8,1.8,'Iris-versicolor'],
        [6.1,2.8,4.0,1.3,'Iris-versicolor'],
        [6.3,2.5,4.9,1.5,'Iris-versicolor'],
        [6.1,2.8,4.7,1.2,'Iris-versicolor'],
        [6.4,2.9,4.3,1.3,'Iris-versicolor'],
        [6.6,3.0,4.4,1.4,'Iris-versicolor'],
        [6.8,2.8,4.8,1.4,'Iris-versicolor'],
        [6.7,3.0,5.0,1.7,'Iris-versicolor'],
        [6.0,2.9,4.5,1.5,'Iris-versicolor'],
        [5.7,2.6,3.5,1.0,'Iris-versicolor'],
        [5.5,2.4,3.8,1.1,'Iris-versicolor'],
        [5.5,2.4,3.7,1.0,'Iris-versicolor'],
        [5.8,2.7,3.9,1.2,'Iris-versicolor'],
        [6.0,2.7,5.1,1.6,'Iris-versicolor'],
        [5.4,3.0,4.5,1.5,'Iris-versicolor'],
        [6.0,3.4,4.5,1.6,'Iris-versicolor'],
        [6.7,3.1,4.7,1.5,'Iris-versicolor'],
        [6.3,2.3,4.4,1.3,'Iris-versicolor'],
        [5.6,3.0,4.1,1.3,'Iris-versicolor'],
        [5.5,2.5,4.0,1.3,'Iris-versicolor'],
        [5.5,2.6,4.4,1.2,'Iris-versicolor'],
        [6.1,3.0,4.6,1.4,'Iris-versicolor'],
        [5.8,2.6,4.0,1.2,'Iris-versicolor'],
        [5.0,2.3,3.3,1.0,'Iris-versicolor'],
        [5.6,2.7,4.2,1.3,'Iris-versicolor'],
        [5.7,3.0,4.2,1.2,'Iris-versicolor'],
        [5.7,2.9,4.2,1.3,'Iris-versicolor'],
        [6.2,2.9,4.3,1.3,'Iris-versicolor'],
        [5.1,2.5,3.0,1.1,'Iris-versicolor'],
        [5.7,2.8,4.1,1.3,'Iris-versicolor'],
        [6.3,3.3,6.0,2.5,'Iris-virginica'],
        [5.8,2.7,5.1,1.9,'Iris-virginica'],
        [7.1,3.0,5.9,2.1,'Iris-virginica'],
        [6.3,2.9,5.6,1.8,'Iris-virginica'],
        [6.5,3.0,5.8,2.2,'Iris-virginica'],
        [7.6,3.0,6.6,2.1,'Iris-virginica'],
        [4.9,2.5,4.5,1.7,'Iris-virginica'],
        [7.3,2.9,6.3,1.8,'Iris-virginica'],
        [6.7,2.5,5.8,1.8,'Iris-virginica'],
        [7.2,3.6,6.1,2.5,'Iris-virginica'],
        [6.5,3.2,5.1,2.0,'Iris-virginica'],
        [6.4,2.7,5.3,1.9,'Iris-virginica'],
        [6.8,3.0,5.5,2.1,'Iris-virginica'],
        [5.7,2.5,5.0,2.0,'Iris-virginica'],
        [5.8,2.8,5.1,2.4,'Iris-virginica'],
        [6.4,3.2,5.3,2.3,'Iris-virginica'],
        [6.5,3.0,5.5,1.8,'Iris-virginica'],
        [7.7,3.8,6.7,2.2,'Iris-virginica'],
        [7.7,2.6,6.9,2.3,'Iris-virginica'],
        [6.0,2.2,5.0,1.5,'Iris-virginica'],
        [6.9,3.2,5.7,2.3,'Iris-virginica'],
        [5.6,2.8,4.9,2.0,'Iris-virginica'],
        [7.7,2.8,6.7,2.0,'Iris-virginica'],
        [6.3,2.7,4.9,1.8,'Iris-virginica'],
        [6.7,3.3,5.7,2.1,'Iris-virginica'],
        [7.2,3.2,6.0,1.8,'Iris-virginica'],
        [6.2,2.8,4.8,1.8,'Iris-virginica'],
        [6.1,3.0,4.9,1.8,'Iris-virginica'],
        [6.4,2.8,5.6,2.1,'Iris-virginica'],
        [7.2,3.0,5.8,1.6,'Iris-virginica'],
        [7.4,2.8,6.1,1.9,'Iris-virginica'],
        [7.9,3.8,6.4,2.0,'Iris-virginica'],
        [6.4,2.8,5.6,2.2,'Iris-virginica'],
        [6.3,2.8,5.1,1.5,'Iris-virginica'],
        [6.1,2.6,5.6,1.4,'Iris-virginica'],
        [7.7,3.0,6.1,2.3,'Iris-virginica'],
        [6.3,3.4,5.6,2.4,'Iris-virginica'],
        [6.4,3.1,5.5,1.8,'Iris-virginica'],
        [6.0,3.0,4.8,1.8,'Iris-virginica'],
        [6.9,3.1,5.4,2.1,'Iris-virginica'],
        [6.7,3.1,5.6,2.4,'Iris-virginica'],
        [6.9,3.1,5.1,2.3,'Iris-virginica'],
        [5.8,2.7,5.1,1.9,'Iris-virginica'],
        [6.8,3.2,5.9,2.3,'Iris-virginica'],
        [6.7,3.3,5.7,2.5,'Iris-virginica'],
        [6.7,3.0,5.2,2.3,'Iris-virginica'],
        [6.3,2.5,5.0,1.9,'Iris-virginica'],
        [6.5,3.0,5.2,2.0,'Iris-virginica'],
        [6.2,3.4,5.4,2.3,'Iris-virginica'],
        [5.9,3.0,5.1,1.8,'Iris-virginica']
    ];
    let domain = [
        [4,8,'real'],
        [2,5,'real'],
        [1,7,'real'],
        [0,3,'real']
    ];
    let codebookVectors = train(inputPatterns, domain, 10, 0.9, 7, 10, 10, 'rectangular');
    for (let inputPattern of inputPatterns) {
        let bmu = selectBestMatchingUnit(inputPattern,codebookVectors);
        let index = codebookVectors.indexOf(bmu);
        if (codebookVectors[index]['mapped'] === null || codebookVectors[index]['mapped'] === undefined) codebookVectors[index]['mapped'] = [inputPattern];
        else codebookVectors[index]['mapped'].push(inputPattern);
    }
    // for (let codebookVector of codebookVectors) {
    //     if (!matrix[codebookVector.coordinates.x]) {
    //         matrix[codebookVector.coordinates.x] = [];
    //     }
    //     if (codebookVector['mapped']) {
    //         for (let elem of codebookVector['mapped']) {
    //             matrix[codebookVector.coordinates.x].push(elem[4])
    //         }
    //     }
    // }
    // console.log(matrix);

}

testNetwork();
// maroon	#800000	(128,0,0)
// dark red	#8B0000	(139,0,0)
// brown	#A52A2A	(165,42,42)
// firebrick	#B22222	(178,34,34)
// crimson	#DC143C	(220,20,60)
// red	#FF0000	(255,0,0)
// tomato	#FF6347	(255,99,71)
// coral	#FF7F50	(255,127,80)
// indian red	#CD5C5C	(205,92,92)
// light coral	#F08080	(240,128,128)
// dark salmon	#E9967A	(233,150,122)
// salmon	#FA8072	(250,128,114)
// light salmon	#FFA07A	(255,160,122)
// orange red	#FF4500	(255,69,0)
// dark orange	#FF8C00	(255,140,0)
// orange	#FFA500	(255,165,0)
// gold	#FFD700	(255,215,0)
// dark golden rod	#B8860B	(184,134,11)
// golden rod	#DAA520	(218,165,32)
// pale golden rod	#EEE8AA	(238,232,170)
// dark khaki	#BDB76B	(189,183,107)
// khaki	#F0E68C	(240,230,140)
// olive	#808000	(128,128,0)
// yellow	#FFFF00	(255,255,0)
// yellow green	#9ACD32	(154,205,50)
// dark olive green	#556B2F	(85,107,47)
// olive drab	#6B8E23	(107,142,35)
// lawn green	#7CFC00	(124,252,0)
// chart reuse	#7FFF00	(127,255,0)
// green yellow	#ADFF2F	(173,255,47)
// dark green	#006400	(0,100,0)
// green	#008000	(0,128,0)
// forest green	#228B22	(34,139,34)
// lime	#00FF00	(0,255,0)
// lime green	#32CD32	(50,205,50)
// light green	#90EE90	(144,238,144)
// pale green	#98FB98	(152,251,152)
// dark sea green	#8FBC8F	(143,188,143)
// medium spring green	#00FA9A	(0,250,154)
// spring green	#00FF7F	(0,255,127)
// sea green	#2E8B57	(46,139,87)
// medium aqua marine	#66CDAA	(102,205,170)
// medium sea green	#3CB371	(60,179,113)
// light sea green	#20B2AA	(32,178,170)
// dark slate gray	#2F4F4F	(47,79,79)
// teal	#008080	(0,128,128)
// dark cyan	#008B8B	(0,139,139)
// aqua	#00FFFF	(0,255,255)
// cyan	#00FFFF	(0,255,255)
// light cyan	#E0FFFF	(224,255,255)
// dark turquoise	#00CED1	(0,206,209)
// turquoise	#40E0D0	(64,224,208)
// medium turquoise	#48D1CC	(72,209,204)
// pale turquoise	#AFEEEE	(175,238,238)
// aqua marine	#7FFFD4	(127,255,212)
// powder blue	#B0E0E6	(176,224,230)
// cadet blue	#5F9EA0	(95,158,160)
// steel blue	#4682B4	(70,130,180)
// corn flower blue	#6495ED	(100,149,237)
// deep sky blue	#00BFFF	(0,191,255)
// dodger blue	#1E90FF	(30,144,255)
// light blue	#ADD8E6	(173,216,230)
// sky blue	#87CEEB	(135,206,235)
// light sky blue	#87CEFA	(135,206,250)
// midnight blue	#191970	(25,25,112)
// navy	#000080	(0,0,128)
// dark blue	#00008B	(0,0,139)
// medium blue	#0000CD	(0,0,205)
// blue	#0000FF	(0,0,255)
// royal blue	#4169E1	(65,105,225)
// blue violet	#8A2BE2	(138,43,226)
// indigo	#4B0082	(75,0,130)
// dark slate blue	#483D8B	(72,61,139)
// slate blue	#6A5ACD	(106,90,205)
// medium slate blue	#7B68EE	(123,104,238)
// medium purple	#9370DB	(147,112,219)
// dark magenta	#8B008B	(139,0,139)
// dark violet	#9400D3	(148,0,211)
// dark orchid	#9932CC	(153,50,204)
// medium orchid	#BA55D3	(186,85,211)
// purple	#800080	(128,0,128)
// thistle	#D8BFD8	(216,191,216)
// plum	#DDA0DD	(221,160,221)
// violet	#EE82EE	(238,130,238)
// magenta / fuchsia	#FF00FF	(255,0,255)
// orchid	#DA70D6	(218,112,214)
// medium violet red	#C71585	(199,21,133)
// pale violet red	#DB7093	(219,112,147)
// deep pink	#FF1493	(255,20,147)
// hot pink	#FF69B4	(255,105,180)
// light pink	#FFB6C1	(255,182,193)
// pink	#FFC0CB	(255,192,203)
// antique white	#FAEBD7	(250,235,215)
// beige	#F5F5DC	(245,245,220)
// bisque	#FFE4C4	(255,228,196)
// blanched almond	#FFEBCD	(255,235,205)
// wheat	#F5DEB3	(245,222,179)
// corn silk	#FFF8DC	(255,248,220)
// lemon chiffon	#FFFACD	(255,250,205)
// light golden rod yellow	#FAFAD2	(250,250,210)
// light yellow	#FFFFE0	(255,255,224)
// saddle brown	#8B4513	(139,69,19)
// sienna	#A0522D	(160,82,45)
// chocolate	#D2691E	(210,105,30)
// peru	#CD853F	(205,133,63)
// sandy brown	#F4A460	(244,164,96)
// burly wood	#DEB887	(222,184,135)
// tan	#D2B48C	(210,180,140)
// rosy brown	#BC8F8F	(188,143,143)
// moccasin	#FFE4B5	(255,228,181)
// navajo white	#FFDEAD	(255,222,173)
// peach puff	#FFDAB9	(255,218,185)
// misty rose	#FFE4E1	(255,228,225)
// lavender blush	#FFF0F5	(255,240,245)
// linen	#FAF0E6	(250,240,230)
// old lace	#FDF5E6	(253,245,230)
// papaya whip	#FFEFD5	(255,239,213)
// sea shell	#FFF5EE	(255,245,238)
// mint cream	#F5FFFA	(245,255,250)
// slate gray	#708090	(112,128,144)
// light slate gray	#778899	(119,136,153)
// light steel blue	#B0C4DE	(176,196,222)
// lavender	#E6E6FA	(230,230,250)
// floral white	#FFFAF0	(255,250,240)
// alice blue	#F0F8FF	(240,248,255)
// ghost white	#F8F8FF	(248,248,255)
// honeydew	#F0FFF0	(240,255,240)
// ivory	#FFFFF0	(255,255,240)
// azure	#F0FFFF	(240,255,255)
// snow	#FFFAFA	(255,250,250)
// black	#000000	(0,0,0)
// dim gray / dim grey	#696969	(105,105,105)
// gray / grey	#808080	(128,128,128)
// dark gray / dark grey	#A9A9A9	(169,169,169)
// silver	#C0C0C0	(192,192,192)
// light gray / light grey	#D3D3D3	(211,211,211)
// gainsboro	#DCDCDC	(220,220,220)
// white smoke	#F5F5F5	(245,245,245)
// white	#FFFFFF	(255,255,255)
