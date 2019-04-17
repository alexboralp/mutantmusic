/**
 * Filename: mutantmusic.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Manejador de mix de música
 */

import * as WFM from './wavfilemanager';

console.log('Leyendo...');
let error: boolean = false;
let audioData;

try {
  audioData = WFM.WavFileManager.readWAV('NCAYA2.wav');
} catch (e) {
  console.log('Error al abrir el archivo: ' + e);
  error = true;
}

if (!error) {
  const size = 20000;

  for (let i = 0; i < 10; i = i + 1) {
    console.log(audioData.channelData[0][i]);
    console.log(audioData.channelData[1][i]);
    console.log('*******************');
  }

  console.log('Guardando...');
  try {
    WFM.WavFileManager.writeWAV('newsulky.wav', audioData);
  } catch (e) {
    console.log('Error al guardar el archivo: ${e}');
    error = true;
  }
}
