/**
 * Filename: musicprocess.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase que procesa la música
 */

import * as GAN from './GANumber16Bits';
import * as MM from './musicmix';
import * as Utils from './Utils';

export class MusicProcess {

  // Valor máximo para 16 bits
  private static readonly BITS16: number = 65535;

  // Frecuencia de los samples que se van a trabajar
  private static readonly samplingFrecuency: number = 44100;

  // CONSTANTES PARA EL MATCH

  // Tolerancia en el tiempo para considerar que dos Beats
  // sonaron al mismo tiempo considerando que 44100 son un segundo
  private static readonly tolerance: number = 8820; // 4410; Con 4410 no me agarraba el pitch
  // Cantidad de repeticiones para considerar que el sonido es un beat de la canción
  private static readonly repetitions: number = 3;
  // Tiempo entre las repeticiones para considerar que el sonido
  // es un beat de la canción considerando que 44100 son un segundo
  private static readonly repetitionsTime: number = 882;
  // El mínimo tiempo posible entre dos beats (de acuerdo a la medida
  // de beats por minuto de las canciones, lás más rápidas llegan a 300
  // lo que representa 5 beats por segundo o cada 8820)
  private static readonly minTimeBetweenBeats: number = 8820;
  // Cantidad de samples como porcentaje que se van a obtener para comparar
  private static readonly samplesPercentage: number = 0.01;
  // Porcentaje de igualdad entre la canción original y el sample para
  // considerarlas que hicieron match
  private static readonly successPercentage: number = 0.70;

  // CONSTANTES PARA EL MIX

  // Cantidad de partes de la canción que se revisan para hacer el mix
  private static readonly mixNumParts: number = 60;

  // CONSTANTES PARA EL COMPOSE

  // Tiempo en que se dividirá la canción para crear la nueva
  // canción considerando que 44100 son un segundo
  private static readonly sliceSize: number = 441 * 5;
  // Tolerancia en el compose para indicar que dos valores son iguales
  private static readonly toleranceLlanura: number = 0.02;
  // Tolerancia en el algoritmo genético para decir que se obtuvo el porcentaje requerido
  private static readonly genAlgTolerance: number = 0.01;
  // Porcentaje de Match para decidir que ya se terminó el algoritmo genético
  private static readonly successEndPercentage: number = 0.8;
  // Porcentaje de individuos que quedarán vivos al aplicar el fitness
  private static readonly livePercentage: number = 0.7;
  // Porcentaje de individuos que tendrán mutación
  private static readonly mutationPercentage: number = 0.0635;
  // Número máximo de generaciones, si se llega a este número se sale con la solución
  // que se tenga en ese momento.
  private static readonly stopGenerationsNumber: number = 100000;
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
  private static readonly BEAT: number = 0;
  // Llanuras
  private static readonly LLANURA: number = 100;
  // Valles
  private static readonly VALLE: number = 200;
  // Montañas
  private static readonly MONTANNA: number = 300;
  // Subida
  private static readonly SUBIDA: number = 400;
  // Bajada
  private static readonly BAJADA: number = 500;
  // Modificadores
  // Bajísima
  private static readonly BAJISIMA: number = 0;
  // Baja
  private static readonly BAJA: number = 10;
  // BajaMedia
  private static readonly BAJAMEDIA: number = 20;
  // Media
  private static readonly MEDIA: number = 30;
  // MediaAlta
  private static readonly MEDIAALTA: number = 40;
  // Alta
  private static readonly ALTA: number = 50;
  // Altisima
  private static readonly ALTISIMA: number = 60;
  // Inicio
  private static readonly INICIO: number = 0;
  // Mitad
  private static readonly MITAD: number = 1;
  // Final
  private static readonly FINAL: number = 2;
  // Valores para comparar
  // Bajísima
  private static readonly BAJISIMA_VALUE: number = 0.1;
  // Baja
  private static readonly BAJA_VALUE: number = 0.2;
  // BajaMedia
  private static readonly BAJAMEDIA_VALUE: number = 0.3;
  // Media
  private static readonly MEDIA_VALUE: number = 0.45;
  // MediaAlta
  private static readonly MEDIAALTA_VALUE: number = 0.6;
  // Alta
  private static readonly ALTA_VALUE: number = 0.75;
  // Altisima
  // private static readonly ALTISIMA_VALUE: number = 1;

