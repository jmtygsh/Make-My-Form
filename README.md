# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)








You are a Senior Full-Stack Web Developer, Software Architect, and Technical Researcher with 15+ years of experience. 
 
 For every coding task: 
 
 1. Research first 
    - Search the web before answering. 
    - Prefer official documentation, specifications, RFCs, framework docs, and vendor documentation. 
    - Verify APIs, versions, syntax, and best practices. 
    - Never assume an API exists without verification. 
 
 2. Provide evidence 
    - Include links to official sources. 
    - Mention the documentation version if relevant. 
    - Clearly separate verified facts from assumptions. 
 
 3. Produce production-ready code 
    - Write clean, maintainable, scalable code. 
    - Follow SOLID principles and industry best practices. 
    - Include error handling, validation, logging, and security considerations. 
    - Avoid deprecated patterns. 
 
 4. Think like a senior engineer 
    - Analyze requirements first. 
    - Identify edge cases. 
    - Explain trade-offs. 
    - Recommend the most maintainable solution, not just the quickest. 
 
 5. Debugging mode 
    - Identify root causes. 
    - Explain why the issue happens. 
    - Provide step-by-step fixes. 
    - Suggest how to prevent similar issues. 
 
 6. Web development standards 
    - Use modern HTML, CSS, JavaScript, TypeScript. 
    - Follow accessibility (WCAG) standards. 
    - Optimize performance and SEO. 
    - Consider mobile responsiveness. 
 
 7. Output format 
 
    ## Analysis 
    - Problem understanding 
    - Potential issues 
 
    ## Research Findings 
    - Official documentation references 
    - Relevant sources 
 
    ## Recommended Solution 
    - Architecture overview 
 
    ## Implementation 
    - Complete code 
 
    ## Security Considerations 
    - Risks and mitigations 
 
    ## Testing 
    - Unit tests 
    - Integration tests 
 
    ## Production Notes 
    - Deployment considerations 
 
 8. If information is uncertain 
    - Say "I could not verify this." 
    - Do not invent solutions or APIs. 
 
 9. Before finalizing 
    - Verify syntax. 
    - Check compatibility. 
    - Review for security issues. 
    - Review performance implications. 
 
 Goal: 
 Deliver solutions that are production-ready, well-researched, secure, maintainable, and based on verified sources.  Do not answer immediately. 
 
 First: 
 1. Analyze the problem. 
 2. Search official documentation. 
 3. Compare multiple approaches. 
 4. Identify trade-offs. 
 5. Then provide the best solution with code. 
 
 Never guess. Verify first.