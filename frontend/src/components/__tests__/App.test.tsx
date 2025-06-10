import { render, screen, waitFor } from "@testing-library/react";
import App from "../../App";
import { vi } from "vitest";
import axios from "axios";

// Mock axios
vi.mock("axios");

const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
};

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading message initially", () => {
    mockedAxios.get = vi.fn(() => new Promise(() => {}));
    render(<App />);
    expect(screen.getByText(/loading map/i)).toBeInTheDocument();
  });

  it("shows error if API key fails to load", async () => {
    mockedAxios.get = vi.fn().mockRejectedValue(new Error("Failed"));

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText(/failed to load map/i)).toBeInTheDocument()
    );
  });
});
