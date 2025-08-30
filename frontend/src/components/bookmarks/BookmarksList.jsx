import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axios";
import BookmarksForm from "./BookmarksForm";
import BookmarkCard from "./BookmarkCard";
import { AnimatePresence } from "framer-motion";
import Toast from "../common/Toast";

const palette = { primary: "#4f46e5", muted: "#6b7280", surface: "#f8fafc" };

export default function BookmarksList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    action: null,
  });

  // Track pending deletions per-bookmark so multiple deletes can be undone independently
  const pendingRef = useRef(new Map());

  useEffect(() => {
    load();
  }, []);

  async function load({ p = 1, append = false } = {}) {
    setLoading(true);
    try {
      const res = await axios.get(`/bookmarks?limit=12&page=${p}`);
      if (append) setItems((s) => [...s, ...res.data.items]);
      else setItems(res.data.items);
      setTotal(res.data.total);
      setPage(res.data.page);
    } finally {
      setLoading(false);
    }
  }

  async function create(data, { reset } = {}) {
    // optimistic
    const temp = {
      _id: "temp-" + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      pinned: !!data.pinned,
    };
    setItems((s) => [temp, ...s]);
    try {
      const res = await axios.post("/bookmarks", data);
      setItems((s) => [res.data, ...s.filter((x) => x._id !== temp._id)]);
      reset?.();
      setToast({ open: true, message: "Bookmark added" });
    } catch (err) {
      setItems((s) => s.filter((x) => x._id !== temp._id));
      setToast({
        open: true,
        message: err?.response?.data?.msg || "Failed to add",
      });
    }
  }

  async function edit(id, payload) {
    const prev = items;
    setItems((s) =>
      s.map((it) => (it._id === id ? { ...it, ...payload } : it))
    );
    try {
      const res = await axios.put(`/bookmarks/${id}`, payload);
      setItems((s) => s.map((it) => (it._id === id ? res.data : it)));
      setToast({ open: true, message: "Updated" });
    } catch (err) {
      setItems(prev);
      setToast({
        open: true,
        message: err?.response?.data?.msg || "Failed to update",
      });
    }
  }

  async function remove(bookmark) {
    // optimistic remove with undo
    const prev = items;
    setItems((s) => s.filter((it) => it._id !== bookmark._id));

    // show toast with undo for this specific bookmark
    setToast({
      open: true,
      message: "Deleted — undo?",
      action: () => undoDelete(bookmark._id),
    });

    // schedule server delete after a short delay; store in pendingRef so we can cancel per-bookmark
    const key = bookmark._id;
    const timeoutId = setTimeout(async () => {
      // if entry still present, user didn't undo
      if (!pendingRef.current.has(key)) return;
      try {
        if (!String(key).startsWith("temp-")) {
          await axios.delete(`/bookmarks/${key}`);
        }
      } catch (err) {
        setToast({ open: true, message: "Failed to delete on server" });
      }
      pendingRef.current.delete(key);
    }, 3500);

    pendingRef.current.set(key, { bookmark, timeoutId });
  }

  async function undoDelete(bookmarkId) {
    const entry = pendingRef.current.get(bookmarkId);
    if (!entry) return;
    const { bookmark, timeoutId } = entry;
    clearTimeout(timeoutId);
    // reinsert locally
    setItems((s) => [bookmark, ...s]);
    // If it was a temp item (never saved), create it on the server now.
    if (String(bookmark._id).startsWith("temp-")) {
      try {
        await axios.post("/bookmarks", {
          name: bookmark.name,
          url: bookmark.url,
        });
        setToast({ open: true, message: "Restored" });
      } catch (err) {
        setToast({ open: true, message: "Restore failed" });
      }
    }
    pendingRef.current.delete(bookmarkId);
  }

  async function togglePin(bookmark) {
    // optimistic update: flip pinned and reorder
    const prev = [...items]; // shallow copy used for revert
    const toggled = { ...bookmark, pinned: !bookmark.pinned };
    const newList = prev.map((it) => (it._id === bookmark._id ? toggled : it));
    // sort pinned first (coerce to Number), then createdAt desc
    newList.sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    setItems(newList);

    // If this is a temporary (unsaved) bookmark, don't call server — ask user to save first.
    if (String(bookmark._id).startsWith("temp-")) {
      setToast({ open: true, message: "Save the bookmark before pinning" });
      return;
    }

    try {
      const res = await axios.patch(`/bookmarks/${bookmark._id}/pin`, {
        pinned: toggled.pinned,
      });
      // replace with server authoritative item
      setItems((s) => s.map((it) => (it._id === bookmark._id ? res.data : it)));
      setToast({
        open: true,
        message: res.data.pinned ? "Pinned" : "Unpinned",
      });
    } catch (err) {
      setItems(prev);
      setToast({ open: true, message: "Failed to update pin" });
    }
  }

  return (
    <div className="container">
      <div className="bookmarks-grid">
        <section className="bookmark-add-card">
          <h2 style={{ margin: 0 }}>Add Bookmark</h2>
          <p style={{ marginTop: 6, marginBottom: 12, color: palette.muted }}>
            Save links you visit frequently. Paste URLs with or without protocol
            — we'll normalize it.
          </p>
          <div className="form-narrow">
            <BookmarksForm onSubmit={create} />
          </div>
        </section>

        <section>
          <h2 style={{ margin: "8px 0" }}>Bookmarks</h2>

          {loading && items.length === 0 ? (
            <div style={{ padding: 20, color: palette.muted }}>
              Loading bookmarks…
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: 20, color: palette.muted }}>
              No bookmarks yet — add your first one above.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              <AnimatePresence>
                {items.map((b) => (
                  <BookmarkCard
                    key={b._id}
                    className="bookmark-card-clickable"
                    bookmark={b}
                    onEdit={edit}
                    onDelete={remove}
                    onPin={togglePin}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button
              onClick={() => load({ p: page + 1, append: true })}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: palette.primary,
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Load more
            </button>
            <div style={{ marginLeft: "auto", color: palette.muted }}>
              {total} bookmarks
            </div>
          </div>
        </section>

        <Toast
          open={toast.open}
          message={toast.message}
          onClose={() => setToast({ open: false })}
          action={
            toast.action
              ? {
                  label: "Undo",
                  onClick: async () => {
                    await toast.action();
                    setToast({ open: false });
                  },
                }
              : null
          }
        />
      </div>
    </div>
  );
}
