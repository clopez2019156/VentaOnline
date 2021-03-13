'use strict'

var Categoria = require("../modelos/categoria.model");
var Factura = require("../modelos/factura.model");
var Producto = require("../modelos/producto.model");
var Usuario = require("../modelos/usuario.model");

var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");

function inicio(req, res) {
    var categoriaModel = Categoria();
    categoriaModel.nombre = "peliculas";
    Categoria.find({
        nombre: "peliculas"
    }).exec((err, CategoriaEncontrada) => {
        if (err) return console.log({ mensaje: "No se pudo crear categoría, surgió un error" });
        if (CategoriaEncontrada.length >= 1) {
            return console.log("La categoria está lista");
        } else {
            categoriaModel.save((err, CategoriaGuardada) => {
                if (err) return console.log({ mensaje: "Error en la peticion" });
                if (CategoriaGuardada) {
                    console.log("Categoría lista");
                } else {
                    console.log({ mensaje: "Error en la categoría" });
                }
            });
        }
    });
}

function agregarCategoria(req, res) {
    var categoria = new Categoria();
    var params = req.body;
    if (req.user.rol == "ROL_ADMIN") {
        if (params.nombre) {
            categoria.nombre = params.nombre;
            Categoria.find({ nombre: categoria.nombre }).exec((err, CategoriaEncontrada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Categoria' });
                if (CategoriaEncontrada && CategoriaEncontrada.length >= 1) {
                    return res.status(500).send({ mensaje: 'La categoria ya existe' });
                } else {
                    categoria.save((err, CategoriaGuardada) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar categoria' });
                        if (CategoriaGuardada) {
                            res.status(200).send({ CategoriaGuardada })
                        } else {
                            res.status(404).send({ mensaje: 'No se ha podido registrar la categoria' })
                        }
                    });
                }
            });

        }
    } else {
        return res.status(500).send({ mensaje: 'Un cliente no puede agregar una categoria' });
    }
}

function eliminarCategoria(req, res) {
    var idCategoria = req.params.id;
    var params = req.body;
    if (req.user.rol != "ROL_ADMIN") {
        return res.status(500).send({ mensaje: "No posee los permisos para eliminar esta categoría" });
    }
    // Debe poner en la verificacion el id de default 
    if (idCategoria == "6045877ce197982404d6520a") {
        return res.status(500).send({ mensaje: "No puede eliminarse la categoría seleccionada" });
    }


    Categoria.findByIdAndDelete(idCategoria, (err, usuarioEliminado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!usuarioEliminado) return res.status(500).send({ mensaje: "No se pudo eliminar esta categoría" });
        return res.status(200).send({ mensaje: "eliminación de categoría exitosa" });
    });


    Producto.updateMany({ idCategoria: idCategoria }, params, { new: true }, (err, productoActualizado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!productoActualizado) return res.status(500).send({ mensaje: "No se pudo editar el producto" });
    });
}

function editarCategoria(req, res) {
    var idCategoria = req.params.id;
    var params = req.body;
    Categoria.find({ nombre: params.nombre }).exec((err, CategoriaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (CategoriaEncontrada && CategoriaEncontrada.length >= 1) {
            return res.status(500).send({ mensaje: "categoría existente" });
        }
        if (req.user.rol == "ROL_ADMIN") {
            Categoria.findByIdAndUpdate(idCategoria, params, { new: true }, (err, CategoriaActualizada) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                if (!CategoriaActualizada) return res.status(500).send({ mensaje: "No se pudo eliminar la categoría" });
                return res.status(200).send({ CategoriaActualizada })
            });
        } else {
            return res.status(500).send({ mensaje: "No posee los permisos para eliminar categoría" });
        }
    });
}

function obtenerCategorias(req, res) {
    Categoria.find().exec(function(err, categorias) {
        if (err)
            return res.status(500).send({ mensaje: "No se pudo obtener usuarios" });
        if (!categorias)
            return res.status(500).send({ mensaje: "Error al consultar usuarios" });
        return res.status(200).send({ categorias });
    });
}

module.exports = {
    inicio,
    agregarCategoria,
    eliminarCategoria,
    editarCategoria,
    obtenerCategorias
}