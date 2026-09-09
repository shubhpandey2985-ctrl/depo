/// <reference types="vite/client" />

import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  Box,
  ChevronRight,
  CirclePlus,
  Clock3,
  Command,
  Cpu,
  LayoutDashboard,
  Menu,
  PackageOpen,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import './styles.css';

import type { Resource } from './types';

import {
  getCurrentUser,
  logout,
} from './services/authService';

import Login from './pages/login';

import {
  initializeResources,
  addResource,
  getAllResources,
} from './services/resourceService';

import { initializeUsers } from './services/userService';

import {
  createIssue,
  getAllIssues,
  returnIssue,
} from './services/issueService';

const nav = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Inventory', icon: Box },
  { label: 'Issue resource', icon: CirclePlus },
  { label: 'History', icon: Clock3 },
  { label: 'People', icon: Users },
  { label: 'Insights', icon: Sparkles },
];

function Brand() {
  return (
    <div className="brand">
      <div>DeepTech</div>
      <span>innovation centre</span>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [role, setRole] = useState<'Admin' | 'User'>(
  currentUser?.role || 'User'
);

  const pageMap: Record<string, string> = {
    overview: 'Overview',
    inventory: 'Inventory',
    'issue-resource': 'Issue resource',
    history: 'History',
    people: 'People',
    insights: 'Insights',
    'add-resource': 'Add resource',
  };

  const [page, setPage] = useState(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    return pageMap[hash] || 'Overview';
  });

  const [profileOpen, setProfileOpen] = useState(false);

  const [resources, setResources] = useState<Resource[]>(() =>
    initializeResources()
  );

  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');

  const [selected, setSelected] = useState<Resource | null>(null);

  const [menu, setMenu] = useState(false);

  const [toast, setToast] = useState('');

  const [issue, setIssue] = useState({
    name: '',
    profession: 'Student',
    returnable: true,
    date: '20 Sep 2026',
  });

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      setPage(pageMap[hash] || 'Overview');
      setSelected(null);
    };

    window.addEventListener('popstate', handlePopState);

    if (!window.location.hash) {
      window.history.replaceState(
        { page: 'Overview' },
        '',
        '#overview'
      );
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Initialize demo users whenever a user is logged in.
  useEffect(() => {
    if (currentUser) {
      initializeUsers();
    }
  }, [currentUser]);

  // IMPORTANT: keep this hook above the login conditional so the hook
  // order never changes when logging in or logging out.
  const filtered = useMemo(
    () =>
      resources.filter(
        (r) =>
          (cat === 'All' || r.category === cat) &&
          r.name.toLowerCase().includes(query.toLowerCase())
      ),
    [resources, cat, query]
  );

  if (!currentUser) {
    return (
      <Login
        onLogin={(user) => {
          setCurrentUser(user);
          setRole(user.role);
          setProfileOpen(false);
          setPage('Overview');
          window.history.replaceState(
            { page: 'Overview' },
            '',
            '#overview'
          );
        }}
      />
    );
  }

  const notify = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast('');
    }, 2800);
  };

  const go = (p: string) => {
    setPage(p);
    setMenu(false);
    setProfileOpen(false);
    setSelected(null);

    const hash = p.replace(/ /g, '-').toLowerCase();

    if (window.location.hash !== `#${hash}`) {
      window.history.pushState(
        { page: p },
        '',
        `#${hash}`
      );
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMenu(false);
    setSelected(null);
    setCurrentUser(null);

    window.history.replaceState(
      { page: 'Login' },
      '',
      window.location.pathname
    );
  };

  // =========================
  // ADD RESOURCE
  // =========================

  const addItem = () => {
    const item: Resource = {
      id: `RES-${String(resources.length + 7).padStart(3, '0')}`,
      name: 'ESP32 Dev Board',
      category: 'Hardware',
      sub: 'Development boards',
      quantity: 8,
      status: 'Available',
      tone: 'blue',
      location: 'Lab 204 · Shelf C',
    };

    const updated = addResource(item);

    setResources(updated);

    notify('ESP32 Dev Board added to inventory');

    go('Inventory');
  };

  // =========================
  // ISSUE RESOURCE
  // =========================

  const completeIssue = () => {
    if (!selected) {
      return notify('Select a resource first');
    }

    if (!issue.name.trim()) {
      return notify('Add a recipient name to continue');
    }

    if (selected.quantity <= 0) {
      return notify('This resource is currently unavailable');
    }

    const newIssue = {
      id: `ISS-${Date.now()}`,

      resourceId: selected.id,

      resourceName: selected.name,

      userId: `USR-${Date.now()}`,

      userName: issue.name,

      profession: issue.profession as
        | 'Student'
        | 'Teacher'
        | 'Staff'
        | 'Researcher'
        | 'Project Member'
        | 'Other',

      // REAL DATE + TIME
      issuedAt: new Date().toISOString(),

      returnable: issue.returnable,

      ...(issue.returnable
        ? {
            returnDate: issue.date,
          }
        : {}),

      status: 'Issued' as const,
    };

    createIssue(newIssue);

    const updatedResources = getAllResources();

    setResources(updatedResources);

    notify(`${selected.name} issued to ${issue.name}`);

    setSelected(null);

    go('History');
  };

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================= */}

      <header>
        <Brand />

        <button
          className="mobile-menu"
          onClick={() => setMenu(!menu)}
          aria-label="Menu"
        >
          {menu ? <X /> : <Menu />}
        </button>

        <nav className={menu ? 'open' : ''}>
          {nav
            .slice(0, currentUser.role === 'User' ? 4 : nav.length)
            .map(({ label, icon: Icon }) => (
              <button
                key={label}
                className={page === label ? 'active' : ''}
                onClick={() => go(label)}
              >
                <Icon /> {label}
              </button>
            ))}
        </nav>

        <div className="tools">

          <div className="search">
            <Search />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources, people…"
            />

            <Command />
          </div>

          <button className="icon">
            <Bell />
          </button>

          <div style={{ position: 'relative' }}>
            <button
              className="avatar"
              onClick={() => setProfileOpen(!profileOpen)}
              title="Account menu"
              aria-label="Account menu"
            >
              {currentUser.name[0].toUpperCase()}
            </button>

            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '220px',
                  background: '#fff',
                  border: '1px solid #e7e9f1',
                  borderRadius: '14px',
                  padding: '12px',
                  boxShadow: '0 16px 40px rgba(35, 42, 75, 0.14)',
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    padding: '8px 10px 12px',
                    borderBottom: '1px solid #edf0f5',
                  }}
                >
                  <strong
                    style={{
                      display: 'block',
                      color: '#18213d',
                      fontSize: '14px',
                    }}
                  >
                    {currentUser.name}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '4px',
                      color: '#7b8195',
                      fontSize: '12px',
                    }}
                  >
                    {currentUser.email}
                  </span>

                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      background: '#f0efff',
                      color: '#665fd8',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {currentUser.role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '9px',
                    background: 'transparent',
                    color: '#c54a4a',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      <main>

        {/* =========================
            OVERVIEW
        ========================= */}

        {page === 'Overview' && (
          <Overview
            role={role}
            go={go}
            setSelected={setSelected}
          />
        )}

        {/* =========================
            INVENTORY
        ========================= */}

        {page === 'Inventory' && (
          <Inventory
            filtered={filtered}
            query={query}
            setQuery={setQuery}
            cat={cat}
            setCat={setCat}
            setSelected={setSelected}
            go={go}
          />
        )}

        {/* =========================
            ISSUE RESOURCE
        ========================= */}

        {page === 'Issue resource' && (
          <Issue
            resources={resources}
            selected={selected}
            setSelected={setSelected}
            issue={issue}
            setIssue={setIssue}
            onSubmit={completeIssue}
          />
        )}

        {/* =========================
            HISTORY
        ========================= */}

        {page === 'History' && (
          <History
            onResourcesChange={setResources}
          />
        )}

        {/* =========================
            PEOPLE
        ========================= */}

        {page === 'People' && <People />}

        {/* =========================
            INSIGHTS
        ========================= */}

        {page === 'Insights' && <Insights />}

        {/* =========================
            ADD RESOURCE
        ========================= */}

        {page === 'Add resource' && (
          <AddResource
            onAdd={addItem}
            go={go}
          />
        )}

        {/* =========================
            RESOURCE DETAILS
        ========================= */}

        {selected && page !== 'Issue resource' && (
          <Details
            resource={selected}
            onIssue={() => go('Issue resource')}
            onClose={() => setSelected(null)}
          />
        )}

      </main>

      {toast && (
        <div className="toast">
          <Sparkles /> {toast}
        </div>
      )}

    </div>
  );
}


