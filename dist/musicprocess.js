"use strict";
/**
 * Filename: musicprocess.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase que procesa la música
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MM = __importStar(require("./musicmix"));
class MusicProcess {
    constructor(leftChannel, rightChannel, leftChannel2, rightChannel2) {
        this.leftChannel = leftChannel;
        this.rightChannel = rightChannel;
        this.leftChannel2 = leftChannel2;
        this.rightChannel2 = rightChannel2;
        console.log('Preparing the songs...');
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
    match() {
        const leftMatchTimes = this.matchChannel(this.leftChannelBeats, this.leftChannelBeats2);
        const rightMatchTimes = this.matchChannel(this.rightChannelBeats, this.rightChannelBeats2);
        const matchPoints = this.refineBothChannels(leftMatchTimes, rightMatchTimes);
        this.matchTimes = [matchPoints.length];
        for (let pos = 0; pos < matchPoints.length; pos = pos + 1) {
            this.matchTimes[pos] = matchPoints[pos] / MusicProcess.samplingFrecuency;
        }
        return this.matchTimes;
    }
    /**
     * Busca los diez tonadas de dos segundos que más se repiten en la canción y
     * los utiliza para realizar un mix.
     * Para obtener las tonadas se va tomando la canción cada dos segundos y
     * se utiliza la función match para obtener la cantidad de veces que se repite,
     * para que no haya repetición se guardarán los tiempos que ya se han buscado
     * y si se encuentra en alguno de estos entonces se lo brinca.
     */
    dj() {
        const samples = this.getDJTimes(2 * MusicProcess.samplingFrecuency);
        this.mix.addSongsChannels(this.getSamplesFromSong(samples, 2 * MusicProcess.samplingFrecuency));
        this.mix.hacerMixAleatorio(60);
        return [this.mix.getLeftChannel(), this.mix.getRightChannel()];
    }
    /**
     * Realiza la composición de la primera canción tomando como envolvente
     * la segunda canción. Transforma la primera canción por medio de un
     * algoritmo genético para que su forma cambie a la forma de la primera
     * canción.
     */
    compose() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // Crea el índice donde se guardarán los valores del ADN
                /*let response = this.esCreateIndex();
                response.catch((err)=>
                {
                  console.log("Error while creating the index: " + err);
                  reject();
                });
                response.then((resp)=>
                {*/
                const dnaSong1 = this.getSongDNA(this.leftChannel, this.rightChannel, this.leftChannelBeats, this.rightChannelBeats);
                let dnaSong2 = this.getSongDNA(this.leftChannel2, this.rightChannel2, this.leftChannelBeats2, this.rightChannelBeats2);
                const totalReducedSongValues = Math.ceil(this.leftChannel.length /
                    MusicProcess.sliceSize);
                // Proporciona el ADN de la segunda canción
                dnaSong2 = this.dnaProportion(dnaSong2, dnaSong1.length);
                const distribution = [];
                this.esBulkSong(dnaSong1)
                    .catch((err) => {
                    console.log(`Error en el bulk: ${err}`);
                    reject();
                })
                    .then((resp) => {
                    this.esSearch()
                        .catch((err) => {
                        console.log(`Error en el search: ${err}`);
                        reject();
                    })
                        .then((totales) => {
                        const tot = totales.aggregations.byType.buckets;
                        tot.forEach((t) => {
                            distribution.push([t.key, t.doc_count]);
                        });
                        let individuals = this.createIndividuals(MusicProcess.individualsNumber, distribution, dnaSong1);
                        let bestIndividual = [];
                        let bestPercentage = 0;
                        let seguir = true;
                        let numGenerations = 0;
                        while (seguir) {
                            individuals = this.fitnessOfIndividuals(individuals, dnaSong1, dnaSong2);
                            bestIndividual = individuals[individuals.length - 1];
                            bestPercentage = this.fitnessOfIndividual(bestIndividual, dnaSong1, dnaSong2);
                            if (bestPercentage > bestIndividual.length * MusicProcess.successEndPercentage) {
                                seguir = false;
                            }
                            else {
                                numGenerations = numGenerations + 1;
                                if (numGenerations % 10 === 0) {
                                    process.stdout.write(`Generations: ${numGenerations}` +
                                        `, best percentage so far: ${bestPercentage}` +
                                        ` / ${bestIndividual.length} \r`);
                                }
                                individuals = this.crossIndividuals(individuals, MusicProcess.individualsNumber);
                                individuals = this.mutateIndividuals(individuals, totalReducedSongValues);
                            }
                        }
                        process.stdout.write('\n');
                        console.log('Done.');
                        // console.log(bestIndividual);
                        this.esDeleteIndex()
                            .catch((err) => {
                            console.log(`Error al borrar el índice: ${err}`);
                            reject();
                        })
                            .then(() => {
                            resolve(this.createSong(bestIndividual, this.leftChannel, this.rightChannel, MusicProcess.sliceSize));
                        })
                            .catch((err) => {
                            console.log(`Error: ${err}`);
                            reject();
                        });
                    })
                        .catch((err) => {
                        console.log(`Error: ${err}`);
                        reject();
                    });
                })
                    .catch((err) => {
                    console.log(`Error: ${err}`);
                    reject();
                });
                // });
            });
        });
    }
    // Getters y Setters
    /**
     * Devuelve el canal izquierdo de la primera canción.
     */
    getLeftChannel() {
        return this.leftChannel;
    }
    /**
     * Define el canal izquierdo de la primera canción.
     * @param leftChannel El nuevo canal izquierdo.
     */
    setLeftChannel(leftChannel) {
        this.leftChannel = leftChannel;
        console.log('Preparing the channel...');
        this.leftChannelBeats = this.getBeatsPerSecond(this.leftChannel);
    }
    /**
     * Devuelve el canal derecho de la primera canción.
     */
    getRightChannel() {
        return this.rightChannel;
    }
    /**
     * Define el canal derecho de la primera canción.
     * @param rightChannel El nuevo canal derecho.
     */
    setRightChannel(rightChannel) {
        this.rightChannel = rightChannel;
        console.log('Preparing the channel...');
        this.rightChannelBeats = this.getBeatsPerSecond(this.rightChannel);
    }
    /**
     * Devuelve el canal izquierdo de la segunda canción.
     */
    getLeftChannel2() {
        return this.leftChannel2;
    }
    /**
     * Define el canal izquierdo de la segunda canción.
     * @param leftChannel El nuevo canal izquierdo.
     */
    setLeftChannel2(leftChannel) {
        this.leftChannel2 = leftChannel;
        console.log('Preparing the channel...');
        this.leftChannelBeats2 = this.getBeatsPerSecond(this.leftChannel2);
    }
    /**
     * Devuelve el canal derecho de la segunda canción.
     */
    getRightChannel2() {
        return this.rightChannel2;
    }
    /**
     * Define el canal derecho de la segunda canción.
     * @param rightChannel El nuevo canal derecho.
     */
    setRightChannel2(rightChannel) {
        this.rightChannel2 = rightChannel;
        console.log('Preparing the channel...');
        this.rightChannelBeats2 = this.getBeatsPerSecond(this.rightChannel2);
    }
    /**
     * Devuelve el arreglo con los tiempos en donde hay match.
     */
    getMatchTimes() {
        return this.matchTimes;
    }
    /**
     * Define el arreglo con los tiempos en donde hay match.
     * @param matchTimes El nuevo arreglo de tiempos.
     */
    setMatchTimes(matchTimes) {
        this.matchTimes = matchTimes;
    }
    /**
     * Devuelve la canción tomando sólo las partes donde hubo match.
     */
    getMatchSong() {
        const tamanno = this.matchTimes.length * this.leftChannel2.length;
        const leftChannel = new Float32Array(tamanno);
        const rightChannel = new Float32Array(tamanno);
        for (let pos = 0; pos < this.matchTimes.length; pos = pos + 1) {
            const begin = Math.floor(this.matchTimes[pos] * MusicProcess.samplingFrecuency);
            const end = begin + this.leftChannel2.length;
            leftChannel.set(this.leftChannel.slice(begin, end), Math.floor(pos * this.leftChannel2.length));
            rightChannel.set(this.rightChannel.slice(begin, end), Math.floor(pos * this.rightChannel2.length));
        }
        return [leftChannel, rightChannel];
    }
    /**
     * Devuelve la canción quitando las partes donde hubo match.
     */
    getUnMatchSong() {
        const tamanno = this.leftChannel.length -
            this.matchTimes.length * this.leftChannel2.length;
        const leftChannel = new Float32Array(tamanno);
        const rightChannel = new Float32Array(tamanno);
        let posActual = 0;
        if (this.matchTimes.length === 0) {
            leftChannel.set(this.leftChannel);
            rightChannel.set(this.rightChannel);
        }
        else {
            for (let pos = 0; pos < this.matchTimes.length + 1; pos = pos + 1) {
                let begin;
                let end;
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
    }
    // Métodos privados
    /*
     * Concatena dos arrays de tipo Float32Array.
     * El resultado se devuelve en un nuevo arreglo del mismo tipo.
     */
    float32Concat(first, second) {
        const firstLength = first.length;
        const result = new Float32Array(firstLength + second.length);
        result.set(first);
        result.set(second, firstLength);
        return result;
    }
    /**
     * Función que realiza la comparación de dos números,
     * se considera que los valores son iguales si se encuentran
     * a una distancia menor a la tolerancia definida
     * @param number1 El primer valor que se quiere comparar.
     * @param number2 El segundo valor que se quiere comparar.
     */
    compare(number1, number2, tolerancia) {
        if (Math.abs(number2 - number1) < tolerancia) {
            return true;
        }
        return false;
    }
    /**
     * Toma los valores en donde se dio el porcentaje de valores mayores
     * y los refina quitando lo que están muy cercanos (repetidos).
     * @param tiempos El arreglo con los tiempos en que se dio match.
     */
    refinarBeats(tiempos) {
        const refinado = [];
        let pos = 0;
        while (pos < tiempos.length - MusicProcess.repetitions) {
            if (this.compare(tiempos[pos][0], tiempos[pos + MusicProcess.repetitions][0], MusicProcess.repetitionsTime)) {
                let pos2 = pos + MusicProcess.repetitions + 1;
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
    }
    /**
     * Función que ordena un array por el valor de cada tiempo.
     * @param pSong Array que se quiere ordenar.
     */
    sortArray(tiempos) {
        return tiempos.sort((time1, time2) => {
            if (time1 > time2) {
                return 1;
            }
            if (time1 < time2) {
                return -1;
            }
            return 0;
        });
    }
    /**
     * Función que ordena un array de enteros por el segundo valor del elemento.
     * @param pSong Array que se quiere ordenar.
     */
    sortArrayBySecondPos(tiempos) {
        return tiempos.sort((time1, time2) => {
            if (time1[1] < time2[1]) {
                return -1;
            }
            if (time1[1] > time2[1]) {
                return 1;
            }
            return 0;
        });
    }
    /**
     * Función que ordena un array de enteros por el primer valor del elemento.
     * @param pSong Array que se quiere ordenar.
     */
    sortArrayByFirstPos(tiempos) {
        return tiempos.sort((time1, time2) => {
            if (time1[0] < time2[0]) {
                return -1;
            }
            if (time1[0] > time2[0]) {
                return 1;
            }
            return 0;
        });
    }
    /**
     * Hace una copia de un array de tipo Float32Array.
     * @param original Arreglo original que se desea copiar.
     */
    float32Copy(original) {
        const result = new Float32Array(original.length);
        result.set(original);
        return result;
    }
    /**
     * Crea un nuevo array que es copia del original pero con la posición de
     * cada elemento numerada desde el offset y en valor absoluto.
     * @param original El arreglo original que se desea copiar.
     * @param offset El valor a partir del cual se quiere inicial la numeración.
     */
    createNumberedAbsoluteArray(original, offset) {
        const copia = [];
        for (let pos = 0; pos < original.length; pos = pos + 1) {
            copia.push([offset + pos, Math.abs(original[pos])]);
        }
        return copia;
    }
    /**
     * Realiza el refinado de ambos canales, tuvo que haber coincidencia en ambos para decir
     * que las dos canciones hicieron match.
     * @param lChannel Canal izquierdo de la canción.
     * @param rChannel Canal derecho de la canción.
     */
    refineBothChannels(lChannel, rChannel) {
        return this.refine(this.sortArray(lChannel.concat(rChannel)), MusicProcess.tolerance);
    }
    /**
     * Realiza el refinado de los tiempos en los que dos canciones hicieron match.
     * @param tiempos Lista de tiempos ordenada.
     * @param tolerance La tolerancia en el tiempo para decir que dos beats sonaron al mismo tiempo.
     */
    refine(tiempos, tolerance) {
        if (tiempos.length < 2) {
            return tiempos;
        }
        const refinado = [];
        for (let pos = 0; pos < tiempos.length - 1; pos = pos + 1) {
            if (this.compare(tiempos[pos], tiempos[pos + 1], tolerance)) {
                refinado.push(tiempos[pos]);
                pos = pos + 1;
            }
        }
        return refinado;
    }
    /**
     * Busca los tiempos en que los canales de dos canciones hicieron match.
     * @param channel1 Primer canal de la primera canción.
     * @param channel2 Primer canal de la segunda canción.
     */
    matchChannel(channel1, channel2) {
        const matchTimes = [];
        const max = channel1.length - channel2.length;
        for (let pos = 0; pos < max; pos = pos + 1) {
            if (this.getMatchPercentage(channel1, pos, channel2, 0) > MusicProcess.successPercentage) {
                matchTimes.push(channel1[pos] - channel2[0]);
            }
        }
        return matchTimes;
    }
    /**
     * Obtiene el porcentaje de igualdad entre los beats de dos canciones.
     * @param song1 Primera canción.
     * @param posSong1 Beat de la primera canción a partir del cual se realizará la comparación.
     * @param song2 Segunda canción.
     * @param posSong2 Beat de la segunda canción a partir del cual se realizará la comparación.
     */
    getMatchPercentage(song1, posSong1, song2, posSong2) {
        const max = Math.min(song1.length - posSong1, song2.length - posSong2);
        let percentage = 0;
        const offsetSong1 = song1[posSong1];
        const offsetSong2 = song2[posSong2];
        if (max > 1) {
            for (let pos = 0; pos < max; pos = pos + 1) {
                if (this.compare(song1[posSong1 + pos] - offsetSong1, song2[posSong2 + pos] - offsetSong2, MusicProcess.tolerance)) {
                    percentage = percentage + 1;
                }
            }
            percentage = percentage / max;
        }
        return percentage;
    }
    /**
     * Obtiene los beats de uno de los canales de la canción.
     * @param songChannel El canal de la canción.
     * @param offset El offset del canal a partir del cual debe sacar los beats.
     */
    getBeats(songChannel, offset) {
        // Se copia el canal en un array enumerado y con los valores positivos
        let newChannel = this.createNumberedAbsoluteArray(songChannel, offset);
        // Se ordena el canal por el valor del sonido
        newChannel = this.sortArrayBySecondPos(newChannel);
        // Se obtiene el porcentaje de samples requerido
        const numsamples = Math.floor(MusicProcess.samplesPercentage * newChannel.length);
        newChannel = newChannel.slice(newChannel.length - numsamples);
        // Se ordena por tiempo
        newChannel = this.sortArrayByFirstPos(newChannel);
        // Se obtienen los tiempos de los beats del canal
        const beats = this.refinarBeats(newChannel);
        return beats;
    }
    /**
     * Devuelve los beats de la canción dividiéndola por segundo
     * @param songChannel Uno de los canales de la canción.
     */
    getBeatsPerSecond(songChannel) {
        let pos = 0;
        let beats = [];
        while (pos < songChannel.length) {
            const nextPos = pos + MusicProcess.samplingFrecuency;
            if (nextPos < songChannel.length) {
                beats = beats.concat(this.getBeats(songChannel.slice(pos, nextPos), pos));
            }
            else {
                beats = beats.concat(this.getBeats(songChannel.slice(pos), pos));
            }
            pos = nextPos;
        }
        return beats;
    }
    /**
     * Obtiene los tiempos de las partes que más se repiten de la primera canción.
     * Básicamente divide la canción de acuerdo al tiempo indicado y obtiene 60 partes
     * de forma aleatoria revisando la cantidad de repeticiones de
     * cada parte, se evita repetir partes que ya se revisaron.
     */
    getDJTimes(time) {
        let times = [];
        const usedTimes = {};
        // Valor máximo para el random
        const max = Math.floor(this.leftChannel.length / time - 1);
        let posLeft1 = 0;
        let posLeft2 = 0;
        let posRight1 = 0;
        let posRight2 = 0;
        for (let cantPartes = 0; cantPartes < MusicProcess.mixNumParts; cantPartes = cantPartes + 1) {
            const minTime = Math.floor((Math.random() * max)) * MusicProcess.samplingFrecuency;
            // Si no se ha revisado el tiempo
            if (!usedTimes[minTime]) {
                // Se marca como revisado
                usedTimes[minTime] = true;
                const maxTime = minTime + time;
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
                const matchTimes = this.match();
                matchTimes.forEach((mtime) => {
                    const startTime = Math.floor(mtime / MusicProcess.samplingFrecuency)
                        * MusicProcess.samplingFrecuency;
                    usedTimes[startTime] = true;
                });
                times.push([minTime, matchTimes.length]);
            }
        }
        this.sortArrayBySecondPos(times);
        if (times.length > 10) {
            times = times.slice(times.length - 10);
        }
        return times;
    }
    /**
     * Obtiene partes de la primera canción del tamaño dado y las agrega al DJ.
     * @param samples Los samples que se desean tomar de la canción ordenadas por apariciones
     */
    getSamplesFromSong(samples, tamanno) {
        const sonidos = [];
        const sonidoChannelLeft = new Float32Array(tamanno);
        const sonidoChannelRight = new Float32Array(tamanno);
        samples.forEach((sample) => {
            const pos = sample[0];
            sonidoChannelLeft.set(this.leftChannel.slice(pos, pos + tamanno));
            sonidoChannelRight.set(this.rightChannel.slice(pos, pos + tamanno));
            sonidos.push([this.float32Copy(sonidoChannelLeft), this.float32Copy(sonidoChannelRight)]);
        });
        return sonidos;
    }
    /**
     * Obtiene el promedio de una lista de números.
     * @param numbers Una lista de números.
     */
    getAverage(numbers) {
        let total = 0;
        numbers.forEach((number) => {
            total = total + number;
        });
        return total / numbers.length;
    }
    /**
     * Obtiene el valor máximo en valor absoluto de una lista de números.
     * @param numbers Una lista de números.
     */
    getMaxAbsoluteValue(numbers) {
        let resp = 0;
        numbers.forEach((number) => {
            const absValue = Math.abs(number);
            if (absValue > resp) {
                resp = absValue;
            }
        });
        return resp;
    }
    /**
     * Reduce la canción tomando secciones del tamaño dado por la constante
     * sliceSize, de cada sección toma el valor mayor como representante.
     * @param songChannel El canal de la canción.
     */
    reduceChannelSong(songChannel) {
        const reducedSong = [];
        let minPos = 0;
        for (let cont = 0; minPos < songChannel.length; cont = cont + 1) {
            minPos = cont * MusicProcess.sliceSize;
            if (minPos + MusicProcess.sliceSize < songChannel.length) {
                reducedSong.push(this.getMaxAbsoluteValue(songChannel.slice(minPos, minPos +
                    MusicProcess.sliceSize)));
            }
            else {
                reducedSong.push(this.getMaxAbsoluteValue(songChannel.slice(minPos)));
            }
        }
        return reducedSong;
    }
    createSong(individual, songLeftChannel, songRightChannel, size) {
        const totalSize = individual.length * size;
        const newSongLeftChannel = new Float32Array(totalSize);
        const newSongRightChannel = new Float32Array(totalSize);
        for (let pos = 0; pos < individual.length; pos = pos + 1) {
            const min = individual[pos] * size;
            let max = min + size;
            if (max > songLeftChannel.length) {
                max = songLeftChannel.length;
            }
            newSongLeftChannel.set(songLeftChannel.slice(min, max), pos * size);
            newSongRightChannel.set(songRightChannel.slice(min, max), pos * size);
        }
        return [newSongLeftChannel, newSongRightChannel];
    }
    dnaProportion(dnaOriginal, newSize) {
        const newDNA = [];
        const proportion = Math.floor(newSize / dnaOriginal.length);
        if (proportion > 1) {
            dnaOriginal.forEach((crom) => {
                for (let rep = 0; rep < proportion; rep = rep + 1) {
                    newDNA.push(crom);
                }
            });
        }
        const faltante = newSize - newDNA.length;
        for (let cont = 0; cont < faltante; cont = cont + 1) {
            const pos = Math.floor(cont * newDNA.length / faltante);
            newDNA.splice(pos, 0, newDNA[pos]);
        }
        return newDNA;
    }
    mutateIndividuals(individuals, cant) {
        for (let pos = 0; pos < individuals.length; pos = pos + 1) {
            if (Math.random() < MusicProcess.mutationPercentage) {
                individuals[pos] = this.mutateIndividual(individuals[pos], cant);
            }
        }
        return individuals;
    }
    mutateIndividual(individual, cant) {
        const pos = Math.floor(Math.random() * individual.length);
        const valMutation = Math.floor(Math.random() * cant);
        individual[pos] = valMutation;
        return individual;
    }
    fitnessOfIndividuals(individuals, dnaSong1, dnaSong2) {
        let individualFitness = [];
        individuals.forEach((individual) => {
            individualFitness.push([individual, this.fitnessOfIndividual(individual, dnaSong1, dnaSong2)]);
        });
        this.sortArrayBySecondPos(individualFitness);
        const min = (1 - MusicProcess.livePercentage) * individualFitness.length;
        individualFitness = individualFitness.slice(min);
        const liveIndividuals = Array(individualFitness.length);
        for (let pos = 0; pos < individualFitness.length; pos = pos + 1) {
            liveIndividuals[pos] = individualFitness[pos][0];
        }
        return liveIndividuals;
    }
    fitnessOfIndividual(individual, dnaSong1, dnaSong2) {
        let numMatches = 0;
        for (let pos = 0; pos < individual.length; pos = pos + 1) {
            const crom = individual[pos];
            if (dnaSong1[crom] === dnaSong2[crom]) {
                numMatches = numMatches + 1;
            }
        }
        return numMatches;
    }
    crossIndividuals(individuals, cant) {
        const newIndividuals = new Array(cant);
        for (let pos = 0; pos < cant; pos = pos + 1) {
            const posFather = Math.floor(Math.random() * individuals.length);
            const posMother = Math.floor(Math.random() * individuals.length);
            newIndividuals[pos] = this.newSon(individuals[posFather], individuals[posMother]);
        }
        return newIndividuals;
    }
    newSon(father, mother) {
        const son = new Array(father.length);
        for (let cantCrom = 0; cantCrom < father.length; cantCrom = cantCrom + 1) {
            if (cantCrom % 2 === 0) {
                son[cantCrom] = father[cantCrom];
            }
            else {
                son[cantCrom] = mother[cantCrom];
            }
        }
        return son;
    }
    createIndividuals(cant, distribution, dnaSong) {
        const individuals = new Array(cant);
        for (let cont = 0; cont < cant; cont = cont + 1) {
            individuals[cont] = this.createIndividual(distribution, dnaSong);
        }
        return individuals;
    }
    createIndividual(distribution, dnaSong) {
        const individual = new Array(dnaSong.length);
        const max = dnaSong.length;
        const dist = new Array(distribution.length);
        const position = {};
        for (let cont = 0; cont < distribution.length; cont = cont + 1) {
            const value = distribution[cont][0];
            dist[cont] = 0;
            position[value] = cont;
        }
        let total = 0;
        while (total < max) {
            const newValue = Math.floor(Math.random() * max);
            const pos = position[dnaSong[newValue]];
            if (pos != undefined && dist[pos] < distribution[pos][1]) {
                dist[pos] = dist[pos] + 1;
                individual[total] = newValue;
                total = total + 1;
            }
        }
        /*for (let cont: number = 0; cont < max; cont = cont + 1) {
        individual[cont] = Math.floor(Math.random() * max);
        }*/
        return individual;
    }
    esSearch() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = require('./esconnection.js');
            return yield new Promise((resolve, reject) => {
                resolve(client.search({
                    index: "song",
                    type: "part",
                    body: {
                        "aggs": {
                            "byType": {
                                "terms": {
                                    "field": "type",
                                    "size": 100000
                                }
                            }
                        }
                    }
                }));
            });
        });
    }
    esBulkSong(dnaSong) {
        return __awaiter(this, void 0, void 0, function* () {
            const bulk = this.esPrepareBulkData(dnaSong);
            return yield new Promise((resolve, reject) => {
                resolve(this.esIndexall(bulk));
            });
        });
    }
    esIndexall(madebulk) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = require('./esconnection.js');
            return yield new Promise((resolve, reject) => {
                resolve(client.bulk({
                    maxRetries: 5,
                    index: 'song',
                    type: 'part',
                    body: madebulk
                }));
            });
        });
    }
    esPrepareBulkData(dnaSong) {
        const bulk = [];
        for (let pos = 0; pos < dnaSong.length; pos = pos + 1) {
            bulk.push({
                index: { _index: 'song', _type: 'part', _id: pos }
            }, {
                type: dnaSong[pos]
            });
        }
        return bulk;
    }
    esCreateIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = require('./esconnection.js');
            return yield new Promise((resolve, reject) => resolve(client.indices.create({ index: 'song' })));
        });
    }
    esDeleteIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = require('./esconnection.js');
            return yield new Promise((resolve, reject) => resolve(client.indices.delete({ index: 'song' })));
        });
    }
    getSongDNA(songLeftChannel, songRightChannel, leftBeats, rightBeats) {
        const reducedLeftChannel = this.reduceChannelSong(songLeftChannel);
        const reducedRightChannel = this.reduceChannelSong(songRightChannel);
        return this.getChannelsSongDNA(reducedLeftChannel, reducedRightChannel, leftBeats, rightBeats);
    }
    getChannelsSongDNA(reducedLeftChannel, reducedRightChannel, leftBeats, rightBeats) {
        const beats = this.refine(this.sortArray(leftBeats.concat(rightBeats)), MusicProcess.tolerance);
        let resp = [];
        let min = 0;
        for (let cont = 0; cont <= beats.length; cont = cont + 1) {
            let max;
            if (cont < beats.length) {
                max = Math.floor(beats[cont] / MusicProcess.sliceSize - 1);
            }
            else {
                max = reducedLeftChannel.length;
            }
            if (min !== 0 || max === 0) {
                let tipo = MusicProcess.BEAT;
                if (min !== 0) {
                    tipo = tipo + this.alturaNota(Math.max(reducedLeftChannel[min], reducedRightChannel[min]));
                }
                else {
                    tipo = tipo + this.alturaNota(Math.max(reducedLeftChannel[0], reducedRightChannel[0]));
                }
                resp.push(tipo); // BEAT
                min = min + 1;
            }
            if (min < max) {
                const respLeft = this.getChannelPartDNA(reducedLeftChannel.slice(min, max));
                const respRight = this.getChannelPartDNA(reducedRightChannel.slice(min, max));
                let tipo;
                if (respLeft[1] > respRight[1]) {
                    tipo = respLeft[0];
                }
                else {
                    tipo = respRight[0];
                }
                const unTercio = Math.floor((max - min) / 3);
                const dosTercios = Math.floor(2 * (max - min) / 3);
                if (tipo >= MusicProcess.LLANURA && tipo < MusicProcess.LLANURA + 100) {
                    resp = this.llenarArrayDNA(resp, tipo, reducedLeftChannel, reducedRightChannel, min, max);
                }
                else {
                    resp = this.llenarArrayDNA(resp, tipo + MusicProcess.INICIO, reducedLeftChannel, reducedRightChannel, min, min + unTercio); // Inicio
                    resp = this.llenarArrayDNA(resp, tipo + MusicProcess.MITAD, reducedLeftChannel, reducedRightChannel, min + unTercio, min + dosTercios); // Mitad
                    resp = this.llenarArrayDNA(resp, tipo + MusicProcess.FINAL, reducedLeftChannel, reducedRightChannel, min + dosTercios, max); // Final
                }
            }
            min = max + 1;
        }
        return resp;
    }
    alturaNota(nota) {
        let altura = 0;
        if (nota < MusicProcess.BAJISIMA_VALUE) {
            altura = MusicProcess.BAJISIMA;
        }
        else if (nota < MusicProcess.BAJA_VALUE) {
            altura = MusicProcess.BAJA;
        }
        else if (nota < MusicProcess.BAJAMEDIA_VALUE) {
            altura = MusicProcess.BAJAMEDIA;
        }
        else if (nota < MusicProcess.MEDIA_VALUE) {
            altura = MusicProcess.MEDIA;
        }
        else if (nota < MusicProcess.MEDIAALTA_VALUE) {
            altura = MusicProcess.MEDIAALTA;
        }
        else if (nota < MusicProcess.ALTA_VALUE) {
            altura = MusicProcess.ALTA;
        }
        else {
            altura = MusicProcess.ALTISIMA;
        }
        return altura;
    }
    llenarArrayDNA(arrayDNA, DNA, reducedLeftChannel, reducedRightChannel, min, max) {
        for (let i = min; i < max; i = i + 1) {
            arrayDNA.push(DNA + this.alturaNota(Math.max(reducedLeftChannel[i], reducedRightChannel[i])));
        }
        return arrayDNA;
    }
    /**
     * Calcula la función piso para un número dado con el escalón del tamaño dado por n.
     * @param x El número al que se le quiere hacer el cálculo.
     * @param n El tamaño del escalón.
     */
    myFloor(x, n) {
        return Math.floor(x / n) * n;
    }
    getChannelPartDNA(songPart) {
        const max = songPart.length;
        const midPoint = Math.floor(max / 2);
        let sameLeft = 0;
        let sameRight = 0;
        let upLeft = 0;
        let upRight = 0;
        let downLeft = 0;
        let downRight = 0;
        for (let pos = 0; pos < midPoint; pos = pos + 1) {
            if (songPart[pos] < songPart[pos + 1]) {
                upLeft = upLeft + 1;
            }
            else if (songPart[pos] > songPart[pos + 1]) {
                downLeft = downLeft + 1;
            }
            if (this.compare(songPart[pos], songPart[pos + 1], MusicProcess.toleranceLlanura)) {
                sameLeft = sameLeft + 1;
            }
        }
        for (let pos = midPoint; pos < max - 1; pos = pos + 1) {
            if (songPart[pos] < songPart[pos + 1]) {
                upRight = upRight + 1;
            }
            else if (songPart[pos] > songPart[pos + 1]) {
                downRight = downRight + 1;
            }
            if (this.compare(songPart[pos], songPart[pos + 1], MusicProcess.toleranceLlanura)) {
                sameRight = sameRight + 1;
            }
        }
        // Nomenclatura:
        /*
        * L : Llanura : 100
        * V : Valle : 200
        * M : Montaña : 300
        * U : Subida (Uphill) : 400
        * D : Bajada (Downhill) : 500
        */
        const options = [[MusicProcess.LLANURA,
                (sameLeft + sameRight) / max],
            [MusicProcess.VALLE,
                (downLeft + upRight) / max],
            [MusicProcess.MONTANNA,
                (upLeft + downRight) / max],
            [MusicProcess.SUBIDA,
                (upLeft + upRight) / max],
            [MusicProcess.BAJADA,
                (downLeft + downRight) / max]];
        let maxPer = 0;
        let tipo = 0;
        options.forEach((option) => {
            if (option[1] > maxPer) {
                maxPer = option[1];
                tipo = option[0];
            }
        });
        return [tipo, maxPer];
    }
}
// Frecuencia de los samples que se van a trabajar
MusicProcess.samplingFrecuency = 44100;
// CONSTANTES PARA EL MATCH
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
MusicProcess.successPercentage = 0.80;
// CONSTANTES PARA EL MIX
// Cantidad de partes de la canción que se revisan para hacer el mix
MusicProcess.mixNumParts = 60;
// CONSTANTES PARA EL COMPOSE
// Tiempo en que se dividirá la canción para crear la nueva
// canción considerando que 44100 son un segundo
MusicProcess.sliceSize = 441 * 5;
// Tolerancia en el compose para indicar que dos valores son iguales
MusicProcess.toleranceLlanura = 0.02;
// Cantidad de individuos con la que se va a trabajar
MusicProcess.individualsNumber = 100;
// Porcentaje de Match para decidir que ya se terminó el algoritmo genético
MusicProcess.successEndPercentage = 0.8;
// Porcentaje de individuos que quedarán vivos al aplicar el fitness
MusicProcess.livePercentage = 0.7;
// Porcentaje de individuos que tendrán mutación
MusicProcess.mutationPercentage = 0.07;
// Tipos de cromosomas
// Nomenclatura:
/*
 * Beats -> 0
 * Llanura -> 100
 * Valle -> 200
 * Montaña -> 300
 * Subida (Uphill) -> 400
 * Bajada (Downhill) -> 500
 */
