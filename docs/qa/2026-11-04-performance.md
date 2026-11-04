# Forest periodic refresh and rendering optimization

Base: `main` at `7e3ca4db4750f19e3717fa6567b86629173db5f7`.
Scope: The-Forest-of-a-Writer, not The-Mountain-of-a-Writer.

## Seven changes

1. The main 30-second production poll waits for completion before scheduling another batch. Parallel reads settle before the guard is released, including failure paths; shop and notification promises are awaited.
2. That production poll pauses while the document is hidden and resumes once when visible.
3. Coffee-truck polling has one disposable timer: repeated loadAll calls replace it. It also pauses while hidden and does not overlap its own prior poll.
4. Village rendering skips replacing unchanged house markup; folding still runs.
5. Inventory rendering skips replacing unchanged item markup.
6. Shop rendering skips replacing unchanged product markup. Affordability, ownership, search and other rendered changes still invalidate it.
7. Garden request timeout timers clear on success, rejection and timeout rather than remaining pending after an early response.

The DOM cache observes external DOM mutations so modified content is rebuilt on the next render. Village folding changes only derived visibility classes; these own mutations are consumed after folding.

## Verification performed

`node --test tests/performance-regression.cjs`: 9 passing tests.
`git diff --check`: passed.

Tests compile every inline script and execute actual extracted production helpers/renderers in an offline Node VM with a minimal DOM/MutationObserver and timer harness. They cover overlapping requests, visibility changes, failed-request retry, disposal during a request, external DOM invalidation, inventory/selection/sale quantity/coin/search updates, presence updates, and timeout cleanup.

With unchanged fixture data, 101 calls to each village/inventory/shop renderer perform one list innerHTML assignment per target rather than 101. This measures replacement calls in a test harness, not FPS or real-user latency. String generation and unrelated render work still occur.

## Limits and deployment gate

No production account, database, data schema, economy rules, hosting configuration or main branch was changed. This branch is not a production deployment.

Chromium could not launch because the runtime browser executable is absent. Browser visual QA, live request timing, slow-network rendering, concurrent-player load and before/after FPS were not measured. These changes reduce identifiable redundant work; they do not establish the root cause of the reported stutter or establish that the free server plan is responsible.

Other polling loops and first-load image/script payloads remain. A hung network promise can keep a batch pending; this patch does not abort database requests. The pre-existing liveGarden timeout/30-second escape behavior is unchanged apart from timer cleanup.

Before merging: verify the deployed build's repository/version, inspect idle frame timing and network activity with three players, then test hidden/visible transitions, village presence, inventory selection/multi-sell, shop affordability/filtering, and coffee-truck updates on a non-production preview. Check delayed/failing requests for recovery. Only report live improvement after measuring the deployed version.
