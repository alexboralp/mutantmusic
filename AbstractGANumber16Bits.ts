/**
 * Filename: GANumber16Bits.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase abstracta que realiza las operaciones básicas de un
 *              algoritmo genético que opera sobre números de 16 bits.
 */

import * as Utils from './Utils';

export abstract class AbstractGANumber16Bits {

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

  // Cantidad de individuos en la población
  private cantIndividuals: number;

  constructor(poblation: number[], successEndPercentage: number, livePercentage: number,
              mutationPercentage: number, stopGenerationsNumber: number,
              replacePoblation: boolean) {
    this.poblation = poblation;
    this.successEndPercentage = successEndPercentage;
    this.livePercentage = livePercentage;
    this.mutationPercentage = mutationPercentage;
    this.stopGenerationsNumber = stopGenerationsNumber;
    this.replacePoblation = replacePoblation;

    this.cantIndividuals = poblation.length;
  }

  // FUNCIÓN PRINCIPAL

  public runGA() {
    let numGenerations: number = 0;
    let actualPoblationMatchPercentage: number = this.matchOfPoblation(this.poblation);

    while (actualPoblationMatchPercentage < this.successEndPercentage &&
      numGenerations < this.stopGenerationsNumber) {

      // TODO: Definir fitness y obtener los mejores padres.
      let rankingFitness: Array<[number, number]> = this.fitnessOfIndividuals(this.poblation);

      this.poblation = this.crossIndividuals(fathers);
      this.mutateIndividuals(this.poblation);

      numGenerations = numGenerations + 1;
      if (numGenerations % 10 === 0) {
        process.stdout.write(`Generations: ${numGenerations}` +
                             ', poblation match percentage:' +
                             `${actualPoblationMatchPercentage}` + '\r');
      }
    }
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
    let poblationfitness: Array<[number, number]> = new Array<[number, number]>();
    for (let pos: number = 0; pos < poblation.length; pos = pos + 1) {
      poblationfitness.push([pos, this.fitnessOfIndividual(poblation[pos], poblation)]);
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
  protected abstract fitnessOfIndividual(individual: number, poblation: number[]): number;

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
    let match: number = 0;
    poblation.forEach((individual) => {
      if (this.matchOfIndividual(individual)) {
        match = match + 1;
      }
    });
    return match / this.cantIndividuals;
  }

  /**
   * Realiza el cruce de los individuos.
   * @param fathers Los padres que se tomarán para realizar los cruces.
   */
  protected crossIndividuals(fathers: number[]): number[] {
    if (this.replacePoblation) {
      return this.getNewIndividuals(fathers, this.cantIndividuals);
    }

    return fathers.concat(this.getNewIndividuals(fathers, this.cantIndividuals - fathers.length));
  }

  protected getNewIndividuals(fathers: number[], cant: number): number[] {
    const newIndividuals: number[] = [cant];
    for (let pos: number = 0; pos < cant; pos = pos + 1) {
      const posFather: number = Utils.Utils.intRandom(0, fathers.length);
      const posMother: number = Utils.Utils.intRandom(0, fathers.length);
      newIndividuals[pos] = this.newIndividual(fathers[posFather], fathers[posMother]);
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
    for (let pos: number = 0; pos < poblation.length; pos = pos + 1) {
      if (Math.random() < this.mutationPercentage) {
        poblation[pos] = this.mutateIndividual(poblation[pos]);
      }
    }
  }

  /**
   * Realiza la mutación de un individuo, la mutación por defecto
   * cambiará un bit al azar del individuo
   * @param individual El individuo a mutar.
   */
  protected mutateIndividual(individual: number): number {
    return individual ^ (1 << (Utils.Utils.intRandom(0, 16) - 1));
  }

}
