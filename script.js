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

        // ── Banner / separador de categoría ───────────────────────────────────────
        const banner = document.createElement('div');
        banner.className = 'category-banner';
        
        // Texto visible (primera letra mayúscula + reemplazo de guiones)
        const displayName = categoria.charAt(0).toUpperCase() + categoria.slice(1).replace(/-/g, ' ');
        banner.textContent = displayName;

        // Hacerlo clickeable SOLO en la página principal (index)
        // Esto evita que en category.html el banner también sea link (opcional)
        const isIndexPage = window.location.pathname.includes('index.html') || 
                           window.location.pathname === '/' || 
                           !window.location.pathname.includes('.html');

        if (isIndexPage) {
            banner.style.cursor = 'pointer';
            banner.title = `Ver todos los productos de ${displayName}`;
            
            banner.addEventListener('click', () => {
                // Usamos el slug original de la categoría (baterias, discos, etc.)
                window.location.href = `category.html?cat=${categoria}`;
            });
        }

        section.appendChild(banner);

        // ── Contenedor de productos de esta categoría ─────────────────────────────
        const contenedor = document.createElement('div');
        contenedor.className = 'products';
        section.appendChild(contenedor);

        productosCategoria.forEach(product => {
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
                if (product.id) {
                    window.location.href = `product.html?id=${product.id}`;
                }
            });

            contenedor.appendChild(card);
        });
    });
}
// 🔥 Activar animación fade cuando cargan las imágenes
document.querySelectorAll('.fade-img').forEach(img => {
    if (img.complete) {
        img.classList.add('loaded');
    } else {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });
    }
});


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

    if (!products || products.length === 0) {
        console.warn("Productos no cargados aún. Reintentando...");
        setTimeout(() => showSubmenu(category), 300);
        return;
    }

    submenu.innerHTML = "";
    submenu.removeAttribute("style");
    submenu.classList.add("active");

    /* =========================================================
       CASO: TODAS LAS CATEGORÍAS  ←─ AQUÍ ESTÁ EL CAMBIO PRINCIPAL
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

        const wrapper = document.createElement("div");
        wrapper.className = "all-mega-wrapper";
        submenu.appendChild(wrapper);

        // COLUMNA IZQUIERDA (categorías clickeables)
        const left = document.createElement("div");
        left.className = "all-mega-left";
        wrapper.appendChild(left);

        const ul = document.createElement("ul");
        ul.className = "all-mega-list";
        left.appendChild(ul);

        // COLUMNA DERECHA (productos dinámicos al hover)
        const right = document.createElement("div");
        right.className = "all-mega-right";
        wrapper.appendChild(right);

        allCategories.forEach(cat => {

            const displayCat = 
                cat.charAt(0).toUpperCase() +
                cat.slice(1).replace(/-/g, " ");

            const li = document.createElement("li");
            li.textContent = displayCat;

            // ── Mejora: hacemos el <li> clickeable ────────────────────────────────
            li.style.cursor = "pointer";
            li.title = `Ver todos los productos de ${displayCat}`;

            // Clic → va a la página de la categoría completa
            li.addEventListener("click", (e) => {
                e.stopPropagation();
                window.location.href = `category.html?cat=${encodeURIComponent(cat)}`;
            });

            // Hover → muestra productos a la derecha (lo que ya tenías)
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

                // Mostramos solo algunos productos (ej: primeros 6) para no saturar
                categoryProducts.slice(0, 6).forEach(product => {
                    const item = document.createElement("div");
                    item.className = "all-mega-product-item";
                    item.textContent = cleanProductName(product.name);

                    item.onclick = () => {
                        window.location.href = `product.html?id=${product.id}`;
                    };

                    productsGrid.appendChild(item);
                });

                // Opcional: enlace "Ver todos" debajo de los productos destacados
                const viewAll = document.createElement("a");
                viewAll.href = `category.html?cat=${encodeURIComponent(cat)}`;
                viewAll.textContent = "Ver todos →";
                viewAll.className = "view-all-link";
                viewAll.style.display = "block";
                viewAll.style.marginTop = "12px";
                viewAll.style.color = "var(--primary-yellow)";
                viewAll.style.fontWeight = "bold";
                productsGrid.appendChild(viewAll);
            };

            ul.appendChild(li);
        });

        return;
    }

    // ── El resto de la función (categorías normales) se mantiene igual ────────
    // ... (tu código original para categorías específicas sigue aquí sin cambios)
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
// FUNCIONES DEL CARRITO (VERSIÓN FINAL CORREGIDA - FEB 2026)
// ============================================

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const cart = getCart();

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

    saveCart(cart);
    updateCart();           // actualiza contador del header
    // Si estás en la página del carrito, actualiza también la vista
    if (document.getElementById('cartItems')) renderCartItems();
}

// ====================== RENDER CARRITO (YA ESTÁ CORRECTO) ======================
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartContainer = document.getElementById('emptyCart');

    if (!cartItemsContainer || !emptyCartContainer) {
        console.warn('Elementos del carrito no encontrados en el DOM');
        return;
    }

    const currentCart = getCart();

    if (currentCart.length === 0) {
        cartItemsContainer.innerHTML = '';
        emptyCartContainer.style.display = 'flex';
        updateCartSummary();
        updateCart();
        return;
    }

    emptyCartContainer.style.display = 'none';
    cartItemsContainer.innerHTML = '';

    currentCart.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('cart-item');

        div.innerHTML = `
            <input type="checkbox" 
                   ${item.checked ? 'checked' : ''} 
                   onchange="toggleCheck(${index})">

            <img src="${getImageUrl(item.imagen)}" 
                 alt="${item.name}" 
                 loading="lazy"
                 onerror="this.src='https://placehold.co/300x300?text=Sin+imagen'">

            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-price">${parseFloat(item.price).toFixed(2)} USD c/u</p>
                
                <div class="cart-item-quantity">
                    Cantidad: 
                    <input type="number" 
                           value="${item.quantity}" 
                           min="1" 
                           onchange="updateQuantity(${index}, this.value)">
                </div>
                
                <p class="cart-item-subtotal">
                    Subtotal: ${(item.price * item.quantity).toFixed(2)} USD
                </p>
            </div>

            <div class="cart-item-actions">
                <button onclick="removeFromCart(${index})">Eliminar</button>
            </div>
        `;

        cartItemsContainer.appendChild(div);
    });

    updateCartSummary();
    updateCart();
}

// ====================== ACTUALIZAR CANTIDAD ======================
function updateQuantity(index, newQuantity) {
    const cart = getCart();
    cart[index].quantity = parseInt(newQuantity) || 1;
    saveCart(cart);
    renderCartItems();   // re-renderiza todo
}

// ====================== MARCAR/DESMARCAR ======================
function toggleCheck(index) {
    const cart = getCart();
    cart[index].checked = !cart[index].checked;
    saveCart(cart);
    renderCartItems();   // ← ahora sí actualiza todo correctamente
}

// ====================== ELIMINAR PRODUCTO ======================
function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartItems();   // ← re-renderiza todo
}

// ====================== CONTADOR DEL HEADER ======================
function updateCart() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;

    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
}

// ====================== RESUMEN SUBTOTAL + TOTAL (NUEVA FUNCIÓN) ======================
function updateCartSummary() {
    const subtotalEl = document.getElementById('subtotal');
    const totalEl    = document.getElementById('cartTotal');
    const shippingEl = document.getElementById('shipping');

    if (!subtotalEl || !totalEl) return;

    const cart = getCart();
    const checkedItems = cart.filter(item => item.checked);

    const subtotal = checkedItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
    }, 0);

    const shipping = 0; // Cambia a 10 o el valor que quieras cuando definas envío

    const total = subtotal + shipping;

    subtotalEl.textContent = subtotal.toFixed(2) + ' USD';
    totalEl.textContent    = total.toFixed(2) + ' USD';

    if (shippingEl) {
        shippingEl.textContent = shipping === 0 ? 'Gratis' : shipping.toFixed(2) + ' USD';
    }
}

// ====================== CHECKOUT (WHATSAPP CORRECTO) ======================
function checkout() {
    const cart = getCart();
    const checkedItems = cart.filter(item => item.checked);

    if (checkedItems.length === 0) {
        alert('Selecciona al menos un producto para continuar');
        return;
    }

    const productList = checkedItems.map(item => 
        `${item.name} ×${item.quantity}`
    ).join(' • ');

    const total = checkedItems.reduce((sum, item) => 
        sum + (parseFloat(item.price) * item.quantity), 0
    );

    const message = `Hola Twins Tech 👋\n\nQuiero comprar:\n${productList}\n\nTotal: ${total.toFixed(2)} USD\n\n¿Me confirmas stock y envío a Lima?`;

    window.open(`https://wa.me/933488495?text=${encodeURIComponent(message)}`, '_blank');
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
                <img 
                    src="${BASE_URL}${anuncio.imagen_url}"
                    alt="${anuncio.titulo || 'Anuncio'}"
                    loading="lazy"
                    onerror="this.src='https://placehold.co/1200x400?text=Anuncio+no+disponible'"
                >
            `;

            track.appendChild(slide);
        });

        initOrUpdateIndicators();

        console.log(`Carrusel cargado con ${anuncios.length} anuncios`);

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

    let query = input.value.trim();
    if (!query) {
        // Si está vacío, puedes ir a "todos los productos" o no hacer nada
        window.location.href = "category.html?cat=all";
        return;
    }

    // Normalizamos (tu función ya existe)
    query = normalizeString(query);

    // Redirigimos con el parámetro de búsqueda
    window.location.href = `category.html?cat=all&search=${encodeURIComponent(query)}`;
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

    // Obtener categorías únicas
    const uniqueCats = [...new Set(products.map(p => normalizeString(p.category)))];
    list.innerHTML = '';

    // Ordenar alfabéticamente
    uniqueCats.sort();

    if (uniqueCats.length === 0) {
        list.innerHTML = '<li>No hay categorías disponibles aún.</li>';
        return;
    }

    uniqueCats.forEach(normCat => {
        const displayCat = normCat.charAt(0).toUpperCase() + normCat.slice(1).replace(/-/g, ' ');
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `category.html?cat=${normCat}`;
        a.textContent = displayCat;
        
        if (window.location.search.includes(`cat=${normCat}`)) {
            a.classList.add('active');
        }

        li.appendChild(a);
        list.appendChild(li);
    });

    // ====================== COPIAR AL MÓVIL ======================
    const mobileList = document.getElementById('categoryFilterListMobile');
    if (mobileList) {
        mobileList.innerHTML = list.innerHTML;
        console.log('✅ Categorías copiadas al móvil correctamente');
    }
}

// Cargar y mostrar productos filtrados (categoría + precio) //
 function loadCategoryProducts(cat = 'all') {
    const container = document.getElementById('productsSection'); 
    const title = document.getElementById('categoryTitle'); 
    const count = document.getElementById('resultCount');

    if (!container) { 
        console.error("No se encontró #productsSection"); 
        return; }

   // Mensaje temporal mientras carga
    container.innerHTML = '<p style="text-align:center; padding:4rem; font-size:1.4rem;">Cargando productos...</p>';

 // Esperamos a que products esté cargado (por si llega tarde) 
 if (!products || products.length === 0) 
    { setTimeout(() => loadCategoryProducts(cat), 500);
         return; }
    // Filtramos por categoría 
    let filtered = products;
    if (cat !== 'all') { 
        filtered = products.filter(p => normalizeString(p.category) ===
         normalizeString(cat)); }
// FILTRO DE PRECIO (MIN + MAX)
// ============================================

const minInput = document.getElementById('minPrice');
const maxInput = document.getElementById('maxPrice');
const priceRange = document.getElementById('priceRange'); // opcional si aún usas slider

let minPrice = 0;
let maxPrice = Infinity;

// Si existen inputs manuales → prioridad
if (minInput || maxInput) {
    minPrice = parseFloat(minInput?.value) || 0;
    maxPrice = parseFloat(maxInput?.value) || Infinity;
}
// Si NO existen inputs pero sí slider → fallback
else if (priceRange) {
    maxPrice = parseFloat(priceRange.value) || Infinity;
}

// Validación
if (minPrice > maxPrice) {
    alert("El precio mínimo no puede ser mayor que el máximo.");
    return;
}

filtered = filtered.filter(p => {
    const price = parseFloat(p.price) || 0;
    return price >= minPrice && price <= maxPrice;
});

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
        const catParam = urlParams.get('cat');
        const id = urlParams.get('id');

        // =========================
        // 📦 PÁGINA CON PRODUCTOS
        // =========================
        if (document.getElementById('productsSection')) {

            // 🏠 HOME (sin ?cat=)
            if (!catParam) {
                displayProducts(products);
            } 
            // 📂 CATEGORÍA (con ?cat=algo)
            else {
                loadCategoryProducts(catParam);
            }
        }

        // =========================
        // 📄 DETALLE DE PRODUCTO
        // =========================
        if (id && document.getElementById('productTitle')) {
            showProductDetails(id);
        }

    }).catch(err => {
        console.error("Error cargando products:", err);
      
        const filterList = document.getElementById('categoryFilterList');
        if (filterList) {
            filterList.innerHTML = '<li style="color:red;">Error cargando categorías</li>';
        }
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




// ================================================
// FIX GLOBAL DEFINITIVO DEL CONTADOR DEL CARRITO
// Este código se ejecuta en TODAS las páginas después de que todo cargue
// ================================================
window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof updateCart === 'function') {
            updateCart();
            console.log('✅ Contador del carrito actualizado GLOBALMENTE (window.load)');
        }
    }, 10);
});


function updateCart() {
    const cartCountElement = document.getElementById('cartCount');
    
    // Si el elemento no existe aún (header no cargado), salimos sin error
    if (!cartCountElement) {
        console.log('Elemento #cartCount no encontrado aún (header pendiente)');
        return;
    }

    const cart = getCart();
    
    // Seguridad extra por si localStorage está corrupto
    if (!Array.isArray(cart)) {
        console.warn('Carrito corrupto → reiniciando');
        saveCart([]);
        cartCountElement.textContent = '0';
        return;
    }

    const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    
    cartCountElement.textContent = totalItems;
    
    // Opcional: ocultar si es 0
    cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';

    console.log(`Carrito actualizado: ${totalItems} artículos`);
}