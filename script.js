// 🔥 URL base de tu backend
// backend en Render
const BASE_URL = "https://backend-ti9b.onrender.com";

// 🔥 Helper universal para imágenes
function getImageUrl(imagePath) {
    if (!imagePath) {
        return 'https://placehold.co/300x300?text=Sin+imagen';
    }

    // Si ya es URL completa, devolverla
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Limpiar espacios
    let ruta = imagePath.trim();

    // Asegurar que tenga /
    if (!ruta.startsWith('/')) {
        ruta = '/' + ruta;
    }

    // IMPORTANTE: tu backend sirve imágenes desde /uploads
    return `${BASE_URL}/uploads${ruta}`;
}




// script.js
function normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
// Datos de Productos (8 por categoría, con placeholders para imágenes) img/baterias/hpp-ht03.jpg
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}



let products = [];


async function cargarProductos() {
    try {
        const res = await fetch(`${BASE_URL}/api/productos`);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        products = await res.json();

        console.log('Productos cargados:', products.length, 'ítems');

        if (document.getElementById('productsSection')) {
            displayProducts(products);
        }

        initDynamicMenu();

    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}




updateCart();

// Mostrar productos en la página principal
function displayProducts(filteredProducts = products) {
    const section = document.getElementById('productsSection');
    if (!section) return;

    section.innerHTML = '';

    if (filteredProducts.length === 0) {
        section.innerHTML = `
            <p style="text-align:center; padding:4rem; font-size:1.4rem; color:#666;">
                No hay productos para mostrar
            </p>`;
        return;
    }

    const categorias = [...new Set(filteredProducts.map(p => p.category))];

    categorias.forEach(categoria => {

        const productosCategoria = filteredProducts.filter(p => p.category === categoria);

        const banner = document.createElement('div');
        banner.className = 'category-banner';
        banner.textContent =
            categoria.charAt(0).toUpperCase() +
            categoria.slice(1).replace(/-/g, ' ');
        section.appendChild(banner);

        const contenedor = document.createElement('div');
        contenedor.className = 'products';
        section.appendChild(contenedor);

        productosCategoria.forEach(product => {

            const card = document.createElement('div');
            card.classList.add('product-card');

            // ✅ USAR helper
            const imageUrl = getImageUrl(product.imagen);

            card.innerHTML = `
                <div class="image-wrapper">
                    <img loading="lazy"
                         src="${imageUrl}"
                         alt="${product.name || 'Producto'}"
                         onerror="this.src='https://via.placeholder.com/300?text=?'">
                </div>

                <div class="card-content">
                    <h3>${product.name || 'Sin nombre'}</h3>
                    <p class="sku">SKU: ${product.sku || 'Sin SKU'}</p>
                    <p class="price">${product.price ? product.price + ' USD' : '—'}</p>

                    <button onclick="event.stopPropagation(); addToCart(${product.id});">
                        Añadir al Carrito
                    </button>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                if (product.id) {
                    window.location.href = `product.html?id=${product.id}`;
                }
            });

            contenedor.appendChild(card);
        });

    });
}



function showProductDetails(idFromUrl) {
    const id = Number(idFromUrl);

    if (isNaN(id)) {
        showErrorProducto("ID de producto inválido");
        return;
    }

    if (!products || products.length === 0) {
        console.warn("Productos aún no cargados. Reintentando...");
        setTimeout(() => showProductDetails(idFromUrl), 800);
        return;
    }

    const product = products.find(p => Number(p.id) === id);

    if (!product) {
        console.error("Producto no encontrado:", id);
        showErrorProducto(`Producto con ID ${id} no encontrado`);
        return;
    }

 // ── IMAGEN PRINCIPAL (con modal fresco) ───────────────────────────────────────
const imgEl = document.getElementById('productImage');
if (imgEl) {
    imgEl.src = getImageUrl(product.imagen);
    imgEl.alt = product.name || 'Producto sin imagen';
    imgEl.onerror = () => {
        imgEl.src = 'https://placehold.co/500x500?text=Imagen+no+disponible';
    };

    // Hacerla clickable
    imgEl.style.cursor = 'zoom-in';
    imgEl.onclick = function() {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        
        modalImg.src = this.src;
        
        // Mostramos y activamos animación
        modal.style.display = "block";
        setTimeout(() => {
            modal.classList.add('active');
        }, 20); // pequeño retraso para que la transición funcione
    };
}
// Botón WhatsApp por producto específico
const whatsappLink = document.getElementById('whatsappProductLink');
if (whatsappLink && product) {
    const productName = product.name || 'este producto';
    const message = encodeURIComponent(`Hola! Estoy interesado en ${productName}. ¿Me puedes dar más info?`);
    whatsappLink.href = `https://wa.me/933488495?text=${message}`;
}
    // ── TÍTULO ───────────────────────────────────────
    const titleEl = document.getElementById('productTitle');
    if (titleEl) titleEl.textContent = product.name || 'Sin nombre';

    // ── PRECIO ───────────────────────────────────────
    const priceEl = document.getElementById('productPrice');
    if (priceEl) {
        priceEl.textContent = product.price ? `${product.price} USD` : 'Precio no disponible';
    }

    // ── SOLO DESCRIPCIÓN ───────────────────────────────────────
    const specsContainer = document.getElementById('productSpecs');
    if (specsContainer) {
        const desc = product.description || product.descripcion || 'No hay descripción disponible para este producto.';
        specsContainer.innerHTML = `<p>${desc}</p>`;
    }

    // ── PRODUCTOS RECOMENDADOS ───────────────────────────────────────
    const recContainer = document.getElementById('recommendedProducts');
    if (recContainer) {
        recContainer.innerHTML = '';
        const recommended = products
            .filter(p => p.category === product.category && Number(p.id) !== id)
            .slice(0, 6);

        recommended.forEach(rec => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            card.innerHTML = `
                <div class="image-wrapper">
                    <img src="${getImageUrl(rec.imagen) || 'https://via.placeholder.com/220?text=?'}"
                         alt="${rec.name}"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/220?text=?'">
                </div>
                <div class="card-content">
                    <h3>${rec.name}</h3>
                    <p class="price">${rec.price ? rec.price + ' USD' : '—'}</p>
                </div>
            `;
            card.onclick = () => window.location.href = `product.html?id=${rec.id}`;
            recContainer.appendChild(card);
        });
    }
}

// Variable para controlar si el mouse está en el submenu
let isMouseInSubmenu = false;

// ============================================
// FUNCIONES DEL MENÚ (VERSIÓN MEJORADA - COLUMNAS DINÁMICAS)
// ============================================

let hideTimer = null;

function showSubmenu(category) {
    cancelHideTimer();

    const submenu = document.getElementById('submenu');
    if (!submenu) return;

    // Esperar productos si aún no cargan
    if (!products || products.length === 0) {
        console.warn("Productos no cargados aún. Reintentando...");
        setTimeout(() => showSubmenu(category), 300);
        return;
    }

    // Limpiar contenido anterior
    submenu.innerHTML = "";
    submenu.removeAttribute("style");
    submenu.classList.add("active");

    /* =========================================================
       CASO: TODAS LAS CATEGORÍAS (EDITADO)
    ========================================================= */
    if (category === "all") {

    const allCategories = [...new Set(products.map(p => p.category))];

    if (allCategories.length === 0) {
        submenu.innerHTML = `
            <p style="text-align:center; color:#aaa; padding:20px;">
                No hay categorías disponibles.
            </p>
        `;
        return;
    }

    // 🔥 Contenedor principal en 2 columnas
    const wrapper = document.createElement("div");
    wrapper.className = "all-mega-wrapper";
    submenu.appendChild(wrapper);

    // COLUMNA IZQUIERDA (categorías)
    const left = document.createElement("div");
    left.className = "all-mega-left";
    wrapper.appendChild(left);

    const ul = document.createElement("ul");
    ul.className = "all-mega-list";
    left.appendChild(ul);

    // COLUMNA DERECHA (productos dinámicos)
    const right = document.createElement("div");
    right.className = "all-mega-right";
    wrapper.appendChild(right);

    allCategories.forEach(cat => {

        const displayCat =
            cat.charAt(0).toUpperCase() +
            cat.slice(1).replace(/-/g, " ");

        const li = document.createElement("li");
        li.textContent = displayCat;

        li.onmouseenter = () => {

            const categoryProducts = products.filter(
                p => normalizeString(p.category) === normalizeString(cat)
            );

            right.innerHTML = "";

            if (categoryProducts.length === 0) {
                right.innerHTML = `
                    <p style="color:#aaa;">No hay productos en esta categoría.</p>
                `;
                return;
            }

            const productsGrid = document.createElement("div");
            productsGrid.className = "all-mega-products";
            right.appendChild(productsGrid);

            categoryProducts.forEach(product => {

                const item = document.createElement("div");
                item.className = "all-mega-product-item";
                item.textContent = cleanProductName(product.name);

                item.onclick = () => {
                    window.location.href = `product.html?id=${product.id}`;
                };

                productsGrid.appendChild(item);
            });
        };

        ul.appendChild(li);
    });

    return;
}


    /* =========================================================
       CASO: CATEGORÍA NORMAL (NO SE TOCA)
    ========================================================= */

    const categoryProducts = products.filter(
        p => normalizeString(p.category) === normalizeString(category)
    );

    if (categoryProducts.length === 0) {
        submenu.innerHTML = `
            <p style="text-align:center; color:#aaa; padding:20px;">
                No hay productos en esta categoría aún.
            </p>
        `;
        return;
    }

    const header = document.createElement("div");
    header.className = "submenu-header";
    header.innerHTML = `
        <h3 class="submenu-title">
            ${getCategoryDisplayName(category)}
        </h3>
        <p class="submenu-subtitle">
            ${categoryProducts.length} productos en stock •
            
        </p>
    `;
    submenu.appendChild(header);

    const columnsContainer = document.createElement("div");
    columnsContainer.className = "submenu-columns-container";
    submenu.appendChild(columnsContainer);

    let columns = 1;
    if (categoryProducts.length > 12) columns = 4;
    else if (categoryProducts.length > 8) columns = 3;
    else if (categoryProducts.length > 4) columns = 2;

    for (let i = 0; i < columns; i++) {
        const column = document.createElement("div");
        column.className = "submenu-column";

        const ul = document.createElement("ul");
        ul.className = "submenu-list";

        column.appendChild(ul);
        columnsContainer.appendChild(column);
    }

    const columnLists = columnsContainer.querySelectorAll(".submenu-list");
    const productsPerColumn = Math.ceil(categoryProducts.length / columns);

    columnLists.forEach((ul, colIndex) => {
        const start = colIndex * productsPerColumn;
        const end = start + productsPerColumn;

        categoryProducts.slice(start, end).forEach(product => {

            const cleanName = cleanProductName(product.name);

            const li = document.createElement("li");
            li.className = "submenu-product-item";

            li.innerHTML = `
                <div class="product-content">
                    <div class="product-name" title="${escapeHtml(product.name)}">
                        ${escapeHtml(cleanName)}
                    </div>
                    <div class="product-action">
                        
                    </div>
                </div>
            `;

            li.onclick = (e) => {
                e.stopPropagation();
                window.location.href = `product.html?id=${product.id}`;
            };

            ul.appendChild(li);
        });
    });
}



// FUNCIONES AUXILIARES
function getCategoryDisplayName(category) {
    const names = {
        'discos': '💾 DISCOS DUROS & SSD',
        'mouses': '🖱️ MOUSES',
        'teclados-mouses': '⌨️🖱️ COMBOS',
        'teclados': '⌨️ TECLADOS',
        'adaptadores': '🔌 ADAPTADORES',
        'baterias': '🔋 BATERÍAS',
        'cargadores': '⚡ CARGADORES',
        'impresoras': '🖨️ IMPRESORAS'
    };
    return names[category] || category.toUpperCase();
}

function extractBrandFromName(name) {
    const brands = ['Toshiba', 'Kingston', 'Western Digital', 'WD', 'Dahua', 'Epson', 'HP', 'Canon', 'Samsung', 'Seagate', 'Kingston', 'Crucial', 'Sandisk'];
    for (const brand of brands) {
        if (name.toLowerCase().includes(brand.toLowerCase())) {
            return brand;
        }
    }
    return '';
}

function extractSpecsFromName(name) {
    // Extraer especificaciones técnicas como 1TB, 240GB, 500GB, etc.
    const specRegex = /\b(\d+(?:\.\d+)?\s*(?:TB|GB|MB|GHz|MHz|MP|"|px|k|GB))\b/gi;
    const matches = name.match(specRegex);
    
    if (matches && matches.length > 0) {
        // Tomar la primera especificación encontrada
        return matches[0].toUpperCase();
    }
    
    // Buscar patrones comunes de capacidad
    const capacityMatch = name.match(/\b(\d+)\s*(?:tb|gb|mb)\b/i);
    if (capacityMatch) {
        return capacityMatch[0].toUpperCase();
    }
    
    return '';
}

function cleanProductName(fullName) {
    let name = fullName || '';

    // Quitar marcas conocidas
    name = name.replace(/\b(Toshiba|Kingston|Western Digital|WD|Dahua|Epson|HP|Canon|Samsung|Seagate|Crucial|Sandisk)\b/gi, '');

    // Quitar capacidades comunes
    name = name.replace(/\b\d+\.?\d*\s?(TB|GB|MB|Wh|V|A)\b/gi, '');

    // Limpiar espacios y caracteres sobrantes
    name = name.replace(/\s+/g, ' ').trim();
    name = name.replace(/^[-–]\s*|\s*[-,]$/g, '');

    // Acortar si es muy largo
    if (name.length > 80) {
        name = name.substring(0, 77) + '...';
    }

    // Si después de limpiar queda vacío → devolver original
    return name.length >= 3 ? name : fullName;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function adjustSubmenuSize(submenu, columns, productCount) {
    if (!submenu) return;
    
    const viewportWidth = window.innerWidth;
    const columnWidth = 280; // Ancho base por columna
    const gap = 30; // Espacio entre columnas
    const padding = 80; // Padding izquierdo + derecho
    
    // Calcular ancho total
    let totalWidth = (columnWidth * columns) + (gap * (columns - 1)) + padding;
    
    // Ajustes especiales para pocos productos
    if (productCount < 6 && columns > 1) {
        // Para pocos productos, hacer más compacto
        totalWidth = Math.max(totalWidth, 700);
    }
    
    // Limitar al 92% del viewport
    const maxWidth = viewportWidth * 0.92;
    totalWidth = Math.min(totalWidth, maxWidth);
    
    // También asegurar un mínimo razonable
    const minWidth = 600;
    totalWidth = Math.max(totalWidth, minWidth);
    
    // Aplicar dimensiones
    submenu.style.width = `${totalWidth}px`;
    submenu.style.minWidth = `${minWidth}px`;
    submenu.style.maxWidth = `${maxWidth}px`;
}

function cancelHideTimer() {
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
}

function startHideTimer() {
    cancelHideTimer();
    hideTimer = setTimeout(() => {
        const submenu = document.getElementById('submenu');
        if (submenu) {
            submenu.style.display = 'none';
        }
    }, 200);
}

// Función adicional para manejar redimensionamiento de ventana
window.addEventListener('resize', function() {
    const submenu = document.getElementById('submenu');
    if (submenu && submenu.style.display === 'block') {
        // Recalcular tamaño si el submenú está visible
        const category = document.querySelector('.submenu-title')?.textContent;
        if (category) {
            // Encontrar la categoría actual basada en el título
            const categoryMap = {
                '💾 DISCOS DUROS & SSD': 'discos',
                '🖱️ MOUSES': 'mouses',
                '⌨️🖱️ COMBOS': 'teclados-mouses',
                '⌨️ TECLADOS': 'teclados',
                '🔌 ADAPTADORES': 'adaptadores',
                '🔋 BATERÍAS': 'baterias',
                '⚡ CARGADORES': 'cargadores',
                '🖨️ IMPRESORAS': 'impresoras'
            };
            
            const currentCategory = categoryMap[category] || category.toLowerCase();
            // Recargar el submenú con el nuevo tamaño
            setTimeout(() => showSubmenu(currentCategory), 100);
        }
    }
});

// ============================================
// FUNCIONES DEL CARRITO
// ============================================

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const cart = getCart(); // Usar la función getCart

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            checked: true
        });
    }

    saveCart(cart); // Guardar carrito real
    updateCart();   // Actualizar contador
}

// Función para renderizar carrito
function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        cartItems.innerHTML = '';
        const currentCart = getCart(); // 🔥 OBTENER CARRITO ACTUAL
        currentCart.forEach((item, index) => {
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleCheck(${index})">
                <img src="${getImageUrl(item.imagen)}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-price">${item.price} USD c/u</p>
                    <div class="cart-item-quantity">
                        Cantidad: <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">
                    </div>
                    <p class="cart-item-subtotal">Subtotal: ${item.price * item.quantity} USD</p>
                </div>
                <div class="cart-item-actions">
                    <button onclick="removeFromCart(${index})">Eliminar</button>
                </div>
            `;
            cartItems.appendChild(div);
        });
        updateCartTotal();
    }
}

// Nueva función para actualizar cantidad
function updateQuantity(index, newQuantity) {
    const cart = getCart(); // 🔥 OBTENER CARRITO
    cart[index].quantity = parseInt(newQuantity) || 1;
    saveCart(cart);
    renderCartItems();
    updateCart();
}

function toggleCheck(index) {
    const cart = getCart(); // 🔥 OBTENER CARRITO
    cart[index].checked = !cart[index].checked;
    updateCartTotal();
    saveCart(cart);
}

function removeFromCart(index) {
    const cart = getCart(); // 🔥 OBTENER CARRITO
    cart.splice(index, 1);
    saveCart(cart);
    updateCart();
    renderCartItems();
}

function updateCart() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;

    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartCountElement.textContent = totalItems;
}

function updateCartTotal() {
    const cartTotalElement = document.getElementById('cartTotal');
    if (cartTotalElement) {
        const cart = getCart(); // 🔥 OBTENER CARRITO
        const total = cart.reduce((sum, item) => item.checked ? sum + (item.price * item.quantity) : sum, 0);
        cartTotalElement.textContent = total;
    }
}

function checkout() {
    const cart = getCart(); // 🔥 OBTENER CARRITO
    const checkedItems = cart.filter(item => item.checked);
    if (checkedItems.length === 0) return alert('No hay productos seleccionados.');

    const productList = checkedItems.map(item => `${item.name} x${item.quantity}`).join(', ');
    const total = checkedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const message = `Hola, deseo más información sobre estos productos - (${productList}) y el valor de los productos: ${total} USD`;
    const whatsappUrl = `https://wa.me/915211111?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// ============================================
// FUNCIONES PARA INICIALIZAR MENÚ DINÁMICO
// ============================================

function initDynamicMenu() {
    const menuItems = document.querySelectorAll('#categoryMenu li[data-category]');
    const submenu = document.getElementById('submenu');
    
    if (!submenu || menuItems.length === 0) return;
    
    // Agregar eventos a cada item del menú
    menuItems.forEach(item => {
        const category = item.dataset.category;
        
        // Click para redirigir
        item.addEventListener('click', () => {
            window.location.href = `category.html?cat=${category}`;
        });
        
        // Mouseover para mostrar submenú
        item.addEventListener('mouseenter', () => {
            showSubmenu(category);
        });
        
        // Mouseout para ocultar
        item.addEventListener('mouseleave', startHideTimer);
    });
    
    // Eventos para el submenú
    if (submenu) {
        submenu.addEventListener('mouseenter', cancelHideTimer);
        submenu.addEventListener('mouseleave', startHideTimer);
    }
    
    console.log('Menú dinámico inicializado');
}

function initHeaderAfterLoad() {
    // Esta función es llamada por las páginas después de cargar header.html
    setTimeout(() => {
        const menuItems = document.querySelectorAll('#categoryMenu li[data-category]');
        const submenu = document.getElementById('submenu');
        
        if (menuItems.length === 0 || !submenu) {
            console.log('No se encontraron elementos del menú para inicializar');
            return;
        }
        
        // Agregar eventos si no los tienen
        menuItems.forEach(item => {
            if (!item.hasAttribute('data-events-bound')) {
                const category = item.dataset.category;
                
                // Click
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.location.href = `category.html?cat=${category}`;
                });
                
                // Mouseover
                item.addEventListener('mouseenter', () => {
                    if (typeof showSubmenu === 'function') {
                        showSubmenu(category);
                    }
                });
                
                // Mouseout
                item.addEventListener('mouseleave', () => {
                    if (typeof startHideTimer === 'function') {
                        startHideTimer();
                    }
                });
                
                item.setAttribute('data-events-bound', 'true');
            }
        });
        
        // Submenu events
        if (!submenu.hasAttribute('data-events-bound')) {
            submenu.addEventListener('mouseenter', () => {
                if (typeof cancelHideTimer === 'function') {
                    cancelHideTimer();
                }
            });
            
            submenu.addEventListener('mouseleave', () => {
                if (typeof startHideTimer === 'function') {
                    startHideTimer();
                }
            });
            
            submenu.setAttribute('data-events-bound', 'true');
        }
        
        console.log('Menú inicializado con initHeaderAfterLoad');
    }, 100);
}

// ============================================
// CARRUSEL Y OTRAS FUNCIONES
// ============================================

// Slider (si existe)
let slideIndex = 0;
let slides = [];

function nextSlide() {
    if (slides.length === 0) {
        slides = document.getElementById('slides')?.children || [];
    }
    slideIndex = (slideIndex + 1) % slides.length;
    const slidesElement = document.getElementById('slides');
    if (slidesElement) {
        slidesElement.style.transform = `translateX(-${slideIndex * 100}%)`;
    }
}

function prevSlide() {
    if (slides.length === 0) {
        slides = document.getElementById('slides')?.children || [];
    }
    slideIndex = (slideIndex - 1 + slides.length) % slides.length;
    const slidesElement = document.getElementById('slides');
    if (slidesElement) {
        slidesElement.style.transform = `translateX(-${slideIndex * 100}%)`;
    }
}

// Carrusel de anuncios
// Variables globales del carrusel
let currentSlide = 0;
let totalSlides = 0;  // lo actualizamos dinámicamente

const track = document.getElementById('horizontalAdsTrack');
const indicatorsContainer = document.getElementById('horizontalAdsIndicators');

// Función para actualizar el carrusel (posición y puntos)
function updateCarousel() {
    if (!track) return;

    // Recalcular el ancho real cada vez (por si cambia el tamaño de ventana)
    const slideWidth = track.querySelector('.carousel-slide')?.offsetWidth || window.innerWidth;

    track.style.transform = `translateX(-${currentSlide * 100}%)`;  // Mejor usar % para responsive

    // Actualizar puntos
    const dots = indicatorsContainer.querySelectorAll('.carousel-dot, .carousel-indicator');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

// Función para mover (izquierda/derecha)
function moveHorizontalAds(direction) {
    totalSlides = document.querySelectorAll('.carousel-slide').length;
    if (totalSlides === 0) return;

    currentSlide += direction;

    if (currentSlide >= totalSlides) currentSlide = 0;
    if (currentSlide < 0) currentSlide = totalSlides - 1;

    updateCarousel();
}

// Función para inicializar o reiniciar indicadores
function initOrUpdateIndicators() {
    if (!indicatorsContainer) return;

    indicatorsContainer.innerHTML = ''; // limpiar

    const slides = document.querySelectorAll('.carousel-slide');
    totalSlides = slides.length;

    if (totalSlides === 0) return;

    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'carousel-dot'; // usa el mismo class que en CSS
        dot.onclick = () => {
            currentSlide = index;
            updateCarousel();
        };
        if (index === 0) dot.classList.add('active');
        indicatorsContainer.appendChild(dot);
    });

    currentSlide = 0; // reset a la primera
    updateCarousel();
}

// ────────────────────────────────────────────────
// Integrar con cargarAnuncios()  ← ¡esto es clave!
async function cargarAnuncios() {
    try {
        const res = await fetch(`${BASE_URL}/api/anuncios`);
        if (!res.ok) throw new Error('Error al cargar anuncios');

        const anuncios = await res.json();
        const track = document.getElementById('horizontalAdsTrack');
        if (!track) return;

        track.innerHTML = '';

        anuncios.forEach(anuncio => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `
                <a href="${anuncio.enlace || '#'}" target="_blank">
                    <img src="${getImageUrl(anuncio.imagen_url)}"
                         alt="${anuncio.titulo || 'Anuncio'}"
                         loading="lazy"
                         onerror="this.src='https://placehold.co/728x90?text=Anuncio+no+disponible'">
                </a>
            `;
            track.appendChild(slide);
        });

        initOrUpdateIndicators();

        console.log(`Carrusel actualizado con ${anuncios.length} anuncios`);

    } catch (err) {
        console.error('Error cargando anuncios:', err);
    }
}


