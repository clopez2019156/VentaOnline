'use strict'

var Categoria = require("../modelos/categoria.model");
var Factura = require("../modelos/factura.model");
var Producto = require("../modelos/producto.model");
var Usuario = require("../modelos/usuario.model");

var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");
const categoriaModel = require("../modelos/categoria.model");

function agregarProducto(req, res) {
    var productoModel = new Producto(); 
    var params = req.body;
    if (req.user.rol == "ROL_ADMIN") {
        if (params.nombre) {
            productoModel.nombre = params.nombre;
            productoModel.precio = params.precio;
            productoModel.cantidad = params.cantidad;
            productoModel.idCategoria = params.idCategoria;
            Producto.find(
                { nombre: productoModel.nombre }
            ).exec((err, productoEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Producto' });
                if (productoEncontrado && productoEncontrado.length >= 1) {
                    return res.status(500).send({ mensaje: 'El producto ya existe y no queremos agregar mas productos de este tipo' });
                } else {
                    productoModel.save((err, productoGuardado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar producto' });
                        if (productoGuardado) {
                            res.status(200).send({ productoGuardado })
                        } else {
                            res.status(404).send({ mensaje: 'No se ha podido registrar el producto' })
                        }
                    })
                }
            })

        }
    }else{
        return res.status(500).send({ mensaje: 'Un cliente no puede agregar un producto' });
    }
}

function editarProducto(req, res) {
    var idProducto = req.params.id;
    var params = req.body; 
    Producto.find(
        { nombre: params.nombre }
    ).exec((err, ProductoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Producto' });
        if (ProductoEncontrado && ProductoEncontrado.length >= 1) {
            return res.status(500).send({ mensaje: 'El producto ya existe' });
    }
    if (req.user.rol == "ROL_ADMIN") {
        Producto.findByIdAndUpdate(idProducto, params, { new: true }, (err, productoActualizado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoActualizado) return res.status(500).send({ mensaje: 'No se a podido editar el producto' });
        return res.status(200).send({ productoActualizado })
        })
    }else{
        return res.status(500).send({ mensaje: 'Un cliente no puede editar productos' });
    }
    })
}

function eliminarProducto(req, res) {
    var idCategoria= req.params.id;
    if(req.user.rol != "ROL_ADMIN"){
        return res.status(500).send({mensaje: "Un cliente no puede eliminar un producto"});
    }

    Producto.findByIdAndDelete(idCategoria,(err, ProductoEliminado)=>{
    if(err) return res.status(500).send({mensaje:"Error en la peticion"});
    if(!ProductoEliminado) return res.status(500).send({mensaje:"No se ha podido Eliminar el producto"});
        return res.status(200).send({mensaje: "Se ha eliminado el producto"});
    })


    
}

function obtenerProductos(req, res) {


    Producto.find().exec((err, productos) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Usuarios' });
    if (!productos) return res.status(500).send({ mensaje: 'Error en la consutla de Usuarios o no tiene datos' });
    return res.status(200).send({ productos });
    })


}

function obtenerProductosCategoria(req, res) {
    var categoriaId = req.params.id;

    Producto.find({idCategoria: categoriaId}).exec(
    (err, productos) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!productos) return res.status(500).send({mensaje: "No tienes productos con esa categoria"})
            return res.status(200).send({ productos });
        }
    })

}

function obtenerPorNombre(req, res) {
    var params = req.body;

    Producto.find({nombre: params.nombre}).exec(
    (err, productos) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!productos) return res.status(500).send({mensaje: "No tienes productos con ese nombre"})
            return res.status(200).send({ productos });
        }
    })
}

function obtenerAgotados(req, res) {

    Producto.find({cantidad: 0}).exec(
    (err, productos) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!productos) return res.status(500).send({mensaje: "No tienes productos con ese nombre"})
            return res.status(200).send({ productos });
        }
    })
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