import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { checkPermission, clearPermissionCache, checkAuth as checkAuthService } from '../services/authService';

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vérifier l'état d'authentification
  const verifyAuth = useCallback(async () => {
    try {
      const response = await checkAuthService();
      // Le backend renvoie { hasPermission, user: { ... } }
      const userData = response?.user || response;

      if (userData && userData.id) {
        // Normaliser l'utilisateur (même logique que dans login)
        const normalizedUser = {
          ...userData,
          roles: Array.isArray(userData.roles)
            ? userData.roles
            : userData.role
              ? [userData.role]
              : []
        };

        setUser(normalizedUser);
        setPermissions(normalizedUser.permissions || []);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      // Si on a une erreur 401, l'intercepteur s'est déjà occupé de nettoyer
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      // Récupérer la session depuis localStorage au chargement
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setPermissions(parsedUser.permissions || []);

          // Vérifier la validité de la session avec le backend
          await verifyAuth();
        } catch (e) {
          console.error('Erreur lors de la récupération de la session:', e);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [verifyAuth]);

  const login = async (username, password = null) => {
    try {
      // Préparer les données de connexion
      const loginData = password
        ? { username, password }
        : { username };

      // Appeler l'endpoint de login du backend
      const response = await api.post('/auth/login', loginData);

      // Normaliser la structure des données utilisateur
      const userData = response.data?.user || response.data;

      // S'assurer que les rôles sont un tableau
      const normalizedUser = {
        ...userData,
        roles: Array.isArray(userData.roles)
          ? userData.roles
          : userData.role
            ? [userData.role]
            : []
      };

      // Mettre à jour l'état et le stockage local
      setUser(normalizedUser);
      setPermissions(normalizedUser.permissions || []);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      // Vider le cache des permissions pour forcer une nouvelle vérification
      clearPermissionCache();

      return { success: true, user: normalizedUser };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      // Utiliser le message d'erreur de l'intercepteur Axios si disponible
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erreur lors de la connexion';
      return { success: false, error: errorMessage };
    }
  }

  const logout = async () => {
    try {
      // Appeler l'endpoint de logout du backend pour détruire la session
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer côté frontend
      setUser(null);
      setPermissions([]);
      localStorage.removeItem('user');
      clearPermissionCache();
    }
  };

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = useCallback(async (permission) => {
    if (!permission) return true;

    // Vérifier d'abord les permissions chargées
    if (permissions.includes(permission)) {
      return true;
    }

    // Si la permission n'est pas dans la liste, vérifier auprès du serveur
    try {
      return await checkPermission(permission);
    } catch (error) {
      console.error('Erreur lors de la vérification de la permission:', error);
      return false;
    }
  }, [permissions]);

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = useCallback((role) => {
    if (!user) return false;
    // Vérifier à la fois user.roles (tableau) et user.role (string)
    const roles = Array.isArray(user.roles)
      ? user.roles
      : user.role
        ? [user.role]
        : [];
    return roles.includes(role);
  }, [user]);

  // Déterminer si l'utilisateur est admin
  const isAdmin = useMemo(() => {
    if (!user) return false;
    // Vérifier à la fois user.roles (tableau) et user.role (string)
    if (Array.isArray(user.roles)) {
      return user.roles.includes('ADMIN');
    }
    return user.role === 'ADMIN';
  }, [user]);

  const value = {
    user,
    permissions,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    hasPermission,
    hasRole,
    verifyAuth,
    refreshUser: verifyAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

