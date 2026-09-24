/// <reference types="vite/client" />

import React, { useEffect, useMemo, useState } from 'react';
import '../styles/global.css';


import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  Boxes,
  Check,
  ChevronRight,
  CircleAlert,
  CirclePlus,
  ClipboardList,
  Clock3,
  Command,
  Cpu,
  Edit3,
  FileText,
  Filter,
  History as HistoryIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PackageOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

import Login from '../features/auth/Login';
import ChangePassword from '../features/auth/changePassword';

import type {
  Resource,
  Issue,
  User,
  Profession,
  Role,
  Category,
} from '../types/domain';

import {
  getAllResources,
} from '../services/resourceService';

import {
  getResourcesApi,
  createResourceApi,
  updateResourceApi,
  deleteResourceApi,
  getDashboardApi,
  getUsersApi,
  getIssuesApi,
  createIssueApi,
  returnIssueApi,
} from '../services/api';


import {
  getCurrentUser,
  logout,
  type AuthUser,
} from '../services/authService';


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

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function getDefaultReturnDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function toBackendReturnDate(value: string): string | null {
  const parts = (value || '').trim().split(/\s+/);

  if (parts.length === 3) {
    const day = Number(parts[0]);
    const month = MONTH_NAMES.findIndex(
      (monthName) =>
        monthName.toLowerCase() === parts[1].toLowerCase()
    );
    const year = Number(parts[2]);

    if (Number.isInteger(day) && month >= 0 && Number.isInteger(year)) {
      const date = new Date(year, month, day);
      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  }

  return null;
}

function mapBackendIssue(item: any): Issue {
  return {
    id: String(item.id),
    resourceId: String(item.resourceId),
    resourceName: item.resourceName || 'Unknown resource',
    userId: String(item.userId),
    userName: item.userName || 'Unknown user',
    profession: (item.profession || 'Other') as Profession,
    issuedAt: item.issuedAt,
    returnable: Boolean(item.returnable),
    returnDate: item.returnDate || undefined,
    returnedAt: item.returnedAt || undefined,
    status: (item.status || 'Issued') as Issue['status'],
    quantity: Number(item.quantity) || 1,
  };
}

function mapBackendResource(item: any): Resource {
  return {
    id: String(item.id),
    name: item.name,
    category: item.category === 'Software' ? 'Software' : 'Hardware',
    sub:
      item.sub ||
      (item.category === 'Hardware'
        ? 'Hardware resource'
        : 'Software resource'),
    quantity: Number(item.quantity) || 0,
    status:
      Number(item.quantity) === 0
        ? 'Unavailable'
        : Number(item.quantity) <= 3
          ? 'Low stock'
          : 'Available',
    tone:
      item.tone ||
      (item.category === 'Hardware' ? 'blue' : 'purple'),
    location: item.location || 'Innovation Centre',
  };
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const [role, setRole] = useState<'Admin' | 'User'>(
    currentUser?.role || 'User'
  );
    const [loginPassword, setLoginPassword] =
    useState('');

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
    const hash = window.location.hash
      .replace('#', '')
      .toLowerCase();

    return pageMap[hash] || 'Overview';
  });

  const [profileOpen, setProfileOpen] = useState(false);

  const [editingResource, setEditingResource] =
    useState<Resource | null>(null);

  const [resources, setResources] =
    useState<Resource[]>([]);

  const [issues, setIssues] =
    useState<Issue[]>([]);

  const [dashboard, setDashboard] = useState({
    totalItems: 0,
    availableItems: 0,
    issuedToday: 0,
    lowStockItems: 0,
    totalResources: 0,
    returnedIssues: 0,
    totalUsers: 0,
    totalIssues: 0,
    activeIssues: 0,
    overdueIssues: 0,
  });

  const [query, setQuery] = useState('');

  const [cat, setCat] = useState('All');

  const [selected, setSelected] =
    useState<Resource | null>(null);

  const [menu, setMenu] = useState(false);

  const [toast, setToast] = useState('');

  // =========================================================
  // ISSUE STATE
  // =========================================================

  const [issue, setIssue] = useState({
    name: '',
    profession: 'Student',
    returnable: true,
    date: getDefaultReturnDate(),
    quantity: 1,
  });


  // =========================================================
  // BROWSER NAVIGATION
  // =========================================================

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash
        .replace('#', '')
        .toLowerCase();

      setPage(pageMap[hash] || 'Overview');
      setSelected(null);
    };


    window.addEventListener(
      'popstate',
      handlePopState
    );


    if (!window.location.hash) {
      window.history.replaceState(
        { page: 'Overview' },
        '',
        '#overview'
      );
    }


    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }, []);


  // =========================================================
  // LOAD RESOURCES FROM BACKEND
  // =========================================================

  useEffect(() => {
    if (!currentUser) return;

    const loadResources = async () => {
      try {
        const data = await getResourcesApi();

        const mappedResources: Resource[] =
          data.map(mapBackendResource);

        setResources(mappedResources);
      } catch (error) {
        console.error(
          'Failed to load resources from backend:',
          error
        );
      }
    };

    loadResources();
  }, [currentUser]);


  // =========================================================
  // LOAD ISSUES FROM BACKEND
  // =========================================================

  useEffect(() => {
    if (!currentUser) return;

    const loadIssues = async () => {
      try {
        const data = await getIssuesApi();

        setIssues(
          data.map(mapBackendIssue)
        );
      } catch (error) {
        console.error(
          'Failed to load issues from backend:',
          error
        );
      }
    };

    loadIssues();
  }, [currentUser]);


  // =========================================================
  // LOAD DASHBOARD FROM BACKEND
  // =========================================================

  useEffect(() => {
    if (!currentUser) return;

    const loadDashboard = async () => {
      try {
        const data = await getDashboardApi();
        setDashboard(data);
      } catch (error) {
        console.error(
          'Failed to load dashboard from backend:',
          error
        );
      }
    };

    loadDashboard();
  }, [currentUser]);


  // =========================================================
  // FILTERED INVENTORY
  // =========================================================

  const filtered = useMemo(
    () =>
      resources.filter(
        (r) =>
          (cat === 'All' || r.category === cat) &&
          r.name
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [resources, cat, query]
  );


 // =========================================================
// LOGIN
// =========================================================

if (!currentUser) {

  return (
    <Login
      onLogin={(
        user: AuthUser,
        password: string
      ) => {

        setLoginPassword(password);

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

// =========================================================
// FORCE PASSWORD CHANGE
// =========================================================

if (
  currentUser.mustChangePassword &&
  loginPassword
) {

  return (
    <ChangePassword
      email={currentUser.email}
      currentPassword={loginPassword}
      onPasswordChanged={(newPassword) => {

        setLoginPassword(newPassword);

        setCurrentUser({
          ...currentUser,
          mustChangePassword: false,
        });

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

  // =========================================================
  // NOTIFICATION
  // =========================================================

  const notify = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast('');
    }, 2800);
  };


  // =========================================================
  // NAVIGATION
  // =========================================================

  const go = (p: string) => {
    setPage(p);

    setMenu(false);
    setProfileOpen(false);
    setSelected(null);

    const hash = p
      .replace(/ /g, '-')
      .toLowerCase();


    if (window.location.hash !== `#${hash}`) {
      window.history.pushState(
        { page: p },
        '',
        `#${hash}`
      );
    }
  };


  // =========================================================
  // LOGOUT
  // =========================================================

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


  // =========================================================
  // ADD RESOURCE
  // =========================================================

  const addItem = async (data: {
    name: string;
    category: 'Hardware' | 'Software';
    quantity: number;
    location: string;
    sub?: string;
  }) => {

    const cleanName = data.name.trim();
    const cleanLocation = data.location.trim();

    if (!cleanName) {
      notify('Enter a resource name');
      return;
    }

    if (
      !Number.isInteger(data.quantity) ||
      data.quantity <= 0
    ) {
      notify('Quantity must be at least 1');
      return;
    }

    try {
      const created = await createResourceApi({
        name: cleanName,
        category: data.category,
        sub:
          data.sub?.trim() ||
          (data.category === 'Hardware'
            ? 'Hardware resource'
            : 'Software resource'),
        quantity: data.quantity,
        tone:
          data.category === 'Hardware'
            ? 'blue'
            : 'purple',
        location:
          cleanLocation || 'Innovation Centre',
      });

      const newResource: Resource = {
        id: String(created.id),
        name: created.name,
        category:
          created.category === 'Software'
            ? 'Software'
            : 'Hardware',
        sub:
          created.sub ||
          (created.category === 'Hardware'
            ? 'Hardware resource'
            : 'Software resource'),
        quantity: Number(created.quantity) || 0,
        status:
          Number(created.quantity) === 0
            ? 'Unavailable'
            : Number(created.quantity) <= 3
              ? 'Low stock'
              : 'Available',
        tone:
          created.tone ||
          (created.category === 'Hardware'
            ? 'blue'
            : 'purple'),
        location:
          created.location || 'Innovation Centre',
      };

      setResources((previous) => [
        ...previous,
        newResource,
      ]);

      notify(`${cleanName} added to inventory`);
      go('Inventory');
    } catch (error) {
      console.error(
        'Failed to create resource:',
        error
      );

      notify(
        error instanceof Error
          ? error.message
          : 'Failed to add resource'
      );
    }
  };


  // =========================================================
  // DELETE RESOURCE
  // =========================================================

  const deleteItem = async (resource: Resource) => {

    if (role !== 'Admin') {
      notify('Only Admin can delete resources');
      return;
    }

    const hasActiveIssue = issues.some(
      (item) =>
        String(item.resourceId) === String(resource.id) &&
        item.status !== 'Returned'
    );

    if (hasActiveIssue) {
      notify(
        'Cannot delete a resource that is currently issued'
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${resource.name}" from inventory?`
    );

    if (!confirmed) return;

    try {
      await deleteResourceApi(resource.id);

      setResources((previous) =>
        previous.filter(
          (item) => item.id !== resource.id
        )
      );

      if (selected?.id === resource.id) {
        setSelected(null);
      }

      notify(
        `${resource.name} deleted from inventory`
      );
    } catch (error) {
      console.error(
        'Failed to delete resource:',
        error
      );

      notify(
        error instanceof Error
          ? error.message
          : 'Failed to delete resource'
      );
    }
  };


  // =========================================================
  // EDIT RESOURCE
  // =========================================================

  const editItem = (resource: Resource) => {

    if (role !== 'Admin') {
      notify('Only Admin can edit resources');
      return;
    }


    setSelected(null);

    setEditingResource(resource);
  };


  const saveEditedResource = async (data: {
    name: string;
    category: 'Hardware' | 'Software';
    quantity: number;
    location: string;
  }) => {

    if (!editingResource) return;

    const cleanName = data.name.trim();
    const cleanLocation = data.location.trim();

    if (!cleanName) {
      notify('Enter a resource name');
      return;
    }

    if (
      !Number.isInteger(data.quantity) ||
      data.quantity <= 0
    ) {
      notify('Quantity must be at least 1');
      return;
    }

    try {
      const updated = await updateResourceApi(
        editingResource.id,
        {
          name: cleanName,
          category: data.category,
          sub:
            data.category === 'Hardware'
              ? 'Hardware resource'
              : 'Software resource',
          quantity: data.quantity,
          tone:
            data.category === 'Hardware'
              ? 'blue'
              : 'purple',
          location:
            cleanLocation || 'Innovation Centre',
        }
      );

      const updatedResource: Resource = {
        id: String(updated.id),
        name: updated.name,
        category:
          updated.category === 'Software'
            ? 'Software'
            : 'Hardware',
        sub:
          updated.sub ||
          (updated.category === 'Hardware'
            ? 'Hardware resource'
            : 'Software resource'),
        quantity: Number(updated.quantity) || 0,
        status:
          Number(updated.quantity) === 0
            ? 'Unavailable'
            : Number(updated.quantity) <= 3
              ? 'Low stock'
              : 'Available',
        tone:
          updated.tone ||
          (updated.category === 'Hardware'
            ? 'blue'
            : 'purple'),
        location:
          updated.location || 'Innovation Centre',
      };

      setResources((previous) =>
        previous.map((resource) =>
          resource.id === editingResource.id
            ? updatedResource
            : resource
        )
      );

      if (selected?.id === editingResource.id) {
        setSelected(updatedResource);
      }

      setEditingResource(null);

      notify(
        `${cleanName} updated successfully`
      );
    } catch (error) {
      console.error(
        'Failed to update resource:',
        error
      );

      notify(
        error instanceof Error
          ? error.message
          : 'Failed to update resource'
      );
    }
  };


  // =========================================================
  // ISSUE RESOURCE
  // =========================================================

  const completeIssue = async () => {

    if (!selected) {
      return notify('Select a resource first');
    }

    if (!issue.name.trim()) {
      return notify('Add a recipient name to continue');
    }

    if (selected.quantity <= 0) {
      return notify('This resource is currently unavailable');
    }

    if (
      !Number.isInteger(issue.quantity) ||
      issue.quantity < 1 ||
      issue.quantity > selected.quantity
    ) {
      return notify('Choose a valid quantity');
    }

    try {
      // The backend issue table requires a real user ID.
      // Match the recipient against the users stored in MySQL.
      const users = await getUsersApi();
      const recipient = users.find(
        (item: any) =>
          String(item.name || '').trim().toLowerCase() ===
          issue.name.trim().toLowerCase()
      );

      if (!recipient) {
        return notify(
          'Recipient is not registered in People. Add the person first.'
        );
      }

      const returnDate = issue.returnable
        ? toBackendReturnDate(issue.date)
        : null;

      if (issue.returnable && !returnDate) {
        return notify('Choose a valid return date');
      }

      await createIssueApi(
        {
          quantity: issue.quantity,
          returnable: issue.returnable,
          returnDate,
        },
        String(recipient.id),
        selected.id
      );

      // Refresh issues from MySQL.
      const issueData = await getIssuesApi();

      setIssues(
        issueData.map(mapBackendIssue)
      );

      // Refresh inventory from MySQL so the quantity shown in the UI
      // matches the database immediately after the issue.
      const resourceData = await getResourcesApi();
      setResources(resourceData.map(mapBackendResource));

      // Refresh dashboard numbers as well.
      const dashboardData = await getDashboardApi();
      setDashboard(dashboardData);

      notify(
        `${issue.quantity} × ${selected.name} issued to ${recipient.name}`
      );

      setSelected(null);

      setIssue({
        name: '',
        profession: 'Student',
        returnable: true,
        date: getDefaultReturnDate(),
        quantity: 1,
      });

      go('History');
    } catch (error) {
      console.error('Failed to issue resource:', error);

      notify(
        error instanceof Error
          ? error.message
          : 'Failed to issue resource'
      );
    }
  };


  return (
    <div className="app">

      {/* =====================================================
          HEADER
      ===================================================== */}

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
            .slice(
              0,
              currentUser.role === 'User'
                ? 4
                : nav.length
            )
            .map(
              ({
                label,
                icon: Icon,
              }) => (
                <button
                  key={label}
                  className={
                    page === label
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    go(label)
                  }
                >
                  <Icon />
                  {label}
                </button>
              )
            )}

        </nav>


        <div className="tools">

          <div className="search">

            <Search />

            <input
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search resources, people…"
            />

            <Command />

          </div>


          <button className="icon">
            <Bell />
          </button>


          <div
            style={{
              position: 'relative',
            }}
          >

            <button
              className="avatar"
              onClick={() =>
                setProfileOpen(
                  !profileOpen
                )
              }
              title="Account menu"
              aria-label="Account menu"
            >
              {currentUser.name[0]
                .toUpperCase()}
            </button>


            {profileOpen && (

              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '220px',
                  background: '#fff',
                  border:
                    '1px solid #e7e9f1',
                  borderRadius: '14px',
                  padding: '12px',
                  boxShadow:
                    '0 16px 40px rgba(35, 42, 75, 0.14)',
                  zIndex: 1000,
                }}
              >

                <div
                  style={{
                    padding:
                      '8px 10px 12px',
                    borderBottom:
                      '1px solid #edf0f5',
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
                      display:
                        'inline-block',
                      marginTop: '8px',
                      padding: '4px 8px',
                      borderRadius:
                        '999px',
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
                    background:
                      'transparent',
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

        {/* ===================================================
            OVERVIEW
        =================================================== */}

        {page === 'Overview' && (
          <Overview
            role={role}
            go={go}
            setSelected={setSelected}
            resources={resources}
            issues={issues}
            dashboard={dashboard}
          />
        )}


        {/* ===================================================
            INVENTORY
        =================================================== */}

        {page === 'Inventory' && (
          <Inventory
            filtered={filtered}
            query={query}
            setQuery={setQuery}
            cat={cat}
            setCat={setCat}
            setSelected={setSelected}
            go={go}
            role={role}
            onDelete={deleteItem}
            onEdit={editItem}
          />
        )}


        {/* ===================================================
            ISSUE RESOURCE
        =================================================== */}

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


        {/* ===================================================
            HISTORY
        =================================================== */}

        {page === 'History' && (
          <History
            onResourcesChange={
              setResources
            }
            onIssuesChange={
              setIssues
            }
          />
        )}


        {/* ===================================================
            PEOPLE
        =================================================== */}

        {page === 'People' && (
          <People />
        )}


        {/* ===================================================
            INSIGHTS
        =================================================== */}

        {page === 'Insights' && (
          <Insights
  resources={resources}
  issues={issues}
/>
        )}


        {/* ===================================================
            ADD RESOURCE
        =================================================== */}

        {page === 'Add resource' && (
          <AddResource
            onAdd={addItem}
            onClose={() => go('Inventory')}
            go={go}
          />
        )}


        {/* ===================================================
            RESOURCE DETAILS
        =================================================== */}

        {selected &&
          page !== 'Issue resource' && (
            <Details
              resource={selected}
              issues={issues}
              onIssue={() =>
                go('Issue resource')
              }
              onClose={() =>
                setSelected(null)
              }
            />
          )}


        {/* ===================================================
            EDIT RESOURCE
        =================================================== */}

        {editingResource && (
          <EditResource
            resource={editingResource}
            onSave={
              saveEditedResource
            }
            onClose={() =>
              setEditingResource(null)
            }
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
  resources,
  issues,
  dashboard,
}: {
  role: string;
  go: (x: string) => void;
  setSelected: (r: Resource) => void;
  resources: Resource[];
  issues: Issue[];
  dashboard: {
    totalItems: number;
    availableItems: number;
    issuedToday: number;
    lowStockItems: number;
    totalResources: number;
    returnedIssues: number;
    totalUsers: number;
    totalIssues: number;
    activeIssues: number;
    overdueIssues: number;
  };
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


  // Dashboard inventory values are calculated by the backend
  // from the actual MySQL resource and issue data.
  const totalItems = dashboard.totalItems;
  const availableNow = dashboard.availableItems;
  const issuedToday = dashboard.issuedToday;

  // Current quantity outside inventory (issued or overdue).
  const issuedCount = Math.max(0, totalItems - availableNow);

  // Backend reports the quantity currently in low-stock resources.
  const lowStockCount = dashboard.lowStockItems;

  // Need attention = overdue quantity + low-stock quantity.
  const overdueCount = dashboard.overdueIssues;
  const attentionCount = overdueCount + lowStockCount;

  const weekAgo =
    Date.now() -
    7 * 24 * 60 * 60 * 1000;


  const movedThisWeek =
    issues
      .filter(
        (issue) =>
          new Date(
            issue.issuedAt
          ).getTime() >= weekAgo ||
          (
            issue.returnedAt &&
            new Date(
              issue.returnedAt
            ).getTime() >= weekAgo
          )
      )
      .reduce(
        (sum, issue) =>
          sum + (issue.quantity || 1),
        0
      );


  const categoryCounts =
    resources.reduce(
      (acc, resource) => {
        acc[resource.category] =
          (acc[resource.category] || 0) +
          resource.quantity;

        return acc;
      },
      {} as Record<string, number>
    );


  const recentIssues =
    [...issues]
      .sort(
        (a, b) =>
          new Date(
            b.issuedAt
          ).getTime() -
          new Date(
            a.issuedAt
          ).getTime()
      )
      .slice(0, 3);


  const upcomingReturns =
    [...issues]
      .filter(
        (issue) =>
          (
            issue.status === 'Issued' ||
            issue.status === 'Overdue'
          ) &&
          issue.returnable &&
          issue.returnDate
      )
      .sort(
        (a, b) =>
          new Date(
            a.returnDate!
          ).getTime() -
          new Date(
            b.returnDate!
          ).getTime()
      )
      .slice(0, 2);


  return (
    <>
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero">

        <div>

          <p className="eyebrow">
            {role === 'Admin'
              ? 'RESOURCE OVERVIEW'
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

          <span>
            ACTIVITY PULSE
          </span>


          <strong>
            {movedThisWeek}
          </strong>


          <p>
            items moved this week
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


      {/* =====================================================
          METRICS
      ===================================================== */}

      <section className="metrics">

        <article>
          <b>{totalItems}</b>
          <span>Total items</span>
        </article>


        <article>
          <b>{availableNow}</b>
          <span>Available now</span>
        </article>


        <article>
          <b>{issuedToday}</b>
          <span>Issued today</span>
        </article>


        <article className="alert">
          <b>{attentionCount}</b>
          <span>Need attention</span>
        </article>

      </section>


      {/* =====================================================
          RESOURCE COLLECTIONS
      ===================================================== */}

      <section className="section-title">

        <div>

          <p className="eyebrow">
            DISCOVER
          </p>

          <h2>
            Resource collections
          </h2>

        </div>


        <button
          className="text-btn"
          onClick={() =>
            go('Inventory')
          }
        >
          View inventory
          <ChevronRight />
        </button>

      </section>


      <section className="collections">

        {[
          [
            'Hardware',
            `${categoryCounts.Hardware || 0} items`,
            'chip',
          ],

          [
            'Software',
            `${categoryCounts.Software || 0} items`,
            'code',
          ],

          [
            'Low stock',
            `${lowStockCount} items`,
            'tool',
          ],

          [
            'Issued',
            `${issuedCount} items`,
            'laptop',
          ],
        ].map(
          ([name, count, icon]) => (

            <button
              key={name}
              className={`collection ${icon}`}
              onClick={() =>
                go('Inventory')
              }
            >

              <span>

                {icon === 'chip' ? (
                  <Cpu />
                ) : icon === 'tool' ? (
                  <PackageOpen />
                ) : (
                  <Box />
                )}

              </span>


              <h3>
                {name}
              </h3>


              <p>
                {count}
              </p>


              <ChevronRight />

            </button>

          )
        )}

      </section>


      {/* =====================================================
          LOWER SECTION
      ===================================================== */}

      <section className="lower">

        {/* ===================================================
            RECENT ACTIVITY
        =================================================== */}

        <article className="activity">

          <p className="eyebrow">
            LIVE LOG
          </p>


          <h2>
            Recent activity
          </h2>


          {recentIssues.length === 0 ? (

            <div className="event">

              <i className="dot d0" />

              <span>
                No resource activity yet.

                <small>
                  Start by issuing a resource.
                </small>
              </span>

            </div>

          ) : (

            recentIssues.map(
              (item, index) => (

                <div
                  className="event"
                  key={item.id}
                >

                  <i
                    className={`dot d${index}`}
                  />


                  <span>

                    {item.status ===
                    'Returned'
                      ? `${item.resourceName} returned by ${item.userName}`
                      : `${item.resourceName} issued to ${item.userName}`}


                    <small>
                      {formatRelativeTime(
                        item.returnedAt ||
                        item.issuedAt
                      )}
                    </small>

                  </span>

                </div>

              )
            )

          )}

        </article>


        {/* ===================================================
            RETURNS DUE
        =================================================== */}

        <article className="due">

          <p className="eyebrow">
            UP NEXT
          </p>


          <h2>
            Returns due soon
          </h2>


          {upcomingReturns.length === 0 ? (

            <div className="event">

              <span>
                No upcoming returns.

                <small>
                  Nothing is due soon.
                </small>
              </span>

            </div>

          ) : (

            upcomingReturns.map(
              (item) => {

                const resource =
                  resources.find(
                    (r) =>
                      r.id ===
                      item.resourceId
                  );


                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      resource &&
                      setSelected(resource)
                    }
                  >

                    {item.resourceName}

                    <b>
                      {item.returnDate}
                    </b>

                    <ChevronRight />

                  </button>
                );

              }
            )

          )}

        </article>

      </section>
    </>
  );
}


/* =========================================================
   RELATIVE TIME
========================================================= */

function formatRelativeTime(
  value: string
) {
  const diff = Math.max(
    0,
    Date.now() -
      new Date(value).getTime()
  );


  const minutes =
    Math.floor(diff / 60000);


  if (minutes < 1) {
    return 'Just now';
  }


  if (minutes < 60) {
    return `${minutes}m ago`;
  }


  const hours =
    Math.floor(minutes / 60);


  if (hours < 24) {
    return `${hours}h ago`;
  }


  const days =
    Math.floor(hours / 24);


  return `${days}d ago`;
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
  role,
  onDelete,
  onEdit,
}: any) {

  return (
    <>
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <section className="page-head">

        <div>

          <p className="eyebrow">
            RESOURCE LIBRARY
          </p>


          <h1>
            Inventory
          </h1>


          <p className="lede">
            Find the right resource without digging through spreadsheets.
          </p>

        </div>


        {role === 'Admin' && (

          <button
            className="primary"
            onClick={() =>
              go('Add resource')
            }
          >
            <CirclePlus />
            Add new item
          </button>

        )}

      </section>


      {/* ===================================================
          FILTERS
      =================================================== */}

      <section className="filters">

        <Search />


        <input
          value={query}
          onChange={(e: any) =>
            setQuery(
              e.target.value
            )
          }
          placeholder="Search by name"
        />


        {[
          'All',
          'Hardware',
          'Software',
        ].map((x) => (

          <button
            key={x}
            onClick={() =>
              setCat(x)
            }
            className={
              cat === x
                ? 'selected'
                : ''
            }
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


      {/* ===================================================
          INVENTORY TABLE
      =================================================== */}

      <section className="inventory">

        <div className="table-top">

          <b>
            {filtered.length} resources
          </b>


          <span>
            Availability is updated in real time
          </span>

        </div>


        <div className="table header-row">

          <span>
            Resource
          </span>

          <span>
            Category
          </span>

          <span>
            Quantity
          </span>

          <span>
            Status
          </span>

          <span>
            {role === 'Admin'
              ? 'Action'
              : ''}
          </span>

        </div>


        {filtered.map(
          (r: Resource) => (

            <div
              className="table resource-row"
              key={r.id}
              onClick={() =>
                setSelected(r)
              }
              role="button"
              tabIndex={0}
              onKeyDown={
                (event: any) => {

                  if (
                    event.key ===
                      'Enter' ||
                    event.key === ' '
                  ) {

                    event.preventDefault();

                    setSelected(r);
                  }

                }
              }
            >

              {/* RESOURCE */}

              <div className="resource-name">

                <i className={r.tone}>

                  {r.category ===
                  'Software' ? (
                    <Command />
                  ) : (
                    <Cpu />
                  )}

                </i>


                <span>

                  <b>
                    {r.name}
                  </b>


                  <small>
                    {r.id} · {r.sub}
                  </small>

                </span>

              </div>


              {/* CATEGORY */}

              <span>
                {r.category}
              </span>


              {/* QUANTITY */}

              <b>
                {r.quantity}
              </b>


              {/* STATUS */}

              <span
                className={`badge ${
                  r.status ===
                  'Available'
                    ? 'available'
                    : 'low'
                }`}
              >
                {r.status}
              </span>


              {/* ACTION */}

              {role === 'Admin' ? (

                <div
                  style={{
                    display: 'flex',
                    gap: 7,
                    alignItems:
                      'center',
                  }}
                >

                  <button
                    type="button"
                    title={`Edit ${r.name}`}
                    aria-label={`Edit ${r.name}`}
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();
                      onEdit(r);
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      display:
                        'inline-flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      border:
                        '1px solid #e2e5ef',
                      borderRadius: 9,
                      background:
                        '#fff',
                      color:
                        '#665fd8',
                      cursor:
                        'pointer',
                    }}
                  >
                    <Edit3 size={16} />
                  </button>


                  <button
                    type="button"
                    title={`Delete ${r.name}`}
                    aria-label={`Delete ${r.name}`}
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();
                      onDelete(r);
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      display:
                        'inline-flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      border:
                        '1px solid #eadfe2',
                      borderRadius: 9,
                      background:
                        '#fff',
                      color:
                        '#c55454',
                      cursor:
                        'pointer',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              ) : (

                <ChevronRight />

              )}

            </div>

          )
        )}


        {filtered.length === 0 && (

          <div
            style={{
              padding:
                '32px 20px',
              textAlign:
                'center',
              color:
                '#7b8195',
            }}
          >
            No resources found.
          </div>

        )}

      </section>
    </>
  );
}

/* =========================================================
   DETAILS
========================================================= */

function Details({
  resource,
  issues,
  onIssue,
  onClose,
}: {
  resource: Resource;
  issues: Issue[];
  onIssue: () => void;
  onClose: () => void;
}){
  return (
    <div
      className="drawer-shade"
      onClick={onClose}
    >
      <aside
        className="detail"
        onClick={(e) =>
          e.stopPropagation()
        }
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


        <h2>
          {resource.name}
        </h2>


        <p>
          {resource.category} · {resource.sub}
        </p>


        <div className="availability">

          <b>
            {resource.quantity}
          </b>

          {' '}available

          <span className="badge available">
            {resource.quantity > 0
              ? 'In stock'
              : 'Unavailable'}
          </span>

        </div>


        <div className="stat-grid">

          <span>
            Total
            <b>
              {resource.quantity}
            </b>
          </span>


          <span>
            Issued
            <b>
              {issues
                .filter(
                  (issue) =>
                    issue.resourceId ===
                      resource.id &&
                    (
                      issue.status ===
                        'Issued' ||
                      issue.status ===
                        'Overdue'
                    )
                )
                .reduce(
                  (sum, issue) =>
                    sum +
                    (issue.quantity || 1),
                  0
                )}
            </b>
          </span>


          <span>
            Reserved
            <b>0</b>
          </span>

        </div>


        <h3>
          Specifications
        </h3>


        <dl>

          <div>
            <dt>
              Location
            </dt>

            <dd>
              {resource.location ||
                'Lab 204 · Shelf B'}
            </dd>
          </div>


          <div>
            <dt>
              Classification
            </dt>

            <dd>
              {resource.category} /{' '}
              {resource.sub}
            </dd>
          </div>

        </dl>


        <button
          className="primary full"
          onClick={onIssue}
          disabled={
            resource.quantity <= 0
          }
          style={{
            opacity:
              resource.quantity <= 0
                ? 0.55
                : 1,
            cursor:
              resource.quantity <= 0
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {resource.quantity <= 0
            ? 'Currently unavailable'
            : 'Issue resource'}

          {resource.quantity > 0 && (
            <ChevronRight />
          )}
        </button>

      </aside>
    </div>
  );
}

/* =========================================================
   RETURN DATE SELECTOR (DAY / MONTH / YEAR DROPDOWNS)
========================================================= */

interface ReturnDateSelectorProps {
  value: string;
  onChange: (dateStr: string) => void;
}

function ReturnDateSelector({ value, onChange }: ReturnDateSelectorProps) {
  const today = useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const parsed = useMemo(() => {
    const parts = (value || '').trim().split(/\s+/);
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const mIdx = MONTH_NAMES.findIndex(
        (m) => m.toLowerCase() === parts[1].toLowerCase()
      );
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && mIdx !== -1 && !isNaN(y)) {
        return { day: d, month: mIdx, year: y };
      }
    }
    const dt = new Date(value);
    if (!isNaN(dt.getTime())) {
      return { day: dt.getDate(), month: dt.getMonth(), year: dt.getFullYear() };
    }
    const def = new Date();
    def.setDate(def.getDate() + 7);
    return { day: def.getDate(), month: def.getMonth(), year: def.getFullYear() };
  }, [value]);

  const selectedYear = Math.max(todayYear, parsed.year);
  const selectedMonth =
    selectedYear === todayYear
      ? Math.max(todayMonth, parsed.month)
      : parsed.month;
  const maxDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const minDay =
    selectedYear === todayYear && selectedMonth === todayMonth ? todayDay : 1;
  const selectedDay = Math.min(maxDays, Math.max(minDay, parsed.day));

  const years = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => todayYear + i);
  }, [todayYear]);

  const availableMonths = useMemo(() => {
    return MONTH_NAMES.map((name, index) => ({ name, index })).filter(
      (m) => selectedYear > todayYear || m.index >= todayMonth
    );
  }, [selectedYear, todayYear, todayMonth]);

  const availableDays = useMemo(() => {
    const days: number[] = [];
    for (let d = minDay; d <= maxDays; d++) {
      days.push(d);
    }
    return days;
  }, [minDay, maxDays]);

  const updateDate = (newDay: number, newMonth: number, newYear: number) => {
    const validYear = Math.max(todayYear, newYear);
    const validMonth =
      validYear === todayYear ? Math.max(todayMonth, newMonth) : newMonth;
    const daysInNewMonth = new Date(validYear, validMonth + 1, 0).getDate();
    const minD =
      validYear === todayYear && validMonth === todayMonth ? todayDay : 1;
    const validDay = Math.min(daysInNewMonth, Math.max(minD, newDay));

    const dayStr = String(validDay).padStart(2, '0');
    const monthStr = MONTH_NAMES[validMonth];
    onChange(`${dayStr} ${monthStr} ${validYear}`);
  };

  return (
    <div className="date-select-grid">
      <div className="date-select-col">
        <span className="date-select-sublabel">Day</span>
        <select
          value={selectedDay}
          onChange={(e) =>
            updateDate(Number(e.target.value), selectedMonth, selectedYear)
          }
        >
          {availableDays.map((d) => (
            <option key={d} value={d}>
              {String(d).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>

      <div className="date-select-col">
        <span className="date-select-sublabel">Month</span>
        <select
          value={selectedMonth}
          onChange={(e) =>
            updateDate(selectedDay, Number(e.target.value), selectedYear)
          }
        >
          {availableMonths.map((m) => (
            <option key={m.index} value={m.index}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="date-select-col">
        <span className="date-select-sublabel">Year</span>
        <select
          value={selectedYear}
          onChange={(e) =>
            updateDate(selectedDay, selectedMonth, Number(e.target.value))
          }
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
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


          <h1>
            Issue a resource
          </h1>


          <p className="lede">
            A lightweight handoff that keeps every item accountable.
          </p>

        </div>

      </section>


      {/* ===================================================
          STEPS
      =================================================== */}

      <div className="steps">

        <b>
          01 <span>Select item</span>
        </b>


        <b
          className={
            selected
              ? 'done'
              : ''
          }
        >
          02 <span>Recipient</span>
        </b>


        <b>
          03 <span>Confirm</span>
        </b>

      </div>


      <section className="issue-layout">

        <div className="issue-form">

          {/* =================================================
              RESOURCE SELECT
          ================================================= */}

          <label>

            Resource

            <select
              value={
                selected?.id || ''
              }
              onChange={(e) => {

                const resource =
                  resources.find(
                    (r: Resource) =>
                      r.id ===
                      e.target.value
                  ) || null;


                setSelected(
                  resource
                );


                // Reset quantity whenever
                // a different resource is selected.
                setIssue({
                  ...issue,
                  quantity: 1,
                });

              }}
            >

              <option value="">
                Select an inventory item
              </option>


              {resources.map(
                (r: Resource) => (

                  <option
                    value={r.id}
                    key={r.id}
                    disabled={
                      r.quantity <= 0
                    }
                  >
                    {r.name} —{' '}
                    {r.quantity}{' '}
                    available
                  </option>

                )
              )}

            </select>

          </label>


          {/* =================================================
              SELECTED RESOURCE
          ================================================= */}

          {selected && (

            <div className="selected-resource">

              <Cpu />


              <span>

                <b>
                  {selected.name}
                </b>


                <small>
                  {selected.category} ·{' '}
                  {selected.sub}
                </small>

              </span>


              <em>
                {selected.quantity}{' '}
                available
              </em>

            </div>

          )}


          {/* =================================================
              QUANTITY
          ================================================= */}

          {selected && (

            <label>

              Quantity

              <select
                value={Math.min(
                  issue.quantity,
                  selected.quantity
                )}
                onChange={(e) =>
                  setIssue({
                    ...issue,
                    quantity:
                      Number(
                        e.target.value
                      ),
                  })
                }
              >

                {Array.from(
                  {
                    length:
                      selected.quantity,
                  },
                  (_, index) =>
                    index + 1
                ).map(
                  (quantity) => (

                    <option
                      key={quantity}
                      value={quantity}
                    >
                      {quantity}
                    </option>

                  )
                )}

              </select>

            </label>

          )}


          {/* =================================================
              RECIPIENT + PROFESSION
          ================================================= */}

          <div className="form-grid">

            <label>

              Issued to

              <input
                value={issue.name}
                onChange={(e) =>
                  setIssue({
                    ...issue,
                    name:
                      e.target.value,
                  })
                }
                placeholder="Person's full name"
              />

            </label>


            <label>

              Profession

              <select
                value={
                  issue.profession
                }
                onChange={(e) =>
                  setIssue({
                    ...issue,
                    profession:
                      e.target.value,
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

                  <option
                    key={x}
                    value={x}
                  >
                    {x}
                  </option>

                ))}

              </select>

            </label>

          </div>


          {/* =================================================
              RETURNABLE
          ================================================= */}

          <fieldset>

            <legend>
              Returnable?
            </legend>


            <button
              type="button"
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
              type="button"
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


          {/* =================================================
              RETURN DATE
          ================================================= */}

          {issue.returnable && (

            <label>

              Return date

              <ReturnDateSelector
                value={issue.date}
                onChange={(date) =>
                  setIssue({
                    ...issue,
                    date,
                  })
                }
              />

            </label>

          )}


          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="button"
            className="primary"
            onClick={onSubmit}
            disabled={
              !selected ||
              selected.quantity <= 0
            }
          >

            Issue{' '}
            {issue.quantity > 1
              ? `${issue.quantity} resources`
              : 'resource'}

            <ChevronRight />

          </button>

        </div>


        {/* =================================================
            SYSTEM NOTE
        ================================================= */}

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
  onIssuesChange,
}: {
  onResourcesChange:
    (resources: Resource[]) => void;
  onIssuesChange:
    (issues: Issue[]) => void;
}) {

  const [issues, setIssues] =
    useState<Issue[]>([]);


  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await getIssuesApi();
        setIssues(data.map(mapBackendIssue));
      } catch (error) {
        console.error('Failed to load history from backend:', error);
      }
    };

    loadIssues();
  }, []);


  const [search, setSearch] =
    useState('');


  const formatDateTime = (
    date: string
  ) => {

    return new Date(
      date
    ).toLocaleString(
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


  const formatReturnDate = (
    date?: string
  ) => {

    if (!date) {
      return '—';
    }


    const parsed =
      new Date(date);


    if (
      isNaN(
        parsed.getTime()
      )
    ) {
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


  const filteredIssues =
    issues.filter((item) => {

      const text =
        `${item.resourceName} ${item.userName}`
          .toLowerCase();


      return text.includes(
        search.toLowerCase()
      );

    });


  /* =======================================================
     RETURN RESOURCE
  ======================================================= */

  const handleReturn = async (
    issueId: string
  ) => {

    try {
      await returnIssueApi(issueId);

      const [issueData, resourceData] = await Promise.all([
        getIssuesApi(),
        getResourcesApi(),
      ]);

      const updatedIssues =
        issueData.map(mapBackendIssue);

      setIssues(updatedIssues);
      onIssuesChange(updatedIssues);

      onResourcesChange(
        resourceData.map(mapBackendResource)
      );
    } catch (error) {
      console.error('Failed to return resource:', error);

      window.alert(
        error instanceof Error
          ? error.message
          : 'Failed to return resource'
      );
    }
  };


  return (
    <>
      <section className="page-head">

        <div>

          <p className="eyebrow">
            MOVEMENT LOG
          </p>


          <h1>
            History
          </h1>


          <p className="lede">
            A complete record of every issue, return and resource movement.
          </p>

        </div>


        <button className="secondary">
          Export history
        </button>

      </section>


      <section className="history-list">

        {/* =================================================
            TOP
        ================================================= */}

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
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search by resource or person..."
            />


            <button>
              All time
            </button>

          </div>

        </div>


        {/* =================================================
            TABLE HEADER
        ================================================= */}

        <div className="history-header">

          <span>
            #
          </span>


          <span>
            Resource Name
          </span>


          <span>
            Person Name
          </span>


          <span>
            Quantity
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


        {/* =================================================
            EMPTY
        ================================================= */}

        {filteredIssues.length === 0 ? (

          <div className="history-empty">
            No resource movements yet.
          </div>

        ) : (

          filteredIssues.map(
            (item, index) => (

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
                  {item.quantity || 1}
                </span>


                <span>
                  {formatDateTime(
                    item.issuedAt
                  )}
                </span>


                <span>
                  {formatReturnDate(
                    item.returnDate
                  )}
                </span>


                <span>

                  <b
                    className={`badge ${
                      item.status ===
                      'Returned'
                        ? 'returned'
                        : item.status ===
                          'Overdue'
                          ? 'overdue'
                          : 'available'
                    }`}
                  >
                    {item.status}
                  </b>

                </span>


                <span>

                  {item.status ===
                    'Issued' ||
                  item.status ===
                    'Overdue' ? (

                    <button
                      className="return-btn"
                      onClick={() =>
                        handleReturn(
                          item.id
                        )
                      }
                    >
                      Return
                    </button>

                  ) : (

                    <span>
                      —
                    </span>

                  )}

                </span>

              </div>

            )
          )

        )}

      </section>
    </>
  );
}

const USERS_STORAGE_KEY = 'deeptech_users';

function initializeUsers(): User[] {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);

  if (stored) {
    try {
      return JSON.parse(stored) as User[];
    } catch {
      localStorage.removeItem(USERS_STORAGE_KEY);
    }
  }

  const defaultUsers: User[] = [
    {
      id: 'USR-001',
      name: 'Admin',
      profession: 'Staff',
      role: 'Admin',
    },
  ];

  localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(defaultUsers)
  );

  return defaultUsers;
}

function saveUsers(users: User[]): void {
  localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(users)
  );
}

/* =========================================================
   PEOPLE
========================================================= */

function People() {
  const [users, setUsers] = useState<User[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [profession, setProfession] =
    useState<Profession>('Student');

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [error, setError] = useState('');

  // =========================================================
  // LOAD USERS FROM BACKEND
  // =========================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'http://localhost:8080/api/users',
        {
          headers: {
            Authorization: `Basic ${sessionStorage.getItem(
              'deeptech_api_credentials'
            ) || ''}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load users (${response.status})`
        );
      }

      const data = await response.json();

      const mappedUsers: User[] = data.map(
        (item: any) => ({
          id: String(item.id),
          name: item.name,
          profession: item.profession,
          role:
            item.role === 'Admin'
              ? 'Admin'
              : 'User',
        })
      );

      setUsers(mappedUsers);
    } catch (err) {
      console.error(
        'Failed to load users:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load users'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================================================
  // ADD MEMBER
  // =========================================================

  const addPerson = async () => {
    if (!name.trim()) {
      setError('Enter the member name');
      return;
    }

    if (!email.trim()) {
      setError('Enter the member email');
      return;
    }

    if (!password.trim()) {
      setError(
        'Enter a temporary password'
      );
      return;
    }

    if (password.length < 6) {
      setError(
        'Temporary password must contain at least 6 characters'
      );
      return;
    }

    try {
      setAdding(true);
      setError('');

      const credentials =
        sessionStorage.getItem(
          'deeptech_api_credentials'
        );

      const response = await fetch(
        'http://localhost:8080/api/users',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Basic ${credentials || ''}`,
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,
            profession,
            role: 'User',
          }),
        }
      );

      if (!response.ok) {
        let message =
          'Failed to create member';

        try {
          const errorData =
            await response.json();

          if (errorData?.error) {
            message = errorData.error;
          }
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      const created =
        await response.json();

      const newUser: User = {
        id: String(created.id),
        name: created.name,
        profession:
          created.profession,
        role: 'User',
      };

      setUsers((previous) => [
        ...previous,
        newUser,
      ]);

      // Reset form.
      setName('');
      setEmail('');
      setPassword('');
      setProfession('Student');

      alert(
        `Member account created successfully.\n\nUsername: ${created.email}\nTemporary password: ${password}\n\nGive these credentials to the member. They will be required to change the password after first login.`
      );

    } catch (err) {
      console.error(
        'Failed to create member:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create member'
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="people-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="page-head">

        <div>

          <p className="eyebrow">
            PEOPLE & ACCESS
          </p>

          <h1>
            People
          </h1>

          <p className="lede">
            Manage club members and their
            DeepTech resource access.
          </p>

        </div>

        <div className="page-head-icon">
          <Users size={24} />
        </div>

      </section>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="people-stats">

        <div className="people-stat-card">

          <div className="stat-icon">
            <Users size={20} />
          </div>

          <div>

            <span>
              Total people
            </span>

            <strong>
              {users.length}
            </strong>

          </div>

        </div>


        <div className="people-stat-card">

          <div className="stat-icon">
            <GraduationCap size={20} />
          </div>

          <div>

            <span>
              Students
            </span>

            <strong>
              {
                users.filter(
                  (u) =>
                    u.profession ===
                    'Student'
                ).length
              }
            </strong>

          </div>

        </div>


        <div className="people-stat-card">

          <div className="stat-icon">
            <ShieldCheck size={20} />
          </div>

          <div>

            <span>
              Admins
            </span>

            <strong>
              {
                users.filter(
                  (u) =>
                    u.role ===
                    'Admin'
                ).length
              }
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div
          style={{
            marginBottom: '16px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: '#fff1f1',
            border: '1px solid #ffd5d5',
            color: '#b42318',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {error}
        </div>

      )}


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="people-grid">

        {/* ===================================================
            ADD MEMBER
        =================================================== */}

        <div className="panel people-form-card">

          <div className="panel-head">

            <div>

              <p className="eyebrow">
                NEW MEMBER
              </p>

              <h2>
                Add member
              </h2>

            </div>

            <div className="panel-icon">
              <Plus size={19} />
            </div>

          </div>


          <p className="panel-description">
            Create a club member account.
            The member will be required to
            change the temporary password
            after their first login.
          </p>


          {/* NAME */}

          <div className="form-field">

            <label>
              Full name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter full name"
            />

          </div>


          {/* EMAIL */}

          <div className="form-field">

            <label>
              Email / Username
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="member@deeptech.com"
            />

          </div>


          {/* TEMPORARY PASSWORD */}

          <div className="form-field">

            <label>
              Temporary password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimum 6 characters"
            />

            <small
              style={{
                color: '#7b8195',
                fontSize: '12px',
                marginTop: '4px',
              }}
            >
              The member must change this
              password after first login.
            </small>

          </div>


          {/* PROFESSION */}

          <div className="form-field">

            <label>
              Profession
            </label>

            <select
              value={profession}
              onChange={(e) =>
                setProfession(
                  e.target.value as Profession
                )
              }
            >

              <option value="Student">
                Student
              </option>

              <option value="Teacher">
                Teacher
              </option>

              <option value="Staff">
                Staff
              </option>

              <option value="Researcher">
                Researcher
              </option>

              <option value="Project Member">
                Project Member
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* ROLE IS ALWAYS USER */}

          <div className="form-field">

            <label>
              Access role
            </label>

            <input
              value="User"
              disabled
            />

          </div>


          <button
            className="primary full people-add-button"
            onClick={addPerson}
            disabled={
              adding ||
              !name.trim() ||
              !email.trim() ||
              !password.trim()
            }
          >

            <Plus size={18} />

            {adding
              ? 'Creating account...'
              : 'Create member account'}

          </button>

        </div>


        {/* ===================================================
            DIRECTORY
        =================================================== */}

        <div className="panel people-directory">

          <div className="panel-head">

            <div>

              <p className="eyebrow">
                DIRECTORY
              </p>

              <h2>
                People directory
              </h2>

            </div>

            <span className="count-pill">
              {users.length} people
            </span>

          </div>


          <div className="people-table">

            <div className="people-table-head">

              <span>
                PERSON
              </span>

              <span>
                PROFESSION
              </span>

              <span>
                ROLE
              </span>

            </div>


            {loading ? (

              <div
                style={{
                  padding: '30px',
                  textAlign: 'center',
                  color: '#7b8195',
                }}
              >
                Loading people...
              </div>

            ) : users.length === 0 ? (

              <div
                style={{
                  padding: '30px',
                  textAlign: 'center',
                  color: '#7b8195',
                }}
              >
                No members found.
              </div>

            ) : (

              users.map((user) => (

                <div
                  className="people-table-row"
                  key={user.id}
                >

                  <div className="person-info">

                    <div className="person-avatar">

                      {user.name
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div>

                      <strong>
                        {user.name}
                      </strong>

                      <small>
                        {user.id}
                      </small>

                    </div>

                  </div>


                  <span className="profession-pill">
                    {user.profession}
                  </span>


                  <span
                    className={
                      user.role === 'Admin'
                        ? 'role-pill admin'
                        : 'role-pill user'
                    }
                  >
                    {user.role}
                  </span>

                </div>

              ))

            )}

          </div>

        </div>

      </section>

    </div>
  );
}


/* =========================================================
   INSIGHTS
========================================================= */

function Insights({
  resources,
  issues,
}: {
  resources: Resource[];
  issues: Issue[];
}) {

  const available = resources.reduce(
    (sum, resource) =>
      sum + resource.quantity,
    0
  );

  const issued = issues
    .filter(
      (issue) =>
        issue.status === 'Issued' ||
        issue.status === 'Overdue'
    )
    .reduce(
      (sum, issue) =>
        sum + (issue.quantity || 1),
      0
    );

  const returned = issues
    .filter(
      (issue) =>
        issue.status === 'Returned'
    )
    .reduce(
      (sum, issue) =>
        sum + (issue.quantity || 1),
      0
    );

  const overdue = issues
    .filter(
      (issue) =>
        issue.status === 'Overdue'
    )
    .reduce(
      (sum, issue) =>
        sum + (issue.quantity || 1),
      0
    );

  const totalMovements = issues.reduce(
    (sum, issue) =>
      sum + (issue.quantity || 1),
    0
  );

  const totalInventory =
    available + issued;

  const utilization =
    totalInventory > 0
      ? Math.round(
          (issued / totalInventory) * 100
        )
      : 0;


  const hardwareCount =
    resources
      .filter(
        (r) =>
          r.category === 'Hardware'
      )
      .reduce(
        (sum, r) =>
          sum + r.quantity,
        0
      );

  const softwareCount =
    resources
      .filter(
        (r) =>
          r.category === 'Software'
      )
      .reduce(
        (sum, r) =>
          sum + r.quantity,
        0
      );


  return (
    <div className="insights-page">

      {/* HEADER */}

      <section className="page-head">

        <div>
          <p className="eyebrow">
            RESOURCE INTELLIGENCE
          </p>

          <h1>Insights</h1>

          <p className="lede">
            Monitor inventory usage, resource movement and centre activity.
          </p>
        </div>

        <div className="page-head-icon">
          <BarChart3 size={24} />
        </div>

      </section>


      {/* MAIN METRICS */}

      <section className="insight-metrics">

        <div className="insight-card">

          <div className="insight-card-top">
            <span>Available inventory</span>

            <div className="insight-icon">
              <Package size={19} />
            </div>
          </div>

          <strong>{available}</strong>

          <small>
            Units currently available
          </small>

        </div>


        <div className="insight-card">

          <div className="insight-card-top">
            <span>Currently issued</span>

            <div className="insight-icon">
              <ArrowUpRight size={19} />
            </div>
          </div>

          <strong>{issued}</strong>

          <small>
            Units with users
          </small>

        </div>


        <div className="insight-card">

          <div className="insight-card-top">
            <span>Returned</span>

            <div className="insight-icon">
              <Check size={19} />
            </div>
          </div>

          <strong>{returned}</strong>

          <small>
            Units returned
          </small>

        </div>


        <div className="insight-card danger">

          <div className="insight-card-top">
            <span>Overdue</span>

            <div className="insight-icon">
              <CircleAlert size={19} />
            </div>
          </div>

          <strong>{overdue}</strong>

          <small>
            Requires attention
          </small>

        </div>

      </section>


      {/* ANALYTICS */}

      <section className="insights-grid">

        {/* UTILIZATION */}

        <div className="panel utilization-card">

          <div className="panel-head">

            <div>
              <p className="eyebrow">
                INVENTORY USAGE
              </p>

              <h2>
                Resource utilization
              </h2>
            </div>

            <Activity size={21} />

          </div>


          <div className="utilization-value">
            {utilization}%
          </div>


          <div className="usage-bar">

            <div
              style={{
                width: `${utilization}%`,
              }}
            />

          </div>


          <div className="usage-labels">
            <span>0%</span>
            <span>100%</span>
          </div>


          <p className="panel-description">
            Percentage of total tracked inventory currently issued to users.
          </p>

        </div>


        {/* INVENTORY BREAKDOWN */}

        <div className="panel">

          <div className="panel-head">

            <div>
              <p className="eyebrow">
                INVENTORY MIX
              </p>

              <h2>
                Resource categories
              </h2>
            </div>

            <Boxes size={21} />

          </div>


          <div className="category-stat">

            <div className="category-label">
              <span className="category-dot hardware" />

              <span>
                Hardware
              </span>
            </div>

            <strong>
              {hardwareCount}
            </strong>

          </div>


          <div className="category-bar">
            <div
              style={{
                width:
                  `${available > 0
                    ? (hardwareCount /
                        available) *
                      100
                    : 0}%`,
              }}
            />
          </div>


          <div className="category-stat">

            <div className="category-label">
              <span className="category-dot software" />

              <span>
                Software
              </span>
            </div>

            <strong>
              {softwareCount}
            </strong>

          </div>


          <div className="category-bar">
            <div
              style={{
                width:
                  `${available > 0
                    ? (softwareCount /
                        available) *
                      100
                    : 0}%`,
              }}
            />
          </div>

        </div>


        {/* ACTIVITY */}

        <div className="panel activity-summary">

          <div className="panel-head">

            <div>
              <p className="eyebrow">
                MOVEMENT ACTIVITY
              </p>

              <h2>
                Resource movements
              </h2>
            </div>

            <ClipboardList size={21} />

          </div>


          <div className="movement-number">
            {totalMovements}
          </div>


          <p>
            Total units moved through the centre.
          </p>


          <div className="movement-breakdown">

            <div>
              <span>Issued</span>
              <strong>{issued}</strong>
            </div>

            <div>
              <span>Returned</span>
              <strong>{returned}</strong>
            </div>

            <div>
              <span>Overdue</span>
              <strong>{overdue}</strong>
            </div>

          </div>

        </div>


        {/* STATUS */}

        <div className="panel">

          <div className="panel-head">

            <div>
              <p className="eyebrow">
                SYSTEM STATUS
              </p>

              <h2>
                Inventory health
              </h2>
            </div>

            <CircleAlert size={21} />

          </div>


          <div className="health-list">

            <div>
              <span>
                Total resources
              </span>

              <strong>
                {resources.length}
              </strong>
            </div>


            <div>
              <span>
                Low stock
              </span>

              <strong>
                {
                  resources.filter(
                    (r) =>
                      r.status === 'Low stock'
                  ).length
                }
              </strong>
            </div>


            <div>
              <span>
                Unavailable
              </span>

              <strong>
                {
                  resources.filter(
                    (r) =>
                      r.status === 'Unavailable'
                  ).length
                }
              </strong>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   EDIT RESOURCE
========================================================= */

function EditResource({
  resource,
  onSave,
  onClose,
}: any) {

  const [form, setForm] =
    useState<Resource>({
      ...resource,
    });


  const update = (
    key: keyof Resource,
    value: any
  ) => {

    setForm({
      ...form,
      [key]: value,
    });

  };


  const handleSave = () => {

    if (!form.name.trim()) {
      return;
    }


    onSave(
      form.id,
      form
    );

    onClose();

  };


  return (
    <div
      className="drawer-shade"
      onClick={onClose}
    >

      <aside
        className="detail"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <button
          className="close"
          onClick={onClose}
        >
          <X />
        </button>

        <p className="eyebrow">
          EDIT RESOURCE
        </p>

        <h2>
          Update resource
        </h2>

        <p className="drawer-subtitle">
          Update the item details in the innovation centre inventory.
        </p>

        <form
          className="drawer-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <label>
            <span>Resource name</span>
            <input
              value={form.name}
              onChange={(e) =>
                update(
                  'name',
                  e.target.value
                )
              }
              placeholder="e.g. Raspberry Pi 5"
              required
            />
          </label>

          <div className="drawer-form-grid">
            <label>
              <span>Category</span>
              <select
                value={form.category}
                onChange={(e) =>
                  update(
                    'category',
                    e.target.value
                  )
                }
              >
                <option value="Hardware">
                  Hardware
                </option>
                <option value="Software">
                  Software
                </option>
              </select>
            </label>

            <label>
              <span>Sub-category</span>
              <input
                value={form.sub}
                onChange={(e) =>
                  update(
                    'sub',
                    e.target.value
                  )
                }
                placeholder="e.g. Development Board"
              />
            </label>
          </div>

          <div className="drawer-form-grid">
            <label>
              <span>Quantity</span>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) =>
                  update(
                    'quantity',
                    Math.max(
                      0,
                      Number(
                        e.target.value
                      )
                    )
                  )
                }
              />
            </label>

            <label>
              <span>Location</span>
              <input
                value={
                  form.location || ''
                }
                onChange={(e) =>
                  update(
                    'location',
                    e.target.value
                  )
                }
                placeholder="e.g. Hardware Lab"
              />
            </label>
          </div>

          <div className="drawer-actions">
            <button
              type="submit"
              className="primary full"
              disabled={!form.name.trim()}
            >
              Save changes
              <Check />
            </button>
          </div>
        </form>

      </aside>

    </div>
  );
}


/* =========================================================
   ADD RESOURCE
========================================================= */

function AddResource({
  onAdded,
  onClose,
  onAdd,
  go,
}: any) {

  const [name, setName] =
    useState('');

  const [category, setCategory] =
    useState<Category>('Hardware');

  const [sub, setSub] =
    useState('');

  const [quantity, setQuantity] =
    useState(1);

  const [location, setLocation] =
    useState('');

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (go) {
      go('Inventory');
    }
  };

  const handleAdd = () => {

    if (!name.trim()) {
      return;
    }

    if (onAdd) {
      onAdd({
        name: name.trim(),
        category,
        sub: sub.trim(),
        quantity: Math.max(1, quantity),
        location: location.trim() || 'Innovation Centre',
      });
      return;
    }

    handleClose();

  };


  return (
    <div
      className="drawer-shade"
      onClick={handleClose}
    >

      <aside
        className="detail"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <button
          type="button"
          className="close"
          onClick={handleClose}
          aria-label="Close"
        >
          <X />
        </button>

        <p className="eyebrow">
          NEW INVENTORY
        </p>

        <h2>
          Add resource
        </h2>

        <p className="drawer-subtitle">
          Add a new item to the innovation centre inventory.
        </p>

        <form
          className="drawer-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <label>
            <span>Resource name</span>
            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="e.g. Raspberry Pi 5"
              required
            />
          </label>

          <div className="drawer-form-grid">
            <label>
              <span>Category</span>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value as Category
                  )
                }
              >
                <option value="Hardware">
                  Hardware
                </option>
                <option value="Software">
                  Software
                </option>
              </select>
            </label>

            <label>
              <span>Sub-category</span>
              <input
                value={sub}
                onChange={(e) =>
                  setSub(
                    e.target.value
                  )
                }
                placeholder="e.g. Development Board"
              />
            </label>
          </div>

          <div className="drawer-form-grid">
            <label>
              <span>Quantity</span>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(
                      1,
                      Number(
                        e.target.value
                      )
                    )
                  )
                }
                required
              />
            </label>

            <label>
              <span>Location</span>
              <input
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
                placeholder="e.g. Hardware Lab"
              />
            </label>
          </div>

          <div className="drawer-actions">
            <button
              type="submit"
              className="primary full"
              disabled={!name.trim()}
            >
              Add resource
              <Plus />
            </button>
          </div>
        </form>

      </aside>

    </div>
  );
}






export default App;