/* =========================================================
   OVERVIEW
========================================================= */

function Overview({
  role,
  go,
  setSelected,
}: {
  role: string;
  go: (x: string) => void;
  setSelected: (r: Resource) => void;
}) {
  const currentHour = new Date().getHours();

  const greeting =
    currentHour >= 4 && currentHour < 12
      ? 'Good morning, Admin.'
      : currentHour >= 12 && currentHour < 16
        ? 'Good afternoon, Admin.'
        : currentHour >= 16
          ? 'Good evening, Admin.'
          : 'Good night, Admin.';

  return (
    <>
      <section className="hero">

        <div>
          <p className="eyebrow">
            {role === 'Admin'
              ? 'MONDAY · 09 SEPTEMBER'
              : 'YOUR WORKSPACE'}
          </p>

          <h1>
            {role === 'Admin'
              ? greeting
              : 'Your resources.'}
          </h1>

          <p className="lede">
            {role === 'Admin'
              ? "Here's what is happening across your project resources."
              : 'Everything currently assigned to you, in one place.'}
          </p>
        </div>

        <div className="pulse">

          <span>ACTIVITY PULSE</span>

          <strong>18</strong>

          <p>
            items moved this week <b>↗ 12%</b>
          </p>

          <div className="pulse-line">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>

        </div>

      </section>

      <section className="metrics">

        <article>
          <b>124</b>
          <span>Total items</span>
        </article>

        <article>
          <b>36</b>
          <span>Available now</span>
        </article>

        <article>
          <b>8</b>
          <span>Issued today</span>
        </article>

        <article className="alert">
          <b>3</b>
          <span>Need attention</span>
        </article>

      </section>

      <section className="section-title">

        <div>
          <p className="eyebrow">DISCOVER</p>
          <h2>New collections</h2>
        </div>

        <button
          className="text-btn"
          onClick={() => go('Inventory')}
        >
          View inventory <ChevronRight />
        </button>

      </section>

      <section className="collections">

        {[
          ['Laptops &\naccessories', '12 items', 'laptop'],
          ['Development\ntools', '16 items', 'code'],
          ['Electronics', '24 items', 'chip'],
          ['Tools &\nequipment', '16 items', 'tool'],
        ].map(([n, c, i]) => (
          <button
            key={n}
            className={`collection ${i}`}
            onClick={() => go('Inventory')}
          >

            <span>
              {i === 'chip' ? (
                <Cpu />
              ) : i === 'tool' ? (
                <PackageOpen />
              ) : (
                <Box />
              )}
            </span>

            <h3>{n}</h3>

            <p>{c}</p>

            <ChevronRight />

          </button>
        ))}

      </section>

      <section className="lower">

        <article className="activity">

          <p className="eyebrow">LIVE LOG</p>

          <h2>Activity pulse</h2>

          {[
            'Raspberry Pi 5 issued to Rohan Gupta',
            'Arduino Uno returned to shelf B',
            'New Toolkit Set added to tools',
          ].map((a, i) => (
            <div
              className="event"
              key={a}
            >

              <i className={`dot d${i}`} />

              <span>
                {a}
                <small>{i + 1}h ago</small>
              </span>

            </div>
          ))}

        </article>

        <article className="due">

          <p className="eyebrow">UP NEXT</p>

          <h2>Returns due soon</h2>

          <button
            onClick={() =>
              setSelected({
                id: 'RES-001',
                name: 'Raspberry Pi 5',
                category: 'Hardware',
                sub: 'Development Board',
                quantity: 12,
                status: 'Available',
                tone: 'blue',
              })
            }
          >
            Raspberry Pi 5
            <b>Sep 10</b>
            <ChevronRight />
          </button>

          <button
            onClick={() =>
              setSelected({
                id: 'RES-002',
                name: 'Arduino Uno',
                category: 'Hardware',
                sub: 'Development Board',
                quantity: 18,
                status: 'Available',
                tone: 'green',
              })
            }
          >
            Arduino Uno
            <b>Sep 12</b>
            <ChevronRight />
          </button>

        </article>

      </section>
    </>
  );
}


