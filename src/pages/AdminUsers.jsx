import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminUserForm from '../components/AdminUserForm';
import authService from '../services/authService';
import dashboardStyles from '../styles/AdminDashboard.module.css';
import adminStyles from '../styles/AdminProducts.module.css';
import styles from '../styles/AdminUsers.module.css';
import listStyles from '../styles/ProductList.module.css';

function AdminUsers() {
  const navigate = useNavigate();
  const [usersState, setUsersState] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextUsers = await authService.getAdminUsersAsync();

        if (isMounted) {
          setUsersState(nextUsers);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error && error.message
              ? error.message
              : 'No fue posible cargar los usuarios del panel admin.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return usersState.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        [user.fullName ?? user.name, user.email, user.role, user.status].some((field) =>
          String(field ?? '')
            .toLowerCase()
            .includes(normalizedQuery)
        );
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, usersState]);

  const handleOpenCreate = () => {
    setSubmitError('');
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSubmitError('');
    setEditingUser(null);
    setIsFormOpen(false);
  };

  const handleCreateUser = async (payload) => {
    setIsSaving(true);
    setSubmitError('');

    try {
      const createdUser = await authService.createAdminUserAsync(payload);
      setUsersState((currentUsers) => [createdUser, ...currentUsers]);
      handleCloseForm();
      return { ok: true };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'No fue posible crear el usuario.';
      setSubmitError(message);
      return { ok: false, error: message };
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditStart = async (user) => {
    setSubmitError('');

    try {
      const nextUser = await authService.getAdminUserByIdAsync(user.id);
      setEditingUser(nextUser ?? user);
      setIsFormOpen(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : 'No fue posible cargar el usuario seleccionado.'
      );
    }
  };

  const handleUpdateUser = async (payload) => {
    setIsSaving(true);
    setSubmitError('');

    try {
      const updatedUser = await authService.updateAdminUserAsync(editingUser?.id, payload);
      setUsersState((currentUsers) =>
        currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      handleCloseForm();
      return { ok: true };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'No fue posible actualizar el usuario.';
      setSubmitError(message);
      return { ok: false, error: message };
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    setSubmitError('');

    try {
      const nextUsers = await authService.deleteAdminUserAsync(userId);
      setUsersState(nextUsers);

      if (editingUser?.id === userId) {
        handleCloseForm();
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : 'No fue posible desactivar el usuario seleccionado.'
      );
    }
  };

  return (
    <section className={adminStyles.container}>
      <header className={adminStyles.header}>
        <div>
          <p className={adminStyles.eyebrow}>Semana 18</p>
          <h1 className={adminStyles.title}>Gestión de usuarios</h1>
          <p className={adminStyles.subtitle}>
            Administra usuarios del sistema con backend real, incluyendo creación, edición de rol y
            control de estado activo o inactivo.
          </p>
        </div>

        <div className={adminStyles.actions}>
          <button
            type="button"
            className={adminStyles.secondaryButton}
            onClick={() => navigate('/admin')}
          >
            Volver al panel
          </button>
          <button
            type="button"
            className={adminStyles.primaryButton}
            onClick={handleOpenCreate}
            disabled={isLoading}
          >
            Crear usuario
          </button>
        </div>
      </header>

      {isFormOpen ? (
        <AdminUserForm
          initialValues={editingUser}
          isEditing={Boolean(editingUser)}
          isSubmitting={isSaving}
          onCancel={handleCloseForm}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          submitError={submitError}
        />
      ) : (
        <>
          <div className={listStyles.toolbar}>
            <div className={listStyles.filters}>
              <input
                className={listStyles.searchInput}
                disabled={isLoading}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre, correo, rol o estado..."
                type="search"
              />

              <select
                className={listStyles.select}
                disabled={isLoading}
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">Todos los roles</option>
                <option value="ADMIN">Administrador</option>
                <option value="CUSTOMER">Cliente</option>
              </select>

              <select
                className={listStyles.select}
                disabled={isLoading}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="ACTIVE">Activos</option>
                <option value="INACTIVE">Inactivos</option>
              </select>
            </div>
          </div>

          {submitError ? (
            <div className={listStyles.emptyState}>
              <p>{submitError}</p>
            </div>
          ) : null}

          {isLoading ? (
            <div className={listStyles.emptyState}>
              <p>Cargando usuarios del panel admin...</p>
            </div>
          ) : loadError ? (
            <div className={listStyles.emptyState}>
              <p>{loadError}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={listStyles.emptyState}>
              <p>No hay usuarios que coincidan con los filtros actuales.</p>
            </div>
          ) : (
            <div className={dashboardStyles.list}>
              {filteredUsers.map((user) => (
                <article key={user.id} className={styles.userCard}>
                  <div className={styles.userMain}>
                    <div>
                      <strong className={styles.userName}>{user.fullName || user.name}</strong>
                      <p className={styles.userMeta}>{user.email}</p>
                    </div>

                    <div className={styles.badges}>
                      <span className={dashboardStyles.roleBadge}>
                        {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                      </span>
                      <span className={dashboardStyles.roleBadge}>
                        {user.status === 'INACTIVE' ? 'Inactivo' : 'Activo'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.userDetails}>
                    <span>Telefono: {user.phone || 'Sin telefono'}</span>
                    <span>
                      Creado:{' '}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('es-CO')
                        : 'Sin fecha'}
                    </span>
                  </div>

                  <div className={styles.userActions}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => handleEditStart(user)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => handleDeactivateUser(user.id)}
                      disabled={user.status === 'INACTIVE'}
                    >
                      Desactivar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default AdminUsers;
