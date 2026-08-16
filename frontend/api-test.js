const API_URL = "http://localhost:3500";

let authToken = localStorage.getItem("token");
let authEmail = localStorage.getItem("email") || "";

let currentPage = 1;
let currentSort = "default";
let currentProducts = [];

const pageLimit = 5;


// =========================
// API HELPER
// =========================

async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...(options.body
      ? { "Content-Type": "application/json" }
      : {}),

    ...(authToken
      ? { Authorization: `Bearer ${authToken}` }
      : {}),

    ...(options.headers || {}),
  };

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "API request failed"
    );
  }

  return data;
}


// =========================
// AUTH MODAL
// =========================

window.openAuthModal = function () {
  const modal =
    document.getElementById("authModal");

  if (!modal) return;

  modal.classList.remove("hidden");

  setAuthMode("login");

  const message =
    document.getElementById("authMessage");

  if (message) {
    message.textContent = "";
  }
};


window.closeAuthModal = function () {
  const modal =
    document.getElementById("authModal");

  if (!modal) return;

  modal.classList.add("hidden");
};


// Escape key

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape") {
      closeAuthModal();
    }
  }
);


// =========================
// AUTH UI
// =========================

function updateAuthUI() {
  const loginGate = document.getElementById("loginGate");
  const appHeader = document.querySelector("header");
  const main = document.querySelector("main");
  const authButton = document.getElementById("authButton");
  const welcomeMessage =
    document.getElementById("welcomeMessage");

  if (authToken) {

    if (loginGate) {
      loginGate.classList.add("hidden");
    }

    if (appHeader) {
      appHeader.classList.remove("hidden");
    }

    if (main) {
      main.classList.remove("hidden");
    }

    // Login/Register → Logout
    if (authButton) {
      authButton.textContent = "Logout";
      authButton.classList.add("logout-btn");
    }

    if (welcomeMessage) {
      welcomeMessage.textContent =
        authEmail
          ? `Signed in as ${authEmail}`
          : "Signed in";
    }

  } else {

    if (loginGate) {
      loginGate.classList.remove("hidden");
    }

    if (appHeader) {
      appHeader.classList.add("hidden");
    }

    if (main) {
      main.classList.add("hidden");
    }

    // Logout → Login/Register
    if (authButton) {
      authButton.textContent = "Login / Register";
      authButton.classList.remove("logout-btn");
    }

    if (welcomeMessage) {
      welcomeMessage.textContent = "Not signed in";
    }
  }
}

window.handleAuthButton = function () {
  if (authToken) {
    logoutUser();
  } else {
    openLoginGate();
  }
};


// =========================
// NAVIGATION
// =========================

window.showSection = function (sectionName) {

  // Login ke bina app access nahi
  if (!authToken) {
    updateAuthUI();
    return;
  }


  document
    .querySelectorAll(".section")
    .forEach((section) => {
      section.classList.add("hidden");
    });


  const target =
    document.getElementById(sectionName);


  if (target) {
    target.classList.remove("hidden");
  }


  if (sectionName === "products") {
    loadProducts();
  }


  if (sectionName === "cart") {
    loadCart();
  }


  if (sectionName === "wishlist") {
    loadWishlist();
  }
};


// =========================
// AUTH MODE
// =========================

window.setAuthMode = function (mode) {

  const loginTab =
    document.getElementById("loginTab");

  const registerTab =
    document.getElementById(
      "registerTab"
    );

  const loginForm =
    document.getElementById(
      "loginForm"
    );

  const registerForm =
    document.getElementById(
      "registerForm"
    );


  if (
    !loginTab ||
    !registerTab ||
    !loginForm ||
    !registerForm
  ) {
    return;
  }


  loginTab.classList.toggle(
    "active",
    mode === "login"
  );

  registerTab.classList.toggle(
    "active",
    mode === "register"
  );


  loginForm.classList.toggle(
    "hidden",
    mode !== "login"
  );

  registerForm.classList.toggle(
    "hidden",
    mode !== "register"
  );
};


// =========================
// REGISTER
// =========================

