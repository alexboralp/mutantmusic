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
var nombreArchivo = '';
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
    if (funcion === 'mt') {
        console.log('Buscando coincidencias...');
        var resp = musicprocess.match();
        for (var _i = 0, resp_1 = resp; _i < resp_1.length; _i++) {
            var tiempo = resp_1[_i];
            console.log(tiempo);
        }
        console.log("Coincidencias: " + resp.length);
        console.log('Creando el archivo de coincidencias...');
        var song = musicprocess.getMatchSong();
        cancion2.channelData[0] = song[0];
        cancion2.channelData[1] = song[1];
        nombreArchivo = archivoWAV2.slice(0, archivoWAV2.length - 4) + "_mt.wav";
    }
    else if (funcion === 'umt') {
        console.log('Buscando coincidencias...');
        var resp = musicprocess.match();
        console.log("Coincidencias: " + resp.length);
        console.log('Creando el archivo sin coincidencias...');
        var song = musicprocess.getUnMatchSong();
        cancion2.channelData[0] = song[0];
        cancion2.channelData[1] = song[1];
        nombreArchivo = archivoWAV2.slice(0, archivoWAV2.length - 4) + "_umt.wav";
    }
    else if (funcion === 'dj') {
        console.log('Creando el mix de la canción...');
        var song = musicprocess.dj();
        cancion2.channelData[0] = song[0];
        cancion2.channelData[1] = song[1];
        nombreArchivo = archivoWAV2.slice(0, archivoWAV2.length - 4) + "_dj.wav";
    }
    console.log('Guardando...');
    try {
        WFM.WavFileManager.writeWAV(nombreArchivo, cancion2);
    }
    catch (e) {
        console.log("Error al guardar el archivo: " + e);
        error = true;
    }
}
