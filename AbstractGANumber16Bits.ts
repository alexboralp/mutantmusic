/**
 * Filename: GANumber16Bits.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase abstracta que realiza las operaciones básicas de un
 *              algoritmo genético que opera sobre números de 16 bits.
 */

import * as Utils from './Utils';

export abstract class AbstractGANumber16Bits {

  // Hash donde se guarda si un individuo hizo match o no.
  protected matchHash: boolean[];
  // Porcentaje de individuos que actualmente cumplen con el match
  protected actualPoblationMatchPercentage: number;

  // Variable donde se guarda la población, en este caso números
  private poblation: number[];
  // Porcentaje de Match para decidir que ya se terminó el algoritmo genético
  private successEndPercentage: number;
  // Porcentaje de individuos que quedarán vivos al aplicar el fitness
  private livePercentage: number;
  // Porcentaje de individuos que tendrán mutación
  private mutationPercentage: number;
  // Número máximo de generaciones, si se llega a este número se sale con la solución
  // que se tenga en ese momento.
  private stopGenerationsNumber: number;
  // Variable que indica si la población debe ser reemplazada después de crear los hijos.
  private replacePoblation: boolean;
  // Tolerancia en el porcentaje obtenido para decir que ya se resolvió el problema.
  private tolerance: number;

  // Cantidad de individuos en la población
  private cantIndividuals: number;
  // Cantidad de individuos que hacen match
  private totalMatchIndividuals: number;

  constructor(poblation: number[], successEndPercentage: number, livePercentage: number,
              mutationPercentage: number, stopGenerationsNumber: number,
              replacePoblation: boolean, tolerance: number) {
    this.poblation = poblation;
    this.successEndPercentage = successEndPercentage;
    this.livePercentage = livePercentage;
    this.mutationPercentage = mutationPercentage;
    this.stopGenerationsNumber = stopGenerationsNumber;
    this.replacePoblation = replacePoblation;
    this.tolerance = tolerance;

    this.cantIndividuals = poblation.length;
    this.totalMatchIndividuals = 0;
    this.actualPoblationMatchPercentage = 0;
    this.matchHash = new Array(this.cantIndividuals);
  }

  // FUNCIÓN PRINCIPAL

  public runGA(): number[] {
    let numGenerations: number = 0;
    this.actualPoblationMatchPercentage = this.matchOfPoblation(this.poblation);

    // console.log(this.successEndPercentage);

    while (!Utils.Utils.compare(this.actualPoblationMatchPercentage,
                                this.successEndPercentage,
                                this.tolerance) &&
           numGenerations < this.stopGenerationsNumber) {

      // console.log('Buscando los mejores individuos...');
      this.poblation = this.getBestIndividuals(this.poblation);

      // console.log('Cruzando los individuos...');
      this.poblation = this.crossIndividuals(this.poblation);

      // console.log('Mutando los individuos...');
      this.mutateIndividuals(this.poblation);

      numGenerations = numGenerations + 1;
      this.actualPoblationMatchPercentage = this.totalMatchIndividuals / this.cantIndividuals;
      if (numGenerations % 10 === 0) {
        process.stdout.write(`Generations: ${numGenerations}` +
                             ', poblation match percentage:' +
                             `${this.actualPoblationMatchPercentage}` + '\r');
      }
    }
    process.stdout.write('\n');

    return this.poblation;
  }

  /**
   * Devuelve la lista de los elementos de la población que hicieron match
   */
  public getMatchIndividualsFromPoblation(): number[] {
    console.log('getMatchIndividualsFromPoblation');
    const resp: number[] = [];
    for (let pos = 0; pos < this.poblation.length; pos = pos + 1) {
      if (this.matchHash[pos]) {
        resp.push(this.poblation[pos]);
      }
    }
    return resp;
  }

  // GETTERS Y SETTERS

  public getPoblation(): number[] {
    return this.poblation;
  }

  public setPoblation(poblation: number[]) {
    this.poblation = poblation;
  }

  public getSuccessEndPercentage(): number {
    return this.successEndPercentage;
  }

  public setSuccessEndPercentage(successEndPercentage: number) {
    this.successEndPercentage = successEndPercentage;
  }

  public getLivePercentage(): number {
    return this.livePercentage;
  }

  public setLivePercentage(livePercentage: number) {
    this.livePercentage = livePercentage;
  }

  public getMutationPercentage(): number {
    return this.mutationPercentage;
  }

  public setMutationPercentage(mutationPercentage: number) {
    this.mutationPercentage = mutationPercentage;
  }

  public getStopGenerationsNumber(): number {
    return this.stopGenerationsNumber;
  }

