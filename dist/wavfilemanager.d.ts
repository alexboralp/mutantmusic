/**
 * Filename: wavfilemanager.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Carga y guarda archivos .wav de manera asíncrona
 */
export interface IAudioData {
    sampleRate: number;
    channelData: Float32Array[];
}
export declare class WavFileManager {
    /**
     * Carga un archivo .wav con la dirección dada.
     * @param filepath Nombre del archivo que se quiere cargar.
     */
    static readWAV(filepath: string): IAudioData;
    /**
     * Guarda un archivo .wav en la dirección y con la información dada.
     * @param filepath Nombre del archivo en el que se quiere guardar.
     * @param audioData Datos del archivo .wav que se desean guardar
     */
    static writeWAV(filepath: string, audioData: IAudioData): void;
    private static read;
}
