"use strict";
/**
 * Filename: mutantmusic.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Manejador de mix de música
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MP = __importStar(require("./musicprocess"));
const WFM = __importStar(require("./wavfilemanager"));
// Se obtienen los argumentos con los que se llamó el programa
// Este debe ser la función que se quiere realizar con la canción
const funcion = process.argv[2];
// Nombre del primer archivo .wav que se desea procesar
const archivoWAV1 = process.argv[3];
// Nombre del segundo archivo .wav que se desea procesar
const archivoWAV2 = process.argv[4];
console.log('Leyendo...');
let error = false;
let cancion1;
let cancion2;
let nombreArchivo = '';
try {
    cancion1 = WFM.WavFileManager.readWAV(archivoWAV1);
    cancion2 = WFM.WavFileManager.readWAV(archivoWAV2);
    const musicprocess = new MP.MusicProcess(cancion1.channelData[0], cancion1.channelData[1], cancion2.channelData[0], cancion2.channelData[1]);
    if (funcion === 'mt') {
        console.log('Buscando coincidencias...');
        const resp = musicprocess.match();
        for (const tiempo of resp) {
            console.log(tiempo);
        }
        console.log(`Coincidencias: ${resp.length}`);
        console.log('Creando el archivo de coincidencias...');
        const song = musicprocess.getMatchSong();
        cancion2.channelData[0] = song[0];
        cancion2.channelData[1] = song[1];
        nombreArchivo = `${archivoWAV2.slice(0, archivoWAV2.length - 4)}_mt.wav`;
    }
    else if (funcion === 'umt') {
        console.log('Buscando coincidencias...');
        const resp = musicprocess.match();
        console.log(`Coincidencias: ${resp.length}`);
        console.log('Creando el archivo sin coincidencias...');
        const song = musicprocess.getUnMatchSong();
        cancion2.channelData[0] = song[0];
        cancion2.channelData[1] = song[1];
        nombreArchivo = `${archivoWAV2.slice(0, archivoWAV2.length - 4)}_umt.wav`;
    }
    else if (funcion === 'dj') {
        console.log('Creando el mix de la canción...');
        const song = musicprocess.dj();
        cancion2.channelData[0] = song[0];
        cancion2.channelData[1] = song[1];
        nombreArchivo = `${archivoWAV2.slice(0, archivoWAV2.length - 4)}_dj.wav`;
    }
    else if (funcion === 'cmp') {
        console.log('Creando la composición de la canción...');
        const song = musicprocess.compose();
        cancion2.channelData[0] = song[0];
        cancion2.channelData[1] = song[1];
        nombreArchivo = `${archivoWAV2.slice(0, archivoWAV2.length - 4)}_cmp.wav`;
    }
    console.log('Guardando...');
    try {
        WFM.WavFileManager.writeWAV(nombreArchivo, cancion2);
    }
    catch (e) {
        console.log(`Error al guardar el archivo: ${e}`);
        error = true;
    }
}
catch (e) {
    console.log(`Error al abrir el archivo: ${e}`);
    error = true;
}
//# sourceMappingURL=mutantmusic.js.map