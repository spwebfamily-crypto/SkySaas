import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { buildEntitlement } from "@/lib/entitlements";
import { SearchConsole } from "@/components/app/search-console";

describe("SearchConsole", () => {
  afterEach(cleanup);

  it("renders the operational search form for a free user", () => {
    render(<SearchConsole initialEntitlement={buildEntitlement("free", "free", 2)} />);

    expect(screen.queryByText("Busca")).not.toBeNull();
    expect(screen.queryByText("LIS - JFK")).not.toBeNull();
    expect(screen.queryByText("Pesquisar")).not.toBeNull();
  });
});
