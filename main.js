let valorIncial, valorFinal;
let pagar=false;

//Array que guardará el carrito de compras
const miCarrito = [];

//Array que guarda las opciones de las cuotas y sus respectivos interes
const opcionesCuotas = [{id: 1, cantCuotas: 1, interes: 0},
                    {id:2, cantCuotas: 3, interes: 10},
                    {id:3, cantCuotas: 6, interes: 30},
                    {id:4, cantCuotas: 12, interes: 50},
];

//Array que guarda las categorias de los productos
const categoriasProducto = [{id: 1, nombre: 'Audio/Video'},
                        {id: 2, nombre: 'Cocina'},
                        {id: 3, nombre: 'Cuidado Personal'}
];

const categoriasSeleccionadas = [];

//Funcion para mostrar los productos en pantalla
function pintarProductos(){
    
    pedirProductos();

}

const pedirProductos = async () => {
    alert("Hola")
    let cadena = "";
    const response = await fetch('productos.json');
    const data = await response.json();

    data.forEach((producto) => {
    if(categoriasSeleccionadas.includes(producto.categoria)){
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
                    <button type="button" id="${producto.id}" class="btn btn-lg btn-primary" onClick="btnAgregar_click(${producto.id})" disabled>Agotado</button>
                </div>
                </div>
                `;
            }
    })

    let container = document.getElementById('productos');
    container.innerHTML = cadena;
};

//Cargar carrito
function cargarCarrito(){

    const carrito = JSON.parse(localStorage.getItem('carrito'));

    if(carrito !== null){
        for(const item of carrito){
            miCarrito.push({id:item.id,nombre:item.nombre,precio:item.precio,cantidad:1,img:item.img}); 
        }
    }
    

    pintarCarrito();
}

cargarCarrito();

//Función que pinta la sección de las categorías
function pintarCategorias(){

    let cadena = "";

    for(const categoria of categoriasProducto){

            cadena = cadena + `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="${categoria.id}" onchange="cambioCategoria(this)" checked>
                <label class="form-check-label" for="${categoria.id}">
                ${categoria.nombre}
                </label>
            </div>
            `;

            //Pushea al array de categorias seleccionadas
            categoriasSeleccionadas.push(categoria.id);

    }

    let container = document.getElementById('categorias');
    container.innerHTML = cadena;

}

pintarCategorias()

//Guardar carrito
const guardarCarrito = (carrito) => {
    const enJSON = JSON.stringify(carrito);
    localStorage.setItem('carrito', enJSON);
}

pintarProductos()

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

    pintarProductos()
    pintarCarrito()

}   

//Muestra los productos del carrito en pantalla
function pintarCarrito(){

    let cadena = "";
    valorIncial = 0;
    let cantidad = 0;

    let cantProducto = "";


    for(const producto of miCarrito){
        valorIncial = valorIncial + producto.precio;

        if (producto.cantidad==1){
            cantProducto = "";
        }else{
            cantProducto = " (" + producto.cantidad + ")";
        }

        cadena = cadena + `
        <div id="producto" class="card">
        <img src="${producto.img}" class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-title">${producto.nombre}${cantProducto}</h5>
            <p class="card-text">$${producto.precio}</p>
            <button type="button" id="${producto.id}" class="btn btn-lg btn-danger" onClick="btnEliminar_click(${producto.id})">Eliminar</button>
        </div>
        </div>
        `;

        cantidad = cantidad + producto.cantidad;
    }

    let container = document.getElementById('carrito');
    container.innerHTML = cadena;

    document.getElementById("textoCarrito").innerHTML = "Mi carrito (" + cantidad + ")";
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

    pintarProductos();
    pintarCarrito();

}

//Botón finalizar
function btnFinalizar_click(){

    if(pagar==false){
        if (miCarrito.length==0){
            alert('No hay productos en el carrito')
        }else{
            //Oculta el bloque que muestra los productos
            const x = document.getElementById('bloqueProductos');
            x.style.display='none';       

            document.getElementById('btnFinalizar').innerHTML = 'Finalizar';
            pintarCuotas();
            pagar=true;
        }
    }else{
            alert("Compra realizada!")

            //Limpia el array carrito
            for (let i = miCarrito.length; i > 0; i--) {
                miCarrito.pop();
            }

            //Muestra el bloque que muestra los productos
            const prod = document.getElementById('bloqueProductos');
            prod.style.display='block'; 

            //Oculta el bloque que muestra las cuotas
            const cuo = document.getElementById('opcionesCuotas');
            cuo.style.display='none'; 

            document.getElementById('btnFinalizar').innerHTML = 'Ir a pagar';
            pintarCarrito();
            pagar=false;

    } 

}


//Funcion que muestra las opciones de cuotas en pantalla
function pintarCuotas(){

    let cadena = "";

    for(const cuotas of opcionesCuotas){

        if(cuotas.cantCuotas==1){
            cadena = cadena + `
            <input type="radio" name="cuota" onchange="cambioCuota(${cuotas.id})" value="${cuotas.cantCuotas}" checked>
            <label for="c1">1 pago (sin interés)</label><br>
            `;
        }else{
            cadena = cadena + `
            <input type="radio" name="cuota" onchange="cambioCuota(${cuotas.id})" value="${cuotas.cantCuotas}">
            <label for="c1">${cuotas.cantCuotas} pagos (${cuotas.interes}% interés)</label><br>
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

    //Si se deschequea lo elimina del array de las seleccionadas y se chequea la agrega
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