  public setStopGenerationsNumber(stopGenerationsNumber: number) {
    this.stopGenerationsNumber = stopGenerationsNumber;
  }

  public getReplacePoblation(): boolean {
    return this.replacePoblation;
  }

  public setReplacePoblation(replacePoblation: boolean) {
    this.replacePoblation = replacePoblation;
  }

  public getTolerance(): number {
    return this.tolerance;
  }

  public setTolerance(tolerance: number) {
    this.tolerance = tolerance;
  }

  // FUNCIONES DEL ALGORITMO GENÉTICO

  /**
   * Determina el fitness del individuo (si es un buen individuo para reproducir),
   * lo que asocia es un número al individuo, al final se quedarán los que quedaron
   * con al mejor nota.
   * Esta función debe ser implementada por las clases concreta ya que esto
   * depende de cada problema que se quiera resolver.
   * @param individual El individuo al que se le quiere calcular el fitness.
   * @param poblation La población con la que se quiere comparar (¿será que el contra
   * el fitness de la población).
   */
  protected fitnessOfIndividuals(poblation: number[]): Array<[number, number]> {
    // console.log('fitnessOfIndividuals');
    const poblationfitness: Array<[number, number]> = new Array();
    for (let pos: number = 0; pos < poblation.length; pos = pos + 1) {
      poblationfitness.push([pos, this.fitnessOfIndividual(poblation[pos])]);
    }
    return poblationfitness;
  }

  /**
   * Determina el fitness del individuo (si es un buen individuo para reproducir),
   * lo que asocia es un número al individuo, al final se quedarán los que quedaron
   * con al mejor nota.
   * Esta función debe ser implementada por las clases concreta ya que esto
   * depende de cada problema que se quiera resolver.
   * @param individual El individuo al que se le quiere calcular el fitness.
   * @param poblation La población con la que se quiere comparar (¿será que el contra
   * el fitness de la población).
   */
  protected abstract fitnessOfIndividual(individual: number): number;

  /**
   * Determina si el individuo cumple con lo que se busca.
   * Esta función debe ser implementada por las clases concreta ya que esto
   * depende de cada problema que se quiera resolver.
   * @param individual El individuo al que se le quiere calcular el match.
   * @param poblation La población con la que se quiere comparar (¿será que el contra
   * el fitness de la población).
   */
  protected abstract matchOfIndividual(individual: number): boolean;

  /**
   * Función que determina el porcentaje de individuos que cumplen con la condición dada.
   * @param poblation La población de todos los individuos.
   */
  protected matchOfPoblation(poblation: number[]): number {
    // console.log('matchOfPoblation');
    for (let pos = 0; pos < poblation.length; pos = pos + 1) {
      const individual = poblation[pos];
      if (this.matchOfIndividual(individual)) {
        this.totalMatchIndividuals = this.totalMatchIndividuals + 1;
        this.matchHash[pos] = true;
      } else {
        this.matchHash[pos] = false;
      }
    }
    return this.totalMatchIndividuals / this.cantIndividuals;
  }

  /**
   * Realiza el cruce de los individuos.
   * @param fathers Los padres que se tomarán para realizar los cruces.
   */
  protected crossIndividuals(fathers: number[]): number[] {
    // console.log('crossIndividuals');
    if (this.replacePoblation) {
      this.totalMatchIndividuals = 0;
      return this.getNewIndividuals(fathers, this.cantIndividuals);
    }

    return fathers.concat(this.getNewIndividuals(fathers, this.cantIndividuals - fathers.length));
  }

  /**
   * Obtiene una cantidad específica de nuevos individuos como cruce de padres al azar.
   * @param fathers La lista de posibles padres para hacer el cruce.
   * @param cant Cantidad de hijos que se necesitan.
   */
  protected getNewIndividuals(fathers: number[], cant: number): number[] {
    // console.log('getNewIndividuals');
    const newIndividuals: number[] = new Array(cant);
    for (let pos: number = 0; pos < cant; pos = pos + 1) {
      const posFather: number = Utils.Utils.intRandom(0, fathers.length - 1);
      const posMother: number = Utils.Utils.intRandom(0, fathers.length - 1);
      const newIndividual = this.newIndividual(fathers[posFather], fathers[posMother]);

      if (this.replacePoblation) {
        this.matchHashUpdate(newIndividual, pos, 0);
      } else {
        this.matchHashUpdate(newIndividual, pos, fathers.length);
      }

      newIndividuals[pos] = newIndividual;
    }
    return newIndividuals;
  }

