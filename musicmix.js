"use strict";
/**
 * Filename: musicmix.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase especializada en hacer un mix de música a partir
 * de un conjunto de segmentos de música tomados de un archivo wav.
 */
exports.__esModule = true;
// import * as WFM from './wavfilemanager';
var MusicMix = /** @class */ (function () {
    // Constructor de la clase
    function MusicMix() {
        this.leftChannel = new Float32Array(0);
        this.rightChannel = new Float32Array(0);
        this.canciones = [];
    }
    /**
     * Agrega una canción o sonido a las canciones base para hacer el mix.
     * @param cancion La canción que se desea agregar.
     */
    /*public addSong(cancion: WFM.IAudioData) {
      this.canciones.push([cancion.channelData[0], cancion.channelData[1]]);
    }*/
    /**
     * Agrega una canción dando los dos canales.
     * @param leftChannel El canal izquierdo de la canción que se desea agregar.
     * @param rightChannel El canal derecha de la canción que se desea agregar.
     */
    MusicMix.prototype.addSongChannels = function (leftChannel, rightChannel) {
        this.canciones.push([this.float32Copy(leftChannel), this.float32Copy(rightChannel)]);
    };
    /**
     * Agrega varias canciones o sonidos a las canciones base para hacer el mix.
     * @param canciones Las canciones o sonidos que se desea agregar.
     */
    /*public addSongs(canciones: WFM.IAudioData[]) {
      canciones.forEach(cancion => {
        this.canciones.push([cancion.channelData[0], cancion.channelData[1]]);
      });
    }*/
    /**
     * Agrega varias canciones o sonidos a las canciones base para hacer el mix.
     * @param canciones Las canciones o sonidos que se desea agregar.
     */
    MusicMix.prototype.addSongsChannels = function (canciones) {
        this.canciones = this.canciones.concat(canciones);
    };
    /**
     * Crea el mix tomando intercambiando el efecto y tomando de manera aleatoria la canción o sonido
     * para cada una de las partes de la nueva canción hasta que complete el tiempo indicado.
     * @param time El tiempo de la canción que se desea realizar.
     */
    MusicMix.prototype.hacerMixAleatorio = function (time) {
        var largoTotal = time * MusicMix.samplingFrecuency;
        var efecto = -1;
        while (this.leftChannel.length < largoTotal) {
            efecto = efecto + 1;
            efecto = efecto % MusicMix.numEffects;
            var numCancion = Math.floor(Math.random() * this.canciones.length);
            switch (efecto) {
                case 0:
                    this.loops(this.canciones[numCancion][0], this.canciones[numCancion][1], 4 + Math.random() * 3);
                    break;
                case 1:
                    this.leftToRightToBoth(this.canciones[numCancion][0], this.canciones[numCancion][1], 4);
                    break;
                case 2:
                    this.sonidoSilencio(this.canciones[numCancion][0], this.canciones[numCancion][1], 6 + Math.random() * 4);
                    break;
            }
        }
    };
    /**
     * Repite un audio varias veces hasta cubrir los segundos indicados.
     * Ambos audios deben tener la misma cantidad de samples.
     * @param leftChannel El canal izquierdo que se quiere copiar.
     * @param rightChannel El canal derecho que se quiere copiar.
     * @param time El tiempo en segundos que se quiere que se repita el sonido.
     */
    MusicMix.prototype.loops = function (leftChannel, rightChannel, time) {
        var numSamples = leftChannel.length;
        // Copia el canal izquierdo y derecho para iniciar el loop
        var mixLeftChannel = new Float32Array(0);
        var mixRightChannel = new Float32Array(0);
        // Variables del while
        var duracionWhile = 0;
        var totalLoopSampling = time * MusicMix.samplingFrecuency;
        // Se intercala el sonido con el silencio
        while (duracionWhile < totalLoopSampling) {
            mixLeftChannel = this.float32Concat(mixLeftChannel, leftChannel);
            mixRightChannel = this.float32Concat(mixRightChannel, rightChannel);
            duracionWhile = duracionWhile + numSamples;
        }
        // Se agrega el resultado al mix
        this.leftChannel = this.float32Concat(this.leftChannel, mixLeftChannel);
        this.rightChannel = this.float32Concat(this.rightChannel, mixRightChannel);
    };
    /**
     * Realiza un audio que inicia sonando sólo en el canal izquierdo,
     * luego suena sólo el canal derecho y termina sonando los dos
     * canales. Ambos audios deben tener la misma cantidad de samples.
     * @param leftChannel El canal izquierdo que se quiere copiar.
     * @param rightChannel El canal derecho que se quiere copiar.
     * @param time El tiempo en segundos que se quiere que se repita el sonido.
     */
    MusicMix.prototype.leftToRightToBoth = function (leftChannel, rightChannel, time) {
        var numSamples = leftChannel.length;
        var mixLeftChannel = new Float32Array(0);
        var mixRightChannel = new Float32Array(0);
        // Crea un array de silencio para intercalarlo con el sonido,
        // tiene el mismo tamaño que el audio original
        var silencio = new Float32Array(numSamples);
        // Variables del while
        var duracionWhile = 0;
        var totalLoopSampling = time * MusicMix.samplingFrecuency;
        // Se intercala el sonido en cada canal con el sonido en ambos canales
        while (duracionWhile < totalLoopSampling) {
            // Copia el canal izquierdo y derecho para iniciar el loop
            mixLeftChannel = this.float32Concat(mixLeftChannel, leftChannel);
            mixRightChannel = this.float32Concat(mixRightChannel, silencio);
            mixLeftChannel = this.float32Concat(mixLeftChannel, silencio);
            mixRightChannel = this.float32Concat(mixRightChannel, rightChannel);
            mixLeftChannel = this.float32Concat(mixLeftChannel, leftChannel);
            mixRightChannel = this.float32Concat(mixRightChannel, rightChannel);
            duracionWhile = duracionWhile + 3 * numSamples;
        }
        // Se agrega el resultado al mix
        this.leftChannel = this.float32Concat(this.leftChannel, mixLeftChannel);
        this.rightChannel = this.float32Concat(this.rightChannel, mixRightChannel);
    };
    /**
     * Intercala un audio con un silencio con la misma duración varias veces
     * hasta cubrir los segundos indicados. Ambos audios deben tener la misma
     * cantidad de samples.
     * @param leftChannel El canal izquierdo que se quiere copiar.
     * @param rightChannel El canal derecho que se quiere copiar.
     * @param time El tiempo en segundos que se quiere que se repita el sonido.
     */
    MusicMix.prototype.sonidoSilencio = function (leftChannel, rightChannel, time) {
        var numSamples = leftChannel.length;
        // Copia el canal izquierdo y derecho para iniciar el loop
        var mixLeftChannel = new Float32Array(0);
        var mixRightChannel = new Float32Array(0);
        // Crea un array de silencio para intercalarlo con el sonido
        // const duracionBlanco: number = mixLeftChannel.length;
        var silencio = new Float32Array(numSamples);
        // Variables del while
        var duracionWhile = 0;
        var totalLoopSampling = time * MusicMix.samplingFrecuency;
        // Se intercala el sonido con el silencio
        while (duracionWhile < totalLoopSampling) {
            mixLeftChannel = this.float32Concat(mixLeftChannel, leftChannel);
            mixRightChannel = this.float32Concat(mixRightChannel, rightChannel);
            mixLeftChannel = this.float32Concat(mixLeftChannel, silencio);
            mixRightChannel = this.float32Concat(mixRightChannel, silencio);
            duracionWhile = duracionWhile + 2 * numSamples;
        }
        // Se agrega el resultado al mix
        this.leftChannel = this.float32Concat(this.leftChannel, mixLeftChannel);
        this.rightChannel = this.float32Concat(this.rightChannel, mixRightChannel);
    };
    // Getters y Setters
    /**
     * Devuelve el canal izquierdo del mix.
     */
    MusicMix.prototype.getLeftChannel = function () {
        return this.leftChannel;
    };
    /**
     * Define el canal izquierdo del mix.
     * @param leftChannel El nuevo canal izquierdo.
     */
    MusicMix.prototype.setLeftChannel = function (leftChannel) {
        this.leftChannel = leftChannel;
    };
    /**
     * Devuelve el canal derecho del mix.
     */
    MusicMix.prototype.getRightChannel = function () {
        return this.rightChannel;
    };
    /**
     * Define el canal derecho del mix.
     * @param leftChannel El nuevo canal derecho.
     */
    MusicMix.prototype.setRightChannel = function (rightChannel) {
        this.rightChannel = rightChannel;
    };
    // Métodos privados
    /*
     * Concatena dos arrays de tipo Float32Array.
     * El resultado se devuelve en un nuevo arreglo del mismo tipo.
     */
    MusicMix.prototype.float32Concat = function (first, second) {
        var firstLength = first.length;
        var result = new Float32Array(firstLength + second.length);
        result.set(first);
        result.set(second, firstLength);
        return result;
    };
    /*
     * Concatena dos arrays de tipo Float32Array.
     * El resultado se devuelve en un nuevo arreglo del mismo tipo.
     */
    MusicMix.prototype.float32Copy = function (first) {
        var result = new Float32Array(first.length);
        result.set(first);
        return result;
    };
    // Frecuencia de los samples que se van a trabajar
    MusicMix.samplingFrecuency = 44100;
    // Cantidad total de efectos disponibles
    MusicMix.numEffects = 3;
    return MusicMix;
}());
exports.MusicMix = MusicMix;
