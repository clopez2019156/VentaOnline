'use strict'
var express = require("express");
var usuarioControlador = require("../controladores/usuario.controlador");
var md_autorizacion = require("../middlewares/authenticated");

var api = express.Router();

api.post("/agregarUsuario", usuarioControlador.agregarUsuario);
api.post("/login", usuarioControlador.login);
api.put('/editarUsuario', md_autorizacion.ensureAuth, usuarioControlador.editarUsuario);
api.delete('/eliminarUsuario', md_autorizacion.ensureAuth, usuarioControlador.eliminarUsuario);

module.exports = api;