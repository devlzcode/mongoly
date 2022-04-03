"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const rollup_plugin_swc_1 = __importDefault(require("rollup-plugin-swc"));
exports.default = (0, vite_1.defineConfig)({
    plugins: [
        (0, rollup_plugin_swc_1.default)({
            jsc: {
                parser: {
                    syntax: "typescript",
                    dynamicImport: true,
                    decorators: true,
                },
                target: "es2022",
                transform: {
                    decoratorMetadata: true,
                },
            },
        }),
    ],
    esbuild: false,
});
