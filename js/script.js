//Variable global que carga en memoria unos usuarios predefinidos.
let usuarios = [];
//Variable global que almacena todos los productos cargados de AJAX.
let productos = [];

window.onload = async function(){
    var title = document.getElementsByTagName('title')[0].textContent;
    if(title === "Inicio"){
        iniciarPopupCookies();
        iniciarPopupSesion();
        animacionArticulos();
        buscar();
        reconocimientoVoz();
        iniciarUsuarios();
        registroUsuario();
        iniciarSesion();
        cerrarSesion();
        comprar();

        await leerJSON();
        cargarEscaparate();

        iniciarPopupCarrito();
        Notification.requestPermission().then(mostrarNotificacion());
  
        function mostrarNotificacion() {
            if (Notification.permission == 'granted') {
                const notificacion = new Notification('Bienvenid@ a Tinnie');
            }
        }
    }else if(title === "Productos"){
        iniciarPopupCookies();
        iniciarPopupSesion();
        animacionArticulos();
        buscar();
        reconocimientoVoz();
        iniciarUsuarios();
        registroUsuario();
        iniciarSesion();
        cerrarSesion();
        comprar();

        cargaInicial();
        await leerJSON();
        cargarProductos();
        comprobarProductos();

        iniciarPopupCarrito();
    }else if(title === "Factura"){
        if(sessionStorage.carrito === undefined || sessionStorage.carrito.length==0 || sessionStorage.usuario===undefined){
            window.location.href = "index.html";
        }else{
            await leerJSON();
            cargarFactura();
        }
    }    
}

/**
 * Inicializa la variable global usuarios
 * en caso de que el sessionStorage de "usuario"
 * esté vacío.
 */
function iniciarUsuarios(){
    if(sessionStorage.usuario === undefined){
        usuarios = ["alex;1234","lana;lana","dwes;dwes"];
        //sessionStorage.setItem("usuarios", JSON.stringify(usuarios));
    }else{
        document.getElementById("btnInicioSes").textContent=sessionStorage.usuario;
        document.getElementById("btnInicioSes").classList.add("disabled");
        document.getElementById("btnCerrarSes").classList.remove("disabled");
    }
}


/**
 * Realiza el inicio de sesión, así como comprobaciones.
 */
function iniciarSesion(){
    document.getElementById("submitLog").addEventListener("click",function(){
        let usuario = document.getElementById("user").value.trim();
        let pass = document.getElementById("pass").value;

        if(credencialesCorrectas(usuario,pass)){
            alert("Bienvenid@ "+usuario);
            sessionStorage["usuario"] = usuario;
            animacionCarga();
            setTimeout( function() { window.location.href = "index.html"; }, 2000 );
        }else{
            document.getElementById("errIn").classList.remove("d-none");
            document.getElementById("errIn").classList.add("animError");
            setTimeout( function() {
                document.getElementById("errIn").classList.add("d-none");
                document.getElementById("errIn").classList.remove("animError");
        }, 3000 );
            e.preventDefault();
        }
    });
}
/**
 * Comprueba si existe el usuario introducido por login
 * y si la contraseña es correcta de los datos de 
 * la variable global usuarios.
 * @param {*} usuario 
 * @param {*} pass 
 * @returns boolean
 */
function credencialesCorrectas(usuario,pass){
    var esValido = false;
    for (let i = 0; i < usuarios.length && !esValido; i++) {
        if(usuarios[i].split(";")[0]===usuario && usuarios[i].split(";")[1]===pass){
            esValido=true;
        }
    }
    return esValido;
}

/**
 * Realiza el registro, así como comprobaciones.
 */
