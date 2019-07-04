const som = require("../src/som/self-organizing-map");

const assert = require('assert');

describe('Self-Organizing Map', function () {
    describe('#calculateNeighbourhoodSize', function () {
        it('should equal the initial neighbourhood size for the first iteration', function () {
            const init = 10;
            assert.strictEqual(som.calculateNeighbourhoodSize(0, 100, init), init);
        });

        it('should decrease neighbourhood size from one iteration to another', function () {
            const init = 10;
            for (let i = 0; i < 10; i++) {
                assert.strictEqual(som.calculateNeighbourhoodSize(i, 100, init) > som.calculateNeighbourhoodSize(i + 1, 100, init), true);
            }
        });

        it('should equal to 0 for the last iteration', function () {
            const init = 10;
            assert.strictEqual(som.calculateNeighbourhoodSize(100, 100, init), 0);
        });
    });

    describe('#calculateLearningRate', function () {
        it('should decrease learning rate from one iteration to another', function () {
            const init = 10;
            for (let i = 0; i < 10; i++) {
                assert.strictEqual(som.calculateLearningRate(init, 0.9, i) > som.calculateLearningRate(init, 0.9, i + 1), true);
            }
        });
    });

    describe('#selectInputPattern', function () {
        it('should select an input pattern from the list', function () {
            const list = [0, 1, 2, 3, 4, 5];
            assert.strictEqual(list.includes(som.selectInputPattern(5, list)), true);
        });
    });

    describe('#euclideanDistance', function () {
        it('should equal 0 when the two vectors are identical', function () {
            const v1 = [1, 1, 1, 1, 1];
            const v2 = [1, 1, 1, 1, 1];
            assert.strictEqual(som.euclidean_distance(v1, v2), 0);
        });

        it('should NOT equal 0 when the two vectors are different', function () {
            const v1 = [1, 1, 1, 1, 1];
            const v2 = [1, 1, 1, 1, 2];
            assert.notStrictEqual(som.euclidean_distance(v1, v2), 0);
        });

        it('should calculate the euclian distance between two vectors', function () {
            const v1 = [7, 4, 3];
            const v2 = [17, 6, 2];
            assert.strictEqual(som.euclidean_distance(v1, v2), 10.246950765959598);
        });
    });

    describe('#getHexagonIndexes', function () {
        it('should get the hexagon indexes around the point', function () {
            assert.deepStrictEqual(som.getHexagonIndexes(3, 3, 1, 5, 5), [
                {x: 2, y: 2},
                {x: 2, y: 3},
                {x: 3, y: 2},
                {x: 3, y: 3},
                {x: 3, y: 4},
                {x: 4, y: 2},
                {x: 4, y: 3}
            ]);
        });

        it('should respect the boundaries of the grid and find the hexagon indexes inside the grid', function () {
            assert.deepStrictEqual(som.getHexagonIndexes(3, 3, 1, 3, 3), [
                {x: 2, y: 2}
            ]);
            assert.deepStrictEqual(som.getHexagonIndexes(3, 3, 1, 4, 4), [
                {x: 2, y: 2},
                {x: 2, y: 3},
                {x: 3, y: 2},
                {x: 3, y: 3}
            ]);
            assert.deepStrictEqual(som.getHexagonIndexes(3, 3, 2, 4, 4), [
                {x: 1, y: 2},
                {x: 1, y: 3},
                {x: 2, y: 1},
                {x: 2, y: 2},
                {x: 2, y: 3},
                {x: 3, y: 1},
                {x: 3, y: 2},
                {x: 3, y: 3},
            ]);
            assert.deepStrictEqual(som.getHexagonIndexes(3, 3, 2, 6, 6), [ { x: 1, y: 2 },
                { x: 1, y: 3 },
                { x: 1, y: 4 },
                { x: 2, y: 1 },
                { x: 2, y: 2 },
                { x: 2, y: 3 },
                { x: 2, y: 4 },
                { x: 3, y: 1 },
                { x: 3, y: 2 },
                { x: 3, y: 3 },
                { x: 3, y: 4 },
                { x: 3, y: 5 },
                { x: 4, y: 1 },
                { x: 4, y: 2 },
                { x: 4, y: 3 },
                { x: 4, y: 4 },
                { x: 5, y: 2 },
                { x: 5, y: 3 },
                { x: 5, y: 4 }
                ]);
        })
    });

    describe('#randomVector', function () {
        it('create a random vector with values between the boundaries specified', function () {
            const v = som.randomVector([[-50,0,'integer'],[1,20,'integer'],[0,1,'real'],[-6,-5,'real']]);
            assert.strictEqual(v[0]>-50 && v[0]<0, true);
            assert.strictEqual(v[1]>1 && v[1]<20, true);
            assert.strictEqual(v[2]>0 && v[2]<1, true);
            assert.strictEqual(v[3]>-6 && v[3]<-5, true);
        });
    });


});