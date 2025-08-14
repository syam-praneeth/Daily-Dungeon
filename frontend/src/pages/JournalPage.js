import React, { useContext, useMemo, useState } from "react";
import JournalForm from "../components/Journal/JournalForm";
import JournalList from "../components/Journal/JournalList";
import { JournalContext } from "../context/JournalContext";
import { Card, CardBody, CardHeader, CardMenu } from "../components/ui/Card";
import "../components/Dashboard/dashboard-grid.css";
import debounce from "lodash.debounce";

const JournalPage = () => {
  const { journals, journalError } = useContext(JournalContext);
  const [dateFilter, setDateFilter] = useState("");
  const [query, setQuery] = useState("");
  const onSearch = useMemo(() => debounce((v) => setQuery(v), 250), []);

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
  const todayEntries = journals.filter(
    (j) => toISTDay(j.date) === todayKey
  ).length;

  return (
    <div style={{ maxWidth: 1280, margin: "16px auto", overflow: "hidden" }}>
      <div className="dd-grid">
        <Card className="col-span-12 sm:col-span-12 dd-card--amber">
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

        <Card className="col-span-4 lg:col-span-4 sm:col-span-12 dd-card--slate">
          <CardHeader title="Filters" actions={<CardMenu />} />
          <CardBody>
            <div className="grid" style={{ gap: 8 }}>
              <input
                placeholder="Search content (markdown supported)"
                onChange={(e) => onSearch(e.target.value)}
                aria-label="Search journal entries"
              />
              <label style={{ fontSize: 12, color: "#64748b" }}>
                Date
                <input
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
                  style={{ fontSize: 12 }}
                >
                  Clear Date
                </button>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              Showing {filtered.length} / {total} entries
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-8 lg:col-span-8 sm:col-span-12 dd-card--violet">
          <CardHeader
            title="Recent Entries"
            subtitle="Most recent first"
            actions={<CardMenu />}
          />
          <CardBody>
            {filtered.length ? (
              <JournalList items={filtered} />
            ) : (
              <div style={{ fontSize: 14 }}>No entries match filters.</div>
            )}
          </CardBody>
        </Card>

        <Card className="col-span-12 sm:col-span-12 dd-card--emerald">
          <CardHeader title="Summary" actions={<CardMenu />} />
          <CardBody>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                gap: 12,
              }}
            >
              <div className="kpi">
                <div className="value">{total}</div>
                <div className="label">Total Entries</div>
              </div>
              <div className="kpi">
                <div className="value">{todayEntries}</div>
                <div className="label">Today</div>
              </div>
              <div className="kpi">
                <div className="value">{filtered.length}</div>
                <div className="label">Shown</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default JournalPage;
