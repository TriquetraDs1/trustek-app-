import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // ✅ Your AuthContext

// Simple loading spinner
const LoadingSpinner: React.FC = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/90 z-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    <p className="mt-4 text-primary font-semibold">Checking credentials...</p>
  </div>
);

/**
 * ✅ Higher-Order Component for protecting routes
 * Redirects unauthenticated users to `/auth`
 */
const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const ComponentWithAuth: React.FC<P> = (props) => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          // Redirect to login if not logged in
          navigate("/auth", { replace: true });
        } else {
          setIsChecking(false);
        }
      }
    }, [user, isLoading, navigate]);

    // Show loader while checking
    if (isLoading || isChecking) {
      return <LoadingSpinner />;
    }

    return <WrappedComponent {...props} />;
  };

  ComponentWithAuth.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return ComponentWithAuth;
};

export default withAuth;
