import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Map from "../Map";
import { vi } from "vitest";
import axios from "axios";
import React from "react";
import { VendingMachine } from "../../@types/VendingMachine";
import { LocationProvider } from "../SharedContext";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
};
// Mock @react-google-maps/api components to avoid real map loading
vi.mock("@react-google-maps/api", () => {
  return {
    GoogleMap: ({ children, onClick, onLoad }: any) => {
      React.useEffect(() => {
        // simulate map loading
        onLoad && onLoad({ panTo: vi.fn() });
      }, [onLoad]);

      return (
        <div data-testid="google-map" onClick={onClick}>
          {children}
        </div>
      );
    },
    Marker: (props: any) => (
      <div data-testid="marker" {...props}>
        Marker
      </div>
    ),
  };
});

describe("Map component", () => {
  const defaultMachines: VendingMachine[] = [
    {
      id: 1,
      location: "Building A",
      desc: "Near main entrance",
      available: true,
      lat: 49.25,
      lon: -123.0,
      items: "Snacks, Drinks",
    },
    {
      id: 2,
      location: "Building A",
      desc: "Near main entrance",
      available: false,
      lat: 49.25,
      lon: -123.0,
      items: "Sandwiches",
    },
    {
      id: 3,
      location: "Building B",
      desc: "Second floor",
      available: true,
      lat: 49.26,
      lon: -123.01,
      items: "Water",
    },
  ];

  const center = { lat: 49.2488, lng: -122.9995 };

  it("fetches and renders vending machines as DotMarkers", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: defaultMachines });

    const setMachines = vi.fn();
    render(
      <LocationProvider>
        <Map
          center={center}
          zoom={18}
          mutiMachine={false}
          setMutiMachine={vi.fn()}
          onMapClick={vi.fn()}
          machines={defaultMachines}
          setMachines={setMachines}
        />
      </LocationProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("marker").length).toBe(
        defaultMachines.length
      );
    });
  });

  it("handles marker click to show multiple machines card", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: defaultMachines });

    const setMutiMachine = vi.fn();
    const setMachines = vi.fn();

    render(
      <LocationProvider>
        <Map
          center={center}
          zoom={18}
          mutiMachine={false}
          setMutiMachine={setMutiMachine}
          onMapClick={vi.fn()}
          machines={defaultMachines}
          setMachines={setMachines}
        />
      </LocationProvider>
    );

    const markers = await screen.findAllByTestId("marker");
    expect(markers.length).toBe(defaultMachines.length);

    fireEvent.click(markers[0]);

    expect(setMutiMachine).toHaveBeenCalledWith(true);
  });

  it("calls onMapClick when map is clicked", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    const onMapClick = vi.fn();

    render(
      <LocationProvider>
        <Map
          center={center}
          zoom={18}
          mutiMachine={false}
          setMutiMachine={vi.fn()}
          onMapClick={onMapClick}
          machines={[]}
          setMachines={vi.fn()}
        />
      </LocationProvider>
    );

    fireEvent.click(screen.getByTestId("google-map"));
    expect(onMapClick).toHaveBeenCalled();
  });
});
