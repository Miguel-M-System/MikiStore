const API_URL = "https://6aff25277fc363ccff08e630.mockapi.io/productos";
const CATEGORIAS_URL = "https://6aff25277fc363ccff08e630.mockapi.io/categorias";
const USUARIO = "admin";
const CLAVE = "1234";
const $ = (id) => document.getElementById(id);

let productos = [];

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

function iniciarSesion() {
  const usuario = $("usuario").value.trim();
  const clave = $("clave").value;

  if (usuario === USUARIO && clave === CLAVE) {
    sessionStorage.setItem("logueado", "si");
    verificarSesion();
  } else {
    alert("Usuario o contraseña incorrectos.");
  }
}

function cerrarSesion() {
  sessionStorage.removeItem("logueado");
  $("usuario").value = "";
  $("clave").value = "";
  verificarSesion();
}

function verificarSesion() {
  const logueado = sessionStorage.getItem("logueado") === "si";
  $("seccionLogin").classList.toggle("d-none", logueado);
  $("seccionPanel").classList.toggle("d-none", !logueado);
  $("btnCerrarSesion").classList.toggle("d-none", !logueado);

  if (logueado) {
    cargarCategorias();
    cargarProductos();
  }
}

async function cargarCategorias() {
  try {
    const respuesta = await fetch(CATEGORIAS_URL);
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);
    const categorias = await respuesta.json();
    $("categoria").innerHTML = categorias
      .map((c) => `<option value="${c.nombre}">${c.nombre}</option>`)
      .join("");
  } catch (error) {
    alert("No se pudieron cargar las categorías: " + error.message);
  }
}

async function cargarProductos() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);
    productos = await respuesta.json();
    mostrarTabla();
  } catch (error) {
    alert("No se pudieron cargar los productos: " + error.message);
  }
}

function mostrarTabla() {
  const tabla = $("tablaProductos");

  if (productos.length === 0) {
    tabla.innerHTML = '<tr><td colspan="4" class="text-center text-body-secondary">Todavía no hay productos.</td></tr>';
    return;
  }

  tabla.innerHTML = "";
  productos.forEach((p) => {
    tabla.innerHTML += `
      <tr>
        <td>
          <strong>${p.nombre}</strong><br>
          <small class="text-body-secondary">${p.categoria}</small>
        </td>
        <td>Bs ${Number(p.precio).toFixed(2)}</td>
        <td>${p.stock}</td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-warning" onclick="editarProducto('${p.id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${p.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
}

async function guardarProducto() {
  const id = $("id").value;
  const nombre = $("nombre").value.trim();
  const precio = $("precio").value;
  const stock = $("stock").value;

  if (nombre === "" || precio === "" || stock === "") {
    alert("Completa el nombre, el precio y el stock.");
    return;
  }
  if (Number(precio) < 0 || Number(stock) < 0) {
    alert("El precio y el stock no pueden ser negativos.");
    return;
  }

  const producto = {
    nombre: nombre,
    descripcion: $("descripcion").value.trim(),
    precio: Number(precio),
    stock: Number(stock),
    categoria: $("categoria").value,
    imagen: $("imagen").value.trim() || "https://placehold.co/400x300?text=" + encodeURIComponent(nombre)
  };

  try {
    const url = id ? `${API_URL}/${id}` : API_URL;
    const metodo = id ? "PUT" : "POST";
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto)
    });
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    alert(id ? "Producto actualizado." : "Producto creado.");
    limpiarFormulario();
    cargarProductos();
  } catch (error) {
    alert("No se pudo guardar el producto: " + error.message);
  }
}

function editarProducto(id) {
  const p = productos.find((producto) => producto.id === id);

  $("id").value = p.id;
  $("nombre").value = p.nombre;
  $("descripcion").value = p.descripcion;
  $("precio").value = p.precio;
  $("stock").value = p.stock;
  $("categoria").value = p.categoria;
  $("imagen").value = p.imagen;
  $("tituloFormulario").textContent = "Editar producto";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminarProducto(id) {
  const p = productos.find((producto) => producto.id === id);
  if (!confirm(`¿Seguro que quieres eliminar "${p.nombre}"?`)) return;

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);
    alert("Producto eliminado.");
    cargarProductos();
  } catch (error) {
    alert("No se pudo eliminar el producto: " + error.message);
  }
}

function limpiarFormulario() {
  $("id").value = "";
  $("nombre").value = "";
  $("descripcion").value = "";
  $("precio").value = "";
  $("stock").value = "";
  $("imagen").value = "";
  $("categoria").selectedIndex = 0;
  $("tituloFormulario").textContent = "Nuevo producto";
}

aplicarTema(localStorage.getItem("tema") || "light");
verificarSesion();
