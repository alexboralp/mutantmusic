"use strict";
/**
 * Filename: mutantmusic.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Manejador de mix de música
 */
exports.__esModule = true;
var WFM = require("./wavfilemanager");
console.log('Leyendo...');
var error = false;
var audioData;
try {
    audioData = WFM.WavFileManager.readWAV('NCAYA2.wav');
}
catch (e) {
    console.log('Error al abrir el archivo: ' + e);
    error = true;
}
if (!error) {
    var size = 20000;
    for (var i = 0; i < 10; i = i + 1) {
        console.log(audioData.channelData[0][i]);
        console.log(audioData.channelData[1][i]);
        console.log('*******************');
    }
    console.log('Guardando...');
    try {
        WFM.WavFileManager.writeWAV('newsulky.wav', audioData);
    }
    catch (e) {
        console.log('Error al guardar el archivo: ${e}');
        error = true;
    }
}
