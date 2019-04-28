"use strict";
/**
 * Filename: musicprocess.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase que procesa la música
 */
exports.__esModule = true;
var MM = require("./musicmix");
var MusicProcess = /** @class */ (function () {
    function MusicProcess(leftChannel, rightChannel, leftChannel2, rightChannel2) {
        this.leftChannel = leftChannel;
        this.rightChannel = rightChannel;
        this.leftChannel2 = leftChannel2;
        this.rightChannel2 = rightChannel2;
        console.log('Preparando la canción...');
        this.leftChannelBeats = this.getBeatsPerSecond(this.leftChannel);
        this.rightChannelBeats = this.getBeatsPerSecond(this.rightChannel);
        this.leftChannelBeats2 = this.getBeatsPerSecond(this.leftChannel2);
        this.rightChannelBeats2 = this.getBeatsPerSecond(this.rightChannel2);
        this.matchTimes = [];
        this.mix = new MM.MusicMix();
    }
    // Funciones disponibles de la clase
    /**
     * Crea un nuevo array que es copia del original pero con la posición de
     * cada elemento numerada desde el offset y en valor absoluto.
     * @param original El arreglo original que se desea copiar
     * @param offset El valor a partir del cual se quiere inicial la numeración.
     */
    MusicProcess.prototype.createNumberedAbsoluteArray = function (original, offset) {
        var copia = [];
        for (var pos = 0; pos < original.length; pos = pos + 1) {
            copia.push([offset + pos, Math.abs(original[pos])]);
        }
        return copia;
    };
    MusicProcess.prototype.match = function () {
        var leftMatchTimes = this.matchChannel(this.leftChannelBeats, this.leftChannelBeats2);
        var rightMatchTimes = this.matchChannel(this.rightChannelBeats, this.rightChannelBeats2);
        console.log('MatchTimes:');
        console.log(leftMatchTimes);
        console.log(rightMatchTimes);
        var matchPoints = this.refineBothChannels(leftMatchTimes, rightMatchTimes);
        this.matchTimes = new Array(matchPoints.length);
        for (var pos = 0; pos < matchPoints.length; pos = pos + 1) {
            this.matchTimes[pos] = matchPoints[pos] / MusicProcess.samplingFrecuency;
        }
        return this.matchTimes;
    };
    MusicProcess.prototype.refineBothChannels = function (lChannel, rChannel) {
        return this.refine(this.sortArray(lChannel.concat(rChannel)));
    };
    MusicProcess.prototype.refine = function (tiempos) {
        if (tiempos.length < 2) {
            return tiempos;
        }
        var refinado = [];
        for (var pos = 0; pos < tiempos.length - 1; pos = pos + 1) {
            if (this.compare(tiempos[pos], tiempos[pos + 1], MusicProcess.tolerance)) {
                refinado.push(tiempos[pos]);
                pos = pos + 1;
            }
        }
        return refinado;
    };
    MusicProcess.prototype.matchChannel = function (channel1, channel2) {
        var matchTimes = [];
        var max = channel1.length - channel2.length;
        for (var pos = 0; pos < max; pos = pos + 1) {
            if (this.getMatchPercentage(channel1, pos, channel2, 0) > MusicProcess.succesPercentage) {
                matchTimes.push(channel1[pos] - channel2[0]);
                console.log(this.getMatchPercentage(channel1, pos, channel2, 0));
            }
        }
        return matchTimes;
    };
    MusicProcess.prototype.getMatchPercentage = function (song1, posSong1, song2, posSong2) {
        var max = Math.min(song1.length - posSong1, song2.length - posSong2);
        var percentage = 0;
        var offsetSong1 = song1[posSong1];
        var offsetSong2 = song2[posSong2];
        if (max > 1) {
            for (var pos = 0; pos < max; pos = pos + 1) {
                if (this.compare(song1[posSong1 + pos] - offsetSong1, song2[posSong2 + pos] - offsetSong2, MusicProcess.tolerance)) {
                    percentage = percentage + 1;
                }
            }
            percentage = percentage / max;
        }
        return percentage;
    };
    MusicProcess.prototype.getBeats = function (songChannel, offset) {
        // Se copia el canal en un array enumerado y con los valores positivos
        var newChannel = this.createNumberedAbsoluteArray(songChannel, offset);
        // Se ordena el canal por el valor del sonido
        newChannel = this.sortArrayBySecondPos(newChannel);
        // Se obtiene el porcentaje de samples requerido
        var numsamples = Math.floor(MusicProcess.samplesPercentage * newChannel.length);
        newChannel = newChannel.slice(newChannel.length - numsamples);
        // Se ordena por tiempo
        newChannel = this.sortArrayByFirstPos(newChannel);
        // Se obtienen los tiempos de los beats del canal
        var beats = this.refinarBeats(newChannel);
        return beats;
    };
    MusicProcess.prototype.getBeatsPerSecond = function (songChannel) {
        var pos = 0;
        var beats = [];
        while (pos < songChannel.length) {
            var nextPos = pos + MusicProcess.samplingFrecuency;
            if (nextPos < songChannel.length) {
                beats = beats.concat(this.getBeats(songChannel.slice(pos, nextPos), pos));
            }
            else {
                beats = beats.concat(this.getBeats(songChannel.slice(pos), pos));
            }
            pos = nextPos;
        }
        return beats;
    };
    /**
     * Busca los diez segundos que más se repiten en la canción y
     * los utiliza para realizar un mix.
     */
    MusicProcess.prototype.dj = function () {
        var _this = this;
        var samples = [];
        for (var cantSongs = 0; cantSongs < 60; cantSongs = cantSongs + 1) {
            var pos = Math.floor(Math.random() * this.leftChannel.length);
            this.leftChannel.set(this.leftChannel.slice(pos, pos +
                MusicProcess.samplingFrecuency));
            this.rightChannel.set(this.rightChannel.slice(pos, pos +
                MusicProcess.samplingFrecuency));
            samples.push([pos, this.match().length]);
        }
        this.sortArrayBySecondPos(samples);
        samples = samples.slice(0, 10);
        var sonidos = [];
        var sonidoChannelLeft = new Float32Array(MusicProcess.samplingFrecuency);
        var sonidoChannelRight = new Float32Array(MusicProcess.samplingFrecuency);
        samples.forEach(function (sample) {
            var pos = sample[0];
            sonidoChannelLeft.set(_this.leftChannel.slice(pos, pos + MusicProcess.samplingFrecuency));
            sonidoChannelRight.set(_this.rightChannel.slice(pos, pos + MusicProcess.samplingFrecuency));
            sonidos.push([_this.float32Copy(sonidoChannelLeft), _this.float32Copy(sonidoChannelRight)]);
        });
        this.mix.addSongsChannels(sonidos);
        this.mix.hacerMixAleatorio(60);
        return [this.mix.getleftChannel(), this.mix.getrightChannel()];
    };
    MusicProcess.prototype.compose = function () {
    };
    // Getters y Setters
    /**
     * Devuelve el canal izquierdo del mix.
     */
    MusicProcess.prototype.getleftChannel = function () {
        return this.leftChannel;
    };
    /**
     * Define el canal izquierdo del mix.
     * @param leftChannel El nuevo canal izquierdo.
     */
    MusicProcess.prototype.setleftChannel = function (leftChannel) {
        this.leftChannel = leftChannel;
    };
    /**
     * Devuelve el canal derecho del mix.
     */
    MusicProcess.prototype.getrightChannel = function () {
        return this.rightChannel;
    };
    /**
     * Define el canal derecho del mix.
     * @param leftChannel El nuevo canal derecho.
     */
    MusicProcess.prototype.setrightChannel = function (rightChannel) {
        this.rightChannel = rightChannel;
    };
    /**
     * Devuelve el arreglo con los tiempos en donde hay match.
     */
    MusicProcess.prototype.getMatchTimes = function () {
        return this.matchTimes;
    };
    /**
     * Define el arreglo con los tiempos en donde hay match.
     * @param matchTimes El nuevo arreglo de tiempos.
     */
    MusicProcess.prototype.setMatchTimes = function (matchTimes) {
        this.matchTimes = matchTimes;
    };
    /**
     * Devuelve la canción tomando sólo las partes donde hubo match.
     */
    MusicProcess.prototype.getMatchSong = function () {
        var tamanno = this.matchTimes.length * this.leftChannel2.length;
        var leftChannel = new Float32Array(tamanno);
        var rightChannel = new Float32Array(tamanno);
        for (var pos = 0; pos < this.matchTimes.length; pos = pos + 1) {
            var begin = Math.floor(this.matchTimes[pos] * MusicProcess.samplingFrecuency);
            var end = begin + this.leftChannel2.length;
            leftChannel.set(this.leftChannel.slice(begin, end), Math.floor(pos * this.leftChannel2.length));
            rightChannel.set(this.rightChannel.slice(begin, end), Math.floor(pos * this.rightChannel2.length));
        }
        return [leftChannel, rightChannel];
    };
    /**
     * Devuelve la canción quitando las partes donde hubo match.
     */
    MusicProcess.prototype.getUnMatchSong = function () {
        var tamanno = this.leftChannel.length -
            this.matchTimes.length * this.leftChannel2.length;
        var leftChannel = new Float32Array(tamanno);
        var rightChannel = new Float32Array(tamanno);
        var posActual = 0;
        if (this.matchTimes.length === 0) {
            leftChannel.set(this.leftChannel);
            rightChannel.set(this.rightChannel);
        }
        else {
            for (var pos = 0; pos < this.matchTimes.length + 1; pos = pos + 1) {
                var begin = void 0;
                var end = void 0;
                if (pos !== 0) {
                    begin = Math.floor(this.matchTimes[pos - 1] * MusicProcess.samplingFrecuency
                        + this.leftChannel2.length);
                }
                else {
                    begin = 0;
                }
                if (pos !== this.matchTimes.length) {
                    end = Math.floor(this.matchTimes[pos] * MusicProcess.samplingFrecuency);
                }
                else {
                    end = this.leftChannel.length;
                }
                leftChannel.set(this.leftChannel.slice(begin, end), posActual);
                rightChannel.set(this.rightChannel.slice(begin, end), posActual);
                posActual = posActual + end - begin;
            }
        }
        return [leftChannel, rightChannel];
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
    /**
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
    /**
     * Toma los valores en donde se dio el porcentaje de valores mayores
     * y los refina quitando lo que están muy cercanos (repetidos).
     * @param tiempos El arreglo con los tiempos en que se dio match.
     */
    MusicProcess.prototype.refinarBeats = function (tiempos) {
        var refinado = [];
        var pos = 0;
        while (pos < tiempos.length - MusicProcess.repetitions) {
            if (this.compare(tiempos[pos][0], tiempos[pos + MusicProcess.repetitions][0], MusicProcess.repetitionsTime)) {
                var pos2 = pos + MusicProcess.repetitions + 1;
                while (pos2 < tiempos.length &&
                    this.compare(tiempos[pos][0], tiempos[pos2][0], MusicProcess.minTimeBetweenBeats)) {
                    pos2 = pos2 + 1;
                }
                refinado.push(tiempos[pos][0]);
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
    /**
     * Función que ordena un array de enteros por el segundo valor del elemento.
     * @param pSong Array que se quiere ordenar.
     */
    MusicProcess.prototype.sortArrayBySecondPos = function (tiempos) {
        return tiempos.sort(function (time1, time2) {
            if (time1[1] < time2[1]) {
                return -1;
            }
            if (time1[1] > time2[1]) {
                return 1;
            }
            return 0;
        });
    };
    /**
     * Función que ordena un array de enteros por el primer valor del elemento.
     * @param pSong Array que se quiere ordenar.
     */
    MusicProcess.prototype.sortArrayByFirstPos = function (tiempos) {
        return tiempos.sort(function (time1, time2) {
            if (time1[0] < time2[0]) {
                return -1;
            }
            if (time1[0] > time2[0]) {
                return 1;
            }
            return 0;
        });
    };
    /**
     * Hace una copia de un array de tipo Float32Array.
     * @param original Arreglo original que se desea copiar.
     */
    MusicProcess.prototype.float32Copy = function (original) {
        var result = new Float32Array(original.length);
        result.set(original);
        return result;
    };
    /* Nivel de confianza.
     * El valor estará entre 0 y 1.
     * 0 significa que considerará que todos los sonidos son iguales.
     * 1 significa que sólo una coincidencia (casi) exacta funcionará.
     * Entre mayor confianza los resultados serán más exactos pero durará más.
     * Entre menos confianza se presentarán más falsos positivos pero durará menos.
     */
    // private static readonly confianza: number = 0.9;
    // Frecuencia de los samples que se van a trabajar
    MusicProcess.samplingFrecuency = 44100;
    // Tolerancia en el tiempo para considerar que dos Beats sonaron al mismo tiempo considerando que 44100 son un segundo
    MusicProcess.tolerance = 8820; // 4410; Con 4410 no me agarraba el pitch
    // Cantidad de repeticiones para considerar que el sonido es un beat de la canción
    MusicProcess.repetitions = 3;
    // Tiempo entre las repeticiones para considerar que el sonido es un beat de la canción considerando que 44100 son un segundo
    MusicProcess.repetitionsTime = 882;
    // El mínimo tiempo posible entre dos beats (de acuerdo a la medida de beats por minuto de las canciones, lás más rápidas llegan a 300
    // lo que representa 5 beats por segundo o cada 8820)
    MusicProcess.minTimeBetweenBeats = 8820;
    // Cantidad de samples como porcentaje que se van a obtener para comparar
    MusicProcess.samplesPercentage = 0.01;
    // Porcentaje de igualdad entre la canción original y el sample para considerarlas que hicieron match
    MusicProcess.succesPercentage = 0.80;
    return MusicProcess;
}());
exports.MusicProcess = MusicProcess;
