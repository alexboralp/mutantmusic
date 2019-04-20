/**
 * Filename: musicprocess.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase que procesa la música
 */

export class MusicProcess {

  // Frecuencia de los samples que se van a trabajar
  private static readonly samplingFrecuency: number = 44100;
  // Frecuencia de los samples que se van a trabajar
  private static readonly tolerance: number = 0.2;
  // Cantidad de repeticiones para considerar que el sonido sí es igual
  private static readonly repeticiones: number = 1;
  // Tiempo entre las repeticiones para considerar que el sonido sí es igual
  private static readonly toleranceTime: number = 0.3;
  // Frecuencia de los samples que se van a trabajar
  private static readonly samplesPerSecond: number = 120;

  // Audio de los dos canales de la canción original
  private audioChanelLeft: Float32Array;
  private audioChanelRight: Float32Array;

  // Audio de los dos canales de la segunda canción
  private audioChanelLeft2: Float32Array;
  private audioChanelRight2: Float32Array;

  constructor(audioChanelLeft: Float32Array,
              audioChanelRight: Float32Array,
              audioChanelLeft2: Float32Array,
              audioChanelRight2: Float32Array) {
    this.audioChanelLeft = audioChanelLeft;
    this.audioChanelRight = audioChanelRight;
    this.audioChanelLeft2 = audioChanelLeft2;
    this.audioChanelRight2 = audioChanelRight2;
  }

  // Funciones disponibles de la clase

  public match(): number[] {
    const totalSamples = Math.floor(MusicProcess.samplesPerSecond
                                    * this.audioChanelLeft2.length
                                    / MusicProcess.samplingFrecuency);

    const originales: number[][] = [];
    const resp: number[] = [];

    for (let cont = 0; cont < totalSamples; cont = cont + 1) {
      const pos = Math.floor(Math.random() * this.audioChanelLeft2.length);
      originales.push([pos, this.audioChanelLeft2[pos], this.audioChanelRight2[pos]]);
    }

    const totalSamplesCancion = Math.floor(MusicProcess.samplesPerSecond
                                           * this.audioChanelLeft.length
                                           / MusicProcess.samplingFrecuency) * 35;

    for (let cont = 0; cont < totalSamplesCancion; cont = cont + 1) {
      const pos = Math.floor(Math.random() * this.audioChanelLeft.length);
      let cont2: number = 0;
      let continuar: boolean = true;
      while (continuar && cont2 < totalSamples) {
        const offset = originales[cont2][0];
        continuar = (this.compare(originales[cont2][1],
                                  this.audioChanelLeft[offset + pos],
                                  MusicProcess.tolerance) &&
                     this.compare(originales[cont2][2],
                                  this.audioChanelRight[offset + pos],
                                  MusicProcess.tolerance));
        cont2 = cont2 + 1;
      }
      if (continuar) {
        resp.push(pos / MusicProcess.samplingFrecuency);
      }
    }

    return this.refinarBusqueda(this.sortArray(resp));
  }

  public unmatch() {

  }

  public dj() {

  }

  public compose() {

  }

  // Getters y Setters

  /**
   * Devuelve el canal izquierdo del mix.
   */
  public getAudioChanelLeft(): Float32Array {
    return this.audioChanelLeft;
  }

  /**
   * Define el canal izquierdo del mix.
   * @param audioChanelLeft El nuevo canal izquierdo.
   */
  public setAudioChanelLeft(audioChanelLeft: Float32Array) {
    this.audioChanelLeft = audioChanelLeft;
  }

  /**
   * Devuelve el canal derecho del mix.
   */
  public getAudioChanelRight(): Float32Array {
    return this.audioChanelRight;
  }

  /**
   * Define el canal derecho del mix.
   * @param audioChanelLeft El nuevo canal derecho.
   */
  public setAudioChanelRight(audioChanelRight: Float32Array) {
    this.audioChanelRight = audioChanelRight;
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

  /*
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

  private refinarBusqueda(tiempos: number[]): number[] {
    if (tiempos.length < 2) {
      return tiempos;
    }

    const refinado: number[] = [];
    let pos: number = 0;
    const tiempoSample = this.audioChanelLeft2.length / MusicProcess.samplingFrecuency;

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

}
