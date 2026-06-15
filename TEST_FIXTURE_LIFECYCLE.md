# Test Fixture Lifecycle

Every durable fixture carries `proof_run_id`, `proof_test_id`, `proof_fixture: true`, `proof_created_at`, `proof_cleanup_policy`, and `proof_expires_at`. Cleanup runs in finally semantics, targets exact IDs, verifies app/provider state, and fails proof when incomplete.
