import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";

type Location = {
  lat: number;
  lng: number;
};

type PermissionState = "granted" | "prompt" | "denied";

type SharedContextType = {
  location: Location | null;
  getCurrentLocation: () => Promise<Location>;
  locationPermissions: PermissionState;
};

const SharedContext = createContext<SharedContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationPermissions, setLocationPermissions] =
    useState<PermissionState>("prompt");

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationPermissions(result.state as PermissionState);

        result.onchange = () => {
          setLocationPermissions(result.state as PermissionState);
        };
      });
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setLocation(coords);
            resolve(coords);
          },
          (err) => reject(err)
        );
      }
    });
  }, []);

  return (
    <SharedContext.Provider
      value={{ location, getCurrentLocation, locationPermissions }}
    >
      {children}
    </SharedContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(SharedContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
