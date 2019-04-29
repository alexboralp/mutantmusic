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
     * Devuelve una lista con los tiempos en donde la segunda canción aparece
     * en la primera.
     */
    MusicProcess.prototype.match = function () {
        var leftMatchTimes = this.matchChannel(this.leftChannelBeats, this.leftChannelBeats2);
        var rightMatchTimes = this.matchChannel(this.rightChannelBeats, this.rightChannelBeats2);
        var matchPoints = this.refineBothChannels(leftMatchTimes, rightMatchTimes);
        this.matchTimes = [matchPoints.length];
        for (var pos = 0; pos < matchPoints.length; pos = pos + 1) {
            this.matchTimes[pos] = matchPoints[pos] / MusicProcess.samplingFrecuency;
        }
        return this.matchTimes;
    };
    /**
     * Busca los diez tonadas de dos segundos que más se repiten en la canción y
     * los utiliza para realizar un mix.
     * Para obtener las tonadas se va tomando la canción cada dos segundos y
     * se utiliza la función match para obtener la cantidad de veces que se repite,
     * para que no haya repetición se guardarán los tiempos que ya se han buscado
     * y si se encuentra en alguno de estos entonces se lo brinca.
     */
    MusicProcess.prototype.dj = function () {
        var samples = this.getDJTimes(2 * MusicProcess.samplingFrecuency);
        this.mix.addSongsChannels(this.getSamplesFromSong(samples, 2 * MusicProcess.samplingFrecuency));
        this.mix.hacerMixAleatorio(60);
        return [this.mix.getLeftChannel(), this.mix.getRightChannel()];
    };
    MusicProcess.prototype.compose = function () {
    };
    // Getters y Setters
    /**
     * Devuelve el canal izquierdo de la primera canción.
     */
    MusicProcess.prototype.getLeftChannel = function () {
        return this.leftChannel;
    };
    /**
     * Define el canal izquierdo de la primera canción.
     * @param leftChannel El nuevo canal izquierdo.
     */
    MusicProcess.prototype.setLeftChannel = function (leftChannel) {
        this.leftChannel = leftChannel;
        console.log('Preparando la canción...');
        this.leftChannelBeats = this.getBeatsPerSecond(this.leftChannel);
    };
    /**
     * Devuelve el canal derecho de la primera canción.
     */
    MusicProcess.prototype.getRightChannel = function () {
        return this.rightChannel;
    };
    /**
     * Define el canal derecho de la primera canción.
     * @param rightChannel El nuevo canal derecho.
     */
    MusicProcess.prototype.setRightChannel = function (rightChannel) {
        this.rightChannel = rightChannel;
        console.log('Preparando la canción...');
        this.rightChannelBeats = this.getBeatsPerSecond(this.rightChannel);
    };
    /**
     * Devuelve el canal izquierdo de la segunda canción.
     */
    MusicProcess.prototype.getLeftChannel2 = function () {
        return this.leftChannel2;
    };
    /**
     * Define el canal izquierdo de la segunda canción.
     * @param leftChannel El nuevo canal izquierdo.
     */
    MusicProcess.prototype.setLeftChannel2 = function (leftChannel) {
        this.leftChannel2 = leftChannel;
        console.log('Preparando la canción...');
        this.leftChannelBeats2 = this.getBeatsPerSecond(this.leftChannel2);
    };
    /**
     * Devuelve el canal derecho de la segunda canción.
     */
    MusicProcess.prototype.getRightChannel2 = function () {
        return this.rightChannel2;
    };
    /**
     * Define el canal derecho de la segunda canción.
     * @param rightChannel El nuevo canal derecho.
     */
    MusicProcess.prototype.setRightChannel2 = function (rightChannel) {
        this.rightChannel2 = rightChannel;
        console.log('Preparando la canción...');
        this.rightChannelBeats2 = this.getBeatsPerSecond(this.rightChannel2);
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
    /**
     * Crea un nuevo array que es copia del original pero con la posición de
     * cada elemento numerada desde el offset y en valor absoluto.
     * @param original El arreglo original que se desea copiar.
     * @param offset El valor a partir del cual se quiere inicial la numeración.
     */
    MusicProcess.prototype.createNumberedAbsoluteArray = function (original, offset) {
        var copia = [];
        for (var pos = 0; pos < original.length; pos = pos + 1) {
            copia.push([offset + pos, Math.abs(original[pos])]);
        }
        return copia;
    };
    /**
     * Realiza el refinado de ambos canales, tuvo que haber coincidencia en ambos para decir
     * que las dos canciones hicieron match.
     * @param lChannel Canal izquierdo de la canción.
     * @param rChannel Canal derecho de la canción.
     */
    MusicProcess.prototype.refineBothChannels = function (lChannel, rChannel) {
        return this.refine(this.sortArray(lChannel.concat(rChannel)), MusicProcess.tolerance);
    };
    /**
     * Realiza el refinado de los tiempos en los que dos canciones hicieron match.
     * @param tiempos Lista de tiempos ordenada.
     * @param tolerance La tolerancia en el tiempo para decir que dos beats sonaron al mismo tiempo.
     */
    MusicProcess.prototype.refine = function (tiempos, tolerance) {
        if (tiempos.length < 2) {
            return tiempos;
        }
        var refinado = [];
        for (var pos = 0; pos < tiempos.length - 1; pos = pos + 1) {
            if (this.compare(tiempos[pos], tiempos[pos + 1], tolerance)) {
                refinado.push(tiempos[pos]);
                pos = pos + 1;
            }
        }
        return refinado;
    };
    /**
     * Busca los tiempos en que los canales de dos canciones hicieron match.
     * @param channel1 Primer canal de la primera canción.
     * @param channel2 Primer canal de la segunda canción.
     */
    MusicProcess.prototype.matchChannel = function (channel1, channel2) {
        var matchTimes = [];
        var max = channel1.length - channel2.length;
        for (var pos = 0; pos < max; pos = pos + 1) {
            if (this.getMatchPercentage(channel1, pos, channel2, 0) > MusicProcess.succesPercentage) {
                matchTimes.push(channel1[pos] - channel2[0]);
            }
        }
        return matchTimes;
    };
    /**
     * Obtiene el porcentaje de igualdad entre los beats de dos canciones.
     * @param song1 Primera canción.
     * @param posSong1 Beat de la primera canción a partir del cual se realizará la comparación.
     * @param song2 Segunda canción.
     * @param posSong2 Beat de la segunda canción a partir del cual se realizará la comparación.
     */
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
    /**
     * Obtiene los beats de uno de los canales de la canción.
     * @param songChannel El canal de la canción.
     * @param offset El offset del canal a partir del cual debe sacar los beats.
     */
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
    /**
     * Devuelve los beats de la canción dividiéndola por segundo
     * @param songChannel Uno de los canales de la canción.
     */
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
     * Obtiene los tiempos de las partes que más se repiten de la primera canción.
     * Básicamente divide la canción de acuerdo al tiempo indicado y revisa la cantidad de
     * repeticiones de dicha parte, se evita repetir partes que ya se revisaron.
     */
    MusicProcess.prototype.getDJTimes = function (time) {
        var times = [];
        var usedTimes = {};
        var max = this.leftChannel.length / time - 1;
        var posLeft1 = 0;
        var posLeft2 = 0;
        var posRight1 = 0;
        var posRight2 = 0;
        for (var cantPartes = 0; cantPartes < max; cantPartes = cantPartes + 1) {
            var minTime = cantPartes * MusicProcess.samplingFrecuency;
            // Si no se ha revisado el tiempo
            if (!usedTimes[minTime]) {
                // Se marca como revisado
                usedTimes[minTime] = true;
                var maxTime = (cantPartes + 1) * MusicProcess.samplingFrecuency;
                posLeft1 = posLeft2;
                posRight1 = posRight2;
                while (this.leftChannelBeats[posLeft2] < maxTime) {
                    posLeft2 = posLeft2 + 1;
                }
                while (this.leftChannelBeats[posRight2] < maxTime) {
                    posRight2 = posRight2 + 1;
                }
                this.leftChannelBeats2 = this.leftChannelBeats.slice(posLeft1, posLeft2);
                this.rightChannelBeats2 = this.rightChannelBeats.slice(posRight1, posRight2);
                // Agrega todos los match como tiempos ya usados
                var matchTimes = this.match();
                matchTimes.forEach(function (mtime) {
                    var startTime = Math.floor(mtime / MusicProcess.samplingFrecuency)
                        * MusicProcess.samplingFrecuency;
                    usedTimes[startTime] = true;
                });
                times.push([minTime, matchTimes.length]);
            }
        }
        this.sortArrayBySecondPos(times);
        times = times.slice(0, 10);
        return times;
    };
    /**
     * Obtiene partes de la primera canción del tamaño dado y las agrega al DJ.
     * @param samples Los samples que se desean tomar de la canción ordenadas por apariciones
     */
    MusicProcess.prototype.getSamplesFromSong = function (samples, tamanno) {
        var _this = this;
        var sonidos = [];
        var sonidoChannelLeft = new Float32Array(tamanno);
        var sonidoChannelRight = new Float32Array(tamanno);
        samples.forEach(function (sample) {
            var pos = sample[0];
            sonidoChannelLeft.set(_this.leftChannel.slice(pos, pos + tamanno));
            sonidoChannelRight.set(_this.rightChannel.slice(pos, pos + tamanno));
            sonidos.push([_this.float32Copy(sonidoChannelLeft), _this.float32Copy(sonidoChannelRight)]);
        });
        return sonidos;
    };
    // Frecuencia de los samples que se van a trabajar
    MusicProcess.samplingFrecuency = 44100;
    // Tolerancia en el tiempo para considerar que dos Beats
    // sonaron al mismo tiempo considerando que 44100 son un segundo
    MusicProcess.tolerance = 8820; // 4410; Con 4410 no me agarraba el pitch
    // Cantidad de repeticiones para considerar que el sonido es un beat de la canción
    MusicProcess.repetitions = 3;
    // Tiempo entre las repeticiones para considerar que el sonido
    // es un beat de la canción considerando que 44100 son un segundo
    MusicProcess.repetitionsTime = 882;
    // El mínimo tiempo posible entre dos beats (de acuerdo a la medida
    // de beats por minuto de las canciones, lás más rápidas llegan a 300
    // lo que representa 5 beats por segundo o cada 8820)
    MusicProcess.minTimeBetweenBeats = 8820;
    // Cantidad de samples como porcentaje que se van a obtener para comparar
    MusicProcess.samplesPercentage = 0.01;
    // Porcentaje de igualdad entre la canción original y el sample para
    // considerarlas que hicieron match
    MusicProcess.succesPercentage = 0.80;
    return MusicProcess;
}());
exports.MusicProcess = MusicProcess;
