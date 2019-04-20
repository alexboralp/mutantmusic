"use strict";
/**
 * Filename: mutantmusic.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Manejador de mix de música
 */
exports.__esModule = true;
var MP = require("./musicprocess");
var WFM = require("./wavfilemanager");
// Se obtienen los argumentos con los que se llamó el programa
// Este debe ser la función que se quiere realizar con la canción
var funcion = process.argv[2];
// Nombre del primer archivo .wav que se desea procesar
var archivoWAV1 = process.argv[3];
// Nombre del segundo archivo .wav que se desea procesar
var archivoWAV2 = process.argv[4];
console.log('Leyendo...');
var error = false;
var cancion1;
var cancion2;
try {
    cancion1 = WFM.WavFileManager.readWAV(archivoWAV1);
    cancion2 = WFM.WavFileManager.readWAV(archivoWAV2);
}
catch (e) {
    console.log("Error al abrir el archivo: " + e);
    error = true;
}
if (!error) {
    var musicprocess = new MP.MusicProcess(cancion1.channelData[0], cancion1.channelData[1], cancion2.channelData[0], cancion2.channelData[1]);
    console.log('Buscando coincidencias...');
    var resp = musicprocess.match();
    for (var _i = 0, resp_1 = resp; _i < resp_1.length; _i++) {
        var tiempo = resp_1[_i];
        console.log(tiempo);
    }
    console.log("Coincidencias: " + resp.length);
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