function registroUsuario(){
    document.getElementById("submitReg").addEventListener("click",function(e){
        let usuario = document.getElementById("regUser").value.trim();
        let contra = document.getElementById("regPas").value;
        let confirm = document.getElementById("regCPas").value;
        let expUsu = new RegExp(/^[A-Za-z0-9]{4,15}$/);
        let expContra = new RegExp(/^(?=\w*[A-Z])(?=\w*[a-z])(?=\w*[0-9])[A-Za-z0-9]{4,15}$/);

        //console.log(expUsu.test(usuario) && expContra.test(contra) && contra===confirm);
        if(existeUsuario(usuario) && expUsu.test(usuario) && expContra.test(contra) && contra===confirm){
            alert("Alta realizada con éxito");
            sessionStorage["usuario"] = usuario;
            animacionCarga();
            setTimeout( function() { window.location.href = "index.html"; }, 2000 );
        }else{
            document.getElementById("errReg").classList.remove("d-none");
            document.getElementById("errReg").classList.add("animError");
            setTimeout( function() {
                document.getElementById("errReg").classList.add("d-none");
                document.getElementById("errReg").classList.remove("animError");
        }, 3000 );
            e.preventDefault();
        }
    });
}
/**
 * Comprueba si existe el usuario introducido por registro
 * en la variable global usuarios.
 * @param {String} usuario 
 * @returns boolean
 */
function existeUsuario(usuario){
    var esValido = true;
    for (let i = 0; i < usuarios.length && esValido; i++) {
        if(usuarios[i].split(";")[0]===usuario){
            esValido=false;
        }
    }
    return esValido;
}

/**
 * Cierra la sesión y elimina todo el SessionStorage
 */
function cerrarSesion() {
    document.getElementById("btnCerrarSes").addEventListener("click",function(){
        sessionStorage.clear();
        animacionCarga();
        setTimeout( function() { window.location.href = "index.html"; }, 2000 );
    });
}



/**
 * Reconocimiento de voz en CASTELLANO y respuesta al usuario.
 */
function reconocimientoVoz(){
    var campoTexto = document.getElementById("campoBuscar"); 
    document.getElementById("microfono").addEventListener("click", function(){
        const SpeechRecognition = webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "es-ES";

        recognition.start();
        recognition.onstart = function () {
          campoTexto.value="";
          campoTexto.placeholder = "Escuchando...";
        };
        recognition.onerror = function() { 
          campoTexto.placeholder = "No te hemos escuchado";
        };

        recognition.onspeechend = function () {
          recognition.stop();
        };

        recognition.onresult = function (e) {
          var transcript = e.results[0][0].transcript;
          //var confidence = e.results[0][0].confidence;
          campoTexto.value = transcript.replace(".", "");
          campoTexto.placeholder = "Buscar";
        };
    });
}


/**
 * Redirige a la página products.html con unos filtros
 * de búsqueda invocados por el usuario.
 * (click en artículos del carrousel o barra de búsqueda)
 */
function buscar(){
    //Página index.html
    if(document.getElementsByTagName('title')[0].textContent == "Inicio"){
        //Se hace click a la caja de perros
        document.getElementById("perros").addEventListener("click", function(){
            sessionStorage["animal"] = "perro";
            sessionStorage["tipo"] = "todo";
            animacionCarga();
            setTimeout( function() { window.location.href = "products.html"; }, 2000 );
        });
        //Se hace click a la caja de gatos
        document.getElementById("gatos").addEventListener("click", function(){
            sessionStorage["animal"] = "gato";
            sessionStorage["tipo"] = "todo";
            animacionCarga();
            setTimeout( function() { window.location.href = "products.html"; }, 2000 );
        });
    }
    
    //Se realiza la busqueda usando el botón de lupa
    document.getElementById("busqueda").addEventListener("click", function(){
        var campoTexto = document.getElementById("campoBuscar").value.toLowerCase();
        if(busqueda(campoTexto)){
            animacionCarga();
            setTimeout( function() { window.location.href = "products.html"; }, 2000 );
        }
        else{
            document.getElementById("campoBuscar").classList.add("animError");
            setTimeout( function() { 
                document.getElementById("campoBuscar").classList.remove("animError");
                document.getElementById("campoBuscar").value="";
                document.getElementById("campoBuscar").placeholder="No encontrado";
            }, 850 );
        }        
    });
    //Se realiza la búsqueda usando la tecla ENTER
    document.getElementById("campoBuscar").addEventListener("keydown", function(e){
        var campoTexto = document.getElementById("campoBuscar").value.toLowerCase();
        if(e.key == "Enter"){
            if(busqueda(campoTexto)){
                animacionCarga();
                setTimeout( function() { window.location.href = "products.html"; }, 2000 );
            }
            else{
                document.getElementById("campoBuscar").classList.add("animError");
                setTimeout( function() { 
                    document.getElementById("campoBuscar").classList.remove("animError");
                    document.getElementById("campoBuscar").value="";
                    document.getElementById("campoBuscar").placeholder="No encontrado";
                }, 850 );
            }        
            
        }
        
    });
}