/* =========================================================
   INVENTORY
========================================================= */

function Inventory({
  filtered,
  query,
  setQuery,
  cat,
  setCat,
  setSelected,
  go,
}: any) {
  return (
    <>
      <section className="page-head">

        <div>
          <p className="eyebrow">RESOURCE LIBRARY</p>

          <h1>Inventory</h1>

          <p className="lede">
            Find the right resource without digging through spreadsheets.
          </p>
        </div>

        <button
          className="primary"
          onClick={() => go('Add resource')}
        >
          <CirclePlus /> Add new item
        </button>

      </section>

      <section className="filters">

        <Search />

        <input
          value={query}
          onChange={(e: any) =>
            setQuery(e.target.value)
          }
          placeholder="Search by name"
        />

        {['All', 'Hardware', 'Software'].map((x) => (
          <button
            key={x}
            onClick={() => setCat(x)}
            className={cat === x ? 'selected' : ''}
          >
            {x}
          </button>
        ))}

        <button
          className="clear"
          onClick={() => {
            setCat('All');
            setQuery('');
          }}
        >
          Clear all
        </button>

      </section>

      <section className="inventory">

        <div className="table-top">
          <b>{filtered.length} resources</b>
          <span>Availability is updated in real time</span>
        </div>

        <div className="table header-row">
          <span>Resource</span>
          <span>Category</span>
          <span>Quantity</span>
          <span>Status</span>
          <span />
        </div>

        {filtered.map((r: Resource) => (
          <button
            className="table resource-row"
            onClick={() => setSelected(r)}
            key={r.id}
          >

            <div className="resource-name">

              <i className={r.tone}>
                {r.category === 'Software'
                  ? <Command />
                  : <Cpu />}
              </i>

              <span>
                <b>{r.name}</b>

                <small>
                  {r.id} · {r.sub}
                </small>
              </span>

            </div>

            <span>{r.category}</span>

            <b>{r.quantity}</b>

            <span
              className={`badge ${
                r.status === 'Available'
                  ? 'available'
                  : 'low'
              }`}
            >
              {r.status}
            </span>

            <ChevronRight />

          </button>
        ))}

      </section>
    </>
  );
}


