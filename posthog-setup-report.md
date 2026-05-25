<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of your project. PostHog analytics has been added to the React + Vite campaign creation application using the `posthog-js` browser SDK. The SDK is initialized in `src/main.tsx` with exception autocapture enabled. Event tracking has been added to three key user actions in `src/App.tsx`: launching a campaign, saving a draft, and cancelling the form. Each event carries contextual properties (objective, agent, channels, audience source, etc.) to enable rich segmentation.

| Event | Description | File |
|---|---|---|
| `campaign_launched` | User submits the form to launch an outbound campaign. Captures objective, agent, audience source, segment, channels, dates, sends per lead/day, max retries, and auto-close days. | `src/App.tsx` |
| `campaign_draft_saved` | User saves a campaign as a draft without launching it. Captures campaign name, objective, agent, audience source, and channels. | `src/App.tsx` |
| `campaign_cancelled` | User cancels campaign creation and resets the form. Captures campaign name and objective at the time of cancellation. | `src/App.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1624140)
- [Campaign launches over time](/insights/3iydzlxF)
- [Campaigns launched vs cancelled](/insights/rBT93uv0)
- [Campaign launches by objective](/insights/QBtX1NiY)
- [Campaign launches by audience source](/insights/ibi5DdV6)
- [Campaign creation funnel](/insights/3lPrS8wE)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