/**
 * Comprueba si barra de búsqueda contiene palabras CLAVE.
 * @param {String} campoTexto 
 * @returns boolean
 */
function busqueda(campoTexto){
    var esValido = true;
    //Busqueda por accesorio
    if(campoTexto.includes("accesorio") || campoTexto.includes("accesorios") || campoTexto.includes("correa") || campoTexto.includes("correas")){
        if(campoTexto.includes("perro") || campoTexto.includes("perros")){
            //alert("accesorio para perro");
            sessionStorage["animal"] = "perro";
            sessionStorage["tipo"] = "accesorio";
        }
        else if(campoTexto.includes("gato") || campoTexto.includes("gatos")){
            //alert("accesorio para gato");
            sessionStorage["animal"] = "gato";
            sessionStorage["tipo"] = "accesorio";
        }
        else{
            //alert("accesorio solo");
            sessionStorage["animal"] = "todo";
            sessionStorage["tipo"] = "accesorio";
        }
    }
    //Búsqueda por ropa
    else if(campoTexto.includes("ropa") || campoTexto.includes("ropas") || campoTexto.includes("traje") || campoTexto.includes("trajes")){
        if(campoTexto.includes("perro") || campoTexto.includes("perros")){
            //alert("ropa para perro");
            sessionStorage["animal"] = "perro";
            sessionStorage["tipo"] = "ropa";
        }
        else if(campoTexto.includes("gato") || campoTexto.includes("gatos")){
            //alert("ropa para gato");
            sessionStorage["animal"] = "gato";
            sessionStorage["tipo"] = "ropa";
        }
        else{
            //alert("ropa solo");
            sessionStorage["animal"] = "todo";
            sessionStorage["tipo"] = "ropa";
        }
    }
    //Busqueda por perro
    else if(campoTexto.includes("perro") || campoTexto.includes("perros")){
        //alert("Perro sin tipo");
        sessionStorage["animal"] = "perro";
        sessionStorage["tipo"] = "todo";
    }
    //Busqueda por gato
    else if(campoTexto.includes("gato") || campoTexto.includes("gatos")){
        //alert("Gato sin tipo");
        sessionStorage["animal"] = "gato";
        sessionStorage["tipo"] = "todo";
    }
    else{
        esValido = false;
    }
    return esValido;
}



function iniciarPopupSesion(){
    var btnInicioSes = document.getElementById("btnInicioSes");
    var inicioSes = document.getElementById("inicioSes");
    var popupIn = document.getElementById("popupIn");
    var btnCerrarIn = document.getElementById("btnCerrarIn");
    var btnCambiar = document.getElementById("cambioRegistro");
    var header = document.getElementById("cajaHeader");

    btnInicioSes.addEventListener("click", function(){
        header.classList.remove("sticky-top");
        inicioSes.classList.remove("invisible");
        inicioSes.classList.add("visible");
        popupIn.classList.add("activo");
        scroll(0,0);
        document.body.style.overflowY="hidden";
    });
    btnCerrarIn.addEventListener("click", function(e){
        e.preventDefault();
        inicioSes.classList.remove("visible");
        inicioSes.classList.add("invisible");
        popupIn.classList.remove("activo");
        header.classList.add("sticky-top");
        document.body.style.overflowY="scroll";
    });

    btnCambiar.addEventListener("click", function(){
        var inicio = document.getElementById("inicio");
        var registro = document.getElementById("registro");
        if(registro.classList.contains("d-none")){
            inicio.classList.add("d-none");
            registro.classList.remove("d-none");
            btnCambiar.innerHTML="< Volver";
            
        }else{
            inicio.classList.remove("d-none");
            registro.classList.add("d-none");
            btnCambiar.innerHTML="¿Todavía no tienes una cuenta en TINNIE?";
        }
        
    });
}