/* =========================================================
   DETAILS
========================================================= */

function Details({
  resource,
  onIssue,
  onClose,
}: any) {
  return (
    <div
      className="drawer-shade"
      onClick={onClose}
    >

      <aside
        className="detail"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          className="close"
          onClick={onClose}
        >
          <X />
        </button>

        <p className="eyebrow">
          {resource.id}
        </p>

        <div
          className={`resource-art ${resource.tone}`}
        >
          <Cpu />
        </div>

        <h2>{resource.name}</h2>

        <p>
          {resource.category} · {resource.sub}
        </p>

        <div className="availability">

          <b>{resource.quantity}</b>
          {' '}available

          <span className="badge available">
            In stock
          </span>

        </div>

        <div className="stat-grid">

          <span>
            Total
            <b>{resource.quantity}</b>
          </span>

          <span>
            Issued
            <b>0</b>
          </span>

          <span>
            Reserved
            <b>0</b>
          </span>

        </div>

        <h3>Specifications</h3>

        <dl>

          <div>
            <dt>Location</dt>

            <dd>
              {resource.location ||
                'Lab 204 · Shelf B'}
            </dd>
          </div>

          <div>
            <dt>Classification</dt>

            <dd>
              {resource.category} / {resource.sub}
            </dd>
          </div>

        </dl>

        <button
          className="primary full"
          onClick={onIssue}
        >
          Issue resource
          <ChevronRight />
        </button>

      </aside>

    </div>
  );
}


/* =========================================================
   ISSUE RESOURCE
========================================================= */

