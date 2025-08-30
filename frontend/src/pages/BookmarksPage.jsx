import React from "react";
import BookmarksList from "../components/bookmarks/BookmarksList";

export default function BookmarksPage() {
  return (
    <main>
      <div className="container">
        <h1>Bookmarks</h1>
        <BookmarksList />
      </div>
    </main>
  );
}