// Llamar a cargarAnuncios al inicio (ya lo tienes)
document.addEventListener('DOMContentLoaded', () => {
    cargarAnuncios();
    
    setInterval(() => moveHorizontalAds(1), 5000);
});

// ============================================
// BÚSQUEDA
// ============================================

// ============================================
// INICIALIZACIÓN PRINCIPAL (único bloque DOMContentLoaded recomendado)
// ============================================


// Función separada para la lógica de búsqueda (puedes ponerla donde prefieras en el archivo)
function initSearchSuggestions() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('searchSuggestions');

    if (!searchInput || !suggestionsContainer) return;

    // 🔥 BUSCAR EN TIEMPO REAL
    searchInput.addEventListener('input', () => {
        const query = normalizeString(searchInput.value.trim());

        suggestionsContainer.innerHTML = '';

        if (query.length < 2) {
            suggestionsContainer.classList.remove('active');
            return;
        }

        const filtered = products.filter(p =>
            normalizeString(p.name).includes(query) ||
            normalizeString(p.description).includes(query) ||
            normalizeString(p.category).includes(query)
        ).slice(0, 6);

        if (filtered.length === 0) {
            suggestionsContainer.innerHTML =
                '<div class="suggestion-item">Sin resultados</div>';
        } else {
            filtered.forEach(product => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';

                item.innerHTML = `
                    <img src="${getImageUrl(product.imagen) || 'https://placehold.co/60x60?text=?'}"
                         alt="${product.name}"
                         loading="lazy"
                         onerror="this.src='https://placehold.co/60x60?text=?'">
                    <span>${product.name}</span>
                `;

                item.onclick = () => {
                    window.location.href = `product.html?id=${product.id}`;
                };

                suggestionsContainer.appendChild(item);
            });
        }

        suggestionsContainer.classList.add('active');
    });

    // 🔥 ENTER = buscar
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // cerrar sugerencias al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) &&
            !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.classList.remove('active');
        }
    });
}


