# Intent

This document captures the intent of the Reindeer Chart visualization and the evidence that each intent has been delivered in the working artifact.

## 1. Visualize sales activities over time

**Intent**: Render a timeline of sales touchpoints (meetings, calls, demos, etc.) so that a viewer can see the cadence and volume of work across a portfolio of opportunities.

**Evidence**: Activity nodes appear on vertical beams in the activity field, positioned by timestamp. Different activity types render as distinct shapes (circle, diamond, square, triangle, star). Running the test harness with any dataset shows activities plotted chronologically from top to bottom.

## 2. Show which opportunities sellers are working on

**Intent**: Make it possible to answer "what is this person working on?" by highlighting the opportunities a specific seller is involved with.

**Evidence**: The `focusedPeople` prop accepts a set of names. In AND focus mode, only beams where all selected people appear are highlighted at full opacity — everything else dims. This directly answers "which opportunities are Alice and Bob working on together?"

## 3. Show how much effort has gone into each opportunity

**Intent**: Give a visual sense of how much sales activity has been invested in each deal, so that under-worked or over-worked opportunities stand out.

**Evidence**: Each beam's Crown pill displays the activity count for that opportunity. Beams with many activities have more nodes plotted along them, making high-effort opportunities visually denser.

## 4. Show the stage progression of deals

**Intent**: Reveal how opportunities have moved through pipeline stages over time, using the activity history as a record of stage transitions.

**Evidence**: Activity nodes are coloured by the opportunity's stage at the time of the activity. A beam where nodes transition from indigo (Prospect) to blue (Qualified) to purple (Technical Validation) tells the story of a deal progressing through the pipeline.

## 5. Show relative revenue of opportunities

**Intent**: Make it immediately apparent which opportunities are the largest.

**Evidence**: Opportunity bars in the face are sized proportionally to revenue, normalized to the largest opportunity. Beams are displaced using an alternating ordinal algorithm sorted by max revenue — the highest-revenue opportunities sit closest to the center, creating a visual hierarchy where the biggest deals are most prominent.

## 6. Show who is working together

**Intent**: Reveal collaboration patterns — which sellers are co-working on deals, and which customers are being engaged by multiple team members.

**Evidence**: The `focusedPeople` prop in OR mode highlights all beams where any selected person appears. Selecting two sellers and seeing overlapping highlighted beams reveals shared opportunities. Crown pills expand on hover to show all participants with country flags, making it easy to see the full cast of a deal.