function Issue({
  resources,
  selected,
  setSelected,
  issue,
  setIssue,
  onSubmit,
}: any) {
  return (
    <>
      <section className="page-head">

        <div>
          <p className="eyebrow">
            ACCOUNTABLE HANDOFF
          </p>

          <h1>Issue a resource</h1>

          <p className="lede">
            A lightweight handoff that keeps every item accountable.
          </p>
        </div>

      </section>

      <div className="steps">

        <b>
          01 <span>Select item</span>
        </b>

        <b className={selected ? 'done' : ''}>
          02 <span>Recipient</span>
        </b>

        <b>
          03 <span>Confirm</span>
        </b>

      </div>

      <section className="issue-layout">

        <div className="issue-form">

          <label>
            Resource

            <select
              value={selected?.id || ''}
              onChange={(e) =>
                setSelected(
                  resources.find(
                    (r: Resource) =>
                      r.id === e.target.value
                  ) || null
                )
              }
            >

              <option value="">
                Select an inventory item
              </option>

              {resources.map((r: Resource) => (
                <option
                  value={r.id}
                  key={r.id}
                  disabled={r.quantity <= 0}
                >
                  {r.name} — {r.quantity} available
                </option>
              ))}

            </select>

          </label>

          {selected && (
            <div className="selected-resource">

              <Cpu />

              <span>
                <b>{selected.name}</b>

                <small>
                  {selected.category} · {selected.sub}
                </small>
              </span>

              <em>
                {selected.quantity} available
              </em>

            </div>
          )}

          <div className="form-grid">

            <label>
              Issued to

              <input
                value={issue.name}
                onChange={(e) =>
                  setIssue({
                    ...issue,
                    name: e.target.value,
                  })
                }
                placeholder="Person's full name"
              />
            </label>

            <label>
              Profession

              <select
                value={issue.profession}
                onChange={(e) =>
                  setIssue({
                    ...issue,
                    profession: e.target.value,
                  })
                }
              >

                {[
                  'Student',
                  'Teacher',
                  'Staff',
                  'Researcher',
                  'Project Member',
                  'Other',
                ].map((x) => (
                  <option key={x}>
                    {x}
                  </option>
                ))}

              </select>

            </label>

          </div>

          <fieldset>

            <legend>Returnable?</legend>

            <button
              className={
                issue.returnable
                  ? 'chosen'
                  : ''
              }
              onClick={() =>
                setIssue({
                  ...issue,
                  returnable: true,
                })
              }
            >
              Yes
            </button>

            <button
              className={
                !issue.returnable
                  ? 'chosen'
                  : ''
              }
              onClick={() =>
                setIssue({
                  ...issue,
                  returnable: false,
                })
              }
            >
              No
            </button>

          </fieldset>

          {issue.returnable && (
            <label>
              Return date

              <input
                value={issue.date}
                onChange={(e) =>
                  setIssue({
                    ...issue,
                    date: e.target.value,
                  })
                }
              />
            </label>
          )}

          <button
            className="primary"
            onClick={onSubmit}
          >
            Issue resource
            <ChevronRight />
          </button>

        </div>

        <aside className="system-note">

          <Sparkles />

          <p className="eyebrow">
            SYSTEM RECORD
          </p>

          <b>
            {new Date().toLocaleDateString(
              'en-IN',
              {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }
            )}

            <br />

            {new Date().toLocaleTimeString(
              'en-IN',
              {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }
            )}
          </b>

          <p>
            Date and time are captured automatically
            and cannot be edited.
          </p>

        </aside>

      </section>
    </>
  );
}


/* =========================================================
   HISTORY
========================================================= */

