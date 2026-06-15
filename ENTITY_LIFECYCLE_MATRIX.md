# Entity Lifecycle Matrix

| Entity | Create | View | Edit/Update | Approve/Reject | Archive/Delete/Revoke | Restore | Readback | Refresh/Re-entry | Permission Owner |
|---|---|---|---|---|---|---|---|---|---|
| founder profile | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| practice session | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| pitch answers | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| story card | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| AI feedback | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| media capture | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| transcript | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| deck metadata | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| consent | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| share choice | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| email request | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| signed packet | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| replay guard | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| Network OS receipt | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| provider fixture | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |
| wisdom candidate | REQUIRED | REQUIRED | REQUIRED | product-specific | archive/revoke/soft-delete unless law permits hard delete | where supported | REQUIRED | REQUIRED | role/consent matrix |

No durable entity may be trapped. Mutation success requires fresh readback and refresh/re-entry. Cleanup targets exact fixture IDs only.
