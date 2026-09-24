import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ComparisonTable from "@/components/fitgap/ComparisonTable";
import type { SkillComparison } from "@/types";

describe("ComparisonTable Component Characterization", () => {
    it("renders rows with skill label and correct result badges", () => {
        const comparisons: SkillComparison[] = [
            {
                skill_label: "TypeScript",
                required_level: 3,
                candidate_level: 3,
                result: "match",
                delta: 0,
            },
            {
                skill_label: "PostgreSQL",
                required_level: 4,
                candidate_level: 2,
                result: "gap",
                delta: -2,
            },
        ];

        render(<ComparisonTable comparisons={comparisons} />);

        expect(screen.getByText("TypeScript")).toBeInTheDocument();
        expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
        expect(screen.getAllByText(/Match/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/Gap -2/i)).toBeInTheDocument();
    });

    it("displays pencil indicator for overridden skills", () => {
        const comparisons: SkillComparison[] = [
            {
                skill_label: "React",
                required_level: 3,
                candidate_level: 4,
                result: "exceed",
                delta: 1,
                is_override: true,
            },
        ];

        render(<ComparisonTable comparisons={comparisons} />);
        expect(screen.getByText("✏")).toBeInTheDocument();
    });

    it("characterizes GAP P1-1: renders blank Required column when API provides expected_level instead of required_level", () => {
        // Current API engine emits expected_level, not required_level
        const apiFormattedComparisons = [
            {
                skill_label: "Docker",
                expected_level: 3,
                candidate_level: 3,
                result: "match",
                delta: 0,
            } as unknown as SkillComparison,
        ];

        const { container } = render(<ComparisonTable comparisons={apiFormattedComparisons} />);

        // The Required column cell (index 1 in table row) is empty because c.required_level is undefined
        const row = container.querySelector("tbody tr");
        const requiredCell = row?.querySelectorAll("td")[1];
        expect(requiredCell?.textContent?.trim()).toBe("");
    });
});
