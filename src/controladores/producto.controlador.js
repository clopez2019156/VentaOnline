'use strict'

var Categoria = require("../modelos/categoria.model");
var Factura = require("../modelos/factura.model");
var Producto = require("../modelos/producto.model");
var Usuario = require("../modelos/usuario.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");
const categoriaModel = require("../modelos/categoria.model");

function agregarProducto(req, res) {
    var producto = new Producto();
    var params = req.body;
    if (req.user.rol == "ROL_ADMIN") {
        if (params.nombre) {
            producto.nombre = params.nombre;
            producto.precio = params.precio;
            producto.cantidad = params.cantidad;
            producto.idCategoria = params.idCategoria;
            Producto.find({ nombre: producto.nombre }).exec((err, productoEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la petición' });
                if (productoEncontrado && productoEncontrado.length >= 1) {
                    return res.status(500).send({ mensaje: 'Producto existemnte, no se puede duplicar' });
                } else {
                    producto.save((err, productoGuardado) => {
                        if (err) return res.status(500).send({ mensaje: 'no se pudo guardar el producto' });
                        if (productoGuardado) {
                            res.status(200).send({ productoGuardado })
                        } else {
                            res.status(404).send({ mensaje: 'No se pudo registrar el producto' })
                        }
                    });
                }
            });

        }
    } else {
        return res.status(500).send({ mensaje: 'Un cliente no puede agregar un producto' });
    }
}

function editarProducto(req, res) {
    var idProducto = req.params.id;
    var params = req.body;
    Producto.find({ nombre: params.nombre }).exec((err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la petición' });
        if (productoEncontrado && productoEncontrado.length >= 1) {
            return res.status(500).send({ mensaje: 'producto ya existente' });
        }
        if (req.user.rol == "ROL_ADMIN") {
            Producto.findByIdAndUpdate(idProducto, params, { new: true }, (err, productoActualizado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!productoActualizado) return res.status(500).send({ mensaje: 'No se pudo editar el producto' });
                return res.status(200).send({ productoActualizado });
            });
        } else {
            return res.status(500).send({ mensaje: 'No posee los permisos para editar el producto' });
        }
    });
}

function eliminarProducto(req, res) {
    var idCategoria = req.params.id;
    if (req.user.rol != "ROL_ADMIN") {
        return res.status(500).send({ mensaje: "No posee los permisos para eliminar el producto" });
    }

    Producto.findByIdAndDelete(idCategoria, (err, ProductoEliminado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!ProductoEliminado) return res.status(500).send({ mensaje: "No se pudo Eliminar el producto" });
        return res.status(200).send({ mensaje: "producto eliminado" });
    });
}

function obtenerProductos(req, res) {
    Producto.find().exec((err, productosObtenidos) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productosObtenidos) return res.status(500).send({ mensaje: 'Error al consultar usuarios' });
        return res.status(200).send({ productosObtenidos });
    });


}

function obtenerProductosCategoria(req, res) {
    var categoriaId = req.params.id;

    Producto.find({ idCategoria: categoriaId }).exec(
        (err, productosConCategoria) => {
            if (err) {
                res.status(500).send("Error en la peticion");
            } else {
                if (!productosConCategoria) return res.status(500).send({ mensaje: "No hay productos con esa categoria" })
                return res.status(200).send({ productosConCategoria });
            }
        });

}

function obtenerPorNombre(req, res) {
    var params = req.body;

    Producto.find({ nombre: params.nombre }).exec(
        (err, productosNombre) => {
            if (err) {
                res.status(500).send("Error en la peticion");
            } else {
                if (!productosNombre) return res.status(500).send({ mensaje: "No hay productos con ese nombre" })
                return res.status(200).send({ productosNombre });
            }
        });
}

function obtenerAgotados(req, res) {

    Producto.find({ cantidad: 0 }).exec(
        (err, productosAgotados) => {
            if (err) {
                res.status(500).send("Error en la peticion");
            } else {
                if (!productosAgotados) return res.status(500).send({ mensaje: "ese producto no está agotado" });
                return res.status(200).send({ productosAgotados });
            }
        });
}

module.exports = {
    agregarProducto,
    editarProducto,
    eliminarProducto,
    obtenerProductos,
    obtenerProductosCategoria,
    obtenerPorNombre,
    obtenerAgotados
}