function History({
  onResourcesChange,
}: {
  onResourcesChange: (resources: Resource[]) => void;
}) {
  const [issues, setIssues] = useState(getAllIssues());

  const [search, setSearch] = useState('');

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }
    );
  };

  const formatReturnDate = (date?: string) => {
    if (!date) return '—';

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const filteredIssues = issues.filter((item) => {
    const text =
      `${item.resourceName} ${item.userName}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  // =========================
  // RETURN RESOURCE
  // =========================

  const handleReturn = (issueId: string) => {

    const updatedIssues = returnIssue(issueId);

    // Keep the SAME history record,
    // only change its status to Returned.
    setIssues(updatedIssues);

    // Refresh inventory quantity.
    const updatedResources = getAllResources();

    onResourcesChange(updatedResources);
  };

  return (
    <>
      <section className="page-head">

        <div>

          <p className="eyebrow">
            MOVEMENT LOG
          </p>

          <h1>History</h1>

          <p className="lede">
            A complete record of every issue, return and resource movement.
          </p>

        </div>

        <button className="secondary">
          Export history
        </button>

      </section>

      <section className="history-list">

        {/* TOP */}

        <div className="history-top">

          <div>

            <h2>
              {issues.length} records
            </h2>

            <p>
              Showing all resource movements
            </p>

          </div>

          <div className="history-filters">

            <Search />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by resource or person..."
            />

            <button>
              All time
            </button>

          </div>

        </div>

        {/* TABLE HEADER */}

        <div className="history-header">

          <span>#</span>

          <span>
            Resource Name
          </span>

          <span>
            Person Name
          </span>

          <span>
            Issued At
          </span>

          <span>
            Return Date
          </span>

          <span>
            Status
          </span>

          <span>
            Action
          </span>

        </div>

        {/* EMPTY */}

        {filteredIssues.length === 0 ? (

          <div className="history-empty">
            No resource movements yet.
          </div>

        ) : (

          filteredIssues.map((item, index) => (

            <div
              className="history-row"
              key={item.id}
            >

              <span>
                {index + 1}
              </span>

              <span className="main">
                {item.resourceName}
              </span>

              <span>
                {item.userName}
              </span>

              <span>
                {formatDateTime(item.issuedAt)}
              </span>

              <span>
                {formatReturnDate(item.returnDate)}
              </span>

              <span>

                <b
                  className={`badge ${
                    item.status === 'Returned'
                      ? 'returned'
                      : item.status === 'Overdue'
                        ? 'overdue'
                        : 'available'
                  }`}
                >
                  {item.status}
                </b>

              </span>

              <span>

                {item.status === 'Issued' ? (

                  <button
                    className="return-btn"
                    onClick={() =>
                      handleReturn(item.id)
                    }
                  >
                    Return
                  </button>

                ) : (

                  <span>—</span>

                )}

              </span>

            </div>

          ))

        )}

      </section>
    </>
  );
}


/* =========================================================
   PEOPLE
========================================================= */

function People() {
  return (
    <section className="empty">

      <Users />

      <p className="eyebrow">
        ACCESS DIRECTORY
      </p>

      <h1>
        People
      </h1>

      <p className="lede">
        Manage who can access and borrow project resources.
      </p>

      <button className="primary">
        Add person
      </button>

    </section>
  );
}


/* =========================================================
   INSIGHTS
========================================================= */

function Insights() {
  return (
    <section className="empty">

      <Sparkles />

      <p className="eyebrow">
        RESOURCE INTELLIGENCE
      </p>

      <h1>
        Electronics account for 42%
        <br />
        of all resource issues.
      </h1>

      <p className="lede">
        Development boards are currently the most
        frequently borrowed category.
      </p>

    </section>
  );
}


/* =========================================================
   ADD RESOURCE
========================================================= */

function AddResource({
  onAdd,
  go,
}: {
  onAdd: () => void;
  go: (page: string) => void;
}) {
  return (
    <>
      <section className="page-head">

        <div>

          <p className="eyebrow">
            NEW RESOURCE
          </p>

          <h1>
            Add a resource
          </h1>

          <p className="lede">
            Add hardware, software or equipment to your project inventory.
          </p>

        </div>

      </section>

      <section className="add-form">

        <label>
          Resource name

          <input
            defaultValue="ESP32 Dev Board"
          />
        </label>

        <div className="form-grid">

          <label>
            Category

            <select>
              <option>
                Hardware
              </option>

              <option>
                Software
              </option>
            </select>

          </label>

          <label>
            Quantity

            <input
              defaultValue="8"
              type="number"
            />
          </label>

        </div>

        <label>
          Location

          <input
            defaultValue="Lab 204 · Shelf C"
          />
        </label>

        <div>

          <button
            className="secondary"
            onClick={() => go('Inventory')}
          >
            Cancel
          </button>

          <button
            className="primary"
            onClick={onAdd}
          >
            Add resource
            <ChevronRight />
          </button>

        </div>

      </section>
    </>
  );
}


/* =========================================================
   APP START
========================================================= */

createRoot(
  document.getElementById('root')!
).render(
  <App />
);