'use strict'

var Categoria = require("../modelos/categoria.model");
var Factura = require("../modelos/factura.model");
var Producto = require("../modelos/producto.model");
var Usuario = require("../modelos/usuario.model");

var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");

function producirFactura(req, res) {
    var factura = new Factura();
    var params = req.body;

    if (params.idUsuario) {
        factura.idUsuario = params.idUsuario;
        factura.editable = "si";
        factura.total = 0;
        factura.save((err, facturaGuardada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!facturaGuardada) return res.status(500).send({ mensaje: 'Error agregando la encuesta' });

            return res.status(200).send({ facturaGuardada });
        });
    } else {
        return res.status(500).send({ mensaje: "Faltan algunos datos" });
    }

}

function cancelarFactura(req, res) {
    var params = req.body;

    Factura.findOne({ _id: params.idFactura }).exec(
        (err, factura) => {
            if (err) {
                console.log(err);
            } else {
                if (factura.editable == "no") {
                    return res.status(500).send({ mensaje: "Esta factura ha sido terminada, no se le pueden hacer cambios" });
                } else {
                    Factura.findByIdAndDelete(params.idFactura, (err, facturaEliminada) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                        if (!facturaEliminada) return res.status(500).send({ mensaje: "No se pudo cancelar la factura" });
                        return res.status(200).send({ mensaje: "factura cancelada" });
                    });
                }
            }

        }
    );

}

function completarFactura(req, res) {
    var params = req.body;
    var ultimo = {};
    ultimo['editable'] = "no";
    Factura.findByIdAndUpdate(params.idFactura, ultimo, { new: true }, (err, productoActualizado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoActualizado) return res.status(500).send({ mensaje: 'No se pudo editar el producto' });
        return res.status(200).send({ productoActualizado });
    });


}

module.exports = {
    producirFactura,
    cancelarFactura,
    completarFactura
}