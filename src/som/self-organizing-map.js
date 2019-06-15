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
    try {
        for (let i = 1; i <= iterMax; i++) {
            //console.log("ITERATION ", i)
            const neighbourhoodSize = Math.round(calculateNeighbourhoodSize(i, iterMax, neighbourhoodInitSize));
            //console.log(neighbourhoodSize, "neighbourhoodsize");
            currentLearningRate = calculateLearningRate(learnInitRate, 0.9, i);
            //console.log(currentLearningRate, "currentLearningRate");
            const pattern = selectInputPattern(i, inputPatterns);
            //console.log(pattern, "pattern");
            const bmu = selectBestMatchingUnit(pattern, codebookVectors);
            //console.log(bmu, "bmu");
            let neighbourhood = [bmu];
            let neighbours = selectNeighbours(bmu, codebookVectors, gridType, neighbourhoodSize, gridWidth, gridHeight);
            neighbourhood.push(...neighbours);
            //console.log(neighbourhood.length,"neighbours");
            for (let vector of neighbourhood) {
                for (let idx in vector['vector']) {
                    //console.log("initial value", vector['vector'][idx]);
                    vector['vector'][idx] = vector['vector'][idx] + currentLearningRate * (pattern[idx] - vector['vector'][idx]);
                    //console.log("final value", vector['vector'][idx]);
                }
            }
        }
    } catch (e) {
        console.log("ERROR ENCOUNTERED:",e);
        const fs = require('fs');
        fs.writeFile("valuesInt.txt", JSON.stringify(codebookVectors), function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
        for (let inputPattern of inputPatterns) {
            let bmu = selectBestMatchingUnit(inputPattern,codebookVectors);
            let index = codebookVectors.indexOf(bmu);
            if (codebookVectors[index]['mapped'] === null || codebookVectors[index]['mapped'] === undefined) codebookVectors[index]['mapped'] = [inputPattern];
            else codebookVectors[index]['mapped'].push(inputPattern);
        }

        fs.writeFile("clustereInt.txt", JSON.stringify(codebookVectors), function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
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
    for (let codebookVector of codebookVectors) {
        let distance = euclidean_distance(codebookVector.vector, pattern);
        // console.log(distance,"distance");
        bmu = bmu === null || bmuDistance > distance ? codebookVector : bmu;
        bmuDistance = bmuDistance === null || bmuDistance > distance ? distance : bmuDistance;
    }
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
        if (vector2 && vector2[attribute]) sum += Math.pow(vector1[attribute] - vector2[attribute], 2);
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
function getHexagonIndexes(x, y, neighbourhoodSize, gridWidth, gridHeight) {
    let results = [];
    istart = x- neighbourhoodSize >= 0 ? (x-neighbourhoodSize) : 0;
    for (let i = istart; i <= x + neighbourhoodSize && i<gridHeight; i++) {
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
        start = start >= 0 ? start : 0;
        for (let j = start; j <= end && j<gridWidth; j++) {
            results.push({x: i, y: j});
        }
    }
    //console.log(results, "indexes");
    return results;
}

/**
 * The function calculates the indexes of the neighbours of the BMU, based on the grid type and the neighbourhood size
 * @param bmu: the neuron for which the neighbourhood is computed
 * @param codebookVectors: the codebook vectors of the Self Organizing Map
 * @param gridType: type of grid for SOM ('rectangular' or 'hexagonal')
 * @param neighbourhoodSize: the radius (measured in units) of the neighbourhood
 */
function selectNeighbours(bmu, codebookVectors, gridType, neighbourhoodSize, gridWidth, gridHeight) {
    let neighbours = [];
    let x = bmu.coordinates.x;
    let y = bmu.coordinates.y;
    let xMin = x - neighbourhoodSize;
    let xMax = x + neighbourhoodSize;
    let yMin = y - neighbourhoodSize;
    let yMax = y + neighbourhoodSize;

    if (gridType === 'hexagonal') {
        let hexagonIndexes = getHexagonIndexes(x, y, neighbourhoodSize, gridWidth, gridHeight);
        for (let i = 0; i < hexagonIndexes.length; i++) {
            let elem = hexagonIndexes[i];
            let found = codebookVectors.find((element1) => {
                return element1.coordinates.x === elem.x && element1.coordinates.y === elem.y;
            });
            if (found) neighbours.push(found);
        }
    } else {
        for (let codebookVector of codebookVectors) {
            if ((codebookVector.coordinates.x > xMin
                && codebookVector.coordinates.x < xMax)
                && (codebookVector.coordinates.y > yMin
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