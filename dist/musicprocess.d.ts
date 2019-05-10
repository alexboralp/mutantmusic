/**
 * Filename: musicprocess.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase que procesa la música
 */
export declare class MusicProcess {
    private static readonly samplingFrecuency;
    private static readonly tolerance;
    private static readonly repetitions;
    private static readonly repetitionsTime;
    private static readonly minTimeBetweenBeats;
    private static readonly samplesPercentage;
    private static readonly successPercentage;
    private static readonly mixNumParts;
    private static readonly sliceSize;
    private static readonly toleranceLlanura;
    private static readonly individualsNumber;
    private static readonly successEndPercentage;
    private static readonly livePercentage;
    private static readonly mutationPercentage;
    private static readonly BEAT;
    private static readonly LLANURA;
    private static readonly VALLE;
    private static readonly MONTANNA;
    private static readonly SUBIDA;
    private static readonly BAJADA;
    private static readonly BAJISIMA;
    private static readonly BAJA;
    private static readonly BAJAMEDIA;
    private static readonly MEDIA;
    private static readonly MEDIAALTA;
    private static readonly ALTA;
    private static readonly ALTISIMA;
    private static readonly INICIO;
    private static readonly MITAD;
    private static readonly FINAL;
    private static readonly BAJISIMA_VALUE;
    private static readonly BAJA_VALUE;
    private static readonly BAJAMEDIA_VALUE;
    private static readonly MEDIA_VALUE;
    private static readonly MEDIAALTA_VALUE;
    private static readonly ALTA_VALUE;
    private leftChannel;
    private rightChannel;
    private leftChannel2;
    private rightChannel2;
    private leftChannelBeats;
    private rightChannelBeats;
    private leftChannelBeats2;
    private rightChannelBeats2;
    private matchTimes;
    private mix;
    constructor(leftChannel: Float32Array, rightChannel: Float32Array, leftChannel2: Float32Array, rightChannel2: Float32Array);
    /**
     * Devuelve una lista con los tiempos en donde la segunda canción aparece
     * en la primera.
     */
    match(): number[];
    /**
     * Busca los diez tonadas de dos segundos que más se repiten en la canción y
     * los utiliza para realizar un mix.
     * Para obtener las tonadas se va tomando la canción cada dos segundos y
     * se utiliza la función match para obtener la cantidad de veces que se repite,
     * para que no haya repetición se guardarán los tiempos que ya se han buscado
     * y si se encuentra en alguno de estos entonces se lo brinca.
     */
    dj(): [Float32Array, Float32Array];
    /**
     * Realiza la composición de la primera canción tomando como envolvente
     * la segunda canción. Transforma la primera canción por medio de un
     * algoritmo genético para que su forma cambie a la forma de la primera
     * canción.
     */
    compose(): Promise<any>;
    /**
     * Devuelve el canal izquierdo de la primera canción.
     */
    getLeftChannel(): Float32Array;
    /**
     * Define el canal izquierdo de la primera canción.
     * @param leftChannel El nuevo canal izquierdo.
     */
    setLeftChannel(leftChannel: Float32Array): void;
    /**
     * Devuelve el canal derecho de la primera canción.
     */
    getRightChannel(): Float32Array;
    /**
     * Define el canal derecho de la primera canción.
     * @param rightChannel El nuevo canal derecho.
     */
    setRightChannel(rightChannel: Float32Array): void;
    /**
     * Devuelve el canal izquierdo de la segunda canción.
     */
    getLeftChannel2(): Float32Array;
    /**
     * Define el canal izquierdo de la segunda canción.
     * @param leftChannel El nuevo canal izquierdo.
     */
    setLeftChannel2(leftChannel: Float32Array): void;
    /**
     * Devuelve el canal derecho de la segunda canción.
     */
    getRightChannel2(): Float32Array;
    /**
     * Define el canal derecho de la segunda canción.
     * @param rightChannel El nuevo canal derecho.
     */
    setRightChannel2(rightChannel: Float32Array): void;
    /**
     * Devuelve el arreglo con los tiempos en donde hay match.
     */
    getMatchTimes(): number[];
    /**
     * Define el arreglo con los tiempos en donde hay match.
     * @param matchTimes El nuevo arreglo de tiempos.
     */
    setMatchTimes(matchTimes: number[]): void;
    /**
     * Devuelve la canción tomando sólo las partes donde hubo match.
     */
    getMatchSong(): [Float32Array, Float32Array];
    /**
     * Devuelve la canción quitando las partes donde hubo match.
     */
    getUnMatchSong(): [Float32Array, Float32Array];
    private float32Concat;
    /**
     * Función que realiza la comparación de dos números,
     * se considera que los valores son iguales si se encuentran
     * a una distancia menor a la tolerancia definida
     * @param number1 El primer valor que se quiere comparar.
     * @param number2 El segundo valor que se quiere comparar.
     */
    private compare;
    /**
     * Toma los valores en donde se dio el porcentaje de valores mayores
     * y los refina quitando lo que están muy cercanos (repetidos).
     * @param tiempos El arreglo con los tiempos en que se dio match.
     */
    private refinarBeats;
    /**
     * Función que ordena un array por el valor de cada tiempo.
     * @param pSong Array que se quiere ordenar.
     */
    private sortArray;
    /**
     * Función que ordena un array de enteros por el segundo valor del elemento.
     * @param pSong Array que se quiere ordenar.
     */
    private sortArrayBySecondPos;
    /**
     * Función que ordena un array de enteros por el primer valor del elemento.
     * @param pSong Array que se quiere ordenar.
     */
    private sortArrayByFirstPos;
    /**
     * Hace una copia de un array de tipo Float32Array.
     * @param original Arreglo original que se desea copiar.
     */
    private float32Copy;
    /**
     * Crea un nuevo array que es copia del original pero con la posición de
     * cada elemento numerada desde el offset y en valor absoluto.
     * @param original El arreglo original que se desea copiar.
     * @param offset El valor a partir del cual se quiere inicial la numeración.
     */
    private createNumberedAbsoluteArray;
    /**
     * Realiza el refinado de ambos canales, tuvo que haber coincidencia en ambos para decir
     * que las dos canciones hicieron match.
     * @param lChannel Canal izquierdo de la canción.
     * @param rChannel Canal derecho de la canción.
     */
    private refineBothChannels;
    /**
     * Realiza el refinado de los tiempos en los que dos canciones hicieron match.
     * @param tiempos Lista de tiempos ordenada.
     * @param tolerance La tolerancia en el tiempo para decir que dos beats sonaron al mismo tiempo.
     */
    private refine;
    /**
     * Busca los tiempos en que los canales de dos canciones hicieron match.
     * @param channel1 Primer canal de la primera canción.
     * @param channel2 Primer canal de la segunda canción.
     */
    private matchChannel;
    /**
     * Obtiene el porcentaje de igualdad entre los beats de dos canciones.
     * @param song1 Primera canción.
     * @param posSong1 Beat de la primera canción a partir del cual se realizará la comparación.
     * @param song2 Segunda canción.
     * @param posSong2 Beat de la segunda canción a partir del cual se realizará la comparación.
     */
    private getMatchPercentage;
    /**
     * Obtiene los beats de uno de los canales de la canción.
     * @param songChannel El canal de la canción.
     * @param offset El offset del canal a partir del cual debe sacar los beats.
     */
    private getBeats;
    /**
     * Devuelve los beats de la canción dividiéndola por segundo
     * @param songChannel Uno de los canales de la canción.
     */
    private getBeatsPerSecond;
    /**
     * Obtiene los tiempos de las partes que más se repiten de la primera canción.
     * Básicamente divide la canción de acuerdo al tiempo indicado y obtiene 60 partes
     * de forma aleatoria revisando la cantidad de repeticiones de
     * cada parte, se evita repetir partes que ya se revisaron.
     */
    private getDJTimes;
    /**
     * Obtiene partes de la primera canción del tamaño dado y las agrega al DJ.
     * @param samples Los samples que se desean tomar de la canción ordenadas por apariciones
     */
    private getSamplesFromSong;
    /**
     * Obtiene el promedio de una lista de números.
     * @param numbers Una lista de números.
     */
    private getAverage;
    /**
     * Obtiene el valor máximo en valor absoluto de una lista de números.
     * @param numbers Una lista de números.
     */
    private getMaxAbsoluteValue;
    /**
     * Reduce la canción tomando secciones del tamaño dado por la constante
     * sliceSize, de cada sección toma el valor mayor como representante.
     * @param songChannel El canal de la canción.
     */
    private reduceChannelSong;
    private createSong;
    private dnaProportion;
    private mutateIndividuals;
    private mutateIndividual;
    private fitnessOfIndividuals;
    private fitnessOfIndividual;
    private crossIndividuals;
    private newSon;
    private createIndividuals;
    private createIndividual;
    private esSearch;
    private esBulkSong;
    private esIndexall;
    private esPrepareBulkData;
    private esCreateIndex;
    private esDeleteIndex;
    private getSongDNA;
    private getChannelsSongDNA;
    private alturaNota;
    private llenarArrayDNA;
    /**
     * Calcula la función piso para un número dado con el escalón del tamaño dado por n.
     * @param x El número al que se le quiere hacer el cálculo.
     * @param n El tamaño del escalón.
     */
    private myFloor;
    private getChannelPartDNA;
}
