let valorIncial, valorFinal;
let pagar=false;
let valorDolar = 1;

//Array que guardará los productos
const productos = [];

//Array que guardará el carrito de compras
const miCarrito = [];

//Array que guarda las opciones de las cuotas y sus respectivos interes
const opcionesCuotas = [{id: 1, cantCuotas: 1, interes: 0},
                    {id:2, cantCuotas: 3, interes: 10},
                    {id:3, cantCuotas: 6, interes: 30},
                    {id:4, cantCuotas: 12, interes: 50},
];

//Array que guardará las categorias de los productos
const categoriasProducto = [];

const categoriasSeleccionadas = [];

//Obtiene la cotización del dólar oficial para la venta
async function consultarDolar() {

    const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
    const data = await response.json();

    valorDolar = data.oficial.value_sell;

    //Obtiene los productos
    obtenerProductos();

};

consultarDolar();

//Obtiene los productos y los guarda en un array con los precios pesificados
function obtenerProductos() {

    fetch('/productos.json')
    .then((response) => response.json())
    .then((productosObtenidos) => {

        for(const producto of productosObtenidos){
            productos.push({id:producto.id,nombre:producto.nombre,precio:producto.precio*valorDolar,img:producto.img,stock:producto.stock,categoria:producto.categoria});          
        }

        console.log(productos);

        pintarCategorias();      
     
    })
};

//Funcion para mostrar los productos en pantalla
function pintarProductos(){

    let cadena = "";

        for(const producto of productos){
            
            //Pinta los productos en pantalla
            if(categoriasSeleccionadas.includes(producto.categoria)){
                if(producto.stock>0){
                    console.log(producto.img);
                    cadena = cadena + `
                    <div id="producto" class="card">
                    <img src="${producto.img}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text">$${producto.precio}</p>
                        <button type="button" id="${producto.id}" class="btn btn-lg btn-primary" onClick="btnAgregar_click(${producto.id})">Agregar</button>
                    </div>
                    </div>
                    `;
                }else{
                    cadena = cadena + `
                    <div id="producto" class="card">
                    <img src="${producto.img}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text">$${producto.precio}</p>
                        <button type="button" id="${producto.id}" class="btn btn-lg btn-secondary" onClick="btnAgregar_click(${producto.id})" disabled>Agotado</button>
                    </div>
                    </div>
                    `;
                }
            }
           
        }

        let container = document.getElementById('productos');
        container.innerHTML = cadena;      

}

//Cargar carrito
function cargarCarrito(){

    const carrito = JSON.parse(localStorage.getItem('carrito'));

    if(carrito !== null){
        for(const item of carrito){
            miCarrito.push({id:item.id,nombre:item.nombre,precio:item.precio,cantidad:item.cantidad,img:item.img}); 
        }
    }   

    pintarCarrito();
}

cargarCarrito();

//Función que pinta la sección de las categorías
function pintarCategorias(){

    //Obtiene los datos del archivo
    fetch('/categorias.json')
    .then((response) => response.json())
    .then((categoriasObtenidas) => {

        let cadena = "";

        for(const categoria of categoriasObtenidas){
    
            const {id, nombre} = categoria;

            //Guarda en un array
            categoriasProducto.push({id:id,nombre:nombre})
    
                cadena = cadena + `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="${id}" onchange="cambioCategoria(this)" checked>
                    <label class="form-check-label" for="${id}">
                    ${nombre}
                    </label>
                </div>
                `;
    
                //Pushea al array de categorias seleccionadas
                categoriasSeleccionadas.push(id);
    
        }
        
        //Pinta
        let container = document.getElementById('categorias');
        container.innerHTML = cadena;

        //Llama a la función que obtiene los productos
        pintarProductos();

    });

}

//Guardar carrito
const guardarCarrito = (carrito) => {
    const enJSON = JSON.stringify(carrito);
    localStorage.setItem('carrito', enJSON);
}

//Botón de agregar producto
function btnAgregar_click(idProducto) {

    let existe = false;
    //Busca el producto y lo agrega al array carrito
    for(const producto of productos){
        
        if(producto.id==idProducto){
            valorIncial=producto.precio;

            //descuenta el stock
            producto.stock--;

            //Comprueba si hay un producto igual en el array carrito, de ser así incrementa la cantidad
            for(const productoCarrito of miCarrito){
                if(producto.id==productoCarrito.id){
                    productoCarrito.cantidad++;
                    productoCarrito.precio=valorIncial*productoCarrito.cantidad;
                    existe=true;
                }
            }

            //Si no existe en el carrito lo agrega
            if(existe==false){
                miCarrito.push({id:producto.id,nombre:producto.nombre,precio:producto.precio,cantidad:1,img:producto.img});   
            }
                           
            break;
        }

    }

    guardarCarrito(miCarrito);
    mostrarToast('Producto agregado',1500,'center','bottom','green');

    pintarProductos()
    pintarCarrito()

}   

//Muestra los productos del carrito en pantalla
function pintarCarrito(){

    let cadena = "";
    valorIncial = 0;
    let cantidadTotal = 0;
    let cantProducto = "";
    const listaDePrecios = [];

    for(const producto of miCarrito){

        const {id, nombre, precio, cantidad, img} = producto;

        valorIncial = valorIncial + precio;
        listaDePrecios.push(precio);

        if (producto.cantidad==1){
            cantProducto = "";
        }else{
            cantProducto = " (" + cantidad + ")";
        }

        cadena = cadena + `
        <div id="producto" class="card">
        <img src="${img}" class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-title">${nombre}${cantProducto}</h5>
            <p class="card-text">$${precio}</p>
            <button type="button" id="${id}" class="btn btn-lg btn-danger" onClick="btnEliminar_click(${id})">Eliminar</button>
        </div>
        </div>
        `;

        cantidadTotal = cantidadTotal + cantidad;
    }

    console.log("El producto más caro vale: " + Math.max(...listaDePrecios));

    let container = document.getElementById('carrito');
    container.innerHTML = cadena;

    document.getElementById("textoCarrito").innerHTML = "Mi carrito (" + cantidadTotal + ")";
    document.getElementById("totalCarrito").innerHTML = "Total: $" + valorIncial;

}


