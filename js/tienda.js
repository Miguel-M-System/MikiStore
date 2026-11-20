const API_URL = "https://6aff25277fc363ccff08e630.mockapi.io/productos";
const $ = (id) => document.getElementById(id);

let productos = [];

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-bs-theme", tema);
  $("btnTema").textContent = tema === "dark" ? "☀️" : "🌙";
}

function cambiarTema() {
  const temaActual = document.documentElement.getAttribute("data-bs-theme");
  const nuevoTema = temaActual === "dark" ? "light" : "dark";
  localStorage.setItem("tema", nuevoTema);
  aplicarTema(nuevoTema);
}

async function cargarProductos() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);
    productos = await respuesta.json();
    mostrarProductos();
  } catch (error) {
    alert("No se pudieron cargar los productos: " + error.message);
  }
}

function mostrarProductos() {
  const contenedor = $("listaProductos");

  if (productos.length === 0) {
    contenedor.innerHTML = '<p class="text-body-secondary">Todavía no hay productos.</p>';
    return;
  }

  contenedor.innerHTML = "";
  productos.forEach((p) => {
    const agotado = p.stock <= 0;
    contenedor.innerHTML += `
      <div class="col">
        <div class="card h-100 producto-card">
          <img src="${p.imagen}" class="card-img-top producto-img" alt="${p.nombre}">
          <div class="card-body d-flex flex-column">
            <span class="badge text-bg-primary align-self-start mb-2">${p.categoria}</span>
            <h5 class="card-title">${p.nombre}</h5>
            <p class="card-text small text-body-secondary">${p.descripcion}</p>
            <p class="fs-5 fw-bold mb-1">Bs ${Number(p.precio).toFixed(2)}</p>
            <p class="small mb-3">Stock: ${p.stock}</p>
            <button class="btn ${agotado ? "btn-secondary" : "btn-primary"} mt-auto"
                    onclick="agregarAlCarrito('${p.id}')" ${agotado ? "disabled" : ""}>
              ${agotado ? "Agotado" : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>`;
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  const item = carrito.find((i) => i.id === id);
  const cantidadActual = item ? item.cantidad : 0;

  if (cantidadActual + 1 > producto.stock) {
    alert("No hay más stock disponible de " + producto.nombre + ".");
    return;
  }

  if (item) {
    item.cantidad++;
  } else {
    carrito.push({ id: producto.id, nombre: producto.nombre, precio: Number(producto.precio), cantidad: 1 });
  }
  guardarCarrito();
}

function quitarDelCarrito(id) {
  carrito = carrito.filter((i) => i.id !== id);
  guardarCarrito();
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarCarrito();
}

function mostrarCarrito() {
  const lista = $("listaCarrito");
  let total = 0;
  lista.innerHTML = "";

  if (carrito.length === 0) {
    lista.innerHTML = '<li class="list-group-item text-body-secondary">El carrito está vacío.</li>';
  }

  carrito.forEach((item) => {
    total += item.precio * item.cantidad;
    lista.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${item.nombre} x ${item.cantidad}</span>
        <button class="btn btn-sm btn-outline-danger" onclick="quitarDelCarrito('${item.id}')">✕</button>
      </li>`;
  });

  $("totalCarrito").textContent = "Bs " + total.toFixed(2);
}

async function comprar() {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  try {
    const productosActuales = [];
    for (const item of carrito) {
      const respuesta = await fetch(`${API_URL}/${item.id}`);
      if (!respuesta.ok) throw new Error("Error " + respuesta.status);
      const producto = await respuesta.json();

      if (producto.stock < item.cantidad) {
        alert(`No hay stock suficiente de ${producto.nombre}. Disponible: ${producto.stock}.`);
        return;
      }
      producto.stock = producto.stock - item.cantidad;
      productosActuales.push(producto);
    }

    for (const producto of productosActuales) {
      const respuesta = await fetch(`${API_URL}/${producto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto)
      });
      if (!respuesta.ok) throw new Error("Error " + respuesta.status);
    }

    alert("¡Compra realizada con éxito! Gracias por comprar en MikiStore.");
    carrito = [];
    guardarCarrito();
    cargarProductos();
  } catch (error) {
    alert("No se pudo completar la compra: " + error.message);
  }
}

aplicarTema(localStorage.getItem("tema") || "light");
$("anio").textContent = new Date().getFullYear();
mostrarCarrito();
cargarProductos();