window.registerUser = async function () {

  const message =
    document.getElementById(
      "authMessage"
    );


  try {

    const email =
      document.getElementById(
        "registerEmail"
      ).value.trim();


    const password =
      document.getElementById(
        "registerPassword"
      ).value;


    const data =
      await apiRequest(
        "/auth/register",
        {
          method: "POST",

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );


    authToken = data.token;
    authEmail = email;


    localStorage.setItem(
      "token",
      authToken
    );

    localStorage.setItem(
      "email",
      authEmail
    );


    message.textContent =
      "Registration successful";

    message.className =
      "success";


    updateAuthUI();


    // Login gate hide
    setTimeout(() => {
      showSection("products");
    }, 700);


  } catch (error) {

    message.textContent =
      error.message;

    message.className =
      "error";
  }
};


// =========================
// LOGIN
// =========================

window.loginUser = async function () {

  const message =
    document.getElementById(
      "authMessage"
    );


  try {

    const email =
      document.getElementById(
        "loginEmail"
      ).value.trim();


    const password =
      document.getElementById(
        "loginPassword"
      ).value;


    const data =
      await apiRequest(
        "/auth/login",
        {
          method: "POST",

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );


    authToken = data.token;
    authEmail = email;


    localStorage.setItem(
      "token",
      authToken
    );

    localStorage.setItem(
      "email",
      authEmail
    );


    message.textContent =
      "Login successful";

    message.className =
      "success";


    updateAuthUI();


    // Login ke baad Products
    setTimeout(() => {
      showSection("products");
    }, 700);


  } catch (error) {

    message.textContent =
      error.message;

    message.className =
      "error";
  }
};


// =========================
// LOGOUT
// =========================

window.logoutUser = function () {

  authToken = null;
  authEmail = "";


  localStorage.removeItem("token");
  localStorage.removeItem("email");


  updateAuthUI();
};


// =========================
// PRODUCTS
// =========================

async function loadProducts() {

  try {

    const data =
      await apiRequest(
        `/products?page=${currentPage}&limit=${pageLimit}`
      );


    const container =
      document.getElementById(
        "productsList"
      );


    if (!container) return;


    container.innerHTML = "";


    if (!data.data?.length) {

      container.innerHTML = `
        <div class="card empty-state">
          No products found.
        </div>
      `;


      renderPagination(
        data.pagination
      );

      return;
    }


    // Save current page products

    currentProducts =
      [...data.data];


    // =====================
    // PRICE SORT
    // =====================

    if (
      currentSort ===
      "low-high"
    ) {

      currentProducts.sort(
        (a, b) =>
          Number(a.price) -
          Number(b.price)
      );
    }


    if (
      currentSort ===
      "high-low"
    ) {

      currentProducts.sort(
        (a, b) =>
          Number(b.price) -
          Number(a.price)
      );
    }


    // =====================
    // RENDER
    // =====================

    currentProducts.forEach(
      (product) => {

        const div =
          document.createElement(
            "div"
          );


        div.className =
          "product-card";


        div.innerHTML = `
          <div>

            <h3>
              ${product.name}
            </h3>

            <p>
              Price: ₹${product.price}
            </p>

            <p>
              Stock: ${product.stock}
            </p>

            <small>
              ID: ${product._id}
            </small>

          </div>


          <div class="product-actions">

            <button
              onclick="addProductToCart('${product._id}')"
            >
              Add to Cart
            </button>


            <button
              class="secondary"
              onclick="addProductToWishlist('${product._id}')"
            >
              Wishlist
            </button>


            <button
              class="danger"
              onclick="deleteProduct('${product._id}')"
            >
              Delete
            </button>

          </div>
        `;


        container.appendChild(
          div
        );
      }
    );


    renderPagination(
      data.pagination
    );


  } catch (error) {

    alert(error.message);
  }
}


// =========================
// PRICE SORT
// =========================

window.sortProducts = function () {

  const select =
    document.getElementById(
      "priceSort"
    );


  if (!select) return;


  currentSort =
    select.value;


  loadProducts();
};


// =========================
// PAGINATION
// =========================

function renderPagination(
  pagination = {}
) {

  const container =
    document.getElementById(
      "pagination"
    );


  if (!container) return;


  const page =
    pagination.page || 1;


  const totalPages =
    pagination.totalPages || 1;


  const total =
    pagination.total || 0;


  container.innerHTML = "";


  const info =
    document.createElement(
      "div"
    );


  info.className =
    "pagination-info";


  info.textContent =
    `Page ${page} of ${totalPages} | Total Products: ${total}`;


  container.appendChild(
    info
  );


  const controls =
    document.createElement(
      "div"
    );


  controls.className =
    "pagination-controls";


  // Previous

  const previous =
    document.createElement(
      "button"
    );


  previous.textContent =
    "Previous";


  previous.disabled =
    page <= 1;


  previous.onclick = () => {

    if (currentPage > 1) {

      currentPage--;

      loadProducts();
    }
  };


  controls.appendChild(
    previous
  );


  // Page numbers

  for (
    let i = 1;
    i <= totalPages;
    i++
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.textContent =
      i;


    button.disabled =
      i === page;


    button.onclick = () => {

      currentPage = i;

      loadProducts();
    };


    controls.appendChild(
      button
    );
  }


  // Next

  const next =
    document.createElement(
      "button"
    );


  next.textContent =
    "Next";


  next.disabled =
    page >= totalPages;


  next.onclick = () => {

    if (
      currentPage <
      totalPages
    ) {

      currentPage++;

      loadProducts();
    }
  };


  controls.appendChild(
    next
  );


  container.appendChild(
    controls
  );
}


// =========================
// CREATE PRODUCT
// =========================

window.createProduct =
  async function () {

    try {

      const name =
        document.getElementById(
          "productName"
        ).value.trim();


      const price =
        Number(
          document.getElementById(
            "productPrice"
          ).value
        );


      const stock =
        Number(
          document.getElementById(
            "productStock"
          ).value
        );


      await apiRequest(
        "/products",
        {
          method: "POST",

          body: JSON.stringify({
            name,
            price,
            stock,
          }),
        }
      );


      alert(
        "Product created successfully"
      );


      document.getElementById(
        "productName"
      ).value = "";


      document.getElementById(
        "productPrice"
      ).value = "";


      document.getElementById(
        "productStock"
      ).value = "";


      currentPage = 1;


      loadProducts();


    } catch (error) {

      alert(error.message);
    }
  };


// =========================
// DELETE PRODUCT
// =========================

window.deleteProduct =
  async function (id) {

    if (!authToken) {

      updateAuthUI();

      return;
    }


    try {

      await apiRequest(
        `/products/${id}`,
        {
          method: "DELETE",
        }
      );


      alert(
        "Product deleted successfully"
      );


      loadProducts();


    } catch (error) {

      alert(error.message);
    }
  };


// =========================
// CART
// =========================

async function loadCart() {

  if (!authToken) {

    updateAuthUI();

    return;
  }


  try {

    const data =
      await apiRequest(
        "/cart"
      );


    const container =
      document.getElementById(
        "cartList"
      );


    if (!container) return;


    container.innerHTML = "";


    const summary =
      document.createElement(
        "div"
      );


    summary.className =
      "cart-summary card";


    summary.innerHTML = `
      <h3>
        Cart Total: ₹${data.total || 0}
      </h3>
    `;


    container.appendChild(
      summary
    );


    if (!data.items?.length) {

      const empty =
        document.createElement(
          "div"
        );


      empty.className =
        "card empty-state";


      empty.textContent =
        "Your cart is empty.";


      container.appendChild(
        empty
      );


      return;
    }


    data.items.forEach(
      (item) => {

        const div =
          document.createElement(
            "div"
          );


        div.className =
          "cart-item";


        const price =
          item.product?.price ?? 0;


        const itemTotal =
          price * item.qty;


        div.innerHTML = `
          <div>

            <h3>
              ${
                item.product?.name ||
                "Product"
              }
            </h3>

            <p>
              Price: ₹${price}
            </p>

            <p>
              Quantity: ${item.qty}
            </p>

            <p>
              Item Total: ₹${itemTotal}
            </p>

          </div>


          <div class="cart-actions">

            <button
              onclick="updateCart(
                '${item.id}',
                ${item.qty + 1}
              )"
            >
              +1
            </button>


            ${
              item.qty > 1
                ? `
                  <button
                    class="secondary"
                    onclick="updateCart(
                      '${item.id}',
                      ${item.qty - 1}
                    )"
                  >
                    -1
                  </button>
                `
                : ""
            }


            <button
              class="danger"
              onclick="deleteCart(
                '${item.id}'
              )"
            >
              Remove
            </button>

          </div>
        `;


        container.appendChild(
          div
        );
      }
    );


  } catch (error) {

    alert(error.message);
  }
}


// =========================
// ADD TO CART
// =========================

window.addProductToCart =
  async function (productId) {

    if (!authToken) {

      updateAuthUI();

      return;
    }


    try {

      await apiRequest(
        "/cart",
        {
          method: "POST",

          body: JSON.stringify({
            productId:
              String(productId),

            qty: 1,
          }),
        }
      );


      alert(
        "Product added to cart"
      );


    } catch (error) {

      alert(error.message);
    }
  };


// =========================
// UPDATE CART
// =========================

window.updateCart =
  async function (id, qty) {

    if (!authToken) {

      updateAuthUI();

      return;
    }


    try {

      await apiRequest(
        `/cart/${id}`,
        {
          method: "PUT",

          body: JSON.stringify({
            qty,
          }),
        }
      );


      loadCart();


    } catch (error) {

      alert(error.message);
    }
  };


// =========================
// DELETE CART
// =========================

window.deleteCart =
  async function (id) {

    if (!authToken) {

      updateAuthUI();

      return;
    }


    try {

      await apiRequest(
        `/cart/${id}`,
        {
          method: "DELETE",
        }
      );


      loadCart();


    } catch (error) {

      alert(error.message);
    }
  };


// =========================
// WISHLIST
// =========================

async function loadWishlist() {

  if (!authToken) {

    updateAuthUI();

    return;
  }


  try {

    const data =
      await apiRequest(
        "/wishlist"
      );


    const container =
      document.getElementById(
        "wishlistList"
      );


    if (!container) return;


    container.innerHTML = "";


    if (!data.length) {

      const empty =
        document.createElement(
          "div"
        );


      empty.className =
        "card empty-state";


      empty.textContent =
        "Your wishlist is empty.";


      container.appendChild(
        empty
      );


      return;
    }


    data.forEach(
      (item) => {

        const div =
          document.createElement(
            "div"
          );


        div.className =
          "wishlist-item";


        const price =
          item.product?.price ?? 0;


        div.innerHTML = `
          <div>

            <h3>
              ${
                item.product?.name ||
                "Product"
              }
            </h3>

            <p>
              Price: ₹${price}
            </p>

          </div>


          <button
            class="danger"
            onclick="deleteWishlist(
              '${item.id}'
            )"
          >
            Remove
          </button>
        `;


        container.appendChild(
          div
        );
      }
    );


  } catch (error) {

    alert(error.message);
  }
}


// =========================
// ADD TO WISHLIST
// =========================

window.addProductToWishlist =
  async function (productId) {

    if (!authToken) {

      updateAuthUI();

      return;
    }


    try {

      await apiRequest(
        "/wishlist",
        {
          method: "POST",

          body: JSON.stringify({
            productId:
              String(productId),
          }),
        }
      );


      alert(
        "Product added to wishlist"
      );


    } catch (error) {

      alert(error.message);
    }
  };


// =========================
// DELETE WISHLIST
// =========================

window.deleteWishlist =
  async function (id) {

    if (!authToken) {

      updateAuthUI();

      return;
    }


    try {

      await apiRequest(
        `/wishlist/${id}`,
        {
          method: "DELETE",
        }
      );


      loadWishlist();


    } catch (error) {

      alert(error.message);
    }
  };


// =========================
// INITIAL LOAD
// =========================

// IMPORTANT:
// Yahan showSection("products")
// nahi karna hai.

updateAuthUI();

window.openLoginGate = function () {
  const loginGate =
    document.getElementById("loginGate");

  if (!loginGate) return;

  loginGate.classList.remove("hidden");

  setAuthMode("login");
};

window.handleAuthButton = function () {
  if (authToken) {
    logoutUser();
  } else {
    openLoginGate();
  }
};