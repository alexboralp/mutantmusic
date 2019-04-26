/**
 * Filename: musicprocess.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase que procesa la música
 */

import * as MM from './musicmix';

export class MusicProcess {
  /* Nivel de confianza.
   * El valor estará entre 0 y 1.
   * 0 significa que considerará que todos los sonidos son iguales.
   * 1 significa que sólo una coincidencia (casi) exacta funcionará.
   * Entre mayor confianza los resultados serán más exactos pero durará más.
   * Entre menos confianza se presentarán más falsos positivos pero durará menos.
   */
  // private static readonly confianza: number = 0.9;

  // Frecuencia de los samples que se van a trabajar
  private static readonly samplingFrecuency: number = 44100;
  // Tolerancia para considerar que dos valores son iguales
  private static readonly tolerance: number = 0.15;
  // Cantidad de repeticiones para considerar que el sonido sí es igual
  private static readonly repeticiones: number = 1;
  // Tiempo entre las repeticiones para considerar que el sonido sí es igual
  private static readonly toleranceTime: number = 0.3;
  // Cantidad de samples por segundo que se van a obtener del segundo sonido para comparar
  private static readonly samplesPerSecondToCompare: number = 30;
  // Cantidad de samples por segundo que se van a trabajar de la canción original
  private static readonly samplesPerSecondSong: number = 20000;
  // Cantidad de samples que se utilizarán para sacar el promedio alrededor del sample anterior.
  // private static readonly samplesAverage: number = 20;
  // Intervalo alrededor del sample original donde se tomarán los samples para el promedio, 10 puntos antes y 10 puntos después.
  private static readonly averageInterval: number = 10;

  // Audio de los dos canales de la canción original
  private audioChannelLeft: Float32Array;
  private audioChannelRight: Float32Array;

  // Audio de los dos canales de la segunda canción
  private audioChannelLeft2: Float32Array;
  private audioChannelRight2: Float32Array;

  // Variable donde se guardarán los tiempos en que la segunda canción hace match
  private matchTimes: number[];

  // Variable que se utilizará cuando se quiera realizar un mix de la canción.
  private mix: MM.MusicMix;

  constructor(audioChannelLeft: Float32Array,
              audioChannelRight: Float32Array,
              audioChannelLeft2: Float32Array,
              audioChannelRight2: Float32Array) {
    this.audioChannelLeft = audioChannelLeft;
    this.audioChannelRight = audioChannelRight;
    this.audioChannelLeft2 = audioChannelLeft2;
    this.audioChannelRight2 = audioChannelRight2;
    this.matchTimes = [];
    this.mix = new MM.MusicMix();
  }

  // Funciones disponibles de la clase

