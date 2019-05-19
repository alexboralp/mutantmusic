/**
 * Filename: GA.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase que realiza las operaciones de un algoritmo genético
 *              que opera sobre números de 16 bits.
 */

import * as AGAN from './AbstractGANumber16Bits';

export class GANumber16Bits extends AGAN.AbstractGANumber16Bits {

  // Funciones disponibles de la clase

  /**
   * Realiza la composición de la primera canción tomando como envolvente
   * la segunda canción. Transforma la primera canción por medio de un
   * algoritmo genético para que su forma cambie a la forma de la primera
   * canción.
   */
  public main(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // Crea el índice donde se guardarán los valores del ADN
      /*let response = this.esCreateIndex();
      response.catch((err)=>
      {
        console.log("Error while creating the index: " + err);
        reject();
      });
      response.then((resp)=>
      {*/
      const dnaSong1: number[] = this.getSongDNA(this.leftChannel,
                                                 this.rightChannel,
                                                 this.leftChannelBeats,
                                                 this.rightChannelBeats);
      let dnaSong2: number[] = this.getSongDNA(this.leftChannel2,
                                               this.rightChannel2,
                                               this.leftChannelBeats2,
                                               this.rightChannelBeats2);

      // Proporciona el ADN de la segunda canción
      dnaSong2 = this.dnaProportion(dnaSong2, dnaSong1.length);

      const totalReducedSongValues = Math.min(dnaSong1.length, dnaSong2.length);

      const distribution: Array<[number, number]> = [];

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
              tot.forEach((t: any) => {
                distribution.push([t.key, t.doc_count]);
              });

              let individuals: number[][] = this.createIndividuals(MusicProcess.individualsNumber,
                                                                   distribution,
                                                                   dnaSong1);

              let bestIndividual: number[] = [];
              let bestPercentage: number = 0;
              let seguir: boolean = true;
              let numGenerations: number = 0;

              while (seguir && numGenerations < MusicProcess.stopGenerationsNumber) {
                individuals = this.fitnessOfIndividuals(individuals, dnaSong1, dnaSong2);

                bestIndividual = individuals[individuals.length - 1];
                bestPercentage = this.fitnessOfIndividual(bestIndividual, dnaSong1, dnaSong2);
                if (bestPercentage > bestIndividual.length * MusicProcess.successEndPercentage) {
                  seguir = false;
                } else {
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
                  resolve(this.createSong(bestIndividual,
                                          this.leftChannel,
                                          this.rightChannel,
                                          MusicProcess.sliceSize));
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
  }

  // Getters y Setters

  // Métodos privados

  /**
   * Determina el fitness del individuo (si es un buen individuo para reproducir),
   * lo que asocia es un número al individuo, al final se quedarán los que quedaron
   * con al mejor nota.
   * @param individual El individuo al que se le quiere calcular el fitness.
   * @param poblation La población con la que se quiere comparar (¿será que el contra
   * el fitness de la población).
   */
  public fitnessOfIndividual(individual: number, poblation: number[]): number {
    return 1;
  }

  private mutateIndividuals(individuals: number[][], cant: number): number[][] {
    for (let pos: number = 0; pos < individuals.length; pos = pos + 1) {
      if (Math.random() < MusicProcess.mutationPercentage) {
        individuals[pos] = this.mutateIndividual(individuals[pos], cant);
      }
    }
    return individuals;
  }

  private mutateIndividual(individual: number[], cant: number): number[] {
    const pos = Math.floor(Math.random() * individual.length);
    const valMutation = Math.floor(Math.random() * cant);

    individual[pos] = valMutation;

    return individual;
  }

  private fitnessOfIndividuals(individuals: number[][],
                               dnaSong1: number[],
                               dnaSong2: number[]): number[][] {
    let individualFitness: Array<[number[], number]> = [];
    individuals.forEach((individual) => {
      individualFitness.push([individual, this.fitnessOfIndividual(individual,
                                                                   dnaSong1,
                                                                   dnaSong2)]);
    });
    this.sortArrayBySecondPos(individualFitness);
    const min = (1 - MusicProcess.livePercentage) * individualFitness.length;
    individualFitness = individualFitness.slice(min);
    const liveIndividuals: Array<number[]> = Array<number[]>(individualFitness.length);
    for (let pos = 0; pos < individualFitness.length; pos = pos + 1) {
      liveIndividuals[pos] = individualFitness[pos][0];
    }

    return liveIndividuals;
  }

  private fitnessOfIndividual(individual: number[],
                              dnaSong1: number[],
                              dnaSong2: number[]): number {
    let numMatches: number = 0;

    for (let pos: number = 0; pos < individual.length; pos = pos + 1) {
      const crom: number = individual[pos];
      if (dnaSong1[crom] === dnaSong2[pos]) {
        numMatches = numMatches + 1;
      }
    }

    return numMatches;
  }

  protected crossIndividuals(father: number, mother: number): number {
    return ((father & 0b1111111100000000) + (mother & 0b0000000011111111));
  }

  private crossIndividuals(individuals: number[][], cant: number): number[][] {
    const newIndividuals: number[][] = new Array<number[]>(cant);
    for (let pos: number = 0; pos < cant; pos = pos + 1) {
      const posFather: number = Math.floor(Math.random() * individuals.length);
      const posMother: number = Math.floor(Math.random() * individuals.length);
      newIndividuals[pos] = this.newSon(individuals[posFather], individuals[posMother]);
    }
    return newIndividuals;
  }

  private newSon(father: number[], mother: number[]): number[] {
    const son: number[] = new Array<number>(father.length);
    for (let cantCrom: number = 0; cantCrom < father.length; cantCrom = cantCrom + 1) {
      if (cantCrom % 2 === 0) {
        son[cantCrom] = father[cantCrom];
      } else {
        son[cantCrom] = mother[cantCrom];
      }
    }

    return son;
  }

  private createIndividuals(cant: number,
                            distribution: Array<[number, number]>,
                            dnaSong: number[]): Array<number[]> {
    const individuals: Array<number[]> = new Array<number[]>(cant);

    for (let cont: number = 0; cont < cant; cont = cont + 1) {
      individuals[cont] = this.createIndividual(distribution, dnaSong);
    }

    return individuals;
  }

  private createIndividual(distribution: Array<[number, number]>, dnaSong: number[]): number[] {
    const individual: number[] = new Array<number>(dnaSong.length);
    const max = dnaSong.length;
    const dist: number[] = new Array<number>(distribution.length);
    const position: IHash<number> = {};

    for (let cont = 0; cont < distribution.length; cont = cont + 1) {
      const value = distribution[cont][0];
      dist[cont] = 0;
      position[value] = cont;
    }

    let total: number = 0;
    while (total < max) {
      const newValue = Math.floor(Math.random() * max);
      const pos: number = position[dnaSong[newValue]];
      if (dist[pos] < distribution[pos][1]) {
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

}
