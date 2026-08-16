// ponytail: sab data RAM me hai, server restart = data gaya. DB tab jab persist chahiye.
let nextId = 1;
export const newId = () => String(nextId++);

export const findById = (list, id) => list.find((x) => x.id === id);

// list me se id nikaal ke delete karo, deleted item wapas do (nahi mila to undefined)
export const removeById = (list, id) => {
  const i = list.findIndex((x) => x.id === id);
  return i === -1 ? undefined : list.splice(i, 1)[0];
};

export const db = {
  users: [],

  products: [
    { id: newId(), name: "Wireless Mouse", price: 799, stock: 42 },
    { id: newId(), name: "Mechanical Keyboard", price: 3499, stock: 15 },
    { id: newId(), name: "USB-C Hub 7-in-1", price: 1899, stock: 8 },
    { id: newId(), name: "27 inch 4K Monitor", price: 24999, stock: 3 },
  ],
  // In-memory collections
  cart: [], // { id, productId, qty }
  wishlist: [], // { id, productId }
};
