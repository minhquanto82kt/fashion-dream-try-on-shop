<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AI / Development Rules

The detailed project development rules are maintained in:

[`docs/DEVELOPMENT_RULES.md`](./docs/DEVELOPMENT_RULES.md)

Before changing code, follow that document. In particular:

- Use GitHub as the source of truth for source code.
- Use Supabase as the source of truth for application data.
- Analyze data features as Create → Read → Update → Delete.
- Check Table → Column → Primary Key → Foreign Key → RLS → Query → Response.
- Make the smallest safe change and preserve existing working routes.
- Do not create duplicate components or competing data structures.
- Keep secrets server-side.
- Do not disable RLS to make a feature work.
- Treat Orders and Payments as transaction history; do not add hard-delete casually.
- Scope route-specific CSS and protect unrelated pages.
- Preserve the current palette and typography unless explicitly requested otherwise.
- For homepage changes, preserve existing section backgrounds and Hero → Manifesto → AI Studio → Collection → Experience continuity.
- Test the affected feature before deployment and distinguish a successful build from actual production verification.
