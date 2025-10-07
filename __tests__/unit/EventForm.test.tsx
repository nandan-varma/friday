import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EventForm } from "../../src/components/event/event-form";

// Mock the actions
jest.mock("../../src/lib/actions", () => ({
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
}));

// Mock the toast hook
jest.mock("../../src/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

import { createEvent, updateEvent } from "../../src/lib/actions";
import { toast } from "../../src/hooks/use-toast";

describe("EventForm", () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders create form when no initial data", () => {
    render(<EventForm {...defaultProps} />);
    expect(screen.getByText("Create New Event")).toBeInTheDocument();
    expect(screen.getByLabelText("Event Title *")).toBeInTheDocument();
  });

  it("renders edit form when initial data provided", () => {
    const initialData = {
      id: "1",
      title: "Test Event",
      description: "Test Description",
    };
    render(<EventForm {...defaultProps} initialData={initialData} />);
    expect(screen.getByText("Edit Event")).toBeInTheDocument();
    expect(screen.getByLabelText("Event Title *")).toHaveValue("Test Event");
  });

  it("updates form data when inputs change", () => {
    render(<EventForm {...defaultProps} />);
    const titleInput = screen.getByLabelText("Event Title *");
    fireEvent.change(titleInput, { target: { value: "New Event" } });
    expect(titleInput).toHaveValue("New Event");
  });

  it("toggles all day switch", () => {
    render(<EventForm {...defaultProps} />);
    const allDaySwitch = screen.getByLabelText("All day event");
    fireEvent.click(allDaySwitch);
    expect(allDaySwitch).toBeChecked();
  });

  it("shows time selection when not all day", () => {
    render(<EventForm {...defaultProps} />);
    expect(screen.getByText("Start Time")).toBeInTheDocument();
    expect(screen.getByText("End Time")).toBeInTheDocument();
  });

  it("hides time selection when all day is checked", () => {
    render(<EventForm {...defaultProps} />);
    const allDaySwitch = screen.getByLabelText("All day event");
    fireEvent.click(allDaySwitch);
    expect(screen.queryByText("Start Time")).not.toBeInTheDocument();
  });
});
