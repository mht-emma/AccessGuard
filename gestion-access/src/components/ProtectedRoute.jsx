import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mappage des chemins aux permissions requises
const pathToPermission = {
  '/dashboard': 'READ_DASHBOARD',
  '/users': 'READ_USERS',
  '/roles': 'READ_ROLES',
  '/permissions': 'READ_PERMISSIONS',
  '/resources': 'READ_RESOURCES',
  '/ips': 'READ_IPS',
  '/access-attempts': 'READ_ACCESS_ATTEMPTS',
  '/graph': 'READ_GRAPH',
  '/profile': 'READ_PROFILE',
  '/settings': 'WRITE_SETTINGS',
  '/admin': 'ADMIN_ACCESS'
};

// État de chargement global pour éviter les vérifications multiples
const loadingStates = new Map();

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission: explicitPermission = null,
  loadingComponent: LoadingComponent = null
}) => {
  const { 
    user, 
    isAuthenticated, 
    isAdmin, 
    hasPermission: contextHasPermission,
    hasRole: contextHasRole
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Identifiant unique pour cette instance de vérification
  const verificationId = useMemo(() => 
    `${location.pathname}-${explicitPermission || ''}-${requiredRole || ''}`,
    [location.pathname, explicitPermission, requiredRole]
  );
  
  // Déterminer la permission requise en fonction du chemin
  const requiredPermissionForPath = useMemo(() => {
    if (explicitPermission) return explicitPermission;
    
    // Trouver la correspondance la plus longue dans le chemin
    const matchingPath = Object.keys(pathToPermission)
      .filter(path => location.pathname.startsWith(path))
      .sort((a, b) => b.length - a.length)[0];
      
    return matchingPath ? pathToPermission[matchingPath] : null;
  }, [location.pathname, explicitPermission]);

  const verifyAccess = useCallback(async () => {
    // Vérifier si une vérification est déjà en cours pour ce chemin
    if (loadingStates.has(verificationId)) {
      return;
    }
    
    loadingStates.set(verificationId, true);
    setIsLoading(true);
    
    console.log('=== Vérification des accès ===');
    console.log('Chemin:', location.pathname);
    console.log('Utilisateur:', user);
    console.log('Est authentifié:', isAuthenticated);
    console.log('Est admin:', isAdmin);
    console.log('Rôle requis:', requiredRole);
    console.log('Permission requise:', requiredPermissionForPath);
    
    try {
      // 0. Vérifier si l'utilisateur est administrateur
      if (isAdmin) {
        console.log('Accès administrateur accordé - Accès complet');
        setIsAuthorized(true);
        return;
      }

      // 1. Vérifier l'authentification
      if (!isAuthenticated) {
        console.log('Non authentifié - Redirection vers /login');
        navigate('/login', { 
          state: { 
            from: location.pathname,
            message: 'Veuillez vous connecter pour accéder à cette page'
          },
          replace: true
        });
        return;
      }

      // 2. Vérifier le rôle si spécifié
      if (requiredRole && !contextHasRole(requiredRole)) {
        console.log(`Rôle requis non trouvé - Requis: ${requiredRole}, Actuel:`, user?.role || user?.roles);
        navigate('/forbidden', { 
          state: { 
            reason: `Accès réservé aux utilisateurs avec le rôle: ${requiredRole}`,
            requiredRole,
            currentRole: user?.role || user?.roles?.join(', ')
          },
          replace: true
        });
        return;
      }

      // 3. Vérifier la permission si spécifiée
      if (requiredPermissionForPath) {
        console.log('Vérification de la permission:', requiredPermissionForPath);
        const hasAccess = await contextHasPermission(requiredPermissionForPath);
        console.log('Résultat de la vérification:', hasAccess);
        
        if (!hasAccess) {
          console.log('Permission refusée - Redirection vers /forbidden');
          navigate('/forbidden', { 
            state: { 
              reason: `Permission requise : ${requiredPermissionForPath}`,
              requiredPermission: requiredPermissionForPath,
              userPermissions: user?.permissions || []
            },
            replace: true
          });
          return;
        }
      }
      
      // Si on arrive ici, l'accès est autorisé
      setIsAuthorized(true);
    } catch (error) {
      console.error('Erreur lors de la vérification des droits d\'accès:', error);
      navigate('/error', { 
        state: { 
          error: 'Erreur de vérification des droits',
          details: error.message
        },
        replace: true
      });
    } finally {
      setIsLoading(false);
      loadingStates.delete(verificationId);
    }
  }, [
    isAuthenticated, 
    requiredRole, 
    requiredPermissionForPath, 
    location.pathname, 
    navigate, 
    verificationId,
    contextHasPermission,
    contextHasRole,
    user?.permissions,
    user?.role
  ]);

  // Effet pour vérifier les droits d'accès
  useEffect(() => {
    verifyAccess();
    
    // Nettoyage
    return () => {
      loadingStates.delete(verificationId);
    };
  }, [verifyAccess, verificationId]);

  // Afficher le composant de chargement personnalisé s'il est fourni
  if (isLoading) {
    return LoadingComponent ? (
      <LoadingComponent />
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des droits d'accès...</p>
        </div>
      </div>
    );
  }

  // Si l'accès est autorisé, afficher les enfants
  if (isAuthorized) {
    return children;
  }

  // Par défaut, ne rien afficher (les redirections sont gérées dans verifyAccess)
  return null;
};

export default ProtectedRoute;

