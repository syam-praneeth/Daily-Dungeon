import React, { useContext, useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import JournalForm from "../components/Journal/JournalForm";
import JournalList from "../components/Journal/JournalList";
import { JournalContext } from "../context/JournalContext";
import { Card, CardBody, CardHeader, CardMenu } from "../components/ui/Card";
import "../components/Dashboard/dashboard-grid.css";

const JournalPage = () => {
  const { journals, journalError } = useContext(JournalContext);
  const [dateFilter, setDateFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const onSearch = useMemo(() => debounce((v) => setQuery(v), 250), []);

  useEffect(() => {
    return () => onSearch.cancel();
  }, [onSearch]);

  const toISTDay = (d) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return journals
      .filter((j) => !dateFilter || toISTDay(j.date) === dateFilter)
      .filter(
        (j) =>
          !q || (j.content || j.text || "").toString().toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [journals, dateFilter, query]);

  const total = journals.length;
  const todayKey = toISTDay(new Date());
  const todayEntries = journals.filter((j) => toISTDay(j.date) === todayKey).length;

  return (
    <div className="journal-page-shell">
      <div className="journal-page-hero">
        <h1>Daily Journal</h1>
        <p>
          Write quickly, format with slash commands, and keep your history easy
          to explore.
        </p>
      </div>

      <div className="dd-grid journal-grid">
        <Card className="col-span-12 sm:col-span-12 dd-card--emerald journal-card">
          <CardHeader title="Summary" actions={<CardMenu />} />
          <CardBody>
            <div className="journal-kpis">
              <div className="kpi journal-kpi">
                <div className="value">{total}</div>
                <div className="label">Total Entries</div>
              </div>
              <div className="kpi journal-kpi">
                <div className="value">{todayEntries}</div>
                <div className="label">Today</div>
              </div>
              <div className="kpi journal-kpi">
                <div className="value">{filtered.length}</div>
                <div className="label">Shown</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-12 sm:col-span-12 dd-card--amber journal-card journal-editor-card">
          <CardHeader title="New Entry" actions={<CardMenu />} />
          <CardBody>
            <JournalForm />
            {journalError && (
              <div className="error" style={{ marginTop: 8 }}>
                {journalError}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="col-span-4 lg:col-span-4 sm:col-span-12 dd-card--slate journal-card">
          <CardHeader title="Filters" actions={<CardMenu />} />
          <CardBody>
            <div className="journal-filter-stack">
              <input
                value={searchInput}
                placeholder="Search content (markdown supported)"
                onChange={(e) => {
                  const next = e.target.value;
                  setSearchInput(next);
                  onSearch(next);
                }}
                aria-label="Search journal entries"
                className="journal-filter-input"
              />

              <label className="journal-filter-label">
                Date
                <input
                  className="journal-filter-input"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </label>

              {dateFilter && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setDateFilter("")}
                >
                  Clear Date
                </button>
              )}
            </div>

            <div className="journal-filter-meta">
              Showing {filtered.length} / {total} entries
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-8 lg:col-span-8 sm:col-span-12 dd-card--violet journal-card">
          <CardHeader
            title="Recent Entries"
            subtitle="Most recent first"
            actions={<CardMenu />}
          />
          <CardBody>
            {filtered.length ? (
              <JournalList items={filtered} />
            ) : (
              <div className="journal-empty">No entries match filters.</div>
            )}
          </CardBody>
        </Card>

      </div>

      <style>{`
        .journal-page-shell {
          max-width: 1300px;
          margin: 20px auto 36px;
          position: relative;
        }

        .journal-page-hero {
          margin: 0 24px 14px;
          padding: 20px 22px;
          border-radius: 20px;
          background:
            radial-gradient(circle at 12% 25%, rgba(245, 158, 11, 0.28), transparent 46%),
            radial-gradient(circle at 80% 10%, rgba(59, 130, 246, 0.24), transparent 43%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.82));
          border: 1px solid rgba(148, 163, 184, 0.32);
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
        }

        .journal-page-hero h1 {
          margin: 0;
          font-size: clamp(1.5rem, 3vw, 2rem);
          line-height: 1.2;
          color: var(--dd-text-primary, #0f172a);
        }

        .journal-page-hero p {
          margin: 8px 0 0;
          font-size: 0.95rem;
          color: var(--dd-text-secondary, #475569);
          max-width: 700px;
        }

        .journal-grid {
          align-items: start;
        }

        .journal-page-shell .journal-card,
        .journal-page-shell .journal-card .dd-card__body {
          overflow: visible;
        }

        .journal-page-shell .journal-card::after {
          display: none;
        }

        .journal-page-shell .journal-card:hover {
          transform: translateY(-2px) scale(1.005);
          box-shadow:
            0 8px 30px rgba(15, 23, 42, 0.09),
            0 3px 10px rgba(15, 23, 42, 0.06);
        }

        .journal-editor-card {
          z-index: 2;
        }

        .journal-filter-stack {
          display: grid;
          gap: 10px;
        }

        .journal-filter-input {
          width: 100%;
          min-height: 40px;
          border-radius: 10px;
          border: 2px solid var(--dd-border-light, rgba(203, 213, 225, 0.6));
          background: rgba(255, 255, 255, 0.78);
          padding: 10px 12px;
          color: var(--dd-text-primary, #0f172a);
          font: inherit;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .journal-filter-input:focus {
          outline: none;
          border-color: var(--dd-primary-500, #3b82f6);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14);
        }

        .journal-filter-label {
          display: grid;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--dd-text-secondary, #475569);
        }

        .journal-filter-meta {
          font-size: 12px;
          color: var(--dd-text-secondary, #64748b);
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed rgba(148, 163, 184, 0.42);
        }

        .journal-empty {
          font-size: 14px;
          color: var(--dd-text-secondary, #64748b);
          padding: 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.5);
        }

        .journal-kpis {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px;
        }

        .journal-kpi {
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(148, 163, 184, 0.28);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.8),
            rgba(248, 250, 252, 0.6)
          );
        }

        [data-theme="dark"] .journal-page-hero {
          background:
            radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.22), transparent 48%),
            radial-gradient(circle at 78% 18%, rgba(59, 130, 246, 0.22), transparent 44%),
            linear-gradient(135deg, rgba(30, 41, 59, 0.88), rgba(15, 23, 42, 0.85));
          border-color: rgba(148, 163, 184, 0.28);
        }

        [data-theme="dark"] .journal-filter-input {
          background: rgba(30, 41, 59, 0.85);
          border-color: var(--dd-border-medium, #334155);
        }

        [data-theme="dark"] .journal-empty,
        [data-theme="dark"] .journal-kpi {
          background: rgba(30, 41, 59, 0.72);
          border-color: rgba(71, 85, 105, 0.55);
        }

        @media (max-width: 767px) {
          .journal-page-hero {
            margin: 0 16px 12px;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default JournalPage;