function iniciarPopupCookies() {
    var galleta = document.getElementById("galleta");
    var popupGalleta = document.getElementById("popupCookie");
    var aceptarGalleta = document.getElementById("aceptarGalleta");
    var rechazarGalleta = document.getElementById("rechazarGalleta");
    var header = document.getElementById("cajaHeader");
    
    if (!getCookie("aceptasGalleta")) {
        header.classList.remove("sticky-top");
        galleta.classList.remove("invisible");
        popupGalleta.classList.add("activo");
        document.body.style.overflowY="hidden";

        aceptarGalleta.addEventListener("click", function () {
            setCookie("aceptasGalleta", true, 1);
            header.classList.add("sticky-top");
            galleta.classList.add("invisible");
            popupGalleta.classList.remove("activo");
            document.body.style.overflowY="scroll";

            //window.dispatchEvent(new Event("cookieAlertAccept"));
        });

        rechazarGalleta.addEventListener("click", function () {
            setCookie("aceptasGalleta", false, 1);
            header.classList.add("sticky-top");
            galleta.classList.add("invisible");
            popupGalleta.classList.remove("activo");
            document.body.style.overflowY="scroll";

            //window.dispatchEvent(new Event("cookieAlertAccept"));
        });


    } 

    

    //
    function setCookie(nombreGalleta, valorGalleta, dias) {
        var hoy = new Date();
        hoy.setTime(hoy.getTime() + (dias * 24 * 60 * 60 * 1000));
        var expiracion = "expires=" + hoy.toUTCString();
        document.cookie = nombreGalleta + "=" + valorGalleta + ";" + expiracion + ";path=/";
    }
    function getCookie(nombreGalleta) {
        var name = nombreGalleta + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
}

function iniciarPopupCarrito() {
    var btnCarr = document.getElementById("btnCarr");
    var carrito = document.getElementById("carrito");
    var popupCar = document.getElementById("popupCar");
    var btnCerrarCar = document.getElementById("btnCerrarCar");
    var header = document.getElementById("cajaHeader");

    btnCarr.addEventListener("click", function(){
        header.classList.remove("sticky-top");
        carrito.classList.remove("invisible");
        carrito.classList.add("visible");
        popupCar.classList.add("activo");
        scroll(0,0);
        document.body.style.overflowY="hidden";
        cargarCarrito();
    });
    btnCerrarCar.addEventListener("click", function(e){
        e.preventDefault();
        carrito.classList.remove("visible");
        carrito.classList.add("invisible");
        popupCar.classList.remove("activo");
        header.classList.add("sticky-top");
        document.body.style.overflowY="scroll";
    });
}
/**
 * Busca el id del carrito correspondiente 
 * al producto en products.json
 * @param {*} id 
 * @returns producto
 */
function obtenerporID(id){
    var producto = "";
    var interruptor = false;
    for (let i = 0; i < productos.length && !interruptor; i++) {
        if(productos[i]["tipo"]!=="escaparate" && productos[i]["id"]==id){
            producto = productos[i];
            interruptor = true;
        }
        
    }
    return producto;
}
function cargarCarrito(){
    var numArticulos = document.getElementById("cantidadArt");
    var precioTot = document.getElementById("precioTot");
    var precioFin = document.getElementById("precioFin");
    var listProducto = document.getElementById("listProducto");


    //Comprobamos si el carrito va vacío, o no, y lo imprime
    if(sessionStorage.carrito===undefined || sessionStorage.carrito.length==0){
        numArticulos.textContent = "Ningún articulo.";
        listProducto.innerHTML = "";
        precioTot.textContent = "0€";
        precioFin.textContent = "0€";
        document.getElementById("pagar").classList.add("disabled");
        document.getElementById("envio").classList.add("invisible");

    }else{
        var idCesta = JSON.parse(sessionStorage.getItem("carrito"));
        var precioTotal = 0;
        var articulos= "";

        //Búsqueda, creación del artículo y conteo del precio
        for (let i = 0; i < idCesta.length; i++) {
            var articulo = obtenerporID(idCesta[i]);
            articulos += crearProductoCesta(articulo["url"],articulo["tipo"],articulo["alt"],articulo["precio"],articulo["id"]);
            precioTotal += parseFloat(articulo["precio"]);
        }

        //Productos
        numArticulos.textContent = idCesta.length + " artículos.";
        listProducto.innerHTML = articulos;
        borrarCarrito(idCesta);
        //comprobarProductos();

        //Desglose
        precioTot.textContent = Number.parseFloat(precioTotal).toFixed(2)+" €";
        var envio = document.getElementById("envio");
        envio.classList.remove("invisible");
        var prEnvio = 0;
            switch (envio.value){
                case "1": prEnvio = 5; break;
                case "2": prEnvio = 3.5; break;
                case "3": prEnvio = 0; break;
                default:alert("error");
            }
        precioFin.textContent = Number.parseFloat(precioTotal+prEnvio).toFixed(2)+" €";
        if(sessionStorage.usuario===undefined){
            document.getElementById("pagar").classList.add("disabled");
            document.getElementById("pagar").value = "Debes iniciar sesión";
        }else{
            document.getElementById("pagar").classList.remove("disabled");
            document.getElementById("pagar").value = "Pagar";
        }

        //Evento que varía el precio final por selección del envío
        envio.addEventListener("click", function(){
            var prEnvio = 0;
            switch (envio.value){
                case "1": prEnvio = 5; break;
                case "2": prEnvio = 3.5; break;
                case "3": prEnvio = 0; break;
                default:alert("error");
            }
            precioFin.textContent = Number.parseFloat(precioTotal+prEnvio).toFixed(2)+" €";
        });
        
    }
    
}
/**
 * Crea un producto con el formato HTML de la página
 * @param {String} ruta 
 * @param {String} tipo 
 * @param {String} alt 
 * @param {String} precio 
 * @param {String} id 
 * @returns producto
 */
function crearProductoCesta(ruta, tipo, alt, precio, id){
    return "<div class='row mb-4 d-flex justify-content-between align-items-center'><div class='col-md-2 col-lg-2 col-xl-2'><img src='"
    +ruta+"'class='src img-fluid rounded-3' alt='"+alt+"'/></div>"
    
    +"<div class='col-md-3 col-lg-3 col-xl-3'><h6 class='tipo text-capitalize text-muted'>"+tipo+"</h6> <h6 class='desc text-black mb-0'>"+alt+"</h6></div>"

    +"<div class='col-md-3 col-lg-2 col-xl-2 offset-lg-1'><h6 class='mb-0'>"+precio+"€</h6></div>"
    
    +"<div class='col-md-1 col-lg-1 col-xl-1 text-end'><a role='button' class='borrar text-muted' id='del-"+ id +"'><img src='./img/trash.ico' alt='Eliminar' width='32' height='32'></a></div></div>"

    +"<hr class='my-4'/>";
}

/**
 * Elimina un producto de la cesta
 * @param {int} idCesta 
 */
function borrarCarrito(idCesta){
    for (let i = 0; i < idCesta.length; i++) {
        document.getElementsByClassName("borrar")[i].addEventListener("click", function(e){
            var id = parseInt(e.target.parentElement.id.split("-")[1]);
            var idCestaModif = idCesta.filter(e => e !== id);
            if(idCestaModif.length == 0){
                sessionStorage.carrito = "";
            }else{
                sessionStorage.carrito = JSON.stringify(idCestaModif);
            }
            comprobarProductos();
            cargarCarrito();
            //e.target.removeEventListener("click");
        });
    }
}



/**
 * Función asíncrona que lee el fichero products.json
 * y lo carga en la variable global products.
 */
async function leerJSON() {
    const respuesta = await fetch('products.json')
    const datos = await respuesta.json()
    productos = datos
}

/**
 * Carga del escaparate index
 */
function cargarEscaparate() {
    var imagenes = document.getElementsByClassName("car");
    for (let i = 0; i < 5; i++) {
        imagenes[i].src = productos[i]["url"];
    }
    animacionArticulos();
}
/**
 * Carga de productos
 */
function cargarProductos() {
    var cajaProductos = document.getElementById("cajaProductos");

    //Se ha accedido a la página sin pasar por el index. Mostramos todos los productos
    if(sessionStorage.animal===undefined && sessionStorage.tipo===undefined){
        for (let i = 0; i < productos.length; i++) {
            if(productos[i]["tipo"]!="escaparate"){
                cajaProductos.innerHTML += crearProductos(productos[i]["url"],productos[i]["alt"],productos[i]["id"],productos[i]["precio"]);
            }
        }
        animacionArticulos();
        annyadirCarrito();
    }
    //Búsqueda solo perro
    else if(sessionStorage.animal==="perro" && sessionStorage.tipo==="todo"){
        for (let i = 0; i < productos.length; i++) {
            if(productos[i]["tipo"]!="escaparate" && productos[i]["animal"]=="perro"){
                cajaProductos.innerHTML += crearProductos(productos[i]["url"],productos[i]["alt"],productos[i]["id"],productos[i]["precio"]);
            }
        }
        animacionArticulos();
        annyadirCarrito();
    }
    //Búsqueda solo gato
    else if(sessionStorage.animal==="gato" && sessionStorage.tipo==="todo"){
        for (let i = 0; i < productos.length; i++) {
            if(productos[i]["tipo"]!="escaparate" && productos[i]["animal"]=="gato"){
                cajaProductos.innerHTML += crearProductos(productos[i]["url"],productos[i]["alt"],productos[i]["id"],productos[i]["precio"]);
            }
        }
        animacionArticulos();
        annyadirCarrito();
    }
    //Búsqueda solo accesorio
    else if(sessionStorage.animal==="todo" && sessionStorage.tipo==="accesorio"){
        for (let i = 0; i < productos.length; i++) {
            if(productos[i]["tipo"]!="escaparate" && productos[i]["tipo"]=="accesorio"){
                cajaProductos.innerHTML += crearProductos(productos[i]["url"],productos[i]["alt"],productos[i]["id"],productos[i]["precio"]);
            }
        }
        animacionArticulos();
        annyadirCarrito();
    }
    //Búsqueda solo ropa
    else if(sessionStorage.animal==="todo" && sessionStorage.tipo==="ropa"){
        for (let i = 0; i < productos.length; i++) {
            if(productos[i]["tipo"]!="escaparate" && productos[i]["tipo"]=="ropa"){
                cajaProductos.innerHTML += crearProductos(productos[i]["url"],productos[i]["alt"],productos[i]["id"],productos[i]["precio"]);
            }
        }
        animacionArticulos();
        annyadirCarrito();
    }
    //Búsqueda perro accesorio
    else if(sessionStorage.animal==="perro" && sessionStorage.tipo==="accesorio"){
        for (let i = 0; i < productos.length; i++) {
            if(productos[i]["tipo"]!="escaparate" && productos[i]["animal"]=="perro" && productos[i]["tipo"]=="accesorio"){
                cajaProductos.innerHTML += crearProductos(productos[i]["url"],productos[i]["alt"],productos[i]["id"],productos[i]["precio"]);
            }
        }
        animacionArticulos();
        annyadirCarrito();
    }
    //Búsqueda perro ropa
    else if(sessionStorage.animal==="perro" && sessionStorage.tipo==="ropa"){
        for (let i = 0; i < productos.length; i++) {
            if(productos[i]["tipo"]!="escaparate" && productos[i]["animal"]=="perro" && productos[i]["tipo"]=="ropa"){
                cajaProductos.innerHTML += crearProductos(productos[i]["url"],productos[i]["alt"],productos[i]["id"],productos[i]["precio"]);
            }
        }
        animacionArticulos();
        annyadirCarrito();
    }
    //Búsqueda gato accesorio
    else if(sessionStorage.animal==="gato" && sessionStorage.tipo==="accesorio"){
        for (let i = 0; i < productos.length; i++) {
            if(productos[i]["tipo"]!="escaparate" && productos[i]["animal"]=="gato" && productos[i]["tipo"]=="accesorio"){
                cajaProductos.innerHTML += crearProductos(productos[i]["url"],productos[i]["alt"],productos[i]["id"],productos[i]["precio"]);
            }
        }
        animacionArticulos();
        annyadirCarrito();
    }
    //Búsqueda gato ropa
    else if(sessionStorage.animal==="gato" && sessionStorage.tipo==="ropa"){
        for (let i = 0; i < productos.length; i++) {
            if(productos[i]["tipo"]!="escaparate" && productos[i]["animal"]=="gato" && productos[i]["tipo"]=="ropa"){
                cajaProductos.innerHTML += crearProductos(productos[i]["url"],productos[i]["alt"],productos[i]["id"],productos[i]["precio"]);
            }
        }
        animacionArticulos();
        annyadirCarrito();
    }
}
/**
 * Comprueba si hay ya artículos en la cesta para limitar unidades.
 */
function comprobarProductos(){
    if(sessionStorage.carrito == undefined || sessionStorage.carrito.length == 0){
        var prods = document.getElementById("cajaProductos").children;
        for (let i = 0; i < prods.length; i++) {
            prods[i].children[2].children[2].value = "Añadir a la cesta";
            prods[i].children[2].children[2].classList.remove("disabled");
        }
    }else{
        var arrayCarrito = JSON.parse(sessionStorage.carrito);
        var prods = document.getElementById("cajaProductos").children;
        for (let i = 0; i < prods.length; i++) {
            var idProd = prods[i].children[2].children[2].id.split("-")[1];
            if(arrayCarrito.find(idCar => idCar == idProd) == idProd){
                prods[i].children[2].children[2].value = "Ya añadido";
                prods[i].children[2].children[2].classList.add("disabled");
            }else{
                prods[i].children[2].children[2].value = "Añadir al carrito";
                prods[i].children[2].children[2].classList.remove("disabled");
            }
        }
    }
}
/**
 * Crea el
 * @param {String} url 
 * @param {String} alt 
 * @param {Int} id 
 * @param {Float} precio 
 * @returns 
 */
function crearProductos(url,alt,id,precio){
    return "<div role='button' class='col articulo rounded-3 pb-2'>"+
    "<img class='car img-fluid rounded' src='"+url+"' alt='"+alt+"'>"+
    "<div class='fondoFlotante invisible'></div>"+
    "<div class='textoFlotante invisible text-white text-center'>"+
      "<h2 class='fs-3 px-3 fw-bolder fst-italic'>"+alt+"</h2>"+
      "<h4 class='fs-6'>"+precio+"€</h4>"+
      "<input type='button' class='my-4 fs-6 btn btn-dark btnSubmit' value='Añadir al carrito' id='A-"+id+"'>"+
    "</div>"+
  "</div>";
}

function annyadirCarrito(){
    var prods = document.getElementById("cajaProductos").children;
    for (let i = 0; i < prods.length; i++) {
        var btnProd = prods[i].children[2].children[2];
        btnProd.addEventListener("click",function(e){
            var idProd = parseInt(e.target.id.split("-")[1]);

            //Si carrito vacío, lo inicializamos con el ID
            if(sessionStorage.carrito === undefined || sessionStorage.carrito.length==0){
                var arrayCarrito = [idProd];
                sessionStorage.carrito= JSON.stringify(arrayCarrito);
                //Sonido de cesta
                document.getElementsByTagName("audio")[0].play();
            }
            //Si el carrito no está vacío, vamos a comprobar
            //si el ID existe para evitar duplicados, se alerta al usuario
            //Si no existe duplicado se añade.
            else{
                if(!buscarIDCarrito(idProd)){
                    var arrayCarrito = JSON.parse(sessionStorage.carrito);
                    arrayCarrito.push(idProd);
                    sessionStorage.carrito= JSON.stringify(arrayCarrito);
                    //Sonido de cesta
                    document.getElementsByTagName("audio")[0].play();
                }
            }
            comprobarProductos();
        });
    }
}
function buscarIDCarrito(id){
    var carritoIds = JSON.parse(sessionStorage.carrito);
    var esRepetido = false;
    for (let i = 0; i < carritoIds.length && !esRepetido; i++) {
        if(carritoIds[i]==id){
            esRepetido = true;
        }
        
    }
    return esRepetido;
}

function comprar(){
    document.getElementById("pagar").addEventListener("click", function(){
        animacionCarga();
        var envio = document.getElementById("envio");
        var prEnvio;
        switch (envio.value){
            case "1": prEnvio = 5; break;
            case "2": prEnvio = 3.5; break;
            case "3": prEnvio = 0; break;
            default:alert("error");
        }
        sessionStorage.envio = prEnvio;
        setTimeout( function() { window.location.href = "bill.html"; }, 2000 );
    })
}
/**
 * Animación mouseover/mouseout de los artículos del escaparate
 */
function animacionArticulos(){
    var articulos = document.getElementsByClassName("articulo");
    for (let i = 0; i < articulos.length; i++) {
        articulos[i].addEventListener("mouseover", function () {
            articulos[i].children[0].classList.add("activo");
            articulos[i].children[1].classList.add("activo");
            articulos[i].children[2].classList.add("activo");
            articulos[i].children[1].classList.remove("invisible");
            articulos[i].children[2].classList.remove("invisible");
        });
        articulos[i].addEventListener("mouseout", function () {
            articulos[i].children[0].classList.remove("activo");
            articulos[i].children[1].classList.remove("activo");
            articulos[i].children[2].classList.remove("activo");
            articulos[i].children[1].classList.add("invisible");
            articulos[i].children[2].classList.add("invisible");
        })
        
    }
}
function cargarFactura(){
    var numArticulos = document.getElementById("cantidadArt");
    var precioTot = document.getElementById("precioTot");
    var precioFin = document.getElementById("precioFin");
    var listProducto = document.getElementById("listProducto");
    var idCesta = JSON.parse(sessionStorage.carrito);
    var precioTotal = 0;
    var articulos= "";
    document.getElementById("nomFac").innerHTML+= " de "+sessionStorage.usuario;

    //Búsqueda, creación del artículo y conteo del precio
    for (let i = 0; i < idCesta.length; i++) {
        var articulo = obtenerporID(idCesta[i]);
        articulos += crearProductoCesta(articulo["url"],articulo["tipo"],articulo["alt"],articulo["precio"],articulo["id"]);
        precioTotal += parseFloat(articulo["precio"]);
    }

    //Productos
    numArticulos.textContent = idCesta.length + " artículos.";
    listProducto.innerHTML = articulos;

    //Desglose
    precioTot.textContent = Number.parseFloat(precioTotal).toFixed(2)+" €";
    var prEnvio = parseFloat(sessionStorage.envio);
    document.getElementById("envio").textContent= "ENVÍO - "+prEnvio+"€";
    precioFin.textContent = Number.parseFloat(precioTotal+prEnvio).toFixed(2)+" €";
    
    document.getElementById("imprimir").addEventListener("click",function(){
        window.print(); 
    });
}

function animacionCarga(){
    document.body.style.overflowY = "hidden";
    document.getElementById("logo").classList.add("carga");
    document.getElementById("cajaHeader").classList.add("carga");
    document.getElementById("main").classList.add("carga");
    document.getElementById("footer").classList.add("carga");
    document.getElementById("inicioSes").classList.add("carga");
    document.getElementById("carrito").classList.add("carga");
    scroll(0,0);
    document.getElementById("carga").classList.remove("invisible");
}

function cargaInicial(){
    animacionCarga();
    setTimeout( function() {  
    document.body.style.overflowY = "scroll";
    document.getElementById("carga").classList.add("invisible");
    document.getElementById("logo").classList.remove("carga");
    document.getElementById("logo").classList.remove("invisible");
    document.getElementById("cajaHeader").classList.remove("carga");
    document.getElementById("cajaHeader").classList.remove("invisible");
    document.getElementById("main").classList.remove("carga");
    document.getElementById("main").classList.remove("invisible");
    document.getElementById("footer").classList.remove("carga");
    document.getElementById("footer").classList.remove("invisible");
    document.getElementById("inicioSes").classList.remove("carga");
    document.getElementById("carrito").classList.remove("carga");
}, 2000 );
}