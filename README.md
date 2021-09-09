# Proxying Cloudflare Pages API requests

Cloudflare's API can not be accessed in the browser because of missing CORS headers. This Proxy-Worker Script solves the issue and passthroughs all requests that are necessary for using the [sanity-plugin-cloudflare-pages-deploy](https://github.com/estallio/sanity-plugin-cloudflare-pages-deploy) plugin.

The code in this repo was heavily inspired by the example in the Cloudflare docs [here](https://developers.cloudflare.com/workers/examples/cors-header-proxy).

## Deployment

You have 3 possibilities to deploy this script to Cloudflare Workers:

1. Copy the code from `index.js` and past it into the Cloudflare Workers Web Editor.
2. Install Cloudflare's CLI tool wrangler globally, login and deploy your script like [here](https://developers.cloudflare.com/workers/get-started/guide).
3. Inject this project into a CI/CD pipeline, inject the wrangler ENV variables `CF_ACCOUNT_ID`, `CF_ZONE_ID` and `CF_API_TOKEN` respectively and run the `yarn publish` command.

It is also possible to configure the associated domain via wrangler or the `wrangler.toml` file like it's documented [here](https://developers.cloudflare.com/workers/get-started/guide#optional-configure-for-deploying-to-a-registered-domain).

## License

[MIT](https://github.com/estallio/cloudflare-pages-deployments-api-proxy/blob/main/LICENSE)

## Contact
:octocat: [@estallio](https://github.com/estallio)\
:email: [leonhard.esterbauer@gmal.com](mailto:leonhard.esterbauer@gmail.com)
