import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContentForm from "../src/components/ContentForm";

describe("ContentForm", () => {
  let onSubmit;

  beforeEach(() => {
    onSubmit = vi.fn();
  });

  it("renders all four content types", () => {
    render(<ContentForm onSubmit={onSubmit} loading={false} />);
    const select = screen.getByLabelText(/content type/i);
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.value);
    expect(options).toEqual(["blog", "email", "story", "social"]);
  });

  it("defaults to blog and shows blog fields", () => {
    render(<ContentForm onSubmit={onSubmit} loading={false} />);
    expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target audience/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/word count/i)).toBeInTheDocument();
  });

  it("swaps fields when content type changes to story", async () => {
    const user = userEvent.setup();
    render(<ContentForm onSubmit={onSubmit} loading={false} />);

    await user.selectOptions(screen.getByLabelText(/content type/i), "story");

    expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/characters/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/setting/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/word count/i)).not.toBeInTheDocument();
  });

  it("swaps fields when content type changes to social", async () => {
    const user = userEvent.setup();
    render(<ContentForm onSubmit={onSubmit} loading={false} />);

    await user.selectOptions(screen.getByLabelText(/content type/i), "social");

    expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/platform/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/goal/i)).toBeInTheDocument();
  });

  it("submits a valid blog payload", async () => {
    const user = userEvent.setup();
    render(<ContentForm onSubmit={onSubmit} loading={false} />);

    await user.type(screen.getByLabelText(/topic/i), "Remote work");
    await user.type(screen.getByLabelText(/target audience/i), "developers");
    await user.clear(screen.getByLabelText(/word count/i));
    await user.type(screen.getByLabelText(/word count/i), "400");

    await user.click(screen.getByRole("button", { name: /generate/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      contentType: "blog",
      topic: "Remote work",
      audience: "developers",
      wordCount: 400,
      tone: "professional",
      expertiseLevel: "intermediate",
    });
  });

  it("submits a valid social payload", async () => {
    const user = userEvent.setup();
    render(<ContentForm onSubmit={onSubmit} loading={false} />);

    await user.selectOptions(screen.getByLabelText(/content type/i), "social");
    await user.type(screen.getByLabelText(/product/i), "FocusApp");
    await user.selectOptions(screen.getByLabelText(/platform/i), "linkedin");

    await user.click(screen.getByRole("button", { name: /generate/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      contentType: "social",
      product: "FocusApp",
      platform: "linkedin",
      goal: "awareness",
      tone: "casual",
    });
  });

  it("disables the button while loading", () => {
    render(<ContentForm onSubmit={onSubmit} loading={true} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/generating/i);
  });

  it("discards previous values when content type changes", async () => {
    const user = userEvent.setup();
    render(<ContentForm onSubmit={onSubmit} loading={false} />);

    await user.type(screen.getByLabelText(/topic/i), "should be discarded");
    await user.selectOptions(screen.getByLabelText(/content type/i), "story");
    await user.selectOptions(screen.getByLabelText(/content type/i), "blog");

    expect(screen.getByLabelText(/topic/i)).toHaveValue("");
  });
});