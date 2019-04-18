"use strict";
/**
 * Filename: musicmix.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase especializada en hacer un mix de música a partir de un conjunto de segmentos de música tomados de un archivo wav
 */
exports.__esModule = true;
var MusicMix = /** @class */ (function () {
    // Constructor de la clase
    function MusicMix() {
        this.audioChanelLeft = new Float32Array(0);
        this.audioChanelRight = new Float32Array(0);
        this.canciones = new Array();
    }
    /**
     * Agrega una canción o sonido a las canciones base para hacer el mix.
     * @param cancion La canción que se desea agregar.
     */
    MusicMix.prototype.addCancion = function (cancion) {
        this.canciones.push(cancion);
    };
    /**
     * Agrega varias canciones o sonidos a las canciones base para hacer el mix.
     * @param canciones La canciones o sonidos que se desea agregar.
     */
    MusicMix.prototype.addCanciones = function (canciones) {
        this.canciones = this.canciones.concat(canciones);
    };
    /**
     * Crea el mix tomando de manera aleatoria el efecto y la canción o sonido
     * para cada una de las partes de la nueva canción hasta que complete el tiempo indicado.
     * @param time El tiempo de la canción que se desea realizar.
     */
    MusicMix.prototype.hacerMixAleatorio = function (time) {
        var largoTotal = time * MusicMix.samplingFrecuency;
        while (this.audioChanelLeft.length < largoTotal) {
            var efecto = Math.floor(Math.random() * 3);
            var numCancion = Math.floor(Math.random() * this.canciones.length);
            switch (efecto) {
                case 0:
                    this.loops(this.canciones[numCancion].channelData[0], this.canciones[numCancion].channelData[1], 4 + Math.random() * 3);
                    break;
                case 1:
                    this.leftToRightToBoth(this.canciones[numCancion].channelData[0], this.canciones[numCancion].channelData[1], 4);
                    break;
                case 2:
                    this.sonidoSilencio(this.canciones[numCancion].channelData[0], this.canciones[numCancion].channelData[1], 6 + Math.random() * 4);
                    break;
            }
        }
    };
    /**
     * Repite un audio varias veces hasta cubrir los segundos indicados.
     * Ambos audios deben tener la misma cantidad de samples.
     * @param audioChanelLeft El canal izquierdo que se quiere copiar.
     * @param audioChanelRight El canal derecho que se quiere copiar.
     * @param time El tiempo en segundos que se quiere que se repita el sonido.
     */
    MusicMix.prototype.loops = function (audioChanelLeft, audioChanelRight, time) {
        var numSamples = audioChanelLeft.length;
        // Copia el canal izquierdo y derecho para iniciar el loop
        var mixChanelLeft = new Float32Array(0);
        var mixChanelRight = new Float32Array(0);
        // Variables del while
        var duracionWhile = 0;
        var totalLoopSampling = time * MusicMix.samplingFrecuency;
        // Se intercala el sonido con el silencio
        while (duracionWhile < totalLoopSampling) {
            mixChanelLeft = this.Float32Concat(mixChanelLeft, audioChanelLeft);
            mixChanelRight = this.Float32Concat(mixChanelRight, audioChanelRight);
            duracionWhile = duracionWhile + numSamples;
        }
        // Se agrega el resultado al mix
        this.audioChanelLeft = this.Float32Concat(this.audioChanelLeft, mixChanelLeft);
        this.audioChanelRight = this.Float32Concat(this.audioChanelRight, mixChanelRight);
    };
    /**
     * Realiza un audio que inicia sonando sólo en el canal izquierdo,
     * luego suena sólo el canal derecho y termina sonando los dos
     * canales. Ambos audios deben tener la misma cantidad de samples.
     * @param audioChanelLeft El canal izquierdo que se quiere copiar.
     * @param audioChanelRight El canal derecho que se quiere copiar.
     * @param time El tiempo en segundos que se quiere que se repita el sonido.
     */
    MusicMix.prototype.leftToRightToBoth = function (audioChanelLeft, audioChanelRight, time) {
        var numSamples = audioChanelLeft.length;
        var mixChanelLeft = new Float32Array(0);
        var mixChanelRight = new Float32Array(0);
        // Crea un array de silencio para intercalarlo con el sonido, tiene el mismo tamaño que el audio original
        var silencio = new Float32Array(numSamples);
        // Variables del while
        var duracionWhile = 0;
        var totalLoopSampling = time * MusicMix.samplingFrecuency;
        // Se intercala el sonido en cada canal con el sonido en ambos canales
        while (duracionWhile < totalLoopSampling) {
            // Copia el canal izquierdo y derecho para iniciar el loop
            mixChanelLeft = this.Float32Concat(mixChanelLeft, audioChanelLeft);
            mixChanelRight = this.Float32Concat(mixChanelRight, silencio);
            mixChanelLeft = this.Float32Concat(mixChanelLeft, silencio);
            mixChanelRight = this.Float32Concat(mixChanelRight, audioChanelRight);
            mixChanelLeft = this.Float32Concat(mixChanelLeft, audioChanelLeft);
            mixChanelRight = this.Float32Concat(mixChanelRight, audioChanelRight);
            duracionWhile = duracionWhile + 3 * numSamples;
        }
        // Se agrega el resultado al mix
        this.audioChanelLeft = this.Float32Concat(this.audioChanelLeft, mixChanelLeft);
        this.audioChanelRight = this.Float32Concat(this.audioChanelRight, mixChanelRight);
    };
    /**
     * Intercala un audio con un silencio con la misma duración varias veces
     * hasta cubrir los segundos indicados. Ambos audios deben tener la misma
     * cantidad de samples.
     * @param audioChanelLeft El canal izquierdo que se quiere copiar.
     * @param audioChanelRight El canal derecho que se quiere copiar.
     * @param time El tiempo en segundos que se quiere que se repita el sonido.
     */
    MusicMix.prototype.sonidoSilencio = function (audioChanelLeft, audioChanelRight, time) {
        var numSamples = audioChanelLeft.length;
        // Copia el canal izquierdo y derecho para iniciar el loop
        var mixChanelLeft = new Float32Array(0);
        var mixChanelRight = new Float32Array(0);
        // Crea un array de silencio para intercalarlo con el sonido
        // const duracionBlanco: number = mixChanelLeft.length;
        var silencio = new Float32Array(numSamples);
        // Variables del while
        var duracionWhile = 0;
        var totalLoopSampling = time * MusicMix.samplingFrecuency;
        // Se intercala el sonido con el silencio
        while (duracionWhile < totalLoopSampling) {
            mixChanelLeft = this.Float32Concat(mixChanelLeft, audioChanelLeft);
            mixChanelRight = this.Float32Concat(mixChanelRight, audioChanelRight);
            mixChanelLeft = this.Float32Concat(mixChanelLeft, silencio);
            mixChanelRight = this.Float32Concat(mixChanelRight, silencio);
            duracionWhile = duracionWhile + 2 * numSamples;
        }
        // Se agrega el resultado al mix
        this.audioChanelLeft = this.Float32Concat(this.audioChanelLeft, mixChanelLeft);
        this.audioChanelRight = this.Float32Concat(this.audioChanelRight, mixChanelRight);
    };
    /*
     * Concatena dos arrays de tipo Float32Array.
     * El resultado se devuelve en un nuevo arreglo del mismo tipo.
     */
    MusicMix.prototype.Float32Concat = function (first, second) {
        var firstLength = first.length;
        var result = new Float32Array(firstLength + second.length);
        result.set(first);
        result.set(second, firstLength);
        return result;
    };
    // Getters y Setters
    /**
     * Devuelve el canal izquierdo del mix.
     */
    MusicMix.prototype.getAudioChanelLeft = function () {
        return this.audioChanelLeft;
    };
    /**
     * Define el canal izquierdo del mix.
     * @param audioChanelLeft El nuevo canal izquierdo.
     */
    MusicMix.prototype.setAudioChanelLeft = function (audioChanelLeft) {
        this.audioChanelLeft = audioChanelLeft;
    };
    /**
     * Devuelve el canal derecho del mix.
     */
    MusicMix.prototype.getAudioChanelRight = function () {
        return this.audioChanelRight;
    };
    /**
     * Define el canal derecho del mix.
     * @param audioChanelLeft El nuevo canal derecho.
     */
    MusicMix.prototype.setAudioChanelRight = function (audioChanelRight) {
        this.audioChanelRight = audioChanelRight;
    };
    // Frecuencia de los samples que se van a trabajar
    MusicMix.samplingFrecuency = 44100;
    return MusicMix;
}());
exports.MusicMix = MusicMix;
