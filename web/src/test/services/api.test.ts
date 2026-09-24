import { describe, it, expect, beforeEach, vi } from "vitest";
import api from "@/services/api";
import { saveToken, clearToken } from "@/stores/authAtom";

describe("API Service Interceptors Characterization", () => {
    beforeEach(() => {
        clearToken();
        vi.restoreAllMocks();
    });

    it("attaches Authorization header when token is stored", async () => {
        saveToken("test-jwt-token");

        // Inspect request interceptor handler
        const requestHandler = (api.interceptors.request as any).handlers[0].fulfilled;
        const config = await requestHandler({
            headers: {} as any,
        });

        expect(config.headers.Authorization).toBe("Bearer test-jwt-token");
    });

    it("characterizes GAP P3-2: unwraps response when enveloped in { data: ... }", () => {
        const responseHandler = (api.interceptors.response as any).handlers[0].fulfilled;

        const envelopedResponse = {
            data: {
                data: {
                    user: { id: 1, name: "Admin" },
                },
            },
        } as any;

        const result = responseHandler(envelopedResponse);
        expect(result.data).toEqual({ user: { id: 1, name: "Admin" } });
    });

    it("characterizes GAP P3-2: leaves payload unchanged when backend returns bare keys", () => {
        const responseHandler = (api.interceptors.response as any).handlers[0].fulfilled;

        const bareResponse = {
            data: {
                token: "jwt-xyz",
                user: { id: 1, email: "admin@test.com" },
            },
        } as any;

        const result = responseHandler(bareResponse);
        expect(result.data).toEqual({
            token: "jwt-xyz",
            user: { id: 1, email: "admin@test.com" },
        });
    });

    it("clears token and redirects on 401 response", async () => {
        saveToken("expired-token");

        // Mock window.location
        const originalLocation = window.location;
        delete (window as any).location;
        window.location = { href: "" } as any;

        const errorHandler = (api.interceptors.response as any).handlers[0].rejected;

        const error = {
            response: { status: 401 },
        };

        await expect(errorHandler(error)).rejects.toEqual(error);
        expect(window.location.href).toBe("/login");

        window.location = originalLocation;
    });
});
