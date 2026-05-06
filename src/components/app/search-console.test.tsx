import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { buildEntitlement } from "@/lib/entitlements";
import { SearchConsole } from "@/components/app/search-console";

describe("SearchConsole", () => {
  afterEach(cleanup);

  it("renders quota and mission form for a free user", () => {
    render(<SearchConsole initialEntitlement={buildEntitlement("free", "free", 2)} />);

    expect(screen.queryByText("FREE")).not.toBeNull();
    expect(screen.queryByText("LIS → JFK")).not.toBeNull();
    expect(screen.queryByText("Pesquisar")).not.toBeNull();
  });
});
