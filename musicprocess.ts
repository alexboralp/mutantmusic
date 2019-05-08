/**
 * Filename: musicprocess.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase que procesa la música
 */

import * as MM from './musicmix';

// Interfaz para crear un Hash
interface IHash<T> {
  [key: number]: T;
}

export class MusicProcess {

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
  private static readonly successPercentage: number = 0.80;

  // CONSTANTES PARA EL MIX

  // Cantidad de partes de la canción que se revisan para hacer el mix
  private static readonly mixNumParts: number = 60;

  // CONSTANTES PARA EL COMPOSE

  // Tiempo en que se dividirá la canción para crear la nueva
  // canción considerando que 44100 son un segundo
  private static readonly sliceSize: number = 441 * 5;
  // Tolerancia en el compose para indicar que dos valores son iguales
  private static readonly toleranceLlanura: number = 0.02;
  // Cantidad de individuos con la que se va a trabajar
  private static readonly individualsNumber: number = 100;
  // Porcentaje de Match para decidir que ya se terminó el algoritmo genético
  private static readonly successEndPercentage: number = 0.8;
  // Porcentaje de individuos que quedarán vivos al aplicar el fitness
  private static readonly livePercentage: number = 0.7;
  // Porcentaje de individuos que tendrán mutación
  private static readonly mutationPercentage: number = 0.07;

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
  public dj(): [Float32Array, Float32Array]{
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
    /*try{
      this.esCreateIndex();
    }catch(e){}*/

    let DNASong1: number[] = this.getSongDNA(this.leftChannel, this.rightChannel, this.leftChannelBeats, this.rightChannelBeats);
    let DNASong2: number[] = this.getSongDNA(this.leftChannel2, this.rightChannel2, this.leftChannelBeats2, this.rightChannelBeats2);

    // console.log(DNASong2);

    const totalReducedSongValues = Math.ceil(this.leftChannel.length / MusicProcess.sliceSize);

    // Proporciona el ADN de la segunda canción
    DNASong2 = this.DNAProportion(DNASong2, DNASong1.length);

    // let distribution: Array<[string, number]> = [];

    // Nomenclatura:
    /*
     * L : Llanura -> 10
     * V : Valle -> 20
     * M : Montaña -> 30
     * U : Subida (Uphill) -> 40
     * D : Bajada (Downhill) -> 50
     */

    //this.esBulkSong(DNASong1);

    //let totales = this.esSearch();

    /*totales.then((totales) => 
    {
      let tot = totales.aggregations.byType.buckets;
      tot.forEach((t: any) => {
        distribution.push([t.key, t.doc_count]);

        console.log(distribution);
      });
    });*/

    let individuals: Array<number[]> = this.createIndividuals(totalReducedSongValues, MusicProcess.individualsNumber);
    
    let bestIndividual: number[] = [];
    let bestPercentage: number = 0;
    let seguir: boolean = true;
    let numGenerations: number = 0;

    while(seguir) {
      individuals = this.fitnessOfIndividuals(individuals, DNASong1, DNASong2);
      bestIndividual = individuals[individuals.length - 1];
      bestPercentage = this.fitnessOfIndividual(bestIndividual, DNASong1, DNASong2);
      if (bestPercentage > bestIndividual.length * MusicProcess.successEndPercentage) {
        seguir = false;
      } else {
        numGenerations = numGenerations + 1;
        if (numGenerations % 10 == 0) {
          process.stdout.write("Generations:" + numGenerations + ", best percentage so far: " + bestPercentage + "/" + bestIndividual.length + '\r'); // '\033[0G');
        }
        // console.log("Best percentage so far: " + bestPercentage);
        individuals = this.crossIndividuals(individuals, MusicProcess.individualsNumber);
        this.mutateIndividuals(individuals, MusicProcess.individualsNumber);
      }
    }
    
    process.stdout.write('\n');
    console.log("Best individual:");
    console.log(bestIndividual);

    /*try{
      this.esDeleteIndex();
    }catch(e){}*/

    return this.createSong(bestIndividual, this.leftChannel, this.rightChannel, MusicProcess.sliceSize);
  }

