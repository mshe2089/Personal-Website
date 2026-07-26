import PageTemplate from '../Components/Common/PageTemplate';

function Diatribe() {
  return (
    <PageTemplate title="A Completely Unnecessary Diatribe" date="Jul 2026">
      <article className="article-prose">
        <p>
          There is a particular kind of software project that begins with a folder called
          <code> new</code>, acquires a sibling called <code>new-new</code>, and eventually
          reaches maturity as <code>new-final-actually-final</code>. Nobody plans this. It
          simply happens, in the same way that a kitchen drawer gradually becomes the home
          of batteries, foreign coins, three kinds of tape, and a key belonging to a lock
          nobody remembers owning.
        </p>

        <p>
          We like to pretend that computers are orderly because they are good at counting.
          This is unfair to both computers and counting. A computer will preserve every bad
          decision with perfect fidelity. It will execute an ill-conceived abstraction a
          billion times per second and never once ask whether the abstraction should have
          existed. This is impressive, but it is not order. It is merely extremely
          disciplined chaos.
        </p>

        <h2 className="article-subtitle">The ceremony of getting started</h2>

        <p>
          Starting a project used to mean creating a file. Now it means selecting a runtime,
          package manager, rendering strategy, deployment target, state container, formatting
          policy, and sufficiently tasteful shade of off-black. By the time the first useful
          sentence appears on screen, the repository has twelve configuration files and a
          continuous integration pipeline capable of rejecting it.
        </p>

        <p>
          Every tool involved is defensible. That is the problem. Each addition arrives with
          a sensible explanation, a tidy README, and a promise to remove an entire category
          of difficulty. The categories are duly removed and replaced with new categories
          whose names contain words like hydration, reconciliation, orchestration, and
          provenance. Progress is announced in the passive voice.
        </p>

        <p>
          Eventually somebody asks why the page takes four seconds to show six paragraphs.
          This person is treated as hostile to innovation. A meeting is scheduled to discuss
          perceived performance, because actual performance would require opening the network
          panel and looking at it.
        </p>

        <h2 className="article-subtitle">On tasteful minimalism</h2>

        <p>
          Minimalism is commonly described as removing things. In practice it is the much
          harder act of deciding which things deserve to remain. An empty page is not
          automatically minimal. Sometimes it is merely empty. A page with one enormous
          sentence, four animations, and a cursor shaped like a comet is not minimal either,
          even if the designer has hidden the scrollbar.
        </p>

        <p>
          The useful kind of minimalism is almost boring. Text looks like text. Links look
          available. A button appears where the consequence of pressing it can be guessed.
          Borders separate things that need separating and then have the good manners to stop.
          Nothing begs to be noticed unless noticing it matters.
        </p>

        <blockquote className="article-quote">
          A quiet interface is not one with nothing to say. It is one that waits until the
          reader is listening.
        </blockquote>

        <p>
          This sounds obvious until a blank corner appears. Blank corners make people
          nervous. Soon the corner contains a status badge, the badge receives a tooltip,
          and the tooltip links to a dashboard explaining why the status badge is green.
          The corner is no longer blank, and nobody is happier.
        </p>

        <h2 className="article-subtitle">The folder knows too much</h2>

        <p>
          File trees are honest in a way that menus are not. A menu says, “Here are the
          destinations we have selected for your convenience.” A file tree says, “Here is
          everything, including the awkward utility page we forgot to remove.” It exposes
          hierarchy, naming, and indecision at once. This makes it a strangely suitable map
          for a personal site.
        </p>

        <p>
          A personal site ought to tolerate unfinished thoughts. It should have room for
          useful tools beside unhelpful essays, for serious notes beside experiments that
          seemed funny at two in the morning. Excessive polish can make such a place feel
          less personal, like a desk cleared specifically for a photograph. The interesting
          desk has scratches, cables, and a notebook open to the middle.
        </p>

        <p>
          Of course, “authentic mess” can become its own performance. There is no virtue in
          making information difficult to find. The trick is to preserve the evidence of a
          mind at work without requiring visitors to become archaeologists. A directory is
          useful here: explicit enough to navigate, ordinary enough not to dominate, and
          expandable when the collection outgrows the first screen.
        </p>

        <h2 className="article-subtitle">A conclusion, reluctantly</h2>

        <p>
          The web does not need another design system, manifesto, or JavaScript library that
          describes itself as blazingly fast. It probably does need more small sites maintained
          by people who care what goes on them. Not brands performing personhood, not funnels
          wearing nice typography, but actual collections: notes, arguments, half-finished
          tools, peculiar interests, and evidence that somebody was there.
        </p>

        <p>
          So the project continues. A border becomes thinner. A heading moves six pixels.
          The navigation opens from the left because opening from the right felt vaguely
          incorrect. None of this will alter the course of history, which is precisely why
          it can be done with care.
        </p>
      </article>
    </PageTemplate>
  );
}

export default Diatribe;
