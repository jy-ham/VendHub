import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "../SearchBar";
import { BCIT_BUILDINGS } from "../../data/BCIT_BUILDINGS";
import { LocationProvider } from "../SharedContext";

globalThis.alert = vi.fn();

describe("SearchBar component", () => {
  const mockOnSearch = vi.fn();
  const mockSetDismissSuggestions = vi.fn();
  const mockSetShowAuth = vi.fn();
  const mockSetMachines = vi.fn();

  const setup = (isLoggedIn = true) => {
    render(
      <LocationProvider>
        <SearchBar
          onSearch={mockOnSearch}
          dismissSuggestions={false}
          setDismissSuggestions={mockSetDismissSuggestions}
          setShowAuth={mockSetShowAuth}
          isLoggedIn={isLoggedIn}
          setMachines={mockSetMachines}
        />
      </LocationProvider>
    );
  };
  // check if search bar is loaded
  it("renders input field", () => {
    setup();
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
  });
  // check if suggestion is showing
  it("shows suggestions when typing", () => {
    setup();
    const input = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(input, { target: { value: "SW" } });

    const match = BCIT_BUILDINGS.find((b) => b.name.startsWith("SW"));
    if (match) {
      const suggestion = screen
        .getAllByText(match.name)
        .find((el) => el.tagName === "LI");
      expect(suggestion).toBeInTheDocument();
    }
  });
  //check onSearch function is working
  it("calls onSearch when suggestion clicked", () => {
    setup();
    const input = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(input, { target: { value: "SW1" } });

    const suggestion = screen
      .getAllByText("SW1")
      .find((el) => el.tagName === "LI");
    expect(suggestion).toBeInTheDocument();
    fireEvent.click(suggestion!);

    expect(mockOnSearch).toHaveBeenCalledWith({
      lat: expect.any(Number),
      lng: expect.any(Number),
    });
  });

  it("calls onSearch on form submit with exact match", () => {
    setup();
    const input = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(input, { target: { value: "SW1" } });
    fireEvent.submit(input);

    expect(mockOnSearch).toHaveBeenCalledWith({
      lat: expect.any(Number),
      lng: expect.any(Number),
    });
  });
  // check if no building is found
  it("alerts when no match on submit", () => {
    setup();
    const input = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(input, { target: { value: "XYZ" } });
    fireEvent.submit(input);

    expect(globalThis.alert).toHaveBeenCalledWith("Building not found.");
  });
  // check buttion for add and login
  it("shows AddButton when logged in", () => {
    setup(true);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("add");
  });

  it("shows login button when not logged in", () => {
    setup(false);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("login-button");
  });
});
