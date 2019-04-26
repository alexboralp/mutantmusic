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
    function MusicProcess(audioChannelLeft, audioChannelRight, audioChannelLeft2, audioChannelRight2) {
        this.audioChannelLeft = audioChannelLeft;
        this.audioChannelRight = audioChannelRight;
        this.audioChannelLeft2 = audioChannelLeft2;
        this.audioChannelRight2 = audioChannelRight2;
        this.matchTimes = [];
        this.mix = new MM.MusicMix();
    }
    // Funciones disponibles de la clase
    MusicProcess.prototype.match = function () {
        var totalSamples = Math.floor(MusicProcess.samplesPerSecondToCompare
            * this.audioChannelLeft2.length
            / MusicProcess.samplingFrecuency);
        var originales = [];
        var resp = [];
        console.log('Sacando los samples del segundo audio...');
        for (var cont = 0; cont < totalSamples; cont = cont + 1) {
            var pos = MusicProcess.averageInterval + Math.floor(Math.random() * (this.audioChannelLeft2.length - 2 * MusicProcess.averageInterval));
            originales.push([pos, this.getAverageValue(pos, this.audioChannelLeft2), this.getAverageValue(pos, this.audioChannelRight2)]);
        }
        var totalSamplesCancion = Math.floor(MusicProcess.samplesPerSecondSong
            * this.audioChannelLeft.length
            / MusicProcess.samplingFrecuency);
        console.log('Comparando con los samples de la canción original...');
        for (var cont = 0; cont < totalSamplesCancion; cont = cont + 1) {
            var pos = Math.floor(Math.random() * (this.audioChannelLeft.length - this.audioChannelLeft2.length));
            var cont2 = 0;
            var continuar = true;
            while (continuar && cont2 < totalSamples) {
                var offset = originales[cont2][0];
                continuar = (this.compare(originales[cont2][1], this.getAverageValue(offset + pos, this.audioChannelLeft), MusicProcess.tolerance) &&
                    this.compare(originales[cont2][2], this.getAverageValue(offset + pos, this.audioChannelRight), MusicProcess.tolerance));
                cont2 = cont2 + 1;
            }
            //console.log(cont + ', ' + totalSamplesCancion);
            if (continuar) {
                resp.push(pos / MusicProcess.samplingFrecuency);
            }
        }
        console.log('Valores encontrados:');
        console.log(resp);
        console.log('Refinando la búsqueda...');
        this.matchTimes = this.refinarBusqueda(this.sortArray(resp));
        return this.matchTimes;
    };
    /*private getAverageValue(pos: number, array: Float32Array): number {
      let average: number = 0;
      let newPos: number;
      for (let rep = 0; rep < MusicProcess.samplesAverage; rep = rep + 1){
        do {
          newPos = pos + Math.floor(Math.random() * MusicProcess.averageInterval - MusicProcess.averageInterval / 2);
        }while (newPos >= array.length);
        average = average + array[newPos];
      }
      return average / MusicProcess.samplesAverage;
    }*/
    MusicProcess.prototype.getAverageValue = function (pos, array) {
        var average = 0;
        for (var newPos = pos - MusicProcess.averageInterval; newPos < pos + MusicProcess.averageInterval; newPos = newPos + 1) {
            average = average + array[newPos];
        }
        return average / (2 * MusicProcess.averageInterval);
    };
    /**
     * Busca los diez segundos que más se repiten en la canción y
     * los utiliza para realizar un mix.
     */
    MusicProcess.prototype.dj = function () {
        var _this = this;
        var samples = [];
        for (var cantSongs = 0; cantSongs < 60; cantSongs = cantSongs + 1) {
            var pos = Math.floor(Math.random() * this.audioChannelLeft.length);
            this.audioChannelLeft.set(this.audioChannelLeft.slice(pos, pos +
                MusicProcess.samplingFrecuency));
            this.audioChannelRight.set(this.audioChannelRight.slice(pos, pos +
                MusicProcess.samplingFrecuency));
            samples.push([pos, this.match().length]);
        }
        this.sortArrayDj(samples);
        samples = samples.slice(0, 10);
        var sonidos = [];
        var sonidoChannelLeft = new Float32Array(MusicProcess.samplingFrecuency);
        var sonidoChannelRight = new Float32Array(MusicProcess.samplingFrecuency);
        samples.forEach(function (sample) {
            var pos = sample[0];
            sonidoChannelLeft.set(_this.audioChannelLeft.slice(pos, pos + MusicProcess.samplingFrecuency));
            sonidoChannelRight.set(_this.audioChannelRight.slice(pos, pos + MusicProcess.samplingFrecuency));
            sonidos.push([_this.float32Copy(sonidoChannelLeft), _this.float32Copy(sonidoChannelRight)]);
        });
        this.mix.addSongsChannels(sonidos);
        this.mix.hacerMixAleatorio(60);
        return [this.mix.getAudioChannelLeft(), this.mix.getAudioChannelRight()];
    };
    MusicProcess.prototype.compose = function () {
    };
    // Getters y Setters
    /**
     * Devuelve el canal izquierdo del mix.
     */
    MusicProcess.prototype.getAudioChannelLeft = function () {
        return this.audioChannelLeft;
    };
    /**
     * Define el canal izquierdo del mix.
     * @param audioChannelLeft El nuevo canal izquierdo.
     */
    MusicProcess.prototype.setAudioChannelLeft = function (audioChannelLeft) {
        this.audioChannelLeft = audioChannelLeft;
    };
    /**
     * Devuelve el canal derecho del mix.
     */
    MusicProcess.prototype.getAudioChannelRight = function () {
        return this.audioChannelRight;
    };
    /**
     * Define el canal derecho del mix.
     * @param audioChannelLeft El nuevo canal derecho.
     */
    MusicProcess.prototype.setAudioChannelRight = function (audioChannelRight) {
        this.audioChannelRight = audioChannelRight;
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
        var tamanno = this.matchTimes.length * this.audioChannelLeft2.length;
        var leftChannel = new Float32Array(tamanno);
        var rightChannel = new Float32Array(tamanno);
        for (var pos = 0; pos < this.matchTimes.length; pos = pos + 1) {
            var begin = Math.floor(this.matchTimes[pos] * MusicProcess.samplingFrecuency);
            var end = begin + this.audioChannelLeft2.length;
            leftChannel.set(this.audioChannelLeft.slice(begin, end), Math.floor(pos * this.audioChannelLeft2.length));
            rightChannel.set(this.audioChannelRight.slice(begin, end), Math.floor(pos * this.audioChannelRight2.length));
        }
        return [leftChannel, rightChannel];
    };
    /**
     * Devuelve la canción quitando las partes donde hubo match.
     */
    MusicProcess.prototype.getUnMatchSong = function () {
        var tamanno = this.audioChannelLeft.length -
            this.matchTimes.length * this.audioChannelLeft2.length;
        var leftChannel = new Float32Array(tamanno);
        var rightChannel = new Float32Array(tamanno);
        var posActual = 0;
        if (this.matchTimes.length === 0) {
            leftChannel.set(this.audioChannelLeft);
            rightChannel.set(this.audioChannelRight);
        }
        else {
            for (var pos = 0; pos < this.matchTimes.length + 1; pos = pos + 1) {
                var begin = void 0;
                var end = void 0;
                if (pos !== 0) {
                    begin = Math.floor(this.matchTimes[pos - 1] * MusicProcess.samplingFrecuency
                        + this.audioChannelLeft2.length);
                }
                else {
                    begin = 0;
                }
                if (pos !== this.matchTimes.length) {
                    end = Math.floor(this.matchTimes[pos] * MusicProcess.samplingFrecuency);
                }
                else {
                    end = this.audioChannelLeft.length;
                }
                leftChannel.set(this.audioChannelLeft.slice(begin, end), posActual);
                rightChannel.set(this.audioChannelRight.slice(begin, end), posActual);
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
     * Toma los valores en donde se dio el match y los refina quitando los puntos
     * que están muy cercanos (repetidos).
     * @param tiempos El arreglo con los tiempos en que se dio match.
     */
    MusicProcess.prototype.refinarBusqueda = function (tiempos) {
        if (tiempos.length < 2) {
            return tiempos;
        }
        var refinado = [];
        var pos = 0;
        var tiempoSample = this.audioChannelLeft2.length / MusicProcess.samplingFrecuency;
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
    /**
     * Función que ordena un array de enteros por el segundo valor del elemento.
     * @param pSong Array que se quiere ordenar.
     */
    MusicProcess.prototype.sortArrayDj = function (tiempos) {
        return tiempos.sort(function (time1, time2) {
            if (time1[1] > time2[1]) {
                return -1;
            }
            if (time1[1] < time2[1]) {
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
    // Tolerancia para considerar que dos valores son iguales
    MusicProcess.tolerance = 0.15;
    // Cantidad de repeticiones para considerar que el sonido sí es igual
    MusicProcess.repeticiones = 1;
    // Tiempo entre las repeticiones para considerar que el sonido sí es igual
    MusicProcess.toleranceTime = 0.3;
    // Cantidad de samples por segundo que se van a obtener del segundo sonido para comparar
    MusicProcess.samplesPerSecondToCompare = 30;
    // Cantidad de samples por segundo que se van a trabajar de la canción original
    MusicProcess.samplesPerSecondSong = 20000;
    // Cantidad de samples que se utilizarán para sacar el promedio alrededor del sample anterior.
    // private static readonly samplesAverage: number = 20;
    // Intervalo alrededor del sample original donde se tomarán los samples para el promedio, 10 puntos antes y 10 puntos después.
    MusicProcess.averageInterval = 10;
    return MusicProcess;
}());
exports.MusicProcess = MusicProcess;
