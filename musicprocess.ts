/**
 * Filename: musicprocess.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase que procesa la música
 */

import * as MM from './musicmix';

// Interfaz para crear un Hash
interface IHash<T> {
  [key: string]: T;
}

export class MusicProcess {

  // Frecuencia de los samples que se van a trabajar
  private static readonly samplingFrecuency: number = 44100;
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
  private static readonly succesPercentage: number = 0.80;
  // Cantidad de partes de la canción que se revisan para hacer el mix
  private static readonly mixNumParts: number = 60;

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

  constructor(leftChannel: Float32Array,
              rightChannel: Float32Array,
              leftChannel2: Float32Array,
              rightChannel2: Float32Array) {
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
  public dj() {
    const samples: number[][] = this.getDJTimes(2 * MusicProcess.samplingFrecuency);

    this.mix.addSongsChannels(this.getSamplesFromSong(samples, 2 * MusicProcess.samplingFrecuency));
    this.mix.hacerMixAleatorio(60);

    return [this.mix.getLeftChannel(), this.mix.getRightChannel()];
  }

  public compose() {

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
    console.log('Preparando la canción...');
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
    console.log('Preparando la canción...');
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
    console.log('Preparando la canción...');
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
    console.log('Preparando la canción...');
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
  public getMatchSong(): Float32Array[] {
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
  public getUnMatchSong(): Float32Array[] {
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

  /*
   * Concatena dos arrays de tipo Float32Array.
   * El resultado se devuelve en un nuevo arreglo del mismo tipo.
   */
  private float32Concat(first: Float32Array, second: Float32Array): Float32Array {
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
  private compare(number1: number, number2: number, tolerancia: number): boolean {
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
  private refinarBeats(tiempos: number[][]): number[] {
    const refinado: number[] = [];
    let pos: number = 0;

    while (pos < tiempos.length - MusicProcess.repetitions) {
      if (this.compare(tiempos[pos][0],
                       tiempos[pos + MusicProcess.repetitions][0],
                       MusicProcess.repetitionsTime)) {
        let pos2: number = pos + MusicProcess.repetitions + 1;

        while (pos2 < tiempos.length &&
               this.compare(tiempos[pos][0],
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
   * Función que ordena un array por el valor de cada tiempo.
   * @param pSong Array que se quiere ordenar.
   */
  private sortArray(tiempos: number[]) {
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
  private sortArrayBySecondPos(tiempos: number[][]) {
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
  private sortArrayByFirstPos(tiempos: number[][]) {
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
  private float32Copy(original: Float32Array): Float32Array {
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
  private createNumberedAbsoluteArray(original: Float32Array, offset: number): number[][] {
    const copia: number[][] = [];
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
  private refineBothChannels(lChannel: number[], rChannel: number[]): number[] {
    return this.refine(this.sortArray(lChannel.concat(rChannel)), MusicProcess.tolerance);
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
  private matchChannel(channel1: number[], channel2: number[]): number[] {
    const matchTimes: number[] = [];
    const max = channel1.length - channel2.length;
    for (let pos: number = 0; pos < max ; pos = pos + 1) {
      if (this.getMatchPercentage(channel1, pos, channel2, 0) > MusicProcess.succesPercentage) {
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
  private getMatchPercentage(song1: number[], posSong1: number, song2: number[], posSong2: number) {
    const max = Math.min(song1.length - posSong1, song2.length - posSong2);
    let percentage: number = 0;
    const offsetSong1 = song1[posSong1];
    const offsetSong2 = song2[posSong2];

    if (max > 1) {
      for (let pos = 0; pos < max; pos = pos + 1) {
        if (this.compare(song1[posSong1 + pos] - offsetSong1,
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
    let newChannel = this.createNumberedAbsoluteArray(songChannel, offset);

    // Se ordena el canal por el valor del sonido
    newChannel = this.sortArrayBySecondPos(newChannel);

    // Se obtiene el porcentaje de samples requerido
    const numsamples: number = Math.floor(MusicProcess.samplesPercentage * newChannel.length);
    newChannel = newChannel.slice(newChannel.length - numsamples);

    // Se ordena por tiempo
    newChannel = this.sortArrayByFirstPos(newChannel);

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
    let times: number[][] = [];
    const usedTimes: IHash<boolean> = {};

    // Valor máximo para el random
    const max = Math.floor(this.leftChannel.length / time - 1);

    let posLeft1: number = 0;
    let posLeft2: number = 0;
    let posRight1: number = 0;
    let posRight2: number = 0;

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
  private getSamplesFromSong(samples: number[][], tamanno: number): Float32Array[][] {
    const sonidos: Float32Array[][] = [];
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

}
