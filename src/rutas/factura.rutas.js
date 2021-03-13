'use strict'
var express = require("express");
var facturaControlador = require("../controladores/factura.controlador");
var md_autorizacion = require("../middlewares/authenticated");

var api = express.Router();

api.post("/CrearFactura", facturaControlador.producirFactura);
api.delete("/CancelarFactura", facturaControlador.cancelarFactura);
api.put('/FinalzarFactura', facturaControlador.completarFactura);
module.exports = api;