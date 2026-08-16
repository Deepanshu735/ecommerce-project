import { useEffect, useState } from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Badge,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  TextField,
  LinearProgress,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import FolderIcon from "@mui/icons-material/Folder";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = "http://localhost:3500";

// Change this whenever you want to test pagination
// "page"   = page based
// "offset" = offset based
// "cursor" = cursor based
const PAGINATION_MODE = "page";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

function App() {
  // =========================
  // AUTH
  // =========================

  const [authMode, setAuthMode] =
    useState("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [authLoading, setAuthLoading] =
    useState(false);

  const [authError, setAuthError] =
    useState("");

  const [isLoggedIn, setIsLoggedIn] =
    useState(
      Boolean(localStorage.getItem("token"))
    );

  // =========================
  // PRODUCTS
  // =========================

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [cursor, setCursor] =
    useState(null);

  const [nextCursor, setNextCursor] =
    useState(null);

  const [cursorHistory, setCursorHistory] =
    useState([]);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalProducts, setTotalProducts] =
    useState(0);

  const [sort, setSort] =
    useState("default");

  // =========================
  // CART
  // =========================

  const [cartCount, setCartCount] =
    useState(0);

  const [cartOpen, setCartOpen] =
    useState(false);

  const [cartItems, setCartItems] =
    useState([]);

  const [cartTotal, setCartTotal] =
    useState(0);

  const [cartLoading, setCartLoading] =
    useState(false);

  // =========================
  // WISHLIST
  // =========================

  const [wishlistOpen, setWishlistOpen] =
    useState(false);

  const [wishlistItems, setWishlistItems] =
    useState([]);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  // =========================
  // FILES
  // =========================

  const [filesOpen, setFilesOpen] =
    useState(false);

  const [files, setFiles] =
    useState([]);

  const [filesLoading, setFilesLoading] =
    useState(false);

  const [fileUploading, setFileUploading] =
    useState(false);

  const [selectedFiles, setSelectedFiles] =
    useState([]);

  // Preview
  const [previewFile, setPreviewFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [previewLoading, setPreviewLoading] =
    useState(false);

  // DELETE CONFIRMATION
  const [deleteFileTarget, setDeleteFileTarget] =
    useState(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  // =========================
  // SNACKBAR
  // =========================

  const [snackbar, setSnackbar] =
    useState({
      open: false,
      message: "",
    });

  // =========================
  // HELPERS
  // =========================

  const getToken = () =>
    localStorage.getItem("token");

  const showMessage = (message) => {
    setSnackbar({
      open: true,
      message,
    });
  };

  const closeSnackbar = () => {
    setSnackbar({
      open: false,
      message: "",
    });
  };

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthError("");
  };

  // =========================
  // LOGIN
  // =========================

  const loginUser = async () => {
    if (!email.trim() || !password) {
      setAuthError(
        "Email and password are required."
      );
      return;
    }

    try {
      setAuthLoading(true);
      setAuthError("");

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Login failed"
        );
      }

      if (!data.token) {
        throw new Error(
          "Login successful, but server did not return a token."
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "email",
        email.trim()
      );

      setIsLoggedIn(true);

      setEmail("");
      setPassword("");
      setAuthError("");

      await loadCartCount();

      showMessage(
        "Login successful 🎉"
      );
    } catch (err) {
      setAuthError(
        err.message ||
          "Login failed"
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // REGISTER
  // =========================

  const registerUser = async () => {
    if (!email.trim() || !password) {
      setAuthError(
        "Email and password are required."
      );
      return;
    }

    try {
      setAuthLoading(true);
      setAuthError("");

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Registration failed"
        );
      }

      if (!data.token) {
        throw new Error(
          "Registration successful, but server did not return a token."
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "email",
        email.trim()
      );

      setIsLoggedIn(true);

      setEmail("");
      setPassword("");
      setAuthError("");

      await loadCartCount();

      showMessage(
        "Account created successfully 🎉"
      );
    } catch (err) {
      setAuthError(
        err.message ||
          "Registration failed"
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "email"
    );

    setIsLoggedIn(false);
    setCartCount(0);

    setFiles([]);
    setSelectedFiles([]);
    setFilesOpen(false);

    setEmail("");
    setPassword("");
    setAuthMode("login");
    setAuthError("");

    showMessage(
      "Logged out successfully"
    );
  };

  // =========================
  // PRODUCTS
  // =========================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint;

      if (PAGINATION_MODE === "cursor") {
        endpoint =
          `${API_URL}/products?limit=5` +
          (cursor
            ? `&cursor=${encodeURIComponent(cursor)}`
            : "");
      } else if (
        PAGINATION_MODE === "offset"
      ) {
        endpoint =
          `${API_URL}/products?limit=5&offset=${
            (page - 1) * 5
          }`;
      } else {
        endpoint =
          `${API_URL}/products?page=${page}&limit=5`;
      }

      const response =
        await fetch(endpoint);

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load products"
        );
      }

      let items =
        data.data || [];

      if (sort === "low-high") {
        items = [...items].sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price)
        );
      }

      if (sort === "high-low") {
        items = [...items].sort(
          (a, b) =>
            Number(b.price) -
            Number(a.price)
        );
      }

      setProducts(items);

      setTotalProducts(
        data.pagination?.total || 0
      );

      if (
        PAGINATION_MODE ===
        "cursor"
      ) {
        setNextCursor(
          data.cursor?.next ||
            null
        );
      } else {
        setTotalPages(
          data.pagination
            ?.totalPages || 1
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CART
  // =========================

  const loadCartCount =
    async () => {
      const token =
        getToken();

      if (!token) {
        setCartCount(0);
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/cart`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const count =
          data.items?.reduce(
            (total, item) =>
              total +
              Number(
                item.qty || 0
              ),
            0
          ) || 0;

        setCartCount(count);
      } catch {
        // Ignore cart count errors.
      }
    };

  const loadCart =
    async () => {
      const token =
        getToken();

      if (!token) {
        openAuth("login");
        return;
      }

      try {
        setCartLoading(true);

        const response =
          await fetch(
            `${API_URL}/cart`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to load cart"
          );
        }

        const items =
          Array.isArray(data)
            ? data
            : data.items || [];

        setCartItems(items);

        const calculatedTotal =
          items.reduce(
            (sum, item) =>
              sum +
              Number(
                item.product?.price ||
                  0
              ) *
                Number(
                  item.qty || 0
                ),
            0
          );

        setCartTotal(
          data.total !== undefined
            ? Number(data.total)
            : calculatedTotal
        );

        setCartCount(
          items.reduce(
            (sum, item) =>
              sum +
              Number(
                item.qty || 0
              ),
            0
          )
        );

        setCartOpen(true);
      } catch (err) {
        showMessage(
          err.message ||
            "Failed to load cart"
        );
      } finally {
        setCartLoading(false);
      }
    };

  const updateCart =
    async (id, qty) => {
      if (!getToken()) {
        openAuth("login");
        return;
      }

      if (qty < 1) {
        await deleteCart(id);
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/cart/${id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${getToken()}`,
              },
              body: JSON.stringify({
                qty,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to update cart"
          );
        }

        await loadCart();
      } catch (err) {
        showMessage(
          err.message ||
            "Failed to update cart"
        );
      }
    };

  const deleteCart =
    async (id) => {
      if (!getToken()) {
        openAuth("login");
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/cart/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization:
                  `Bearer ${getToken()}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to remove cart item"
          );
        }

        await loadCart();

        showMessage(
          "Item removed from cart"
        );
      } catch (err) {
        showMessage(
          err.message ||
            "Failed to remove cart item"
        );
      }
    };

  // =========================
  // WISHLIST
  // =========================

  const loadWishlist =
    async () => {
      const token =
        getToken();

      if (!token) {
        openAuth("login");
        return;
      }

      try {
        setWishlistLoading(true);

        const response =
          await fetch(
            `${API_URL}/wishlist`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to load wishlist"
          );
        }

        const items =
          Array.isArray(data)
            ? data
            : data.items || [];

        setWishlistItems(items);
        setWishlistOpen(true);
      } catch (err) {
        showMessage(
          err.message ||
            "Failed to load wishlist"
        );
      } finally {
        setWishlistLoading(false);
      }
    };

  const deleteWishlist =
    async (id) => {
      if (!getToken()) {
        openAuth("login");
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/wishlist/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization:
                  `Bearer ${getToken()}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to remove wishlist item"
          );
        }

        await loadWishlist();

        showMessage(
          "Removed from wishlist"
        );
      } catch (err) {
        showMessage(
          err.message ||
            "Failed to remove wishlist item"
        );
      }
    };

  // =========================
  // ADD TO CART
  // =========================

  const addToCart =
    async (productId) => {
      const token =
        getToken();

      if (!token) {
        openAuth("login");
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/cart`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              body: JSON.stringify({
                productId:
                  String(productId),
                qty: 1,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to add product to cart"
          );
        }

        await loadCartCount();

        showMessage(
          "Product added to cart 🛒"
        );
      } catch (err) {
        showMessage(
          err.message ||
            "Failed to add product"
        );
      }
    };

  // =========================
  // ADD TO WISHLIST
  // =========================

  const addToWishlist =
    async (productId) => {
      const token =
        getToken();

      if (!token) {
        openAuth("login");
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/wishlist`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              body: JSON.stringify({
                productId:
                  String(productId),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to add to wishlist"
          );
        }

        showMessage(
          "Added to wishlist ❤️"
        );
      } catch (err) {
        showMessage(
          err.message ||
            "Failed to add wishlist item"
        );
      }
    };

  // =========================
  // FILE HELPERS
  // =========================

  const formatFileSize =
    (bytes) => {
      if (!bytes) {
        return "0 Bytes";
      }

      const sizes = [
        "Bytes",
        "KB",
        "MB",
        "GB",
      ];

      const index =
        Math.floor(
          Math.log(bytes) /
            Math.log(1024)
        );

      return `${(
        bytes /
        Math.pow(1024, index)
      ).toFixed(
        index === 0 ? 0 : 2
      )} ${sizes[index]}`;
    };

  const isAllowedFile =
    (file) => {
      return (
        ALLOWED_FILE_TYPES.includes(
          file.type
        ) &&
        file.size <=
          MAX_FILE_SIZE
      );
    };

  // =========================
  // LOAD FILES
  // =========================

  const loadFiles =
    async () => {
      const token =
        getToken();

      if (!token) {
        openAuth("login");
        return;
      }

      try {
        setFilesLoading(true);

        const response =
          await fetch(
            `${API_URL}/files`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to load files"
          );
        }

        setFiles(
          Array.isArray(data)
            ? data
            : data.files || []
        );

        setFilesOpen(true);
      } catch (err) {
        showMessage(
          err.message ||
            "Failed to load files"
        );
      } finally {
        setFilesLoading(false);
      }
    };

  // =========================
  // FILE SELECTION
  // =========================

  const handleFileSelection =
    (event) => {
      const selected =
        Array.from(
          event.target.files || []
        );

      if (!selected.length) {
        return;
      }

      const invalidFiles =
        selected.filter(
          (file) =>
            !isAllowedFile(file)
        );

      if (invalidFiles.length) {
        showMessage(
          "Only JPG, PNG, WEBP, PDF files up to 5 MB are allowed."
        );

        event.target.value = "";
        return;
      }

      if (selected.length > 5) {
        showMessage(
          "Maximum 5 files can be uploaded at once."
        );

        event.target.value = "";
        return;
      }

      setSelectedFiles(
        selected
      );
    };

  // =========================
  // UPLOAD FILES
  // =========================

  const uploadSelectedFiles =
    async () => {
      const token =
        getToken();

      if (!token) {
        openAuth("login");
        return;
      }

      if (!selectedFiles.length) {
        showMessage(
          "Please select at least one file."
        );
        return;
      }

      try {
        setFileUploading(true);

        const formData =
          new FormData();

        selectedFiles.forEach(
          (file) => {
            formData.append(
              "files",
              file
            );
          }
        );

        const response =
          await fetch(
            `${API_URL}/files/upload-multiple`,
            {
              method: "POST",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "File upload failed"
          );
        }

        showMessage(
          `${data.count || selectedFiles.length} file(s) uploaded successfully 🎉`
        );

        setSelectedFiles([]);

        await loadFiles();
      } catch (err) {
        showMessage(
          err.message ||
            "File upload failed"
        );
      } finally {
        setFileUploading(false);
      }
    };

  // =========================
  // PREVIEW FILE
  // =========================

  const previewFileItem =
    async (file) => {
      const token =
        getToken();

      if (!token) {
        openAuth("login");
        return;
      }

      try {
        setPreviewLoading(true);

        setPreviewFile(file);
        setPreviewUrl("");

        const response =
          await fetch(
            `${API_URL}/files/${file._id}/download`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          const data =
            await response.json()
              .catch(() => ({}));

          throw new Error(
            data.message ||
              data.error ||
              "Failed to preview file"
          );
        }

        const blob =
          await response.blob();

        const url =
          URL.createObjectURL(
            blob
          );

        setPreviewUrl(url);
      } catch (err) {
        setPreviewFile(null);

        showMessage(
          err.message ||
            "Failed to preview file"
        );
      } finally {
        setPreviewLoading(false);
      }
    };

  const closePreview =
    () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      setPreviewUrl("");
      setPreviewFile(null);
    };

  // =========================
  // DOWNLOAD FILE
  // =========================

  const downloadFile =
    async (file) => {
      const token =
        getToken();

      if (!token) {
        openAuth("login");
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/files/${file._id}/download`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          const data =
            await response.json()
              .catch(() => ({}));

          throw new Error(
            data.message ||
              data.error ||
              "Download failed"
          );
        }

        const blob =
          await response.blob();

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;
        link.download =
          file.originalName ||
          file.fileName;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
          url
        );

        showMessage(
          "File downloaded successfully"
        );
      } catch (err) {
        showMessage(
          err.message ||
            "Download failed"
        );
      }
    };

  // =========================
  // DELETE FILE
  // =========================

  const deleteFile =
    async () => {
      const file =
        deleteFileTarget;

      if (!file) {
        return;
      }

      const token =
        getToken();

      if (!token) {
        setDeleteFileTarget(
          null
        );

        openAuth("login");
        return;
      }

      try {
        setDeleteLoading(true);

        const response =
          await fetch(
            `${API_URL}/files/${file._id}`,
            {
              method: "DELETE",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to delete file"
          );
        }

        setFiles(
          (currentFiles) =>
            currentFiles.filter(
              (item) =>
                item._id !==
                file._id
            )
        );

        setDeleteFileTarget(
          null
        );

        showMessage(
          "File deleted successfully"
        );
      } catch (err) {
        showMessage(
          err.message ||
            "Failed to delete file"
        );
      } finally {
        setDeleteLoading(false);
      }
    };

  // =========================
  // PAGINATION
  // =========================

  const handlePageChange =
    (event, value) => {
      setPage(value);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  const goToNextCursor =
    () => {
      if (!nextCursor) {
        return;
      }

      setCursorHistory(
        (history) => [
          ...history,
          cursor,
        ]
      );

      setCursor(nextCursor);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  const goToPreviousCursor =
    () => {
      if (!cursorHistory.length) {
        setCursor(null);
        return;
      }

      const history =
        [...cursorHistory];

      const previousCursor =
        history.pop() ??
        null;

      setCursorHistory(
        history
      );

      setCursor(
        previousCursor
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  // =========================
  // SORT
  // =========================

  const handleSortChange =
    (event) => {
      setSort(
        event.target.value
      );

      setPage(1);
      setCursor(null);
      setNextCursor(null);
      setCursorHistory([]);
    };

  // =========================
  // EFFECTS
  // =========================

  useEffect(() => {
    if (isLoggedIn) {
      loadProducts();
    }
  }, [isLoggedIn, page, sort, cursor]);

  useEffect(() => {
    loadCartCount();
  }, [isLoggedIn]);

  // =========================
  // UI
  // =========================

  // Logged-out users see only the authentication screen.
  if (!isLoggedIn) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#0b1018",
          p: 2,
          boxSizing: "border-box",
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 4,
            boxShadow: 8,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Typography
              variant="h3"
              textAlign="center"
              fontWeight={800}
              color="primary"
              sx={{
                mb: 1,
                fontSize: {
                  xs: "2.1rem",
                  sm: "2.7rem",
                },
              }}
            >
              {authMode === "login"
                ? "Welcome Back! 👋"
                : "Create Account 🚀"}
            </Typography>

            <Typography
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              {authMode === "login"
                ? "Login to continue shopping"
                : "Create your Flip Commerce account"}
            </Typography>

            <Tabs
              value={authMode}
              onChange={(event, value) => {
                setAuthMode(value);
                setAuthError("");
              }}
              centered
              sx={{ mb: 3 }}
            >
              <Tab value="login" label="LOGIN" />
              <Tab value="register" label="REGISTER" />
            </Tabs>

            {authError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {authError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (authMode === "login") {
                    loginUser();
                  } else {
                    registerUser();
                  }
                }
              }}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={authLoading}
              onClick={
                authMode === "login"
                  ? loginUser
                  : registerUser
              }
              sx={{
                py: 1.4,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                ? "LOGIN"
                : "CREATE ACCOUNT"}
            </Button>

            <Divider sx={{ my: 3 }}>OR</Divider>

            <Typography
              textAlign="center"
              color="text.secondary"
            >
              {authMode === "login"
                ? "New to Flip Commerce?"
                : "Already have an account?"}
            </Typography>

            <Button
              fullWidth
              variant="text"
              disabled={authLoading}
              onClick={() => {
                setAuthMode(
                  authMode === "login"
                    ? "register"
                    : "login"
                );
                setAuthError("");
                setPassword("");
              }}
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              {authMode === "login"
                ? "CREATE AN ACCOUNT"
                : "LOGIN INSTEAD"}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "#f5f7fb",
      }}
    >
      {/* =====================
          NAVBAR
      ====================== */}

      <AppBar
        position="sticky"
        elevation={3}
      >
        <Toolbar>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              flexGrow: 1,
            }}
          >
            Flip Commerce
          </Typography>

          <Button color="inherit">
            Shop
          </Button>

          {/* FILES */}

          <IconButton
            color="inherit"
            onClick={() => {
              if (!isLoggedIn) {
                openAuth("login");
                return;
              }

              loadFiles();
            }}
            title="My Files"
          >
            <FolderIcon />
          </IconButton>

          {/* WISHLIST */}

          <IconButton
            color="inherit"
            onClick={() => {
              if (!isLoggedIn) {
                openAuth("login");
                return;
              }

              loadWishlist();
            }}
            title="Wishlist"
          >
            <FavoriteBorderIcon />
          </IconButton>

          {/* CART */}

          <IconButton
            color="inherit"
            onClick={() => {
              if (!isLoggedIn) {
                openAuth("login");
                return;
              }

              loadCart();
            }}
            title="Cart"
          >
            <Badge
              badgeContent={
                cartCount
              }
              color="error"
              showZero
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* AUTH */}

          {isLoggedIn ? (
            <Button
              color="inherit"
              variant="outlined"
              startIcon={
                <LogoutIcon />
              }
              onClick={
                logout
              }
              sx={{
                ml: 2,
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              color="inherit"
              variant="outlined"
              startIcon={
                <LoginIcon />
              }
              onClick={() =>
                openAuth(
                  "login"
                )
              }
              sx={{
                ml: 2,
              }}
            >
              Login / Register
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* =====================
          PRODUCTS
      ====================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: 5,
        }}
      >
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            flexWrap:
              "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              fontWeight={800}
            >
              Products
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
              }}
            >
              Browse our latest
              products and find
              something you love.
            </Typography>
          </Box>

          <FormControl
            sx={{
              minWidth: 220,
            }}
          >
            <InputLabel>
              Sort by Price
            </InputLabel>

            <Select
              value={sort}
              label="Sort by Price"
              onChange={
                handleSortChange
              }
            >
              <MenuItem value="default">
                Default
              </MenuItem>

              <MenuItem value="low-high">
                Price: Low → High
              </MenuItem>

              <MenuItem value="high-low">
                Price: High → Low
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Chip
            label={`${totalProducts} Products`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent:
                "center",
              py: 10,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Grid
            container
            spacing={3}
          >
            {products.map(
              (product) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={
                    product._id
                  }
                >
                  <Card
                    sx={{
                      height: "100%",
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      borderRadius: 3,
                      transition:
                        "0.2s",
                      "&:hover": {
                        transform:
                          "translateY(-5px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 180,
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        bgcolor:
                          "#e8f0fe",
                        fontSize: 70,
                      }}
                    >
                      🛍️
                    </Box>

                    <CardContent
                      sx={{
                        flexGrow: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                      >
                        {
                          product.name
                        }
                      </Typography>

                      <Typography
                        variant="h5"
                        color="primary"
                        fontWeight={800}
                      >
                        ₹
                        {Number(
                          product.price
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          mt: 1,
                        }}
                      >
                        Stock:{" "}
                        {
                          product.stock
                        }
                      </Typography>
                    </CardContent>

                    <CardActions
                      sx={{
                        px: 2,
                        pb: 2,
                      }}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={
                          <ShoppingCartIcon />
                        }
                        onClick={() =>
                          addToCart(
                            product._id
                          )
                        }
                      >
                        Add to Cart
                      </Button>

                      <IconButton
                        color="primary"
                        onClick={() =>
                          addToWishlist(
                            product._id
                          )
                        }
                      >
                        <FavoriteBorderIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              )
            )}
          </Grid>
        )}

        {!loading &&
          products.length === 0 &&
          !error && (
            <Alert
              severity="info"
              sx={{
                mt: 3,
              }}
            >
              No products found.
            </Alert>
          )}

        {/* PAGINATION */}

        {!loading &&
        PAGINATION_MODE ===
          "cursor" ? (
          <Box
            sx={{
              mt: 5,
              display: "flex",
              justifyContent:
                "center",
              alignItems:
                "center",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              disabled={
                !cursorHistory.length
              }
              onClick={
                goToPreviousCursor
              }
            >
              Previous
            </Button>

            <Chip
              label="Cursor Pagination"
              color="primary"
              variant="outlined"
            />

            <Button
              variant="contained"
              disabled={
                !nextCursor
              }
              onClick={
                goToNextCursor
              }
            >
              Next
            </Button>
          </Box>
        ) : (
          !loading &&
          PAGINATION_MODE !==
            "cursor" &&
          totalPages > 1 && (
            <Box
              sx={{
                mt: 5,
                display: "flex",
                justifyContent:
                  "center",
              }}
            >
              <Pagination
                count={
                  totalPages
                }
                page={page}
                onChange={
                  handlePageChange
                }
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )
        )}
      </Container>

      {/* =====================
          FILES MODAL
      ====================== */}

      <Dialog
        open={filesOpen}
        onClose={() =>
          setFilesOpen(false)
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#1976d2",
            fontSize: "1.8rem",
          }}
        >
          My Files 📁
        </DialogTitle>

        <DialogContent dividers>
          {/* UPLOAD AREA */}

          <Card
            variant="outlined"
            sx={{
              mb: 3,
              borderRadius: 3,
              borderStyle:
                "dashed",
              p: 3,
              textAlign:
                "center",
            }}
          >
            <UploadFileIcon
              sx={{
                fontSize: 55,
                color:
                  "primary.main",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Upload Files
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mb: 2,
              }}
            >
              JPG, PNG, WEBP or PDF
              • Maximum 5 MB each
              • Maximum 5 files
            </Typography>

            <Button
              component="label"
              variant="outlined"
              startIcon={
                <UploadFileIcon />
              }
              disabled={
                fileUploading
              }
            >
              Choose Files

              <input
                hidden
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={
                  handleFileSelection
                }
              />
            </Button>

            {selectedFiles.length >
              0 && (
              <Box
                sx={{
                  mt: 2,
                }}
              >
                <Typography
                  fontWeight={700}
                  sx={{
                    mb: 1,
                  }}
                >
                  Selected Files
                </Typography>

                {selectedFiles.map(
                  (
                    file,
                    index
                  ) => (
                    <Chip
                      key={`${file.name}-${index}`}
                      label={`${file.name} • ${formatFileSize(file.size)}`}
                      sx={{
                        m: 0.5,
                      }}
                    />
                  )
                )}

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={
                      <UploadFileIcon />
                    }
                    onClick={
                      uploadSelectedFiles
                    }
                    disabled={
                      fileUploading
                    }
                  >
                    {fileUploading
                      ? "Uploading..."
                      : "Upload Selected Files"}
                  </Button>
                </Box>
              </Box>
            )}

            {fileUploading && (
              <LinearProgress
                sx={{
                  mt: 2,
                }}
              />
            )}
          </Card>

          {/* FILE LIST */}

          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              mb: 2,
            }}
          >
            Your Files
          </Typography>

          {filesLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "center",
                py: 6,
              }}
            >
              <CircularProgress />
            </Box>
          ) : files.length ===
            0 ? (
            <Alert severity="info">
              No files uploaded yet.
            </Alert>
          ) : (
            <Box>
              {files.map(
                (file) => (
                  <Card
                    key={
                      file._id
                    }
                    variant="outlined"
                    sx={{
                      mb: 2,
                      borderRadius: 3,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          gap: 2,
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 0,
                            flexGrow: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {file.originalName}
                          </Typography>

                          <Box
                            sx={{
                              display:
                                "flex",
                              gap: 1,
                              mt: 1,
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <Chip
                              size="small"
                              label={
                                file.mimeType
                              }
                            />

                            <Chip
                              size="small"
                              label={formatFileSize(
                                file.size
                              )}
                              color="primary"
                              variant="outlined"
                            />
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 1,
                            }}
                          >
                            Uploaded:{" "}
                            {file.createdAt
                              ? new Date(
                                  file.createdAt
                                ).toLocaleString()
                              : "—"}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display:
                              "flex",
                            gap: 1,
                          }}
                        >
                          {/* PREVIEW */}

                          <IconButton
                            color="primary"
                            title="Preview"
                            onClick={() =>
                              previewFileItem(
                                file
                              )
                            }
                          >
                            <VisibilityIcon />
                          </IconButton>

                          {/* DOWNLOAD */}

                          <IconButton
                            color="success"
                            title="Download"
                            onClick={() =>
                              downloadFile(
                                file
                              )
                            }
                          >
                            <DownloadIcon />
                          </IconButton>

                          {/* DELETE */}

                          <IconButton
                            color="error"
                            title="Delete"
                            onClick={() =>
                              setDeleteFileTarget(
                                file
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setFilesOpen(false)
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================
          DELETE CONFIRMATION
      ====================== */}

      <Dialog
        open={Boolean(
          deleteFileTarget
        )}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteFileTarget(
              null
            );
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#d32f2f",
            fontSize: "1.5rem",
          }}
        >
          Delete File?
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to
            delete{" "}
            <strong>
              {
                deleteFileTarget?.originalName
              }
            </strong>
            ?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            disabled={
              deleteLoading
            }
            onClick={() =>
              setDeleteFileTarget(
                null
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={
              deleteLoading ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <DeleteIcon />
              )
            }
            disabled={
              deleteLoading
            }
            onClick={
              deleteFile
            }
          >
            {deleteLoading
              ? "Deleting..."
              : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================
          PREVIEW MODAL
      ====================== */}

      <Dialog
        open={Boolean(
          previewFile
        )}
        onClose={
          closePreview
        }
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          {previewFile?.originalName ||
            "File Preview"}
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            minHeight: 500,
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            bgcolor:
              "#f5f5f5",
          }}
        >
          {previewLoading ? (
            <CircularProgress />
          ) : previewUrl &&
            previewFile?.mimeType?.startsWith(
              "image/"
            ) ? (
            <Box
              component="img"
              src={previewUrl}
              alt={
                previewFile.originalName
              }
              sx={{
                maxWidth:
                  "100%",
                maxHeight:
                  "70vh",
                objectFit:
                  "contain",
                borderRadius: 2,
              }}
            />
          ) : previewUrl &&
            previewFile?.mimeType ===
              "application/pdf" ? (
            <Box
              component="iframe"
              src={previewUrl}
              title={
                previewFile.originalName
              }
              sx={{
                width: "100%",
                height: "70vh",
                border: "none",
                borderRadius: 2,
                bgcolor:
                  "white",
              }}
            />
          ) : (
            <Alert severity="info">
              Preview is not available
              for this file type.
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          {previewFile && (
            <Button
              variant="contained"
              startIcon={
                <DownloadIcon />
              }
              onClick={() =>
                downloadFile(
                  previewFile
                )
              }
            >
              Download
            </Button>
          )}

          <Button
            onClick={
              closePreview
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================
          CART MODAL
      ====================== */}

      <Dialog
        open={cartOpen}
        onClose={() =>
          setCartOpen(false)
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#1976d2",
            fontSize: "1.8rem",
          }}
        >
          Your Cart 🛒
        </DialogTitle>

        <DialogContent dividers>
          {cartLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "center",
                py: 6,
              }}
            >
              <CircularProgress />
            </Box>
          ) : cartItems.length ===
            0 ? (
            <Alert severity="info">
              Your cart is empty.
            </Alert>
          ) : (
            <>
              {cartItems.map(
                (item) => {
                  const id =
                    item._id ||
                    item.id;

                  const price =
                    Number(
                      item.product
                        ?.price || 0
                    );

                  const qty =
                    Number(
                      item.qty || 0
                    );

                  return (
                    <Card
                      key={id}
                      variant="outlined"
                      sx={{
                        mb: 2,
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            gap: 2,
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              fontWeight={
                                700
                              }
                            >
                              {item
                                .product
                                ?.name ||
                                "Product"}
                            </Typography>

                            <Typography color="primary">
                              ₹
                              {price.toLocaleString(
                                "en-IN"
                              )}
                            </Typography>

                            <Typography color="text.secondary">
                              Item Total: ₹
                              {(
                                price *
                                qty
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              onClick={() =>
                                updateCart(
                                  id,
                                  qty -
                                    1
                                )
                              }
                            >
                              −
                            </IconButton>

                            <Typography fontWeight={700}>
                              {qty}
                            </Typography>

                            <IconButton
                              onClick={() =>
                                updateCart(
                                  id,
                                  qty +
                                    1
                                )
                              }
                            >
                              +
                            </IconButton>

                            <IconButton
                              color="error"
                              onClick={() =>
                                deleteCart(
                                  id
                                )
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                }
              )}

              <Typography
                variant="h5"
                fontWeight={800}
                textAlign="right"
              >
                Total: ₹
                {cartTotal.toLocaleString(
                  "en-IN"
                )}
              </Typography>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setCartOpen(false)
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================
          WISHLIST MODAL
      ====================== */}

      <Dialog
        open={wishlistOpen}
        onClose={() =>
          setWishlistOpen(false)
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#7c3aed",
            fontSize: "1.8rem",
          }}
        >
          Your Wishlist ❤️
        </DialogTitle>

        <DialogContent dividers>
          {wishlistLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "center",
                py: 6,
              }}
            >
              <CircularProgress />
            </Box>
          ) : wishlistItems.length ===
            0 ? (
            <Alert severity="info">
              Your wishlist is empty.
            </Alert>
          ) : (
            <>
              {wishlistItems.map(
                (item) => {
                  const id =
                    item._id ||
                    item.id;

                  const price =
                    Number(
                      item.product
                        ?.price || 0
                    );

                  return (
                    <Card
                      key={id}
                      variant="outlined"
                      sx={{
                        mb: 2,
                      }}
                    >
                      <CardContent
                        sx={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          gap: 2,
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={
                              700
                            }
                          >
                            {item
                              .product
                              ?.name ||
                              "Product"}
                          </Typography>

                          <Typography color="primary">
                            ₹
                            {price.toLocaleString(
                              "en-IN"
                            )}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display:
                              "flex",
                            gap: 1,
                          }}
                        >
                          <Button
                            variant="contained"
                            onClick={() =>
                              addToCart(
                                item
                                  .product
                                  ?._id
                              )
                            }
                          >
                            Add to Cart
                          </Button>

                          <IconButton
                            color="error"
                            onClick={() =>
                              deleteWishlist(
                                id
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setWishlistOpen(
                false
              )
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================
          SNACKBAR
      ====================== */}

      <Snackbar
        open={
          snackbar.open
        }
        autoHideDuration={
          2500
        }
        onClose={
          closeSnackbar
        }
        message={
          snackbar.message
        }
        anchorOrigin={{
          vertical:
            "bottom",
          horizontal:
            "center",
        }}
      />
    </Box>
  );
}

export default App;