// ============================================
// BÚSQUEDA MANUAL (botón de buscar)
// ============================================

function performSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    const query = normalizeString(input.value.trim());

    if (!query) {
        displayProducts(products);
        return;
    }

    const filtered = products.filter(p =>
        normalizeString(p.name).includes(query) ||
        normalizeString(p.description).includes(query) ||
        normalizeString(p.category).includes(query)
    );

    displayProducts(filtered);
}


// ============================================
// FILTROS DE CATEGORÍA Y PRECIO
// ============================================

let currentCat = 'all';

// Inicialización de rango de precio + botón aplicar filtros
function initPriceFilterAndCategory() {
    const priceRange = document.getElementById('priceRange');
    const priceCurrent = document.getElementById('priceCurrent');
    const applyBtn = document.getElementById('applyFilters');

    if (priceRange && priceCurrent) {
        // Muestra el precio con formato bonito (S/ 1,234)
        const updatePriceDisplay = () => {
            const value = parseInt(priceRange.value) || 0;
            priceCurrent.textContent = `S/ ${value.toLocaleString('es-PE')}`;
        };

        // Actualiza en tiempo real al mover el slider
        priceRange.oninput = updatePriceDisplay;

        // Valor inicial
        updatePriceDisplay();
    }

    // Botón "Aplicar Filtros" ahora sí llama a la función de carga
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            // Obtenemos la categoría actual desde la URL
            const urlParams = new URLSearchParams(window.location.search);
            const currentCat = urlParams.get('cat') || 'all';

            // Llamamos a la función que filtra y muestra los productos
            loadCategoryProducts(currentCat);
        });
    }
}