  /**
   * Realiza el cruce de dos padres para obtener un nuevo individuo (hijo),
   * el cruce por defecto será tomar 8 bits del padre y 8 bits de la madre.
   * @param father Padre del nuevo individuo.
   * @param mother Madre del nuevo individuo.
   */
  protected newIndividual(father: number, mother: number): number {
    return ((father & 0b1111111100000000) + (mother & 0b0000000011111111));
  }

  /**
   * Función que realiza la mutación de los individuos.
   * @param poblation La población de todos los individuos.
   */
  protected mutateIndividuals(poblation: number[]): void {
    // console.log('mutateIndividuals');
    for (let pos: number = 0; pos < poblation.length; pos = pos + 1) {
      if (Math.random() < this.mutationPercentage) {
        poblation[pos] = this.mutateIndividual(poblation[pos]);
        if (this.matchOfIndividual(poblation[pos])) {
          this.matchHashUpdateMutate(poblation[pos], pos, 0);
        }
      }
    }
  }

  /**
   * Realiza la mutación de un individuo, la mutación por defecto
   * cambiará un bit al azar del individuo
   * @param individual El individuo a mutar.
   */
  protected mutateIndividual(individual: number): number {
    // console.log('mutateIndividual');
    return individual ^ (1 << (Utils.Utils.intRandom(0, 15)));
  }

  /**
   * Obtiene la lista de los mejores individuos de la población.
   * @param poblation La población con todos los individuos.
   */
  protected getBestIndividuals(poblation: number[]): number[] {
    // console.log('getBestIndividuals');
    let rankingFitness: Array<[number, number]> = this.fitnessOfIndividuals(this.poblation);

    // Ordena el ranking del fitness
    rankingFitness = Utils.Utils.sortArrayBySecondPos(rankingFitness);

    // Obtiene los individuos que deben ser eliminados
    let individualsToBeKilled = rankingFitness.slice(0, (1 - this.livePercentage)
                                                     * this.cantIndividuals);

    // Ordena el ranking del fitness por posición del individuo
    individualsToBeKilled = Utils.Utils.sortArrayByFirstPos(individualsToBeKilled);

    // Por último, elimina los individuos menos adaptados
    this.poblation = this.removeIndividuals(this.poblation, individualsToBeKilled);

    return poblation;
  }

  /**
   * Función que remueve una lista de individuos de la población.
   * @param poblation La población de donde se quieren remover los individuos.
   * @param removeList La lista de individuos que se quieren eliminar, deben
   * estar ordenados por el número de la posición en que están en la población
   * de mayor a menor.
   */
  protected removeIndividuals(poblation: number[], removeList: Array<[number, number]>): number[] {
    // console.log('removeIndividuals');
    for (let pos = removeList.length - 1; pos >= 0; pos = pos - 1) {
      const posRemover: number = removeList[pos][0];

      this.poblation.splice(posRemover, 1);
      this.matchHashRemove(posRemover);
    }

    return poblation;
  }

  /**
   * Elimina un elemento del "Hash" de match.
   * @param pos posición que se desea eliminar.
   */
  private matchHashRemove(pos: number) {
    // console.log('matchHashRemove');
    if (!this.replacePoblation && this.matchHash.splice(pos, 1)) {
      this.totalMatchIndividuals = this.totalMatchIndividuals - 1;
    }
    this.matchHash.push(false);
  }

  /**
   * Actualiza el "Hash" con la información de los individuos que hicieron match.
   * La posición se refiere a la posición relativa del individuo y el offset
   * es por si hay que hacer algún corrimiento.
   */
  private matchHashUpdate (newIndividual: number, pos: number, offset: number) {
    // console.log('matchHashUpdate');
    if (this.matchOfIndividual(newIndividual)) {
      this.totalMatchIndividuals = this.totalMatchIndividuals + 1;
      this.matchHash[offset + pos] = true;
    } else {
      this.matchHash[offset + pos] = false;
    }
  }

  /**
   * Actualiza el "Hash" con la información de los individuos que hicieron match.
   * La posición se refiere a la posición relativa del individuo y el offset
   * es por si hay que hacer algún corrimiento.
   */
  private matchHashUpdateMutate (newIndividual: number, pos: number, offset: number) {
    // console.log('matchHashUpdateMutate');
    if (this.matchOfIndividual(newIndividual)) {
      if (!this.matchHash[offset + pos]) {
        this.totalMatchIndividuals = this.totalMatchIndividuals + 1;
      }
      this.matchHash[offset + pos] = true;
    } else {
      if (this.matchHash[offset + pos]) {
        this.totalMatchIndividuals = this.totalMatchIndividuals - 1;
      }
      this.matchHash[offset + pos] = false;
    }
  }

}
