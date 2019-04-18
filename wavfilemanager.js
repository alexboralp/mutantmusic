"use strict";
/**
 * Filename: wavfilemanager.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Carga y guarda archivos .wav de manera asíncrona
 */
exports.__esModule = true;
var fs = require("fs");
var WavDecoder = require("wav-decoder");
var WavEncoder = require("wav-encoder");
var WavFileManager = /** @class */ (function () {
    function WavFileManager() {
    }
    /**
     * Carga un archivo .wav con la dirección dada.
     * @param filepath Nombre del archivo que se quiere cargar.
     */
    WavFileManager.readWAV = function (filepath) {
        var buffer = WavFileManager.read(filepath);
        return WavDecoder.decode.sync(buffer);
    };
    /**
     * Guarda un archivo .wav en la dirección y con la información dada.
     * @param filepath Nombre del archivo en el que se quiere guardar.
     * @param audioData Datos del archivo .wav que se desean guardar
     */
    WavFileManager.writeWAV = function (filepath, audioData) {
        var buffer = WavEncoder.encode.sync(audioData);
        fs.writeFileSync(filepath, Buffer.from(buffer));
    };
    /*
     * Lee el contenido del archivo con el nombre dado de manera síncrona.
     */
    WavFileManager.read = function (filepath) {
        return fs.readFileSync(filepath);
    };
    return WavFileManager;
}());
exports.WavFileManager = WavFileManager;