// Cargar lista de categorías en el sidebar (solo una vez al cargar)
function loadCategoryFilters() {
    const list = document.getElementById('categoryFilterList');
    if (!list) return;

    if (!products || products.length === 0) {
        list.innerHTML = '<li>Cargando categorías...</li>';
        return;
    }

    // CAMBIO: Usa normalización para uniqueCats y href (consistencia con fixes anteriores)
    const uniqueCats = [...new Set(products.map(p => normalizeString(p.category)))];
    list.innerHTML = '';

    // Mejora: Ordena alfabéticamente para UX mejor
    uniqueCats.sort();

    if (uniqueCats.length === 0) {
        list.innerHTML = '<li>No hay categorías disponibles aún.</li>';  // Feedback mejorado
        return;
    }

    uniqueCats.forEach(normCat => {
        // Humaniza display (e.g., 'baterias' → 'Baterias')
        const displayCat = normCat.charAt(0).toUpperCase() + normCat.slice(1).replace(/-/g, ' ');
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `category.html?cat=${normCat}`;  // Usa normalizado para URL
        a.textContent = displayCat;
        
        // Resaltar activa (normalizada para match)
        if (window.location.search.includes(`cat=${normCat}`)) {
            a.classList.add('active');
        }

        li.appendChild(a);
        list.appendChild(li);
    });
}

