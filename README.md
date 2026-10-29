# FPL Community site

`index.html` is the member-facing app. `fpl-config.js` contains only the public Supabase project URL and anon key. The service worker caches the app shell for offline viewing; member suggestions, banter, swap requests, and votes queue on the device and sync when the backend is reachable again. Administrative site edits are saved locally while offline and require a connection to publish to all members.

## Secure admin and shared data setup

The crown stays visually ordinary. Clicking it opens a generic access-code prompt. The code is checked by the `fpl-site` Edge Function, never by browser JavaScript. The function issues a time-limited session and rate-limits attempts. Shared site data is readable by members, while writes require a valid Admin or Super Admin session. Admin changes are restricted by the function; Super Admin can change all saved site fields. Member suggestions, banter, swap requests, and votes use separate server actions, and open pages poll for updates.

1. Apply `supabase/migrations/202610290001_secure_site_state.sql` in the Supabase SQL Editor. This migration is already applied to the connected project.
2. In **Supabase → Edge Functions → Secrets**, add `FPL_ADMIN_CODE` (8–64 characters) and `FPL_SESSION_SECRET` (at least 32 random characters). The old code `15469007` appeared in an earlier public repository commit, so it is exposed; choose a different private code if you need to keep admin access restricted to yourself. Never paste secrets into chat or the public repository.
3. Deploy `supabase/functions/fpl-site` from the Supabase dashboard’s browser editor or with the Supabase CLI. The function is already deployed to the connected project. In its Settings, turn **Verify JWT with legacy secret** off: the function checks its own rate-limited code challenge and signed, short-lived admin session. Keep the Supabase service-role key only in Supabase’s server-side environment.
4. Put the project URL and public anon key in `fpl-config.js`. The anon key is designed to be public; never put the service-role key there.
5. In GitHub, set **Settings → Pages → Build and deployment → Source → GitHub Actions**. The workflow publishes the site files when changes reach `main`.

The standard Pages address follows `https://<your-github-username>.github.io/fpl-site/` after Pages is enabled and a deployment succeeds. To use a different, memorable address, configure a custom domain that you own in the repository’s Pages settings and point its DNS records to GitHub Pages. Changing only the displayed site title does not change the actual link.

Do not publish the site until the Supabase project is configured and the admin function is deployed. The local preview can still be viewed without Supabase, but crown access and cross-device saves will remain unavailable until configuration is complete. `archive/` contains the prior local source and is excluded from the Pages upload.
