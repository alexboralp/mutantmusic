/**
 * Filename: utils.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase de utilitarios.
 */

 // Interfaz para crear un Hash
export interface IHash<T> {
  [key: number]: T;
}

export class Utils {

  // FUNCIONES PARA EL TRABAJO CON ARREGLOS DE TIPO Float32Array

  /*
   * Concatena dos arrays de tipo Float32Array.
   * El resultado se devuelve en un nuevo arreglo del mismo tipo.
   */
  public static float32Concat(firstArray: Float32Array, secondArray: Float32Array): Float32Array {
    const firstLength = firstArray.length;
    const result = new Float32Array(firstLength + secondArray.length);

    result.set(firstArray);
    result.set(secondArray, firstLength);

    return result;
  }

  /**
   * Hace una copia de un array de tipo Float32Array.
   * @param original Arreglo original que se desea copiar.
   */
  public static float32Copy(original: Float32Array): Float32Array {
    const result = new Float32Array(original.length);

    result.set(original);

    return result;
  }

  // FUNCIÓN PARA LA COMPARACIÓN NO EXACTA DE NÚMEROS

  /**
   * Función que realiza la comparación de dos números,
   * se considera que los valores son iguales si se encuentran
   * a una distancia menor a la tolerancia definida
   * @param number1 El primer valor que se quiere comparar.
   * @param number2 El segundo valor que se quiere comparar.
   */
  public static compare(number1: number, number2: number, tolerance: number): boolean {
    if (Math.abs(number2 - number1) < tolerance) {
      return true;
    }
    return false;
  }

  // FUNCIONES PARA EL ORDENAMIENTO DE ARREGLOS

  /**
   * Función que ordena un array por el valor de cada tiempo.
   * @param pSong Array que se quiere ordenar.
   */
  public static sortArray(array: number[]) {
    return array.sort((number1, number2) => {
      if (number1 > number2) {
        return 1;
      }
      if (number1 < number2) {
        return -1;
      }
      return 0;
    });
  }

  /**
   * Función que ordena un array de enteros por el segundo valor del elemento.
   * @param pSong Array que se quiere ordenar.
   */
  public static sortArrayBySecondPos(array: Array<[any, number]>) {
    return array.sort((number1, number2) => {
      if (number1[1] < number2[1]) {
        return -1;
      }
      if (number1[1] > number2[1]) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * Función que ordena un array de enteros por el primer valor del elemento.
   * @param pSong Array que se quiere ordenar.
   */
  public static sortArrayByFirstPos(array: Array<[number, any]>) {
    return array.sort((number1, number2) => {
      if (number1[0] < number2[0]) {
        return -1;
      }
      if (number1[0] > number2[0]) {
        return 1;
      }
      return 0;
    });
  }

  // CÁLCULOS CON NÚMEROS

  /**
   * Obtiene el promedio de una lista de números.
   * @param numbers Una lista de números.
   */
  public static getAverage(numbers: number[]): number {
    let total: number = 0;

    numbers.forEach((number) => {
      total = total + number;
    });

    return total / numbers.length;
  }

  /**
   * Calcula la función piso para un número dado con el escalón del tamaño dado por n.
   * @param x El número al que se le quiere hacer el cálculo.
   * @param n El tamaño del escalón.
   */
  public static myFloor(x: number, n: number): number {
    return Math.floor(x / n) * n;
  }

  // CREACIÓN DE ARRAYS

  /**
   * Crea un nuevo array que es copia del original pero con la posición de
   * cada elemento numerada desde el offset y en valor absoluto.
   * @param original El arreglo original que se desea copiar.
   * @param offset El valor a partir del cual se quiere inicial la numeración.
   */
  public static createNumberedAbsoluteArray(original: Float32Array,
                                            offset: number): Array<[number, number]> {
    const copy: Array<[number, number]> = [];
    for (let pos = 0; pos < original.length; pos = pos + 1) {
      copy.push([offset + pos, Math.abs(original[pos])]);
    }
    return copy;
  }

  // GENERACIÓN DE NÚMEROS RANDOM

  /**
   * Genera un número entero aleatorio entre min y max
   */
  public static intRandom(min: number, max: number): number {
    return min + Math.floor(Math.random() * (1 + max - min));
  }

  // CONVERSIÓN DE NÚMEROS

  /**
   * Convierte un booleano a su correspondiente número (true: 1, false: 0).
   * @param val Booleano que se desea convertir.
   */
  public static booleanToNumber (val: boolean): number {
    if (val) {
      return 1;
    }
    return 0;
  }


}
