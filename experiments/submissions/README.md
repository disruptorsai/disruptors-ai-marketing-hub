# Experiment Submissions Folder

## Purpose

This folder is where you submit new AI marketing experiment concepts. Simply drop a markdown file here and the AI Marketing Experiments Orchestrator agent will automatically detect and process it.

## How to Submit an Experiment

### Step 1: Use the Template

```bash
# Copy the template
cp ../templates/concept-template.md ./your-experiment-name.md
```

### Step 2: Fill Out the Template

Open `your-experiment-name.md` and complete all sections:
- Experiment name and description
- Problem statement
- Proposed solution
- Target audience
- Success metrics
- Timeline expectations
- Any technical requirements you know of

### Step 3: Submit

Simply save the file to this folder. The agent will:
1. Detect the new file (within 5 minutes)
2. Validate the format
3. Analyze the concept
4. Generate an implementation plan
5. Notify you when ready for review

### File Naming Convention

Use descriptive, lowercase names with hyphens:
- ✅ `ai-powered-headline-optimizer.md`
- ✅ `personalized-email-sequences.md`
- ✅ `dynamic-pricing-experiment.md`
- ❌ `experiment1.md` (not descriptive)
- ❌ `My Cool Idea.md` (spaces and capitals)

## What Happens Next?

### Automatic Processing (Agent)
1. **Detection**: Agent finds your submission
2. **Validation**: Checks format and required fields
3. **Analysis**: Evaluates feasibility and creates plan
4. **Notification**: You'll see it in the admin panel

### Your Review (Human)
1. Access admin panel → Marketing Experiments
2. Review the agent's analysis and plan
3. Approve, request changes, or reject
4. If approved, agent proceeds to development

## Submission Guidelines

### Required Sections
All submissions must include:
- **Problem**: What problem are we solving?
- **Solution**: What's your idea to solve it?
- **Audience**: Who is this for?
- **Metrics**: How will we measure success?

### Optional but Helpful
- Technical requirements (if you know them)
- Inspiration or references
- Budget constraints
- Timeline requirements

### Tips for Success
1. **Be Specific**: Clear problem statements get better solutions
2. **Define Success**: What does "working" look like?
3. **Consider Users**: How will this benefit them?
4. **Think Big**: Don't limit yourself technically - let the agent figure that out
5. **Provide Context**: Any background info helps

## Example Submissions

### Good Example ✅
```markdown
# AI-Powered Headline Optimizer

## Problem
Our blog post headlines get low click-through rates (avg 2.1%). We need more engaging,
personalized headlines that drive clicks without clickbait.

## Proposed Solution
Use Claude Sonnet 4.5 to generate multiple headline variations based on:
- Article content and topic
- Target audience from Business Brain
- Current trending topics
- Historical performance data

Show A/B test different headlines and optimize over time.

## Target Audience
- Internal: Marketing team creating blog posts
- External impact: All blog readers

## Success Metrics
- Primary: CTR increase to 3.5% (+67%)
- Secondary: Time on page, social shares
- Guardrail: User satisfaction stays above 4/5

## Technical Requirements (if known)
- Integration with blog post editor
- Claude Sonnet 4.5 API
- A/B testing framework
- Analytics tracking

## Timeline
- Would like to test within 2-3 weeks
```

### Poor Example ❌
```markdown
# Make headlines better

Can we use AI to make our headlines better? I think Claude could do this.

Let's try it and see what happens.
```
**Issues**: Vague problem, no metrics, no audience definition, unclear solution

## Status Indicators

After submission, your experiment will show one of these statuses:

- 🆕 **Submitted**: File uploaded, awaiting agent detection
- ⚙️ **Analyzing**: Agent is evaluating the concept
- ❌ **Validation Failed**: Check for `[name]-ERRORS.md` file
- ✅ **Analysis Complete**: Ready for your review in admin panel
- ⏭️ **In Planning**: Agent creating technical specification
- 🏗️ **In Development**: Agent building the experiment
- 🧪 **In Testing**: Agent validating functionality
- 🚀 **Deploying**: Going live
- 📊 **Live**: Currently running and collecting data
- 📈 **In Analysis**: Final evaluation in progress
- 🏆 **Graduated**: Became a permanent feature
- ⏸️ **Paused**: Temporarily disabled
- 🌅 **Sunset**: Archived with learnings

## Common Issues

### "My submission wasn't detected"
- Check file extension is `.md`
- Verify file is in this submissions folder
- Wait 5 minutes (agent polling interval)
- Try manually triggering in admin panel

### "I got validation errors"
- Look for `[your-experiment-name]-ERRORS.md` in this folder
- Fix the issues listed
- Resave the file
- Agent will reprocess automatically

### "I want to update my submission"
- Edit the file directly
- Agent will detect changes
- Or delete and resubmit with a new name

### "I want to withdraw a submission"
- Delete the `.md` file
- Or mark it with `-WITHDRAWN` suffix
- Agent will ignore files with `-WITHDRAWN`

## Need Help?

1. Review the concept template: `../templates/concept-template.md`
2. Check the main README: `../README.md`
3. Review example experiments in `../archived/`
4. Access admin panel → Marketing Experiments → Help

---

**Ready to change the world with AI marketing? Drop your idea here!** 🚀
