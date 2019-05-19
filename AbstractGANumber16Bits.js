"use strict";
/**
 * Filename: GANumber16Bits.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase abstracta que realiza las operaciones básicas de un
 *              algoritmo genético que opera sobre números de 16 bits.
 */
exports.__esModule = true;
var Utils = require("./Utils");
var AbstractGANumber16Bits = /** @class */ (function () {
    function AbstractGANumber16Bits() {
    }
    AbstractGANumber16Bits.prototype.fitnessOfIndividual = function (individual, poblation) {
        return 0;
    };
    AbstractGANumber16Bits.prototype.crossIndividuals = function (father, mother) {
        return ((father & 65280) + (mother & 255));
    };
    AbstractGANumber16Bits.prototype.mutateIndividual = function (individual) {
        return individual ^ (1 << (Utils.Utils.intRandom(0, 16) - 1));
    };
    return AbstractGANumber16Bits;
}());
exports.AbstractGANumber16Bits = AbstractGANumber16Bits;