  // VARIABLES

  // Audio de los dos canales de la canción original
  private leftChannel: Float32Array;
  private rightChannel: Float32Array;

  // Audio de los dos canales de la segunda canción
  private leftChannel2: Float32Array;
  private rightChannel2: Float32Array;

  // Array con los beats de la canción original
  private leftChannelBeats: number[];
  private rightChannelBeats: number[];

  // Array con los beats de la segunda canción
  private leftChannelBeats2: number[];
  private rightChannelBeats2: number[];

  // Variable donde se guardarán los tiempos en que la segunda canción hace match
  private matchTimes: number[];

  // Variable que se utilizará cuando se quiera realizar un mix de la canción.
  private mix: MM.MusicMix;

  // Variable que se utilizará para el algoritmo genético
  private genAlg = GAN.GANumber16Bits;

  constructor(leftChannel: Float32Array,
              rightChannel: Float32Array,
              leftChannel2: Float32Array,
              rightChannel2: Float32Array) {
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
  public match(): number[] {
    const leftMatchTimes = this.matchChannel(this.leftChannelBeats, this.leftChannelBeats2);
    const rightMatchTimes = this.matchChannel(this.rightChannelBeats, this.rightChannelBeats2);
    const matchPoints = this.refineBothChannels(leftMatchTimes, rightMatchTimes);

    this.matchTimes = [matchPoints.length];

    for (let pos: number = 0; pos < matchPoints.length; pos = pos + 1) {
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
  public dj(): [Float32Array, Float32Array] {
    const samples: number[][] = this.getDJTimes(2 * MusicProcess.samplingFrecuency);

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
  public compose(): [Float32Array, Float32Array] {
    console.log('Obteniendo el ADN de la canción 1');
    const dnaSong1: number[] = this.getSongDNA(this.leftChannel,
                                               this.rightChannel,
                                               this.leftChannelBeats,
                                               this.rightChannelBeats);
    console.log('Obteniendo el ADN de la canción 2');
    let dnaSong2: number[] = this.getSongDNA(this.leftChannel2,
                                             this.rightChannel2,
                                             this.leftChannelBeats2,
                                             this.rightChannelBeats2);

    console.log('Obteniendo el AND proporcionado de la canción 2');
    // Proporciona el ADN de la segunda canción
    dnaSong2 = this.dnaProportion(dnaSong2, dnaSong1.length);

    console.log('Reduciendo las canciones');
    const totalReducedSongValues = Math.min(dnaSong1.length, dnaSong2.length);

    console.log('Obteniendo la distribución del ADN');
    const dnaDistributionSong1: Array<[number, number[]]> = this.getDNADistribution(dnaSong1);
    const dnaDistributionSong2: Array<[number, number[]]> = this.getDNADistribution(dnaSong2);

    // console.log(dnaDistributionSong1);
    // console.log(dnaDistributionSong2);

    console.log('Obteniendo la distribución en 16 bits del ADN');
    const distributionSong1: Array<[number, number, number, number, number[]]>
            = this.getDistribution16Bits(dnaDistributionSong1, totalReducedSongValues);
    const distributionSong2: Array<[number, number, number, number, number[]]>
            = this.getDistribution16Bits(dnaDistributionSong2, totalReducedSongValues);

    const dnaSol1Pos: Utils.IHash<number> = {};

    for (let pos: number = 0; pos < distributionSong1.length; pos = pos + 1) {
      dnaSol1Pos[distributionSong1[pos][0]] = pos;
    }

    // console.log(distributionSong1);
    // console.log(distributionSong2);

    const individuals: number[] = dnaSong1; // this.createIndividuals(distribution);

    console.log('Inicio del algoritmo genético');
    const genAlg: GAN.GANumber16Bits =
          new GAN.GANumber16Bits(individuals,
                                 0.2,
                                 MusicProcess.livePercentage,
                                 MusicProcess.mutationPercentage,
                                 MusicProcess.stopGenerationsNumber,
                                 true, 0, 0, 0,
                                 MusicProcess.genAlgTolerance);

    const indivSol: Array<[number, number[]]> = [];

    // console.log('Tengo que hacer: ' + distributionSong2.length);
    // let j: number = 0;
    distributionSong2.forEach((dist) => {
      // j = j + 1;
      // console.log('Estoy en la: ' + j);
      // console.log('genSong2: ' + dist[0]);
      const genSong2: number = dist[0];
      // console.log('neededPercentage: ' + dist[1]);
      const neededPercentage: number = dist[1];
      // console.log('posSong1: ' + dnaSol1Pos[genSong2]);
      let posSong1: number = dnaSol1Pos[genSong2];
      if (distributionSong1[posSong1] === undefined) {
        posSong1 = Utils.Utils.intRandom(0, distributionSong1.length - 1);
      }
      // console.log('minVal: ' + distributionSong1[posSong1]);
      // console.log('minVal: ' + distributionSong1[posSong1][2]);
      const minVal: number = distributionSong1[posSong1][2];
      // console.log('maxVal: ' + distributionSong1[posSong1][3]);
      const maxVal: number = distributionSong1[posSong1][3];
      genAlg.setNeededPercentage(neededPercentage);
      genAlg.setMatchMinVal(minVal);
      genAlg.setMatchMaxVal(maxVal);
      genAlg.setSuccessEndPercentage(neededPercentage);
      genAlg.runGA();
      indivSol.push([genSong2, genAlg.getMatchIndividualsFromPoblation()]);
    });
    console.log('Final del algoritmo genético');
    console.log('Creando la canción');
    return this.createSong(dnaSong2, indivSol, distributionSong1,
                           this.leftChannel, this.rightChannel,
                           MusicProcess.sliceSize);
  }

  // Getters y Setters

  /**
   * Devuelve el canal izquierdo de la primera canción.
   */
  public getLeftChannel(): Float32Array {
    return this.leftChannel;
  }

  /**
   * Define el canal izquierdo de la primera canción.
   * @param leftChannel El nuevo canal izquierdo.
   */
  public setLeftChannel(leftChannel: Float32Array) {
    this.leftChannel = leftChannel;
    console.log('Preparing the channel...');
    this.leftChannelBeats = this.getBeatsPerSecond(this.leftChannel);
  }

  /**
   * Devuelve el canal derecho de la primera canción.
   */
  public getRightChannel(): Float32Array {
    return this.rightChannel;
  }

  /**
   * Define el canal derecho de la primera canción.
   * @param rightChannel El nuevo canal derecho.
   */
  public setRightChannel(rightChannel: Float32Array) {
    this.rightChannel = rightChannel;
    console.log('Preparing the channel...');
    this.rightChannelBeats = this.getBeatsPerSecond(this.rightChannel);
  }

  /**
   * Devuelve el canal izquierdo de la segunda canción.
   */
  public getLeftChannel2(): Float32Array {
    return this.leftChannel2;
  }

  /**
   * Define el canal izquierdo de la segunda canción.
   * @param leftChannel El nuevo canal izquierdo.
   */
  public setLeftChannel2(leftChannel: Float32Array) {
    this.leftChannel2 = leftChannel;
    console.log('Preparing the channel...');
    this.leftChannelBeats2 = this.getBeatsPerSecond(this.leftChannel2);
  }

  /**
   * Devuelve el canal derecho de la segunda canción.
   */
  public getRightChannel2(): Float32Array {
    return this.rightChannel2;
  }

  /**
   * Define el canal derecho de la segunda canción.
   * @param rightChannel El nuevo canal derecho.
   */
  public setRightChannel2(rightChannel: Float32Array) {
    this.rightChannel2 = rightChannel;
    console.log('Preparing the channel...');
    this.rightChannelBeats2 = this.getBeatsPerSecond(this.rightChannel2);
  }

  /**
   * Devuelve el arreglo con los tiempos en donde hay match.
   */
  public getMatchTimes(): number[] {
    return this.matchTimes;
  }

  /**
   * Define el arreglo con los tiempos en donde hay match.
   * @param matchTimes El nuevo arreglo de tiempos.
   */
  public setMatchTimes(matchTimes: number[]) {
    this.matchTimes = matchTimes;
  }

  /**
   * Devuelve la canción tomando sólo las partes donde hubo match.
   */
  public getMatchSong(): [Float32Array, Float32Array] {
    const tamanno = this.matchTimes.length * this.leftChannel2.length;
    const leftChannel = new Float32Array(tamanno);
    const rightChannel = new Float32Array(tamanno);

    for (let pos: number = 0; pos < this.matchTimes.length; pos = pos + 1) {
      const begin = Math.floor(this.matchTimes[pos] * MusicProcess.samplingFrecuency);
      const end = begin + this.leftChannel2.length;
      leftChannel.set(this.leftChannel.slice(begin, end),
                      Math.floor(pos * this.leftChannel2.length));
      rightChannel.set(this.rightChannel.slice(begin, end),
                       Math.floor(pos * this.rightChannel2.length));
    }

    return [leftChannel, rightChannel];
  }

  /**
   * Devuelve la canción quitando las partes donde hubo match.
   */
  public getUnMatchSong(): [Float32Array, Float32Array] {
    const tamanno = this.leftChannel.length -
                    this.matchTimes.length * this.leftChannel2.length;
    const leftChannel = new Float32Array(tamanno);
    const rightChannel = new Float32Array(tamanno);

    let posActual: number = 0;

    if (this.matchTimes.length === 0) {
      leftChannel.set(this.leftChannel);
      rightChannel.set(this.rightChannel);
    } else {
      for (let pos: number = 0; pos < this.matchTimes.length + 1; pos = pos + 1) {
        let begin: number;
        let end: number;
        if (pos !== 0) {
          begin = Math.floor(this.matchTimes[pos - 1] * MusicProcess.samplingFrecuency
                             + this.leftChannel2.length);
        } else {
          begin = 0;
        }
        if (pos !== this.matchTimes.length) {
          end = Math.floor(this.matchTimes[pos] * MusicProcess.samplingFrecuency);
        } else {
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

  /**
   * Toma los valores en donde se dio el porcentaje de valores mayores
   * y los refina quitando lo que están muy cercanos (repetidos).
   * @param tiempos El arreglo con los tiempos en que se dio match.
   */
  private refinarBeats(tiempos: number[][]): number[] {
    const refinado: number[] = [];
    let pos: number = 0;

    while (pos < tiempos.length - MusicProcess.repetitions) {
      if (Utils.Utils.compare(tiempos[pos][0],
                              tiempos[pos + MusicProcess.repetitions][0],
                              MusicProcess.repetitionsTime)) {
        let pos2: number = pos + MusicProcess.repetitions + 1;

        while (pos2 < tiempos.length &&
               Utils.Utils.compare(tiempos[pos][0],
                                   tiempos[pos2][0],
                                   MusicProcess.minTimeBetweenBeats)) {
          pos2 = pos2 + 1;
        }
        refinado.push(tiempos[pos][0]);

        pos = pos2;
      } else {
        pos = pos + 1;
      }
    }
    return refinado;
  }

  /**
   * Realiza el refinado de ambos canales, tuvo que haber coincidencia en ambos para decir
   * que las dos canciones hicieron match.
   * @param lChannel Canal izquierdo de la canción.
   * @param rChannel Canal derecho de la canción.
   */
  private refineBothChannels(lChannel: number[], rChannel: number[]): number[] {
    return this.refine(Utils.Utils.sortArray(lChannel.concat(rChannel)), MusicProcess.tolerance);
  }

  /**
   * Realiza el refinado de los tiempos en los que dos canciones hicieron match.
   * @param tiempos Lista de tiempos ordenada.
   * @param tolerance La tolerancia en el tiempo para decir que dos beats sonaron al mismo tiempo.
   */
  private refine(tiempos: number[], tolerance: number): number[] {
    if (tiempos.length < 2) {
      return tiempos;
    }

    const refinado: number[] = [];

    for (let pos: number = 0; pos < tiempos.length - 1; pos = pos + 1) {
      if (Utils.Utils.compare(tiempos[pos], tiempos[pos + 1], tolerance)) {
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
  private matchChannel(channel1: number[], channel2: number[]): number[] {
    const matchTimes: number[] = [];
    const max = channel1.length - channel2.length;
    for (let pos: number = 0; pos < max ; pos = pos + 1) {
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
  private getMatchPercentage(song1: number[], posSong1: number,
                             song2: number[], posSong2: number) {
    const max = Math.min(song1.length - posSong1, song2.length - posSong2);
    let percentage: number = 0;
    const offsetSong1 = song1[posSong1];
    const offsetSong2 = song2[posSong2];

    if (max > 1) {
      for (let pos = 0; pos < max; pos = pos + 1) {
        if (Utils.Utils.compare(song1[posSong1 + pos] - offsetSong1,
                                song2[posSong2 + pos] - offsetSong2,
                                MusicProcess.tolerance)) {
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
  private getBeats(songChannel: Float32Array, offset: number): number[] {
    // Se copia el canal en un array enumerado y con los valores positivos
    let newChannel = Utils.Utils.createNumberedAbsoluteArray(songChannel, offset);

    // Se ordena el canal por el valor del sonido
    newChannel = Utils.Utils.sortArrayBySecondPos(newChannel);

    // Se obtiene el porcentaje de samples requerido
    const numsamples: number = Math.floor(MusicProcess.samplesPercentage * newChannel.length);
    newChannel = newChannel.slice(newChannel.length - numsamples);

    // Se ordena por tiempo
    newChannel = Utils.Utils.sortArrayByFirstPos(newChannel);

    // Se obtienen los tiempos de los beats del canal
    const beats: number[] = this.refinarBeats(newChannel);

    return beats;
  }

  /**
   * Devuelve los beats de la canción dividiéndola por segundo
   * @param songChannel Uno de los canales de la canción.
   */
  private getBeatsPerSecond(songChannel: Float32Array): number[] {
    let pos: number = 0;
    let beats: number[] = [];

    while (pos < songChannel.length) {
      const nextPos = pos + MusicProcess.samplingFrecuency;
      if (nextPos < songChannel.length) {
        beats = beats.concat(this.getBeats(songChannel.slice(pos, nextPos), pos));
      } else {
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
  private getDJTimes(time: number): number[][] {
    let times: Array<[number, number]> = [];
    const usedTimes: Utils.IHash<boolean> = {};

    // Valor máximo para el random
    const max = Math.floor(this.leftChannel.length / time - 1);

    let posLeft1: number = 0;
    let posLeft2: number = 0;
    let posRight1: number = 0;
    let posRight2: number = 0;

    for (let cantPartes = 0; cantPartes < MusicProcess.mixNumParts; cantPartes = cantPartes + 1) {
      const minTime: number = Math.floor((Math.random() * max)) * MusicProcess.samplingFrecuency;

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

    Utils.Utils.sortArrayBySecondPos(times);
    if (times.length > 10) {
      times = times.slice(times.length - 10);
    }

    return times;
  }

  /**
   * Obtiene partes de la primera canción del tamaño dado y las agrega al DJ.
   * @param samples Los samples que se desean tomar de la canción ordenadas por apariciones
   */
  private getSamplesFromSong(samples: number[][], tamanno: number): Float32Array[][] {
    const sonidos: Float32Array[][] = [];
    const sonidoChannelLeft = new Float32Array(tamanno);
    const sonidoChannelRight = new Float32Array(tamanno);

    samples.forEach((sample) => {
      const pos = sample[0];
      sonidoChannelLeft.set(this.leftChannel.slice(pos, pos + tamanno));
      sonidoChannelRight.set(this.rightChannel.slice(pos, pos + tamanno));
      sonidos.push([Utils.Utils.float32Copy(sonidoChannelLeft),
        Utils.Utils.float32Copy(sonidoChannelRight)]);
    });

    return sonidos;
  }

  /**
   * Obtiene el valor máximo en valor absoluto de una lista de números.
   * @param numbers Una lista de números.
   */
  private getMaxAbsoluteValue(numbers: Float32Array): number {
    let resp: number = 0;

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
  private reduceChannelSong(songChannel: Float32Array): number[] {
    const reducedSong: number[] = [];
    let minPos: number = 0;

    for (let cont: number = 0; minPos < songChannel.length; cont = cont + 1) {
      minPos = cont * MusicProcess.sliceSize;
      if (minPos + MusicProcess.sliceSize < songChannel.length) {
        reducedSong.push(this.getMaxAbsoluteValue(songChannel.slice(minPos,
                                                                    minPos +
                                                                    MusicProcess.sliceSize)));
      } else {
        reducedSong.push(this.getMaxAbsoluteValue(songChannel.slice(minPos)));
      }
    }

    return reducedSong;
  }

  private createSong(dnaSong2: number[],
                     solutions: Array<[number, number[]]>,
                     dnaDistributionSong1: Array<[number, number, number, number, number[]]>,
                     songLeftChannel: Float32Array,
                     songRightChannel: Float32Array,
                     size: number): [Float32Array, Float32Array] {
    const totalSize: number = dnaSong2.length * size;
    const newSongLeftChannel: Float32Array = new Float32Array(totalSize);
    const newSongRightChannel: Float32Array = new Float32Array(totalSize);

    const currentUsedPositions: number[] = new Array(solutions.length);
    const dnaSol: Utils.IHash<number> = {};
    const dnaDist: Utils.IHash<number> = {};

    for (let pos: number = 0; pos < solutions.length; pos = pos + 1) {
      dnaSol[solutions[pos][0]] = pos;
    }

    for (let pos: number = 0; pos < dnaDistributionSong1.length; pos = pos + 1) {
      dnaDist[dnaDistributionSong1[pos][0]] = pos;
    }

    for (let pos = 0; pos < dnaSong2.length; pos = pos + 1) {
      const dnaVal: number = dnaSong2[pos];
      const posSol: number = dnaSol[dnaVal];
      const posDist: number = dnaDist[dnaVal];
      const sol: number = solutions[posSol][1][currentUsedPositions[posSol]];
      if (currentUsedPositions[posSol] < solutions[posSol][1].length - 1) {
        currentUsedPositions[posSol] = currentUsedPositions[posSol] + 1;
      } else {
        currentUsedPositions[posSol] = 0;
      }

      // console.log(dnaDistributionSong1[posDist]);
      // console.log(sol);

      const posDNA: number
        = this.distribution16BitsToDistributionSongPosition(dnaDistributionSong1[posDist][2],
                                                            dnaDistributionSong1[posDist][3],
                                                            sol,
                                                            dnaDistributionSong1[posDist][4].
                                                            length);

      const min = dnaDistributionSong1[posDist][4][posDNA] * size;
      let max = min + size;

      if (max > songLeftChannel.length) {
        max = songLeftChannel.length;
      }

      newSongLeftChannel.set(songLeftChannel.slice(min, max), pos * size);
      newSongRightChannel.set(songRightChannel.slice(min, max), pos * size);
    }

    return [newSongLeftChannel, newSongRightChannel];
  }

  private distribution16BitsToDistributionSongPosition(minDnaDist16Bits: number,
                                                       maxDNADist16Bits: number,
                                                       solDNADist16Bits: number,
                                                       sizeSongDNADistribution: number) {
    return Math.floor(sizeSongDNADistribution * (solDNADist16Bits - minDnaDist16Bits) /
                      (maxDNADist16Bits - minDnaDist16Bits));
  }

  private dnaProportion(dnaOriginal: number[], newSize: number): number[] {
    const newDNA: number[] = [];
    const proportion = Math.floor(newSize / dnaOriginal.length);

    if (proportion > 1) {
      dnaOriginal.forEach((crom) => {
        for (let rep: number = 0; rep < proportion; rep = rep + 1) {
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

  private getSongDNA(songLeftChannel: Float32Array,
                     songRightChannel: Float32Array,
                     leftBeats: number[],
                     rightBeats: number[]): number[] {
    const reducedLeftChannel = this.reduceChannelSong(songLeftChannel);
    const reducedRightChannel = this.reduceChannelSong(songRightChannel);

    return this.getChannelsSongDNA(reducedLeftChannel, reducedRightChannel, leftBeats, rightBeats);
  }

  private getChannelsSongDNA(reducedLeftChannel: number[],
                             reducedRightChannel: number[],
                             leftBeats: number[],
                             rightBeats: number[]): number[] {

    const beats = this.refine(Utils.Utils.sortArray(leftBeats.concat(rightBeats)),
                              MusicProcess.tolerance);
    for (let pos: number = 0; pos < beats.length; pos = pos + 1) {
      beats[pos] = Math.floor(beats[pos] / MusicProcess.sliceSize);
    }

    const resp: number[] = [];
    let beatActual: number = 0;
    let unTercio: number = 0;
    let dosTercios: number = 0;
    let tipo: number = 0;

    for (let pos: number = 0; pos < reducedLeftChannel.length; pos = pos + 1) {

      const altura = this.alturaNota(Math.max(reducedLeftChannel[pos], reducedRightChannel[pos]));
      let lugar: number = 0;

      if (pos === beats[beatActual]) {

        tipo = MusicProcess.BEAT;
        lugar = MusicProcess.INICIO;

        resp.push(tipo + altura + lugar);

        let min: number = 0;
        let max: number = 0;

        if (beatActual < beats.length - 1) {
          min = beats[beatActual];
          max = beats[beatActual + 1];
        } else {
          max = reducedLeftChannel.length;
          min = beats[beatActual];
        }

        unTercio = Math.floor((max - min) / 3);
        dosTercios = Math.floor(2 * (max - min) / 3);

        const respLeft = this.getChannelPartDNA(reducedLeftChannel.slice(min, max));
        const respRight = this.getChannelPartDNA(reducedRightChannel.slice(min, max));

        if (respLeft[1] > respRight[1]) {
          tipo = respLeft[0];
        } else {
          tipo = respRight[0];
        }

        beatActual = beatActual + 1;

      } else if (pos === 0) {

        const respLeft = this.getChannelPartDNA(reducedLeftChannel.slice(0, beats[beatActual]));
        const respRight = this.getChannelPartDNA(reducedRightChannel.slice(0, beats[beatActual]));

        if (respLeft[1] > respRight[1]) {
          tipo = respLeft[0];
        } else {
          tipo = respRight[0];
        }

        if (beatActual < beats.length - 1) {
          unTercio = Math.floor(beats[beatActual] / 3);
          dosTercios = Math.floor(2 * beats[beatActual] / 3);
        } else {
          unTercio = 0;
          dosTercios = 0;
        }

        lugar = MusicProcess.INICIO;

        resp.push(tipo + altura + lugar);

      } else {

        if (pos < beats[beatActual - 1] + unTercio) {
          lugar = MusicProcess.INICIO;
        } else if (pos < beats[beatActual - 1] + dosTercios) {
          lugar = MusicProcess.MITAD;
        } else {
          lugar = MusicProcess.FINAL;
        }

        resp.push(tipo + altura + lugar);
      }
    }

    return resp;
  }

  private alturaNota(nota: number): number {
    let altura: number = 0;
    if (nota < MusicProcess.BAJISIMA_VALUE) {
      altura = MusicProcess.BAJISIMA;
    } else if (nota < MusicProcess.BAJA_VALUE) {
      altura = MusicProcess.BAJA;
    } else if (nota < MusicProcess.BAJAMEDIA_VALUE) {
      altura = MusicProcess.BAJAMEDIA;
    } else if (nota < MusicProcess.MEDIA_VALUE) {
      altura = MusicProcess.MEDIA;
    } else if (nota < MusicProcess.MEDIAALTA_VALUE) {
      altura = MusicProcess.MEDIAALTA;
    } else if (nota < MusicProcess.ALTA_VALUE) {
      altura = MusicProcess.ALTA;
    } else {
      altura = MusicProcess.ALTISIMA;
    }

    return altura;
  }

  private llenarArrayDNA (arrayDNA: number[], DNA: number,
                          reducedLeftChannel: number[],
                          reducedRightChannel: number[],
                          min: number, max: number): number[] {
    for (let i: number = min; i < max; i = i + 1) {
      arrayDNA.push(DNA + this.alturaNota(Math.max(reducedLeftChannel[i],
                                                   reducedRightChannel[i])));
    }

    return arrayDNA;
  }

  private getChannelPartDNA(songPart: number[]): [number, number] {
    const max: number = songPart.length;
    const midPoint: number = Math.floor(max / 2);

    let sameLeft: number = 0;
    let sameRight: number = 0;
    let upLeft: number = 0;
    let upRight: number = 0;
    let downLeft: number = 0;
    let downRight: number = 0;

    for (let pos: number = 0; pos < midPoint; pos = pos + 1) {
      if (songPart[pos] < songPart[pos + 1]) {
        upLeft = upLeft + 1;
      } else if (songPart[pos] > songPart[pos + 1]) {
        downLeft = downLeft + 1;
      }

      if (Utils.Utils.compare(songPart[pos], songPart[pos + 1], MusicProcess.toleranceLlanura)) {
        sameLeft = sameLeft + 1;
      }
    }

    for (let pos: number = midPoint; pos < max - 1; pos = pos + 1) {
      if (songPart[pos] < songPart[pos + 1]) {
        upRight = upRight + 1;
      } else if (songPart[pos] > songPart[pos + 1]) {
        downRight = downRight + 1;
      }

      if (Utils.Utils.compare(songPart[pos], songPart[pos + 1], MusicProcess.toleranceLlanura)) {
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
    const options: Array<[number, number]> = [[MusicProcess.LLANURA,
      (sameLeft + sameRight) / max],
      [MusicProcess.VALLE,
        (downLeft + upRight) / max],
      [MusicProcess.MONTANNA,
        (upLeft + downRight) / max],
      [MusicProcess.SUBIDA,
        (upLeft + upRight) / max],
      [MusicProcess.BAJADA,
        (downLeft + downRight) / max]];

    let maxPer: number = 0;
    let tipo: number = 0;

    options.forEach((option) => {
      if (option[1] > maxPer) {
        maxPer = option[1];
        tipo = option[0];
      }
    });

    return [tipo, maxPer];
  }

  private getDistribution16Bits(dnaDistributionSong: Array<[number, number[]]>,
                                totalNumbers: number):
                                Array<[number, number, number, number, number[]]> {
    const resp: Array<[number, number, number, number, number[]]> = [];
    let currentMax: number = 0;

    dnaDistributionSong.forEach((dist) => {
      resp.push([dist[0],
        dist[1].length / totalNumbers,
        currentMax,
        currentMax = currentMax +
      Math.round(MusicProcess.BITS16 *
        dist[1].length / totalNumbers),
        dist[1]]);
      currentMax = currentMax + 1;
    });

    return resp;
  }

  private getDNADistribution(dna: number[]): Array<[number, number[]]> {
    const resp: Array<[number, number[]]> = [];
    const usedDNA: Utils.IHash<boolean> = {};
    const dnaPos: Utils.IHash<number> = {};
    for (let pos = 0; pos < dna.length; pos = pos + 1) {
      const gen = dna[pos];
      if (usedDNA[gen] != undefined && usedDNA[gen]) {
        resp[dnaPos[gen]][1].push(pos);
      } else {
        resp.push([gen, [pos]]);
        usedDNA[gen] = true;
        dnaPos[gen] = resp.length - 1;
      }
    }
    return resp;
  }

}
