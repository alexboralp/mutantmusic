/**
 * Filename: GA.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase que realiza las operaciones de un algoritmo genético
 *              que opera sobre números de 16 bits.
 */

import * as AGAN from './AbstractGANumber16Bits';
import * as Utils from './Utils';

export class GANumber16Bits extends AGAN.AbstractGANumber16Bits {

  private readonly BITS = 16;

  private matchMinVal: number;
  private matchMaxVal: number;
  private neededPercentage: number;

  constructor(poblation: number[], successEndPercentage: number, livePercentage: number,
              mutationPercentage: number, stopGenerationsNumber: number,
              replacePoblation: boolean, matchMinVal: number, matchMaxVal: number,
              neededPercentage: number, tolerance: number) {
    super(poblation, successEndPercentage, livePercentage,
          mutationPercentage, stopGenerationsNumber, replacePoblation, tolerance);
    this.matchMinVal = matchMinVal;
    this.matchMaxVal = matchMaxVal;
    this.neededPercentage = neededPercentage;
  }

  // GETTERS Y SETTERS

  public setMatchMinVal(matchMinVal: number) {
    this.matchMinVal = matchMinVal;
  }

  public getMatchMinVal(): number {
    return this.matchMinVal;
  }

  public setMatchMaxVal(matchMaxVal: number) {
    this.matchMaxVal = matchMaxVal;
  }

  public getMatchMaxVal(): number {
    return this.matchMaxVal;
  }

  public setNeededPercentage(neededPercentage: number) {
    this.neededPercentage = neededPercentage;
  }

  public getNeededPercentage(): number {
    return this.neededPercentage;
  }

  protected fitnessOfIndividual(individual: number): number {
    // console.log('fitnessOfIndividual');
    const pos = this.getPoblation().indexOf(individual);

    return (Math.random() * Utils.Utils.booleanToNumber(this.matchHash[pos])
           * this.neededPercentage)
           + (Math.random() * (1 - Utils.Utils.booleanToNumber(this.matchHash[pos]))
           * this.actualPoblationMatchPercentage);
  }

  protected matchOfIndividual(individual: number): boolean {
    // console.log('matchOfIndividual');
    return (individual <= this.matchMaxVal && individual >= this.matchMinVal);
  }

  /**
   * Se redefine el cruce de dos padres de la clase abstracta,
   * esto para que el cruce lo realice entre los 6 y los 10
   * bits
   * @param father Padre del nuevo individuo.
   * @param mother Madre del nuevo individuo.
   */
  protected newIndividual(father: number, mother: number): number {
    // console.log('newIndividual');
    const pos: number = Utils.Utils.intRandom(6, 10);
    let numFather: number = 1;
    let numMother: number = 1;
    for (let corrimiento: number = 0; corrimiento < pos - 1; corrimiento = corrimiento + 1) {
      numFather = (numFather << 1) + 1;
    }
    numFather = (numFather << 1);
    for (let corrimiento: number = 0; corrimiento < 16 - pos - 1; corrimiento = corrimiento + 1) {
      numMother = (numMother << 1) + 1;
      numFather = (numFather << 1);
    }
    return ((father & numFather) + (mother & numMother));
  }

}
