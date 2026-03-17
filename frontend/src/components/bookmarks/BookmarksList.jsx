import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "../../api/axios";
import BookmarksForm from "./BookmarksForm";
import BookmarkCard from "./BookmarkCard";
import Toast from "../common/Toast";

export default function BookmarksList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    action: null,
  });

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
    const temp = {
      _id: `temp-${Date.now()}`,
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
    setItems((s) => s.map((it) => (it._id === id ? { ...it, ...payload } : it)));

    try {
      const res = await axios.put(`/bookmarks/${id}`, payload);
      setItems((s) => s.map((it) => (it._id === id ? res.data : it)));
      setToast({ open: true, message: "Updated" });
    } catch (err) {
      setItems(prev);
      setToast({ open: true, message: err?.response?.data?.msg || "Failed to update" });
    }
  }

  async function remove(bookmark) {
    setItems((s) => s.filter((it) => it._id !== bookmark._id));

    setToast({
      open: true,
      message: "Deleted - undo?",
      action: () => undoDelete(bookmark._id),
    });

    const key = bookmark._id;
    const timeoutId = setTimeout(async () => {
      if (!pendingRef.current.has(key)) return;
      try {
        if (!String(key).startsWith("temp-")) {
          await axios.delete(`/bookmarks/${key}`);
        }
      } catch {
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
    setItems((s) => [bookmark, ...s]);

    if (String(bookmark._id).startsWith("temp-")) {
      try {
        await axios.post("/bookmarks", {
          name: bookmark.name,
          url: bookmark.url,
        });
        setToast({ open: true, message: "Restored" });
      } catch {
        setToast({ open: true, message: "Restore failed" });
      }
    }

    pendingRef.current.delete(bookmarkId);
  }

  async function togglePin(bookmark) {
    const prev = [...items];
    const toggled = { ...bookmark, pinned: !bookmark.pinned };

    const nextItems = prev.map((it) => (it._id === bookmark._id ? toggled : it));
    nextItems.sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    setItems(nextItems);

    if (String(bookmark._id).startsWith("temp-")) {
      setToast({ open: true, message: "Save bookmark first, then pin" });
      return;
    }

    try {
      const res = await axios.patch(`/bookmarks/${bookmark._id}/pin`, {
        pinned: toggled.pinned,
      });
      setItems((s) => s.map((it) => (it._id === bookmark._id ? res.data : it)));
      setToast({ open: true, message: res.data.pinned ? "Pinned" : "Unpinned" });
    } catch {
      setItems(prev);
      setToast({ open: true, message: "Failed to update pin" });
    }
  }

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((b) => {
      const matchesQuery =
        !q ||
        (b.name || "").toLowerCase().includes(q) ||
        (b.url || "").toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" || (filter === "pinned" ? !!b.pinned : !b.pinned);
      return matchesQuery && matchesFilter;
    });
  }, [items, query, filter]);

  const pinnedCount = items.filter((i) => i.pinned).length;

  return (
    <div className="bookmark-hub">
      <section className="bookmark-hub__hero">
        <h2>Bookmark Vault</h2>
        <p>
          Curate your study and productivity links with pin-first sorting, quick
          edit actions, and smooth card interactions.
        </p>
        <div className="bookmark-hub__meta">
          <span>{total} total</span>
          <span>{pinnedCount} pinned</span>
          <span>{filteredItems.length} visible</span>
        </div>
      </section>

      <div className="bookmark-hub__layout">
        <aside className="bookmark-hub__composer">
          <h3>Add Bookmark</h3>
          <BookmarksForm onSubmit={create} submitLabel="Add to Vault" />
        </aside>

        <section className="bookmark-hub__list-wrap">
          <div className="bookmark-hub__toolbar">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or URL"
              aria-label="Search bookmarks"
            />
            <div className="bookmark-hub__segmented" role="tablist" aria-label="Bookmark filter">
              <button
                type="button"
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={filter === "pinned" ? "active" : ""}
                onClick={() => setFilter("pinned")}
              >
                Pinned
              </button>
              <button
                type="button"
                className={filter === "unpinned" ? "active" : ""}
                onClick={() => setFilter("unpinned")}
              >
                Others
              </button>
            </div>
          </div>

          {loading && items.length === 0 ? (
            <div className="bookmark-hub__empty">Loading bookmarks...</div>
          ) : filteredItems.length === 0 ? (
            <div className="bookmark-hub__empty">No matching bookmarks.</div>
          ) : (
            <motion.div
              layout
              className="bookmark-hub__grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AnimatePresence>
                {filteredItems.map((b) => (
                  <BookmarkCard
                    key={b._id}
                    bookmark={b}
                    onEdit={edit}
                    onDelete={remove}
                    onPin={togglePin}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          <div className="bookmark-hub__footer">
            <button type="button" onClick={() => load({ p: page + 1, append: true })}>
              Load More
            </button>
            <span>Page {page}</span>
          </div>
        </section>
      </div>

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

      <style>{`
        .bookmark-hub {
          display: grid;
          gap: 14px;
        }

        .bookmark-hub__hero {
          border-radius: 20px;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background:
            radial-gradient(circle at 12% 10%, rgba(14, 165, 233, 0.28), transparent 44%),
            radial-gradient(circle at 88% 20%, rgba(249, 115, 22, 0.24), transparent 46%),
            linear-gradient(125deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
          box-shadow: 0 12px 34px rgba(15, 23, 42, 0.08);
          padding: 18px;
        }

        .bookmark-hub__hero h2 {
          margin: 0;
          font-size: 1.35rem;
        }

        .bookmark-hub__hero p {
          margin: 6px 0 0;
          color: #475569;
          max-width: 720px;
        }

        .bookmark-hub__meta {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .bookmark-hub__meta span {
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(148, 163, 184, 0.4);
          font-size: 12px;
          font-weight: 600;
          color: #334155;
        }

        .bookmark-hub__layout {
          display: grid;
          gap: 14px;
          grid-template-columns: 330px minmax(0, 1fr);
          align-items: start;
        }

        .bookmark-hub__composer,
        .bookmark-hub__list-wrap {
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.34);
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
          padding: 14px;
        }

        .bookmark-hub__composer h3 {
          margin: 0 0 10px;
        }

        .bookmark-hub__toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
          margin-bottom: 12px;
          align-items: center;
        }

        .bookmark-hub__toolbar input {
          min-height: 42px;
          border-radius: 10px;
          border: 2px solid rgba(203, 213, 225, 0.7);
          padding: 0 12px;
          font: inherit;
        }

        .bookmark-hub__toolbar input:focus {
          outline: none;
          border-color: #0284c7;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.18);
        }

        .bookmark-hub__segmented {
          display: inline-flex;
          gap: 6px;
          padding: 4px;
          border-radius: 999px;
          background: #f1f5f9;
          border: 1px solid rgba(148, 163, 184, 0.36);
        }

        .bookmark-hub__segmented button {
          min-height: 34px;
          padding: 0 12px;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .bookmark-hub__segmented button.active {
          background: #0f172a;
          color: #fff;
        }

        .bookmark-hub__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: 12px;
        }

        .bookmark-hub__empty {
          border-radius: 10px;
          border: 1px dashed rgba(148, 163, 184, 0.48);
          background: rgba(248, 250, 252, 0.8);
          color: #64748b;
          padding: 18px;
          text-align: center;
        }

        .bookmark-hub__footer {
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .bookmark-hub__footer button {
          min-height: 38px;
          border: none;
          border-radius: 10px;
          padding: 0 14px;
          color: white;
          background: linear-gradient(130deg, #0ea5e9, #2563eb);
          font-weight: 700;
          cursor: pointer;
        }

        .bookmark-hub__footer span {
          color: #64748b;
          font-size: 13px;
        }

        [data-theme="dark"] .bookmark-hub__hero {
          background:
            radial-gradient(circle at 12% 10%, rgba(14, 165, 233, 0.28), transparent 44%),
            radial-gradient(circle at 88% 20%, rgba(249, 115, 22, 0.24), transparent 46%),
            linear-gradient(125deg, rgba(30, 41, 59, 0.94), rgba(15, 23, 42, 0.88));
        }

        [data-theme="dark"] .bookmark-hub__composer,
        [data-theme="dark"] .bookmark-hub__list-wrap,
        [data-theme="dark"] .bookmark-hub__meta span,
        [data-theme="dark"] .bookmark-hub__segmented {
          background: rgba(30, 41, 59, 0.85);
          border-color: rgba(71, 85, 105, 0.62);
        }

        [data-theme="dark"] .bookmark-hub__hero p,
        [data-theme="dark"] .bookmark-hub__footer span,
        [data-theme="dark"] .bookmark-hub__empty {
          color: #cbd5e1;
        }

        [data-theme="dark"] .bookmark-hub__toolbar input {
          background: rgba(15, 23, 42, 0.85);
          color: #e2e8f0;
          border-color: rgba(71, 85, 105, 0.72);
        }

        [data-theme="dark"] .bookmark-hub__segmented button {
          color: #e2e8f0;
        }

        @media (max-width: 980px) {
          .bookmark-hub__layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .bookmark-hub__toolbar {
            grid-template-columns: 1fr;
          }

          .bookmark-hub__segmented {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
