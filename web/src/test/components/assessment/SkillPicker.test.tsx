import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import SkillPicker from "@/components/assessment/SkillPicker";
import api from "@/services/api";

describe("SkillPicker Component Characterization", () => {
    it("characterizes GAP P1-2: onSelect drops skill_id and passes undefined", async () => {
        const onSelect = vi.fn();
        const onOpenChange = vi.fn();

        vi.spyOn(api, "get").mockResolvedValue({
            data: {
                skill_taxonomies: [
                    {
                        id: 42,
                        skill_id: "sk-tax-042",
                        skill_label: "Ruby Architecture",
                        category: "Backend",
                        scope_include: "Rails, SQL",
                        l1_anchor: "Junior",
                        l2_anchor: "Mid",
                        l3_anchor: "Senior",
                        l4_anchor: "Lead",
                        l5_anchor: "Principal",
                    },
                ],
            },
        } as any);

        render(<SkillPicker open={true} onOpenChange={onOpenChange} onSelect={onSelect} />);

        await waitFor(() => {
            expect(screen.getByText("Ruby Architecture")).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText("Ruby Architecture"));

        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                skill_label: "Ruby Architecture",
                skill_id: undefined, // GAP P1-2: Dropped skill_id
                expected_level: 3,
            })
        );
    });
});
