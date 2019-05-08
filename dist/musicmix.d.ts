/**
 * Filename: musicmix.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase especializada en hacer un mix de música a partir
 * de un conjunto de segmentos de música tomados de un archivo wav.
 */
export declare class MusicMix {
    private static readonly samplingFrecuency;
    private static readonly numEffects;
    private leftChannel;
    private rightChannel;
    private canciones;
    constructor();
    /**
     * Agrega una canción o sonido a las canciones base para hacer el mix.
     * @param cancion La canción que se desea agregar.
     */
    /**
     * Agrega una canción dando los dos canales.
     * @param leftChannel El canal izquierdo de la canción que se desea agregar.
     * @param rightChannel El canal derecha de la canción que se desea agregar.
     */
    addSongChannels(leftChannel: Float32Array, rightChannel: Float32Array): void;
    /**
     * Agrega varias canciones o sonidos a las canciones base para hacer el mix.
     * @param canciones Las canciones o sonidos que se desea agregar.
     */
    /**
     * Agrega varias canciones o sonidos a las canciones base para hacer el mix.
     * @param canciones Las canciones o sonidos que se desea agregar.
     */
    addSongsChannels(canciones: Float32Array[][]): void;
    /**
     * Crea el mix tomando intercambiando el efecto y tomando de manera aleatoria la canción o sonido
     * para cada una de las partes de la nueva canción hasta que complete el tiempo indicado.
     * @param time El tiempo de la canción que se desea realizar.
     */
    hacerMixAleatorio(time: number): void;
    /**
     * Repite un audio varias veces hasta cubrir los segundos indicados.
     * Ambos audios deben tener la misma cantidad de samples.
     * @param leftChannel El canal izquierdo que se quiere copiar.
     * @param rightChannel El canal derecho que se quiere copiar.
     * @param time El tiempo en segundos que se quiere que se repita el sonido.
     */
    loops(leftChannel: Float32Array, rightChannel: Float32Array, time: number): void;
    /**
     * Realiza un audio que inicia sonando sólo en el canal izquierdo,
     * luego suena sólo el canal derecho y termina sonando los dos
     * canales. Ambos audios deben tener la misma cantidad de samples.
     * @param leftChannel El canal izquierdo que se quiere copiar.
     * @param rightChannel El canal derecho que se quiere copiar.
     * @param time El tiempo en segundos que se quiere que se repita el sonido.
     */
    leftToRightToBoth(leftChannel: Float32Array, rightChannel: Float32Array, time: number): void;
    /**
     * Intercala un audio con un silencio con la misma duración varias veces
     * hasta cubrir los segundos indicados. Ambos audios deben tener la misma
     * cantidad de samples.
     * @param leftChannel El canal izquierdo que se quiere copiar.
     * @param rightChannel El canal derecho que se quiere copiar.
     * @param time El tiempo en segundos que se quiere que se repita el sonido.
     */
    sonidoSilencio(leftChannel: Float32Array, rightChannel: Float32Array, time: number): void;
    /**
     * Devuelve el canal izquierdo del mix.
     */
    getLeftChannel(): Float32Array;
    /**
     * Define el canal izquierdo del mix.
     * @param leftChannel El nuevo canal izquierdo.
     */
    setLeftChannel(leftChannel: Float32Array): void;
    /**
     * Devuelve el canal derecho del mix.
     */
    getRightChannel(): Float32Array;
    /**
     * Define el canal derecho del mix.
     * @param leftChannel El nuevo canal derecho.
     */
    setRightChannel(rightChannel: Float32Array): void;
    private float32Concat;
    private float32Copy;
}
