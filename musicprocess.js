"use strict";
/**
 * Filename: musicprocess.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase que procesa la música
 */
exports.__esModule = true;
var MusicProcess = /** @class */ (function () {
    function MusicProcess(audioChanelLeft, audioChanelRight, audioChanelLeft2, audioChanelRight2) {
        this.audioChanelLeft = audioChanelLeft;
        this.audioChanelRight = audioChanelRight;
        this.audioChanelLeft2 = audioChanelLeft2;
        this.audioChanelRight2 = audioChanelRight2;
    }
    // Funciones disponibles de la clase
    MusicProcess.prototype.match = function () {
        var totalSamples = Math.floor(MusicProcess.samplesPerSecond
            * this.audioChanelLeft2.length
            / MusicProcess.samplingFrecuency);
        var originales = [];
        var resp = [];
        for (var cont = 0; cont < totalSamples; cont = cont + 1) {
            var pos = Math.floor(Math.random() * this.audioChanelLeft2.length);
            originales.push([pos, this.audioChanelLeft2[pos], this.audioChanelRight2[pos]]);
        }
        var totalSamplesCancion = Math.floor(MusicProcess.samplesPerSecond
            * this.audioChanelLeft.length
            / MusicProcess.samplingFrecuency) * 35;
        for (var cont = 0; cont < totalSamplesCancion; cont = cont + 1) {
            var pos = Math.floor(Math.random() * this.audioChanelLeft.length);
            var cont2 = 0;
            var continuar = true;
            while (continuar && cont2 < totalSamples) {
                var offset = originales[cont2][0];
                continuar = (this.compare(originales[cont2][1], this.audioChanelLeft[offset + pos], MusicProcess.tolerance) &&
                    this.compare(originales[cont2][2], this.audioChanelRight[offset + pos], MusicProcess.tolerance));
                cont2 = cont2 + 1;
            }
            if (continuar) {
                resp.push(pos / MusicProcess.samplingFrecuency);
            }
        }
        return this.refinarBusqueda(this.sortArray(resp));
    };
    MusicProcess.prototype.unmatch = function () {
    };
    MusicProcess.prototype.dj = function () {
    };
    MusicProcess.prototype.compose = function () {
    };
    // Getters y Setters
    /**
     * Devuelve el canal izquierdo del mix.
     */
    MusicProcess.prototype.getAudioChanelLeft = function () {
        return this.audioChanelLeft;
    };
    /**
     * Define el canal izquierdo del mix.
     * @param audioChanelLeft El nuevo canal izquierdo.
     */
    MusicProcess.prototype.setAudioChanelLeft = function (audioChanelLeft) {
        this.audioChanelLeft = audioChanelLeft;
    };
    /**
     * Devuelve el canal derecho del mix.
     */
    MusicProcess.prototype.getAudioChanelRight = function () {
        return this.audioChanelRight;
    };
    /**
     * Define el canal derecho del mix.
     * @param audioChanelLeft El nuevo canal derecho.
     */
    MusicProcess.prototype.setAudioChanelRight = function (audioChanelRight) {
        this.audioChanelRight = audioChanelRight;
    };
    // Métodos privados
    /*
     * Concatena dos arrays de tipo Float32Array.
     * El resultado se devuelve en un nuevo arreglo del mismo tipo.
     */
    MusicProcess.prototype.float32Concat = function (first, second) {
        var firstLength = first.length;
        var result = new Float32Array(firstLength + second.length);
        result.set(first);
        result.set(second, firstLength);
        return result;
    };
    /*
     * Función que realiza la comparación de dos números,
     * se considera que los valores son iguales si se encuentran
     * a una distancia menor a la tolerancia definida
     * @param number1 El primer valor que se quiere comparar.
     * @param number2 El segundo valor que se quiere comparar.
     */
    MusicProcess.prototype.compare = function (number1, number2, tolerancia) {
        if (Math.abs(number2 - number1) < tolerancia) {
            return true;
        }
        return false;
    };
    MusicProcess.prototype.refinarBusqueda = function (tiempos) {
        if (tiempos.length < 2) {
            return tiempos;
        }
        var refinado = [];
        var pos = 0;
        var tiempoSample = this.audioChanelLeft2.length / MusicProcess.samplingFrecuency;
        while (pos < tiempos.length - MusicProcess.repeticiones) {
            if (this.compare(tiempos[pos], tiempos[pos + MusicProcess.repeticiones], MusicProcess.toleranceTime)) {
                var pos2 = pos + MusicProcess.repeticiones + 1;
                while (this.compare(tiempos[pos], tiempos[pos2], tiempoSample)) {
                    pos2 = pos2 + 1;
                }
                refinado.push(tiempos[pos]);
                pos = pos2;
            }
            else {
                pos = pos + 1;
            }
        }
        return refinado;
    };
    /**
     * Función que ordena un array por el valor de cada tiempo.
     * @param pSong Array que se quiere ordenar.
     */
    MusicProcess.prototype.sortArray = function (tiempos) {
        return tiempos.sort(function (time1, time2) {
            if (time1 > time2) {
                return 1;
            }
            if (time1 < time2) {
                return -1;
            }
            return 0;
        });
    };
    // Frecuencia de los samples que se van a trabajar
    MusicProcess.samplingFrecuency = 44100;
    // Frecuencia de los samples que se van a trabajar
    MusicProcess.tolerance = 0.2;
    // Cantidad de repeticiones para considerar que el sonido sí es igual
    MusicProcess.repeticiones = 1;
    // Tiempo entre las repeticiones para considerar que el sonido sí es igual
    MusicProcess.toleranceTime = 0.3;
    // Frecuencia de los samples que se van a trabajar
    MusicProcess.samplesPerSecond = 120;
    return MusicProcess;
}());
exports.MusicProcess = MusicProcess;
