/**
 * Filename: wavfilemanager.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Carga y guarda archivos .wav de manera asíncrona
 */

import * as fs from 'fs';
const wavDecoder = require('wav-decoder');
const wavEncoder = require('wav-encoder');

export interface IAudioData {
  sampleRate: number;
  channelData: Float32Array[];
}

export class WavFileManager {
  /**
   * Carga un archivo .wav con la dirección dada.
   * @param filepath Nombre del archivo que se quiere cargar.
   */
  public static readWAV(filepath: string): IAudioData {
    const buffer = WavFileManager.read(filepath);
    return wavDecoder.decode.sync(buffer);
  }

  /**
   * Guarda un archivo .wav en la dirección y con la información dada.
   * @param filepath Nombre del archivo en el que se quiere guardar.
   * @param audioData Datos del archivo .wav que se desean guardar
   */
  public static writeWAV(filepath: string, audioData: IAudioData) {
    const buffer = wavEncoder.encode.sync(audioData);
    fs.writeFileSync(filepath, Buffer.from(buffer));
  }

  /*
   * Lee el contenido del archivo con el nombre dado de manera síncrona.
   */
  private static read (filepath: string): Buffer {
    return fs.readFileSync(filepath);
  }

}
