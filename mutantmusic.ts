/**
 * Filename: mutantmusic.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Manejador de mix de música
 */

import * as MP from './musicprocess';
import * as WFM from './wavfilemanager';

// Se obtienen los argumentos con los que se llamó el programa

// Este debe ser la función que se quiere realizar con la canción
const funcion = process.argv[2];
// Nombre del primer archivo .wav que se desea procesar
const archivoWAV1 = process.argv[3];
// Nombre del segundo archivo .wav que se desea procesar
const archivoWAV2 = process.argv[4];

console.log('Reading the songs...');
let error: boolean = false;
let cancion1: WFM.IAudioData;
let cancion2: WFM.IAudioData;
let nombreArchivo: string = '';

try {
  cancion1 = WFM.WavFileManager.readWAV(archivoWAV1);
  cancion2 = WFM.WavFileManager.readWAV(archivoWAV2);

  const musicprocess = new MP.MusicProcess(cancion1.channelData[0],
                                           cancion1.channelData[1],
                                           cancion2.channelData[0],
                                           cancion2.channelData[1]);

  let continuar: boolean = true;
  if (funcion === 'mt') {
    console.log('Looking for matches...');
    const resp: number[] = musicprocess.match();
    for (const tiempo of resp) {
      console.log(tiempo);
    }
    console.log(`Matches: ${resp.length}`);
    console.log('Creating the matches song file...');
    const song = musicprocess.getMatchSong();
    cancion2.channelData[0] = song[0];
    cancion2.channelData[1] = song[1];
    nombreArchivo = `${archivoWAV2.slice(0, archivoWAV2.length - 4)}_mt.wav`;
  } else if (funcion === 'umt') {
    console.log('Looking for matches...');
    const resp: number[] = musicprocess.match();
    console.log(`Matches: ${resp.length}`);
    console.log('Creating the unmatched song file...');
    const song = musicprocess.getUnMatchSong();
    cancion2.channelData[0] = song[0];
    cancion2.channelData[1] = song[1];
    nombreArchivo = `${archivoWAV2.slice(0, archivoWAV2.length - 4)}_umt.wav`;
  } else if (funcion === 'dj') {
    console.log('Creating the mixed song...');
    const song = musicprocess.dj();
    cancion2.channelData[0] = song[0];
    cancion2.channelData[1] = song[1];
    nombreArchivo = `${archivoWAV2.slice(0, archivoWAV2.length - 4)}_dj.wav`;
  } else if (funcion === 'cmp') {
    console.log('Creating the composed song...');
    continuar = false;
    musicprocess.compose()
      .catch((err) => {
        console.log(`Error creating the composed song: ${err}`);
      })
      .then((song) => {
        cancion2.channelData[0] = song[0];
        cancion2.channelData[1] = song[1];
        nombreArchivo = `${archivoWAV2.slice(0, archivoWAV2.length - 4)}_cmp.wav`;
        console.log('Saving the song...');
        try {
          WFM.WavFileManager.writeWAV(nombreArchivo, cancion2);
        } catch (e) {
          console.log(`There was an error while saving the file: ${e}`);
          error = true;
        }
      })
      .catch((err) => {
        console.log(`Error creating the composed song: ${err}`);
      });
  } else {
    continuar = false;
    console.log('Función no soportada');
  }

  if (continuar) {
    console.log('Saving the song...');
    try {
      WFM.WavFileManager.writeWAV(nombreArchivo, cancion2);
    } catch (e) {
      console.log(`There was an error while saving the file: ${e}`);
      error = true;
    }
  }
} catch (e) {
  console.log(`There was an error while opening the file: ${e}`);
  error = true;
}
