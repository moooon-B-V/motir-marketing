{{slot:catalogue-summary}}

This list is fetched from Motir when the page is requested, so it is whatever the server ships right now. Each tool shows the arguments it takes — their names, their types and which are required — read from the same registry that answers a `tools/list` handshake against the endpoint shown above, which is still the authoritative surface and carries each tool's full description. Which of these a given token may call depends on the grant it carries, so the list your client shows is already scoped to you.

{{slot:hint-legend}}

Argument tables render one level: a nested object or a list shows its type, and the handshake carries the shape inside it.

{{slot:catalogue}}

[MCP server](/docs/mcp) covers wiring an agent to the endpoint and the token it needs.