  public match(): number[] {
    const totalSamples = Math.floor(MusicProcess.samplesPerSecondToCompare
                                    * this.audioChannelLeft2.length
                                    / MusicProcess.samplingFrecuency);

    const originales: number[][] = [];
    const resp: number[] = [];

    console.log('Sacando los samples del segundo audio...');

    for (let cont = 0; cont < totalSamples; cont = cont + 1) {
      const pos = MusicProcess.averageInterval + Math.floor(Math.random() * (this.audioChannelLeft2.length - 2 * MusicProcess.averageInterval));
      originales.push([pos, this.getAverageValue(pos, this.audioChannelLeft2), this.getAverageValue(pos, this.audioChannelRight2)]);
    }

    const totalSamplesCancion = Math.floor(MusicProcess.samplesPerSecondSong
                                           * this.audioChannelLeft.length
                                           / MusicProcess.samplingFrecuency);

    console.log('Comparando con los samples de la canción original...');

    for (let cont = 0; cont < totalSamplesCancion; cont = cont + 1) {
      const pos = Math.floor(Math.random() * (this.audioChannelLeft.length - this.audioChannelLeft2.length));
      let cont2: number = 0;
      let continuar: boolean = true;
      while (continuar && cont2 < totalSamples) {
        const offset = originales[cont2][0];
        continuar = (this.compare(originales[cont2][1],
                                  this.getAverageValue(offset + pos, this.audioChannelLeft),
                                  MusicProcess.tolerance) &&
                     this.compare(originales[cont2][2],
                                  this.getAverageValue(offset + pos, this.audioChannelRight),
                                  MusicProcess.tolerance));
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
  }

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

  private getAverageValue(pos: number, array: Float32Array): number {
    let average: number = 0;
    for (let newPos = pos - MusicProcess.averageInterval; newPos < pos + MusicProcess.averageInterval; newPos = newPos + 1){
      average = average + array[newPos];
    }
    return average / (2 * MusicProcess.averageInterval);
  }

  /**
   * Busca los diez segundos que más se repiten en la canción y
   * los utiliza para realizar un mix.
   */
  public dj() {
    let samples: number[][] = [];
    for (let cantSongs = 0; cantSongs < 60; cantSongs = cantSongs + 1) {
      const pos = Math.floor(Math.random() * this.audioChannelLeft.length);
      this.audioChannelLeft.set(this.audioChannelLeft.slice(pos,
                                                            pos +
                                                            MusicProcess.samplingFrecuency));
      this.audioChannelRight.set(this.audioChannelRight.slice(pos,
                                                              pos +
                                                              MusicProcess.samplingFrecuency));
      samples.push([pos, this.match().length]);
    }

    this.sortArrayDj(samples);
    samples = samples.slice(0, 10);

    const sonidos: Float32Array[][] = [];
    const sonidoChannelLeft = new Float32Array(MusicProcess.samplingFrecuency);
    const sonidoChannelRight = new Float32Array(MusicProcess.samplingFrecuency);
    samples.forEach((sample) => {
      const pos = sample[0];
      sonidoChannelLeft.set(this.audioChannelLeft.slice(pos,
                                                        pos + MusicProcess.samplingFrecuency));
      sonidoChannelRight.set(this.audioChannelRight.slice(pos,
                                                          pos + MusicProcess.samplingFrecuency));
      sonidos.push([this.float32Copy(sonidoChannelLeft), this.float32Copy(sonidoChannelRight)]);
    });
    this.mix.addSongsChannels(sonidos);
    this.mix.hacerMixAleatorio(60);

    return [this.mix.getAudioChannelLeft(), this.mix.getAudioChannelRight()];
  }

  public compose() {

  }

  // Getters y Setters

  /**
   * Devuelve el canal izquierdo del mix.
   */
  public getAudioChannelLeft(): Float32Array {
    return this.audioChannelLeft;
  }

  /**
   * Define el canal izquierdo del mix.
   * @param audioChannelLeft El nuevo canal izquierdo.
   */
  public setAudioChannelLeft(audioChannelLeft: Float32Array) {
    this.audioChannelLeft = audioChannelLeft;
  }

  /**
   * Devuelve el canal derecho del mix.
   */
  public getAudioChannelRight(): Float32Array {
    return this.audioChannelRight;
  }

  /**
   * Define el canal derecho del mix.
   * @param audioChannelLeft El nuevo canal derecho.
   */
  public setAudioChannelRight(audioChannelRight: Float32Array) {
    this.audioChannelRight = audioChannelRight;
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
    const tamanno = this.matchTimes.length * this.audioChannelLeft2.length;
    const leftChannel = new Float32Array(tamanno);
    const rightChannel = new Float32Array(tamanno);

    for (let pos: number = 0; pos < this.matchTimes.length; pos = pos + 1) {
      const begin = Math.floor(this.matchTimes[pos] * MusicProcess.samplingFrecuency);
      const end = begin + this.audioChannelLeft2.length;
      leftChannel.set(this.audioChannelLeft.slice(begin, end),
                      Math.floor(pos * this.audioChannelLeft2.length));
      rightChannel.set(this.audioChannelRight.slice(begin, end),
                       Math.floor(pos * this.audioChannelRight2.length));
    }

    return [leftChannel, rightChannel];
  }

  /**
   * Devuelve la canción quitando las partes donde hubo match.
   */
  public getUnMatchSong(): Float32Array[] {
    const tamanno = this.audioChannelLeft.length -
                    this.matchTimes.length * this.audioChannelLeft2.length;
    const leftChannel = new Float32Array(tamanno);
    const rightChannel = new Float32Array(tamanno);

    let posActual: number = 0;

    if (this.matchTimes.length === 0) {
      leftChannel.set(this.audioChannelLeft);
      rightChannel.set(this.audioChannelRight);
    } else {
      for (let pos: number = 0; pos < this.matchTimes.length + 1; pos = pos + 1) {
        let begin: number;
        let end: number;
        if (pos !== 0) {
          begin = Math.floor(this.matchTimes[pos - 1] * MusicProcess.samplingFrecuency
                             + this.audioChannelLeft2.length);
        } else {
          begin = 0;
        }
        if (pos !== this.matchTimes.length) {
          end = Math.floor(this.matchTimes[pos] * MusicProcess.samplingFrecuency);
        } else {
          end = this.audioChannelLeft.length;
        }

        leftChannel.set(this.audioChannelLeft.slice(begin, end), posActual);
        rightChannel.set(this.audioChannelRight.slice(begin, end), posActual);
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
   * Toma los valores en donde se dio el match y los refina quitando los puntos
   * que están muy cercanos (repetidos).
   * @param tiempos El arreglo con los tiempos en que se dio match.
   */
  private refinarBusqueda(tiempos: number[]): number[] {
    if (tiempos.length < 2) {
      return tiempos;
    }

    const refinado: number[] = [];
    let pos: number = 0;
    const tiempoSample = this.audioChannelLeft2.length / MusicProcess.samplingFrecuency;

    while (pos < tiempos.length - MusicProcess.repeticiones) {
      if (this.compare(tiempos[pos],
                       tiempos[pos + MusicProcess.repeticiones],
                       MusicProcess.toleranceTime)) {
        let pos2: number = pos + MusicProcess.repeticiones + 1;

        while (this.compare(tiempos[pos],
                            tiempos[pos2],
                            tiempoSample)) {
          pos2 = pos2 + 1;
        }
        refinado.push(tiempos[pos]);

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
  private sortArrayDj(tiempos: number[][]) {
    return tiempos.sort((time1, time2) => {
      if (time1[1] > time2[1]) {
        return -1;
      }
      if (time1[1] < time2[1]) {
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

}
