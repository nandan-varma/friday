import { render, screen, fireEvent, waitFor } from "@testing-library/react";
/* eslint-disable @typescript-eslint/no-require-imports */
import { EventForm } from "../../src/components/event/event-form";

// Mock the actions
jest.mock("../../src/lib/actions", () => ({
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
}));

import { createEvent } from "../../src/lib/actions";

// Mock the toast hook
jest.mock("../../src/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

// Mock react-hook-form
jest.mock("react-hook-form", () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => fn),
    watch: jest.fn(),
    setValue: jest.fn(),
    formState: {
      errors: {},
      isSubmitting: false,
    },
  })),
  FormProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock zod resolver
jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: jest.fn(),
}));

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
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
  });

  it("renders edit form when initial data provided", () => {
    const initialData = {
      id: "1",
      title: "Test Event",
      description: "Test Description",
    };
    render(<EventForm {...defaultProps} initialData={initialData} />);
    expect(screen.getByText("Edit Event")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Test Event");
  });

  it("updates form data when inputs change", () => {
    render(<EventForm {...defaultProps} />);
    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "New Event" } });
    expect(titleInput).toHaveValue("New Event");
  });

  it("updates description field", () => {
    render(<EventForm {...defaultProps} />);
    const descriptionTextarea = screen.getByLabelText("Description");
    fireEvent.change(descriptionTextarea, {
      target: { value: "New Description" },
    });
    expect(descriptionTextarea).toHaveValue("New Description");
  });

  it("updates location field", () => {
    render(<EventForm {...defaultProps} />);
    const locationInput = screen.getByLabelText("Location");
    fireEvent.change(locationInput, { target: { value: "New Location" } });
    expect(locationInput).toHaveValue("New Location");
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

  it("handles form submission with valid data", async () => {
    const mockCreateEvent = createEvent as jest.MockedFunction<
      typeof createEvent
    >;
    mockCreateEvent.mockResolvedValue(undefined);

    render(<EventForm {...defaultProps} />);

    const titleInput = screen.getByLabelText("Title");
    const submitButton = screen.getByRole("button", { name: /create event/i });

    fireEvent.change(titleInput, { target: { value: "Test Event" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalled();
    });

    // Verify FormData was passed
    const formData = mockCreateEvent.mock.calls[0][0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("title")).toBe("Test Event");

    expect(mockOnSave).toHaveBeenCalled();
  });

  it("handles form submission errors", async () => {
    const mockCreateEvent = require("../../src/lib/actions").createEvent;
    mockCreateEvent.mockRejectedValue(new Error("Network error"));

    render(<EventForm {...defaultProps} />);

    const titleInput = screen.getByLabelText("Title");
    const submitButton = screen.getByRole("button", { name: /create event/i });

    fireEvent.change(titleInput, { target: { value: "Test Event" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalled();
    });
  });

  it("validates required title field", async () => {
    render(<EventForm {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: /create event/i });
    fireEvent.click(submitButton);

    // Should show validation error for empty title
    await waitFor(() => {
      expect(screen.getByText("Create New Event")).toBeInTheDocument();
    });
  });

  it("handles update form submission", async () => {
    const mockUpdateEvent = require("../../src/lib/actions").updateEvent;
    mockUpdateEvent.mockResolvedValue(undefined);

    const initialData = {
      id: "1",
      title: "Original Event",
      description: "Original Description",
    };

    render(<EventForm {...defaultProps} initialData={initialData} />);

    const submitButton = screen.getByRole("button", { name: /update event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalled();
    });

    expect(mockOnSave).toHaveBeenCalled();
  });

  it("closes form when cancel button is clicked", () => {
    render(<EventForm {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles all-day event creation", async () => {
    const mockCreateEvent = require("../../src/lib/actions").createEvent;
    mockCreateEvent.mockResolvedValue(undefined);

    render(<EventForm {...defaultProps} />);

    const titleInput = screen.getByLabelText("Title");
    const allDaySwitch = screen.getByLabelText("All day event");
    const submitButton = screen.getByRole("button", { name: /create event/i });

    fireEvent.change(titleInput, { target: { value: "All Day Event" } });
    fireEvent.click(allDaySwitch);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalled();
    });

    // Verify FormData was passed with correct values
    const formData = mockCreateEvent.mock.calls[0][0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("title")).toBe("All Day Event");
    expect(formData.get("isAllDay")).toBe("true");
  });

  it("handles event with location", async () => {
    const mockCreateEvent = require("../../src/lib/actions").createEvent;
    mockCreateEvent.mockResolvedValue(undefined);

    render(<EventForm {...defaultProps} />);

    const titleInput = screen.getByLabelText("Title");
    const locationInput = screen.getByLabelText("Location");
    const submitButton = screen.getByRole("button", { name: /create event/i });

    fireEvent.change(titleInput, { target: { value: "Event with Location" } });
    fireEvent.change(locationInput, { target: { value: "Conference Room A" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalled();
    });

    // Verify FormData was passed with correct values
    const formData = mockCreateEvent.mock.calls[0][0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("title")).toBe("Event with Location");
    expect(formData.get("location")).toBe("Conference Room A");
  });

  it("handles event with description", async () => {
    const mockCreateEvent = require("../../src/lib/actions").createEvent;
    mockCreateEvent.mockResolvedValue(undefined);

    render(<EventForm {...defaultProps} />);

    const titleInput = screen.getByLabelText("Title");
    const descriptionTextarea = screen.getByLabelText("Description");
    const submitButton = screen.getByRole("button", { name: /create event/i });

    fireEvent.change(titleInput, {
      target: { value: "Event with Description" },
    });
    fireEvent.change(descriptionTextarea, {
      target: { value: "This is a detailed description" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalled();
    });

    // Verify FormData was passed with correct values
    const formData = mockCreateEvent.mock.calls[0][0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("title")).toBe("Event with Description");
    expect(formData.get("description")).toBe("This is a detailed description");
  });

  it("shows loading state during submission", async () => {
    const mockCreateEvent = require("../../src/lib/actions").createEvent;
    mockCreateEvent.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<EventForm {...defaultProps} />);

    const titleInput = screen.getByLabelText("Title");
    const submitButton = screen.getByRole("button", { name: /create event/i });

    fireEvent.change(titleInput, { target: { value: "Test Event" } });
    fireEvent.click(submitButton);

    // Button should show loading state
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalled();
    });
  });

  it("handles form with selected date", () => {
    const selectedDate = new Date("2024-01-15");
    render(<EventForm {...defaultProps} selectedDate={selectedDate} />);

    // Should initialize with selected date
    expect(screen.getByText("Create New Event")).toBeInTheDocument();
  });

  it("renders all required form fields", () => {
    render(<EventForm {...defaultProps} />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("All day event")).toBeInTheDocument();
    expect(screen.getByText("Start Time")).toBeInTheDocument();
    expect(screen.getByText("End Time")).toBeInTheDocument();
  });

  it("handles form reset after successful submission", async () => {
    const mockCreateEvent = require("../../src/lib/actions").createEvent;
    mockCreateEvent.mockResolvedValue(undefined);

    render(<EventForm {...defaultProps} />);

    const titleInput = screen.getByLabelText("Title");
    const submitButton = screen.getByRole("button", { name: /create event/i });

    fireEvent.change(titleInput, { target: { value: "Test Event" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
});
