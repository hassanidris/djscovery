import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DjRatingForm } from "@/components/reputation/DjRatingForm";

// Mock the server action
vi.mock("@/lib/actions/dj-ratings", () => ({
  createDjRating: vi.fn(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, fill }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={fill} />
  ),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { createDjRating } from "@/lib/actions/dj-ratings";

describe("DjRatingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    djProfileId: 1,
    djName: "TestDJ",
    djSlug: "test-dj",
  };

  it("renders DJ name and direct review label", () => {
    render(<DjRatingForm {...defaultProps} />);

    expect(screen.getByText("DJ. TestDJ")).toBeInTheDocument();
    expect(screen.getByText("Direct review")).toBeInTheDocument();
  });

  it("renders event context when eventId is provided", () => {
    render(
      <DjRatingForm
        {...defaultProps}
        eventId={42}
        eventTitle="Summer Beats"
        eventSlug="summer-beats"
      />,
    );

    expect(screen.getByText("Summer Beats")).toBeInTheDocument();
    expect(screen.queryByText("Direct review")).not.toBeInTheDocument();
  });

  it("renders 5 star buttons", () => {
    render(<DjRatingForm {...defaultProps} />);

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByLabelText(`Rate ${i} stars`)).toBeInTheDocument();
    }
  });

  it("shows 'Select a rating' initially", () => {
    render(<DjRatingForm {...defaultProps} />);

    expect(screen.getByText("Select a rating")).toBeInTheDocument();
  });

  it("updates rating display when a star is clicked", async () => {
    const user = userEvent.setup();
    render(<DjRatingForm {...defaultProps} />);

    await user.click(screen.getByLabelText("Rate 4 stars"));

    expect(screen.getByText("4 / 5")).toBeInTheDocument();
  });

  it("disables submit button when no rating is selected", () => {
    render(<DjRatingForm {...defaultProps} />);

    const submitButton = screen.getByText("Submit Review");
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when rating is selected", async () => {
    const user = userEvent.setup();
    render(<DjRatingForm {...defaultProps} />);

    await user.click(screen.getByLabelText("Rate 5 stars"));

    expect(screen.getByText("Submit Review")).not.toBeDisabled();
  });

  it("shows character count feedback", () => {
    render(<DjRatingForm {...defaultProps} />);

    // Initially shows how many more chars needed
    expect(screen.getByText(/more characters needed/)).toBeInTheDocument();
  });

  it("shows organizer placeholder for event reviews when isOrganizer", () => {
    render(
      <DjRatingForm
        {...defaultProps}
        eventId={42}
        eventTitle="Summer Beats"
        isOrganizer={true}
      />,
    );

    const textarea = screen.getByPlaceholderText(/professionalism/i);
    expect(textarea).toBeInTheDocument();
  });

  it("shows attendee placeholder for event reviews when not organizer", () => {
    render(
      <DjRatingForm
        {...defaultProps}
        eventId={42}
        eventTitle="Summer Beats"
        isOrganizer={false}
      />,
    );

    const textarea = screen.getByPlaceholderText(/performance/i);
    expect(textarea).toBeInTheDocument();
  });

  it("shows direct review placeholder when no eventId", () => {
    render(<DjRatingForm {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/Share your experience/i);
    expect(textarea).toBeInTheDocument();
  });

  it("calls createDjRating with correct params on submit", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    (createDjRating as any).mockResolvedValue({
      success: true,
      data: { id: 1, created: true },
    });

    render(<DjRatingForm {...defaultProps} onSuccess={onSuccess} />);

    // Select rating
    await user.click(screen.getByLabelText("Rate 5 stars"));

    // Type review
    const textarea = screen.getByPlaceholderText(/Share your experience/i);
    await user.type(textarea, "This is a great DJ with amazing skills!");

    // Submit
    await user.click(screen.getByText("Submit Review"));

    await waitFor(() => {
      expect(createDjRating).toHaveBeenCalledWith({
        djProfileId: 1,
        rating: 5,
        review: "This is a great DJ with amazing skills!",
        eventId: null,
      });
    });
  });

  it("calls createDjRating with eventId for event reviews", async () => {
    const user = userEvent.setup();

    (createDjRating as any).mockResolvedValue({
      success: true,
      data: { id: 1, created: true },
    });

    render(
      <DjRatingForm
        {...defaultProps}
        eventId={42}
        eventTitle="Summer Beats"
        eventSlug="summer-beats"
      />,
    );

    await user.click(screen.getByLabelText("Rate 4 stars"));

    const textarea = screen.getByPlaceholderText(/performance/i);
    await user.type(textarea, "Great performance at the event tonight!");

    await user.click(screen.getByText("Submit Review"));

    await waitFor(() => {
      expect(createDjRating).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 42,
          rating: 4,
        }),
      );
    });
  });

  it("calls onSuccess after successful submission", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    (createDjRating as any).mockResolvedValue({
      success: true,
      data: { id: 1, created: true },
    });

    render(<DjRatingForm {...defaultProps} onSuccess={onSuccess} />);

    await user.click(screen.getByLabelText("Rate 5 stars"));

    const textarea = screen.getByPlaceholderText(/Share your experience/i);
    await user.type(textarea, "This is a great DJ with amazing skills!");

    await user.click(screen.getByText("Submit Review"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(true);
    });
  });

  it("shows error when createDjRating returns failure", async () => {
    const user = userEvent.setup();

    (createDjRating as any).mockResolvedValue({
      success: false,
      error: "You must have attended this event to review",
    });

    render(
      <DjRatingForm {...defaultProps} eventId={42} eventTitle="Summer Beats" />,
    );

    await user.click(screen.getByLabelText("Rate 5 stars"));

    const textarea = screen.getByPlaceholderText(/performance/i);
    await user.type(textarea, "Great performance at the event tonight!");

    await user.click(screen.getByText("Submit Review"));

    await waitFor(() => {
      expect(
        screen.getByText("You must have attended this event to review"),
      ).toBeInTheDocument();
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<DjRatingForm {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByText("Cancel"));

    expect(onCancel).toHaveBeenCalled();
  });
});
