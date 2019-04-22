/**
 * Filename: mutantmusic.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Manejador de mix de música
 */

import * as MM from './musicmix';
import * as MP from './musicprocess';
import * as WFM from './wavfilemanager';

// Se obtienen los argumentos con los que se llamó el programa

// Este debe ser la función que se quiere realizar con la canción
const funcion = process.argv[2];
// Nombre del primer archivo .wav que se desea procesar
const archivoWAV1 = process.argv[3];
// Nombre del segundo archivo .wav que se desea procesar
const archivoWAV2 = process.argv[4];

console.log('Leyendo...');
let error: boolean = false;
let cancion1: WFM.IAudioData;
let cancion2: WFM.IAudioData;
let nombreArchivo: string = '';

try {
  cancion1 = WFM.WavFileManager.readWAV(archivoWAV1);
  cancion2 = WFM.WavFileManager.readWAV(archivoWAV2);
} catch (e) {
  console.log(`Error al abrir el archivo: ${e}`);
  error = true;
}

if (!error) {
  const musicprocess = new MP.MusicProcess(cancion1.channelData[0],
                                           cancion1.channelData[1],
                                           cancion2.channelData[0],
                                           cancion2.channelData[1]);

  if (funcion === 'mt') {
    console.log('Buscando coincidencias...');
    const resp: number[] = musicprocess.match();
    for (const tiempo of resp) {
      console.log(tiempo);
    }
    console.log(`Coincidencias: ${resp.length}`);
    console.log('Creando el archivo de coincidencias...');
    const song = musicprocess.getMatchSong();
    cancion2.channelData[0] = song[0];
    cancion2.channelData[1] = song[1];
    nombreArchivo = `${archivoWAV2.slice(0, archivoWAV2.length - 4)}_mt.wav`;
  } else if (funcion === 'umt') {
    console.log('Buscando coincidencias...');
    const resp: number[] = musicprocess.match();
    console.log(`Coincidencias: ${resp.length}`);
    console.log('Creando el archivo sin coincidencias...');
    const song = musicprocess.getUnMatchSong();
    cancion2.channelData[0] = song[0];
    cancion2.channelData[1] = song[1];
    nombreArchivo = `${archivoWAV2.slice(0, archivoWAV2.length - 4)}_umt.wav`;
  }

  console.log('Guardando...');
  try {
    WFM.WavFileManager.writeWAV(nombreArchivo, cancion2);
  } catch (e) {
    console.log(`Error al guardar el archivo: ${e}`);
    error = true;
  }
}

/*let audioData: WFM.IAudioData;
let audioMix1: WFM.IAudioData;
let audioMix2: WFM.IAudioData;
let audioMix3: WFM.IAudioData;
let audioMix4: WFM.IAudioData;
let audioMix5: WFM.IAudioData;

const mix = new MM.MusicMix();

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
  console.log(`Error al abrir el archivo: ${e}`);
  error = true;
}

if (!error) {
  // const size = 20000;
*/
  /*for (let i = 0; i < 10; i = i + 1) {
    console.log(audioData.channelData[0][i]);
    console.log(audioData.channelData[1][i]);
    console.log('*******************');
  }*/
/*
  console.log('Creando el mix...');
  mix.hacerMixAleatorio(60);

  audioMix1.channelData[0] = mix.getAudioChanelLeft();
  audioMix1.channelData[1] = mix.getAudioChanelRight();

  console.log('Guardando...');
  try {
    WFM.WavFileManager.writeWAV('mix.wav', audioMix1);
  } catch (e) {
    console.log(`Error al guardar el archivo: ${e}`);
    error = true;
  }
}
*/