// Cargar y mostrar productos filtrados (categoría + precio)
function loadCategoryProducts(cat = 'all') {
    const container = document.getElementById('productsSection');
    const title = document.getElementById('categoryTitle');
    const count = document.getElementById('resultCount');

    if (!container) {
        console.error("No se encontró #productsSection");
        return;
    }

    // Mensaje temporal mientras carga
    container.innerHTML = '<p style="text-align:center; padding:4rem; font-size:1.4rem;">Cargando productos...</p>';

    // Esperamos a que products esté cargado (por si llega tarde)
    if (!products || products.length === 0) {
        setTimeout(() => loadCategoryProducts(cat), 500);
        return;
    }

    // Filtramos por categoría
    let filtered = products;
    if (cat !== 'all') {
        filtered = products.filter(p => normalizeString(p.category) === normalizeString(cat));
    }

    // Aplicamos filtro de precio si existe
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        const maxPrice = parseInt(priceRange.value) || Infinity;
        filtered = filtered.filter(p => (p.price || 0) <= maxPrice);
    }

    // Limpiamos el contenedor
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `
            <p style="text-align:center; padding:4rem; font-size:1.4rem; color:#666;">
                No hay productos en esta categoría
            </p>`;
    } else {
        filtered.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            const imageUrl = getImageUrl(product.imagen);

            card.innerHTML = `
                <div class="image-wrapper">
                    <img loading="lazy"
                         src="${imageUrl}"
                         alt="${product.name || 'Producto'}"
                         onerror="this.src='https://via.placeholder.com/300?text=?'">
                </div>

                <div class="card-content">
                    <h3>${product.name || 'Sin nombre'}</h3>
                    <p class="sku">SKU: ${product.sku || 'Sin SKU'}</p>
                    <p class="price">${product.price ? product.price + ' USD' : '—'}</p>

                    <button onclick="event.stopPropagation(); addToCart(${product.id});">
                        Añadir al Carrito
                    </button>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                window.location.href = `product.html?id=${product.id}`;
            });

            container.appendChild(card);
        });
    }

    // Actualizamos título y contador
   if (title) {
        title.textContent = cat === 'all' 
            ? 'Todos los productos' 
            : (cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '));
    }

    if (count) {
        count.textContent = `Mostrando ${filtered.length} producto${filtered.length === 1 ? '' : 's'}`;
    }
}
// ============================================
// INICIALIZACIÓN FINAL (integrar TODO aquí)
// ============================================


document.addEventListener('DOMContentLoaded', () => {
  
    cargarProductos().then(() => {

    initSearchSuggestions();
        const filterList = document.getElementById('categoryFilterList');
        if (filterList) {
            loadCategoryFilters();  
            console.log("Sidebar categorías cargado exitosamente."); 
        }
        
       
        const urlParams = new URLSearchParams(window.location.search);
        const cat = urlParams.get('cat') || 'all';
        if (document.getElementById('productsSection')) {
            loadCategoryProducts(cat);
        }
        
      
        const id = urlParams.get('id');
       if (document.getElementById('productsSection')) {
    displayProducts(products);  // ← CAMBIO: Usa la función que agrupa por categorías
}
    }).catch(err => {
        console.error("Error cargando products para sidebar:", err);
      
        const filterList = document.getElementById('categoryFilterList');
        if (filterList) filterList.innerHTML = '<li style="color:red;">Error cargando categorías</li>';
    });
});
    
    // Carga del footer 
function loadFooter() {
    let container = document.getElementById('footer-container');
    
    // Si no existe → crearlo (caso index.html puro)
    if (!container) {
        container = document.createElement('div');
        container.id = 'footer-container';
        document.body.appendChild(container);
    }
    
    // Evitamos fetch múltiple si ya tiene contenido
    if (container.innerHTML.trim() !== '') {
        console.log("Footer ya parece estar cargado, se omite fetch");
        return;
    }

    fetch('footer.html')
        .then(response => {
            if (!response.ok) throw new Error('No se pudo cargar footer');
            return response.text();
        })
        .then(data => {
            container.innerHTML = data;
            
            // Ajuste de links (mantienes lo que ya tienes)
            const termsLinks = container.querySelectorAll('a[href="terminos-condiciones.html"]');
            termsLinks.forEach(link => {
                link.href = './terminos-condiciones.html'; // o '/terminos-condiciones.html' si prefieres absoluto
            });
        })
        .catch(err => {
            console.error('Error footer:', err);
            container.innerHTML = '<p style="color:#e74c3c; text-align:center">Error cargando footer</p>';
        });
}

// Llamar UNA SOLA VEZ
document.addEventListener('DOMContentLoaded', () => {
    // ... tu código existente ...
    
    loadFooter();   // ← reemplaza todo el bloque anterior del footer
});

        // Cambiar modo oscuro/claro
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('themeSwitch');
    
    if (themeSwitch) {
        // Verificar si el usuario ya eligió modo oscuro antes
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
        }

        themeSwitch.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            // Guardar preferencia
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }
});


async function cargarAnuncios() {
    try {
        const res = await fetch('http://localhost:3000/api/anuncios');
        if (!res.ok) throw new Error('Error al cargar anuncios');

        const anuncios = await res.json();
        const track = document.getElementById('horizontalAdsTrack');
        if (!track) return;

        track.innerHTML = '';

        anuncios.forEach(anuncio => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `
                <a href="${anuncio.enlace || '#'}" target="_blank">
                    <img src="${getImageUrl(anuncio.imagen_url)}"
                         alt="${anuncio.titulo}"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/728x90?text=Anuncio+no+disponible'">
                </a>
            `;
            track.appendChild(slide);
        });
    } catch (err) {
        console.error('Error cargando anuncios:', err);
    }

}
