const socket = io()

const productsDiv = document.getElementById("products")
const productsHandlebarsDiv = document.getElementById("productsHandlebars")

productsDiv.addEventListener("click", (e)=>{

    if(e.target.tagName === "BUTTON"){

        let productId = e.target.dataset.productid

        console.log(productId)

        socket.emit("deleteProductFromCart", productId)

    }
})

socket.on("getProductsFromCart", (data)=>{

    if(productsHandlebarsDiv){
        productsHandlebarsDiv.remove()
    }

    productsDiv.innerHTML = ""

    for(const product of data){

        let productCard = document.createElement("div")

        productCard.innerHTML = `<div class="card">
        <span>titulo: ${product.product.title}</span>
        <span>descripcion: ${product.product.description}</span>
        <span>precio: $ ${product.product.price}</span>
        <span>categoria: ${product.product.category}</span>
        <span>thumbnails: ${product.product.thumbnails}</span>
        <span>id: ${product.product._id}</span>
        <span> quantity: ${product.quantity}</span>
        <button class="button-delete" data-productid=${product.product._id}>X</button>
    </div>`

        productsDiv.appendChild(productCard)
    }
    
    if(data.length == 0){
        productsDiv.innerHTML = `<div class="carrito-vacio">
        <h1>CARRITO VACÍO</h1>
        <a href="http://localhost:8080/products">volver a productos</a>
    </div>`
    }

    
})