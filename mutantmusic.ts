/**
 * Filename: mutantmusic.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Manejador de mix de música
 */

import * as WFM from './wavfilemanager';
import * as MM from './musicmix';

console.log('Leyendo...');
let error: boolean = false;
let audioData: WFM.IAudioData;
let audioMix1: WFM.IAudioData;
let audioMix2: WFM.IAudioData;
let audioMix3: WFM.IAudioData;
let audioMix4: WFM.IAudioData;
let audioMix5: WFM.IAudioData;

let mix = new MM.MusicMix();

try {
  audioData = WFM.WavFileManager.readWAV('NCAYA2.wav');
  audioMix1 = WFM.WavFileManager.readWAV('Mix1.wav');
  mix.addCancion(audioMix1);
  audioMix2 = WFM.WavFileManager.readWAV('Mix2.wav');
  mix.addCancion(audioMix2);
  audioMix3 = WFM.WavFileManager.readWAV('Mix3.wav');
  mix.addCancion(audioMix3);
  audioMix4 = WFM.WavFileManager.readWAV('Mix4.wav');
  mix.addCancion(audioMix4);
  audioMix5 = WFM.WavFileManager.readWAV('Mix5.wav');
  mix.addCancion(audioMix5);
} catch (e) {
  console.log('Error al abrir el archivo: ${e}');
  error = true;
}

if (!error) {
  // const size = 20000;

  /*for (let i = 0; i < 10; i = i + 1) {
    console.log(audioData.channelData[0][i]);
    console.log(audioData.channelData[1][i]);
    console.log('*******************');
  }*/

  console.log('Creando el mix...');
  mix.hacerMixAleatorio(60);

  audioMix1.channelData[0] = mix.getAudioChanelLeft();
  audioMix1.channelData[1] = mix.getAudioChanelRight();

  console.log('Guardando...');
  try {
    WFM.WavFileManager.writeWAV('mix.wav', audioMix1);
  } catch (e) {
    console.log('Error al guardar el archivo: ${e}');
    error = true;
  }
}
