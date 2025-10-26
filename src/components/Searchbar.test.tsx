import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './Searchbar';
import '@testing-library/jest-dom/vitest';

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));
import { invoke } from '@tauri-apps/api/core';

beforeEach(() => {
    vi.useFakeTimers();
})
describe("SearchBar", () => {
    
    afterEach(() => {
        cleanup();
        vi.clearAllTimers();
    });

    it("renders with correct placeholder", () => {
        render(<SearchBar placeholder="Test search..." />);
        const input = screen.getByPlaceholderText("Test search...");
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("type", "text");
    });
    it("calls onResultSelect when a result is clicked", async () => {
        vi.useRealTimers();
        const user = userEvent.setup();
        const mockResults = [
            { type: "course", id: "1", title: "Course 1" },
            { type: "lesson", id: "2", title: "Lesson 1" },
        ];

    vi.mocked(invoke).mockResolvedValue(mockResults);

    localStorage.setItem("access_token", "test_token");

    const onResultSelect = vi.fn();
    render(<SearchBar onResultSelect={onResultSelect}/>);
        const input = screen.getByRole("textbox");

        await user.type(input, "Course 1");

        const firstResult = await screen.findByText("Course 1");
        await user.click(firstResult);

        expect(onResultSelect).toHaveBeenCalledWith(mockResults[0]);

        vi.useFakeTimers();
    });

    

})
