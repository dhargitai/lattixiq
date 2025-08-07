import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StarRating } from "@/components/ui/star-rating";
import { useState } from "react";

const meta = {
  title: "Custom/StarRating",
  component: StarRating,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "number", min: 0, max: 5 },
    },
    max: {
      control: { type: "number", min: 1, max: 10 },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    readOnly: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof StarRating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 3,
  },
};

const InteractiveWrapper = () => {
  const [rating, setRating] = useState(0);

  return (
    <div className="space-y-2">
      <StarRating value={rating} onChange={setRating} />
      <p className="text-sm text-muted-foreground">
        You rated: {rating} star{rating !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveWrapper />,
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm w-16">Small:</span>
        <StarRating value={4} size="sm" readOnly />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm w-16">Medium:</span>
        <StarRating value={4} size="md" readOnly />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm w-16">Large:</span>
        <StarRating value={4} size="lg" readOnly />
      </div>
    </div>
  ),
};

export const ReadOnly: Story = {
  args: {
    value: 4,
    readOnly: true,
  },
};

export const CustomMax: Story = {
  args: {
    value: 7,
    max: 10,
  },
};

export const EmptyState: Story = {
  args: {
    value: 0,
  },
};

const InFormWrapper = () => {
  const [rating, setRating] = useState(0);

  return (
    <div className="space-y-4 w-full max-w-sm">
      <div>
        <label className="text-sm font-medium">How effective was this model for you?</label>
        <div className="mt-2">
          <StarRating value={rating} onChange={setRating} />
        </div>
      </div>
      {rating > 0 && (
        <p className="text-sm text-muted-foreground animate-fade-in-up">
          Thank you for your feedback!
        </p>
      )}
    </div>
  );
};

export const InForm: Story = {
  render: () => <InFormWrapper />,
};