  private createSong(individual: number[], songLeftChannel: Float32Array, songRightChannel: Float32Array, size: number): [Float32Array, Float32Array] {
    let totalSize: number = individual.length * size;
    let newSongLeftChannel: Float32Array = new Float32Array(totalSize);
    let newSongRightChannel: Float32Array = new Float32Array(totalSize);

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

  private DNAProportion(DNAOriginal: number[], newSize: number): number[] {
    let newDNA: number[] = [];
    let proportion = Math.floor(newSize / DNAOriginal.length);
    
    if (proportion > 1) {
      DNAOriginal.forEach(crom => {
        for(let rep: number = 0; rep < proportion; rep = rep + 1) {
          newDNA.push(crom);
        }
      });
    }

    const faltante = newSize - newDNA.length;
    for (let cont = 0; cont < faltante; cont = cont + 1) {
      let pos = Math.floor(cont * newDNA.length / faltante);
      newDNA.splice(pos, 0, newDNA[pos]);
    }
    
    return newDNA;
  }

  private mutateIndividuals(individuals: Array<number[]>, cant: number) {
    individuals.forEach(individual => {
      if (Math.random() < MusicProcess.mutationPercentage) {
        return this.mutateIndividual(individual, cant);
      }
    });
  }

  private mutateIndividual(individual: number[], cant: number) {
    const pos = Math.floor(Math.random() * individual.length);
    const valMutation = Math.floor(Math.random() * cant);

    individual[pos] = valMutation;
  }

  private fitnessOfIndividuals(individuals: Array<number[]>, DNASong1: number[], DNASong2: number[]): Array<number[]>{
    let individualFitness: Array<[number[],number]> = [];
    individuals.forEach((individual) => {
      individualFitness.push([individual, this.fitnessOfIndividual(individual, DNASong1, DNASong2)]);
    });
    this.sortArrayBySecondPos(individualFitness);
    const min = (1 - MusicProcess.livePercentage) * individualFitness.length;
    individualFitness = individualFitness.slice(min);
    let liveIndividuals: Array<number[]> = Array<number[]>(individualFitness.length);
    for (let pos = 0; pos < individualFitness.length; pos = pos +1) {
      liveIndividuals[pos] = individualFitness[pos][0];
    }

    return liveIndividuals;
  }

  private fitnessOfIndividual(individual: number[], DNASong1: IHash<number>, DNASong2: IHash<number>): number {
    let numMatches: number = 0;

    for (let pos: number = 0; pos < individual.length; pos = pos + 1) {
      if (DNASong1[individual[pos]] == DNASong2[individual[pos]]) {
        numMatches = numMatches + 1;
      }
    }
    return numMatches;
  }

  private crossIndividuals(individuals: Array<number[]>, cant: number): Array<number[]> {
    const long = individuals[0].length;
    let newIndividuals: Array<number[]> = new Array<number[]>(cant);
    for (let pos: number = 0; pos < cant; pos = pos + 1) {
      let posFather: number = Math.floor(Math.random() * individuals.length);
      let posMother: number = Math.floor(Math.random() * individuals.length);
      newIndividuals[pos] = this.newSon(individuals[posFather], individuals[posMother]);
    }
    return newIndividuals;
  }

  private newSon(father: number[], mother: number[]) {
    let son: number[] = new Array<number>(father.length);
    for (let cantCrom: number = 0; cantCrom < father.length; cantCrom = cantCrom + 1) {
      if (cantCrom % 2 == 0) {
        son[cantCrom] = father[cantCrom];
      } else {
        son[cantCrom] = mother[cantCrom];
      }
    }

    return son;
  }

  private createIndividuals(max: number, cant: number): Array<number[]> {
    let individuals: Array<number[]> = new Array<number[]>(cant);
    for (let cont: number = 0; cont < cant; cont = cont + 1) {
      individuals[cont] =  this.createIndividual(max);
    }
    return individuals;
  }

  private createIndividual(max: number): number[] {
    let individual: number[] = new Array<number>(max);
    for (let cont: number = 0; cont < max; cont = cont + 1) {
      individual[cont] = Math.floor(Math.random() * max);
    }
    return individual;
  }

  private async esSearch(): Promise<any> {
    var client = require('./esconnection.js');

    let response = await new Promise<any>((resolve, reject) => {
      resolve(client.search({
          index: "song",
          type: "part",
          body: {
            "aggs": {
              "byType": {
                "terms":{
                  "field":"type.keyword"
                }
              }
            }
          }
        })
      );
    });

    return response;
  }

  private async esBulkSong(DNASong: Array<[number, string]>): Promise<any> {
    var bulk: any[] = this.esPrepareBulkData(DNASong);
    return await new Promise<any>((resolve, reject) => {
      resolve(this.indexall(bulk))});
  }

  private async indexall(madebulk: any): Promise<any>{
    var client = require('./esconnection.js');
    return await new Promise<any>((resolve, reject) => {
      resolve(client.bulk({
          maxRetries: 5,
          index: 'song',
          type: 'part',
          body: madebulk
        })
      )
    });
  }

  private esPrepareBulkData(DNASong: Array<[number, string]>): any[]{
    let bulk: any[] = [];

    DNASong.forEach(part => {
      bulk.push(
        { index: {_index: 'song', _type: 'part', _id: part[0] } },
        {
          'type': part[1]
        }
      );
    });

    return bulk;
  }

  private async esCreateIndex() {
    var client = require('./esconnection.js');

    await client.indices.create({  
      index: 'song'
    },function(err: any, resp: any, status: any) {
      if(err) {
        console.log(err);
      }
      else {
        console.log("create",resp);
      }
    });
  }

  private async esDeleteIndex() {
    var client = require('./esconnection.js');

    await client.indices.delete({index: 'song'},function(err: any, resp: any, status: any) {  
      console.log("delete", resp);
    });
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

    const beats = this.refine(this.sortArray(leftBeats.concat(rightBeats)), MusicProcess.tolerance);
    let resp: number[] = [];
    let min: number = 0;

    for (let cont = 0; cont <= beats.length; cont = cont + 1) {
      let max: number;
      if (cont < beats.length) {
        max = Math.floor(beats[cont] / MusicProcess.sliceSize - 1);
      } else {
        max = reducedLeftChannel.length;
      }

      if (min != 0 || max == 0) {
        resp.push(1); // 1: BEAT
        min = min + 1;
      }

      if (min < max) {
        const respLeft = this.getChannelPartDNA(reducedLeftChannel.slice(min, max));
        const respRight = this.getChannelPartDNA(reducedRightChannel.slice(min, max));

        let tipo: number;

        if (respLeft[1] > respRight[1]) {
          tipo = respLeft[0];
        } else {
          tipo = respRight[0];
        }
        
        let unTercio: number = Math.floor((max - min) / 3);
        let dosTercios: number = Math.floor(2 * (max - min) / 3);
        if (tipo == 10) { // 10 son llanuras
          if (reducedLeftChannel[min + unTercio] < 0.33) {
            this.llenarArrayDNA(resp, tipo, min, max); // 10: Llanura baja
          } else if (reducedLeftChannel[min + unTercio] < 0.66) {
            this.llenarArrayDNA(resp, tipo + 1, min, max); // 11: Llanura media
          } else {
            this.llenarArrayDNA(resp, tipo + 2, min, max); // 12: Llanura alta
          }
        } else {
          this.llenarArrayDNA(resp, tipo, min, min + unTercio); // Inicio
          this.llenarArrayDNA(resp, tipo + 1, min + unTercio, min + dosTercios); // Medio
          this.llenarArrayDNA(resp, tipo + 2, min + dosTercios, max); // Final
        }

      }
      min = max + 1;
    }

    return resp;
  }

  private llenarArrayDNA (arrayDNA: number[], DNA: number, min: number, max: number) {
    for (let i: number = min; i < max; i = i + 1) {
      arrayDNA.push(DNA);
    }
  }

  /**
   * Calcula la función piso para un número dado con el escalón del tamaño dado por n.
   * @param x El número al que se le quiere hacer el cálculo.
   * @param n El tamaño del escalón.
   */
  private myFloor(x: number, n: number): number {
    return Math.floor(x / n) * n;
  }

  private getChannelPartDNA(songPart: number[]): [number, number]  {
    const max: number = songPart.length;
    let midPoint: number = Math.floor(max / 2);

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

      if (this.compare(songPart[pos],songPart[pos + 1],MusicProcess.toleranceLlanura)) {
        sameLeft = sameLeft + 1;
      }
    }

    for (let pos: number = midPoint; pos < max - 1; pos = pos + 1) {
      if (songPart[pos] < songPart[pos + 1]) {
        upRight = upRight + 1;
      } else if (songPart[pos] > songPart[pos + 1]) {
        downRight = downRight + 1;
      }

      if (this.compare(songPart[pos],songPart[pos + 1],MusicProcess.toleranceLlanura)) {
        sameRight = sameRight + 1;
      }
    }

    // Nomenclatura:
    /*
     * L : Llanura : 10
     * V : Valle : 20
     * M : Montaña : 30
     * U : Subida (Uphill) : 40
     * D : Bajada (Downhill) : 50
     */
    let options: Array<[number, number]> = [[10, (sameLeft + sameRight) / max], 
                   [20, (downLeft + upRight) / max],
                   [30, (upLeft + downRight) / max],
                   [40, (upLeft + upRight) / max],
                   [50, (downLeft + downRight) / max]];

    let maxPer: number = 0;
    let letter: number = 0;

    options.forEach((option) => {
      if (option[1] > maxPer) {
        maxPer = option[1];
        letter = option[0];
      }
    });

    return [letter, maxPer];
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
  private sortArrayBySecondPos(tiempos: Array<[any, number]>) {
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
  private sortArrayByFirstPos(tiempos: Array<[number, any]>) {
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
  private createNumberedAbsoluteArray(original: Float32Array, offset: number): Array<[number, number]> {
    const copia: Array<[number, number]> = [];
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
    let times: Array<[number, number]> = [];
    const usedTimes: IHash<boolean> = {};

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

  /**
   * Obtiene el promedio de una lista de números.
   * @param numbers Una lista de números.
   */
  private getAverage(numbers: Float32Array): number {
    let total: number = 0;

    numbers.forEach((number) => {
      total = total + number;
    });

    return total / numbers.length;
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
        resp = absValue
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
    let reducedSong: number[] = [];
    let minPos: number = 0;

    for (let cont: number = 0; minPos < songChannel.length; cont = cont + 1) {
      minPos = cont * MusicProcess.sliceSize;
      if (minPos + MusicProcess.sliceSize < songChannel.length) {
        reducedSong.push(this.getMaxAbsoluteValue(songChannel.slice(minPos, minPos + MusicProcess.sliceSize)));
      } else {
        reducedSong.push(this.getMaxAbsoluteValue(songChannel.slice(minPos)));
      }
    }

    return reducedSong;
  }

}
