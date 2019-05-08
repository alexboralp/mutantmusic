"use strict";
/**
 * Filename: wavfilemanager.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Carga y guarda archivos .wav de manera asíncrona
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const WavEncoder = require("wav-encoder");
const WavDecoder = require("wav-decoder");
class WavFileManager {
    /**
     * Carga un archivo .wav con la dirección dada.
     * @param filepath Nombre del archivo que se quiere cargar.
     */
    static readWAV(filepath) {
        const buffer = WavFileManager.read(filepath);
        return WavDecoder.decode.sync(buffer);
    }
    /**
     * Guarda un archivo .wav en la dirección y con la información dada.
     * @param filepath Nombre del archivo en el que se quiere guardar.
     * @param audioData Datos del archivo .wav que se desean guardar
     */
    static writeWAV(filepath, audioData) {
        const buffer = WavEncoder.encode.sync(audioData);
        fs.writeFileSync(filepath, Buffer.from(buffer));
    }
    /*
     * Lee el contenido del archivo con el nombre dado de manera síncrona.
     */
    static read(filepath) {
        return fs.readFileSync(filepath);
    }
}
exports.WavFileManager = WavFileManager;
//# sourceMappingURL=wavfilemanager.js.map