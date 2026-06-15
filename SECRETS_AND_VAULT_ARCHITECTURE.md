# Secrets and Vault Architecture

**Repo:** `west-peek-pitch-lab`  
**Policy:** `vault_required`

Real values remain outside source control. The repo stores names, examples, validation, materialize/cleanup hooks, ownership, and severity. Temporary plaintext is restrictive, short-lived, redacted, and removed on failure.