// BEATS
MusicProcess.BEAT = 0;
// Llanuras
MusicProcess.LLANURA = 100;
// Valles
MusicProcess.VALLE = 200;
// Montañas
MusicProcess.MONTANNA = 300;
// Subida
MusicProcess.SUBIDA = 400;
// Bajada
MusicProcess.BAJADA = 500;
// Modificadores
// Bajísima
MusicProcess.BAJISIMA = 0;
// Baja
MusicProcess.BAJA = 10;
// BajaMedia
MusicProcess.BAJAMEDIA = 20;
// Media
MusicProcess.MEDIA = 30;
// MediaAlta
MusicProcess.MEDIAALTA = 40;
// Alta
MusicProcess.ALTA = 50;
// Altisima
MusicProcess.ALTISIMA = 60;
// Inicio
MusicProcess.INICIO = 0;
// Mitad
MusicProcess.MITAD = 1;
// Final
MusicProcess.FINAL = 2;
// Valores para comparar
// Bajísima
MusicProcess.BAJISIMA_VALUE = 0.1;
// Baja
MusicProcess.BAJA_VALUE = 0.2;
// BajaMedia
MusicProcess.BAJAMEDIA_VALUE = 0.3;
// Media
MusicProcess.MEDIA_VALUE = 0.45;
// MediaAlta
MusicProcess.MEDIAALTA_VALUE = 0.6;
// Alta
MusicProcess.ALTA_VALUE = 0.75;
exports.MusicProcess = MusicProcess;
//# sourceMappingURL=musicprocess.js.map