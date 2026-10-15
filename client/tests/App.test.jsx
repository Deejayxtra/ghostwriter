import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the API module BEFORE importing App
vi.mock("../src/api/generate", () => ({
  requestGeneration: vi.fn(),
}));

import App from "../src/App";
import { requestGeneration } from "../src/api/generate";

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form and no output initially", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /ghostwriter/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();
  });

  it("renders generated text on success", async () => {
    requestGeneration.mockResolvedValueOnce({
      text: "# Generated Title\n\nBody.",
      warnings: [],
      contentType: "blog",
    });

    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/topic/i), "test topic");
    await user.type(screen.getByLabelText(/target audience/i), "testers");
    await user.click(screen.getByRole("button", { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue(/# Generated Title/)).toBeInTheDocument();
    });

    // Export bar appears
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pdf/i })).toBeInTheDocument();
  });

  it("renders warnings returned by the API", async () => {
    requestGeneration.mockResolvedValueOnce({
      text: "No subject here.",
      warnings: ["Email is missing a 'Subject:' line."],
      contentType: "email",
    });

    const user = userEvent.setup();
    render(<App />);

    // Switch to email
    await user.selectOptions(screen.getByLabelText(/content type/i), "email");
    await user.type(screen.getByLabelText(/purpose/i), "test");
    await user.type(screen.getByLabelText(/recipient context/i), "someone");
    await user.type(screen.getByLabelText(/key points/i), "one, two");
    await user.click(screen.getByRole("button", { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText(/missing a 'Subject:' line/i)).toBeInTheDocument();
    });
  });

  it("shows an error banner when the API rejects", async () => {
    requestGeneration.mockRejectedValueOnce(
      new Error("OpenAI account has no credits.")
    );

    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/topic/i), "x");
    await user.type(screen.getByLabelText(/target audience/i), "y");
    await user.click(screen.getByRole("button", { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText(/openai account has no credits/i)).toBeInTheDocument();
    });
  });

  it("does not render exports when output is empty", () => {
    render(<App />);
    expect(screen.queryByRole("button", { name: /txt/i })).not.toBeInTheDocument();
  });
});