//Botón de eliminar en carrito
function btnEliminar_click(idProducto) {

    let cont=0;

    for(const productos of miCarrito){

        //Comprueba la cantidad del producto en el carrito. Si hay una elimina el objeto del array. Si hay más de una decrementa la cantidad y el precio
        if(productos.id==Number(idProducto)){
            if(productos.cantidad==1){
                miCarrito.splice(cont,1);
            }else{
                productos.precio=productos.precio-(productos.precio/productos.cantidad);
                productos.cantidad--;               
            }
            
            break;
        }            
        cont++;
    }

    //Devuelve el stock
    for(const producto of productos){
        if (producto.id==Number(idProducto)){
            producto.stock++;
        }
    }

    if(pagar==true){
        pintarCuotas();
    }

    guardarCarrito(miCarrito);
    mostrarToast('Producto eliminado',1500,'center','bottom','red');

    pintarProductos();
    pintarCarrito();

}

//Botón finalizar
function btnFinalizar_click(){

    if(pagar==false){

        //Valida que haya productos en el carrito
        const hayStock = miCarrito.length != 0 ? false : true;
        hayStock ? mostrarMensaje('¡Error!', 'No hay productos en el carrito', 'error') : irAPago();

    }else{

        if(miCarrito.length >0){

            mostrarMensaje('¡Compra realizada!', 'Su pedido se registró correctamente', 'success');

            //Limpia el array carrito
            for (let i = miCarrito.length; i > 0; i--) {
                miCarrito.pop();
            }

            volverAlInicio()

        }else{
            mostrarMensaje('Carrito vacío','No se puede realizar el comprar porque se eliminaron todos los productos del carrito', 'error');
            volverAlInicio();
        }

    } 

}

function volverAlInicio(){

    //Muestra el bloque que muestra los productos
    const prod = document.getElementById('bloqueProductos');
    prod.style.display='block'; 

    const cat = document.getElementById('bloqueCategorias');
    cat.style.display='block'; 

    //Oculta el bloque que muestra las cuotas
    const cuo = document.getElementById('opcionesCuotas');
    cuo.style.display='none'; 

    document.getElementById('btnFinalizar').innerHTML = 'Ir a pagar';
    pintarCarrito();
    pagar=false;
    
}


//Función para mostrar mensajes
function mostrarMensaje(titulo,texto,icono){

    Swal.fire(
        titulo,
        texto,
        icono
      )

}

//Función para mostrar un toast
function mostrarToast(text, duration, position, gravity, color){

    Toastify({
        text: text,
        duration: duration,
        position: position,
        gravity: gravity,
        style:{
            background: color,
        }
    }).showToast();

}


function irAPago(){
            //     //Oculta el bloque que muestra los productos
            const x = document.getElementById('bloqueProductos');
            x.style.display='none';       

            const y = document.getElementById('bloqueCategorias');
            y.style.display='none';       

            document.getElementById('btnFinalizar').innerHTML = 'Finalizar';
            pintarCuotas();
            pagar=true;
}


//Funcion que muestra las opciones de cuotas en pantalla
function pintarCuotas(){

    let cadena = "";

    for(const cuotas of opcionesCuotas){

        const {id, cantCuotas, interes} = cuotas;

        if(cuotas.cantCuotas==1){
            cadena = cadena + `
            <input type="radio" name="cuota" onchange="cambioCuota(${id})" value="${cantCuotas}" checked>
            <label for="c1">1 pago (sin interés)</label><br>
            `;
        }else{
            cadena = cadena + `
            <input type="radio" name="cuota" onchange="cambioCuota(${id})" value="${cantCuotas}">
            <label for="c1">${cantCuotas} pagos (${interes}% interés)</label><br>
            `;
        }
            
    }

    let container = document.getElementById('opcionesCuotas');
    container.innerHTML = cadena;

    const cuo = document.getElementById('opcionesCuotas');
    cuo.style.display='block'; 


}

//Funcion que calcula el valor de las cuotas
function calcularCuotas(precio,cuota,interes){

    precio = valorIncial;
    precio = valorIncial+(valorIncial*interes)/100;
    let precioCuotas = precio/cuota;
    valorFinal = precio;

    if(cuota==1){
        document.getElementById("totalCarrito").innerHTML = "Total: $" + valorFinal + " en 1 pago";
    }else{
        document.getElementById("totalCarrito").innerHTML = "Total: $" + valorFinal + " en " + cuota + " pagos de $" + precioCuotas;
    }
    
}

//Detecta el cambio de las opciones de compra y llama a la función que calcula las cuotas
function cambioCuota(cantidad) {
    for(const cuota of opcionesCuotas){
        if(cantidad==cuota.id){
            calcularCuotas(valorIncial,cuota.cantCuotas,cuota.interes);
        }
    }
}

//Comprueba cambios en los checkbox de categorias
function cambioCategoria(valor) {

    //Si se deschequea lo elimina del array de las seleccionadas y si chequea la agrega
    if(valor.checked==false){

        let cont=0;
        for(const cat of categoriasSeleccionadas){
            if(cat==valor.id){
                categoriasSeleccionadas.splice(cont,1);
                break;
            }
            cont++;
        }

    }else{
        categoriasSeleccionadas.push(Number(valor.id))
    }

    pintarProductos();

};